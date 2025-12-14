import React, { useState, useEffect } from 'react';
import { Table, Card, Input, Select, Button, Tag, Space, Modal, message, Result } from 'antd';
import { SearchOutlined, ReloadOutlined, EyeOutlined, LockOutlined } from '@ant-design/icons';
import { employeeAPI } from '../services/api';

const { Option } = Select;

const Employees = ({ user }) => {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({ search: '', department: '', status: '' });
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);

  const departments = ['QUALITY', 'PRODUCTION', 'MAINTENANCE', 'DISPATCH', 'HOUSEKEEPING', 'PACKAGING', 'STORES'];

  // Only trainers can access employee list
  if (user?.type === 'employee') {
    return (
      <div style={{ padding: 24 }}>
        <Result
          icon={<LockOutlined />}
          title="Access Restricted"
          subTitle="Only trainers can view the employee list. You can view your own information in My Trainings, My Tests, and My Competency pages."
        />
      </div>
    );
  }

  useEffect(() => {
    fetchEmployees();
  }, [filters]);

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      const response = await employeeAPI.getAll(filters);
      setEmployees(response.data.data);
      setLoading(false);
    } catch (error) {
      message.error('Failed to fetch employees');
      setLoading(false);
    }
  };

  const handleSync = async () => {
    try {
      setLoading(true);
      message.loading('Syncing employees from HRM API...', 0);
      const response = await employeeAPI.sync();
      message.destroy();
      message.success(response.data.message);
      fetchEmployees();
    } catch (error) {
      message.destroy();
      console.error('Sync error:', error);
      message.error(error.response?.data?.message || 'Sync failed');
      setLoading(false);
    }
  };

  const viewDetails = async (id) => {
    try {
      const response = await employeeAPI.getById(id);
      setSelectedEmployee(response.data.data);
      setModalVisible(true);
    } catch (error) {
      message.error('Failed to fetch employee details');
    }
  };

  const columns = [
    {
      title: 'Punch ID',
      dataIndex: 'punchId',
      key: 'punchId',
      width: 120
    },
    {
      title: 'Name',
      dataIndex: 'fullName',
      key: 'fullName',
      width: 200
    },
    {
      title: 'Department',
      dataIndex: 'department',
      key: 'department',
      width: 150,
      render: (dept) => <Tag color="blue">{dept}</Tag>
    },
    {
      title: 'Designation',
      dataIndex: 'designation',
      key: 'designation',
      width: 180
    },
    {
      title: 'Work Location',
      dataIndex: 'workLocation',
      key: 'workLocation',
      width: 150
    },
    {
      title: 'DOJ',
      dataIndex: 'dateOfJoining',
      key: 'dateOfJoining',
      width: 120,
      render: (date) => date ? new Date(date).toLocaleDateString() : 'N/A'
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status) => (
        <Tag color={status === 'Active' ? 'green' : 'red'}>{status}</Tag>
      )
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 100,
      render: (_, record) => (
        <Button 
          type="link" 
          icon={<EyeOutlined />}
          onClick={() => viewDetails(record.id)}
        >
          View
        </Button>
      )
    }
  ];

  return (
    <div style={{ padding: 24 }}>
      <Card 
        title={<h2>Employees Management</h2>}
        extra={
          <Button 
            type="primary" 
            icon={<ReloadOutlined />}
            onClick={handleSync}
            loading={loading}
          >
            Sync from HRM
          </Button>
        }
      >
        <Space style={{ marginBottom: 16 }} wrap>
          <Input
            placeholder="Search by Punch ID or Name"
            prefix={<SearchOutlined />}
            style={{ width: 250 }}
            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
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
          <Select
            placeholder="Status"
            style={{ width: 150 }}
            allowClear
            onChange={(value) => setFilters({ ...filters, status: value || '' })}
          >
            <Option value="Active">Active</Option>
            <Option value="Inactive">Inactive</Option>
          </Select>
        </Space>

        <Table
          columns={columns}
          dataSource={employees}
          rowKey="id"
          loading={loading}
          scroll={{ x: 1200 }}
          pagination={{ pageSize: 20, showSizeChanger: true }}
        />
      </Card>

      <Modal
        title="Employee Details"
        visible={modalVisible}
        onCancel={() => setModalVisible(false)}
        width={800}
        footer={null}
      >
        {selectedEmployee && (
          <div>
            <h3>{selectedEmployee.fullName} ({selectedEmployee.punchId})</h3>
            <p><strong>Department:</strong> {selectedEmployee.department}</p>
            <p><strong>Designation:</strong> {selectedEmployee.designation}</p>
            <p><strong>Trainings:</strong> {selectedEmployee.Trainings?.length || 0}</p>
            <p><strong>Test Results:</strong> {selectedEmployee.TestResults?.length || 0}</p>
            <p><strong>Competencies:</strong> {selectedEmployee.Competencies?.length || 0}</p>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Employees;
