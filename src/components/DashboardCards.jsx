import React from 'react';
import { Card, Button, Typography } from 'antd';
import { useNavigate } from 'react-router-dom';
import { dashboardCardsData } from '../utils/cardsData';

const { Title, Text } = Typography;

export function DashboardCards() {
  const navigate = useNavigate();

  return (
    <div className="w-full mx-auto">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {dashboardCardsData.map((card, index) => (
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
