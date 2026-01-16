import React from 'react';
import { Card, Typography, Tag } from 'antd';

const { Text } = Typography;

const BatchCard = ({ batchId, brand, date, status, color, index }) => {
    const colorMaps = {
        black: 'bg-[#1a1a1a]',
        magenta: 'bg-[#d946ef]',
        cyan: 'bg-[#06b6d4]',
        purple: 'bg-[#8b5cf6]',
        lime: 'bg-[#84cc16]',
        green: 'bg-[#22c55e]',
    };

    return (
        <Card
            className={`border-none ${colorMaps[color]} shadow-md relative overflow-hidden h-full transition-all hover:translate-y-[-4px]`}
            bodyStyle={{ padding: '16px' }}
        >
            <div className="absolute top-2 right-2 flex items-center justify-center w-6 h-6 rounded-full bg-white/20 text-white text-[10px] font-bold">
                {index}
            </div>

            <div className="space-y-3">
                <div>
                    <Text className="text-white/70 text-[10px] font-bold block">BATCH ID</Text>
                    <Text className="text-white text-xl font-black">{batchId}</Text>
                </div>

                <div>
                    <Text className="text-white/70 text-[10px] font-bold block uppercase tracking-tighter">{brand}</Text>
                    <Text className="text-white/90 text-[10px] font-medium block leading-tight">NEXT_SAINT_DATE</Text>
                    <Text className="text-white text-[10px] font-bold block">{date}</Text>
                </div>

                <div>
                    <Text className="text-white/70 text-[10px] font-bold block">STATUS</Text>
                    <Text className="text-white text-xs font-bold block">{status}</Text>
                </div>
            </div>
        </Card>
    );
};

export default BatchCard;
