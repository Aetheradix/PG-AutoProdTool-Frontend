import React from 'react';
import { Card, Typography, Row, Col, Progress, Tag, Statistic, Space } from 'antd';
import { FiActivity, FiDatabase, FiDroplet } from 'react-icons/fi';

const { Title, Text } = Typography;

export function StatusPage() {
  return (
    <div className="fade-in space-y-8">
      <header className="page-header">
        <Title level={2} className="m-0!">
          Current Status View
        </Title>
        <Text type="secondary">Real-time monitoring of tank levels and raw materials.</Text>
      </header>

      <Row gutter={[24, 24]}>
        <Col xs={24} lg={16}>
          <Card
            title={
              <Space>
                <FiActivity className="text-blue-500" /> Tank Availability (TTS View)
              </Space>
            }
            className="status-card"
          >
            <div className="tank-grid">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                <div
                  key={i}
                  className="tank-item"
                >
                  <Text strong className="block text-xs">
                    TANK {i}
                  </Text>
                  <Progress
                    type="dashboard"
                    percent={Math.floor(Math.random() * 100)}
                    size={60}
                    strokeWidth={10}
                  />
                  <Tag color="processing" className="m-0 text-[10px]">
                    AVAILABLE
                  </Tag>
                </div>
              ))}
            </div>
          </Card>
        </Col>

        <Col xs={24} lg={8}>
          <Card
            title={
              <Space>
                <FiDroplet className="text-amber-500" /> Raw Material Levels
              </Space>
            }
            className="status-card"
          >
            <div className="space-y-8">
              <div className="material-item">
                <div className="flex justify-between mb-2">
                  <Text strong>Substance Alpha</Text>
                  <Text type="secondary">8,400 L</Text>
                </div>
                <Progress percent={84} strokeColor="#3b82f6" railColor="#f1f5f9" />
              </div>
              <div className="material-item">
                <div className="flex justify-between mb-2">
                  <Text strong>Substance Beta</Text>
                  <Text type="secondary">2,100 L</Text>
                </div>
                <Progress
                  percent={21}
                  status="exception"
                  strokeColor="#ef4444"
                  railColor="#f1f5f9"
                />
              </div>
              <div className="material-alert">
                <Text type="danger" strong className="flex items-center gap-2">
                  <FiActivity /> Low Material Alert
                </Text>
                <Text className="text-xs block mt-1 text-rose-700">
                  Beta supply is below critical threshold (25%).
                </Text>
              </div>
            </div>
          </Card>
        </Col>
      </Row>
    </div>

  );
}
