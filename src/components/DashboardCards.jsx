import React from 'react';
import { Card, Button, Typography } from 'antd';
import { useNavigate } from 'react-router-dom';
import { dashboardCardsData } from '../utils/cardsData';

const { Title, Text } = Typography;

export function DashboardCards() {
  const navigate = useNavigate();

  return (
    <div className="w-full mx-auto">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {dashboardCardsData.map((card, index) => (
          <div
            key={index}
            className="group relative bg-white rounded-[2.5rem] border border-slate-100 p-8 shadow-sm hover:shadow-2xl hover:shadow-blue-500/10 hover:-translate-y-2 transition-all duration-500"
            onClick={() => navigate(card.path)}
            style={{ cursor: 'pointer' }}
          >
            {/* Hover Accent */}
            <div className="absolute inset-0 bg-linear-to-br from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 rounded-[2.5rem] transition-opacity duration-500" />

            <div className="relative z-10 h-full flex flex-col">
              <div className="w-16 h-16 bg-slate-50 rounded-[1.25rem] flex items-center justify-center mb-8 group-hover:bg-blue-600 text-blue-600 group-hover:text-white group-hover:rotate-6 transition-all duration-500 shadow-sm">
                <div className="scale-150 flex items-center justify-center">
                  {card.icon}
                </div>
              </div>

              <div className="flex-1 space-y-3">
                <h4 className="text-xl font-black text-slate-900 m-0 group-hover:text-blue-600 transition-colors">
                  {card.title}
                </h4>
                <p className="text-slate-500 text-sm leading-relaxed block">
                  {card.description}
                </p>
              </div>

              <div className="mt-8 flex items-center justify-between">
                <span className="font-black text-xs uppercase tracking-widest text-blue-600 opacity-0 group-hover:opacity-100 -translate-x-4 group-hover:translate-x-0 transition-all duration-500">
                  {card.action}
                </span>
                <div className="w-12 h-12 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-blue-50 group-hover:text-blue-600 transition-all duration-500">
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
