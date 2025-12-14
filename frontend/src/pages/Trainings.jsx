import React, { useState, useEffect } from 'react';
import { Table, Card, Button, Modal, Form, Input, DatePicker, Select, message, Tag, Space } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, CalendarOutlined } from '@ant-design/icons';
import { trainingAPI } from '../services/api';
import dayjs from 'dayjs';

const { Option } = Select;
const { TextArea } = Input;

const trainingTopics = [
  'Tabber & Stringer Process',
  'Rework Process',
  'EL Process, Importance & Operation (Pre/Post)',
  'Lamination Process',
  'JB & Framing Process',
  'Hi-PotTesting process ,validation & safety precaution',
  'Gautam Solar Values, Vision & Mission',
  'Handling Practices of Solar Module',
  'Proper Cleaning Process & Checking criteria',
  'Sun Simulator Operation',
  '5 "S" Awareness (5S)',
  'Safety Awareness',
  'IQC Testing , criteria, process and specifications',
  'Preventive Maintenance & Breakdown Maintenance',
  'Production tools Awareness',
  'ISO Awareness & Implementation (ISO 9001 / ISO 14001 / ISO 45001 /50001)',
  'Computer Skills upgradation',
  'Soft Skill Development',
  'Solar Technology Knowledge',
  'Raw Material Processing & Cutting Training',
  'Solar Module Manufacturing Process and testing',
  'Quality tools Awareness',
  'Motivational training',
  'Material & Inventory Management',
  'Legal Compliance Training',
  'IPQC Process and Checking Criteria',
  'IQC Process & Checking Criteria',
  'FQC Process & Checking Criteria',
  'General Electrical Check up - Maintenance',
  'GSPL HR policies',
  'GSPL Quality Policy & QMS Awareness',
  'Fire Fighting',
  'Process Safety Management',
  'PPEs types & its usage',
  'Excavation Safety',
  'General Work Electrical Safety',
  'First Aid',
  'Environmental Safety',
  'Risk Management and Incident Investigation & Hazard Control',
  'Emergency Response Plan',
  'Autobussing Process',
  'Functional & Department Know How Training',
  'SOP / WI Awareness',
  'Dispatch & Packaging Process'
];

