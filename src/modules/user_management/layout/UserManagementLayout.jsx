import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import DashboardLayout from '../../dashboard/layout/DashboardLayout';

const UserManagementLayout = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const tabs = [
    { label: 'Users', path: '/user-management/users' },
    // { label: 'Roles', path: '/user-management/roles' },
    // { label: 'Permissions', path: '/user-management/permissions' },
  ];

  const handleTabClick = (path) => {
    navigate(path);
  };

  return (
    <DashboardLayout>
      <div className="w-full">
        {/* Tabs Container - Responsive */}
        <div className="bg-gradient-to-b from-[#0b1a30] to-[#1a3a6b] rounded-md p-1 sm:p-1.5 md:p-2 mb-3 sm:mb-4 md:mb-4 shadow-lg">
          <div className="flex items-center gap-0.5 sm:gap-1 md:gap-1.5 overflow-x-auto scrollbar-hide px-0.5 sm:px-1" style={{ fontFamily: 'Jura, sans-serif' }}>
            {tabs.map((tab) => {
              const isActive = location.pathname === tab.path;
              return (
                <button
                  key={tab.path}
                  onClick={() => handleTabClick(tab.path)}
                  className={`
                    px-2 sm:px-3 md:px-4 lg:px-5 
                    py-1 sm:py-1.5 md:py-1.5 lg:py-2
                    text-[10px] sm:text-xs md:text-sm lg:text-sm 
                    font-medium transition-all duration-200 whitespace-nowrap rounded
                    flex-shrink-0
                    ${isActive
                      ? 'bg-white text-blue-700 shadow-md'
                      : 'text-white/80 hover:text-white hover:bg-white/10'
                    }
                  `}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Content */}
        <div className="mt-2 sm:mt-3 md:mt-4">
          {children}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default UserManagementLayout;