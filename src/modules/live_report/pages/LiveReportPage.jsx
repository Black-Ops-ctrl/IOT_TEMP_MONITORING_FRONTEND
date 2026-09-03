import React, { useState, useEffect, useRef } from 'react';
import DashboardLayout from '../../dashboard/layout/DashboardLayout';
import { FiSearch, FiDownload } from 'react-icons/fi';
import { getLiveReport, getRegions, getCities, getShops } from '../../../services/api/api';

const LiveReportPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRegionId, setSelectedRegionId] = useState('');
  const [selectedCityId, setSelectedCityId] = useState(''); // Changed to store city ID
  const [selectedShop, setSelectedShop] = useState('');
  
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Dropdown options - Store full objects
  const [regions, setRegions] = useState([]);
  const [cities, setCities] = useState([]); // Store full city objects with IDs
  const [shops, setShops] = useState([]);
  
  // Loading states for dropdowns
  const [loadingRegions, setLoadingRegions] = useState(false);
  const [loadingCities, setLoadingCities] = useState(false);
  const [loadingShops, setLoadingShops] = useState(false);

  // Refs for auto-refresh
  const refreshIntervalRef = useRef(null);
  const searchTimeoutRef = useRef(null);

  // Auto-refresh interval (in milliseconds)
  const REFRESH_INTERVAL = 30000; // 30 seconds
  const SEARCH_DELAY = 500; // 500ms delay for search

  // ============================================
  // FETCH REGIONS ON MOUNT
  // ============================================
  
  useEffect(() => {
    fetchRegions();
  }, []);

  // ============================================
  // FETCH CITIES WHEN REGION CHANGES
  // ============================================
  
  useEffect(() => {
    if (selectedRegionId) {
      fetchCities(selectedRegionId);
      setSelectedCityId('');
      setSelectedShop('');
      setShops([]);
    } else {
      setCities([]);
      setShops([]);
    }
  }, [selectedRegionId]);

  // ============================================
  // FETCH SHOPS WHEN CITY CHANGES
  // ============================================
  
  useEffect(() => {
    if (selectedCityId) {
      fetchShops(selectedCityId);
      setSelectedShop('');
    } else {
      setShops([]);
    }
  }, [selectedCityId]);

  // ============================================
  // FETCH LIVE REPORT WHEN FILTERS CHANGE
  // ============================================
  
  useEffect(() => {
    // Clear any pending search timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    // Debounce search to avoid too many API calls
    searchTimeoutRef.current = setTimeout(() => {
      fetchLiveReport();
    }, SEARCH_DELAY);
    
    // Clear existing interval
    if (refreshIntervalRef.current) {
      clearInterval(refreshIntervalRef.current);
    }
    
    // Start auto-refresh
    refreshIntervalRef.current = setInterval(() => {
      fetchLiveReport(true);
    }, REFRESH_INTERVAL);
    
    // Cleanup interval on unmount or filter change
    return () => {
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
      }
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [selectedRegionId, selectedCityId, selectedShop, searchTerm]);

  // ============================================
  // API CALLS
  // ============================================

  // API 1: Get Regions - Store full objects with IDs
  const fetchRegions = async () => {
    setLoadingRegions(true);
    try {
      const response = await getRegions();
      console.log('Regions response:', response);
      
      let regionData = response.data || response;
      
      if (Array.isArray(regionData)) {
        setRegions(regionData);
        console.log('Regions stored with IDs:', regionData);
      } else {
        setRegions([]);
      }
    } catch (err) {
      console.error('Error fetching regions:', err);
      setRegions([]);
    } finally {
      setLoadingRegions(false);
    }
  };

  // API 2: Get Cities by Region ID - Store full city objects with IDs
  const fetchCities = async (regionId) => {
    setLoadingCities(true);
    try {
      const response = await getCities(regionId);
      console.log('Cities response for region ID:', regionId, response);
      
      let cityData = response.data || response;
      
      if (Array.isArray(cityData)) {
        // Store full city objects with IDs
        setCities(cityData);
        console.log('Cities stored with IDs:', cityData);
      } else {
        setCities([]);
      }
    } catch (err) {
      console.error('Error fetching cities:', err);
      setCities([]);
    } finally {
      setLoadingCities(false);
    }
  };

  // API 3: Get Shops by City ID
  const fetchShops = async (cityId) => {
    setLoadingShops(true);
    try {
      const response = await getShops(cityId); // Pass city ID
      console.log('Shops response for city ID:', cityId, response);
      
      let shopData = response.data || response;
      
      if (Array.isArray(shopData)) {
        const shopNames = shopData.map(item => item.shop_name || item.name || item);
        setShops(shopNames);
      } else {
        setShops([]);
      }
    } catch (err) {
      console.error('Error fetching shops:', err);
      setShops([]);
    } finally {
      setLoadingShops(false);
    }
  };

  // API 4: Get Live Report
  const fetchLiveReport = async (silent = false) => {
    if (!silent) {
      setLoading(true);
    }
    setError(null);
    
    try {
      // Build filters object
      const filters = {};
      
      // Get region name from selected ID
      let regionName = '';
      if (selectedRegionId) {
        const selectedRegion = regions.find(r => {
          const id = r.region_id || r.id;
          return String(id) === String(selectedRegionId);
        });
        regionName = selectedRegion ? (selectedRegion.region_name || selectedRegion.name) : '';
        filters.region = regionName;
      }
      
      // Get city name from selected ID
      let cityName = '';
      if (selectedCityId) {
        const selectedCity = cities.find(c => {
          const id = c.city_id || c.id;
          return String(id) === String(selectedCityId);
        });
        cityName = selectedCity ? (selectedCity.city_name || selectedCity.name) : '';
        filters.city = cityName;
      }
      
      if (selectedShop) filters.shop = selectedShop;
      
      // Search term
      const searchParam = searchTerm.trim() || undefined;
      
      console.log('Fetching with filters:', filters, 'search:', searchParam);
      
      // Call API with filters and search separately
      const response = await getLiveReport(filters, searchParam);
      console.log('Live Report response:', response);
      
      let reportData = response.data || response;
      
      if (Array.isArray(reportData)) {
        let filteredData = reportData;
        if (searchTerm.trim()) {
          const searchLower = searchTerm.toLowerCase().trim();
          filteredData = reportData.filter(item => {
            const freezerName = (item.freezer_name || item.name || '').toLowerCase();
            return freezerName.includes(searchLower);
          });
        }
        setData(filteredData);
      } else if (reportData.freezers) {
        let filteredData = reportData.freezers;
        if (searchTerm.trim()) {
          const searchLower = searchTerm.toLowerCase().trim();
          filteredData = reportData.freezers.filter(item => {
            const freezerName = (item.freezer_name || item.name || '').toLowerCase();
            return freezerName.includes(searchLower);
          });
        }
        setData(filteredData);
      } else if (reportData.items) {
        let filteredData = reportData.items;
        if (searchTerm.trim()) {
          const searchLower = searchTerm.toLowerCase().trim();
          filteredData = reportData.items.filter(item => {
            const freezerName = (item.freezer_name || item.name || '').toLowerCase();
            return freezerName.includes(searchLower);
          });
        }
        setData(filteredData);
      } else {
        setData([]);
      }
    } catch (err) {
      console.error('Error fetching live report:', err);
      if (!silent) {
        setError(err.message || 'Failed to fetch live report');
      }
      setData([]);
    } finally {
      if (!silent) {
        setLoading(false);
      }
    }
  };

  // ============================================
  // HANDLERS
  // ============================================

  const handleRegionChange = (e) => {
    const value = e.target.value;
    setSelectedRegionId(value);
  };

  const handleCityChange = (e) => {
    const value = e.target.value;
    setSelectedCityId(value); // Store city ID
  };

  const handleShopChange = (e) => {
    setSelectedShop(e.target.value);
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  // ============================================
  // GET STATUS STYLING
  // ============================================

  const getStatusStyle = (status) => {
    const normalizedStatus = (status || '').toLowerCase().trim();
    
    switch (normalizedStatus) {
      case 'normal':
        return { 
          label: 'Normal', 
          style: 'bg-green-100 text-green-700', 
          dot: 'bg-green-500',
          textColor: 'text-green-600'
        };
      case 'warning':
        return { 
          label: 'Warning', 
          style: 'bg-yellow-100 text-yellow-700', 
          dot: 'bg-yellow-500',
          textColor: 'text-yellow-600'
        };
      case 'critical':
        return { 
          label: 'Critical', 
          style: 'bg-red-100 text-red-700', 
          dot: 'bg-red-500',
          textColor: 'text-red-600'
        };
      case 'inactive':
        return { 
          label: 'Inactive', 
          style: 'bg-gray-200 text-gray-700', 
          dot: 'bg-gray-400',
          textColor: 'text-gray-500'
        };
      default:
        return { 
          label: 'Unknown', 
          style: 'bg-gray-100 text-gray-700', 
          dot: 'bg-gray-500',
          textColor: 'text-gray-600'
        };
    }
  };

  // ============================================
  // FORMAT TIME
  // ============================================

  const formatTime = (timestamp) => {
    if (!timestamp) return 'N/A';
    
    try {
      const date = new Date(timestamp);
      if (isNaN(date.getTime())) {
        if (typeof timestamp === 'string' && timestamp.includes('min ago')) {
          return timestamp;
        }
        return 'N/A';
      }
      
      return date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true
      });
    } catch (error) {
      return 'N/A';
    }
  };

  // ============================================
  // EXPORT TO CSV
  // ============================================

  const exportToCSV = () => {
    if (data.length === 0) {
      alert('No data to export');
      return;
    }

    const headers = ['#', 'Freezer', 'Region', 'City', 'Shop', 'Temp (°C)', 'Status', 'Last Updated'];
    
    const rows = data.map((item, index) => {
      const temp = parseFloat(item.temperature || 0);
      const status = item.status || 'Normal';
      
      return [
        index + 1,
        item.freezer_name || '',
        item.region || '',
        item.city || '',
        item.shop_name || '',
        temp,
        status,
        formatTime(item.last_updated)
      ];
    });

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `live_report_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // ============================================
  // RENDER
  // ============================================

  return (
    <DashboardLayout>
      <div className="max-w-full px-2 sm:px-3 md:px-4">

        {/* Filters Row */}
        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 md:gap-3 mb-4 animate-fade-in-up delay-100">
          
          {/* Region Dropdown */}
          <div className="relative w-full sm:w-auto">
            <select
              value={selectedRegionId}
              onChange={handleRegionChange}
              className="w-full sm:w-28 md:w-32 lg:w-36 px-2 py-1 sm:py-1.5 text-xs sm:text-sm text-white rounded focus:outline-none bg-gradient-to-b from-[#0b1a30] to-[#1a3a6b]"
              style={{ fontFamily: 'Jura, sans-serif' }}
              disabled={loadingRegions}
            >
              <option value="" className="text-black">
                {loadingRegions ? 'Loading...' : 'Regions'}
              </option>
              {regions.map((region) => {
                const id = region.region_id || region.id;
                const name = region.region_name || region.name || region;
                return (
                  <option key={id} value={id} className="text-black">
                    {name}
                  </option>
                );
              })}
            </select>
          </div>

          {/* City Dropdown - Using ID as value */}
          <div className="relative w-full sm:w-auto">
            <select
              value={selectedCityId}
              onChange={handleCityChange}
              className="w-full sm:w-28 md:w-32 lg:w-36 px-2 py-1 sm:py-1.5 text-xs sm:text-sm text-white rounded focus:outline-none bg-gradient-to-b from-[#0b1a30] to-[#1a3a6b]"
              style={{ fontFamily: 'Jura, sans-serif' }}
              disabled={!selectedRegionId || loadingCities}
            >
              <option value="" className="text-black">
                {loadingCities ? 'Loading...' : 'Cities'}
              </option>
              {cities.map((city) => {
                const id = city.city_id || city.id;
                const name = city.city_name || city.name || city;
                return (
                  <option key={id} value={id} className="text-black">
                    {name}
                  </option>
                );
              })}
            </select>
          </div>

          {/* Shop Dropdown */}
          <div className="relative w-full sm:w-auto">
            <select
              value={selectedShop}
              onChange={handleShopChange}
              className="w-full sm:w-28 md:w-32 lg:w-36 px-2 py-1 sm:py-1.5 text-xs sm:text-sm text-white rounded focus:outline-none bg-gradient-to-b from-[#0b1a30] to-[#1a3a6b]"
              style={{ fontFamily: 'Jura, sans-serif' }}
              disabled={!selectedCityId || loadingShops}
            >
              <option value="" className="text-black">
                {loadingShops ? 'Loading...' : 'Shops'}
              </option>
              {shops.map((shop) => (
                <option key={shop} value={shop} className="text-black">{shop}</option>
              ))}
            </select>
          </div>

          {/* Search Input */}
          <div className="relative flex-1 min-w-[120px] sm:min-w-[160px]">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input
              type="text"
              placeholder="Search freezers..."
              value={searchTerm}
              onChange={handleSearchChange}
              className="w-full pl-10 pr-3 py-1.5 sm:py-2 text-xs sm:text-sm border border-gray-300 rounded-full focus:outline-none focus:ring-1 focus:ring-gray-400 focus:border-transparent transition-all bg-white"
            />
          </div>

          {/* Export Button */}
          <button 
            onClick={exportToCSV}
            className="flex items-center gap-1.5 px-3 sm:px-4 py-1.5 sm:py-2 bg-gradient-to-b from-[#0b1a30] to-[#1a3a6b] text-white text-[10px] sm:text-xs rounded-full shadow-lg hover:opacity-90 transition-opacity whitespace-nowrap"
            style={{ fontFamily: 'Poppins, sans-serif' }}
          >
            <FiDownload size={12} />
            Export to Excel
          </button>
        </div>

        {/* Table */}
        <div className="bg-white shadow-lg border border-gray-300 overflow-hidden rounded-lg animate-fade-in-up delay-200">
          <div className="overflow-x-auto" style={{ maxHeight: '500px', overflowY: 'auto' }}>
            <table className="w-full min-w-[800px] sm:min-w-full">
              <thead className="sticky top-0 z-10">
                <tr className="bg-gradient-to-b from-[#0b1a30] to-[#1a3a6b] border-b border-gray-600">
                  <th className="px-2 sm:px-3 py-1.5 sm:py-2 text-left text-[10px] sm:text-xs font-normal text-white uppercase tracking-wider" style={{ fontFamily: 'Jura, sans-serif' }}>#</th>
                  <th className="px-2 sm:px-3 py-1.5 sm:py-2 text-left text-[10px] sm:text-xs font-normal text-white uppercase tracking-wider" style={{ fontFamily: 'Jura, sans-serif' }}>Freezer</th>
                  <th className="px-2 sm:px-3 py-1.5 sm:py-2 text-left text-[10px] sm:text-xs font-normal text-white uppercase tracking-wider" style={{ fontFamily: 'Jura, sans-serif' }}>Region</th>
                  <th className="px-2 sm:px-3 py-1.5 sm:py-2 text-left text-[10px] sm:text-xs font-normal text-white uppercase tracking-wider" style={{ fontFamily: 'Jura, sans-serif' }}>City</th>
                  <th className="px-2 sm:px-3 py-1.5 sm:py-2 text-left text-[10px] sm:text-xs font-normal text-white uppercase tracking-wider" style={{ fontFamily: 'Jura, sans-serif' }}>Shop</th>
                  <th className="px-2 sm:px-3 py-1.5 sm:py-2 text-left text-[10px] sm:text-xs font-normal text-white uppercase tracking-wider" style={{ fontFamily: 'Jura, sans-serif' }}>Temp</th>
                  <th className="px-2 sm:px-3 py-1.5 sm:py-2 text-left text-[10px] sm:text-xs font-normal text-white uppercase tracking-wider" style={{ fontFamily: 'Jura, sans-serif' }}>Status</th>
                  <th className="px-2 sm:px-3 py-1.5 sm:py-2 text-left text-[10px] sm:text-xs font-normal text-white uppercase tracking-wider" style={{ fontFamily: 'Jura, sans-serif' }}>Last Updated</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="8" className="px-2 sm:px-3 py-8 sm:py-12 text-center">
                      <div className="flex justify-center items-center">
                        <div className="animate-spin rounded-full h-6 w-6 sm:h-8 sm:w-8 border-b-2 border-blue-600"></div>
                        <span className="ml-2 text-sm text-gray-500">Loading...</span>
                      </div>
                    </td>
                  </tr>
                ) : error ? (
                  <tr>
                    <td colSpan="8" className="px-2 sm:px-3 py-8 sm:py-12 text-center">
                      <p className="text-red-500 text-xs sm:text-sm">{error}</p>
                      <button 
                        onClick={() => fetchLiveReport(false)}
                        className="mt-2 px-4 py-1 text-sm text-blue-600 border border-blue-400 rounded hover:bg-blue-50"
                      >
                        Retry
                      </button>
                    </td>
                  </tr>
                ) : data.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="px-2 sm:px-3 py-8 sm:py-12 text-center">
                      <p className="text-gray-500 text-xs sm:text-sm">No freezers found</p>
                    </td>
                  </tr>
                ) : (
                  data.map((item, index) => {
                    const freezer = item.freezer_name || 'N/A';
                    const region = item.region || 'N/A';
                    const city = item.city || 'N/A';
                    const shop = item.shop_name || 'N/A';
                    const temp = parseFloat(item.temperature || 0);
                    const updated = item.last_updated || 'N/A';
                    
                    const apiStatus = item.status || 'Normal';
                    const { label, style, dot, textColor } = getStatusStyle(apiStatus);
                    
                    return (
                      <tr 
                        key={item.sensor_id || index} 
                        className={`border-b border-gray-200 hover:bg-gray-100 transition-colors ${
                          index === data.length - 1 ? 'border-b-0' : ''
                        }`}
                      >
                        <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-[11px] sm:text-sm text-gray-600">{index + 1}</td>
                        <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-[11px] sm:text-sm font-medium text-black">{freezer}</td>
                        <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-[11px] sm:text-sm text-black">{region}</td>
                        <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-[11px] sm:text-sm text-black">{city}</td>
                        <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-[11px] sm:text-sm text-black">{shop}</td>
                        <td className={`px-2 sm:px-3 py-1.5 sm:py-2 text-[11px] sm:text-sm font-semibold ${textColor}`}>
                          {temp}°C
                        </td>
                        <td className="px-2 sm:px-3 py-1.5 sm:py-2">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 text-xs font-medium rounded-full ${style}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${dot}`}></span>
                            {label}
                          </span>
                        </td>
                        <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-[11px] sm:text-sm text-gray-500">{formatTime(updated)}</td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default LiveReportPage;