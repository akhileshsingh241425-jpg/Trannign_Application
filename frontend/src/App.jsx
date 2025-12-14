import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { Layout, Menu } from 'antd';
import {
  DashboardOutlined,
  TeamOutlined,
  BookOutlined,
  FileTextOutlined,
  TrophyOutlined,
  CalendarOutlined,
  BarChartOutlined,
  FundProjectionScreenOutlined,
  LogoutOutlined,
  CheckSquareOutlined,
  ReloadOutlined,
  CheckCircleOutlined,
  UserOutlined
} from '@ant-design/icons';
import Dashboard from './pages/Dashboard';
import Employees from './pages/Employees';
import Trainings from './pages/Trainings';
import TrainingCalendar from './pages/TrainingCalendar';
import TestResults from './pages/TestResults';
import CompetencyMatrix from './pages/CompetencyMatrix';
import TrainingAnalytics from './pages/TrainingAnalytics';
import DepartmentKPI from './pages/DepartmentKPI';
import AssignTest from './pages/AssignTest';
import TakeTest from './pages/TakeTest';
import RetrainingManagement from './pages/RetrainingManagement';
import OrientationChecklist from './pages/OrientationChecklist';
import TrainerDashboard from './pages/TrainerDashboard';
import Login from './pages/Login';
import './App.css';

const { Header, Sider, Content } = Layout;

function AppContent() {
  const [collapsed, setCollapsed] = React.useState(false);
  const [user, setUser] = React.useState(null);
  const navigate = useNavigate();
  const [selectedKey, setSelectedKey] = React.useState('1');

  React.useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const handleLogin = (userData) => {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('user');
    navigate('/login');
  };

  if (!user) {
    return <Login onLogin={handleLogin} />;
  }

  const menuItems = user.type === 'trainer' ? [
    { key: '1', icon: <DashboardOutlined />, label: 'Dashboard', path: '/' },
    { key: '2', icon: <TeamOutlined />, label: 'Employees', path: '/employees' },
    { key: '12', icon: <CheckCircleOutlined />, label: 'Orientation Checklist', path: '/orientation' },
    { key: '3', icon: <BookOutlined />, label: 'Trainings', path: '/trainings' },
    { key: '6', icon: <CalendarOutlined />, label: 'Training Calendar', path: '/calendar' },
    { key: '13', icon: <UserOutlined />, label: 'Trainer Dashboard', path: '/trainer-dashboard' },
    { key: '7', icon: <BarChartOutlined />, label: 'Training Analytics', path: '/analytics' },
    { key: '8', icon: <FundProjectionScreenOutlined />, label: 'Department KPI', path: '/kpi' },
    { key: '9', icon: <CheckSquareOutlined />, label: 'Assign Test', path: '/assign-test' },
    { key: '11', icon: <ReloadOutlined />, label: 'Retraining Management', path: '/retraining' },
    { key: '4', icon: <FileTextOutlined />, label: 'Test Results', path: '/tests' },
    { key: '5', icon: <TrophyOutlined />, label: 'Competency Matrix', path: '/competency' },
    { key: 'logout', icon: <LogoutOutlined />, label: 'Logout', path: '/logout' }
  ] : [
    { key: '1', icon: <DashboardOutlined />, label: 'Dashboard', path: '/' },
    { key: '12', icon: <CheckCircleOutlined />, label: 'My Orientation', path: '/orientation' },
    { key: '3', icon: <BookOutlined />, label: 'My Trainings', path: '/trainings' },
    { key: '10', icon: <CheckSquareOutlined />, label: 'Take Test', path: '/take-test' },
    { key: '4', icon: <FileTextOutlined />, label: 'My Test Results', path: '/tests' },
    { key: '5', icon: <TrophyOutlined />, label: 'My Competency', path: '/competency' },
    { key: 'logout', icon: <LogoutOutlined />, label: 'Logout', path: '/logout' }
  ];
  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider collapsible collapsed={collapsed} onCollapse={setCollapsed}>
        <div className="logo">
          <h2>{collapsed ? 'GS' : 'Gautam Solar'}</h2>
        </div>
        <div style={{ color: 'white', padding: '0 16px', marginBottom: 16, fontSize: 12 }}>
          {!collapsed && (
            <div>
              <div>👤 {user.type === 'employee' ? 'Employee' : 'Trainer'}</div>
              <div style={{ color: '#bbb' }}>
                {user.type === 'employee' ? `ID: ${user.punchId}` : `ID: ${user.trainerId}`}
              </div>
            </div>
          )}
        </div>
        <Menu 
          theme="dark" 
          selectedKeys={[selectedKey]} 
          mode="inline"
          items={menuItems}
          onClick={({ key }) => {
            if (key === 'logout') {
              handleLogout();
              return;
            }
            setSelectedKey(key);
            const menuItem = menuItems.find(m => m.key === key);
            if (menuItem) navigate(menuItem.path);
          }}
        />
      </Sider>
      <Layout>
        <Header style={{ padding: '0 24px', background: '#fff', fontSize: 20, fontWeight: 600 }}>
          Gautam Solar - HR & Training Management System
        </Header>
        <Content style={{ margin: 0 }}>
          <Routes>
            <Route path="/" element={<Dashboard user={user} />} />
            <Route path="/employees" element={<Employees user={user} />} />
            <Route path="/trainings" element={<Trainings user={user} />} />
            <Route path="/tests" element={<TestResults user={user} />} />
            <Route path="/competency" element={<CompetencyMatrix user={user} />} />
            <Route path="/calendar" element={<TrainingCalendar user={user} />} />
            <Route path="/trainer-dashboard" element={<TrainerDashboard user={user} />} />
            <Route path="/analytics" element={<TrainingAnalytics user={user} />} />
            <Route path="/kpi" element={<DepartmentKPI user={user} />} />
            <Route path="/assign-test" element={<AssignTest user={user} />} />
            <Route path="/take-test" element={<TakeTest user={user} />} />
            <Route path="/retraining" element={<RetrainingManagement user={user} />} />
            <Route path="/orientation" element={<OrientationChecklist user={user} />} />
            <Route path="/login" element={<Login onLogin={handleLogin} />} />
          </Routes>
        </Content>
      </Layout>
    </Layout>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}

export default App;
