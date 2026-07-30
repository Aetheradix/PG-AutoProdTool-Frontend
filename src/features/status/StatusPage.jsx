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

  console.log('StatusPage statusData:', statusData);
  console.log('StatusPage rmData:', rmData);

  const rawData = Array.isArray(statusData) ? statusData : statusData?.data || [];

  const getLatestDate = (item) => {
    if (item.latest_dt && typeof item.latest_dt === 'string' && item.latest_dt.length > 5) {
      const parsed = new Date(item.latest_dt.replace(' ', 'T')).getTime();
      if (!isNaN(parsed) && parsed > 0) return parsed;
    }

    if (item.DateAndTime && typeof item.DateAndTime === 'string' && item.DateAndTime.length > 5) {
      const parsed = new Date(item.DateAndTime.replace(' ', 'T')).getTime();
      if (!isNaN(parsed) && parsed > 0) return parsed;
    }

    const dateValues = Object.keys(item)
      .filter((key) => key.startsWith('DT#_'))
      .map((key) => item[key])
      .filter((val) => val && typeof val === 'string' && val.length > 5)
      .map((val) => new Date(val.replace(' ', 'T')).getTime())
      .filter((time) => !isNaN(time) && time > 0);

    return dateValues.length > 0 ? Math.max(...dateValues) : 0;
  };

  const productionData = useMemo(() => {
    const desiredIds = [
      ...Array.from({ length: 28 }, (_, i) => i + 1),
      51, 52, 53
    ];

    const filtered = rawData.filter((item) => {
      const id = parseInt(item.ID || item.id);
      return !isNaN(id) ? desiredIds.includes(id) : true;
    });

    const listToMap = filtered.length > 0 ? filtered : rawData;

    return listToMap
      .map((item) => ({
        ...item,
        id: item.ID || item.id || item.Tagname || 'N/A',
        batchId: item.BATCH_NO || item.batch_no || 'N/A',
        brand: item.BRAND_NAME || item.brand_name || 'N/A',
        status: item.status || item.STATUS || 'Active',
        hexCode: item.hex_code || item.HEX_CODE || '#3b82f6',
        colorName: item.color_name || item.colour_name || item.COLOR_NAME || item.COLOUR_NAME || 'Status',
        timestamp: getLatestDate(item),
      }))
      .sort((a, b) => (parseInt(a.id) || 0) - (parseInt(b.id) || 0));
  }, [rawData]);

  const lastRefreshTTS = useMemo(() => {
    if (statusData?.DateAndTime) return statusData.DateAndTime;
    if (statusData?.DateandTime) return statusData.DateandTime;
    if (productionData.length === 0) return 'N/A';
    const validTimestamps = productionData.map(item => item.timestamp).filter(t => t > 0);
    if (validTimestamps.length > 0) {
      const maxTimestamp = Math.max(...validTimestamps);
      return new Date(maxTimestamp).toLocaleString('en-US', {
        dateStyle: 'short',
        timeStyle: 'medium'
      });
    }
    return new Date().toLocaleString('en-US', {
      dateStyle: 'short',
      timeStyle: 'medium'
    });
  }, [statusData, productionData]);

  const lastRefreshRM = rmData?.DateandTime || rmData?.DateAndTime || 'N/A';

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
