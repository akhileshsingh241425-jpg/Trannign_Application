import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Statistic, Typography, Timeline, Space, Divider, Button, Modal, Input, message, Spin, Progress } from 'antd';
import { 
  UserOutlined, 
  BookOutlined, 
  TrophyOutlined, 
  CheckCircleOutlined,
  ThunderboltOutlined,
  LockOutlined
} from '@ant-design/icons';
import { employeeAPI, trainingAPI, testAPI } from '../services/api';
import axios from 'axios';
import './Dashboard.css';

const { Title, Paragraph, Text } = Typography;

const Dashboard = ({ user }) => {
  const [stats, setStats] = useState({
    employees: 0,
    trainings: 0,
    tests: 0,
    passRate: 0
  });
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [restartModalVisible, setRestartModalVisible] = useState(false);
  const [password, setPassword] = useState('');
  const [restartPassword, setRestartPassword] = useState('');
  const [generating, setGenerating] = useState(false);
  const [restarting, setRestarting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [restartProgress, setRestartProgress] = useState(0);

  const isEmployee = user?.type === 'employee';

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      if (isEmployee) {
        // Employee sees only their own data
        const [trainRes, testRes] = await Promise.all([
          trainingAPI.getAll({ punchId: user.punchId }),
          testAPI.getAll({ punchId: user.punchId })
        ]);

        const tests = testRes.data.data || [];
        const passedTests = tests.filter(t => t.category === 'Pass').length;
        const passRate = tests.length > 0 ? ((passedTests / tests.length) * 100).toFixed(1) : 0;

        setStats({
          employees: 1,
          trainings: trainRes.data.count || 0,
          tests: testRes.data.count || 0,
          passRate: parseFloat(passRate)
        });
      } else {
        // Trainer sees all data
        const [empRes, trainRes, testRes] = await Promise.all([
          employeeAPI.getAll({}),
          trainingAPI.getAll({}),
          testAPI.getAll({})
        ]);

        const tests = testRes.data.data || [];
        const passedTests = tests.filter(t => t.category === 'Pass').length;
        const passRate = tests.length > 0 ? ((passedTests / tests.length) * 100).toFixed(1) : 0;

        setStats({
          employees: empRes.data.count || 0,
          trainings: trainRes.data.count || 0,
          tests: testRes.data.count || 0,
          passRate: parseFloat(passRate)
        });
      }
      
      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch dashboard data', error);
      setLoading(false);
    }
  };

  const handleGenerateDummyData = async () => {
    if (password !== '241425') {
      message.error('Incorrect password!');
      return;
    }

    try {
      setGenerating(true);
      setProgress(0);

      // Step 1: Sync employees
      setProgress(30);
      const syncResponse = await axios.post('/api/employees/sync');
      setProgress(60);

      // Step 2: Generate dummy data
      const generateResponse = await axios.post('/api/generate-dummy-data');
      setProgress(100);
      
      message.success({
        content: `✅ Data generated successfully!\n📊 ${generateResponse.data.stats.trainings} trainings\n📝 ${generateResponse.data.stats.tests} tests\n🏆 ${generateResponse.data.stats.competencies} competency records`,
        duration: 5
      });

      setTimeout(() => {
        setModalVisible(false);
        setPassword('');
        setProgress(0);
        fetchDashboardData();
      }, 1500);
      
    } catch (error) {
      message.error('Failed to generate data: ' + (error.response?.data?.message || error.message));
      setProgress(0);
    } finally {
      setGenerating(false);
    }
  };

  const handleRestartSystem = async () => {
    if (restartPassword !== '241425') {
      message.error('Incorrect password!');
      return;
    }

    try {
      setRestarting(true);
      setRestartProgress(0);

      setRestartProgress(50);
      await axios.post('/api/restart-system');
      setRestartProgress(100);
      
      message.success({
        content: '✅ System restarted successfully! All data deleted.',
        duration: 3
      });

      setTimeout(() => {
        setRestartModalVisible(false);
        setRestartPassword('');
        setRestartProgress(0);
        fetchDashboardData();
      }, 1000);
      
    } catch (error) {
      setRestartProgress(0);
      message.error('Failed to restart system: ' + (error.response?.data?.message || error.message));
    } finally {
      setRestarting(false);
    }
  };

  return (
    <div className="dashboard">
      {/* Header Section */}
      <div className="header-card">
        <Title level={1} style={{ color: 'white', marginBottom: 12, fontSize: 42, fontWeight: 700 }}>
          ☀️ Gautam Solar
        </Title>
        <Title level={2} style={{ color: 'white', marginBottom: 8, fontSize: 28, fontWeight: 600 }}>
          {isEmployee ? `Welcome ${user.name}` : 'HR & Training Management System'}
        </Title>
        <Paragraph style={{ color: 'rgba(255,255,255,0.95)', fontSize: 18, marginBottom: 0 }}>
          {isEmployee ? `📋 Employee ID: ${user.punchId} | Department: ${user.department || 'N/A'}` : '📋 ISO 9001:2015 Compliant Training & Competency Management'}
        </Paragraph>
      </div>

      <div style={{ padding: '24px' }}>
        {/* Action Buttons - Only for Trainers */}
        {!isEmployee && (
          <div style={{ marginBottom: 24, display: 'flex', justifyContent: 'flex-end', gap: 16 }}>
            <Button
              danger
              size="large"
              icon={<LockOutlined />}
              onClick={() => setRestartModalVisible(true)}
              style={{ height: 48, fontSize: 16, fontWeight: 600 }}
            >
              Restart System
            </Button>
            <Button
              type="primary"
              size="large"
              icon={<ThunderboltOutlined />}
              onClick={() => setModalVisible(true)}
              style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', border: 'none', height: 48, fontSize: 16, fontWeight: 600 }}
            >
              Refresh Data
            </Button>
          </div>
        )}

        {/* Statistics Cards */}
        <Row gutter={[24, 24]} style={{ marginBottom: 32 }}>
          {!isEmployee && (
            <Col xs={24} sm={12} lg={6}>
              <Card className="stat-card" hoverable>
                <Statistic
                  title="👥 Total Employees"
                  value={stats.employees}
                  valueStyle={{ color: '#1890ff', fontWeight: 700 }}
                />
              </Card>
            </Col>
          )}
          <Col xs={24} sm={12} lg={6}>
            <Card className="stat-card" hoverable>
              <Statistic
                title={isEmployee ? "📚 My Trainings" : "📚 Total Trainings"}
                value={stats.trainings}
                valueStyle={{ color: '#52c41a', fontWeight: 700 }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card className="stat-card" hoverable>
              <Statistic
                title={isEmployee ? "📝 My Tests" : "📝 Total Tests"}
                value={stats.tests}
                valueStyle={{ color: '#faad14', fontWeight: 700 }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card className="stat-card" hoverable>
              <Statistic
                title={isEmployee ? "✅ My Pass Rate" : "✅ Overall Pass Rate"}
                value={stats.passRate}
                suffix="%"
                valueStyle={{ color: stats.passRate >= 70 ? '#52c41a' : '#f5222d', fontWeight: 700 }}
              />
            </Card>
          </Col>
        </Row>

        {!isEmployee && (
          <>
        {/* Training Process - Detailed Steps */}
        <Card 
          className="flow-chart-card" 
          title={<Title level={3} style={{ margin: 0 }}>📊 Training Process Flow</Title>}
          style={{ marginBottom: 32 }}
        >
          <Timeline mode="left" style={{ marginTop: 24 }}>
            <Timeline.Item 
              color="blue"
              dot={<div style={{ width: 40, height: 40, background: '#1890ff', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, color: 'white', fontWeight: 700 }}>1</div>}
            >
              <Card style={{ background: 'linear-gradient(135deg, #e6f7ff 0%, #bae7ff 100%)', border: '2px solid #1890ff' }}>
                <Title level={4} style={{ color: '#1890ff', marginBottom: 12 }}>👤 Employee Onboarding</Title>
                <Paragraph style={{ marginBottom: 8, fontSize: 15 }}>
                  New employee joins the organization and gets registered in the system
                </Paragraph>
                <div style={{ paddingLeft: 16 }}>
                  <Text>• Personal information recorded</Text><br/>
                  <Text>• Employee ID assigned</Text><br/>
                  <Text>• Department allocation</Text>
                </div>
              </Card>
            </Timeline.Item>

            <Timeline.Item 
              color="green"
              dot={<div style={{ width: 40, height: 40, background: '#52c41a', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, color: 'white', fontWeight: 700 }}>2</div>}
            >
              <Card style={{ background: 'linear-gradient(135deg, #f6ffed 0%, #d9f7be 100%)', border: '2px solid #52c41a' }}>
                <Title level={4} style={{ color: '#52c41a', marginBottom: 12 }}>🛡️ Orientation & Induction</Title>
                <Paragraph style={{ marginBottom: 8, fontSize: 15 }}>
                  Comprehensive orientation covering company policies, safety, and culture
                </Paragraph>
                <div style={{ paddingLeft: 16 }}>
                  <Text>• Safety training & PPE</Text><br/>
                  <Text>• Company policies & procedures</Text><br/>
                  <Text>• Workplace familiarization</Text><br/>
                  <Text>• Document verification</Text>
                </div>
              </Card>
            </Timeline.Item>

            <Timeline.Item 
              color="orange"
              dot={<div style={{ width: 40, height: 40, background: '#faad14', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, color: 'white', fontWeight: 700 }}>3</div>}
            >
              <Card style={{ background: 'linear-gradient(135deg, #fffbe6 0%, #fff1b8 100%)', border: '2px solid #faad14' }}>
                <Title level={4} style={{ color: '#faad14', marginBottom: 12 }}>📋 Skills Assessment</Title>
                <Paragraph style={{ marginBottom: 8, fontSize: 15 }}>
                  Initial competency assessment to identify training needs
                </Paragraph>
                <div style={{ paddingLeft: 16 }}>
                  <Text>• Current skill level evaluation</Text><br/>
                  <Text>• Gap analysis</Text><br/>
                  <Text>• Training needs identification</Text>
                </div>
              </Card>
            </Timeline.Item>

            <Timeline.Item 
              color="purple"
              dot={<div style={{ width: 40, height: 40, background: '#722ed1', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, color: 'white', fontWeight: 700 }}>4</div>}
            >
              <Card style={{ background: 'linear-gradient(135deg, #f9f0ff 0%, #efdbff 100%)', border: '2px solid #722ed1' }}>
                <Title level={4} style={{ color: '#722ed1', marginBottom: 12 }}>📝 Training Plan Creation</Title>
                <Paragraph style={{ marginBottom: 8, fontSize: 15 }}>
                  Customized training plan based on role requirements and skill gaps
                </Paragraph>
                <div style={{ paddingLeft: 16 }}>
                  <Text>• Role-specific training modules</Text><br/>
                  <Text>• Training schedule creation</Text><br/>
                  <Text>• Trainer assignment</Text><br/>
                  <Text>• Resource allocation</Text>
                </div>
              </Card>
            </Timeline.Item>

            <Timeline.Item 
              color="cyan"
              dot={<div style={{ width: 40, height: 40, background: '#13c2c2', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, color: 'white', fontWeight: 700 }}>5</div>}
            >
              <Card style={{ background: 'linear-gradient(135deg, #e6fffb 0%, #b5f5ec 100%)', border: '2px solid #13c2c2' }}>
                <Title level={4} style={{ color: '#13c2c2', marginBottom: 12 }}>📚 Training Execution</Title>
                <Paragraph style={{ marginBottom: 8, fontSize: 15 }}>
                  Classroom, On-the-Job Training (OJT), and practical sessions
                </Paragraph>
                <div style={{ paddingLeft: 16 }}>
                  <Text>• Theory sessions (classroom)</Text><br/>
                  <Text>• Practical demonstrations</Text><br/>
                  <Text>• Hands-on training (OJT)</Text><br/>
                  <Text>• Attendance tracking</Text>
                </div>
              </Card>
            </Timeline.Item>

            <Timeline.Item 
              color="magenta"
              dot={<div style={{ width: 40, height: 40, background: '#eb2f96', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, color: 'white', fontWeight: 700 }}>6</div>}
            >
              <Card style={{ background: 'linear-gradient(135deg, #fff0f6 0%, #ffd6e7 100%)', border: '2px solid #eb2f96' }}>
                <Title level={4} style={{ color: '#eb2f96', marginBottom: 12 }}>🏆 Assessment & Testing</Title>
                <Paragraph style={{ marginBottom: 8, fontSize: 15 }}>
                  Knowledge and skills evaluation through written and practical tests
                </Paragraph>
                <div style={{ paddingLeft: 16 }}>
                  <Text>• Written examination</Text><br/>
                  <Text>• Practical skill test</Text><br/>
                  <Text>• Minimum passing score: 70%</Text><br/>
                  <Text>• Results: Pass / Retraining / Fail</Text>
                </div>
              </Card>
            </Timeline.Item>

            <Timeline.Item 
              color="green"
              dot={<div style={{ width: 40, height: 40, background: '#52c41a', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, color: 'white', fontWeight: 700 }}>7</div>}
            >
              <Card style={{ background: 'linear-gradient(135deg, #f6ffed 0%, #d9f7be 100%)', border: '2px solid #52c41a' }}>
                <Title level={4} style={{ color: '#52c41a', marginBottom: 12 }}>📈 Competency Matrix Update</Title>
                <Paragraph style={{ marginBottom: 8, fontSize: 15 }}>
                  Update employee competency records and skill levels
                </Paragraph>
                <div style={{ paddingLeft: 16 }}>
                  <Text>• Skill level certification</Text><br/>
                  <Text>• Competency matrix updated</Text><br/>
                  <Text>• Training records maintained</Text><br/>
                  <Text>• Certificates issued</Text>
                </div>
              </Card>
            </Timeline.Item>

            <Timeline.Item 
              color="blue"
              dot={<div style={{ width: 40, height: 40, background: '#1890ff', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, color: 'white', fontWeight: 700 }}>8</div>}
            >
              <Card style={{ background: 'linear-gradient(135deg, #e6f7ff 0%, #bae7ff 100%)', border: '2px solid #1890ff' }}>
                <Title level={4} style={{ color: '#1890ff', marginBottom: 12 }}>🔄 Continuous Monitoring & Retraining</Title>
                <Paragraph style={{ marginBottom: 8, fontSize: 15 }}>
                  Regular refresher training and performance monitoring
                </Paragraph>
                <div style={{ paddingLeft: 16 }}>
                  <Text>• Periodic refresher training</Text><br/>
                  <Text>• Performance monitoring</Text><br/>
                  <Text>• Annual competency review</Text><br/>
                  <Text>• Retraining if required (score &lt; 70%)</Text>
                </div>
              </Card>
            </Timeline.Item>
          </Timeline>
        </Card>

        {/* Training Procedure Details */}
        <Row gutter={[24, 24]} style={{ marginBottom: 32 }}>
          <Col xs={24} lg={12}>
            <Card 
              className="procedure-card"
              title={<Title level={4} style={{ margin: 0 }}>📜 Training Procedure - ISO 9001:2015</Title>}
            >
              <Timeline>
                <Timeline.Item color="blue">
                  <Text strong style={{ fontSize: 16 }}>📋 Document Control</Text>
                  <Paragraph style={{ marginTop: 8 }}>
                    All training records are maintained as per ISO 9001:2015 requirements with proper version control and document management.
                  </Paragraph>
                </Timeline.Item>
                <Timeline.Item color="green">
                  <Text strong style={{ fontSize: 16 }}>✅ Training Effectiveness</Text>
                  <Paragraph style={{ marginTop: 8 }}>
                    Post-training evaluation within 30 days to measure training effectiveness and on-the-job performance improvement.
                  </Paragraph>
                </Timeline.Item>
                <Timeline.Item color="orange">
                  <Text strong style={{ fontSize: 16 }}>📁 Record Retention</Text>
                  <Paragraph style={{ marginTop: 8 }}>
                    Training records are maintained for minimum 5 years including attendance sheets, test results, and certificates.
                  </Paragraph>
                </Timeline.Item>
                <Timeline.Item color="red">
                  <Text strong style={{ fontSize: 16 }}>🔍 Audit Trail</Text>
                  <Paragraph style={{ marginTop: 8 }}>
                    Complete audit trail maintained for internal audits, management reviews, and external certification audits.
                  </Paragraph>
                </Timeline.Item>
              </Timeline>
            </Card>
          </Col>
          
          <Col xs={24} lg={12}>
            <Card 
              className="topics-card"
              title={<Title level={4} style={{ margin: 0 }}>🎯 Key Training Topics</Title>}
            >
              <Timeline>
                <Timeline.Item color="blue">
                  <Text strong style={{ fontSize: 16 }}>⚙️ Technical Training</Text>
                  <Paragraph style={{ marginTop: 8 }}>
                    • Tabber & Stringer Process<br/>
                    • Lamination & Encapsulation<br/>
                    • EL Testing & Hi-Pot Testing<br/>
                    • Solar Cell Testing & Quality Control
                  </Paragraph>
                </Timeline.Item>
                <Timeline.Item color="green">
                  <Text strong style={{ fontSize: 16 }}>🛡️ Quality & Safety</Text>
                  <Paragraph style={{ marginTop: 8 }}>
                    • ISO 9001:2015 Awareness<br/>
                    • 5S Workplace Management<br/>
                    • Fire Fighting & First Aid<br/>
                    • Electrical Safety
                  </Paragraph>
                </Timeline.Item>
                <Timeline.Item color="orange">
                  <Text strong style={{ fontSize: 16 }}>💼 Soft Skills</Text>
                  <Paragraph style={{ marginTop: 8 }}>
                    • Communication Skills<br/>
                    • Teamwork & Leadership<br/>
                    • Time Management<br/>
                    • Problem Solving
                  </Paragraph>
                </Timeline.Item>
              </Timeline>
            </Card>
          </Col>
        </Row>


        </>
        )}
      </div>

      {/* Refresh Data Modal */}
      <Modal
        title={
          <Space>
            <ThunderboltOutlined style={{ color: '#1890ff' }} />
            <span>Refresh Data</span>
          </Space>
        }
        open={modalVisible}
        onCancel={() => {
          setModalVisible(false);
          setPassword('');
        }}
        footer={[
          <Button key="cancel" onClick={() => {
            setModalVisible(false);
            setPassword('');
          }} disabled={generating}>
            Cancel
          </Button>,
          <Button
            key="submit"
            type="primary"
            loading={generating}
            onClick={handleGenerateDummyData}
            icon={<ThunderboltOutlined />}
            disabled={generating}
          >
            Refresh Data
          </Button>
        ]}
      >
        <Space direction="vertical" style={{ width: '100%' }} size="large">
          <Input.Password
            size="large"
            placeholder="Enter password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onPressEnter={handleGenerateDummyData}
            prefix={<LockOutlined />}
            disabled={generating}
          />
          {generating && (
            <div style={{ textAlign: 'center' }}>
              <Progress percent={progress} status="active" />
            </div>
          )}
        </Space>
      </Modal>

      {/* Restart System Modal */}
      <Modal
        title={
          <Space>
            <LockOutlined style={{ color: '#ff4d4f' }} />
            <span style={{ color: '#ff4d4f' }}>Restart System - Delete All Data</span>
          </Space>
        }
        open={restartModalVisible}
        onCancel={() => {
          setRestartModalVisible(false);
          setRestartPassword('');
        }}
        footer={[
          <Button key="cancel" onClick={() => {
            setRestartModalVisible(false);
            setRestartPassword('');
          }} disabled={restarting}>
            Cancel
          </Button>,
          <Button
            key="submit"
            type="primary"
            danger
            loading={restarting}
            onClick={handleRestartSystem}
            icon={<LockOutlined />}
            disabled={restarting}
          >
            Delete All Data
          </Button>
        ]}
      >
        <Space direction="vertical" style={{ width: '100%' }} size="large">
          <Input.Password
            size="large"
            placeholder="Enter password"
            value={restartPassword}
            onChange={(e) => setRestartPassword(e.target.value)}
            onPressEnter={handleRestartSystem}
            prefix={<LockOutlined />}
            disabled={restarting}
          />
          {restarting && (
            <div style={{ textAlign: 'center' }}>
              <Progress percent={restartProgress} status="active" strokeColor="#ff4d4f" />
            </div>
          )}
        </Space>
      </Modal>
    </div>
  );
};

export default Dashboard;
