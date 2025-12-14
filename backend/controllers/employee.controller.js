import db from '../models/index.js';
import axios from 'axios';
import { Op } from 'sequelize';

const { Employee, Training, TestResult, Competency } = db;

// Sync employees from HRM API
export const syncEmployees = async (req, res) => {
  try {
    const HRM_URL = 'https://hrm.umanerp.com/api/users/getEmployee';
    console.log('🔄 Fetching employees from HRM API...');
    
    const response = await axios.get(HRM_URL);
    console.log('📦 Full API Response:', JSON.stringify(response.data, null, 2));
    console.log(`✅ Received ${response.data?.employees?.length || 0} employees from API`);
    
    const employees = response.data.employees || [];
    
    if (employees.length === 0) {
      console.log('⚠️ Response data structure:', Object.keys(response.data));
      return res.json({
        success: false,
        message: 'No employees found in HRM API',
        count: 0,
        debug: {
          responseKeys: Object.keys(response.data),
          fullResponse: response.data
        }
      });
    }

    let syncedCount = 0;
    let createdCount = 0;
    let updatedCount = 0;
    
    for (const emp of employees) {
      if (!emp.employeeId) {
        console.log('⚠️ Skipping employee without employee ID:', emp);
        continue;
      }

      const [employee, created] = await Employee.findOrCreate({
        where: { punchId: emp.employeeId },
        defaults: {
          fullName: emp.fullName || 'N/A',
          department: emp.department || 'N/A',
          designation: emp.designation || 'N/A',
          workLocation: emp.lineUnit || 'N/A',
          dateOfJoining: emp.dateOfJoining || null,
          email: emp.email || null,
          phone: emp.mobileNumber || null,
          status: emp.status === 'Approved' ? 'Active' : 'Inactive'
        }
      });

      if (!created) {
        await employee.update({
          fullName: emp.fullName || employee.fullName,
          department: emp.department || employee.department,
          designation: emp.designation || employee.designation,
          workLocation: emp.lineUnit || employee.workLocation,
          email: emp.email || employee.email,
          phone: emp.mobileNumber || employee.phone,
          status: emp.status === 'Approved' ? 'Active' : 'Inactive'
        });
        updatedCount++;
      } else {
        createdCount++;
      }
      syncedCount++;
    }

    console.log(`✅ Sync complete: ${createdCount} created, ${updatedCount} updated`);

    res.json({
      success: true,
      message: `${syncedCount} employees synced (${createdCount} new, ${updatedCount} updated)`,
      count: syncedCount,
      created: createdCount,
      updated: updatedCount
    });
  } catch (error) {
    console.error('Sync error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};// Get all employees
export const getAllEmployees = async (req, res) => {
  try {
    const { department, status, search } = req.query;
    
    let where = {};
    if (department) where.department = department;
    if (status) where.status = status;
    if (search) {
      where[Op.or] = [
        { punchId: { [Op.like]: `%${search}%` } },
        { fullName: { [Op.like]: `%${search}%` } }
      ];
    }

    const employees = await Employee.findAll({
      where,
      order: [['fullName', 'ASC']]
    });

    res.json({ success: true, data: employees, count: employees.length });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get employee by ID with all records
export const getEmployeeById = async (req, res) => {
  try {
    const { id } = req.params;

    const employee = await Employee.findByPk(id, {
      include: [
        { model: Training, order: [['trainingDate', 'DESC']] },
        { model: TestResult, order: [['testDate', 'DESC']] },
        { model: Competency, order: [['year', 'DESC'], ['month', 'DESC']] }
      ]
    });

    if (!employee) {
      return res.status(404).json({ success: false, message: 'Employee not found' });
    }

    res.json({ success: true, data: employee });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get employee statistics
export const getEmployeeStats = async (req, res) => {
  try {
    const totalEmployees = await Employee.count();
    const activeEmployees = await Employee.count({ where: { status: 'Active' } });
    
    const departments = await Employee.findAll({
      attributes: [
        'department',
        [db.sequelize.fn('COUNT', db.sequelize.col('id')), 'count']
      ],
      group: ['department']
    });

    res.json({
      success: true,
      data: {
        total: totalEmployees,
        active: activeEmployees,
        inactive: totalEmployees - activeEmployees,
        byDepartment: departments
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
