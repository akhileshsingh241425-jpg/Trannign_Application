import express from 'express';
import * as trainingController from '../controllers/training.controller.js';

const router = express.Router();

router.get('/', trainingController.getAllTrainings);
router.get('/calendar', trainingController.getTrainingCalendar);
router.get('/stats', trainingController.getTrainingStats);
router.post('/', trainingController.createTraining);
router.put('/:id', trainingController.updateTraining);
router.delete('/:id', trainingController.deleteTraining);

export default router;
