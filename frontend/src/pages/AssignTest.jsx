import React, { useState, useEffect } from 'react';
import { Card, Form, Select, DatePicker, InputNumber, Button, message, Table, Space, Modal, Tag } from 'antd';
import { PlusOutlined, DeleteOutlined, EditOutlined } from '@ant-design/icons';
import { employeeAPI, testAPI } from '../services/api';
import dayjs from 'dayjs';
import { testQuestionsByDepartment } from '../data/testQuestions';

const { Option } = Select;

const AssignTest = ({ user }) => {
  const [form] = Form.useForm();
  const [employees, setEmployees] = useState([]);
  const [assignedTests, setAssignedTests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingTest, setEditingTest] = useState(null);
  const [selectedDepartment, setSelectedDepartment] = useState(null);
  const [availableQuestions, setAvailableQuestions] = useState([]);

  const categories = ["Pass", "Retraining", "Fail", "Pending"];

  useEffect(() => {
    fetchEmployees();
    fetchAssignedTests();
  }, []);

  const fetchEmployees = async () => {
    try {
      const response = await employeeAPI.getAll();
      setEmployees(response.data.data);
    } catch (error) {
      console.error('Error:', error);
      message.error('Failed to fetch employees');
    }
  };

  const handleEmployeeChange = (employeeId) => {
    const employee = employees.find(emp => emp.id === employeeId);
    if (employee) {
      const dept = employee.department;
      setSelectedDepartment(dept);
      
      // Get questions for this department, fallback to Production if not found
      const questionsArray = testQuestionsByDepartment[dept] || testQuestionsByDepartment['Production'];
      setAvailableQuestions(questionsArray || []);
      
      // Reset test topic when employee changes
      form.setFieldsValue({ testTopic: undefined });
    }
  };

  const fetchAssignedTests = async () => {
    try {
      setLoading(true);
      const response = await testAPI.getAll();
      setAssignedTests(response.data.data);
      setLoading(false);
    } catch (error) {
      console.error('Error:', error);
      setLoading(false);
    }
  };

  const handleAssignTest = async (values) => {
    try {
      const testData = {
        employeeId: values.employeeId,
        testTopic: values.testTopic,
        testDate: values.testDate.format('YYYY-MM-DD'),
        scorePercentage: values.scorePercentage || 0,
        category: values.category || 'Pending',
        maxMarks: values.maxMarks || 100,
        obtainedMarks: values.obtainedMarks || 0,
        evaluatedBy: user.username
      };

      if (editingTest) {
        await testAPI.update(editingTest.id, testData);
        message.success('Test updated successfully!');
      } else {
        await testAPI.create(testData);
        message.success('Test assigned successfully!');
      }

      form.resetFields();
      setModalVisible(false);
      setEditingTest(null);
      fetchAssignedTests();
    } catch (error) {
      console.error('Error:', error);
      message.error('Failed to assign test');
    }
  };

  const handleEdit = (record) => {
    setEditingTest(record);
    form.setFieldsValue({
      employeeId: record.employeeId,
      testTopic: record.testTopic,
      testDate: dayjs(record.testDate),
      scorePercentage: record.scorePercentage,
      category: record.category,
      maxMarks: record.maxMarks,
      obtainedMarks: record.obtainedMarks
    });
    setModalVisible(true);
  };

  const handleDelete = async (id) => {
    try {
      await testAPI.delete(id);
      message.success('Test deleted successfully!');
      fetchAssignedTests();
    } catch (error) {
      console.error('Error:', error);
      message.error('Failed to delete test');
    }
  };

  const columns = [
    {
      title: 'Punch ID',
      dataIndex: ['Employee', 'punchId'],
      key: 'punchId',
      width: 120
    },
    {
      title: 'Employee Name',
      dataIndex: ['Employee', 'fullName'],
      key: 'fullName',
      width: 180
    },
    {
      title: 'Department',
      dataIndex: ['Employee', 'department'],
      key: 'department',
      width: 150,
      render: (dept) => <Tag color="blue">{dept}</Tag>
    },
    {
      title: 'Test Topic',
      dataIndex: 'testTopic',
      key: 'testTopic',
      width: 300
    },
    {
      title: 'Test Date',
      dataIndex: 'testDate',
      key: 'testDate',
      width: 120,
      render: (date) => dayjs(date).format('DD-MM-YYYY')
    },
    {
      title: 'Score %',
      dataIndex: 'scorePercentage',
      key: 'score',
      width: 100,
      render: (score) => `${score}%`
    },
    {
      title: 'Category',
      dataIndex: 'category',
      key: 'category',
      width: 120,
      render: (cat) => {
        const color = cat === 'Pass' ? 'green' : cat === 'Retraining' ? 'orange' : cat === 'Fail' ? 'red' : 'blue';
        return <Tag color={color}>{cat}</Tag>;
      }
    },
    {
      title: 'Evaluated By',
      dataIndex: 'evaluatedBy',
      key: 'evaluatedBy',
      width: 150
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 120,
      fixed: 'right',
      render: (_, record) => (
        <Space>
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          >
            Edit
          </Button>
          <Button
            type="link"
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleDelete(record.id)}
          >
            Delete
          </Button>
        </Space>
      )
    }
  ];

  return (
    <div style={{ padding: 24 }}>
      <Card
        title={<h2>Assign Test to Employee</h2>}
        extra={
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => {
              setEditingTest(null);
              form.resetFields();
              setModalVisible(true);
            }}
          >
            Assign New Test
          </Button>
        }
      >
        <Table
          columns={columns}
          dataSource={assignedTests}
          rowKey="id"
          loading={loading}
          scroll={{ x: 1500 }}
          pagination={{ pageSize: 20, showTotal: (total) => `Total ${total} tests assigned` }}
        />
      </Card>

      <Modal
        title={editingTest ? 'Edit Test' : 'Assign New Test'}
        open={modalVisible}
        onCancel={() => {
          setModalVisible(false);
          setEditingTest(null);
          form.resetFields();
        }}
        footer={null}
        width={600}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleAssignTest}
          initialValues={{
            maxMarks: 100,
            scorePercentage: 0,
            obtainedMarks: 0,
            category: 'Pending'
          }}
        >
          <Form.Item
            label="Select Employee"
            name="employeeId"
            rules={[{ required: true, message: 'Please select an employee' }]}
          >
            <Select
              showSearch
              placeholder="Search by Punch ID or Name"
              optionFilterProp="children"
              onChange={handleEmployeeChange}
              filterOption={(input, option) =>
                option.children.toLowerCase().includes(input.toLowerCase())
              }
            >
              {employees.map(emp => (
                <Option key={emp.id} value={emp.id}>
                  {emp.punchId} - {emp.fullName} ({emp.department})
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            label={`Test Question ${selectedDepartment ? `(${selectedDepartment} Dept)` : ''}`}
            name="testTopic"
            rules={[{ required: true, message: 'Please select test question' }]}
          >
            <Select
              showSearch
              placeholder={selectedDepartment ? `Select question` : "Select employee first"}
              disabled={!selectedDepartment}
            >
              {availableQuestions.map((q, index) => (
                <Option key={q.id} value={`Q${q.id}`}>
                  Q{q.id}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            label="Test Date"
            name="testDate"
            rules={[{ required: true, message: 'Please select test date' }]}
          >
            <DatePicker style={{ width: '100%' }} format="DD-MM-YYYY" />
          </Form.Item>

          <Form.Item
            label="Max Marks"
            name="maxMarks"
          >
            <InputNumber min={0} max={1000} style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item
            label="Obtained Marks"
            name="obtainedMarks"
          >
            <InputNumber min={0} max={1000} style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item
            label="Score Percentage"
            name="scorePercentage"
          >
            <InputNumber min={0} max={100} style={{ width: '100%' }} suffix="%" />
          </Form.Item>

          <Form.Item
            label="Category"
            name="category"
          >
            <Select>
              {categories.map(cat => (
                <Option key={cat} value={cat}>{cat}</Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">
                {editingTest ? 'Update Test' : 'Assign Test'}
              </Button>
              <Button onClick={() => {
                setModalVisible(false);
                setEditingTest(null);
                form.resetFields();
              }}>
                Cancel
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default AssignTest;
