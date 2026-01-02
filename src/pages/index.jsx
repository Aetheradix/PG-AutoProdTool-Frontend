import React from 'react';
import { Route, Routes } from "react-router-dom";
import Dashboard from "./Dashboard";
import { MasterDataPage } from '@/features/production/master-data/MasterDataPage';
import { StatusPage } from '@/features/production/status/StatusPage';
import { KPIPage } from '@/features/production/kpi/KPIPage';

export default function AppFeature() {
    return (
        <Routes>
            <Route index element={<Dashboard />} />
            <Route path="master-data" element={<MasterDataPage />} />
            <Route path="status" element={<StatusPage />} />
            <Route path="kpi" element={<KPIPage />} />

            {/* Fallback for any route not implemented yet */}
            <Route path="*" element={<div className="p-8 text-center">Page Under Construction</div>} />
        </Routes>
    );
}
