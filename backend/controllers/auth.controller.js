import db from '../models/index.js';
import { Op } from 'sequelize';

const { Employee, Training } = db;

export const login = async (req, res) => {
  try {
    const { type, username, password } = req.body;

    if (!type || !username || !password) {
      return res.status(400).json({ error: 'Type, username, and password are required' });
    }

    if (type === 'employee') {
      // Employee login with punch ID
      const employee = await Employee.findOne({ 
        where: { 
          punchId: username,
          status: 'Active' 
        } 
      });
      
      if (!employee) {
        return res.status(401).json({ error: 'Invalid Punch ID or inactive employee' });
      }

      // Password check - accept default password or punch ID
      if (password !== '321' && password !== employee.punchId) {
        return res.status(401).json({ error: 'Invalid password. Use 321 or your Punch ID' });
      }

      return res.json({
        success: true,
        user: {
          type: 'employee',
          punchId: employee.punchId,
          name: employee.fullName,
          department: employee.department,
          designation: employee.designation
        }
      });
    } 
    else if (type === 'trainer') {
      // Hardcoded trainer credentials
      if (username === '1234' && password === '1234') {
        return res.json({
          success: true,
          user: {
            type: 'trainer',
            trainerId: 'TRN001',
            name: 'Himanshu'
          }
        });
      } else {
        return res.status(401).json({ error: 'Invalid credentials. Use 1234/1234' });
      }
    } 
    else {
      return res.status(400).json({ error: 'Invalid user type' });
    }
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: error.message });
  }
};

export const verify = async (req, res) => {
  try {
    const { type, id } = req.body;

    if (type === 'employee') {
      const employee = await Employee.findOne({
        where: { punchId: id }
      });

      if (!employee) {
        return res.status(404).json({ error: 'Employee not found' });
      }

      return res.json({
        success: true,
        user: {
          type: 'employee',
          punchId: employee.punchId,
          name: employee.fullName,
          department: employee.department
        }
      });
    } else if (type === 'trainer') {
      const training = await Training.findOne({
        where: { trainer: id }
      });

      if (!training) {
        return res.status(404).json({ error: 'Trainer not found' });
      }

      return res.json({
        success: true,
        user: {
          type: 'trainer',
          trainerId: id,
          name: training.trainer
        }
      });
    }

    return res.status(400).json({ error: 'Invalid user type' });
  } catch (error) {
    console.error('Verify error:', error);
    res.status(500).json({ error: error.message });
  }
};
