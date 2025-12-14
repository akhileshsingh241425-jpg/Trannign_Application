import React, { useState, useEffect } from 'react';
import { Table, Card, Select, Tag, DatePicker, Space, Button, Statistic, Row, Col } from 'antd';
import { FileTextOutlined, CheckCircleOutlined, SyncOutlined, CloseCircleOutlined } from '@ant-design/icons';
import { testAPI } from '../services/api';
import dayjs from 'dayjs';

const { Option } = Select;
const { RangePicker } = DatePicker;

const TestResults = ({ user }) => {
  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({});
  const [filters, setFilters] = useState({});

  const departments = ['QUALITY', 'PRODUCTION', 'MAINTENANCE', 'DISPATCH', 'HOUSEKEEPING', 'PACKAGING', 'STORES'];
  const isEmployee = user?.type === 'employee';

  useEffect(() => {
    fetchTests();
    fetchStats();
  }, [filters]);

  const fetchTests = async () => {
    try {
      setLoading(true);
      const employeeFilters = isEmployee ? { punchId: user.punchId, ...filters } : filters;
      const response = await testAPI.getAll(employeeFilters);
      setTests(response.data.data);
      setLoading(false);
    } catch (error) {
      console.error('Error:', error);
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await testAPI.getStats();
      setStats(response.data.data);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const columns = [
    ...(!isEmployee ? [{
      title: 'Punch ID',
      dataIndex: ['Employee', 'punchId'],
      key: 'punchId',
      width: 120
    }] : []),
    ...(!isEmployee ? [{
      title: 'Name',
      dataIndex: ['Employee', 'fullName'],
      key: 'fullName',
      width: 180
    }] : []),
    ...(!isEmployee ? [{
      title: 'Department',
      dataIndex: ['Employee', 'department'],
      key: 'department',
      width: 140,
      render: (dept) => <Tag color="blue">{dept}</Tag>
    }] : []),
    {
      title: 'Test Date',
      dataIndex: 'testDate',
      key: 'testDate',
      width: 120,
      render: (date) => dayjs(date).format('DD-MM-YYYY'),
      sorter: (a, b) => new Date(a.testDate) - new Date(b.testDate)
    },
    {
      title: 'Test Topic',
      dataIndex: 'testTopic',
      key: 'testTopic',
      width: 300
    },
    {
      title: 'Score %',
      dataIndex: 'scorePercentage',
      key: 'score',
      width: 100,
      render: (score) => <strong>{score?.toFixed(1)}%</strong>,
      sorter: (a, b) => a.scorePercentage - b.scorePercentage
    },
    {
      title: 'Marks',
      key: 'marks',
      width: 120,
      render: (_, record) => `${record.obtainedMarks}/${record.maxMarks}`
    },
    {
      title: 'Category',
      dataIndex: 'category',
      key: 'category',
      width: 120,
      render: (cat) => {
        const color = cat === 'Pass' ? 'green' : cat === 'Retraining' ? 'orange' : 'red';
        return <Tag color={color}>{cat}</Tag>;
      },
      filters: [
        { text: 'Pass', value: 'Pass' },
        { text: 'Retraining', value: 'Retraining' },
        { text: 'Fail', value: 'Fail' }
      ],
      onFilter: (value, record) => record.category === value
    },
    {
      title: 'Remarks',
      dataIndex: 'remarks',
      key: 'remarks',
      width: 200
    }
  ];

  return (
    <div style={{ padding: 24 }}>
      {!isEmployee && (
        <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
          <Col xs={24} sm={12} md={6}>
            <Card bordered={false}>
              <Statistic
                title="Total Tests"
                value={stats.total || 0}
                prefix={<FileTextOutlined />}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card bordered={false}>
              <Statistic
                title="Pass"
                value={stats.pass || 0}
                prefix={<CheckCircleOutlined />}
                valueStyle={{ color: '#52c41a' }}
                suffix={`(${stats.passRate || 0}%)`}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card bordered={false}>
              <Statistic
                title="Retraining"
                value={stats.retraining || 0}
                prefix={<SyncOutlined />}
                valueStyle={{ color: '#fa8c16' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card bordered={false}>
              <Statistic
                title="Fail"
                value={stats.fail || 0}
                prefix={<CloseCircleOutlined />}
                valueStyle={{ color: '#f5222d' }}
              />
            </Card>
          </Col>
        </Row>
      )}

      <Card title={<h2>{isEmployee ? 'My Test Results' : 'Test Results'}</h2>}>
        {!isEmployee && (
          <Space style={{ marginBottom: 16 }} wrap>
            <Select
              placeholder="Select Category"
              style={{ width: 150 }}
              allowClear
              onChange={(value) => setFilters({ ...filters, category: value || '' })}
            >
              <Option value="Pass">Pass</Option>
              <Option value="Retraining">Retraining</Option>
              <Option value="Fail">Fail</Option>
            </Select>
            <Select
              placeholder="Select Department"
              style={{ width: 200 }}
              allowClear
              onChange={(value) => setFilters({ ...filters, department: value || '' })}
            >
              {departments.map(dept => (
                <Option key={dept} value={dept}>{dept}</Option>
              ))}
            </Select>
          </Space>
        )}

        <Table
          columns={columns}
          dataSource={tests}
          rowKey="id"
          loading={loading}
          scroll={{ x: 1400 }}
          pagination={{ pageSize: 20 }}
        />
      </Card>
    </div>
  );
};

export default TestResults;
