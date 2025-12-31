import React from 'react';
import { CreatePlanForm } from '../components/CreatePlanForm';
import { DashboardCards } from '../components/DashboardCards';

export function ProductionDashboard() {
  return (
    <div className="space-y-12 py-10 fade-in">
      {/* Create Plan Section */}
      <section>
        <CreatePlanForm />
      </section>

      {/* Cards Section */}
      <section>
        <DashboardCards />
      </section>
    </div>
  );
}
