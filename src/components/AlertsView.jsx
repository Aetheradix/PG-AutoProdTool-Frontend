import React from 'react';
import { Typography } from 'antd';
import { alertsData } from '../utils/alertsData';

const { Title, Text } = Typography;

export function AlertsView() {
  return (
    <div className="space-y-6">
      <header>
        <Title level={4} className="m-0! font-bold text-slate-800">
          Alerts & Reminders
        </Title>
      </header>

      <div className="space-y-3">
        {alertsData.map((alert) => (
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
