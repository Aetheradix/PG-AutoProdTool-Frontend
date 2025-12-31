import { Layout, Menu, Avatar, Dropdown, Space, Typography } from 'antd';
import { FiHome, FiDatabase, FiActivity, FiPieChart, FiLogOut, FiUser } from 'react-icons/fi';
import { useAuth } from '@/context/AuthContext';

const { Header, Content } = Layout;
const { Text } = Typography;

const MainLayout = ({ children }) => {
  const { user, logout } = useAuth();

  const menuItems = [
    { key: 'home', icon: <FiHome />, label: 'Home Page' },
    { key: 'master', icon: <FiDatabase />, label: 'Master Data' },
    { key: 'status', icon: <FiActivity />, label: 'Current Status' },
    { key: 'kpi', icon: <FiPieChart />, label: 'KPI Dashboard' },
  ];

  const userMenuItems = [
    {
      key: 'profile',
      label: 'Profile',
      icon: <FiUser />,
    },
    {
      key: 'logout',
      label: 'Logout',
      icon: <FiLogOut />,
      onClick: logout,
    },
  ];

  return (
    <Layout className="min-h-screen bg-[#F8FAFC]">
      <Header
        style={{
          position: 'sticky',
          top: 0,
          zOrder: 1,
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          background: '#fff',
          padding: '0 24px',
          boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.03)',
          borderBottom: '1px solid #f0f0f0',
          height: '64px',
        }}
      >
        <div className="flex items-center gap-8 w-full">
          <h1 className="text-xl font-bold tracking-tight m-0 shrink-0">
            <span style={{ color: '#0f172a' }}>Production </span>
            <span style={{ color: '#3b82f6' }}>Planning</span>
          </h1>

          <Menu
            mode="horizontal"
            defaultSelectedKeys={['home']}
            items={menuItems}
            style={{ flex: 1, border: 'none', minWidth: 0 }}
          />

          <div className="flex items-center gap-4 shrink-0">
            <Dropdown menu={{ items: userMenuItems }} placement="bottomRight" arrow>
              <Space className="cursor-pointer">
                <div className="text-right hidden sm:block">
                  <Text strong style={{ fontSize: '14px', display: 'block',  }}>
                    {user?.name || 'Planner Client'}
                  </Text>
                  <Text type="secondary" style={{ fontSize: '12px' }}>
                    Administrator
                  </Text>
                </div>
                <Avatar
                  src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix"
                  size={40}
                  style={{ border: '2px solid #fff', boxShadow: '0 0 0 2px #f1f5f9' }}
                />
              </Space>
            </Dropdown>
          </div>
        </div>
      </Header>
      <Content className="container mx-auto px-6 py-8">
        <div style={{ minHeight: '100%' }}>{children}</div>
      </Content>
    </Layout>
  );
};

export default MainLayout;
