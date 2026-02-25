import React from 'react';
import { Col, Row, Spin, Alert } from 'antd';

/**
 * A generic layout component for status grids (RM Tank, TTS Tank, etc.)
 * Standardizes the "Last Refresh" bar and loading/error handling.
 */
export const ResourceStatusGrid = ({
    title,
    lastRefresh,
    isLoading,
    isError,
    error,
    data = [],
    renderItem,
    columns = { xs: 12, sm: 8, md: 6 },
    titleColor = "bg-amber-400"
}) => {
    return (
        <Col xs={24} lg={24}>
            <div className="bg-slate-50/50 rounded-3xl border border-slate-100 p-6 shadow-sm h-full">
                <div className="flex justify-between items-center mb-4 px-2">
                    <div className={`${titleColor} px-4 py-1 rounded text-slate-900 font-bold text-2xl uppercase`}>
                        {title}
                    </div>
                </div>

                <div className="bg-black text-white text-xl py-1 px-4 mb-6 flex justify-center font-mono tracking-widest uppercase">
                    LAST REFRESH: {isLoading ? 'REFRESHING...' : lastRefresh || 'N/A'}
                </div>

                {isLoading ? (
                    <div className="flex justify-center py-12">
                        <Spin size="large" tip={`Loading ${title.toLowerCase()}...`}>
                            <div className="p-10" />
                        </Spin>
                    </div>
                ) : isError ? (
                    <Alert
                        title="Error"
                        description={error?.data?.message || `Failed to fetch ${title.toLowerCase()}`}
                        type="error"
                        showIcon
                        className="mb-6"
                    />
                ) : (
                    <Row gutter={[12, 12]}>
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
