import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Orientation = sequelize.define('Orientation', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  employeeId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Employees',
      key: 'id'
    }
  },
  orientationDate: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  // Personal Information
  personalInfoCompleted: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  // Documentation
  documentsVerified: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  // Company Policies
  companyPoliciesExplained: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  hrPoliciesExplained: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  qualityPolicyExplained: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  // Safety Training
  safetyTrainingCompleted: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  ppeTrainingCompleted: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  fireTrainingCompleted: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  // Department Training
  departmentOrientationCompleted: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  workstationSetup: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  sopTrainingCompleted: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  // ISO & Quality
  isoAwarenessCompleted: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  qualityToolsTraining: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  // 5S & Housekeeping
  fiveSTrainingCompleted: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  // Overall Status
  orientationStatus: {
    type: DataTypes.ENUM('Pending', 'In Progress', 'Completed'),
    defaultValue: 'Pending'
  },
  completionPercentage: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  completedBy: {
    type: DataTypes.STRING,
    allowNull: true
  },
  remarks: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  tableName: 'orientations',
  timestamps: true
});

export default Orientation;
