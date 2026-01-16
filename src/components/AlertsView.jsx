import React from 'react';
import { List, Button, Space, Typography, Card, Tag, Avatar } from 'antd';
import { FiBell, FiUser, FiSend, FiAlertTriangle, FiAlertCircle } from 'react-icons/fi';

const { Title, Text } = Typography;

export function AlertsView() {
  const alerts = [
    {
      id: 1,
      message: 'Premix/RM deadstock breach projected for Batch B002. Check material availability.',
      type: 'warning',
      icon: <FiAlertTriangle className="text-amber-600" size={20} />,
    },
    {
      id: 2,
      message: 'Unresolved conflict: Tank T04 is unavailable for Batch B005 start time. Please adjust the schedule.',
      type: 'error',
      icon: <FiAlertCircle className="text-rose-600" size={20} />,
    },
  ];

  return (
    <div className="space-y-6">
      <header>
        <Title level={4} className="m-0! font-bold text-slate-800">
          Alerts & Reminders
        </Title>
      </header>

      <div className="space-y-3">
        {alerts.map((alert) => (
          <div
            key={alert.id}
            className={`flex items-center gap-4 p-4 rounded-xl border ${alert.type === 'error'
                ? 'bg-rose-50 border-rose-100'
                : 'bg-amber-50 border-amber-100'
              }`}
          >
            <div className="shrink-0">{alert.icon}</div>
            <Text className={`text-sm font-medium ${alert.type === 'error' ? 'text-rose-900' : 'text-amber-900'
              }`}>
              {alert.message}
            </Text>
          </div>
        ))}
      </div>
    </div>
  );
}
