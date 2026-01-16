import React from 'react';
import { Typography, Row, Col, Space } from 'antd';
import StatusCard from './components/StatusCard';
import BatchCard from './components/BatchCard';
import { rmTankData, ttsTankData } from './statusData';

const { Title, Text } = Typography;

export function StatusPage() {
  const lastRefreshRM = '9/9/2025 7:38:09 AM';
  const lastRefreshTTS = '9/9/2025 7:33:07 AM';

  return (
    <div className="fade-in space-y-6 pb-8">
      <header className="flex justify-center mb-8">
        <Title level={2} className="m-0! text-blue-600 font-extrabold tracking-tight">
          Current Status
        </Title>
      </header>

      <Row gutter={[32, 32]}>
        {/* Left Column - RM TANK STATUS */}
        <Col xs={24} lg={12}>
          <div className="bg-slate-50/50 rounded-3xl border border-slate-100 p-6 shadow-sm h-full">
            <div className="flex justify-between items-center mb-4 px-2">
              <div className="bg-amber-400 px-4 py-1 rounded text-slate-900 font-bold text-sm uppercase">
                LIVE RM TANK STATUS
              </div>
              
            </div>

            <div className="bg-black text-white text-[10px] py-1 px-4 mb-6 flex justify-center font-mono tracking-widest uppercase">
              LAST REFRESH: {lastRefreshRM}
            </div>

            <Row gutter={[12, 12]}>
              {rmTankData.map((tank) => (
                <Col key={tank.id} xs={12} sm={8} md={6}>
                  <StatusCard
                    title={tank.name}
                    value={tank.value}
                    unit={tank.unit}
                    status={tank.status}
                  />
                </Col>
              ))}
            </Row>
          </div>
        </Col>

        {/* Right Column - TTS TANK STATUS */}
        <Col xs={24} lg={12}>
          <div className="bg-slate-50/50 rounded-3xl border border-slate-100 p-6 shadow-sm h-full">
            <div className="flex justify-between items-center mb-4 px-2">
              <div className="bg-amber-400 px-4 py-1 rounded text-slate-900 font-bold text-sm uppercase">
                LIVE TTS TANK STATUS
              </div>
              
            </div>

            <div className="bg-black text-white text-[10px] py-1 px-4 mb-6 flex justify-center font-mono tracking-widest uppercase">
              LAST REFRESH: {lastRefreshTTS}
            </div>

            <Row gutter={[12, 12]}>
              {ttsTankData.map((batch, index) => (
                <Col key={batch.id} xs={12} sm={8} md={4.8} className="!flex">
                  <div className="w-full">
                    <BatchCard
                      {...batch}
                      index={index + 1}
                    />
                  </div>
                </Col>
              ))}
            </Row>
          </div>
        </Col>
      </Row>
    </div>
  );
}
