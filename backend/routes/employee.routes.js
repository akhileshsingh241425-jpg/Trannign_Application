import express from 'express';
import * as employeeController from '../controllers/employee.controller.js';

const router = express.Router();

router.post('/sync', employeeController.syncEmployees);
router.get('/', employeeController.getAllEmployees);
router.get('/stats', employeeController.getEmployeeStats);
router.get('/:id', employeeController.getEmployeeById);

export default router;
