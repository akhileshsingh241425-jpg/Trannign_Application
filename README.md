# HR & Training Management System

Complete HR and Training Management System for Solar Panel Manufacturing

## Features

- ✅ Employee Management (Sync from HRM API)
- ✅ Training Management (Schedule, Track, Complete)
- ✅ Test Results Management
- ✅ Competency Matrix (7:2:1 Ratio - Pass/Retraining/Fail)
- ✅ Training Calendar
- ✅ Dashboard with KPIs
- ✅ All Employee Records & History

## Setup Instructions

### Backend Setup

```bash
cd backend
npm install
# Update .env file with your database credentials
npm start
```

### Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

## API Endpoints

### Employees
- POST `/api/employees/sync` - Sync from HRM
- GET `/api/employees` - Get all employees
- GET `/api/employees/:id` - Get employee details
- GET `/api/employees/stats` - Get statistics

### Trainings
- GET `/api/trainings` - Get all trainings
- POST `/api/trainings` - Create training
- PUT `/api/trainings/:id` - Update training
- DELETE `/api/trainings/:id` - Delete training
- GET `/api/trainings/calendar` - Get calendar
- GET `/api/trainings/stats` - Get statistics

### Tests
- GET `/api/tests` - Get all test results
- POST `/api/tests` - Create test result
- PUT `/api/tests/:id` - Update test result
- GET `/api/tests/stats` - Get statistics

### Competency
- GET `/api/competency` - Get competency matrix
- POST `/api/competency` - Create/Update competency
- GET `/api/competency/stats` - Get statistics

## Database Schema

- **employees**: Employee master data
- **trainings**: Training records
- **test_results**: Test results and scores
- **competencies**: Monthly competency evaluations

## Default Port

- Backend: http://localhost:5000
- Frontend: http://localhost:3000
