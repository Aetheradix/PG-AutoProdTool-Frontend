import { useAuth } from '@/context/AuthContext';
import { Avatar, Drawer, Dropdown, Layout, Menu, Space, Typography } from 'antd';
import { useState } from 'react';
import {
  FiActivity,
  FiDatabase,
  FiHome,
  FiLogOut,
  FiPieChart,
  FiUser
} from 'react-icons/fi';
import { useLocation, useNavigate } from 'react-router-dom';
import DesktopMenu from '../DesktopMenu';
import DesktopUserDropdown from '../DesktopUserDropdown';

const { Header: AntHeader } = Layout;
const { Text } = Typography;

const Header = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileVisible, setMobileVisible] = useState(false);

  const menuItems = [
    { key: '/', icon: <FiHome />, label: 'Home Page' },
    { key: '/upload', icon: <FiDatabase />, label: 'Upload Data' },
    { key: '/plan-view', icon: <FiActivity />, label: 'Plan View' },
    { key: '/master-data', icon: <FiDatabase />, label: 'Master Data' },
    { key: '/status', icon: <FiActivity />, label: 'Current Status' },
    { key: '/kpi', icon: <FiPieChart />, label: 'KPI Dashboard' },
  ];

  const onMenuClick = (e) => {
    navigate(e.key);
    setMobileVisible(false);
  };

  const userMenuItems = [
    {
      key: 'profile',
      label: 'Profile',
      icon: <FiUser />,
      onClick: () => navigate('/profile'),
    },
    {
      key: 'logout',
      label: 'Logout',
      icon: <FiLogOut />,
      onClick: logout,
    },
  ];

  return (
    <AntHeader
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 1000,
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        background: '#fff',
        padding: '0 16px',
        boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.03)',
        borderBottom: '1px solid #f0f0f0',
        height: '64px',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '16px',
          width: '100%',
          justifyContent: 'space-between',
        }}
      >
        {/* Logo Section */}
        <h1
          className="logo-text"
          style={{ fontWeight: 'bold', margin: 0, cursor: 'pointer', flexShrink: 0 }}
          onClick={() => navigate('/')}
        >
          <span style={{ color: '#0f172a' }}>Production </span>
          <span style={{ color: '#3b82f6' }}>Planning</span>
        </h1>

        {/* Desktop Menu */}
        <DesktopMenu menuItems={menuItems} onMenuClick={onMenuClick} location={location} />

        {/* Right Section */}
        <DesktopUserDropdown
          user={user}
          userMenuItems={userMenuItems}
          setMobileVisible={setMobileVisible}
        />
      </div>

      {/* Mobile Drawer */}
      <Drawer
        title={
          <Dropdown menu={{ items: userMenuItems }} placement="bottomRight" arrow>
            <Space style={{ cursor: 'pointer' }}>
              <div style={{ textAlign: 'right' }}>
                <Text strong style={{ fontSize: '14px', display: 'block' }}>
                  {user?.name || 'Planner Client'}
                </Text>
                <Text type="secondary" style={{ fontSize: '12px', textTransform: 'capitalize' }}>
                  {user?.role || 'Guest'}
                </Text>
              </div>
              <Avatar
                src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.name || 'Planner'}`}
                size={40}
                style={{ border: '2px solid #fff', boxShadow: '0 0 0 2px #f1f5f9' }}
              />
            </Space>
          </Dropdown>
        }
        placement="right"
        onClose={() => setMobileVisible(false)}
        open={mobileVisible}
        size={280}
        styles={{ body: { padding: 0 } }}
      >
        <Menu
          mode="vertical"
          selectedKeys={[location.pathname]}
          items={menuItems}
          onClick={onMenuClick}
          style={{ border: 'none', padding: '12px 0' }}
        />
      </Drawer>
    </AntHeader>
  );
};

export default Header;
