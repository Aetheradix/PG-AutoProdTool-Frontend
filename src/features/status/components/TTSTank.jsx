import React from 'react';
import BatchCard from './BatchCard';
import { ResourceStatusGrid } from './ResourceStatusGrid';

const TTSTank = ({ isLoading, lastRefreshTTS, productionData, getLatestDate, error, isError }) => {
  return (
    <ResourceStatusGrid
      title="LIVE PRODUCTION DATA (RECENT)"
      lastRefresh={lastRefreshTTS}
      isLoading={isLoading}
      isError={isError}
      error={error}
      data={productionData}
      columns={{ xs: 24, sm: 12, md: 4 }}
      titleColor="bg-amber-400"
      renderItem={(item, index) => {
        const latestTimestamp = getLatestDate(item);
        const statusName = item.status || item.STATUS || 'Active';
        const hexCode = item.hex_code || item.HEX_CODE;
        const colorName =
          item.color_name || item.colour_name || item.COLOR_NAME || item.COLOUR_NAME;
        return (
          <div className="w-full h-full flex">
            <BatchCard
              id={item.ID || 'N/A'}
              batchId={item.BATCH_NO || 'N/A'}
              brand={item.BRAND_NAME || 'N/A'}
              date={latestTimestamp > 0 ? new Date(latestTimestamp).toLocaleDateString() : 'N/A'}
              color={colorName}
              status={statusName}
              hexCode={hexCode}
              index={index + 1}
            />
          </div>
        );
      }}
    />
  );
};

export default TTSTank;
