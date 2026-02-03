import { Row, Typography } from 'antd';
import { useGetStatusQuery } from '../../store/api/statusApi';
import RMTank from './components/RMTank';
import TTSTank from './components/TTSTank';
import { rmTankData } from './statusData';

const { Title } = Typography;

export function StatusPage() {


  const { data: statusData, isLoading, isError, error } = useGetStatusQuery();

  const rawData = Array.isArray(statusData)
    ? statusData
    : statusData?.data || [];

  const getLatestDate = (item) => {
    const dateFields = ['DT#_10_#', 'DT#_15_#', 'DT#_16_#', 'DT#_19_#', 'DT#_20_#'];
    const dates = dateFields
      .map((field) => item[field])
      .filter((val) => val && val.length > 5)
      .map((val) => new Date(val).getTime());

    return dates.length > 0 ? Math.max(...dates) : 0;
  };

  const productionData = [...rawData].sort((a, b) => getLatestDate(b) - getLatestDate(a));

  const lastRefreshTTS =
    productionData.length > 0 ? new Date(getLatestDate(productionData[0])).toLocaleString() : 'N/A';

  return (
    <div className="fade-in space-y-6 pb-8">
      <header className="flex justify-center mb-8">
        <Title level={2} className="m-0! text-blue-600 font-extrabold tracking-tight">
          Current Status
        </Title>
      </header>

      <Row gutter={[32, 32]}>
        {/* Left Column - RM TANK STATUS */}
        <RMTank  rmTankData={rmTankData} />

        {/* Right Column - LIVE RECENT DATA (Replacing TTS TANK STATUS) */}
        <TTSTank
          isLoading={isLoading}
          lastRefreshTTS={lastRefreshTTS}
          productionData={productionData}
          getLatestDate={getLatestDate}
          error={error}
          isError={isError}
        />
      </Row>
    </div>
  );
}
