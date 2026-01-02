import React from 'react';
import { Table, Button, Space, Typography, Card, Tag } from 'antd';
import { FiEdit3, FiShare2 } from 'react-icons/fi';

const { Title, Text } = Typography;

export function BPRView() {
    const columns = [
        { title: 'Batch ID', dataIndex: 'id', key: 'id' },
        { title: 'Latest Plan', dataIndex: 'plan', key: 'plan' },
        { title: 'Last Updated', dataIndex: 'updated', key: 'updated' },
        {
            title: 'Actions', key: 'actions', render: () => (
                <Space>
                    <Button icon={<FiEdit3 />} size="small">Update</Button>
                    <Button icon={<FiShare2 />} size="small">Share</Button>
                </Space>
            )
        },
    ];

    const data = [
        { key: '1', id: 'BTCH-902', plan: 'P-101', updated: '2 hours ago' },
        { key: '2', id: 'BTCH-903', plan: 'P-101', updated: '1 hour ago' },
    ];

    return (
        <div className="space-y-6">
            <header>
                <Title level={4} className="m-0!">BPR-PDR Master Data</Title>
                <Text type="secondary">Manage production logs and master records based on latest plans.</Text>
            </header>

            <Card className="rounded-3xl border-slate-100 shadow-sm overflow-hidden" styles={{ body: { padding: 0 } }}>
                <Table columns={columns} dataSource={data} pagination={false} />
            </Card>

            <div className="p-6 bg-blue-50/50 rounded-2xl border border-blue-100">
                <Text strong className="text-blue-800">Note: Creation of PO via GMP+ Tool integration is active.</Text>
            </div>
        </div>
    );
}
