import React from 'react';
import { Col, Row, Spin, Alert, Badge } from 'antd';
import { FiClock, FiActivity } from 'react-icons/fi';

/**
 * A modern, clean layout component for status grids (RM Tank, TTS Tank, etc.)
 * Standardizes the header, live status indicator, "Last Refresh" bar and loading/error handling.
 */
export const ResourceStatusGrid = ({
  title,
  lastRefresh,
  isLoading,
  isError,
  error,
  data = [],
  renderItem,
  columns = { xs: 24, sm: 12, md: 8, lg: 4 },
  titleColor = 'from-amber-400 to-amber-500',
  extraHeader,
}) => {
  return (
    <Col xs={24} lg={24}>
      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm h-full">
        {/* Modern Clean Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-5 pb-5 border-b border-slate-100">
          <div className="flex items-center gap-3.5">
            <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl text-white shadow-md shadow-blue-500/20">
              <FiActivity size={22} className="stroke-[2.5]" />
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h3 className="m-0 font-extrabold text-xl md:text-2xl text-slate-900 tracking-tight">
                  {title}
                </h3>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1.5 animate-pulse" />
                  LIVE
                </span>
              </div>
              <p className="text-xs md:text-sm text-slate-500 mt-0.5">
                Real-time tank progression and batch execution status
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 self-start md:self-auto">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-slate-900 text-white text-xs font-mono font-medium shadow-sm border border-slate-800">
              <FiClock size={13} className="text-amber-400 shrink-0" />
              <span>
                LAST REFRESH: <strong className="text-amber-300">{isLoading ? 'REFRESHING...' : lastRefresh || 'N/A'}</strong>
              </span>
            </div>
            <div className="hidden sm:inline-flex items-center px-3 py-1.5 rounded-xl bg-slate-100 text-slate-700 text-xs font-semibold">
              Total: {data.length}
            </div>
          </div>
        </div>

        {/* Optional Extra Header (Search, Filters, etc.) */}
        {extraHeader && (
          <div className="mb-5">
            {extraHeader}
          </div>
        )}

        {/* Content Body */}
        {isLoading ? (
          <div className="flex justify-center items-center py-20">
            <Spin size="large" tip={`Loading ${title.toLowerCase()}...`}>
              <div className="p-10" />
            </Spin>
          </div>
        ) : isError ? (
          <Alert
            message="Error Loading Data"
            description={error?.data?.message || `Failed to fetch ${title.toLowerCase()}`}
            type="error"
            showIcon
            className="mb-6 rounded-2xl"
          />
        ) : data.length === 0 ? (
          <div className="text-center py-16 text-slate-400 font-medium bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
            No active batches or tanks match the selected criteria.
          </div>
        ) : (
          <Row gutter={[16, 16]}>
            {data.map((item, index) => (
              <Col key={item.id || index} {...columns}>
                {renderItem(item, index)}
              </Col>
            ))}
          </Row>
        )}
      </div>
    </Col>
  );
};
