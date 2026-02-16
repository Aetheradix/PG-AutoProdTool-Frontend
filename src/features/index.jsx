import React from 'react';
import { Route, Routes } from 'react-router-dom';
import Dashboard from '../pages/Dashboard';
import { MasterDataPage } from '@/features/master-data/MasterDataPage';
import { StatusPage } from '@/features/status/StatusPage';
import { KPIPage } from '@/features/kpi/KPIPage';
import CreateProductionPlan from './create-production-plan';
import PlanView from './plan-view';
import ProfilePage from './profile/ProfilePage';
import { ExcelUpload } from './excel-upload/ExcelUpload';
import BPRPDR from './bpr-pdr';

export default function AppFeature() {
  return (
    <Routes>
      <Route index element={<Dashboard />} />
      <Route path="create-production-plan" element={<CreateProductionPlan />} />
      <Route path="plan-view" element={<PlanView />} />
      <Route path="master-data" element={<MasterDataPage />} />
      <Route path="status" element={<StatusPage />} />
      <Route path="kpi" element={<KPIPage />} />
      <Route path="profile" element={<ProfilePage />} />
      <Route path="upload" element={<ExcelUpload />} />
      <Route
        path="bpr-pdr"
        element={
          <React.Suspense fallback={<div className="p-8 text-center">Loading...</div>}>
            <BPRPDR />
          </React.Suspense>
        }
      />
      {/* Fallback for any route not implemented yet */}
      <Route path="*" element={<div className="p-8 text-center">Page Under Construction</div>} />
    </Routes>
  );
}
