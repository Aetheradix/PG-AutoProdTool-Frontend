import React from 'react';
import { Card, Typography, Tooltip } from 'antd';

const { Text } = Typography;

const BatchCard = ({ id, batchId, brand, date, status, color, index, hexCode }) => {
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
    ? 'rgba(255, 255, 255, 0.6)'
    : 'rgba(15, 23, 42, 0.5)';

  return (
    <Tooltip
      title={
        <div className="p-1">
          <div className="font-bold border-b border-white/20 mb-1">Batch: {batchId}</div>
          <div className="text-[12px]">Brand: {brand}</div>
          <div className="text-[12px]">Date: {date}</div>
          <div className="text-[12px]">Status: {status}</div>
        </div>
      }
      placement="top"
      color="#1e293b"
    >
      <Card
        className={`border border-zinc-800 shadow-lg relative overflow-hidden h-full transform transition-all hover:scale-[1.02] duration-300 ${!hexCode && color ? `bg-${color}` : ''}`}
        style={{
          backgroundColor: hexCode || (color ? undefined : '#1a1a1a'),
          borderRadius: '40px',
          color: textColor,
          border: `2px solid black`,
        }}
        styles={{
          body: {
            padding: '24px',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            textAlign: 'center',
          },
        }}
      >
        <div className="absolute top-0 left-1/2 -translate-x-1/2 px-4 py-2 rounded-b-lg shadow-sm font-bold text-lg leading-none border border-zinc-700 bg-white text-black z-10 whitespace-nowrap">
          {id}
        </div>

        <div className="w-full mt-6 flex flex-col items-center justify-between h-full space-y-4">
          {/* Batch ID Section */}
          <div className="flex flex-col items-center">
            <p
              style={{ color: secondaryTextColor }}
              className="text-[10px] sm:text-xs font-bold uppercase tracking-widest mb-1"
            >
              BATCH ID
            </p>
            <div className="flex items-center gap-2">
              <p
                style={{ color: textColor }}
                className="text-2xl sm:text-3xl font-black tracking-tighter"
              >
                {batchId}
              </p>
              {/* Placeholder for Icon if status implies it (e.g. check/clock) - Keeping simple for now based on props */}
            </div>
          </div>

          {/* Brand Name */}
          <div className="w-full">
            <p
              style={{ color: secondaryTextColor }}
              className="text-[10px] font-bold uppercase tracking-widest mb-1"
            >
              BRAND_NAME
            </p>
            <h4
              style={{ color: textColor }}
              className="text-lg sm:text-xl font-extrabold uppercase leading-tight px-2 line-clamp-2"
            >
              {brand}
            </h4>
          </div>

          {/* Separator */}
          <div className="w-24 h-px bg-current opacity-20 my-2"></div>

          {/* Date Section */}
          <div className="flex flex-col items-center">
            <p
              style={{ color: secondaryTextColor }}
              className="text-[10px] font-bold uppercase tracking-widest mb-1"
            >
              NEXT_SAINT_DATE
            </p>
            <p
              style={{ color: textColor }}
              className="text-sm sm:text-base font-bold whitespace-nowrap"
            >
              {date}
            </p>
          </div>

          {/* Status Section */}
          <div className="mt-auto pt-2">
            <p
              style={{ color: secondaryTextColor }}
              className="text-[10px] font-bold uppercase tracking-widest mb-1"
            >
              STATUS
            </p>
            <div className="flex items-center justify-center gap-2">
              <span
                className={`w-2 h-2 rounded-full ${status?.includes('DUE') ? 'bg-red-500' : 'bg-green-500'}`}
              ></span>
              <p
                style={{ color: textColor }}
                className="text-sm sm:text-base font-black uppercase tracking-wide"
              >
                {status}
              </p>
            </div>
          </div>
        </div>
      </Card>
    </Tooltip>
  );
};

export default BatchCard;
