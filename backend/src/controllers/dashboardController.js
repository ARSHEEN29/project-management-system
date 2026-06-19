import prisma from '../services/db.js';
import { successResponse } from '../utils/response.js';

export const getDashboardStats = async (req, res, next) => {
  try {
    const userId = req.user.id;

    // Execute multiple prisma operations in parallel
    const [
      totalProjects,
      projectsInProgress,
      projectsCompleted,
      projectsNotStarted,
      totalTasks,
      tasksCompleted,
      tasksInProgress,
      tasksPending,
      recentTasks,
      recentLogs
    ] = await Promise.all([
      // Total Projects
      prisma.project.count({ where: { userId } }),
      // Projects in Progress
      prisma.project.count({ where: { userId, status: 'IN_PROGRESS' } }),
      // Projects Completed
      prisma.project.count({ where: { userId, status: 'COMPLETED' } }),
      // Projects Not Started
      prisma.project.count({ where: { userId, status: 'NOT_STARTED' } }),
      
      // Total Tasks
      prisma.task.count({ where: { project: { userId } } }),
      // Tasks Completed
      prisma.task.count({ where: { project: { userId }, status: 'COMPLETED' } }),
      // Tasks In Progress
      prisma.task.count({ where: { project: { userId }, status: 'IN_PROGRESS' } }),
      // Tasks Pending
      prisma.task.count({ where: { project: { userId }, status: 'PENDING' } }),

      // Recent Tasks (limit 5)
      prisma.task.findMany({
        where: { project: { userId } },
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: {
          project: {
            select: { name: true }
          }
        }
      }),

      // Recent logs (limit 8) for activity timeline
      prisma.auditLog.findMany({
        where: { userId },
        take: 8,
        orderBy: { createdAt: 'desc' },
        include: {
          project: {
            select: { name: true }
          }
        }
      })
    ]);

    // Format distributions for Recharts
    const projectStatusDistribution = [
      { name: 'Not Started', value: projectsNotStarted, color: '#94A3B8' }, // slate-400
      { name: 'In Progress', value: projectsInProgress, color: '#3B82F6' }, // blue-500
      { name: 'Completed', value: projectsCompleted, color: '#10B981' }   // emerald-500
    ];

    // Priority Distribution for Bar Chart
    const taskPriorityDistribution = await prisma.task.groupBy({
      by: ['priority'],
      where: { project: { userId } },
      _count: { _all: true }
    });

    const priorityMap = { LOW: 0, MEDIUM: 0, HIGH: 0 };
    taskPriorityDistribution.forEach(item => {
      priorityMap[item.priority] = item._count._all;
    });

    const taskPriorityData = [
      { name: 'Low', count: priorityMap.LOW, fill: '#10B981' },
      { name: 'Medium', count: priorityMap.MEDIUM, fill: '#F59E0B' },
      { name: 'High', count: priorityMap.HIGH, fill: '#EF4444' }
    ];

    // Task Status Distribution for completion chart
    const taskStatusData = [
      { name: 'Pending', value: tasksPending, color: '#F59E0B' },
      { name: 'In Progress', value: tasksInProgress, color: '#3B82F6' },
      { name: 'Completed', value: tasksCompleted, color: '#10B981' }
    ];

    return successResponse(res, 'Dashboard metrics fetched successfully.', {
      summary: {
        totalProjects,
        projectsInProgress,
        projectsCompleted,
        projectsNotStarted,
        totalTasks,
        tasksCompleted,
        tasksInProgress,
        tasksPending
      },
      charts: {
        projectStatusDistribution,
        taskPriorityData,
        taskStatusData
      },
      recentTasks,
      recentLogs
    });
  } catch (error) {
    next(error);
  }
};
