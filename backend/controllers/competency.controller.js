import db from '../models/index.js';

const { Competency, Employee } = db;

// Get competency matrix
export const getCompetencyMatrix = async (req, res) => {
  try {
    const { department, month, year, category, punchId, search } = req.query;
    
    let where = {};
    if (month) where.month = month;
    if (year) where.year = year;
    if (category) where.category = category;

    let employeeWhere = {};
    if (department) employeeWhere.department = department;
    if (punchId) employeeWhere.punchId = punchId;
    if (search) {
      employeeWhere[db.sequelize.Op.or] = [
        { punchId: { [db.sequelize.Op.like]: `%${search}%` } },
        { fullName: { [db.sequelize.Op.like]: `%${search}%` } }
      ];
    }

    const includeEmployee = {
      model: Employee,
      attributes: ['punchId', 'fullName', 'department', 'designation', 'workLocation', 'dateOfJoining']
    };

    if (Object.keys(employeeWhere).length > 0) {
      includeEmployee.where = employeeWhere;
      includeEmployee.required = true;
    }

    const competencies = await Competency.findAll({
      where,
      include: [includeEmployee],
      order: [['year', 'DESC'], ['month', 'DESC']]
    });

    res.json({ success: true, data: competencies, count: competencies.length });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Create or update competency
export const upsertCompetency = async (req, res) => {
  try {
    const { employeeId, month, year } = req.body;

    const [competency, created] = await Competency.findOrCreate({
      where: { employeeId, month, year },
      defaults: req.body
    });

    if (!created) {
      await competency.update(req.body);
    }

    res.json({ 
      success: true, 
      data: competency,
      message: created ? 'Competency created' : 'Competency updated'
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get competency statistics
export const getCompetencyStats = async (req, res) => {
  try {
    const { month, year } = req.query;
    
    let where = {};
    if (month) where.month = month;
    if (year) where.year = year;

    const total = await Competency.count({ where });
    const pass = await Competency.count({ where: { ...where, category: 'Pass' } });
    const retraining = await Competency.count({ where: { ...where, category: 'Retraining' } });
    const fail = await Competency.count({ where: { ...where, category: 'Fail' } });

    const avgScores = await Competency.findOne({
      where,
      attributes: [
        [db.sequelize.fn('AVG', db.sequelize.col('aggregateScore')), 'avgAggregate'],
        [db.sequelize.fn('AVG', db.sequelize.col('attendanceRate')), 'avgAttendance'],
        [db.sequelize.fn('AVG', db.sequelize.col('qualityScore')), 'avgQuality'],
        [db.sequelize.fn('AVG', db.sequelize.col('safetyCompliance')), 'avgSafety'],
        [db.sequelize.fn('AVG', db.sequelize.col('trainingCompletion')), 'avgTraining'],
        [db.sequelize.fn('AVG', db.sequelize.col('overallPerformance')), 'avgOverall']
      ]
    });

    res.json({
      success: true,
      data: {
        total,
        pass,
        retraining,
        fail,
        passRate: ((pass / total) * 100).toFixed(2),
        averageScores: {
          aggregate: parseFloat(avgScores.dataValues.avgAggregate || 0).toFixed(2),
          attendance: parseFloat(avgScores.dataValues.avgAttendance || 0).toFixed(2),
          quality: parseFloat(avgScores.dataValues.avgQuality || 0).toFixed(2),
          safety: parseFloat(avgScores.dataValues.avgSafety || 0).toFixed(2),
          training: parseFloat(avgScores.dataValues.avgTraining || 0).toFixed(2),
          overall: parseFloat(avgScores.dataValues.avgOverall || 0).toFixed(2)
        }
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
