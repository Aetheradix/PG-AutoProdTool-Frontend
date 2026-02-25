import React from 'react';
import { useNavigate } from 'react-router-dom';

const Logo = ({ size = 'medium', className = '' }) => {
  const navigate = useNavigate();

  const sizeClasses = {
    small: 'text-lg',
    medium: 'text-2xl',
    large: 'text-4xl'
  };

  const iconSizes = {
    small: 'h-8',
    medium: 'h-10',
    large: 'h-16'
  };

  return (
    <div
      className={`flex items-center gap-3 cursor-pointer group ${className}`}
      onClick={() => navigate('/')}
    >
      <img
        src="/p&g-logo.png"
        alt="P&G Logo"
        className={`${iconSizes[size]} w-auto object-contain group-hover:scale-105 transition-transform duration-300`}
      />
      <div className="flex flex-col leading-none">
        <span className="text-slate-900 font-black tracking-tighter text-sm">PROD</span>
        <span className="text-blue-600 font-black tracking-tighter text-sm">PLANNER</span>
      </div>
    </div>
  );
};

export default Logo;