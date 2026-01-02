import React from 'react';
import { Card, Typography, Row, Col, Statistic, Progress } from 'antd';
import { FiPieChart, FiTrendingUp, FiCheckCircle, FiClock } from 'react-icons/fi';

const { Title, Text } = Typography;

export function KPIPage() {
    return (
        <div className="space-y-8 fade-in">
            <header>
                <Title level={2} className="!m-0">KPI Dashboard</Title>
                <Text type="secondary">Performance metrics and production efficiency tracking.</Text>
            </header>

            <Row gutter={[24, 24]}>
                <Col xs={24} md={6}>
                    <Card className="rounded-3xl border-slate-100 shadow-sm bg-blue-50/30">
                        <Statistic
                            title="Overall Efficiency"
                            value={92.4}
                            precision={1}
                            suffix="%"
                            prefix={<FiTrendingUp className="mr-2" />}
                            valueStyle={{ color: '#2563eb', fontWeight: 800 }}
                        />
                    </Card>
                </Col>
                <Col xs={24} md={6}>
                    <Card className="rounded-3xl border-slate-100 shadow-sm bg-emerald-50/30">
                        <Statistic
                            title="Plan Adherence"
                            value={98}
                            suffix="%"
                            prefix={<FiCheckCircle className="mr-2" />}
                            valueStyle={{ color: '#059669', fontWeight: 800 }}
                        />
                    </Card>
                </Col>
                <Col xs={24} md={6}>
                    <Card className="rounded-3xl border-slate-100 shadow-sm bg-amber-50/30">
                        <Statistic
                            title="Avg. Downtime"
                            value={12}
                            suffix="m"
                            prefix={<FiClock className="mr-2" />}
                            valueStyle={{ color: '#d97706', fontWeight: 800 }}
                        />
                    </Card>
                </Col>
                <Col xs={24} md={6}>
                    <Card className="rounded-3xl border-slate-100 shadow-sm bg-purple-50/30">
                        <Statistic
                            title="Tank Utilization"
                            value={87}
                            suffix="%"
                            prefix={<FiPieChart className="mr-2" />}
                            valueStyle={{ color: '#7c3aed', fontWeight: 800 }}
                        />
                    </Card>
                </Col>
            </Row>

            <Row gutter={[24, 24]}>
                <Col xs={24}>
                    <Card title="Production Plan Efficiency" className="rounded-3xl border-slate-100 shadow-sm h-80 flex items-center justify-center">
                        <div className="text-center space-y-4">
                            <FiTrendingUp size={48} className="text-slate-200 mx-auto" />
                            <Text type="secondary">Efficiency Chart Visualization Simulation</Text>
                        </div>
                    </Card>
                </Col>
            </Row>
        </div>
    );
}
