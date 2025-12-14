import React, { useState, useEffect } from 'react';
import { Table, Card, Tag, Button, Input, Space, Modal, Form, DatePicker, Select, message } from 'antd';
import { SearchOutlined, ReloadOutlined, CheckCircleOutlined } from '@ant-design/icons';
import { testAPI, trainingAPI } from '../services/api';
import dayjs from 'dayjs';

const { TextArea } = Input;
const { Option } = Select;

const RetrainingManagement = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [form] = Form.useForm();
  const [filters, setFilters] = useState({ search: '', category: 'Fail' });

  const trainers = ["Himanshu", "Aman", "Shivshree", "Ashu", "Nikhil"];

  useEffect(() => {
    fetchFailedTests();
  }, [filters]);

  const fetchFailedTests = async () => {
    try {
      setLoading(true);
      const response = await testAPI.getAll({ 
        category: filters.category,
        search: filters.search 
      });
      
      // Group by employee and get latest failed test
      const failedTests = response.data.data || [];
      const grouped = {};
      
      failedTests.forEach(test => {
        const key = test.Employee?.punchId;
        if (!grouped[key] || new Date(test.testDate) > new Date(grouped[key].testDate)) {
          grouped[key] = test;
        }
      });
      
      setData(Object.values(grouped));
      setLoading(false);
    } catch (error) {
      console.error('Error:', error);
      message.error('Failed to fetch data');
      setLoading(false);
    }
  };

  const handleAssignRetraining = (record) => {
    setSelectedRecord(record);
    form.setFieldsValue({
      trainingDate: dayjs(),
      trainer: 'Himanshu',
      location: 'Training Room'
    });
    setModalVisible(true);
  };

  const handleSubmitRetraining = async () => {
    try {
      const values = await form.validateFields();
      
      // Create retraining record
      await trainingAPI.create({
        employeeId: selectedRecord.employeeId,
        trainingTopic: selectedRecord.testTopic + ' (Retraining)',
        trainingDate: values.trainingDate.format('YYYY-MM-DD'),
        trainer: values.trainer,
        duration: values.duration,
        location: values.location,
        status: 'Scheduled'
      });

      message.success('Retraining scheduled successfully!');
      setModalVisible(false);
      form.resetFields();
      fetchFailedTests();
    } catch (error) {
      console.error('Error:', error);
      message.error('Failed to schedule retraining');
    }
  };

  const columns = [
    {
      title: 'Punch ID',
      dataIndex: ['Employee', 'punchId'],
      key: 'punchId',
      width: 120,
      fixed: 'left'
    },
    {
      title: 'Employee Name',
      dataIndex: ['Employee', 'fullName'],
      key: 'fullName',
      width: 200,
      fixed: 'left'
    },
    {
      title: 'Department',
      dataIndex: ['Employee', 'department'],
      key: 'department',
      width: 140,
      render: (dept) => <Tag color="blue">{dept}</Tag>
    },
    {
      title: 'Test Topic',
      dataIndex: 'testTopic',
      key: 'testTopic',
      width: 250
    },
    {
      title: 'Test Date',
      dataIndex: 'testDate',
      key: 'testDate',
      width: 120,
      render: (date) => new Date(date).toLocaleDateString()
    },
    {
      title: 'Score %',
      dataIndex: 'scorePercentage',
      key: 'score',
      width: 100,
      render: (score) => (
        <Tag color={score >= 70 ? 'green' : score >= 50 ? 'orange' : 'red'}>
          {score}%
        </Tag>
      ),
      sorter: (a, b) => a.scorePercentage - b.scorePercentage
    },
    {
      title: 'Category',
      dataIndex: 'category',
      key: 'category',
      width: 120,
      render: (cat) => {
        const color = cat === 'Pass' ? 'green' : cat === 'Retraining' ? 'orange' : 'red';
        return <Tag color={color}>{cat}</Tag>;
      }
    },
    {
      title: 'Remarks',
      dataIndex: 'remarks',
      key: 'remarks',
      width: 250,
      render: (text) => text || 'No remarks'
    },
    {
      title: 'Evaluated By',
      dataIndex: 'evaluatedBy',
      key: 'evaluatedBy',
      width: 130
    },
    {
      title: 'Action',
      key: 'action',
      width: 180,
      fixed: 'right',
      render: (_, record) => (
        <Button 
          type="primary" 
          icon={<ReloadOutlined />}
          onClick={() => handleAssignRetraining(record)}
          size="small"
        >
          Assign Retraining
        </Button>
      )
    }
  ];

  return (
    <div style={{ padding: 24 }}>
      <Card title={<h2>🔄 Retraining Management</h2>}>
        <Space style={{ marginBottom: 16 }} wrap>
          <Input
            placeholder="Search by Punch ID or Name"
            prefix={<SearchOutlined />}
            style={{ width: 250 }}
            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
          />
          <Select
            value={filters.category}
            style={{ width: 200 }}
            onChange={(value) => setFilters({ ...filters, category: value })}
          >
            <Option value="Fail">Failed Only</Option>
            <Option value="Retraining">Retraining Required</Option>
            <Option value="">All</Option>
          </Select>
          <Button type="primary" icon={<CheckCircleOutlined />} onClick={fetchFailedTests}>
            Refresh
          </Button>
        </Space>

        <Table
          columns={columns}
          dataSource={data}
          rowKey="id"
          loading={loading}
          scroll={{ x: 1600 }}
          pagination={{ 
            pageSize: 20, 
            showTotal: (total) => `Total ${total} employees requiring retraining` 
          }}
        />
      </Card>

      {/* Assign Retraining Modal */}
      <Modal
        title="📚 Assign Retraining"
        open={modalVisible}
        onCancel={() => {
          setModalVisible(false);
          form.resetFields();
        }}
        onOk={handleSubmitRetraining}
        width={600}
      >
        <Form form={form} layout="vertical">
          <Form.Item label="Employee">
            <Input 
              value={selectedRecord?.Employee?.fullName + ' (' + selectedRecord?.Employee?.punchId + ')'} 
              disabled 
            />
          </Form.Item>
          
          <Form.Item label="Failed Topic">
            <Input value={selectedRecord?.testTopic} disabled />
          </Form.Item>
          
          <Form.Item label="Previous Score">
            <Tag color="red">{selectedRecord?.scorePercentage}%</Tag>
          </Form.Item>

          <Form.Item
            label="Retraining Date"
            name="trainingDate"
            rules={[{ required: true, message: 'Please select date' }]}
          >
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item
            label="Trainer"
            name="trainer"
            rules={[{ required: true, message: 'Please select trainer' }]}
          >
            <Select>
              {trainers.map(trainer => (
                <Option key={trainer} value={trainer}>{trainer}</Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            label="Duration (hours)"
            name="duration"
            rules={[{ required: true, message: 'Please enter duration' }]}
          >
            <Input type="number" min={1} max={8} />
          </Form.Item>

          <Form.Item
            label="Location"
            name="location"
            rules={[{ required: true, message: 'Please enter location' }]}
          >
            <Select>
              <Option value="Training Room">Training Room</Option>
              <Option value="Line A">Line A</Option>
              <Option value="Line B">Line B</Option>
              <Option value="Line C">Line C</Option>
              <Option value="Production Floor">Production Floor</Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default RetrainingManagement;
