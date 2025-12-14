import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Select, DatePicker, Space, Spin, Result } from 'antd';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { LockOutlined } from '@ant-design/icons';
import { trainingAPI } from '../services/api';
import dayjs from 'dayjs';

const { RangePicker } = DatePicker;
const { Option } = Select;

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

const TrainingAnalytics = ({ user }) => {
  const [trainings, setTrainings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [dateRange, setDateRange] = useState([dayjs().subtract(6, 'months'), dayjs()]);
  const [selectedDepartment, setSelectedDepartment] = useState('all');

  if (user?.type === 'employee') {
    return (
      <div style={{ padding: 24 }}>
        <Result
          icon={<LockOutlined />}
          title="Access Restricted"
          subTitle="Only trainers can view training analytics."
        />
      </div>
    );
  }

  useEffect(() => {
    fetchTrainings();
  }, []);

  const fetchTrainings = async () => {
    try {
      setLoading(true);
      const response = await trainingAPI.getAll({});
      setTrainings(response.data.data || []);
      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch trainings', error);
      setLoading(false);
    }
  };

  // Filter trainings by date range and department
  const filteredTrainings = trainings.filter(t => {
    const tDate = dayjs(t.trainingDate);
    const inRange = tDate.isAfter(dateRange[0]) && tDate.isBefore(dateRange[1]);
    const inDept = selectedDepartment === 'all' || t.Employee?.department === selectedDepartment;
    return inRange && inDept;
  });

  // Monthly training trend
  const monthlyData = {};
  filteredTrainings.forEach(t => {
    const month = dayjs(t.trainingDate).format('MMM YYYY');
    if (!monthlyData[month]) {
      monthlyData[month] = { month, trainings: 0, employees: new Set() };
    }
    monthlyData[month].trainings += 1;
    monthlyData[month].employees.add(t.employeeId);
  });
  const monthlyTrend = Object.values(monthlyData).map(d => ({
    month: d.month,
    trainings: d.trainings,
    employees: d.employees.size
  }));

  // Topic-wise distribution
  const topicData = {};
  filteredTrainings.forEach(t => {
    if (!topicData[t.trainingTopic]) {
      topicData[t.trainingTopic] = 0;
    }
    topicData[t.trainingTopic] += 1;
  });
  const topicDistribution = Object.entries(topicData)
    .map(([topic, count]) => ({ topic, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  // Department-wise training count
  const deptData = {};
  filteredTrainings.forEach(t => {
    const dept = t.Employee?.department || 'Unknown';
    if (!deptData[dept]) {
      deptData[dept] = 0;
    }
    deptData[dept] += 1;
  });
  const departmentData = Object.entries(deptData)
    .map(([department, count]) => ({ department, count }))
    .sort((a, b) => b.count - a.count);

  // Training status distribution
  const statusData = {};
  filteredTrainings.forEach(t => {
    if (!statusData[t.status]) {
      statusData[t.status] = 0;
    }
    statusData[t.status] += 1;
  });
  const statusDistribution = Object.entries(statusData).map(([status, count]) => ({ status, count }));

  // Upcoming trainings (next 30 days)
  const upcomingTrainings = trainings.filter(t => {
    const tDate = dayjs(t.trainingDate);
    return tDate.isAfter(dayjs()) && tDate.isBefore(dayjs().add(30, 'days'));
  });
  const upcomingByTopic = {};
  upcomingTrainings.forEach(t => {
    if (!upcomingByTopic[t.trainingTopic]) {
      upcomingByTopic[t.trainingTopic] = 0;
    }
    upcomingByTopic[t.trainingTopic] += 1;
  });
  const upcomingData = Object.entries(upcomingByTopic)
    .map(([topic, count]) => ({ topic, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  const departments = [...new Set(trainings.map(t => t.Employee?.department).filter(Boolean))];

  return (
    <div style={{ padding: 24 }}>
      <h1>Training Analytics & Planning</h1>
      
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

      <Spin spinning={loading}>
        <Row gutter={[16, 16]}>
          {/* Monthly Training Trend */}
          <Col span={24}>
            <Card title="Monthly Training Trend">
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={monthlyTrend}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="trainings" stroke="#8884d8" name="Training Sessions" />
                  <Line type="monotone" dataKey="employees" stroke="#82ca9d" name="Unique Employees" />
                </LineChart>
              </ResponsiveContainer>
            </Card>
          </Col>

          {/* Top Training Topics */}
          <Col span={12}>
            <Card title="Top 10 Training Topics">
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={topicDistribution} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis dataKey="topic" type="category" width={150} />
                  <Tooltip />
                  <Bar dataKey="count" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            </Card>
          </Col>

          {/* Department-wise Distribution */}
          <Col span={12}>
            <Card title="Department-wise Training Distribution">
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={departmentData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="department" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="#82ca9d" />
                </BarChart>
              </ResponsiveContainer>
            </Card>
          </Col>

          {/* Training Status */}
          <Col span={12}>
            <Card title="Training Status Distribution">
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={statusDistribution}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ status, count }) => `${status}: ${count}`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="count"
                  >
                    {statusDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </Card>
          </Col>

          {/* Upcoming Trainings (Next 30 Days) */}
          <Col span={12}>
            <Card title="Training Plan - Next 30 Days">
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={upcomingData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="topic" angle={-45} textAnchor="end" height={100} />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="#FF8042" />
                </BarChart>
              </ResponsiveContainer>
              <div style={{ marginTop: 16, fontSize: 14, color: '#666' }}>
                Total upcoming sessions: <strong>{upcomingTrainings.length}</strong>
              </div>
            </Card>
          </Col>
        </Row>
      </Spin>
    </div>
  );
};

export default TrainingAnalytics;
