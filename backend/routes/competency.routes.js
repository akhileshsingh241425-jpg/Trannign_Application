import express from 'express';
import * as competencyController from '../controllers/competency.controller.js';

const router = express.Router();

router.get('/', competencyController.getCompetencyMatrix);
router.get('/stats', competencyController.getCompetencyStats);
router.post('/', competencyController.upsertCompetency);

export default router;
