import db from '../models/index.js';
import { Op } from 'sequelize';

const { Employee, Training, TestResult, Competency, Orientation } = db;

const trainingTopics = [
  "Tabber & Stringer Process",
  "Rework Process",
  "EL Process, Importance & Operation (Pre/Post)",
  "Lamination Process",
  "JB & Framing Process",
  "Hi-Pot Testing process, validation & safety precaution",
  "Gautam Solar Values, Vision & Mission",
  "Handling Practices of Solar Module",
  "Proper Cleaning Process & Checking criteria",
  "Sun Simulator Operation",
  "5S Awareness",
  "Safety Awareness",
  "IQC Testing, criteria, process and specifications",
  "Preventive Maintenance & Breakdown Maintenance",
  "Production tools Awareness",
  "ISO Awareness & Implementation (ISO 9001/14001/45001/50001)",
  "Computer Skills upgradation",
  "Soft Skill Development",
  "Solar Technology Knowledge",
  "Raw Material Processing & Cutting Training",
  "Solar Module Manufacturing Process and testing",
  "Quality tools Awareness",
  "Motivational training",
  "Material & Inventory Management",
  "Legal Compliance Training",
  "IPQC Process and Checking Criteria",
  "IQC Process & Checking Criteria",
  "FQC Process & Checking Criteria",
  "General Electrical Check up - Maintenance",
  "GSPL HR policies",
  "GSPL Quality Policy & QMS Awareness",
  "Fire Fighting",
  "Process Safety Management",
  "PPEs types & its usage",
  "Excavation Safety",
  "General Work Electrical Safety",
  "First Aid",
  "Environmental Safety",
  "Risk Management and Incident Investigation & Hazard Control",
  "Emergency Response Plan",
  "Autobussing Process",
  "Functional & Department Know How Training",
  "SOP / WI Awareness",
  "Dispatch & Packaging Process"
];

const trainers = ["Rajesh Kumar", "Amit Sharma", "Priya Singh", "Sandeep Yadav", "Neha Gupta", "Vikash Verma"];
const locations = ["Line A", "Line B", "Line C", "Training Room", "Production Floor"];

const getRandom = (arr) => arr[Math.floor(Math.random() * arr.length)];

const generateTrainingCalendar = () => {
  const calendar = [];
  const startDate = new Date();
  startDate.setFullYear(startDate.getFullYear() - 1);
  
  trainingTopics.forEach((topic) => {
    for (let i = 0; i < 3; i++) {
      const month = Math.floor(Math.random() * 12);
      const day = Math.floor(Math.random() * 28) + 1;
      const trainingDate = new Date(startDate.getFullYear(), startDate.getMonth() + month, day);
      
      calendar.push({
        topic,
        date: trainingDate,
        trainer: getRandom(trainers),
        location: getRandom(locations)
      });
    }
  });
  
  return calendar.sort((a, b) => a.date - b.date);
};

const generateDummyData = async () => {
  try {
    console.log('🚀 Starting dummy data generation...\n');

    const employees = await Employee.findAll();
    console.log(`✅ Found ${employees.length} employees\n`);

    if (employees.length === 0) {
      console.log('⚠️ No employees found.');
      return;
    }

    console.log('🧹 Clearing existing data...');
    await Training.destroy({ where: {} });
    await TestResult.destroy({ where: {} });
    await Competency.destroy({ where: {} });
    await Orientation.destroy({ where: {} });
    console.log('✅ Data cleared\n');

    const trainingCalendar = generateTrainingCalendar();
    let trainingsCreated = 0, testsCreated = 0, competenciesCreated = 0, orientationsCreated = 0;

    console.log('👤 Creating orientations...');
    for (const employee of employees) {
      const orientationDate = new Date(employee.createdAt);
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
        completedBy: status === 'Completed' ? getRandom(trainers) : null
      });
      orientationsCreated++;
    }
    console.log(`✅ Created ${orientationsCreated} orientations\n`);

    console.log('📚 Creating trainings and tests...');
    for (const session of trainingCalendar) {
      const participantCount = Math.floor(Math.random() * 30) + 20;
      const participants = [...employees].sort(() => 0.5 - Math.random()).slice(0, participantCount);

      for (const employee of participants) {
        const training = await Training.create({
          employeeId: employee.id,
          trainingTopic: session.topic,
          trainingDate: session.date,
          trainer: session.trainer,
          duration: Math.floor(Math.random() * 4) + 2,
          location: session.location,
          status: 'Completed'
        });
        trainingsCreated++;

        const testDate = new Date(session.date);
        testDate.setDate(testDate.getDate() + Math.floor(Math.random() * 3) + 1);

        const random = Math.random() * 100;
        let result, score;
        
        if (random < 70) {
          result = 'Pass';
          score = Math.floor(Math.random() * 30) + 70;
        } else if (random < 90) {
          result = 'Retraining';
          score = Math.floor(Math.random() * 20) + 50;
        } else {
          result = 'Fail';
          score = Math.floor(Math.random() * 20) + 30;
        }

        await TestResult.create({
          employeeId: employee.id,
          testDate: testDate,
          testTopic: session.topic,
          scorePercentage: score,
          category: result,
          maxMarks: 100,
          obtainedMarks: score,
          evaluatedBy: getRandom(trainers)
        });
        testsCreated++;
      }
    }
    console.log(`✅ Created ${trainingsCreated} trainings & ${testsCreated} tests\n`);

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
    console.log(`✅ Created ${competenciesCreated} competency records\n`);

    const passCount = await TestResult.count({ where: { category: 'Pass' } });
    const retrainingCount = await TestResult.count({ where: { category: 'Retraining' } });
    const failCount = await TestResult.count({ where: { category: 'Fail' } });
    
    console.log('📈 Statistics:');
    console.log(`   Orientations: ${orientationsCreated}`);
    console.log(`   Trainings: ${trainingsCreated}`);
    console.log(`   Tests: ${testsCreated} (Pass: ${Math.round(passCount/testsCreated*100)}%, Retraining: ${Math.round(retrainingCount/testsCreated*100)}%, Fail: ${Math.round(failCount/testsCreated*100)}%)`);
    console.log(`   Competencies: ${competenciesCreated}\n`);

    console.log('✅ Done! 🎉\n');

  } catch (error) {
    console.error('❌ Error:', error);
  }
};

generateDummyData().then(() => process.exit(0)).catch(() => process.exit(1));
