import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Employee = sequelize.define('Employee', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  punchId: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: true
  },
  fullName: {
    type: DataTypes.STRING(200),
    allowNull: false
  },
  department: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  designation: {
    type: DataTypes.STRING(150)
  },
  workLocation: {
    type: DataTypes.STRING(150)
  },
  dateOfJoining: {
    type: DataTypes.DATE
  },
  email: {
    type: DataTypes.STRING(150)
  },
  phone: {
    type: DataTypes.STRING(20)
  },
  status: {
    type: DataTypes.ENUM('Active', 'Inactive'),
    defaultValue: 'Active'
  }
}, {
  tableName: 'employees',
  timestamps: true
});

export default Employee;
