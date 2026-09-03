import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';  
import { getMenuItems } from '../../../config/routes';
import { getRecentNotifications } from '../../../services/api/api';
import bgImage from '../../../assets/png/bg_image_one.png';
import logo from '../../../assets/png/logo_1.png';
import dashboardIcon from '../../../assets/png/dashboard.png';
import liveReportIcon from '../../../assets/png/live_report.png';
import historyIcon from '../../../assets/png/history.png';
import deviceManagementIcon from '../../../assets/png/device_management.png';
import userManagementIcon from '../../../assets/png/user_management.png';
import logoutIcon from '../../../assets/png/logout.png';

// ============================================
// SIMPLE NOTIFICATION BELL COMPONENT
// ============================================
const NotificationBell = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const response = await getRecentNotifications();
      console.log('Notifications response:', response);
      
      if (response.success) {
        const data = response.data || [];
        setNotifications(data);
        setUnreadCount(data.length);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleDropdown = () => {
    if (!isOpen) {
      fetchNotifications();
    }
    setIsOpen(!isOpen);
    if (!isOpen) {
      setUnreadCount(0);
    }
  };

  const handleClose = () => {
    setIsOpen(false);
    setUnreadCount(0);
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'critical': return '🚨';
      case 'warning': return '⚠️';
      case 'normal': return '✅';
      case 'inactive': return '📡';
      case 'active': return '📡';
      default: return '🔔';
    }
  };

  const getNotificationColor = (type) => {
    switch (type) {
      case 'critical': return 'border-l-4 border-l-red-500 bg-red-50';
      case 'warning': return 'border-l-4 border-l-yellow-500 bg-yellow-50';
      case 'normal': return 'border-l-4 border-l-green-500 bg-green-50';
      case 'inactive': return 'border-l-4 border-l-gray-400 bg-gray-50';
      case 'active': return 'border-l-4 border-l-blue-500 bg-blue-50';
      default: return 'border-l-4 border-l-gray-300 bg-white';
    }
  };

  const getBadgeColor = (type) => {
    switch (type) {
      case 'critical': return 'bg-red-500 text-white';
      case 'warning': return 'bg-yellow-500 text-white';
      case 'normal': return 'bg-green-500 text-white';
      case 'inactive': return 'bg-gray-400 text-white';
      case 'active': return 'bg-blue-500 text-white';
      default: return 'bg-gray-300 text-gray-700';
    }
  };

  const formatTime = (timestamp) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    const now = new Date();
    const diff = Math.floor((now - date) / 1000 / 60);
    if (diff < 1) return 'Just now';
    if (diff < 60) return `${diff}m ago`;
    if (diff < 1440) return `${Math.floor(diff / 60)}h ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="relative inline-block" ref={dropdownRef}>
      <button
        onClick={toggleDropdown}
        className="relative p-2 rounded-full hover:bg-gray-100 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-400"
        aria-label="Notifications"
      >
        <svg 
          className="w-5 h-5 text-gray-600" 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth="2" 
            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
          />
        </svg>
        
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 bg-red-500 text-white text-[10px] font-bold rounded-full h-5 w-5 flex items-center justify-center animate-pulse shadow-md">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <>
          <div 
            className="fixed inset-0 z-[9998]"
            onClick={handleClose}
          />
          <div className="absolute right-0 mt-2 w-80 md:w-96 bg-white rounded-xl shadow-2xl border border-gray-200 z-[9999] max-h-[450px] overflow-hidden">
            
            <div className="p-3 border-b border-gray-200 flex justify-between items-center bg-gray-50 sticky top-0">
              <div className="flex items-center gap-2">
                <span className="text-lg">🔔</span>
                <h3 className="font-semibold text-gray-800 text-sm">Notifications</h3>
              </div>
              {notifications.length > 0 && (
                <span className="text-xs bg-gray-200 text-gray-600 px-2 py-0.5 rounded-full">
                  {notifications.length}
                </span>
              )}
            </div>

            <div className="overflow-y-auto max-h-[320px] divide-y divide-gray-100">
              {loading ? (
                <div className="flex flex-col items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                  <p className="text-xs text-gray-400 mt-2">Loading...</p>
                </div>
              ) : notifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10">
                  <span className="text-4xl mb-2">🔕</span>
                  <p className="text-sm text-gray-400 font-medium">No notifications</p>
                </div>
              ) : (
                notifications.map((notif, index) => (
                  <div 
                    key={index} 
                    className={`px-4 py-3 hover:bg-gray-50 transition-all duration-200 ${getNotificationColor(notif.type)}`}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-base ${getBadgeColor(notif.type)}`}>
                        {getNotificationIcon(notif.type)}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className="text-xs font-semibold text-gray-800 truncate">
                            {notif.title}
                          </p>
                          <span className="text-[9px] text-gray-400 whitespace-nowrap ml-2">
                            {formatTime(notif.timestamp)}
                          </span>
                        </div>
                        <p className="text-[11px] text-gray-600 mt-0.5 line-clamp-2">
                          {notif.message}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-[9px] text-gray-400">📍</span>
                          <span className="text-[9px] text-gray-400 truncate">
                            {notif.freezer_name}
                          </span>
                          {notif.shop_name && (
                            <>
                              <span className="text-[8px] text-gray-300">•</span>
                              <span className="text-[9px] text-gray-400 truncate">
                                {notif.shop_name}
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {notifications.length > 0 && (
              <div className="p-2 border-t border-gray-100 bg-gray-50 text-center">
                <p className="text-[9px] text-gray-400">
                  {notifications.length} notification{notifications.length > 1 ? 's' : ''}
                </p>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

// ============================================
// DASHBOARD LAYOUT
// ============================================
const DashboardLayout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();

  const userRole = user?.role_name || 'VIEW_ONLY';
  const menuItems = getMenuItems(userRole);

  const isRouteActive = (path) => {
    if (path === '/device-management') {
      return location.pathname.startsWith('/device-management');
    }
    if (path === '/user-management') {
      return location.pathname.startsWith('/user-management');
    }
    return location.pathname === path;
  };

  // ✅ Fixed: Check user from context, not localStorage
  useEffect(() => {
    const handlePopState = () => {
      if (!user) {
        navigate('/login');
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [navigate, user]);

  const handleNavigation = (path) => {
    navigate(path);
    setSidebarOpen(false);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getIcon = (id) => {
    const icons = {
      'dashboard': dashboardIcon,
      'live-report': liveReportIcon,
      'historical': historyIcon,
      'device-management': deviceManagementIcon,
      'user-management': userManagementIcon
    };
    return icons[id] || dashboardIcon;
  };

  return (
    <div className="flex h-screen w-screen bg-white overflow-hidden">
      <aside className={`
        lg:relative lg:flex lg:flex-col lg:shrink-0
        fixed inset-y-0 left-0 z-40
        w-48 sm:w-52 md:w-56 lg:w-52 xl:w-56
        bg-gradient-to-b from-[#0b1a30] to-[#1a3a6b]
        text-white
        transition-transform duration-300 ease-in-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="border-b border-white/30 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex-1 flex justify-center">
              <img 
                src={logo} 
                alt="Temperature Monitoring Dashboard" 
                className="h-16 sm:h-20 md:h-22 lg:h-24 w-auto object-contain"
              />
            </div>
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto py-2 sm:py-3">
          <ul className="space-y-0.5">
            {menuItems.map((item) => (
              <li 
                key={item.id}
                onClick={() => handleNavigation(item.path)}
                className={`flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-1.5 sm:py-2 cursor-pointer text-[10px] sm:text-xs transition-colors mx-1 sm:mx-2 ${
                  isRouteActive(item.path)
                    ? 'bg-white/20 text-white' 
                    : 'text-white hover:bg-white/10 hover:text-white'
                }`}
              >
                <img 
                  src={getIcon(item.id)} 
                  alt={item.label} 
                  className="h-3 w-3 sm:h-4 sm:w-4 object-contain"
                />
                <span>{item.label}</span>
              </li>
            ))}
          </ul>
        </nav>

        <div className="p-3 sm:p-4 border-t border-white/30 flex-shrink-0">
          <button 
            onClick={handleLogout}
            className="flex items-center gap-2 sm:gap-3 w-full text-left text-white hover:text-white text-[10px] sm:text-xs py-1.5 transition-colors hover:bg-white/10 px-2 sm:px-3"
          >
            <img 
              src={logoutIcon} 
              alt="Sign Out" 
              className="h-3 w-3 sm:h-4 sm:w-4 object-contain"
            />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <main className="flex-1 flex flex-col min-h-screen overflow-hidden">
        <header className="bg-white/95 backdrop-blur-sm px-3 sm:px-4 py-2 sm:py-2.5 shadow-sm flex items-center justify-between flex-shrink-0 border-b border-gray-200/50 relative z-10">
          
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden text-lg sm:text-xl hover:bg-gray-100 p-1.5 rounded transition-colors"
              aria-label="Open sidebar"
            >
              ☰
            </button>
          </div>

          <div className="flex-1 flex justify-center">
            <h1 className="text-xs sm:text-sm md:text-lg font-semibold text-black text-center px-2 sm:px-0" style={{ fontFamily: 'Jura, sans-serif' }}>
              Integrated Monitoring System
            </h1>
          </div>
          
          <div className="flex items-center gap-2">
            <NotificationBell />
          </div>
        </header>

        <div 
          className="flex-1 overflow-y-auto p-2 sm:p-3 md:p-4"
          style={{
            backgroundImage: `url(${bgImage})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
            backgroundAttachment: 'fixed'
          }}
        >
          {children}
        </div>
      </main>
    </div>
  );
};

export default DashboardLayout;