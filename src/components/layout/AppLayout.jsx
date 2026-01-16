import React from 'react';
import { Layout } from 'antd';
import Header from '@/components/layout/Header';

const { Content } = Layout;

const AppLayout = ({ children }) => {
  return (
    <Layout className="app-layout">
      <Header />
      <Content className="main-content">
        <div style={{ minHeight: '100%' }}>{children}</div>
      </Content>
    </Layout>

  );
};

export default AppLayout;
