import React from 'react';
import { Layout } from 'antd';
import Header from '@/components/layout/Header';

const { Content } = Layout;

const AppLayout = ({ children }) => {
  return (
    <Layout className="min-h-screen bg-[#f8fafc]">
      <Header />
      <Content className="w-full max-w-(--breakpoint-2xl) mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-10">
        <div className="min-h-full">{children}</div>
      </Content>
    </Layout>
  );
};

export default AppLayout;