const Trainings = ({ user }) => {
  const [trainings, setTrainings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentRecord, setCurrentRecord] = useState(null);
  const [form] = Form.useForm();

  const isEmployee = user?.type === 'employee';

  useEffect(() => {
    fetchTrainings();
  }, []);

  const fetchTrainings = async () => {
    try {
      setLoading(true);
      const filters = isEmployee ? { punchId: user.punchId } : {};
      const response = await trainingAPI.getAll(filters);
      setTrainings(response.data.data);
      setLoading(false);
    } catch (error) {
      message.error('Failed to fetch trainings');
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setEditMode(false);
    setCurrentRecord(null);
    form.resetFields();
    setModalVisible(true);
  };

  const handleEdit = (record) => {
    setEditMode(true);
    setCurrentRecord(record);
    form.setFieldsValue({
      ...record,
      trainingDate: dayjs(record.trainingDate)
    });
    setModalVisible(true);
  };

  const handleDelete = async (id) => {
    try {
      await trainingAPI.delete(id);
      message.success('Training deleted successfully');
      fetchTrainings();
    } catch (error) {
      message.error('Failed to delete training');
    }
  };

  const handleSubmit = async (values) => {
    try {
      const data = {
        ...values,
        trainingDate: values.trainingDate.format('YYYY-MM-DD')
      };

      if (editMode) {
        await trainingAPI.update(currentRecord.id, data);
        message.success('Training updated successfully');
      } else {
        await trainingAPI.create(data);
        message.success('Training created successfully');
      }
      
      setModalVisible(false);
      form.resetFields();
      fetchTrainings();
    } catch (error) {
      message.error('Operation failed');
    }
  };

  const columns = [
    {
      title: 'Employee',
      dataIndex: ['Employee', 'fullName'],
      key: 'employee',
      width: 200,
      render: (text, record) => (
        <div>
          <div>{text}</div>
          <div style={{ fontSize: 12, color: '#888' }}>{record.Employee?.punchId}</div>
        </div>
      )
    },
    {
      title: 'Training Topic',
      dataIndex: 'trainingTopic',
      key: 'trainingTopic',
      width: 300
    },
    {
      title: 'Training Date',
      dataIndex: 'trainingDate',
      key: 'trainingDate',
      width: 120,
      render: (date) => dayjs(date).format('DD-MM-YYYY')
    },
    {
      title: 'Duration',
      dataIndex: 'duration',
      key: 'duration',
      width: 100,
      render: (duration) => {
        if (!duration) return 'N/A';
        if (duration === 0.5) return '30 min';
        if (duration === 0.75) return '45 min';
        if (duration === 1.0) return '60 min';
        if (duration === 1.5) return '90 min';
        return duration + ' hrs';
      }
    },
    {
      title: 'Trainer',
      dataIndex: 'trainer',
      key: 'trainer',
      width: 150
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      width: 120,
      render: (status) => {
        const color = status === 'Completed' ? 'green' : status === 'Scheduled' ? 'blue' : 'red';
        return <Tag color={color}>{status}</Tag>;
      }
    },
    ...(!isEmployee ? [{
      title: 'Actions',
      key: 'actions',
      width: 150,
      render: (_, record) => (
        <Space>
          <Button type="link" icon={<EditOutlined />} onClick={() => handleEdit(record)}>
            Edit
          </Button>
          <Button type="link" danger icon={<DeleteOutlined />} onClick={() => handleDelete(record.id)}>
            Delete
          </Button>
        </Space>
      )
    }] : [])
  ];

  return (
    <div style={{ padding: 24 }}>
      <Card 
        title={
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
            <h2><CalendarOutlined /> {isEmployee ? 'My Trainings' : 'Training Management'}</h2>
            <span style={{ fontSize: 14, color: '#666', fontWeight: 'normal' }}>GSPL/HR/TAS/012</span>
          </div>
        }
        extra={
          !isEmployee && (
            <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
              Add Training
            </Button>
          )
        }
      >
        <Table
          columns={columns}
          dataSource={trainings}
          rowKey="id"
          loading={loading}
          scroll={{ x: 1400 }}
          pagination={{ pageSize: 20 }}
        />
      </Card>

      <Modal
        title={editMode ? 'Edit Training' : 'Add Training'}
        visible={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={null}
        width={700}
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Form.Item
            label="Employee ID"
            name="employeeId"
            rules={[{ required: true, message: 'Please enter employee ID' }]}
          >
            <Input placeholder="Enter employee ID" type="number" />
          </Form.Item>

          <Form.Item
            label="Training Topic"
            name="trainingTopic"
            rules={[{ required: true, message: 'Please select training topic' }]}
          >
            <Select
              placeholder="Select training topic"
              showSearch
              filterOption={(input, option) =>
                option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
              }
            >
              {trainingTopics.map((topic, index) => (
                <Option key={index} value={topic}>{index + 1}. {topic}</Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            label="Training Date"
            name="trainingDate"
            rules={[{ required: true, message: 'Please select date' }]}
          >
            <DatePicker style={{ width: '100%' }} format="DD-MM-YYYY" />
          </Form.Item>

          <Form.Item
            label="Duration (hours)"
            name="duration"
            rules={[{ required: true, message: 'Please enter duration' }]}
          >
            <Input type="number" step="0.5" placeholder="Enter duration in hours" />
          </Form.Item>

          <Form.Item
            label="Trainer Name"
            name="trainer"
            rules={[{ required: true, message: 'Please enter trainer name' }]}
          >
            <Input placeholder="Enter trainer name" />
          </Form.Item>

          <Form.Item
            label="Venue"
            name="venue"
          >
            <Input placeholder="Enter training venue" />
          </Form.Item>

          <Form.Item
            label="Status"
            name="status"
            rules={[{ required: true, message: 'Please select status' }]}
          >
            <Select placeholder="Select status">
              <Option value="Scheduled">Scheduled</Option>
              <Option value="Completed">Completed</Option>
              <Option value="Cancelled">Cancelled</Option>
            </Select>
          </Form.Item>

          <Form.Item label="Remarks" name="remarks">
            <TextArea rows={3} placeholder="Enter remarks" />
          </Form.Item>

          <Form.Item>
            <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
              <Button onClick={() => setModalVisible(false)}>Cancel</Button>
              <Button type="primary" htmlType="submit">
                {editMode ? 'Update' : 'Create'}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default Trainings;
