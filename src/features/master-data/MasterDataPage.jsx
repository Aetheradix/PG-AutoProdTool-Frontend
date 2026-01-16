import React from 'react';
import { Card, Typography, Space, Button, Table, Tag } from 'antd';
import { FiDatabase, FiPlus, FiLock } from 'react-icons/fi';

const { Title, Text } = Typography;

export function MasterDataPage() {
  const columns = [
    { title: 'Category', dataIndex: 'category', key: 'category' },
    { title: 'Item Name', dataIndex: 'name', key: 'name' },
    {
      title: 'Status',
      key: 'status',
      render: (_, record) => (
        <Tag color={record.status === 'Active' ? 'success' : 'warning'}>{record.status}</Tag>
      ),
    },
  ];

  const dataSource = [
    { key: '1', category: 'Raw Materials', name: 'Material A', status: 'Active' },
    { key: '2', category: 'Machines', name: 'Machine B', status: 'Maintenance' },
    { key: '3', category: 'Tanks', name: 'Tank TC-01', status: 'Active' },
  ];

  return (
    <div className="fade-in space-y-8">
      <header className="master-data-header">
        <div>
          <Title level={2} className="m-0!">
            Master Data Management
          </Title>
          <Text type="secondary">View and manage production assets and categories.</Text>
        </div>
        <Space>
          <Button icon={<FiLock />} className="rounded-xl">
            Admin Login
          </Button>
          <Button type="primary" icon={<FiPlus />} className="rounded-xl h-11 px-6">
            Add New Entry
          </Button>
        </Space>
      </header>

      <Card className="master-data-card" styles={{ body: { padding: 0 } }}>
        <Table
          columns={columns}
          dataSource={dataSource}
          pagination={false}
          className="master-data-table"
        />
      </Card>
    </div>
  );
}
