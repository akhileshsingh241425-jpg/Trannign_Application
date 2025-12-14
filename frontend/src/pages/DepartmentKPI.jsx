import React, { useState, useEffect } from 'react';
import { Card, Table, Row, Col, Statistic, Progress, Tag, Select, DatePicker, Space, Result } from 'antd';
import { ArrowUpOutlined, ArrowDownOutlined, CheckCircleOutlined, ClockCircleOutlined, LockOutlined } from '@ant-design/icons';
import { trainingAPI, testAPI, employeeAPI } from '../services/api';
import dayjs from 'dayjs';

const { RangePicker } = DatePicker;
const { Option } = Select;

const DepartmentKPI = ({ user }) => {
  if (user?.type === 'employee') {
    return (
      <div style={{ padding: 24 }}>
        <Result
          icon={<LockOutlined />}
          title="Access Restricted"
          subTitle="Only trainers can view department KPIs."
        />
      </div>
    );
  }
  const [employees, setEmployees] = useState([]);
  const [trainings, setTrainings] = useState([]);
  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [dateRange, setDateRange] = useState([dayjs().subtract(3, 'months'), dayjs()]);
  const [selectedDepartment, setSelectedDepartment] = useState('all');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [empRes, trainRes, testRes] = await Promise.all([
        employeeAPI.getAll({}),
        trainingAPI.getAll({}),
        testAPI.getAll({})
      ]);
      setEmployees(empRes.data.data || []);
      setTrainings(trainRes.data.data || []);
      setTests(testRes.data.data || []);
      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch data', error);
      setLoading(false);
    }
  };

  // Filter by date range
  const filteredTrainings = trainings.filter(t => {
    const tDate = dayjs(t.trainingDate);
    return tDate.isAfter(dateRange[0]) && tDate.isBefore(dateRange[1]);
  });

  const filteredTests = tests.filter(t => {
    const tDate = dayjs(t.testDate);
    return tDate.isAfter(dateRange[0]) && tDate.isBefore(dateRange[1]);
  });

  // Group by department
  const departments = [...new Set(employees.map(e => e.department).filter(Boolean))];
  
  const departmentKPIs = departments.map(dept => {
    const deptEmployees = employees.filter(e => e.department === dept);
    const deptTrainings = filteredTrainings.filter(t => {
      const emp = employees.find(e => e.id === t.employeeId);
      return emp?.department === dept;
    });
    const deptTests = filteredTests.filter(t => {
      const emp = employees.find(e => e.id === t.employeeId);
      return emp?.department === dept;
    });

    const totalEmployees = deptEmployees.length;
    const totalTrainings = deptTrainings.length;
    const completedTrainings = deptTrainings.filter(t => t.status === 'Completed').length;
    const avgTrainingPerEmployee = totalEmployees > 0 ? (totalTrainings / totalEmployees).toFixed(2) : 0;

    const passedTests = deptTests.filter(t => t.result === 'Pass').length;
    const failedTests = deptTests.filter(t => t.result === 'Fail').length;
    const retrainingTests = deptTests.filter(t => t.result === 'Retraining Required').length;
    const totalTests = deptTests.length;
    const passRate = totalTests > 0 ? ((passedTests / totalTests) * 100).toFixed(1) : 0;

    // Calculate average score
    const avgScore = deptTests.length > 0 
      ? (deptTests.reduce((sum, t) => sum + (t.scorePercentage || 0), 0) / deptTests.length).toFixed(1)
      : 0;

    // Training completion rate
    const completionRate = totalTrainings > 0 ? ((completedTrainings / totalTrainings) * 100).toFixed(1) : 0;

    // Unique training topics
    const uniqueTopics = [...new Set(deptTrainings.map(t => t.trainingTopic))].length;

    return {
      department: dept,
      totalEmployees,
      totalTrainings,
      completedTrainings,
      avgTrainingPerEmployee: parseFloat(avgTrainingPerEmployee),
      passRate: parseFloat(passRate),
      avgScore: parseFloat(avgScore),
      completionRate: parseFloat(completionRate),
      passedTests,
      failedTests,
      retrainingTests,
      totalTests,
      uniqueTopics
    };
  });

  // Filter by selected department
  const displayKPIs = selectedDepartment === 'all' 
    ? departmentKPIs 
    : departmentKPIs.filter(d => d.department === selectedDepartment);

  // Overall KPIs
  const overallKPIs = {
    totalEmployees: employees.length,
    totalTrainings: filteredTrainings.length,
    totalTests: filteredTests.length,
    avgPassRate: departmentKPIs.length > 0 
      ? (departmentKPIs.reduce((sum, d) => sum + d.passRate, 0) / departmentKPIs.length).toFixed(1)
      : 0,
    avgCompletionRate: departmentKPIs.length > 0
      ? (departmentKPIs.reduce((sum, d) => sum + d.completionRate, 0) / departmentKPIs.length).toFixed(1)
      : 0
  };

  const columns = [
    {
      title: 'Department',
      dataIndex: 'department',
      key: 'department',
      fixed: 'left',
      width: 150
    },
    {
      title: 'Employees',
      dataIndex: 'totalEmployees',
      key: 'totalEmployees',
      width: 100,
      sorter: (a, b) => a.totalEmployees - b.totalEmployees
    },
    {
      title: 'Total Trainings',
      dataIndex: 'totalTrainings',
      key: 'totalTrainings',
      width: 120,
      sorter: (a, b) => a.totalTrainings - b.totalTrainings
    },
    {
      title: 'Completed',
      dataIndex: 'completedTrainings',
      key: 'completedTrainings',
      width: 100
    },
    {
      title: 'Avg Training/Employee',
      dataIndex: 'avgTrainingPerEmployee',
      key: 'avgTrainingPerEmployee',
      width: 180,
      sorter: (a, b) => a.avgTrainingPerEmployee - b.avgTrainingPerEmployee,
      render: (val) => <strong>{val}</strong>
    },
    {
      title: 'Completion Rate',
      dataIndex: 'completionRate',
      key: 'completionRate',
      width: 150,
      sorter: (a, b) => a.completionRate - b.completionRate,
      render: (rate) => (
        <Progress 
          percent={rate} 
          size="small" 
          status={rate >= 80 ? 'success' : rate >= 60 ? 'normal' : 'exception'}
        />
      )
    },
    {
      title: 'Pass Rate',
      dataIndex: 'passRate',
      key: 'passRate',
      width: 120,
      sorter: (a, b) => a.passRate - b.passRate,
      render: (rate) => (
        <Tag color={rate >= 80 ? 'green' : rate >= 60 ? 'orange' : 'red'}>
          {rate}%
        </Tag>
      )
    },
    {
      title: 'Avg Score',
      dataIndex: 'avgScore',
      key: 'avgScore',
      width: 100,
      sorter: (a, b) => a.avgScore - b.avgScore,
      render: (score) => `${score}%`
    },
    {
      title: 'Tests (P/R/F)',
      key: 'testResults',
      width: 150,
      render: (_, record) => (
        <span>
          <Tag color="green">{record.passedTests}</Tag>
          <Tag color="orange">{record.retrainingTests}</Tag>
          <Tag color="red">{record.failedTests}</Tag>
        </span>
      )
    },
    {
      title: 'Topics Covered',
      dataIndex: 'uniqueTopics',
      key: 'uniqueTopics',
      width: 130,
      sorter: (a, b) => a.uniqueTopics - b.uniqueTopics
    }
  ];

  return (
    <div style={{ padding: 24 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h1>Department-wise Training KPIs</h1>
        <span style={{ fontSize: 16, color: '#666' }}>GSPL/HR/KPI/001</span>
      </div>
      
      <Space style={{ marginBottom: 24 }} wrap>
        <RangePicker
          value={dateRange}
          onChange={(dates) => setDateRange(dates)}
          format="DD MMM YYYY"
        />
        <Select
          value={selectedDepartment}
          onChange={setSelectedDepartment}
          style={{ width: 200 }}
        >
          <Option value="all">All Departments</Option>
          {departments.map(dept => (
            <Option key={dept} value={dept}>{dept}</Option>
          ))}
        </Select>
      </Space>

      {/* Overall Stats */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col span={6}>
          <Card>
            <Statistic
              title="Total Employees"
              value={overallKPIs.totalEmployees}
              prefix={<CheckCircleOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Total Trainings"
              value={overallKPIs.totalTrainings}
              prefix={<ClockCircleOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Avg Pass Rate"
              value={overallKPIs.avgPassRate}
              suffix="%"
              valueStyle={{ color: overallKPIs.avgPassRate >= 70 ? '#3f8600' : '#cf1322' }}
              prefix={overallKPIs.avgPassRate >= 70 ? <ArrowUpOutlined /> : <ArrowDownOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Avg Completion Rate"
              value={overallKPIs.avgCompletionRate}
              suffix="%"
              valueStyle={{ color: overallKPIs.avgCompletionRate >= 70 ? '#3f8600' : '#cf1322' }}
              prefix={overallKPIs.avgCompletionRate >= 70 ? <ArrowUpOutlined /> : <ArrowDownOutlined />}
            />
          </Card>
        </Col>
      </Row>

      {/* Department KPI Table */}
      <Card title="Department Performance Metrics">
        <Table
          columns={columns}
          dataSource={displayKPIs}
          rowKey="department"
          loading={loading}
          pagination={false}
          scroll={{ x: 1400 }}
        />
      </Card>
    </div>
  );
};

export default DepartmentKPI;
