import { Router } from 'express';
import {
  getAllProjects,
  getProjectById,
  createProject,
  updateProject,
  deleteProject
} from '../controllers/projectController.js';
import { projectValidator } from '../validators/index.js';
import { handleValidationErrors } from '../middleware/validationMiddleware.js';
import { protect } from '../middleware/authMiddleware.js';

const router = Router();

// Apply auth protection to all project routes
router.use(protect);

router.route('/')
  .get(getAllProjects)
  .post(projectValidator, handleValidationErrors, createProject);

router.route('/:id')
  .get(getProjectById)
  .put(projectValidator, handleValidationErrors, updateProject)
  .delete(deleteProject);

export default router;
