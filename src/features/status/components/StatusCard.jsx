import React from 'react';
import { Card, Typography, Tooltip } from 'antd';

const { Text } = Typography;

const StatusCard = ({ title, value, hexCode, unit, status ,deadStock}) => {


  const normalizedHex = hexCode?.toLowerCase();
  const isDarkBackground =
    normalizedHex === '#000000' ||
    normalizedHex === '#c00000' ||
    normalizedHex === '#1a1a1a' ||
    normalizedHex === '#ff00ff';

  const textColor = isDarkBackground ? '#ffffff' : '#0f172a';
  const secondaryTextColor = isDarkBackground
    ? 'rgba(255, 255, 255, 0.6)'
    : 'rgba(15, 23, 42, 0.5)';

  return (
    <Tooltip
      title={
        <div className="p-1">
          <div className="font-bold border-b text-lg border-white/20 mb-1">{title}</div>
          <div className="text-xl">Value: {value.toFixed(2)} {unit}</div>
          <div className="text-xl">DeadStock : {deadStock}</div>
        </div>
      }
      placement="top"
      color="#1e293b"
    >
      <Card
        className="border border-zinc-800 shadow-lg relative overflow-hidden h-full transform transition-all hover:scale-[1.02] duration-300"
        style={{
          backgroundColor: hexCode || '#1a1a1a',
          borderRadius: '40px',
          color: textColor,
          border: `2px solid black`,
        }}
        styles={{
          body: {
            padding: '24px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            textAlign: 'center',
            justifyContent: 'center'
          },
        }}
      >
        <div className="w-full flex flex-col items-center justify-center h-full">
          <div className="w-full">
            <h1 className="text-2xl font-extrabold uppercase leading-tight px-2 truncate w-full">
              {title}
            </h1>
          </div>

          <div className="mt-2">
            <h2 className="text-2xl font-black">
              {value.toFixed(2)} <span className="text-3xl align-baseline ml-1">{unit}</span>
            </h2>
          </div>
        </div>
      </Card>
    </Tooltip>
  );
};

export default StatusCard;

