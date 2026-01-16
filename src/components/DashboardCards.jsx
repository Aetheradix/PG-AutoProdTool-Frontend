import React from 'react';
import { Card, Button, Typography } from 'antd';
import { useNavigate } from 'react-router-dom';
import {
  FiPlusCircle,
  FiFileText,
  FiActivity,
  FiPieChart,
  FiSettings
} from 'react-icons/fi';

const { Title, Text } = Typography;

const cards = [
  {
    title: 'Create Production Plan',
    action: 'Start Planning',
    path: '/create-production-plan', 
    icon: <FiPlusCircle size={24} className="text-blue-600" />,
    description: 'Generate a new 24-hour shift-wise plan for a selected date.',
  },
  {
    title: 'View Last Plan',
    action: 'Open Plan',
    path: '/view-last-plan',
    icon: <FiFileText size={24} className="text-blue-600" />,
    description: 'Review and tweak the most recently generated production plan.',
  },
  {
    title: 'Current Status',
    action: 'View Live Status',
    path: '/current-status',
    icon: <FiActivity size={24} className="text-blue-600" />,
    description: 'View live status of Raw Material tanks and Transfer Tank Systems.',
  },
  {
    title: 'KPI Dashboard',
    action: 'View KPIs',
    path: '/kpi',
    icon: <FiPieChart size={24} className="text-blue-600" />,
    description: 'Analyze performance metrics like utilization, washouts, and lateness.',
  },
  {
    title: 'Master Data',
    action: 'Manage Data',
    path: '/master-data',
    icon: <FiSettings size={24} className="text-blue-600" />,
    description: 'View and edit core data like BCTs, washout matrices, and buffers.',
  },
];

export function DashboardCards() {
  const navigate = useNavigate();

  return (
    <div className="w-full mx-auto">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {cards.map((card, index) => (
          <Card
            key={index}
            className="rounded-xl border-slate-100 shadow-sm hover:shadow-md transition-all duration-300"
            styles={{ body: { padding: '24px' } }}
          >
            <div className="flex items-start gap-4 mb-6">
              <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center shrink-0">
                {card.icon}
              </div>
              <div>
                <Title level={5} className="m-0! font-bold text-slate-800">{card.title}</Title>
                <Text type="secondary" className="text-sm block mt-1 leading-relaxed">
                  {card.description}
                </Text>
              </div>
            </div>
            <Button
              type="primary"
              block
              onClick={() => navigate(card.path)}
              className="h-11 rounded-lg font-bold bg-blue-600 hover:bg-blue-700 transition-colors border-none"
            >
              {card.action}
            </Button>
          </Card>
        ))}
      </div>
    </div>
  );
}
