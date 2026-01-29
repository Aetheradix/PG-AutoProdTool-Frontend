import { Col, Row } from 'antd';
import React from 'react';
import StatusCard from './StatusCard';

const RMTank = ({ lastRefreshRM ,rmTankData}) => {
  return (
    <Col xs={24} lg={24}>
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
  );
};

export default RMTank;
