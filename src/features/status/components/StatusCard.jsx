import React from 'react';
import { Card, Typography } from 'antd';

const { Text } = Typography;

const StatusCard = ({ title, value, hexCode, unit }) => {
  return (
    <Card
      className="border-none transition-transform hover:scale-[1.02] cursor-pointer shadow-sm"
      styles={{
        body: {
          padding: '16px',
          background: hexCode,
          height: '110px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
        },
      }}
    >
      <Text className="text-white/90 text-xs font-semibold uppercase tracking-wider">
        {title}
      </Text>
      <div className="flex justify-end">
        <Text className="text-white text-3xl font-bold">
          {value} <span className="text-sm align-baseline ml-1">{unit}</span>
        </Text>
      </div>
    </Card>
  );
};


export default StatusCard;