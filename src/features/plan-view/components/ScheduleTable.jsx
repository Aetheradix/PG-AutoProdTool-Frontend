import React from 'react';
import { Table, Tag, Typography, Space } from 'antd';
import { FiClock } from 'react-icons/fi';

const { Title, Text } = Typography;

const ScheduleTable = ({ tasks }) => {
    const tableData = tasks.flatMap(res =>
        res.items.map(item => ({
            ...item,
            key: item.id,
            resource: res.resource,
            startTime: `${(Math.floor(item.start) + 5) % 24}:00`,
            endTime: `${(Math.floor(item.start + item.duration) + 5) % 24}:00`,
        }))
    ).sort((a, b) => a.start - b.start);

    const columns = [
        {
            title: 'Task / Product',
            dataIndex: 'title',
            key: 'title',
            render: (text, record) => (
                <Space>
                    {record.icon && <span className="text-slate-400">{record.icon}</span>}
                    <Text strong className="text-slate-700">{text}</Text>
                </Space>
            ),
        },
        {
            title: 'Batch Code',
            dataIndex: 'batch',
            key: 'batch',
            render: (text) => <Text type="secondary">{text || 'N/A'}</Text>,
        },
        {
            title: 'Resource',
            dataIndex: 'resource',
            key: 'resource',
            render: (text) => <Tag color="blue" className="rounded-md font-bold px-3">{text}</Tag>,
        },
        {
            title: 'Timeline',
            key: 'timeline',
            render: (_, record) => (
                <Space className="text-slate-500 text-xs">
                    <FiClock size={14} />
                    <span>{record.startTime} - {record.endTime}</span>
                    <span className="text-slate-300">({record.duration}h)</span>
                </Space>
            ),
        },
        {
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
            render: (status) => {
                const colors = {
                    ready: 'processing',
                    running: 'success',
                    conflict: 'error',
                    warning: 'warning',
                };
                return <Tag color={colors[status]} className="capitalize rounded-lg px-4">{status}</Tag>;
            },
        },
    ];

    return (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden animate-fade-in">
            <div className="p-6 border-b border-slate-50 flex justify-between items-center bg-slate-50/50">
                <Title level={4} className="m-0! text-slate-800">Production Schedule Table</Title>
                <Text type="secondary" className="text-sm">Sorted by start time</Text>
            </div>
            <Table
                dataSource={tableData}
                columns={columns}
                pagination={false}
                className="modern-table"
                rowClassName="hover:bg-blue-50/30 transition-colors"
            />
        </div>
    );
};

export default ScheduleTable;
