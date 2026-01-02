import React from 'react';
import { Layout } from 'antd';
import Header from '@/components/layout/Header';

const { Content } = Layout;

const AppLayout = ({ children }) => {
  return (
    <Layout className="min-h-screen bg-[#F8FAFC]">
      <Header />
      <Content className="container mx-auto px-6 py-8">
        <div style={{ minHeight: '100%' }}>{children}</div>
      </Content>
    </Layout>
  );
};

export default AppLayout;
