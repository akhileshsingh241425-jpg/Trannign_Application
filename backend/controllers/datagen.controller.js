import db from '../models/index.js';
import { Op } from 'sequelize';

const { Employee, Training, TestResult, Competency, Orientation } = db;

const trainingTopicsByDepartment = {
  PRODUCTION: [
    "Tabber & Stringer Process",
    "Lamination Process",
    "JB & Framing Process",
    "Autobussing Process",
    "Production tools Awareness",
    "Handling Practices of Solar Module",
    "Proper Cleaning Process & Checking criteria",
    "Sun Simulator Operation",
    "Raw Material Processing & Cutting Training",
    "Solar Module Manufacturing Process and testing"
  ],
  QUALITY: [
    "EL Process, Importance & Operation (Pre/Post)",
    "Hi-Pot Testing process, validation & safety precaution",
    "IQC Testing, criteria, process and specifications",
    "IPQC Process and Checking Criteria",
    "IQC Process & Checking Criteria",
    "FQC Process & Checking Criteria",
    "Quality tools Awareness",
    "GSPL Quality Policy & QMS Awareness",
    "ISO Awareness & Implementation (ISO 9001/14001/45001/50001)",
    "Rework Process"
  ],
  MAINTENANCE: [
    "Preventive Maintenance & Breakdown Maintenance",
    "General Electrical Check up - Maintenance",
    "General Work Electrical Safety",
    "Production tools Awareness",
    "Sun Simulator Operation"
  ],
  SAFETY: [
    "Safety Awareness",
    "PPEs types & its usage",
    "Fire Fighting",
    "Process Safety Management",
    "Excavation Safety",
    "First Aid",
    "Environmental Safety",
    "Risk Management and Incident Investigation & Hazard Control",
    "Emergency Response Plan",
    "Hi-Pot Testing process, validation & safety precaution"
  ],
  DISPATCH: [
    "Dispatch & Packaging Process",
    "Material & Inventory Management",
    "Handling Practices of Solar Module",
    "5S Awareness"
  ],
  HOUSEKEEPING: [
    "5S Awareness",
    "Environmental Safety",
    "Proper Cleaning Process & Checking criteria",
    "Safety Awareness"
  ],
  PACKAGING: [
    "Dispatch & Packaging Process",
    "Handling Practices of Solar Module",
    "Material & Inventory Management",
    "5S Awareness"
  ],
  STORES: [
    "Material & Inventory Management",
    "Raw Material Processing & Cutting Training",
    "5S Awareness"
  ],
  ALL_DEPARTMENTS: [
    "Gautam Solar Values, Vision & Mission",
    "5S Awareness",
    "Safety Awareness",
    "ISO Awareness & Implementation (ISO 9001/14001/45001/50001)",
    "Computer Skills upgradation",
    "Soft Skill Development",
    "Solar Technology Knowledge",
    "Motivational training",
    "Legal Compliance Training",
    "GSPL HR policies",
    "Functional & Department Know How Training",
    "SOP / WI Awareness"
  ]
};

const trainers = [
  { name: "Himanshu", workload: 1.0, departments: null },
  { name: "Aman", workload: 1.0, departments: null },
  { name: "Shivshree", workload: 1.0, departments: ["MAINTENANCE"] },
  { name: "Ashu", workload: 1.0, departments: null },
  { name: "Nikhil", workload: 1.0, departments: null },
  { name: "Anis", workload: 0.7, departments: ["QUALITY"] },
  { name: "Jay Prakesh", workload: 0.7, departments: ["PRODUCTION"] },
  { name: "Aman Kushwah", workload: 0.7, departments: ["PRODUCTION"] }
];

const trainerNames = trainers.map(t => t.name);
const locations = ["Line A", "Line B", "Line C", "Training Room", "Production Floor"];
const durations = [0.5, 0.75, 1.0, 1.5]; // 30, 45, 60, 90 minutes in hours

