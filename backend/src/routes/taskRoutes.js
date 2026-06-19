import { Router } from 'express';
import {
  getAllTasks,
  getTaskById,
  createTask,
  updateTask,
  deleteTask,
  exportTasksCsv
} from '../controllers/taskController.js';
import { taskValidator } from '../validators/index.js';
import { handleValidationErrors } from '../middleware/validationMiddleware.js';
import { protect } from '../middleware/authMiddleware.js';

const router = Router();

// Apply auth protection to all task routes
router.use(protect);

// Specific export route must be defined BEFORE parametric /:id route
router.get('/export', exportTasksCsv);

router.route('/')
  .get(getAllTasks)
  .post(taskValidator, handleValidationErrors, createTask);

router.route('/:id')
  .get(getTaskById)
  .put(taskValidator, handleValidationErrors, updateTask)
  .delete(deleteTask);

export default router;
