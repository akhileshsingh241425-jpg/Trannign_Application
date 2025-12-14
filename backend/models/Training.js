import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Training = sequelize.define('Training', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  employeeId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'employees',
      key: 'id'
    }
  },
  trainingTopic: {
    type: DataTypes.STRING(300),
    allowNull: false
  },
  trainingDate: {
    type: DataTypes.DATE,
    allowNull: false
  },
  duration: {
    type: DataTypes.DECIMAL(5, 2),
    comment: 'Duration in hours'
  },
  trainer: {
    type: DataTypes.STRING(150)
  },
  venue: {
    type: DataTypes.STRING(200)
  },
  status: {
    type: DataTypes.ENUM('Scheduled', 'Completed', 'Cancelled'),
    defaultValue: 'Scheduled'
  },
  completionDate: {
    type: DataTypes.DATE
  },
  remarks: {
    type: DataTypes.TEXT
  }
}, {
  tableName: 'trainings',
  timestamps: true
});

export default Training;
