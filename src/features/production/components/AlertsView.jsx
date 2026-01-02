import React from 'react';
import { List, Button, Space, Typography, Card, Tag, Avatar } from 'antd';
import { FiBell, FiUser, FiSend } from 'react-icons/fi';

const { Title, Text } = Typography;

export function AlertsView() {
  const data = [
    {
      id: 1,
      title: 'Machine 2 Delay',
      message: 'Anticipated 15 min delay due to cleaning.',
      type: 'Warning',
      owner: 'John Doe',
    },
    {
      id: 2,
      title: 'RM Shortage',
      message: 'Beta supply reaching critical level.',
      type: 'Urgent',
      owner: 'Jane Smith',
    },
  ];

  return (
    <div className="space-y-6">
      <header>
        <Title level={4} className="m-0!">
          Alerts & Reminders
        </Title>
        <Text type="secondary">System notifications and assigned tasks.</Text>
      </header>

      <List
        grid={{ gutter: 16, column: 1 }}
        dataSource={data}
        renderItem={(item) => (
          <List.Item>
            <Card className="rounded-2xl border-slate-100 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start">
                <Space size="middle">
                  <Avatar
                    icon={<FiBell />}
                    className={
                      item.type === 'Urgent'
                        ? 'bg-rose-100 text-rose-600'
                        : 'bg-amber-100 text-amber-600'
                    }
                  />
                  <div>
                    <Text strong className="block">
                      {item.title}
                    </Text>
                    <Text type="secondary">{item.message}</Text>
                  </div>
                </Space>
                <div className="text-right">
                  <Tag color={item.type === 'Urgent' ? 'error' : 'warning'}>{item.type}</Tag>
                  <div className="mt-2 flex items-center gap-2 text-xs text-slate-500">
                    <FiUser /> {item.owner}
                  </div>
                </div>
              </div>
              <div className="mt-4 flex gap-2">
                <Button size="small" icon={<FiSend />} className="rounded-lg">
                  Share Notification
                </Button>
                <Button size="small" type="primary" ghost className="rounded-lg">
                  Assign Owner
                </Button>
              </div>
            </Card>
          </List.Item>
        )}
      />
    </div>
  );
}
