import prisma from '../services/db.js';
import { successResponse, errorResponse } from '../utils/response.js';
import { NotFoundError, ForbiddenError, BadRequestError } from '../utils/errors.js';
import { createAuditLog } from '../services/auditLogService.js';

// Get tasks (Search, Filter, Sort, Pagination)
export const getAllTasks = async (req, res, next) => {
  try {
    const {
      projectId,
      status,
      priority,
      search,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      page = 1,
      limit = 10,
    } = req.query;

    const pageNum = Math.max(1, parseInt(page) || 1);
    const limitNum = Math.max(1, parseInt(limit) || 10);
    const skip = (pageNum - 1) * limitNum;

    // Base condition: Tasks must belong to one of the user's projects
    const where = {
      project: {
        userId: req.user.id,
      },
    };

    // Filter by project if specified
    if (projectId) {
      const parsedProjId = parseInt(projectId);
      if (isNaN(parsedProjId)) {
        throw new BadRequestError('Invalid Project ID.');
      }
      
      // Verify user owns the project
      const projectExists = await prisma.project.findFirst({
        where: { id: parsedProjId, userId: req.user.id }
      });
      if (!projectExists) {
        throw new ForbiddenError('You do not have access to this project.');
      }
      
      where.projectId = parsedProjId;
    }

    // Filter by status
    if (status) {
      where.status = status;
    }

    // Filter by priority
    if (priority) {
      where.priority = priority;
    }

    // Filter by name (search)
    if (search) {
      where.name = {
        contains: search,
      };
    }

    // Sorting options validation
    const allowedSortBy = ['createdAt', 'name', 'dueDate', 'priority', 'status'];
    const resolvedSortBy = allowedSortBy.includes(sortBy) ? sortBy : 'createdAt';
    const resolvedSortOrder = ['asc', 'desc'].includes(sortOrder.toLowerCase())
      ? sortOrder.toLowerCase()
      : 'desc';

    // Fetch count & tasks list
    const [totalItems, tasks] = await prisma.$transaction([
      prisma.task.count({ where }),
      prisma.task.findMany({
        where,
        skip,
        take: limitNum,
        orderBy: {
          [resolvedSortBy]: resolvedSortOrder,
        },
        include: {
          project: {
            select: {
              name: true,
            },
          },
        },
      }),
    ]);

    const totalPages = Math.ceil(totalItems / limitNum);

    return successResponse(res, 'Tasks retrieved successfully.', tasks, 200, {
      pagination: {
        totalItems,
        totalPages,
        currentPage: pageNum,
        limit: limitNum,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Get single task by ID
export const getTaskById = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      throw new NotFoundError('Invalid Task ID.');
    }

    const task = await prisma.task.findUnique({
      where: { id },
      include: {
        project: true
      }
    });

    if (!task) {
      throw new NotFoundError('Task not found.');
    }

    // Verify task belongs to user's project
    if (task.project.userId !== req.user.id) {
      throw new ForbiddenError('You do not have permission to view this task.');
    }

    return successResponse(res, 'Task retrieved successfully.', task);
  } catch (error) {
    next(error);
  }
};

// Create a task
export const createTask = async (req, res, next) => {
  try {
    const { name, description, priority, status, dueDate, projectId } = req.body;

    const parsedProjId = parseInt(projectId);
    if (isNaN(parsedProjId)) {
      throw new BadRequestError('Invalid Project ID.');
    }

    // Verify project belongs to user
    const project = await prisma.project.findFirst({
      where: { id: parsedProjId, userId: req.user.id }
    });

    if (!project) {
      throw new ForbiddenError('You do not have access to this project or it does not exist.');
    }

    const task = await prisma.task.create({
      data: {
        name,
        description,
        priority: priority || 'MEDIUM',
        status: status || 'PENDING',
        dueDate: dueDate ? new Date(dueDate) : null,
        projectId: parsedProjId,
      },
    });

    // Create Audit Log
    await createAuditLog({
      action: 'CREATE',
      entityType: 'TASK',
      entityId: task.id,
      details: `Task "${task.name}" was created in project "${project.name}".`,
      userId: req.user.id,
      projectId: project.id,
    });

    return successResponse(res, 'Task created successfully.', task, 201);
  } catch (error) {
    next(error);
  }
};

// Update a task
export const updateTask = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      throw new NotFoundError('Invalid Task ID.');
    }

    const task = await prisma.task.findUnique({
      where: { id },
      include: { project: true }
    });

    if (!task) {
      throw new NotFoundError('Task not found.');
    }

    // Verify user owns project
    if (task.project.userId !== req.user.id) {
      throw new ForbiddenError('You do not have permission to edit this task.');
    }

    const { name, description, priority, status, dueDate } = req.body;

    const updatedTask = await prisma.task.update({
      where: { id },
      data: {
        name: name !== undefined ? name : task.name,
        description: description !== undefined ? description : task.description,
        priority: priority !== undefined ? priority : task.priority,
        status: status !== undefined ? status : task.status,
        dueDate: dueDate !== undefined ? (dueDate ? new Date(dueDate) : null) : task.dueDate,
      },
    });

    // Log update
    const changes = [];
    if (status && status !== task.status) changes.push(`status to "${status}"`);
    if (priority && priority !== task.priority) changes.push(`priority to "${priority}"`);
    const details = changes.length > 0
      ? `Updated task "${task.name}" details: ${changes.join(', ')}`
      : `Task "${task.name}" details were updated.`;

    await createAuditLog({
      action: status === 'COMPLETED' && task.status !== 'COMPLETED' ? 'COMPLETE' : 'UPDATE',
      entityType: 'TASK',
      entityId: task.id,
      details,
      userId: req.user.id,
      projectId: task.projectId,
    });

    return successResponse(res, 'Task updated successfully.', updatedTask);
  } catch (error) {
    next(error);
  }
};

