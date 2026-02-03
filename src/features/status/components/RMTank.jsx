import { Alert, Col, Row, Spin } from 'antd';
import React from 'react';
import StatusCard from './StatusCard';
import { useGetRmStatusQuery } from '@/store/api/statusApi';

const RMTank = ({ lastRefreshRM }) => {
  const { data, isLoading, isError, error } = useGetRmStatusQuery();

  const latestRefreshTime = data?.DateandTime || null;
  const rmTankData =
    data?.data?.map((tank) => ({
      name: tank.tank_name,
      value: tank.current_value,
      unit: tank.unit,
      status: tank.status,
      hexCode: tank.hex_code,
    })) || [];

  return (
    <Col xs={24} lg={24}>
      <div className="bg-slate-50/50 rounded-3xl border border-slate-100 p-6 shadow-sm h-full">
        <div className="flex justify-between items-center mb-4 px-2">
          <div className="bg-amber-400 px-4 py-1 rounded text-slate-900 font-bold text-sm uppercase">
            LIVE RM TANK STATUS
          </div>
        </div>

        <div className="bg-black text-white text-[10px] py-1 px-4 mb-6 flex justify-center font-mono tracking-widest uppercase">
          LAST REFRESH: {isLoading ? 'REFRESHING...' : latestRefreshTime || lastRefreshRM || 'N/A'}
        </div>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <Spin size="large" tip="Loading RM tank status..." />
          </div>
        ) : isError ? (
          <Alert
            message="Error"
            description={error?.data?.message || 'Failed to fetch RM tank status'}
            type="error"
            showIcon
            className="mb-6"
          />
        ) : (
          <Row gutter={[12, 12]}>
            {rmTankData.map((tank) => (
              <Col key={tank.id} xs={12} sm={8} md={6}>
                <StatusCard
                  title={tank.name}
                  value={tank.value}
                  hexCode={tank.hexCode}
                  status={tank.status}
                />
              </Col>
            ))}
          </Row>
        )}
      </div>
    </Col>
  );
};

export default RMTank;
