import sequelize from '../config/database.js';
import Employee from './Employee.js';
import Training from './Training.js';
import TestResult from './TestResult.js';
import Competency from './Competency.js';
import Orientation from './Orientation.js';

// Define relationships
Employee.hasMany(Training, { foreignKey: 'employeeId' });
Training.belongsTo(Employee, { foreignKey: 'employeeId' });

Employee.hasMany(TestResult, { foreignKey: 'employeeId' });
TestResult.belongsTo(Employee, { foreignKey: 'employeeId' });

Employee.hasMany(Competency, { foreignKey: 'employeeId' });
Competency.belongsTo(Employee, { foreignKey: 'employeeId' });

Employee.hasMany(Orientation, { foreignKey: 'employeeId' });
Orientation.belongsTo(Employee, { foreignKey: 'employeeId' });

const db = {
  sequelize,
  Employee,
  Training,
  TestResult,
  Competency,
  Orientation
};

export default db;
