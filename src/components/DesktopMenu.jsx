import { Menu } from 'antd';
import React from 'react';

const DesktopMenu = ({ menuItems, onMenuClick, location }) => {
  return (
    <Menu
      mode="horizontal"
      selectedKeys={[location.pathname]}
      items={menuItems}
      onClick={onMenuClick}
      className="desktop-menu hidden md:flex"
      style={{ flex: 1, border: 'none', minWidth: 0, justifyContent: 'center' }}
    />
  );
};

export default DesktopMenu;
