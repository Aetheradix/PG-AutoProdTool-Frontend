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
          height: '120px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
        },
      }}
    >
      <h1 className=" text-xl font-semibold uppercase tracking-wider truncate">
        {title}
      </h1>
      <div className="flex justify-end">
        <h2 className=" text-2xl font-bold">
          {value?.toFixed(2) || 0} <span className="text-2xl align-baseline ml-1">{unit}</span>
        </h2>
      </div>
    </Card>
  );
};


export default StatusCard;