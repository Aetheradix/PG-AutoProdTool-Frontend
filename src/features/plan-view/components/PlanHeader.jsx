import React from 'react';
import { Button } from 'antd';
import { FiDownload } from 'react-icons/fi';

const PlanHeader = ({ activeTab, onTabChange }) => {
    return (
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
            <div className="flex bg-slate-50 gap-4 p-1 rounded-lg">
                <Button
                    type={activeTab === 'gantt' ? 'primary' : 'text'}
                    className="rounded-md shadow-none"
                    onClick={() => onTabChange('gantt')}
                >
                    Gantt Chart
                </Button>
                <Button
                    type={activeTab === 'table' ? 'primary' : 'text'}
                    className="rounded-md shadow-none"
                    onClick={() => onTabChange('table')}
                >
                    Table View
                </Button>
                <Button
                    type={activeTab === 'tank' ? 'primary' : 'text'}
                    className="rounded-md shadow-none"
                    onClick={() => onTabChange('tank')}
                >
                    Tank Timeline
                </Button>
            </div>

            <div className="flex gap-3">
                <Button icon={<FiDownload />} className="rounded-lg border-slate-200">Export PDF</Button>
                <Button type="primary" className="bg-emerald-600 hover:bg-emerald-700 border-none rounded-lg font-bold">
                    Lock & Release Plan
                </Button>
            </div>
        </div>
    );
};

export default PlanHeader;
