import React, { useState } from 'react';
import { Form, Input, Button, Card, Radio, message } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import axios from 'axios';

const Login = ({ onLogin }) => {
  const [userType, setUserType] = useState('employee');
  const [loading, setLoading] = useState(false);

  const onFinish = async (values) => {
    try {
      setLoading(true);
      
      const response = await axios.post('/api/auth/login', {
        type: userType,
        username: values.username,
        password: values.password
      });

      if (response.data.success) {
        message.success(`Welcome ${response.data.user.name}!`);
        onLogin(response.data.user);
      }
      
      setLoading(false);
    } catch (error) {
      setLoading(false);
      message.error(error.response?.data?.error || 'Login failed. Please try again.');
    }
  };

  return (
    <div style={{ 
      minHeight: '100vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
    }}>
      <Card 
        style={{ 
          width: 450, 
          boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
          borderRadius: 16
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <h1 style={{ fontSize: 32, fontWeight: 700, color: '#667eea', marginBottom: 8 }}>
            ☀️ Gautam Solar
          </h1>
          <h2 style={{ fontSize: 20, fontWeight: 600, color: '#666', marginBottom: 0 }}>
            Training Management System
          </h2>
        </div>

        <Radio.Group 
          value={userType} 
          onChange={(e) => setUserType(e.target.value)}
          style={{ width: '100%', marginBottom: 24 }}
          buttonStyle="solid"
        >
          <Radio.Button value="employee" style={{ width: '50%', textAlign: 'center' }}>
            👤 Employee Login
          </Radio.Button>
          <Radio.Button value="trainer" style={{ width: '50%', textAlign: 'center' }}>
            👨‍🏫 Trainer Login
          </Radio.Button>
        </Radio.Group>

        <Form
          name="login"
          onFinish={onFinish}
          layout="vertical"
          size="large"
        >
          <Form.Item
            label={userType === 'employee' ? 'Punch ID' : 'Trainer ID'}
            name="username"
            rules={[{ required: true, message: `Please enter your ${userType === 'employee' ? 'Punch ID' : 'Trainer ID'}!` }]}
          >
            <Input 
              prefix={<UserOutlined />} 
              placeholder={userType === 'employee' ? 'Enter Punch ID' : 'Enter Trainer ID'}
            />
          </Form.Item>

          <Form.Item
            label="Password"
            name="password"
            rules={[{ required: true, message: 'Please enter your password!' }]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="Enter password"
            />
          </Form.Item>

          <Form.Item>
            <Button 
              type="primary" 
              htmlType="submit" 
              block
              loading={loading}
              style={{ height: 45, fontSize: 16, fontWeight: 600 }}
            >
              Login
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default Login;
