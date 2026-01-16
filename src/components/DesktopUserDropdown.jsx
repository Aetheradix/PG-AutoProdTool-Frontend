import { Avatar, Button, Dropdown, Layout, Space, Typography } from 'antd';
import { FiMenu } from 'react-icons/fi';

const { Header: AntHeader } = Layout;
const { Text } = Typography;

const DesktopUserDropdown = ({ user, userMenuItems, setMobileVisible }) => {
  return (
    <div
      style={{ display: 'flex', alignItems: 'center', gap: '12px', flexShrink: 0 }}
      className=""
    >
      {/* Desktop User Dropdown */}
      <div className="flex items-center gap-3 shrink-0 ml-auto">
        {/* Desktop User Dropdown */}
        <div className="hidden md:flex items-center">
          <Dropdown menu={{ items: userMenuItems }} placement="bottomRight" arrow>
            <Space className="cursor-pointer" align="center">
              <div className="text-right leading-tight">
                <Text strong className="text-sm block mb-0.5">
                  {user?.name || 'Planner Client'}
                </Text>
                <Text type="secondary" className="text-xs capitalize">
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
        </div>
      </div>
      {/* Mobile Menu Toggle */}
      <Button
        className="mobile-toggle flex md:hidden"
        icon={<FiMenu size={20} />}
        onClick={() => setMobileVisible(true)}
        style={{ alignItems: 'center', justifyContent: 'center' }}
      />
    </div>
  );
};

export default DesktopUserDropdown;
