import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const TestResult = sequelize.define('TestResult', {
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
  testDate: {
    type: DataTypes.DATE,
    allowNull: false
  },
  testTopic: {
    type: DataTypes.STRING(300),
    allowNull: false
  },
  scorePercentage: {
    type: DataTypes.DECIMAL(5, 2),
    allowNull: false
  },
  category: {
    type: DataTypes.ENUM('Pass', 'Retraining', 'Fail'),
    allowNull: false
  },
  maxMarks: {
    type: DataTypes.INTEGER,
    defaultValue: 100
  },
  obtainedMarks: {
    type: DataTypes.DECIMAL(5, 2)
  },
  remarks: {
    type: DataTypes.TEXT
  }
}, {
  tableName: 'test_results',
  timestamps: true
});

export default TestResult;
