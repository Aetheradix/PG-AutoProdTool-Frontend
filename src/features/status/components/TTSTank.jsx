import { Alert, Col, Row, Spin } from 'antd';
import React from 'react';
import BatchCard from './BatchCard';

const TTSTank = ({ isLoading, lastRefreshTTS, productionData, getLatestDate, error ,isError}) => {
  return (
    <Col xs={24} lg={24}>
      <div className="bg-slate-50/50 rounded-3xl border border-slate-100 p-6 shadow-sm h-full">
        <div className="flex justify-between items-center mb-4 px-2">
          <div className="bg-amber-400 px-4 py-1 rounded text-slate-900 font-bold text-sm uppercase">
            LIVE PRODUCTION DATA (RECENT)
          </div>
        </div>

        <div className="bg-black text-white text-[10px] py-1 px-4 mb-6 flex justify-center font-mono tracking-widest uppercase">
          LAST REFRESH: {isLoading ? 'REFRESHING...' : lastRefreshTTS}
        </div>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <Spin size="large" tip="Loading recent data..." />
          </div>
        ) : isError ? (
          <Alert
            message="Error"
            description={error?.data?.message || 'Failed to fetch recent data'}
            type="error"
            showIcon
            className="mb-6"
          />
        ) : (
          <Row gutter={[12, 12]}>
            {productionData.map((item, index) => {
              const latestTimestamp = getLatestDate(item);
              return (
                <Col key={item.ID || index} xs={12} sm={8} md={4.8} className="flex!">
                  <div className="w-full">
                    <BatchCard
                      batchId={item.BATCH_NO || 'N/A'}
                      brand={item.BRAND_NAME || 'N/A'}
                      date={
                        latestTimestamp > 0 ? new Date(latestTimestamp).toLocaleDateString() : 'N/A'
                      }
                      status={item.STATUS || 'Active'}
                      color={
                        index % 6 === 0
                          ? 'black'
                          : index % 6 === 1
                            ? 'magenta'
                            : index % 6 === 2
                              ? 'cyan'
                              : index % 6 === 3
                                ? 'purple'
                                : index % 6 === 4
                                  ? 'lime'
                                  : 'green'
                      }
                      index={index + 1}
                    />
                  </div>
                </Col>
              );
            })}
          </Row>
        )}
      </div>
    </Col>
  );
};

export default TTSTank;