// Delete a task
export const deleteTask = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      throw new NotFoundError('Invalid Task ID.');
    }

    const task = await prisma.task.findUnique({
      where: { id },
      include: { project: true }
    });

    if (!task) {
      throw new NotFoundError('Task not found.');
    }

    // Verify user owns project
    if (task.project.userId !== req.user.id) {
      throw new ForbiddenError('You do not have permission to delete this task.');
    }

    await prisma.task.delete({
      where: { id },
    });

    // Audit log
    await createAuditLog({
      action: 'DELETE',
      entityType: 'TASK',
      entityId: id,
      details: `Task "${task.name}" was deleted from project "${task.project.name}".`,
      userId: req.user.id,
      projectId: task.projectId,
    });

    return successResponse(res, 'Task deleted successfully.');
  } catch (error) {
    next(error);
  }
};

// Export Tasks to CSV
export const exportTasksCsv = async (req, res, next) => {
  try {
    const { projectId, status, priority, search } = req.query;

    const where = {
      project: {
        userId: req.user.id,
      },
    };

    if (projectId) {
      const parsedProjId = parseInt(projectId);
      if (!isNaN(parsedProjId)) {
        where.projectId = parsedProjId;
      }
    }

    if (status) where.status = status;
    if (priority) where.priority = priority;
    if (search) where.name = { contains: search };

    const tasks = await prisma.task.findMany({
      where,
      include: {
        project: {
          select: { name: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    // Generate CSV contents
    let csvContent = 'Task ID,Task Name,Description,Priority,Status,Due Date,Project Name,Created At\n';
    
    tasks.forEach((task) => {
      // Escape commas and quotes for CSV safety
      const escape = (val) => {
        if (val === null || val === undefined) return '';
        const str = String(val).replace(/"/g, '""');
        return str.includes(',') || str.includes('\n') || str.includes('"') ? `"${str}"` : str;
      };

      csvContent += `${task.id},${escape(task.name)},${escape(task.description)},${task.priority},${task.status},${task.dueDate ? task.dueDate.toISOString().split('T')[0] : ''},${escape(task.project.name)},${task.createdAt.toISOString()}\n`;
    });

    // Send File Response
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=tasks_export.csv');
    return res.status(200).send(csvContent);
  } catch (error) {
    next(error);
  }
};
