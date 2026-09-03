import React from 'react';

const StatsCard = ({ icon, title, value, subtitle, color, onClick, status }) => {
  return (
    <div 
      onClick={() => onClick && onClick(status)}
      className={`
        bg-white rounded-xl p-5 shadow-sm hover:shadow-md 
        transition-all duration-200 hover:-translate-y-1 cursor-pointer
        border-l-4 ${color}
      `}
    >
      <div className="flex items-center gap-2.5 mb-3">
        <span className="text-xl opacity-70">{icon}</span>
        <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">
          {title}
        </span>
      </div>
      <div className="text-3xl sm:text-4xl font-bold text-[#1a2332] mb-1">
        {value}
      </div>
      <div className="text-sm text-gray-400">{subtitle}</div>
    </div>
  );
};

export default StatsCard;