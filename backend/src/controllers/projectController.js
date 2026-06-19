import prisma from '../services/db.js';
import { successResponse } from '../utils/response.js';
import { NotFoundError, ForbiddenError } from '../utils/errors.js';
import { createAuditLog } from '../services/auditLogService.js';

// Get all projects for logged in user (with Search, Filter, Sort, Pagination)
export const getAllProjects = async (req, res, next) => {
  try {
    const {
      search,
      status,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      page = 1,
      limit = 10,
    } = req.query;

    const pageNum = Math.max(1, parseInt(page) || 1);
    const limitNum = Math.max(1, parseInt(limit) || 10);
    const skip = (pageNum - 1) * limitNum;

    // Build Prisma query condition
    const where = {
      userId: req.user.id,
    };

    if (search) {
      where.name = {
        contains: search,
      };
    }

    if (status) {
      where.status = status;
    }

    // Allowed sortBy keys to prevent SQL Injection
    const allowedSortBy = ['createdAt', 'name', 'startDate', 'endDate', 'status'];
    const resolvedSortBy = allowedSortBy.includes(sortBy) ? sortBy : 'createdAt';
    const resolvedSortOrder = ['asc', 'desc'].includes(sortOrder.toLowerCase())
      ? sortOrder.toLowerCase()
      : 'desc';

    // Fetch count and records
    const [totalItems, projects] = await prisma.$transaction([
      prisma.project.count({ where }),
      prisma.project.findMany({
        where,
        skip,
        take: limitNum,
        orderBy: {
          [resolvedSortBy]: resolvedSortOrder,
        },
        include: {
          _count: {
            select: { tasks: true }
          },
          tasks: {
            select: {
              status: true
            }
          }
        }
      })
    ]);

    // Enhance project objects with progress details
    const enhancedProjects = projects.map((project) => {
      const totalTasks = project.tasks.length;
      const completedTasks = project.tasks.filter((t) => t.status === 'COMPLETED').length;
      const progressPercentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
      
      const { tasks, ...projectData } = project;
      return {
        ...projectData,
        totalTasks,
        completedTasks,
        progressPercentage,
      };
    });

    const totalPages = Math.ceil(totalItems / limitNum);

    return successResponse(res, 'Projects retrieved successfully.', enhancedProjects, 200, {
      pagination: {
        totalItems,
        totalPages,
        currentPage: pageNum,
        limit: limitNum,
      }
    });
  } catch (error) {
    next(error);
  }
};

// Get a single project by ID (restricted to project owner)
export const getProjectById = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      throw new NotFoundError('Invalid Project ID.');
    }

    const project = await prisma.project.findUnique({
      where: { id },
      include: {
        tasks: {
          orderBy: { createdAt: 'desc' }
        }
      }
    });

    if (!project) {
      throw new NotFoundError('Project not found.');
    }

    if (project.userId !== req.user.id) {
      throw new ForbiddenError('You do not have permission to view this project.');
    }

    // Compute progress
    const totalTasks = project.tasks.length;
    const completedTasks = project.tasks.filter((t) => t.status === 'COMPLETED').length;
    const progressPercentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    return successResponse(res, 'Project retrieved successfully.', {
      ...project,
      totalTasks,
      completedTasks,
      progressPercentage,
    });
  } catch (error) {
    next(error);
  }
};

// Create a new project
export const createProject = async (req, res, next) => {
  try {
    const { name, description, status, startDate, endDate } = req.body;

    const project = await prisma.project.create({
      data: {
        name,
        description,
        status: status || 'NOT_STARTED',
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null,
        userId: req.user.id,
      },
    });

    // Record action log
    await createAuditLog({
      action: 'CREATE',
      entityType: 'PROJECT',
      entityId: project.id,
      details: `Project "${project.name}" was created.`,
      userId: req.user.id,
      projectId: project.id,
    });

    return successResponse(res, 'Project created successfully.', project, 201);
  } catch (error) {
    next(error);
  }
};

// Update an existing project (restricted to project owner)
export const updateProject = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      throw new NotFoundError('Invalid Project ID.');
    }

    const project = await prisma.project.findUnique({
      where: { id },
    });

    if (!project) {
      throw new NotFoundError('Project not found.');
    }

    if (project.userId !== req.user.id) {
      throw new ForbiddenError('You do not have permission to edit this project.');
    }

    const { name, description, status, startDate, endDate } = req.body;

    const updatedProject = await prisma.project.update({
      where: { id },
      data: {
        name: name !== undefined ? name : project.name,
        description: description !== undefined ? description : project.description,
        status: status !== undefined ? status : project.status,
        startDate: startDate !== undefined ? (startDate ? new Date(startDate) : null) : project.startDate,
        endDate: endDate !== undefined ? (endDate ? new Date(endDate) : null) : project.endDate,
      },
    });

    // Determine details of changed attributes
    const changes = [];
    if (name && name !== project.name) changes.push(`Name to "${name}"`);
    if (status && status !== project.status) changes.push(`Status to "${status}"`);
    const details = changes.length > 0 ? `Updated project attributes: ${changes.join(', ')}` : `Project "${updatedProject.name}" was edited.`;

    await createAuditLog({
      action: 'UPDATE',
      entityType: 'PROJECT',
      entityId: project.id,
      details,
      userId: req.user.id,
      projectId: project.id,
    });

    return successResponse(res, 'Project updated successfully.', updatedProject);
  } catch (error) {
    next(error);
  }
};

// Delete a project (restricted to project owner)
export const deleteProject = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      throw new NotFoundError('Invalid Project ID.');
    }

    const project = await prisma.project.findUnique({
      where: { id },
    });

    if (!project) {
      throw new NotFoundError('Project not found.');
    }

    if (project.userId !== req.user.id) {
      throw new ForbiddenError('You do not have permission to delete this project.');
    }

    await prisma.project.delete({
      where: { id },
    });

    // Record action log (with projectId = null since project is deleted, but we still log userId and details)
    await createAuditLog({
      action: 'DELETE',
      entityType: 'PROJECT',
      entityId: id,
      details: `Project "${project.name}" and its associated tasks were deleted.`,
      userId: req.user.id,
    });

    return successResponse(res, 'Project deleted successfully.');
  } catch (error) {
    next(error);
  }
};
