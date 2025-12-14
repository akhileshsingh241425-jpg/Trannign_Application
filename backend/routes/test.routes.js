import express from 'express';
import * as testController from '../controllers/test.controller.js';

const router = express.Router();

router.get('/', testController.getAllTestResults);
router.get('/stats', testController.getTestStats);
router.post('/', testController.createTestResult);
router.put('/:id', testController.updateTestResult);
router.delete('/:id', testController.deleteTestResult);

export default router;
