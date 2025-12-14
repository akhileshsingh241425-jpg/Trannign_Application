import express from 'express';
import {
  getAllOrientations,
  getOrientationByEmployee,
  createOrientation,
  updateOrientation,
  getOrientationStats
} from '../controllers/orientation.controller.js';

const router = express.Router();

router.get('/', getAllOrientations);
router.get('/stats', getOrientationStats);
router.get('/employee/:employeeId', getOrientationByEmployee);
router.post('/', createOrientation);
router.put('/:id', updateOrientation);

export default router;
