
import { Typography } from 'antd';
import { CreatePlanForm } from '../components/CreatePlanForm';


const { Title, Text } = Typography;

export function ProductionDashboard() {
  return (
    <div className="min-h-screen bg-[#f8fafc] py-6 px-0 space-y-12">
      {/* Header Section */}
      <header className="max-w-6xl mx-auto text-left space-y-2">
        <Title level={2} className="m-0! text-slate-900 font-extrabold tracking-tight">
          Production Control Center
        </Title>
        <Text className="text-slate-500 text-lg">
          Manage, monitor, and optimize your production workflows from a single interface.
        </Text>
      </header>

      <main className="max-w-6xl mx-auto">
        <CreatePlanForm />
      </main>

    </div>
  );
}
