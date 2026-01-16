import { Typography } from 'antd';
import { AlertsView } from '../../components/AlertsView';
import { DashboardCards } from '../../components/DashboardCards';
import { useAuth } from '@/context/AuthContext';

const { Title, Text } = Typography;

export function ProductionDashboard() {
  const { user } = useAuth();
  return (
    <div className="min-h-screen bg-[#f8fafc] py-8 px-6 space-y-12">
      {/* Header Section */}
      <header className="max-w-7xl mx-auto text-left space-y-2">
        <Title level={2} className="m-0! text-slate-900 font-extrabold tracking-tight">
          Welcome, {user?.name || 'Planner User '}
        </Title>
        <Text className="text-slate-500 text-lg">
          Here's a quick overview of your planning tool.
        </Text>
      </header>

      <main className="max-w-7xl mx-auto space-y-12">
        <DashboardCards />

        <div className="pt-8">
          <AlertsView />
        </div>
      </main>
    </div>
  );
}
