import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import sequelize from './config/database.js';
import db from './models/index.js';

// Destructure models
const { Employee } = db;

// Routes
import employeeRoutes from './routes/employee.routes.js';
import trainingRoutes from './routes/training.routes.js';
import testRoutes from './routes/test.routes.js';
import competencyRoutes from './routes/competency.routes.js';
import orientationRoutes from './routes/orientation.routes.js';
import authRoutes from './routes/auth.routes.js';
import { generateDummyData, restartSystem } from './controllers/datagen.controller.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/employees', employeeRoutes);
app.use('/api/trainings', trainingRoutes);
app.use('/api/tests', testRoutes);
app.use('/api/competency', competencyRoutes);
app.use('/api/orientations', orientationRoutes);
app.use('/api/auth', authRoutes);
app.post('/api/generate-dummy-data', generateDummyData);
app.post('/api/restart-system', restartSystem);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'HR Training System API is running' });
});

// Database sync and server start
const startServer = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ Database connected successfully');
    
    // Sync database with force: false to prevent dropping tables
    await sequelize.sync({ force: false });
    console.log('✅ Database synchronized');
    
    // Create default employee if database is empty
    const employeeCount = await Employee.count();
    if (employeeCount === 0) {
      await Employee.create({
        punchId: '3962',
        fullName: 'Test Employee',
        department: 'Production',
        designation: 'Operator',
        workLocation: 'Greater Noida',
        dateOfJoining: new Date(),
        email: 'employee@gautamsolar.com',
        phone: '9999999999',
        status: 'Active'
      });
      console.log('✅ Default employee created (Punch ID: 3962)');
    }
    
    const server = app.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
    });

    server.on('error', (error) => {
      console.error('❌ Server error:', error);
    });

  } catch (error) {
    console.error('❌ Unable to start server:', error);
    process.exit(1);
  }
};

// Handle unhandled promise rejections
process.on('unhandledRejection', (error) => {
  console.error('❌ Unhandled Promise Rejection:', error);
});

process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught Exception:', error);
});

startServer();
