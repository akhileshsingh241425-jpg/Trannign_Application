import React, { useState, useEffect } from 'react';
import { Card, Table, Spin, message, DatePicker, Select, Statistic, Row, Col, Tag } from 'antd';
import { UserOutlined, CalendarOutlined, ClockCircleOutlined } from '@ant-design/icons';
import { trainingAPI } from '../services/api';
import dayjs from 'dayjs';
import isBetween from 'dayjs/plugin/isBetween';
import './TrainerDashboard.css';

dayjs.extend(isBetween);

const { RangePicker } = DatePicker;
const { Option } = Select;

const TrainerDashboard = () => {
  const [loading, setLoading] = useState(false);
  const [trainings, setTrainings] = useState([]);
  const [trainerStats, setTrainerStats] = useState([]);
  const [selectedTrainer, setSelectedTrainer] = useState('all');
  const [dateRange, setDateRange] = useState([dayjs().subtract(6, 'months'), dayjs('2026-01-31')]);

  const trainers = [
    'Himanshu', 'Aman', 'Shivshree', 'Ashu', 'Nikhil',
    'Anis', 'Jay Prakesh', 'Aman Kushwah'
  ];

  useEffect(() => {
    fetchTrainerData();
  }, [selectedTrainer, dateRange]);

  const fetchTrainerData = async () => {
    setLoading(true);
    try {
      const response = await trainingAPI.getAll();
      console.log('Trainer Dashboard Response:', response);
      let data = response.data?.data || response.data || [];

      // Filter by date range
      if (dateRange && dateRange[0] && dateRange[1]) {
        data = data.filter(training => {
          const trainingDate = dayjs(training.trainingDate);
          return trainingDate.isBetween(dateRange[0], dateRange[1], 'day', '[]');
        });
      }

      // Filter by trainer if selected
      if (selectedTrainer !== 'all') {
        data = data.filter(training => training.trainer === selectedTrainer);
      }

      console.log('Filtered Training Data:', data);
      setTrainings(data);
      calculateTrainerStats(data);
    } catch (error) {
      console.error('Error fetching trainer data:', error);
      message.error('Failed to fetch trainer data: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const calculateTrainerStats = (data) => {
    const stats = {};
    
    trainers.forEach(trainer => {
      const trainerTrainings = data.filter(t => t.trainer === trainer);
      const completed = trainerTrainings.filter(t => t.status === 'Completed').length;
      const upcoming = trainerTrainings.filter(t => 
        dayjs(t.trainingDate).isAfter(dayjs()) && t.status !== 'Completed'
      ).length;
      const totalHours = trainerTrainings.reduce((sum, t) => sum + (t.duration || 0), 0);

      stats[trainer] = {
        trainer,
        totalTrainings: trainerTrainings.length,
        completed,
        upcoming,
        totalHours: totalHours.toFixed(1)
      };
    });

    setTrainerStats(Object.values(stats));
  };

  const trainerColumns = [
    {
      title: 'Trainer Name',
      dataIndex: 'trainer',
      key: 'trainer',
      fixed: 'left',
      render: (text) => <strong>{text}</strong>
    },
    {
      title: 'Total Trainings',
      dataIndex: 'totalTrainings',
      key: 'totalTrainings',
      sorter: (a, b) => a.totalTrainings - b.totalTrainings,
      render: (val) => <Tag color="blue">{val}</Tag>
    },
    {
      title: 'Completed',
      dataIndex: 'completed',
      key: 'completed',
      sorter: (a, b) => a.completed - b.completed,
      render: (val) => <Tag color="green">{val}</Tag>
    },
    {
      title: 'Upcoming',
      dataIndex: 'upcoming',
      key: 'upcoming',
      sorter: (a, b) => a.upcoming - b.upcoming,
      render: (val) => <Tag color="orange">{val}</Tag>
    },
    {
      title: 'Total Hours',
      dataIndex: 'totalHours',
      key: 'totalHours',
      sorter: (a, b) => parseFloat(a.totalHours) - parseFloat(b.totalHours),
      render: (val) => `${val} hrs`
    }
  ];

  const trainingColumns = [
    {
      title: 'Date',
      dataIndex: 'trainingDate',
      key: 'trainingDate',
      render: (date) => dayjs(date).format('DD MMM YYYY'),
      sorter: (a, b) => dayjs(a.trainingDate).unix() - dayjs(b.trainingDate).unix()
    },
    {
      title: 'Topic',
      dataIndex: 'trainingTopic',
      key: 'trainingTopic',
      width: 250
    },
    {
      title: 'Trainer',
      dataIndex: 'trainer',
      key: 'trainer'
    },
    {
      title: 'Duration',
      dataIndex: 'duration',
      key: 'duration',
      render: (duration) => {
        if (!duration) return 'N/A';
        if (duration === 0.5) return '30 min';
        if (duration === 0.75) return '45 min';
        if (duration === 1.0) return '60 min';
        if (duration === 1.5) return '90 min';
        
        const hours = Math.floor(duration);
        const minutes = Math.round((duration - hours) * 60);
        return hours > 0 
          ? `${hours}h ${minutes > 0 ? minutes + 'm' : ''}`
          : `${minutes}m`;
      }
    },
    {
      title: 'Location',
      dataIndex: 'location',
      key: 'location'
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => {
        const color = status === 'Completed' ? 'green' : 
                     status === 'Scheduled' ? 'blue' : 'default';
        return <Tag color={color}>{status}</Tag>;
      }
    }
  ];

  const totalCompleted = trainerStats.reduce((sum, t) => sum + t.completed, 0);
  const totalUpcoming = trainerStats.reduce((sum, t) => sum + t.upcoming, 0);
  const totalHours = trainerStats.reduce((sum, t) => sum + parseFloat(t.totalHours), 0);

  return (
    <div className="trainer-dashboard">
      <Card className="header-card">
        <h2 style={{ marginBottom: 0 }}>
          <UserOutlined /> Trainer Dashboard
        </h2>
        <p style={{ color: '#666', marginTop: 8 }}>
          Training statistics and upcoming sessions
        </p>
      </Card>

      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col span={6}>
          <Card>
            <Statistic
              title="Total Trainers"
              value={trainers.length}
              prefix={<UserOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Completed Trainings"
              value={totalCompleted}
              valueStyle={{ color: '#3f8600' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Upcoming Trainings"
              value={totalUpcoming}
              valueStyle={{ color: '#cf1322' }}
              prefix={<CalendarOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Total Hours"
              value={totalHours.toFixed(1)}
              suffix="hrs"
              prefix={<ClockCircleOutlined />}
            />
          </Card>
        </Col>
      </Row>

      <Card 
        title="Filter Options"
        style={{ marginBottom: 24 }}
      >
        <Row gutter={16}>
          <Col span={12}>
            <label>Trainer:</label>
            <Select
              style={{ width: '100%', marginTop: 8 }}
              value={selectedTrainer}
              onChange={setSelectedTrainer}
              placeholder="Select Trainer"
            >
              <Option value="all">All Trainers</Option>
              {trainers.map(trainer => (
                <Option key={trainer} value={trainer}>{trainer}</Option>
              ))}
            </Select>
          </Col>
          <Col span={12}>
            <label>Date Range:</label>
            <RangePicker
              style={{ width: '100%', marginTop: 8 }}
              value={dateRange}
              onChange={setDateRange}
              format="DD MMM YYYY"
            />
          </Col>
        </Row>
      </Card>

      <Card 
        title="Trainer Statistics"
        style={{ marginBottom: 24 }}
      >
        <Table
          columns={trainerColumns}
          dataSource={trainerStats}
          loading={loading}
          rowKey="trainer"
          pagination={false}
          scroll={{ x: 800 }}
        />
      </Card>

      <Card title={`Training Sessions (${trainings.length})`}>
        <Table
          columns={trainingColumns}
          dataSource={trainings}
          loading={loading}
          rowKey="id"
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total) => `Total ${total} trainings`
          }}
          scroll={{ x: 1000 }}
        />
      </Card>
    </div>
  );
};

export default TrainerDashboard;
