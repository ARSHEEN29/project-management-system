import prisma from './db.js';

/**
 * Creates an entry in the Audit Log table.
 * 
 * @param {Object} params
 * @param {string} params.action - The action performed (CREATE, UPDATE, DELETE, COMPLETE)
 * @param {string} params.entityType - The entity type (PROJECT, TASK)
 * @param {number} params.entityId - The database ID of the entity
 * @param {string} params.details - JSON string or description text detailing the change
 * @param {number} params.userId - The ID of the user performing the action
 * @param {number} [params.projectId] - Optional reference to the project
 */
export const createAuditLog = async ({
  action,
  entityType,
  entityId,
  details,
  userId,
  projectId = null
}) => {
  try {
    await prisma.auditLog.create({
      data: {
        action,
        entityType,
        entityId,
        details,
        userId,
        projectId
      }
    });
  } catch (error) {
    // Log audit creation errors but don't crash main request flow
    console.error('Failed to create audit log:', error);
  }
};
