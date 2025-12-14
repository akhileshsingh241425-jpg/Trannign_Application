import React, { useState, useEffect } from 'react';
import { Table, Card, Tag, DatePicker, Select, Input, Space, Statistic, Row, Col, Button, Result } from 'antd';
import { SearchOutlined, CalendarOutlined, LockOutlined } from '@ant-design/icons';
import { trainingAPI } from '../services/api';
import dayjs from 'dayjs';

const { RangePicker } = DatePicker;
const { Option } = Select;

const TrainingCalendar = ({ user }) => {
  const [trainings, setTrainings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filteredTrainings, setFilteredTrainings] = useState([]);
  const [filters, setFilters] = useState({
    dateRange: null,
    topic: '',
    trainer: '',
    search: ''
  });
  const [stats, setStats] = useState({ total: 0, topics: 0, trainers: 0 });

  if (user?.type === 'employee') {
    return (
      <div style={{ padding: 24 }}>
        <Result
          icon={<LockOutlined />}
          title="Access Restricted"
          subTitle="Only trainers can view the training calendar."
        />
      </div>
    );
  }

  useEffect(() => {
    fetchTrainings();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [trainings, filters]);

  const fetchTrainings = async () => {
    try {
      setLoading(true);
      const response = await trainingAPI.getAll({});
      const trainingsData = response.data.data || [];
      setTrainings(trainingsData);
      
      const uniqueTopics = [...new Set(trainingsData.map(t => t.trainingTopic))];
      const uniqueTrainers = [...new Set(trainingsData.map(t => t.trainer))];
      
      setStats({
        total: trainingsData.length,
        topics: uniqueTopics.length,
        trainers: uniqueTrainers.length
      });
      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch trainings', error);
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...trainings];

    if (filters.dateRange && filters.dateRange.length === 2) {
      filtered = filtered.filter(t => {
        const tDate = dayjs(t.trainingDate);
        return tDate.isAfter(filters.dateRange[0].startOf('day')) && 
               tDate.isBefore(filters.dateRange[1].endOf('day'));
      });
    }

    if (filters.topic) {
      filtered = filtered.filter(t => t.trainingTopic === filters.topic);
    }

    if (filters.trainer) {
      filtered = filtered.filter(t => t.trainer === filters.trainer);
    }

    if (filters.search) {
      filtered = filtered.filter(t => 
        t.trainingTopic?.toLowerCase().includes(filters.search.toLowerCase()) ||
        t.Employee?.fullName?.toLowerCase().includes(filters.search.toLowerCase()) ||
        t.Employee?.punchId?.toLowerCase().includes(filters.search.toLowerCase()) ||
        t.trainer?.toLowerCase().includes(filters.search.toLowerCase())
      );
    }

    setFilteredTrainings(filtered);
  };

  const columns = [
    {
      title: 'Date',
      dataIndex: 'trainingDate',
      key: 'trainingDate',
      width: 120,
      render: (date) => dayjs(date).format('DD MMM YYYY'),
      sorter: (a, b) => dayjs(a.trainingDate).unix() - dayjs(b.trainingDate).unix(),
      defaultSortOrder: 'descend'
    },
    {
      title: 'Training Topic',
      dataIndex: 'trainingTopic',
      key: 'trainingTopic',
      width: 300,
      ellipsis: true
    },
    {
      title: 'Employee',
      key: 'employee',
      width: 200,
      render: (_, record) => (
        <div>
          <div><strong>{record.Employee?.fullName}</strong></div>
          <div style={{ fontSize: 12, color: '#666' }}>{record.Employee?.punchId}</div>
        </div>
      )
    },
    {
      title: 'Department',
      dataIndex: ['Employee', 'department'],
      key: 'department',
      width: 150
    },
    {
      title: 'Trainer',
      dataIndex: 'trainer',
      key: 'trainer',
      width: 150
    },
    {
      title: 'Duration',
      dataIndex: 'duration',
      key: 'duration',
      width: 100,
      render: (duration) => `${duration} hrs`
    },
    {
      title: 'Location',
      dataIndex: 'location',
      key: 'location',
      width: 120
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status) => (
        <Tag color={status === 'Completed' ? 'green' : status === 'Scheduled' ? 'blue' : 'orange'}>
          {status}
        </Tag>
      )
    }
  ];

  const uniqueTopics = [...new Set(trainings.map(t => t.trainingTopic))].sort();
  const uniqueTrainers = [...new Set(trainings.map(t => t.trainer))].sort();

  return (
    <div style={{ padding: 24 }}>
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col span={8}>
          <Card>
            <Statistic title="Total Training Sessions" value={stats.total} prefix={<CalendarOutlined />} />
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <Statistic title="Training Topics" value={stats.topics} />
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <Statistic title="Trainers" value={stats.trainers} />
          </Card>
        </Col>
      </Row>

      <Card 
        title={<h2>Training Calendar - All Sessions</h2>}
        extra={
          <Space>
            <Button type="primary" onClick={fetchTrainings}>Refresh</Button>
          </Space>
        }
      >
        <Space direction="vertical" size="middle" style={{ width: '100%', marginBottom: 16 }}>
          <Space wrap>
            <RangePicker
              format="DD MMM YYYY"
              onChange={(dates) => setFilters({ ...filters, dateRange: dates })}
              style={{ width: 250 }}
            />
            <Select
              placeholder="Select Topic"
              style={{ width: 250 }}
              allowClear
              showSearch
              onChange={(value) => setFilters({ ...filters, topic: value })}
            >
              {uniqueTopics.map(topic => (
                <Option key={topic} value={topic}>{topic}</Option>
              ))}
            </Select>
            <Select
              placeholder="Select Trainer"
              style={{ width: 200 }}
              allowClear
              onChange={(value) => setFilters({ ...filters, trainer: value })}
            >
              {uniqueTrainers.map(trainer => (
                <Option key={trainer} value={trainer}>{trainer}</Option>
              ))}
            </Select>
            <Input
              placeholder="Search employee, topic..."
              prefix={<SearchOutlined />}
              style={{ width: 250 }}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
            />
          </Space>
        </Space>

        <Table
          columns={columns}
          dataSource={filteredTrainings}
          rowKey="id"
          loading={loading}
          pagination={{
            pageSize: 20,
            showSizeChanger: true,
            showTotal: (total) => `Total ${total} training sessions`
          }}
          scroll={{ x: 1400 }}
        />
      </Card>
    </div>
  );
};

export default TrainingCalendar;
