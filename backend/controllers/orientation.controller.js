import db from '../models/index.js';
import { Op } from 'sequelize';

const { Orientation, Employee } = db;

// Get all orientations
export const getAllOrientations = async (req, res) => {
  try {
    const { status, search } = req.query;
    
    let where = {};
    if (status) where.orientationStatus = status;

    const orientations = await Orientation.findAll({
      where,
      include: [{
        model: Employee,
        attributes: ['id', 'punchId', 'fullName', 'department', 'designation'],
        where: search ? {
          [Op.or]: [
            { punchId: { [Op.like]: `%${search}%` } },
            { fullName: { [Op.like]: `%${search}%` } }
          ]
        } : undefined
      }],
      order: [['orientationDate', 'DESC']]
    });

    res.json({ success: true, data: orientations, count: orientations.length });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get orientation by employee ID
export const getOrientationByEmployee = async (req, res) => {
  try {
    const { employeeId } = req.params;

    const orientation = await Orientation.findOne({
      where: { employeeId },
      include: [{
        model: Employee,
        attributes: ['id', 'punchId', 'fullName', 'department', 'designation']
      }]
    });

    if (!orientation) {
      return res.status(404).json({ success: false, message: 'Orientation not found' });
    }

    res.json({ success: true, data: orientation });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Create orientation
export const createOrientation = async (req, res) => {
  try {
    const orientation = await Orientation.create(req.body);
    res.json({ success: true, data: orientation, message: 'Orientation created successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update orientation
export const updateOrientation = async (req, res) => {
  try {
    const { id } = req.params;
    const orientation = await Orientation.findByPk(id);

    if (!orientation) {
      return res.status(404).json({ success: false, message: 'Orientation not found' });
    }

    // Calculate completion percentage
    const fields = [
      'personalInfoCompleted', 'documentsVerified', 'companyPoliciesExplained',
      'hrPoliciesExplained', 'qualityPolicyExplained', 'safetyTrainingCompleted',
      'ppeTrainingCompleted', 'fireTrainingCompleted', 'departmentOrientationCompleted',
      'workstationSetup', 'sopTrainingCompleted', 'isoAwarenessCompleted',
      'qualityToolsTraining', 'fiveSTrainingCompleted'
    ];

    const completedFields = fields.filter(field => req.body[field] === true).length;
    const completionPercentage = Math.round((completedFields / fields.length) * 100);

    let orientationStatus = 'Pending';
    if (completionPercentage === 100) orientationStatus = 'Completed';
    else if (completionPercentage > 0) orientationStatus = 'In Progress';

    await orientation.update({
      ...req.body,
      completionPercentage,
      orientationStatus
    });

    res.json({ success: true, data: orientation, message: 'Orientation updated successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get orientation statistics
export const getOrientationStats = async (req, res) => {
  try {
    const total = await Orientation.count();
    const completed = await Orientation.count({ where: { orientationStatus: 'Completed' } });
    const inProgress = await Orientation.count({ where: { orientationStatus: 'In Progress' } });
    const pending = await Orientation.count({ where: { orientationStatus: 'Pending' } });

    const avgCompletion = await Orientation.findAll({
      attributes: [
        [db.sequelize.fn('AVG', db.sequelize.col('completionPercentage')), 'avgPercentage']
      ]
    });

    res.json({
      success: true,
      data: {
        total,
        completed,
        inProgress,
        pending,
        averageCompletion: Math.round(avgCompletion[0].dataValues.avgPercentage || 0)
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
