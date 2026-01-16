import React from 'react';
import { Card, Typography, Row, Col, Statistic } from 'antd';
import { FiPieChart, FiTrendingUp, FiCheckCircle, FiClock } from 'react-icons/fi';
import { kpiDataItems } from './kpiData';

const { Title, Text } = Typography;

export function KPIPage() {
  const getIcon = (type) => {
    switch (type) {
      case 'blue': return <FiTrendingUp className="mr-2" />;
      case 'emerald': return <FiCheckCircle className="mr-2" />;
      case 'amber': return <FiClock className="mr-2" />;
      case 'purple': return <FiPieChart className="mr-2" />;
      default: return null;
    }
  };

  const getColor = (type) => {
    switch (type) {
      case 'blue': return '#2563eb';
      case 'emerald': return '#059669';
      case 'amber': return '#d97706';
      case 'purple': return '#7c3aed';
      default: return '#000';
    }
  };

  return (
    <div className="fade-in space-y-8">
      <header className="page-header">
        <Title level={2} className="m-0!">
          KPI Dashboard
        </Title>
        <Text type="secondary">Performance metrics and production efficiency tracking.</Text>
      </header>

      <Row gutter={[24, 24]}>
        {kpiDataItems.map((item) => (
          <Col key={item.id} xs={24} md={6}>
            <Card className={`kpi-card-${item.type}`}>
              <Statistic
                title={item.title}
                value={item.value}
                precision={item.precision}
                suffix={item.suffix}
                prefix={getIcon(item.type)}
                style={{ color: getColor(item.type), fontWeight: 800 }}
              />
            </Card>
          </Col>
        ))}
      </Row>

      <Row gutter={[24, 24]}>
        <Col xs={24}>
          <Card title="Production Plan Efficiency" className="chart-card">
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
