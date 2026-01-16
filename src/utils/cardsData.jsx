import { FiActivity, FiFileText, FiPieChart, FiPlusCircle, FiSettings } from "react-icons/fi";

export const cards = [
  {
    title: 'Create Production Plan',
    action: 'Start Planning',
    path: '/master-data', // Adjust paths as needed
    icon: <FiPlusCircle size={24} className="text-blue-600" />,
    description: 'Generate a new 24-hour shift-wise plan for a selected date.',
  },
  {
    title: 'View Last Plan',
    action: 'Open Plan',
    path: '/status',
    icon: <FiFileText size={24} className="text-blue-600" />,
    description: 'Review and tweak the most recently generated production plan.',
  },
  {
    title: 'Current Status',
    action: 'View Live Status',
    path: '/status',
    icon: <FiActivity size={24} className="text-blue-600" />,
    description: 'View live status of Raw Material tanks and Transfer Tank Systems.',
  },
  {
    title: 'KPI Dashboard',
    action: 'View KPIs',
    path: '/kpi',
    icon: <FiPieChart size={24} className="text-blue-600" />,
    description: 'Analyze performance metrics like utilization, washouts, and lateness.',
  },
  {
    title: 'Master Data',
    action: 'Manage Data',
    path: '/master-data',
    icon: <FiSettings size={24} className="text-blue-600" />,
    description: 'View and edit core data like BCTs, washout matrices, and buffers.',
  },
];