const getWeightedRandomTrainer = (department = null) => {
  // Filter trainers by department if specified
  let eligibleTrainers = trainers;
  if (department && department !== 'ALL_DEPARTMENTS') {
    eligibleTrainers = trainers.filter(t => 
      t.departments === null || t.departments.includes(department)
    );
  }
  
  if (eligibleTrainers.length === 0) eligibleTrainers = trainers;
  
  const totalWeight = eligibleTrainers.reduce((sum, t) => sum + t.workload, 0);
  let random = Math.random() * totalWeight;
  
  for (const trainer of eligibleTrainers) {
    random -= trainer.workload;
    if (random <= 0) return trainer.name;
  }
  return eligibleTrainers[0].name;
};

const getRandom = (arr) => arr[Math.floor(Math.random() * arr.length)];

const generateTrainingCalendar = () => {
  const calendar = [];
  const startDate = new Date();
  startDate.setFullYear(startDate.getFullYear() - 1);
  
  // Generate trainings for each department
  Object.keys(trainingTopicsByDepartment).forEach((department) => {
    const topics = trainingTopicsByDepartment[department];
    
    topics.forEach((topic) => {
      // Generate 3 sessions per topic across 12 months
      for (let i = 0; i < 3; i++) {
        const month = Math.floor(Math.random() * 12);
        const day = Math.floor(Math.random() * 28) + 1;
        const trainingDate = new Date(startDate.getFullYear(), startDate.getMonth() + month, day);
        
        // Ensure date is not in future
        const today = new Date();
        if (trainingDate > today) {
          trainingDate.setFullYear(trainingDate.getFullYear() - 1);
        }
        
        calendar.push({
          topic,
          date: trainingDate,
          trainer: getWeightedRandomTrainer(department),
          duration: getRandom(durations),
          location: getRandom(locations),
          department: department === 'ALL_DEPARTMENTS' ? null : department
        });
      }
    });
  });
  
  return calendar.sort((a, b) => a.date - b.date);
};

