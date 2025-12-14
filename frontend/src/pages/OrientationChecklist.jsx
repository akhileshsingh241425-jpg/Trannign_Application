import React, { useState, useEffect } from 'react';
import { Card, Table, Tag, Button, Modal, Form, Checkbox, Input, DatePicker, Select, message, Space } from 'antd';
import { CheckCircleOutlined, EditOutlined, EyeOutlined } from '@ant-design/icons';
import axios from 'axios';
import dayjs from 'dayjs';

const { TextArea } = Input;
const { Option } = Select;

const OrientationChecklist = ({ user }) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [viewMode, setViewMode] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [form] = Form.useForm();

  const isEmployee = user?.type === 'employee';
  const trainers = ["Himanshu", "Aman", "Shivshree", "Ashu", "Nikhil"];

  useEffect(() => {
    fetchOrientationData();
  }, []);

  const fetchOrientationData = async () => {
    try {
      setLoading(true);
      const filters = isEmployee ? { punchId: user.punchId } : {};
      const response = await axios.get('/api/orientations', { params: filters });
      setData(response.data.data || []);
      setLoading(false);
    } catch (error) {
      console.error('Error:', error);
      setLoading(false);
    }
  };

  const handleView = (record) => {
    setSelectedRecord(record);
    setViewMode(true);
    form.setFieldsValue({
      ...record,
      orientationDate: record.orientationDate ? dayjs(record.orientationDate) : null
    });
    setModalVisible(true);
  };

  const handleEdit = (record) => {
    setSelectedRecord(record);
    setViewMode(false);
    form.setFieldsValue({
      ...record,
      orientationDate: record.orientationDate ? dayjs(record.orientationDate) : null
    });
    setModalVisible(true);
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      const checkedCount = Object.values(values).filter(v => v === true).length;
      const totalFields = 14; // Total checkboxes
      const completionPercentage = Math.round((checkedCount / totalFields) * 100);
      
      let status = 'Pending';
      if (completionPercentage === 100) status = 'Completed';
      else if (completionPercentage >= 50) status = 'In Progress';

      await axios.put(`/api/orientations/${selectedRecord.id}`, {
        ...values,
        orientationDate: values.orientationDate?.format('YYYY-MM-DD'),
        completionPercentage,
        orientationStatus: status
      });

      message.success('Orientation updated successfully!');
      setModalVisible(false);
      form.resetFields();
      fetchOrientationData();
    } catch (error) {
      message.error('Failed to update orientation');
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
      title: 'Employee Name',
      dataIndex: ['Employee', 'fullName'],
      key: 'fullName',
      width: 200,
      fixed: 'left'
    }] : []),
    ...(!isEmployee ? [{
      title: 'Department',
      dataIndex: ['Employee', 'department'],
      key: 'department',
      width: 140,
      render: (dept) => <Tag color="blue">{dept}</Tag>
    }] : []),
    {
      title: 'Orientation Date',
      dataIndex: 'orientationDate',
      key: 'orientationDate',
      width: 130,
      render: (date) => date ? dayjs(date).format('DD MMM YYYY') : 'N/A'
    },
    {
      title: 'Completion %',
      dataIndex: 'completionPercentage',
      key: 'completion',
      width: 120,
      render: (val) => <Tag color={val === 100 ? 'green' : val >= 50 ? 'orange' : 'red'}>{val}%</Tag>,
      sorter: (a, b) => a.completionPercentage - b.completionPercentage
    },
    {
      title: 'Status',
      dataIndex: 'orientationStatus',
      key: 'status',
      width: 120,
      render: (status) => {
        const color = status === 'Completed' ? 'green' : status === 'In Progress' ? 'orange' : 'red';
        return <Tag color={color}>{status}</Tag>;
      },
      filters: [
        { text: 'Completed', value: 'Completed' },
        { text: 'In Progress', value: 'In Progress' },
        { text: 'Pending', value: 'Pending' }
      ],
      onFilter: (value, record) => record.orientationStatus === value
    },
    {
      title: 'Completed By',
      dataIndex: 'completedBy',
      key: 'completedBy',
      width: 130,
      render: (text) => text || '-'
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 150,
      fixed: 'right',
      render: (_, record) => (
        <Space>
          <Button size="small" icon={<EyeOutlined />} onClick={() => handleView(record)}>
            View
          </Button>
          {!isEmployee && (
            <Button size="small" type="primary" icon={<EditOutlined />} onClick={() => handleEdit(record)}>
              Edit
            </Button>
          )}
        </Space>
      )
    }
  ];

  return (
    <div style={{ padding: 24 }}>
      <Card title={
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2>📋 Orientation Checklist</h2>
          <span style={{ fontSize: 14, color: '#666', fontWeight: 'normal' }}>GSPL/HR/OR/001</span>
        </div>
      }>
        <Table
          columns={columns}
          dataSource={data}
          rowKey="id"
          loading={loading}
          scroll={{ x: 1400 }}
          pagination={{ pageSize: 20, showTotal: (total) => `Total ${total} records` }}
        />
      </Card>

      {/* Orientation Checklist Modal */}
      <Modal
        title={`Orientation Checklist - ${selectedRecord?.Employee?.fullName || ''}`}
        open={modalVisible}
        onCancel={() => {
          setModalVisible(false);
          form.resetFields();
        }}
        onOk={viewMode ? null : handleSubmit}
        footer={viewMode ? [
          <Button key="close" onClick={() => setModalVisible(false)}>Close</Button>
        ] : undefined}
        width={700}
      >
        <Form form={form} layout="vertical" disabled={viewMode}>
          <Form.Item label="Orientation Date" name="orientationDate">
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>

          <div style={{ background: '#f5f5f5', padding: 16, borderRadius: 8, marginBottom: 16 }}>
            <h3 style={{ marginBottom: 16 }}>A. Personal Information & Documentation</h3>
            <Form.Item name="personalInfoCompleted" valuePropName="checked">
              <Checkbox>1. Personal information collected and verified</Checkbox>
            </Form.Item>
            <Form.Item name="documentsVerified" valuePropName="checked">
              <Checkbox>2. All documents verified (ID proof, Address proof, Education certificates)</Checkbox>
            </Form.Item>
          </div>

          <div style={{ background: '#f5f5f5', padding: 16, borderRadius: 8, marginBottom: 16 }}>
            <h3 style={{ marginBottom: 16 }}>B. Company & Policy Introduction</h3>
            <Form.Item name="companyPoliciesExplained" valuePropName="checked">
              <Checkbox>3. Gautam Solar company overview, vision, mission explained</Checkbox>
            </Form.Item>
            <Form.Item name="hrPoliciesExplained" valuePropName="checked">
              <Checkbox>4. HR policies explained (Leave, Attendance, Code of Conduct)</Checkbox>
            </Form.Item>
            <Form.Item name="qualityPolicyExplained" valuePropName="checked">
              <Checkbox>5. Quality policy and QMS awareness (ISO 9001/14001/45001/50001)</Checkbox>
            </Form.Item>
          </div>

          <div style={{ background: '#f5f5f5', padding: 16, borderRadius: 8, marginBottom: 16 }}>
            <h3 style={{ marginBottom: 16 }}>C. Safety & Security Training</h3>
            <Form.Item name="safetyTrainingCompleted" valuePropName="checked">
              <Checkbox>6. General safety awareness and workplace safety rules</Checkbox>
            </Form.Item>
            <Form.Item name="ppeTrainingCompleted" valuePropName="checked">
              <Checkbox>7. PPE training - Types and proper usage</Checkbox>
            </Form.Item>
            <Form.Item name="fireTrainingCompleted" valuePropName="checked">
              <Checkbox>8. Fire safety and emergency evacuation procedures</Checkbox>
            </Form.Item>
          </div>

          <div style={{ background: '#f5f5f5', padding: 16, borderRadius: 8, marginBottom: 16 }}>
            <h3 style={{ marginBottom: 16 }}>D. Department & Work Area Introduction</h3>
            <Form.Item name="departmentOrientationCompleted" valuePropName="checked">
              <Checkbox>9. Department introduction and team members introduced</Checkbox>
            </Form.Item>
            <Form.Item name="workstationSetup" valuePropName="checked">
              <Checkbox>10. Workstation setup and tools/equipment familiarization</Checkbox>
            </Form.Item>
          </div>

          <div style={{ background: '#f5f5f5', padding: 16, borderRadius: 8, marginBottom: 16 }}>
            <h3 style={{ marginBottom: 16 }}>E. Process & Quality Training</h3>
            <Form.Item name="sopTrainingCompleted" valuePropName="checked">
              <Checkbox>11. SOP/WI training for assigned process</Checkbox>
            </Form.Item>
            <Form.Item name="isoAwarenessCompleted" valuePropName="checked">
              <Checkbox>12. ISO awareness and implementation practices</Checkbox>
            </Form.Item>
            <Form.Item name="qualityToolsTraining" valuePropName="checked">
              <Checkbox>13. Quality tools awareness and usage</Checkbox>
            </Form.Item>
            <Form.Item name="fiveSTrainingCompleted" valuePropName="checked">
              <Checkbox>14. 5S awareness and workplace organization</Checkbox>
            </Form.Item>
          </div>

          {!viewMode && (
            <Form.Item label="Completed By (Trainer)" name="completedBy">
              <Select>
                {trainers.map(trainer => (
                  <Option key={trainer} value={trainer}>{trainer}</Option>
                ))}
              </Select>
            </Form.Item>
          )}
        </Form>
      </Modal>
    </div>
  );
};

export default OrientationChecklist;
