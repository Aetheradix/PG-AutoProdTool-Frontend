import { Avatar, Button, Dropdown, Layout, Space, Typography } from 'antd';
import { FiMenu } from 'react-icons/fi';

const { Header: AntHeader } = Layout;
const { Text } = Typography;

const DesktopUserDropdown = ({ user, userMenuItems, setMobileVisible }) => {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexShrink: 0 }}>
      {/* Desktop User Dropdown */}
      <div className="desktop-user" style={{ display: 'none' }}>
        <Dropdown menu={{ items: userMenuItems }} placement="bottomRight" arrow>
          <Space style={{ cursor: 'pointer' }}>
            <div className="user-text" style={{ textAlign: 'right' }}>
              <Text strong style={{ fontSize: '14px', display: 'block' }}>
                {user?.name || 'Planner Client'}
              </Text>
              <Text type="secondary" style={{ fontSize: '12px' }}>
                Administrator
              </Text>
            </div>
            <Avatar
              src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.name || 'Planner'}`}
              size={40}
              style={{ border: '2px solid #fff', boxShadow: '0 0 0 2px #f1f5f9' }}
            />
          </Space>
        </Dropdown>
      </div>

      {/* Mobile Menu Toggle */}
      <Button
        className="mobile-toggle"
        icon={<FiMenu size={20} />}
        onClick={() => setMobileVisible(true)}
        style={{ display: 'none', alignItems: 'center', justifyContent: 'center' }}
      />
    </div>
  );
};

export default DesktopUserDropdown;
