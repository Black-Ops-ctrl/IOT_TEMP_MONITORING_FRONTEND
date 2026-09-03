import React from 'react';
import { FiMapPin, FiClock } from 'react-icons/fi';

const CriticalFreezers = ({ freezers }) => {
  return (
    <div className="bg-white rounded-xl p-5 shadow-sm">
      <h3 className="text-lg font-semibold text-[#1a2332] mb-4 pb-3 border-b-2 border-gray-100">
        Critical Freezers
      </h3>
      <div className="space-y-3">
        {freezers.map((freezer, index) => (
          <div 
            key={index}
            className="p-4 bg-red-50 border border-red-200 rounded-lg hover:shadow-md transition-shadow"
          >
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <span className="font-semibold text-[#1a2332]">{freezer.name}</span>
                  <div className="flex items-center gap-1 text-xs text-gray-500">
                    <FiMapPin size={12} />
                    <span>{freezer.location}</span>
                  </div>
                </div>
                <div className="flex items-center gap-4 text-sm">
                  <span className="font-medium text-red-600">
                    {freezer.temperature}
                  </span>
                  <div className="flex items-center gap-1 text-gray-500">
                    <FiClock size={12} />
                    <span>{freezer.timeAgo}</span>
                  </div>
                </div>
              </div>
              <button className="
                px-4 py-1.5 text-sm font-medium text-blue-600 
                bg-blue-50 hover:bg-blue-100 rounded-lg
                transition-colors
              ">
                Details
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CriticalFreezers;