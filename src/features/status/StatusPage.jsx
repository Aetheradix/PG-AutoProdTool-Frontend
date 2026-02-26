import React, { useMemo } from 'react';
import { Row, Typography } from 'antd';
import { useGetRmStatusQuery, useGetStatusQuery } from '../../store/api/statusApi';
import RMTank from './components/RMTank';
import TTSTank from './components/TTSTank';

const { Title } = Typography;

export function StatusPage() {
  const { data: statusData, isLoading, isError, error } = useGetStatusQuery();
  const {
    data: rmData,
    isLoading: isRMLoading,
    isError: isRMError,
    error: rmError,
  } = useGetRmStatusQuery();

  const rawData = Array.isArray(statusData) ? statusData : statusData?.data || [];

  const getLatestDate = (item) => {
    if (item.latest_dt && item.latest_dt.length > 5) {
      return new Date(item.latest_dt).getTime();
    }

    const dateValues = Object.keys(item)
      .filter((key) => key.startsWith('DT#_'))
      .map((key) => item[key])
      .filter((val) => val && typeof val === 'string' && val.length > 5)
      .map((val) => new Date(val).getTime())
      .filter((time) => !isNaN(time));

    return dateValues.length > 0 ? Math.max(...dateValues) : 0;
  };

  const productionData = useMemo(() => {
    const desiredIds = [
      ...Array.from({ length: 28 }, (_, i) => i + 1),
      51, 52, 53
    ];

    return rawData
      .filter((item) => {
        const id = parseInt(item.ID || item.id);
        return desiredIds.includes(id);
      })
      .map((item) => ({
        ...item,
        id: item.ID || item.id || 'N/A',
        batchId: item.BATCH_NO || item.batch_no || 'N/A',
        brand: item.BRAND_NAME || item.brand_name || 'N/A',
        status: item.status || item.STATUS || 'Active',
        hexCode: item.hex_code || item.HEX_CODE,
        colorName: item.color_name || item.colour_name || item.COLOR_NAME || item.COLOUR_NAME,
        timestamp: getLatestDate(item),
      }))
      .sort((a, b) => a.id - b.id);
  }, [rawData]);

  const lastRefreshTTS = useMemo(() => {
    if (productionData.length === 0) return 'N/A';
    const maxTimestamp = Math.max(...productionData.map(item => item.timestamp));
    return maxTimestamp > 0 ? new Date(maxTimestamp).toLocaleString() : 'N/A';
  }, [productionData]);

  const lastRefreshRM = rmData?.DateandTime || 'N/A';

  const mappedRMTankData = React.useMemo(() => {
    return (
      rmData?.data?.map((tank) => ({
        id: tank.tank_name,
        name: tank.tank_name,
        status: tank.status,
        hexCode: tank.hex_code,
        unit: tank.value_with_unit,
        deadStock: tank.dead_stock,
      })) || []
    );
  }, [rmData]);

  return (
    <div className="fade-in space-y-6 pb-8">
      <header className="flex justify-center mb-8">
        <Title level={2} className="m-0! text-blue-600 font-extrabold tracking-tight">
          Current Status
        </Title>
      </header>

      <Row gutter={[32, 32]}>
        {/* Left Column - RM TANK STATUS */}
        <RMTank
          data={mappedRMTankData}
          isLoading={isRMLoading}
          isError={isRMError}
          error={rmError}
          lastRefreshRM={lastRefreshRM}
        />

        {/* Right Column - LIVE RECENT DATA (Replacing TTS TANK STATUS) */}
        <TTSTank
          isLoading={isLoading}
          lastRefreshTTS={lastRefreshTTS}
          productionData={productionData}
          error={error}
          isError={isError}
        />
      </Row>
    </div>
  );
}
