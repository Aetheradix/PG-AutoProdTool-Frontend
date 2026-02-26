import { Typography, Button } from 'antd';
import { useNavigate } from 'react-router-dom';
import { AlertsView } from '../../components/AlertsView';
import { DashboardCards } from '../../components/DashboardCards';
import { useAuth } from '@/context/AuthContext';

const { Title } = Typography;

export function ProductionDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-white">
      {/* Modern Hero Section */}
      <section className="relative overflow-hidden bg-slate-900 rounded-[2.5rem] mt-4 mx-4 px-8 py-20 lg:py-32 shadow-2xl">
        {/* Background Decorative Elements */}
        <div className="absolute top-0 right-0 w-1/3 h-full bg-linear-to-bl from-blue-600/20 to-transparent blur-3xl -z-10" />
        <div className="absolute bottom-0 left-0 w-1/4 h-1/2 bg-linear-to-tr from-blue-500/10 to-transparent blur-3xl -z-10" />

        <div className="max-w-6xl mx-auto relative z-10 flex flex-col lg:flex-row items-center gap-16">
          <div className="flex-1 text-center lg:text-left space-y-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500/10 border border-blue-500/20 rounded-full text-blue-400 text-sm font-bold uppercase tracking-widest animate-fade-in">
              <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
              Next-Gen Supply Chain Planning
            </div>

            <Title className="text-white! text-5xl! lg:text-7xl! m-0! font-black! leading-[1.1]! tracking-tight!">
              Welcome back, <br />
              <span className="bg-linear-to-r from-blue-400 to-blue-200 bg-clip-text text-transparent">
                {user?.name || 'Planner'}
              </span>
            </Title>

            <p className="text-slate-400 text-lg lg:text-xl max-w-2xl leading-relaxed">
              Streamline your production workflow with automation driven insights,
              real-time Gantt tracking, and automated tank resource management.
            </p>

            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 pt-4">
              <Button
                type="primary"
                size="large"
                className="h-14 px-8 rounded-2xl bg-blue-600 hover:bg-blue-500 border-none font-black text-lg shadow-xl shadow-blue-600/20 active:scale-95 transition-all"
                onClick={() => navigate('/plan-view')}
              >
                Go to Plan View
              </Button>
              <Button
                size="large"
                className="h-14 px-8 rounded-2xl bg-white/5 hover:bg-white/10 border-white/10 text-white font-bold text-lg backdrop-blur-md active:scale-95 transition-all"
                onClick={() => navigate('/status')}
              >
                Live Status
              </Button>
            </div>
          </div>

          {/* Hero Visual */}
          <div className="flex-1 w-full lg:max-w-md hidden lg:block">
            <div className="relative group">
              <div className="absolute inset-0 bg-blue-500/20 blur-[100px] rounded-full group-hover:bg-blue-500/30 transition-colors" />
              <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-4xl p-8 shadow-3xl relative overflow-hidden group-hover:-translate-y-2 transition-transform duration-500">
                <div className="flex items-center gap-2 mb-8">
                  <div className="w-3 h-3 rounded-full bg-rose-500" />
                  <div className="w-3 h-3 rounded-full bg-amber-500" />
                  <div className="w-3 h-3 rounded-full bg-emerald-500" />
                </div>
                {/* Simplified Gantt UI Mockup */}
                <div className="space-y-4">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="h-4 bg-slate-700 rounded-lg w-full overflow-hidden relative">
                      <div className={`absolute inset-y-0 bg-blue-500 rounded-lg opacity-80`} style={{ left: `${i * 15}%`, width: `${30 + i * 10}%`, opacity: 0.5 + i * 0.1 }} />
                    </div>
                  ))}
                  <div className="h-20 bg-linear-to-r from-blue-500/20 to-transparent rounded-2xl border border-blue-500/10 flex flex-col justify-center px-4 space-y-2 mt-8">
                    <div className="h-2 w-1/2 bg-blue-400 rounded-full opacity-50" />
                    <div className="h-2 w-3/4 bg-blue-400 rounded-full opacity-30" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <main className="max-w-7xl mx-auto px-6 py-20 animate-fade-in-up">
        <div className="flex items-center justify-between mb-12">
          <div className="space-y-1">
            <h3 className="text-2xl font-black text-slate-900 tracking-tight">Main Navigation</h3>
            <p className="text-slate-500">Quick access to all planning modules</p>
          </div>
          <div className="h-px flex-1 bg-slate-100 mx-8 hidden md:block" />
        </div>

        <DashboardCards />

        <div className="mt-20">
          <div className="flex items-center gap-4 mb-8">
            <div className="px-3 py-1 bg-rose-100 text-rose-600 rounded-lg font-black text-xs uppercase tracking-widest">Active Alerts</div>
            <div className="h-px flex-1 bg-slate-100" />
          </div>
          <AlertsView />
        </div>
      </main>
    </div>
  );
}
