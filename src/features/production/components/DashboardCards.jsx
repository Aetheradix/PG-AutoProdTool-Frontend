import React from 'react';
import { Card, Button, Typography, Space } from 'antd';
import { FiExternalLink, FiFileText, FiBarChart2, FiLayers } from 'react-icons/fi';

const { Title, Text } = Typography;

const cards = [
  {
    title: 'Last Available Plan',
    action: 'Open',
    icon: <FiFileText size={32} className="text-blue-500" />,
    description: 'Access the most recently generated production schedule.',
  },
  {
    title: 'BPR-PDR Sheet',
    action: 'Open',
    icon: <FiLayers size={32} className="text-blue-500" />,
    description: 'Review and update the BPR-PDR production logs.',
  },
  {
    title: 'Statistics',
    action: 'Open',
    icon: <FiBarChart2 size={32} className="text-blue-500" />,
    description: 'View detailed performance metrics and KPIs.',
  },
];

export function DashboardCards() {
  return (
    <div className="w-full max-w-5xl mx-auto space-y-6">
      <Title level={4} className="text-slate-800 m-0">Explore More Resources</Title>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {cards.map((card, index) => (
          <Card
            key={index}
            hoverable
            className="rounded-2xl border-slate-100 flex flex-col"
            styles={{ body: { flex: 1, display: 'flex', flexDirection: 'column', padding: '24px' } }}
          >
            <div className="flex flex-col items-center text-center space-y-4 flex-1">
              <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center">
                {card.icon}
              </div>
              <div>
                <Title level={5} className="mb-2">{card.title}</Title>
                <Text type="secondary" className="block min-h-10">
                  {card.description}
                </Text>
              </div>
            </div>
            <Button
              type="primary"
              ghost
              icon={<FiExternalLink />}
              className="w-full mt-6 h-10 rounded-xl font-semibold border-blue-200"
            >
              {card.action}
            </Button>
          </Card>
        ))}
      </div>
    </div>
  );
}
