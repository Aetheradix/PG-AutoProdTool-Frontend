import React from 'react';
import { Card, Typography } from 'antd';

const { Text } = Typography;

const BatchCard = ({ batchId, brand, date, status, color, index, hexCode }) => {
  const normalizedHex = hexCode?.toLowerCase();
  const normalizedColor = color?.toLowerCase() || '';

  const isDarkBackground =
    normalizedHex === '#000000' ||
    normalizedHex === '#c00000' ||
    normalizedHex === '#1a1a1a' ||
    normalizedHex === '#ff00ff' ||
    normalizedColor.includes('black') ||
    normalizedColor.includes('red') ||
    normalizedColor.includes('dark') ||
    normalizedColor.includes('magenta') ||
    normalizedColor.includes('pink');

  const textColor = isDarkBackground ? '#ffffff' : '#0f172a';
  const secondaryTextColor = isDarkBackground
    ? 'rgba(255, 255, 255, 0.7)'
    : 'rgba(15, 23, 42, 0.7)';
  const badgeBg = isDarkBackground ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.1)';

  return (
    <Card
      className={`border-none shadow-md relative overflow-hidden h-full transition-all hover:-translate-y-1 ${!hexCode && color ? `bg-${color}` : ''}`}
      style={{
        backgroundColor: hexCode || (color ? undefined : '#1a1a1a'),
        color: textColor,
      }}
      styles={{ body: { padding: '16px' } }}
    >
      <div
        className="absolute top-2 right-2 flex items-center justify-center w-6 h-6 rounded-full text-[10px] font-bold"
        style={{ backgroundColor: badgeBg, color: textColor }}
      >
        {index}
      </div>

      <div className="space-y-3">
        <div>
          <Text style={{ color: secondaryTextColor }} className="text-[10px] font-bold block">
            BATCH ID
          </Text>
          <Text style={{ color: textColor }} className="text-xl font-black">
            {batchId}
          </Text>
        </div>

        <div>
          <Text
            style={{ color: secondaryTextColor }}
            className="text-[10px] font-bold block uppercase tracking-tighter"
          >
            {brand}
          </Text>
          <Text
            style={{ color: secondaryTextColor }}
            className="text-[10px] font-medium block leading-tight"
          >
            NEXT_SAINT_DATE
          </Text>
          <Text style={{ color: textColor }} className="text-[10px] font-bold block">
            {date}
          </Text>
        </div>

        <div>
          <Text style={{ color: secondaryTextColor }} className="text-[10px] font-bold block">
            STATUS
          </Text>
          <Text style={{ color: textColor }} className="text-xs font-bold block">
            {status}
          </Text>
        </div>
      </div>
    </Card>
  );
};

export default BatchCard;
