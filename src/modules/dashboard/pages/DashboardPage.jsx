import React, { useState, useEffect, useRef, useCallback } from 'react';
import DashboardLayout from '../layout/DashboardLayout';
import Gauge from '../components/Gauge';
import FreezerDetailsModal from '../components/FreezerDetailsModal';
import temperatureIcon from '../../../assets/png/temperature.png';
import criticalIcon from '../../../assets/png/critical.png';
import { 
  getDashboardSummary, 
  getFreezers, 
  getCriticalFreezers,
  getRegions,
  getCities,
  getShops
} from '../../../services/api/api';

const DashboardPage = () => {
  const [freezerData, setFreezerData] = useState([]);
  const [loadingFreezers, setLoadingFreezers] = useState(true);

  // Filter states - store both id and name for display
  const [filters, setFilters] = useState({
    region: { id: '', name: '' },
    city: { id: '', name: '' },
    shop: { id: '', name: '' }
  });

  // Dropdown options
  const [regions, setRegions] = useState([]);
  const [cities, setCities] = useState([]);
  const [shops, setShops] = useState([]);

  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [modalStatus, setModalStatus] = useState(null);
  const [modalTitle, setModalTitle] = useState('');
  const [modalColor, setModalColor] = useState('');

  // State for dashboard summary
  const [summaryData, setSummaryData] = useState({
    total_freezers: 0,
    normal_freezers: 0,
    warning_freezers: 0,
    critical_freezers: 0,
    inactive_freezers: 0,
    avg_temperature: 0
  });
  const [loading, setLoading] = useState(true);

  // State for critical freezers
  const [criticalFreezers, setCriticalFreezers] = useState([]);
  const [loadingCritical, setLoadingCritical] = useState(true);

  // State for last updated time
  const [lastUpdated, setLastUpdated] = useState(null);

  const scrollRef = useRef(null);
  const [isHovered, setIsHovered] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeftPos, setScrollLeftPos] = useState(0);

  // Use ref to track current filters for auto-refresh
  const filtersRef = useRef(filters);

  // Update ref whenever filters change
  useEffect(() => {
    filtersRef.current = filters;
  }, [filters]);

  // Track initial load to prevent duplicate calls
  const isInitialMount = useRef(true);

  // Fetch dropdown data on mount
  useEffect(() => {
    fetchRegions();
    fetchCities();
    fetchShops();
  }, []);

  // Fetch freezers when filters change - with debounce
  useEffect(() => {
    // Skip initial mount to prevent double fetch
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }
    
    const timer = setTimeout(() => {
      fetchFreezersWithFilters();
    }, 300);

    return () => clearTimeout(timer);
  }, [filters]);

  // Select class matching HistoricalPage
  const selectClass = "w-full sm:w-auto px-2 sm:px-3 py-1.5 sm:py-1.5 text-[10px] sm:text-xs md:text-sm text-white rounded bg-gradient-to-b from-[#0b1a30] to-[#1a3a6b] focus:outline-none cursor-pointer";

  // Function to get status based on temperature
  const getStatus = useCallback((temp) => {
    if (temp <= -16) return { 
      label: 'Normal', 
      color: 'bg-green-500', 
      textColor: 'text-green-600', 
      bgColor: 'bg-green-50',
      gaugeColor: '#22C55E'
    };
    if (temp > -16 && temp <= -12) return { 
      label: 'High',
      color: 'bg-yellow-500', 
      textColor: 'text-yellow-600', 
      bgColor: 'bg-yellow-50',
      gaugeColor: '#EAB308'
    };
    if (temp > -12) return { 
      label: 'Critical', 
      color: 'bg-red-500', 
      textColor: 'text-red-600', 
      bgColor: 'bg-red-50',
      gaugeColor: '#EF4444'
    };
    return { 
      label: 'Unknown', 
      color: 'bg-gray-500', 
      textColor: 'text-gray-600', 
      bgColor: 'bg-gray-50',
      gaugeColor: '#6B7280'
    };
  }, []);

  // Get status for API status (including Inactive)
  const getStatusFromAPI = useCallback((status) => {
    const normalizedStatus = (status || '').toLowerCase().trim();
    
    switch (normalizedStatus) {
      case 'normal':
        return { 
          label: 'Normal', 
          color: 'bg-green-500', 
          textColor: 'text-green-600', 
          bgColor: 'bg-green-50',
          gaugeColor: '#22C55E'
        };
      case 'warning':
        return { 
          label: 'High',
          color: 'bg-yellow-500', 
          textColor: 'text-yellow-600', 
          bgColor: 'bg-yellow-50',
          gaugeColor: '#EAB308'
        };
      case 'critical':
        return { 
          label: 'Critical', 
          color: 'bg-red-500', 
          textColor: 'text-red-600', 
          bgColor: 'bg-red-50',
          gaugeColor: '#EF4444'
        };
      case 'inactive':
        return { 
          label: 'Inactive', 
          color: 'bg-gray-400', 
          textColor: 'text-gray-500', 
          bgColor: 'bg-gray-50',
          gaugeColor: '#9CA3AF'
        };
      default:
        return { 
          label: 'Unknown', 
          color: 'bg-gray-500', 
          textColor: 'text-gray-600', 
          bgColor: 'bg-gray-50',
          gaugeColor: '#6B7280'
        };
    }
  }, []);

  // Open modal for specific status
  const openModal = (status, title, color) => {
    setModalStatus(status);
    setModalTitle(title);
    setModalColor(color);
    setModalOpen(true);
  };

  // API Calls
  const fetchRegions = async () => {
    try {
      const response = await getRegions();
      let regionData = response.data || response;
      if (Array.isArray(regionData)) {
        const regionList = regionData.map(item => ({
          id: item.region_id || item.id,
          name: item.region_name || item.name || item
        }));
        setRegions(regionList);
      }
    } catch (error) {
      console.error('Error fetching regions:', error);
    }
  };

  const fetchCities = async () => {
    try {
      const response = await getCities();
      let cityData = response.data || response;
      if (Array.isArray(cityData)) {
        const cityList = cityData.map(item => ({
          id: item.city_id || item.id,
          name: item.city_name || item.name || item
        }));
        setCities(cityList);
      } else {
        setCities([]);
      }
    } catch (error) {
      console.error('Error fetching cities:', error);
      setCities([]);
    }
  };

  const fetchShops = async () => {
    try {
      const response = await getShops();
      let shopData = response.data || response;
      if (shopData && !Array.isArray(shopData) && shopData.data) {
        shopData = shopData.data;
      }
      if (Array.isArray(shopData) && shopData.length > 0) {
        const shopList = shopData.map(item => ({
          id: item.shop_id || item.id,
          name: item.shop_name || item.name || item
        }));
        setShops(shopList);
      } else {
        setShops([]);
      }
    } catch (error) {
      console.error('Error fetching shops:', error);
      setShops([]);
    }
  };

  // Fetch freezers using current filters from ref
  const fetchFreezersWithFilters = useCallback(async () => {
    setLoadingFreezers(true);
    try {
      const currentFilters = filtersRef.current;
      const filterParams = {};
      
      // Only add filters if they have values
      if (currentFilters.region.name) filterParams.region = currentFilters.region.name;
      if (currentFilters.city.name) filterParams.city = currentFilters.city.name;
      if (currentFilters.shop.name) filterParams.shop = currentFilters.shop.name;

      console.log('🔍 Fetching freezers with filters:', filterParams);
      const response = await getFreezers(filterParams);
      console.log('📦 Freezers response:', response);
      
      if (response.success && response.data) {
        const mappedData = response.data.map((item, index) => ({
          id: item.sensor_rom || index + 1,
          name: item.freezer_name || 'Unknown Freezer',
          currentTemp: parseFloat(item.temperature) || 0,
          shop: item.shop_name || 'N/A',
          city: item.city || 'N/A',
          region: item.region || 'N/A',
          lastReading: item.last_reading_time,
          status: item.status || 'Normal'
        }));
        setFreezerData(mappedData);
      } else {
        setFreezerData([]);
      }
    } catch (error) {
      console.error('Error fetching freezers:', error);
      setFreezerData([]);
    } finally {
      setLoadingFreezers(false);
    }
  }, []);

  // Fetch dashboard summary data
  const fetchSummary = useCallback(async () => {
    try {
      const response = await getDashboardSummary();
      if (response.success) {
        setSummaryData({
          total_freezers: parseInt(response.data.total_freezers) || 0,
          normal_freezers: parseInt(response.data.normal_freezers) || 0,
          warning_freezers: parseInt(response.data.warning_freezers) || 0,
          critical_freezers: parseInt(response.data.critical_freezers) || 0,
          inactive_freezers: parseInt(response.data.inactive_freezers) || 0,
          avg_temperature: parseFloat(response.data.avg_temperature) || 0
        });
      }
    } catch (error) {
      console.error('Error fetching dashboard summary:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch critical freezers
  const fetchCriticalFreezers = useCallback(async () => {
    setLoadingCritical(true);
    try {
      const response = await getCriticalFreezers();
      if (response.success && response.data) {
        const mappedData = response.data.map((item) => ({
          sensor_rom: item.sensor_rom || '',
          temperature: parseFloat(item.temperature) || 0,
          freezer_name: item.freezer_name || 'Unknown',
          shop_name: item.shop_name || 'N/A',
          city: item.city || 'N/A',
          region: item.region || 'N/A',
          last_reading_time: item.last_reading_time
        }));
        setCriticalFreezers(mappedData);
      } else {
        setCriticalFreezers([]);
      }
    } catch (error) {
      console.error('Error fetching critical freezers:', error);
      setCriticalFreezers([]);
    } finally {
      setLoadingCritical(false);
    }
  }, []);

  // Function to refresh all data with current filters
  const refreshAllData = useCallback(async () => {
    console.log('🔄 Refreshing all data with current filters:', filtersRef.current);
    await Promise.all([
      fetchSummary(),
      fetchFreezersWithFilters(),
      fetchCriticalFreezers()
    ]);
    setLastUpdated(new Date().toLocaleTimeString());
    console.log('✅ Refresh completed at:', new Date().toLocaleTimeString());
  }, [fetchSummary, fetchFreezersWithFilters, fetchCriticalFreezers]);

  // Initial data fetch - only once on mount
  useEffect(() => {
    refreshAllData();

    const interval = setInterval(() => {
      refreshAllData();
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  // Auto-scroll effect
  useEffect(() => {
    const scrollContainer = scrollRef.current;
    if (!scrollContainer) return;
    
    let scrollInterval;
    if (!isHovered && !isDragging && freezerData.length > 0) {
      scrollInterval = setInterval(() => {
        const { scrollLeft, scrollWidth, clientWidth } = scrollContainer;
        if (scrollLeft + clientWidth >= scrollWidth - 2) {
          scrollContainer.style.scrollBehavior = 'auto';
          scrollContainer.scrollLeft = 0;
          setTimeout(() => {
            scrollContainer.style.scrollBehavior = 'smooth';
          }, 50);
        } else {
          scrollContainer.scrollLeft += 1.5;
        }
      }, 30);
    }
    return () => clearInterval(scrollInterval);
  }, [isHovered, isDragging, freezerData.length]);

  // Reset scroll position
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollLeft = 0;
    }
  }, []);

  // Mouse drag scrolling
  const handleMouseDown = (e) => {
    setIsDragging(true);
    setStartX(e.pageX - scrollRef.current.offsetLeft);
    setScrollLeftPos(scrollRef.current.scrollLeft);
    scrollRef.current.style.cursor = 'grabbing';
  };

  const handleMouseLeave = () => {
    setIsDragging(false);
    if (scrollRef.current) {
      scrollRef.current.style.cursor = 'grab';
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    if (scrollRef.current) {
      scrollRef.current.style.cursor = 'grab';
    }
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    e.preventDefault();
    const x = e.pageX - scrollRef.current.offsetLeft;
    const walk = (x - startX) * 1.5;
    scrollRef.current.scrollLeft = scrollLeftPos - walk;
  };

  // Handlers - store full value with id and name
  const handleRegionChange = (e) => {
    const value = e.target.value;
    if (value) {
      const [id, name] = value.split('|');
      setFilters(prev => ({ 
        ...prev, 
        region: { id, name } 
      }));
    } else {
      setFilters(prev => ({ 
        ...prev, 
        region: { id: '', name: '' } 
      }));
    }
  };

  const handleCityChange = (e) => {
    const value = e.target.value;
    if (value) {
      const [id, name] = value.split('|');
      setFilters(prev => ({ 
        ...prev, 
        city: { id, name } 
      }));
    } else {
      setFilters(prev => ({ 
        ...prev, 
        city: { id: '', name: '' } 
      }));
    }
  };

  const handleShopChange = (e) => {
    const value = e.target.value;
    if (value) {
      const [id, name] = value.split('|');
      setFilters(prev => ({ 
        ...prev, 
        shop: { id, name } 
      }));
    } else {
      setFilters(prev => ({ 
        ...prev, 
        shop: { id: '', name: '' } 
      }));
    }
  };

  // Temperature Distribution
  const tempDistribution = [
    { 
      label: '≤ -16°C (Normal)', 
      count: summaryData.normal_freezers || 0, 
      status: 'Normal', 
      color: 'bg-green-500' 
    },
    { 
      label: '-16°C to -12°C (High)', 
      count: summaryData.warning_freezers || 0, 
      status: 'High', 
      color: 'bg-yellow-500' 
    },
    { 
      label: '> -12°C (Critical)', 
      count: summaryData.critical_freezers || 0, 
      status: 'Critical', 
      color: 'bg-red-500' 
    },
    { 
      label: 'Inactive', 
      count: summaryData.inactive_freezers || 0, 
      status: 'Inactive', 
      color: 'bg-gray-400' 
    },
  ];

  // Calculate max count for percentage
  const maxCount = Math.max(...tempDistribution.map(d => d.count), 1);
  const updatedDistribution = tempDistribution.map((d, index) => ({
    ...d,
    id: index,
    percentage: Math.round((d.count / maxCount) * 100)
  }));

  return (
    <DashboardLayout>
      {/* Auto-refresh indicator */}
      {lastUpdated && (
        <div className="text-[8px] sm:text-xs text-gray-400 text-right mb-2 animate-pulse">
          Last updated: {lastUpdated}
        </div>
      )}

      {/* Stats Cards - Clickable */}
      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-2 sm:gap-3 md:gap-3 mb-3 sm:mb-4 animate-fade-in-up">
        {/* Total Freezers */}
        <div 
          onClick={() => {
            if (summaryData.total_freezers > 0) {
              openModal(null, 'All Freezers', 'bg-blue-50');
            }
          }}
          className={`bg-gradient-to-b from-[#0b1a30] to-[#1a3a6b] p-3 sm:p-4 shadow-lg rounded-md transition-all duration-300 hover:scale-105 ${summaryData.total_freezers === 0 ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
          style={{ fontFamily: 'Jura, sans-serif' }}
        >
          <div className="text-[10px] sm:text-xs md:text-sm text-white uppercase tracking-wider mb-1 sm:mb-2">TOTAL FREEZERS</div>
          <div className="text-base sm:text-lg md:text-xl font-semi-bold text-white transition-all duration-500">
            {loading ? '...' : summaryData.total_freezers}
          </div>
        </div>

        {/* Normal Freezers */}
        <div 
          onClick={() => {
            if (summaryData.normal_freezers > 0) {
              openModal('normal', 'Normal Freezers', 'bg-green-50');
            }
          }}
          className={`bg-gradient-to-b from-[#0b1a30] to-[#1a3a6b] p-2 sm:p-4 shadow-lg rounded-md animate-fade-in-up delay-100 transition-all duration-300 hover:scale-105 ${summaryData.normal_freezers === 0 ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
          style={{ fontFamily: 'Jura, sans-serif' }}
        >
          <div className="text-[8px] sm:text-xs md:text-sm text-white uppercase tracking-wider mb-0.5 sm:mb-2">NORMAL FREEZERS</div>
          <div className="text-sm sm:text-lg md:text-xl font-semi-bold text-white transition-all duration-500">
            {loading ? '...' : summaryData.normal_freezers}
          </div>
        </div>

        {/* High Freezers */}
        <div 
          onClick={() => {
            if (summaryData.warning_freezers > 0) {
              openModal('warning', 'High Freezers', 'bg-yellow-50');
            }
          }}
          className={`bg-gradient-to-b from-[#0b1a30] to-[#1a3a6b] p-2 sm:p-4 shadow-lg rounded-md animate-fade-in-up delay-200 transition-all duration-300 hover:scale-105 ${summaryData.warning_freezers === 0 ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
          style={{ fontFamily: 'Jura, sans-serif' }}
        >
          <div className="text-[8px] sm:text-xs md:text-sm text-white uppercase tracking-wider mb-0.5 sm:mb-2">HIGH FREEZERS</div>
          <div className="text-sm sm:text-lg md:text-xl font-semi-bold text-white transition-all duration-500">
            {loading ? '...' : summaryData.warning_freezers}
          </div>
        </div>

        {/* Critical Freezers */}
        <div 
          onClick={() => {
            if (summaryData.critical_freezers > 0) {
              openModal('critical', 'Critical Freezers', 'bg-red-50');
            }
          }}
          className={`bg-gradient-to-b from-[#0b1a30] to-[#1a3a6b] p-2 sm:p-4 shadow-lg rounded-md animate-fade-in-up delay-300 transition-all duration-300 hover:scale-105 ${summaryData.critical_freezers === 0 ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
          style={{ fontFamily: 'Jura, sans-serif' }}
        >
          <div className="text-[8px] sm:text-xs md:text-sm text-white uppercase tracking-wider mb-0.5 sm:mb-2">CRITICAL FREEZERS</div>
          <div className="text-sm sm:text-lg md:text-xl font-semi-bold text-white transition-all duration-500">
            {loading ? '...' : summaryData.critical_freezers}
          </div>
        </div>

        {/* Inactive Freezers */}
        <div 
          onClick={() => {
            if (summaryData.inactive_freezers > 0) {
              openModal('inactive', 'Inactive Freezers', 'bg-gray-50');
            }
          }}
          className={`bg-gradient-to-b from-[#0b1a30] to-[#1a3a6b] p-2 sm:p-4 shadow-lg rounded-md animate-fade-in-up delay-400 transition-all duration-300 hover:scale-105 ${summaryData.inactive_freezers === 0 ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
          style={{ fontFamily: 'Jura, sans-serif' }}
        >
          <div className="text-[8px] sm:text-xs md:text-sm text-white uppercase tracking-wider mb-0.5 sm:mb-2">INACTIVE FREEZERS</div>
          <div className="text-sm sm:text-lg md:text-xl font-semi-bold text-white transition-all duration-500">
            {loading ? '...' : summaryData.inactive_freezers}
          </div>
        </div>
      </div>

      {/* Live Freezers with Filters */}
      <div className="bg-white shadow-xl p-2 sm:p-4 mb-3 sm:mb-4 rounded-md border-l-4 border-l-green-600 animate-fade-in-up delay-150">
        
        {/* Filter Row - Responsive */}
        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 mb-3 pb-3 border-b border-gray-100">
          
          {/* Region Dropdown */}
          <div className="flex-1 sm:flex-none min-w-[100px] sm:min-w-[120px]">
            <select
              value={filters.region.id ? `${filters.region.id}|${filters.region.name}` : ''}
              onChange={handleRegionChange}
              className={selectClass}
              style={{ fontFamily: 'Jura, sans-serif' }}
            >
              <option value="" className="text-black">All Regions</option>
              {regions.map((region) => (
                <option key={region.id} value={`${region.id}|${region.name}`} className="text-black">
                  {region.name}
                </option>
              ))}
            </select>
          </div>

          {/* City Dropdown */}
          <div className="flex-1 sm:flex-none min-w-[100px] sm:min-w-[120px]">
            <select
              value={filters.city.id ? `${filters.city.id}|${filters.city.name}` : ''}
              onChange={handleCityChange}
              className={selectClass}
              style={{ fontFamily: 'Jura, sans-serif' }}
            >
              <option value="" className="text-black">All Cities</option>
              {cities.map((city) => (
                <option key={city.id} value={`${city.id}|${city.name}`} className="text-black">
                  {city.name}
                </option>
              ))}
            </select>
          </div>

          {/* Shop Dropdown */}
          <div className="flex-1 sm:flex-none min-w-[100px] sm:min-w-[120px]">
            <select
              value={filters.shop.id ? `${filters.shop.id}|${filters.shop.name}` : ''}
              onChange={handleShopChange}
              className={selectClass}
              style={{ fontFamily: 'Jura, sans-serif' }}
            >
              <option value="" className="text-black">All Shops</option>
              {shops.map((shop) => (
                <option key={shop.id} value={`${shop.id}|${shop.name}`} className="text-black">
                  {shop.name}
                </option>
              ))}
            </select>
          </div>

          {/* Results Count - Show on all screens */}
          <span className="text-[8px] sm:text-xs text-gray-400 ml-auto whitespace-nowrap">
            {freezerData.length} freezers
          </span>
        </div>

        {/* Title */}
        <h3 className="text-[10px] sm:text-sm font-semibold flex items-center justify-center text-black mb-2 sm:mb-3">
          Live Freezers Temperature
          <span className="ml-2 text-[8px] sm:text-[10px] text-green-500 animate-pulse">● Live</span>
        </h3>

        {/* Scrolling Freezers */}
        <div 
          ref={scrollRef}
          className="overflow-x-auto scrollbar-hide cursor-grab select-none"
          style={{ 
            scrollBehavior: 'smooth',
            msOverflowStyle: 'none',  
            scrollbarWidth: 'none'    
          }}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => {
            setIsHovered(false);
            handleMouseLeave();
          }}
          onMouseDown={handleMouseDown}
          onMouseUp={handleMouseUp}
          onMouseMove={handleMouseMove}
        >
          <div className="flex gap-2 sm:gap-3" style={{ minWidth: 'max-content' }}>
            {loadingFreezers ? (
              <div className="flex items-center justify-center w-full py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#1a3a6b]"></div>
                <span className="ml-2 text-sm text-gray-500">Loading freezers...</span>
              </div>
            ) : freezerData.length > 0 ? (
              freezerData.map((freezer, index) => {
                const status = freezer.status 
                  ? getStatusFromAPI(freezer.status) 
                  : getStatus(freezer.currentTemp);
                return (
                  <div key={`${freezer.id}-${index}`} className="flex-none w-[130px] sm:w-[160px] md:w-[180px] lg:w-[200px] bg-white rounded-md py-2 sm:py-4 px-1.5 sm:px-3 shadow-lg border border-gray-300 animate-fade-in-up transition-all duration-500 hover:shadow-xl" style={{ animationDelay: `${index * 0.05}s` }}>
                    <div className="flex justify-between items-start mb-1">
                      <span className="font-semibold text-black text-[9px] sm:text-[11px] sm:max-w-[80px] md:max-w-[100px] truncate">{freezer.name}</span>
                      <span className={`text-[7px] sm:text-[9px] font-medium ${status.textColor} ${status.bgColor} px-1 sm:px-1.5 py-0.5 rounded-full whitespace-nowrap transition-all duration-300`}>
                        {status.label}
                      </span>
                    </div>
                
                    <div className="flex justify-center my-1 sm:my-2">
                      <Gauge 
                        temperature={freezer.currentTemp} 
                        size={70}
                        status={freezer.status}
                      />
                    </div>
                    
                    <div className="flex flex-col gap-0.5 mt-1 pt-1 border-t border-gray-300">
                      <div className="flex items-center justify-between gap-1">
                        <span className="text-[7px] sm:text-[10px] text-black">Shop:</span>
                        <span className="text-[7px] sm:text-[10px] text-gray-600 truncate max-w-[60px] sm:max-w-[100px]">{freezer.shop || 'N/A'}</span>
                      </div>
                      <div className="flex items-center justify-between gap-1">
                        <span className="text-[7px] sm:text-[10px] text-black">City:</span>
                        <span className="text-[7px] sm:text-[10px] text-gray-600 truncate max-w-[60px] sm:max-w-[100px]">{freezer.city || 'N/A'}</span>
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="flex items-center justify-center w-full py-8 text-gray-500 text-sm">
                No freezers available
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Temperature Distribution & Critical Freezers */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 sm:gap-4">
        {/* Temperature Distribution */}
        <div className="lg:col-span-1 animate-fade-in-left delay-200">
          <div className="bg-white rounded-lg shadow-md p-2 sm:p-4 h-full border-l-4 border-l-yellow-500 transition-all duration-300 hover:shadow-lg">
            <h3 className="text-[10px] sm:text-sm font-semibold text-black mb-2 sm:mb-3 flex items-center gap-2">
              <img 
                src={temperatureIcon} 
                alt="Temperature" 
                className="h-4 w-4 sm:h-6 sm:w-6 object-contain"
              />
              Temperature Distribution
            </h3>
            
            <div className="space-y-1.5 sm:space-y-3">
              {updatedDistribution.map((item) => (
                <div key={item.id} className="animate-fade-in-up transition-all duration-500" style={{ animationDelay: `${0.3 + item.id * 0.15}s` }}>
                  <div className="flex justify-between text-[8px] sm:text-[10px] mb-0.5">
                    <span className="font-semi-bold text-gray-700">{item.label}</span>
                    <span className="text-gray-600 transition-all duration-300">{item.count} Sensors</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-3 sm:h-5 bg-gray-200 rounded-full overflow-hidden shadow-inner">
                      <div 
                        key={`bar-${item.id}-${item.percentage}`}
                        className={`h-full ${item.color} rounded-full transition-all duration-1000 ease-out flex items-center justify-end px-1 sm:px-2`}
                        style={{ 
                          width: `${item.percentage}%`,
                          transition: 'width 1s cubic-bezier(0.4, 0, 0.2, 1)'
                        }}
                      >
                        {item.percentage > 10 && (
                          <span className="text-[6px] sm:text-[9px] font-bold text-white">{item.status}</span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="text-[8px] sm:text-[10px] text-black mt-0.5">{item.status}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Critical Freezers */}
        <div className="lg:col-span-2 animate-fade-in-right delay-300">
          <div className="bg-white rounded-xl shadow-lg p-2 sm:p-4 h-full border-l-4 border-l-red-500 transition-all duration-300 hover:shadow-xl">
            <h3 className="text-[10px] sm:text-sm font-semibold text-black mb-2 sm:mb-3 flex items-center gap-2.5">
              <div className="relative">
                <img 
                  src={criticalIcon} 
                  alt="Critical" 
                  className="h-4 w-4 sm:h-6 sm:w-6 object-contain"
                />
              </div>
              Critical Freezers ({criticalFreezers.length})
            </h3>
            
            <div className="max-h-[240px] overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-red-500/30 scrollbar-track-gray-100">
              <div className="space-y-1.5 sm:space-y-2">
                {loadingCritical ? (
                  <div className="text-center text-white/70 text-sm py-4">Loading critical freezers...</div>
                ) : criticalFreezers.length > 0 ? (
                  criticalFreezers.map((freezer, index) => {
                    const status = getStatus(freezer.temperature);
                    return (
                      <div 
                        key={freezer.sensor_rom || index} 
                        className="flex flex-wrap items-center justify-between bg-gradient-to-b from-[#0b1a30] to-[#1a3a6b] p-1.5 sm:p-2.5 rounded-md animate-fade-in-up transition-all duration-300 hover:scale-[1.02] hover:shadow-lg"
                        style={{ animationDelay: `${0.5 + index * 0.05}s` }}
                      >
                        <div className="flex flex-wrap items-center gap-1 sm:gap-4 flex-1">
                          <div className="flex items-center gap-1 sm:gap-2 min-w-[60px] sm:min-w-[100px] md:min-w-[120px]" style={{ fontFamily: 'Jura, sans-serif' }}>
                            <div className="w-1 h-1 sm:w-2 sm:h-2 bg-red-500 rounded-full animate-pulse"></div>
                            <span className="text-[8px] sm:text-xs text-white sm:max-w-[80px] md:max-w-[100px] transition-all duration-300 truncate">
                              {freezer.freezer_name}
                            </span>
                          </div>
                          <div className="hidden sm:block h-6 w-px bg-white/30"></div>            
                          <span className="text-white text-[9px] sm:text-sm min-w-[40px] sm:min-w-[60px] transition-all duration-300" style={{ fontFamily: 'Jura, sans-serif' }}>
                            {freezer.temperature}°C
                          </span>
                          
                          <div className="hidden md:block h-6 w-px bg-white/30"></div>
                          
                          <span className="hidden md:block text-[8px] sm:text-xs text-white/80 min-w-[50px] sm:min-w-[80px] transition-all duration-300 truncate" style={{ fontFamily: 'Jura, sans-serif' }}>
                            {freezer.shop_name || 'N/A'}
                          </span>
                          
                          <div className="hidden lg:block h-6 w-px bg-white/30"></div>
                          
                          <span className="hidden md:block text-[8px] sm:text-xs text-white/80 min-w-[50px] sm:min-w-[80px] transition-all duration-300 truncate" style={{ fontFamily: 'Jura, sans-serif' }}>
                            {freezer.city || 'N/A'}
                          </span>
                        </div>
                        
                        <div className="flex items-center gap-1 sm:gap-2 text-[7px] sm:text-xs text-white/80">
                          <svg className="w-2 h-2 sm:w-3 sm:h-3 text-white/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                          <span className="text-[7px] sm:text-xs text-white/70 transition-all duration-300 truncate max-w-[60px] sm:max-w-none">Region: {freezer.region || 'N/A'}</span>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="text-center text-white/70 text-sm py-4 transition-all duration-300">
                    ✅ No critical freezers found
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Freezer Details Modal */}
      <FreezerDetailsModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        status={modalStatus}
        title={modalTitle}
        color={modalColor}
      />
    </DashboardLayout>
  );
};

export default DashboardPage;