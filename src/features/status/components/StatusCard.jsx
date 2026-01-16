import React from 'react';
import { Card, Typography } from 'antd';

const { Text } = Typography;

const StatusCard = ({ title, value, unit, status }) => {
    const statusColors = {
        success: 'bg-[#10b981]',
        warning: 'bg-[#f59e0b]',
        error: 'bg-[#ef4444]',
    };

    return (
        <Card
            className={`border-none ${statusColors[status]} transition-transform hover:scale-[1.02] cursor-pointer shadow-sm`}
            bodyStyle={{ padding: '16px' }}
        >
            <Text className="text-white/90 text-xs font-semibold block mb-4 uppercase tracking-wider">
                {title}
            </Text>
            <div className="flex items-baseline justify-end gap-1">
                <Text className="text-white text-3xl font-bold">
                    {value.toLocaleString()}
                </Text>
                <Text className="text-white/80 text-sm font-medium">
                    {unit}
                </Text>
            </div>
        </Card>
    );
};

export default StatusCard;