export const generateDummyData = async (req, res) => {
  try {
    console.log('🚀 Starting FRESH dummy data generation...');
    console.log('🗑️  Clearing ALL existing data...');

    // Clear ALL existing data first with TRUNCATE
    await Training.destroy({ where: {}, truncate: true, cascade: true });
    await TestResult.destroy({ where: {}, truncate: true, cascade: true });
    await Competency.destroy({ where: {}, truncate: true, cascade: true });
    await Orientation.destroy({ where: {}, truncate: true, cascade: true });
    console.log('✅ All old data cleared successfully');

    const employees = await Employee.findAll();
    console.log(`✅ Found ${employees.length} employees`);

    if (employees.length === 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'No employees found. Please sync employees first.' 
      });
    }

    const trainingCalendar = generateTrainingCalendar();
    let trainingsCreated = 0, testsCreated = 0, competenciesCreated = 0, orientationsCreated = 0;

    console.log('👤 Creating orientations...');
    for (const employee of employees) {
      // Orientation within 7 days of joining
      const joiningDate = new Date(employee.dateOfJoining || employee.createdAt);
      const daysAfterJoining = Math.floor(Math.random() * 7); // 0-6 days after joining
      const orientationDate = new Date(joiningDate);
      orientationDate.setDate(orientationDate.getDate() + daysAfterJoining);
      
      // Ensure orientation date is not in future
      const today = new Date();
      if (orientationDate > today) {
        orientationDate.setTime(joiningDate.getTime());
      }
      
      const completionPercentage = Math.floor(Math.random() * 30) + 70;
      let status = completionPercentage === 100 ? 'Completed' : completionPercentage > 50 ? 'In Progress' : 'Pending';

      await Orientation.create({
        employeeId: employee.id,
        orientationDate: orientationDate,
        personalInfoCompleted: true,
        documentsVerified: true,
        companyPoliciesExplained: completionPercentage > 75,
        hrPoliciesExplained: completionPercentage > 75,
        qualityPolicyExplained: completionPercentage > 80,
        safetyTrainingCompleted: true,
        ppeTrainingCompleted: true,
        fireTrainingCompleted: completionPercentage > 85,
        departmentOrientationCompleted: completionPercentage > 80,
        workstationSetup: true,
        sopTrainingCompleted: completionPercentage > 85,
        isoAwarenessCompleted: completionPercentage > 90,
        qualityToolsTraining: completionPercentage > 85,
        fiveSTrainingCompleted: completionPercentage > 80,
        orientationStatus: status,
        completionPercentage: completionPercentage,
        completedBy: status === 'Completed' ? getRandom(trainerNames) : null
      });
      orientationsCreated++;
    }
    console.log(`✅ Created ${orientationsCreated} orientations`);

    console.log('📚 Creating trainings and tests...');
    for (const session of trainingCalendar) {
      const participantCount = Math.floor(Math.random() * 30) + 20;
      
      // Filter employees based on training department
      let eligibleEmployees = employees;
      if (session.department) {
        // Department-specific training
        eligibleEmployees = employees.filter(emp => emp.department === session.department);
      }
      // else: ALL_DEPARTMENTS training - all employees eligible
      
      if (eligibleEmployees.length === 0) continue;
      
      const participants = [...eligibleEmployees]
        .sort(() => 0.5 - Math.random())
        .slice(0, Math.min(participantCount, eligibleEmployees.length));

      for (const employee of participants) {
        // Initial Training
        const training = await Training.create({
          employeeId: employee.id,
          trainingTopic: session.topic,
          trainingDate: session.date,
          trainer: session.trainer,
          duration: session.duration,
          location: session.location,
          status: 'Completed'
        });
        trainingsCreated++;

        // Initial Test
        const testDate = new Date(session.date);
        testDate.setDate(testDate.getDate() + Math.floor(Math.random() * 3) + 1);

        const random = Math.random() * 100;
        let result, score;
        
        if (random < 70) {
          // Pass on first attempt
          result = 'Pass';
          score = Math.floor(Math.random() * 30) + 70;
          
          await TestResult.create({
            employeeId: employee.id,
            testDate: testDate,
            testTopic: session.topic,
            scorePercentage: score,
            category: result,
            maxMarks: 100,
            obtainedMarks: score,
            evaluatedBy: getRandom(trainerNames)
          });
          testsCreated++;
          
        } else if (random < 90) {
          // Fail first, then retraining, then pass
          score = Math.floor(Math.random() * 20) + 30; // Fail score
          
          // First Test - Failed
          await TestResult.create({
            employeeId: employee.id,
            testDate: testDate,
            testTopic: session.topic,
            scorePercentage: score,
            category: 'Fail',
            maxMarks: 100,
            obtainedMarks: score,
            evaluatedBy: getRandom(trainerNames),
            remarks: 'Failed - Retraining Required'
          });
          testsCreated++;
          
          // Retraining after 7-14 days
          const retrainingDate = new Date(testDate);
          retrainingDate.setDate(retrainingDate.getDate() + Math.floor(Math.random() * 7) + 7);
          
          await Training.create({
            employeeId: employee.id,
            trainingTopic: session.topic + ' (Retraining)',
            trainingDate: retrainingDate,
            trainer: session.trainer,
            duration: getRandom(durations),
            location: session.location,
            status: 'Completed'
          });
          trainingsCreated++;
          
          // Retest after retraining
          const retestDate = new Date(retrainingDate);
          retestDate.setDate(retestDate.getDate() + Math.floor(Math.random() * 3) + 1);
          const retestScore = Math.floor(Math.random() * 25) + 70; // Pass score
          
          await TestResult.create({
            employeeId: employee.id,
            testDate: retestDate,
            testTopic: session.topic,
            scorePercentage: retestScore,
            category: 'Pass',
            maxMarks: 100,
            obtainedMarks: retestScore,
            evaluatedBy: getRandom(trainerNames),
            remarks: 'Passed after Retraining'
          });
          testsCreated++;
          
        } else {
          // Retraining category
          result = 'Retraining';
          score = Math.floor(Math.random() * 20) + 50;
          
          await TestResult.create({
            employeeId: employee.id,
            testDate: testDate,
            testTopic: session.topic,
            scorePercentage: score,
            category: result,
            maxMarks: 100,
            obtainedMarks: score,
            evaluatedBy: getRandom(trainerNames),
            remarks: 'Needs Improvement - Additional Training Recommended'
          });
          testsCreated++;
        }
      }
    }
    console.log(`✅ Created ${trainingsCreated} trainings & ${testsCreated} tests`);

    console.log('📊 Creating competency matrix...');
    const startDate = new Date();
    startDate.setFullYear(startDate.getFullYear() - 1);
    
    for (let month = 0; month < 12; month++) {
      const currentMonth = new Date(startDate.getFullYear(), startDate.getMonth() + month, 1);
      
      for (const employee of employees) {
        const trainingsCount = await Training.count({
          where: { employeeId: employee.id, trainingDate: { [Op.lte]: currentMonth } }
        });

        const testResults = await TestResult.findAll({
          where: { employeeId: employee.id, testDate: { [Op.lte]: currentMonth } }
        });

        if (testResults.length === 0) continue;

        const passedTests = testResults.filter(t => t.category === 'Pass').length;
        const avgScore = testResults.reduce((sum, t) => sum + parseFloat(t.scorePercentage), 0) / testResults.length;

        let competencyLevel = 'Basic';
        let category = 'Pass';
        if (avgScore >= 85 && passedTests >= 5) {
          competencyLevel = 'Expert';
          category = 'Pass';
        } else if (avgScore >= 75 && passedTests >= 3) {
          competencyLevel = 'Advanced';
          category = 'Pass';
        } else if (avgScore >= 65) {
          competencyLevel = 'Intermediate';
          category = 'Pass';
        } else if (avgScore >= 50) {
          category = 'Retraining';
        } else {
          category = 'Fail';
        }

        const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 
                          'July', 'August', 'September', 'October', 'November', 'December'];

        await Competency.create({
          employeeId: employee.id,
          year: currentMonth.getFullYear(),
          month: monthNames[currentMonth.getMonth()],
          aggregateScore: Math.round(avgScore),
          category: category,
          attendanceRate: Math.floor(Math.random() * 20) + 80,
          qualityScore: Math.floor(Math.random() * 20) + 75,
          safetyCompliance: Math.floor(Math.random() * 15) + 85,
          trainingCompletion: Math.round((trainingsCount / 10) * 100),
          overallPerformance: Math.round(avgScore),
          performanceRating: competencyLevel
        });
        competenciesCreated++;
      }
    }
    console.log(`✅ Created ${competenciesCreated} competency records`);

    const passCount = await TestResult.count({ where: { category: 'Pass' } });
    const retrainingCount = await TestResult.count({ where: { category: 'Retraining' } });
    const failCount = await TestResult.count({ where: { category: 'Fail' } });
    
    const stats = {
      orientations: orientationsCreated,
      trainings: trainingsCreated,
      tests: testsCreated,
      competencies: competenciesCreated,
      passRate: Math.round(passCount/testsCreated*100),
      retrainingRate: Math.round(retrainingCount/testsCreated*100),
      failRate: Math.round(failCount/testsCreated*100)
    };

    console.log('✅ Done! 🎉');

    res.json({
      success: true,
      message: 'Dummy data generated successfully',
      stats
    });

  } catch (error) {
    console.error('❌ Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const restartSystem = async (req, res) => {
  try {
    console.log('🔄 Restarting system - deleting all data...');

    await Training.destroy({ where: {}, truncate: true });
    await TestResult.destroy({ where: {}, truncate: true });
    await Competency.destroy({ where: {}, truncate: true });
    await Orientation.destroy({ where: {}, truncate: true });
    
    console.log('✅ All data deleted successfully');

    res.json({
      success: true,
      message: 'System restarted successfully. All data has been deleted.'
    });

  } catch (error) {
    console.error('❌ Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};
