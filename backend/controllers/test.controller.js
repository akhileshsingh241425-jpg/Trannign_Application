import db from '../models/index.js';

const { TestResult, Employee } = db;

// Get all test results
export const getAllTestResults = async (req, res) => {
  try {
    const { category, department, month, year, punchId } = req.query;
    
    let where = {};
    if (category) where.category = category;
    
    if (month && year) {
      const startDate = new Date(year, month - 1, 1);
      const endDate = new Date(year, month, 0);
      where.testDate = {
        [db.sequelize.Op.between]: [startDate, endDate]
      };
    }

    let employeeWhere = {};
    if (department) employeeWhere.department = department;
    if (punchId) employeeWhere.punchId = punchId;

    const includeEmployee = {
      model: Employee,
      attributes: ['punchId', 'fullName', 'department', 'designation']
    };

    if (Object.keys(employeeWhere).length > 0) {
      includeEmployee.where = employeeWhere;
      includeEmployee.required = true;
    }

    const results = await TestResult.findAll({
      where,
      include: [includeEmployee],
      order: [['testDate', 'DESC']]
    });

    res.json({ success: true, data: results, count: results.length });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Create test result
export const createTestResult = async (req, res) => {
  try {
    const result = await TestResult.create(req.body);
    res.status(201).json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update test result
export const updateTestResult = async (req, res) => {
  try {
    const { id } = req.params;
    const [updated] = await TestResult.update(req.body, { where: { id } });
    
    if (!updated) {
      return res.status(404).json({ success: false, message: 'Test result not found' });
    }

    const result = await TestResult.findByPk(id);
    res.json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get test statistics
export const getTestStats = async (req, res) => {
  try {
    const total = await TestResult.count();
    const pass = await TestResult.count({ where: { category: 'Pass' } });
    const retraining = await TestResult.count({ where: { category: 'Retraining' } });
    const fail = await TestResult.count({ where: { category: 'Fail' } });

    const avgScore = await TestResult.findOne({
      attributes: [[db.sequelize.fn('AVG', db.sequelize.col('scorePercentage')), 'average']]
    });

    res.json({
      success: true,
      data: {
        total,
        pass,
        retraining,
        fail,
        passRate: ((pass / total) * 100).toFixed(2),
        averageScore: parseFloat(avgScore.dataValues.average || 0).toFixed(2)
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Delete test result
export const deleteTestResult = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await TestResult.destroy({ where: { id } });
    
    if (!deleted) {
      return res.status(404).json({ success: false, message: 'Test result not found' });
    }

    res.json({ success: true, message: 'Test result deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
