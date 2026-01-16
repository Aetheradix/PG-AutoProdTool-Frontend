import React, { useState } from 'react';
import { Table, DatePicker, Button, Space, Typography, Card, Tag } from 'antd';
import { FiEye, FiDownload } from 'react-icons/fi';

const { Title, Text } = Typography;

export function ArchivedPlansView() {
    const [selectedDate, setSelectedDate] = useState(null);

    const columns = [
        { title: 'Plan ID', dataIndex: 'id', key: 'id' },
        { title: 'Version', dataIndex: 'version', key: 'version' },
        { title: 'Generated On', dataIndex: 'date', key: 'date' },
        { title: 'Status', key: 'status', render: () => <Tag color="default">ARCHIVED</Tag> },
        {
            title: 'Actions', key: 'actions', render: () => (
                <Space>
                    <Button icon={<FiEye />} size="small">View</Button>
                    <Button icon={<FiDownload />} size="small">Export</Button>
                </Space>
            )
        },
    ];

    const data = [
        { key: '1', id: 'PLN-001', version: 'V1.0', date: '2023-12-25' },
        { key: '2', id: 'PLN-002', version: 'V1.1', date: '2023-12-26' },
    ];

    return (
        <div className="space-y-6">
            <header className="flex justify-between items-center">
                <div>
                    <Title level={4} className="m-0!">Archived Production Plans</Title>
                    <Text type="secondary">Review historical schedules and versions.</Text>
                </div>
                <DatePicker onChange={(d) => setSelectedDate(d)} placeholder="Select Date" className="rounded-xl h-10" />
            </header>

            <Card className="rounded-3xl border-slate-100 shadow-sm overflow-hidden" styles={{ body: { padding: 0 } }}>
                <Table columns={columns} dataSource={data} pagination={false} />
            </Card>
        </div>
    );
}
