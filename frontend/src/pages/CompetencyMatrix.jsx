import React, { useState, useEffect } from 'react';
import { Table, Card, Select, Tag, Button, Input, Space, DatePicker } from 'antd';
import { SearchOutlined, DownloadOutlined } from '@ant-design/icons';
import { competencyAPI } from '../services/api';
import './CompetencyMatrix.css';
import dayjs from 'dayjs';

const { Option } = Select;

const CompetencyMatrix = ({ user }) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({ department: '', search: '', month: '', punchId: '' });

  const departments = ['QUALITY', 'PRODUCTION', 'MAINTENANCE', 'DISPATCH', 'HOUSEKEEPING', 'PACKAGING', 'STORES'];
  const isEmployee = user?.type === 'employee';

  useEffect(() => {
    fetchData();
  }, [filters, user]);

  const fetchData = async () => {
    try {
      setLoading(true);
      // For employees, always add punchId to filters
      const employeeFilters = isEmployee 
        ? { ...filters, punchId: user.punchId } 
        : filters;
      const response = await competencyAPI.getMatrix(employeeFilters);
      setData(response.data.data);
      setLoading(false);
    } catch (error) {
      console.error('Error:', error);
      setLoading(false);
    }
  };

  const columns = [
    ...(!isEmployee ? [{
      title: 'Punch ID',
      dataIndex: ['Employee', 'punchId'],
      key: 'punchId',
      width: 120,
      fixed: 'left'
    }] : []),
    ...(!isEmployee ? [{
      title: 'Name',
      dataIndex: ['Employee', 'fullName'],
      key: 'fullName',
      width: 180,
      fixed: 'left'
    }] : []),
    ...(!isEmployee ? [{
      title: 'Department',
      dataIndex: ['Employee', 'department'],
      key: 'department',
      width: 140,
      render: (dept) => <Tag color="blue">{dept}</Tag>
    }] : []),
    ...(!isEmployee ? [{
      title: 'Designation',
      dataIndex: ['Employee', 'designation'],
      key: 'designation',
      width: 180
    }] : []),
    ...(!isEmployee ? [{
      title: 'Work Location',
      dataIndex: ['Employee', 'workLocation'],
      key: 'workLocation',
      width: 150
    }] : []),
    ...(!isEmployee ? [{
      title: 'DOJ',
      dataIndex: ['Employee', 'dateOfJoining'],
      key: 'doj',
      width: 120,
      render: (date) => date ? new Date(date).toLocaleDateString() : 'N/A'
    }] : []),
    {
      title: 'Score %',
      dataIndex: 'aggregateScore',
      key: 'score',
      width: 100,
      render: (score) => <strong>{score?.toFixed(1)}%</strong>,
      sorter: (a, b) => a.aggregateScore - b.aggregateScore
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
      title: 'Attendance %',
      dataIndex: 'attendanceRate',
      key: 'attendance',
      width: 120,
      render: (val) => `${val?.toFixed(1)}%`
    },
    {
      title: 'Quality %',
      dataIndex: 'qualityScore',
      key: 'quality',
      width: 100,
      render: (val) => `${val?.toFixed(1)}%`
    },
    {
      title: 'Safety %',
      dataIndex: 'safetyCompliance',
      key: 'safety',
      width: 100,
      render: (val) => `${val?.toFixed(1)}%`
    },
    {
      title: 'Training %',
      dataIndex: 'trainingCompletion',
      key: 'training',
      width: 110,
      render: (val) => `${val?.toFixed(1)}%`
    },
    {
      title: 'Overall %',
      dataIndex: 'overallPerformance',
      key: 'overall',
      width: 100,
      render: (val) => `${val?.toFixed(1)}%`
    },
    {
      title: 'Rating',
      dataIndex: 'performanceRating',
      key: 'rating',
      width: 120
    }
  ];

  return (
    <div style={{ padding: 24 }}>
      <Card title={
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2>{isEmployee ? 'My Competency' : 'Competency Matrix'}</h2>
          <span style={{ fontSize: 14, color: '#666', fontWeight: 'normal' }}>GSPL/HR/CM/002</span>
        </div>
      }>
        {!isEmployee && (
          <Space style={{ marginBottom: 16 }} wrap>
            <Input
              placeholder="Search by Name"
              prefix={<SearchOutlined />}
              style={{ width: 200 }}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
            />
            <Input
              placeholder="Search by Punch ID"
              prefix={<SearchOutlined />}
              style={{ width: 180 }}
              onChange={(e) => setFilters({ ...filters, punchId: e.target.value })}
            />
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
            <DatePicker 
              picker="month"
              placeholder="Select Month"
              style={{ width: 180 }}
              onChange={(date) => setFilters({ ...filters, month: date ? date.format('YYYY-MM') : '' })}
            />
            <Button type="primary" icon={<DownloadOutlined />}>
              Export to Excel
            </Button>
          </Space>
        )}

        <Table
          columns={columns}
          dataSource={data}
          rowKey="id"
          loading={loading}
          scroll={{ x: 1800 }}
          pagination={{ pageSize: 20, showTotal: (total) => `Total ${total} employees` }}
          rowClassName={(record) => {
            if (record.category === 'Pass') return 'row-pass';
            if (record.category === 'Retraining') return 'row-retraining';
            if (record.category === 'Fail') return 'row-fail';
            return '';
          }}
        />
      </Card>
    </div>
  );
};

export default CompetencyMatrix;
