import db from '../models/index.js';

const { Training, Employee } = db;

// Get all trainings
export const getAllTrainings = async (req, res) => {
  try {
    const { status, department, startDate, endDate, punchId } = req.query;
    
    let where = {};
    if (status) where.status = status;
    if (startDate && endDate) {
      where.trainingDate = {
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
      includeEmployee.required = true; // INNER JOIN
    }

    const trainings = await Training.findAll({
      where,
      include: [includeEmployee],
      order: [['trainingDate', 'DESC']]
    });

    res.json({ success: true, data: trainings, count: trainings.length, total: trainings.length });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Create training
export const createTraining = async (req, res) => {
  try {
    const training = await Training.create(req.body);
    res.status(201).json({ success: true, data: training });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update training
export const updateTraining = async (req, res) => {
  try {
    const { id } = req.params;
    const [updated] = await Training.update(req.body, { where: { id } });
    
    if (!updated) {
      return res.status(404).json({ success: false, message: 'Training not found' });
    }

    const training = await Training.findByPk(id);
    res.json({ success: true, data: training });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Delete training
export const deleteTraining = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Training.destroy({ where: { id } });
    
    if (!deleted) {
      return res.status(404).json({ success: false, message: 'Training not found' });
    }

    res.json({ success: true, message: 'Training deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get training calendar
export const getTrainingCalendar = async (req, res) => {
  try {
    const { month, year } = req.query;
    
    let where = { status: { [db.sequelize.Op.ne]: 'Cancelled' } };
    
    if (month && year) {
      const startDate = new Date(year, month - 1, 1);
      const endDate = new Date(year, month, 0);
      where.trainingDate = {
        [db.sequelize.Op.between]: [startDate, endDate]
      };
    }

    const trainings = await Training.findAll({
      where,
      include: [{
        model: Employee,
        attributes: ['punchId', 'fullName', 'department']
      }],
      order: [['trainingDate', 'ASC']]
    });

    res.json({ success: true, data: trainings, count: trainings.length });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get training statistics
export const getTrainingStats = async (req, res) => {
  try {
    const total = await Training.count();
    const completed = await Training.count({ where: { status: 'Completed' } });
    const scheduled = await Training.count({ where: { status: 'Scheduled' } });
    const cancelled = await Training.count({ where: { status: 'Cancelled' } });

    res.json({
      success: true,
      data: {
        total,
        completed,
        scheduled,
        cancelled,
        completionRate: ((completed / total) * 100).toFixed(2)
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
