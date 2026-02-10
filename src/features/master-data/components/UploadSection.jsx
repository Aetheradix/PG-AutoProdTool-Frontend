import React from 'react';
import { Button, Typography } from 'antd';
import { UploadOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;

export function UploadSection({ onOpenModal }) {
  return (
    <div className="flex flex-col items-center justify-center" style={{ minHeight: '400px' }}>
      <UploadOutlined style={{ fontSize: '64px', color: '#3b82f6', marginBottom: '24px' }} />
      <Title level={3} className="text-slate-800 mb-4">
        Upload Excel Data
      </Title>
      <Text className="text-slate-500 mb-8 text-center max-w-md">
        Click the button below to open the upload interface where you can upload, edit, and submit
        your Excel data.
      </Text>
      <Button
        type="primary"
        size="large"
        icon={<UploadOutlined />}
        onClick={onOpenModal}
        className="bg-blue-600 h-12 px-8 rounded-lg font-bold border-none shadow-md hover:shadow-lg transition-all"
      >
        Open Upload Interface
      </Button>
    </div>
  );
}
