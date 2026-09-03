import React from 'react';

const FreezerList = ({ title, freezers }) => {
  const getStatusColor = (status) => {
    switch(status.toLowerCase()) {
      case 'normal': return 'bg-green-100 text-green-700';
      case 'warning': return 'bg-yellow-100 text-yellow-700';
      case 'critical': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="bg-white rounded-xl p-5 shadow-sm">
      <h3 className="text-lg font-semibold text-[#1a2332] mb-4 pb-3 border-b-2 border-gray-100">
        {title}
      </h3>
      <div className="space-y-3 max-h-[400px] overflow-y-auto">
        {freezers.map((freezer, index) => (
          <div 
            key={index}
            className="flex justify-between items-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <div className="flex items-center gap-4">
              <span className="font-medium text-[#1a2332] text-sm min-w-[100px]">
                {freezer.name}
              </span>
              <span className="text-sm text-gray-600 font-medium">
                {freezer.temperature}
              </span>
            </div>
            <span className={`
              px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wide
              ${getStatusColor(freezer.status)}
            `}>
              {freezer.status}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FreezerList;