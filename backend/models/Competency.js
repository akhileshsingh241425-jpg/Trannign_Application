import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Competency = sequelize.define('Competency', {
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
  month: {
    type: DataTypes.STRING(20),
    allowNull: false
  },
  year: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  aggregateScore: {
    type: DataTypes.DECIMAL(5, 2),
    allowNull: false
  },
  category: {
    type: DataTypes.ENUM('Pass', 'Retraining', 'Fail'),
    allowNull: false
  },
  attendanceRate: {
    type: DataTypes.DECIMAL(5, 2)
  },
  qualityScore: {
    type: DataTypes.DECIMAL(5, 2)
  },
  safetyCompliance: {
    type: DataTypes.DECIMAL(5, 2)
  },
  trainingCompletion: {
    type: DataTypes.DECIMAL(5, 2)
  },
  overallPerformance: {
    type: DataTypes.DECIMAL(5, 2)
  },
  performanceRating: {
    type: DataTypes.STRING(20)
  }
}, {
  tableName: 'competencies',
  timestamps: true
});

export default Competency;
