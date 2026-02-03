import React from 'react';
import { Card, Typography } from 'antd';

const { Text } = Typography;

const StatusCard = ({ title, value, hexCode, status }) => {
  return (
    <Card
      className={`border-none bg-[${hexCode}] transition-transform hover:scale-[1.02] cursor-pointer shadow-sm`}
      styles={{ body: { padding: '16px', background: hexCode } }}
    >
      <Text className="text-white/90 text-xs font-semibold block mb-4 uppercase tracking-wider">
        {title}
      </Text>
      <div className="flex items-baseline justify-end gap-1">
        <Text className="text-white text-3xl font-bold">{value}</Text>
        {/* <Text className="text-white/80 text-sm font-medium">{status && <Text>{status}</Text>}</Text> */}
      </div>
    </Card>
  );
};

export default StatusCard;
