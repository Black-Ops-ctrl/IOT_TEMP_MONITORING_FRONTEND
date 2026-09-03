import React from 'react';

const TemperatureDistribution = ({ data }) => {
  const getBarColor = (status) => {
    switch(status.toLowerCase()) {
      case 'very cold': return 'bg-blue-500';
      case 'normal': return 'bg-green-500';
      case 'warning': return 'bg-yellow-500';
      case 'critical': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="bg-white rounded-xl p-5 shadow-sm">
      <h3 className="text-lg font-semibold text-[#1a2332] mb-5 pb-3 border-b-2 border-gray-100">
        Temperature Range Distribution
      </h3>
      <div className="space-y-4">
        {data.map((item, index) => (
          <div key={index}>
            <div className="flex justify-between items-center mb-1.5">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-gray-700">{item.range}</span>
                <span className="text-xs text-gray-400">{item.count} Freezers</span>
              </div>
            </div>
            <div className="w-full h-8 bg-gray-100 rounded-full overflow-hidden relative">
              <div 
                className={`
                  h-full rounded-full transition-all duration-500 ease-out
                  flex items-center justify-end px-3
                  ${getBarColor(item.status)}
                `}
                style={{ width: `${item.percentage}%` }}
              >
                <span className="text-xs font-medium text-white">
                  {item.status}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TemperatureDistribution;