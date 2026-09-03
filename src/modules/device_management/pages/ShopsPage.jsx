import React, { useState, useEffect } from 'react';
import DeviceManagementLayout from '../layout/DeviceManagementLayout';
import { FiSearch, FiEdit2, FiX, FiChevronDown, FiLoader } from 'react-icons/fi';
import { getShops, getRegions, getCitiesByRegionId, updateShop } from '../../../services/api/api';

const ShopsPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [shops, setShops] = useState([]);
  const [regions, setRegions] = useState([]);
  const [cities, setCities] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editingShopName, setEditingShopName] = useState('');
  const [selectedRegionId, setSelectedRegionId] = useState('');
  const [selectedRegionName, setSelectedRegionName] = useState('');
  const [selectedCityId, setSelectedCityId] = useState('');
  const [selectedCityName, setSelectedCityName] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isRegionDropdownOpen, setIsRegionDropdownOpen] = useState(false);
  const [isCityDropdownOpen, setIsCityDropdownOpen] = useState(false);

  // ============================================
  // FETCH DATA ON MOUNT
  // ============================================
  
  useEffect(() => {
    fetchRegions();
    fetchShops();
  }, []);

  // Fetch cities when region changes in modal
  useEffect(() => {
    if (selectedRegionId) {
      fetchCitiesByRegion(selectedRegionId);
      setSelectedCityId('');
      setSelectedCityName('');
    } else {
      setCities([]);
    }
  }, [selectedRegionId]);

  // ============================================
  // API CALLS
  // ============================================

  // GET /locations/regions
  const fetchRegions = async () => {
    try {
      const response = await getRegions();
      console.log('Regions response:', response);
      let regionData = response.data || response;
      
      if (Array.isArray(regionData)) {
        const regionList = regionData.map(item => ({
          id: item.region_id || item.id,
          name: item.region_name || item.name
        }));
        setRegions(regionList);
      } else {
        setRegions([]);
      }
    } catch (err) {
      console.error('Error fetching regions:', err);
    }
  };

  // GET /locations/cities?region_id={regionId}
  const fetchCitiesByRegion = async (regionId) => {
    try {
      const response = await getCitiesByRegionId(regionId);
      console.log('Cities response:', response);
      let cityData = response.data || response;
      
      if (Array.isArray(cityData)) {
        const cityList = cityData.map(item => ({
          id: item.city_id || item.id,
          name: item.city_name || item.name
        }));
        setCities(cityList);
      } else {
        setCities([]);
      }
    } catch (err) {
      console.error('Error fetching cities:', err);
      setCities([]);
    }
  };

  // GET /locations/shops
  const fetchShops = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await getShops();
      console.log('Shops response:', response);
      let shopData = response.data || response;
      
      if (Array.isArray(shopData)) {
        const formattedShops = shopData.map(item => ({
          id: item.shop_id || item.id,
          name: item.shop_name || item.name,
          region: item.region_name || item.region,
          city: item.city_name || item.city,
          region_id: item.region_id,
          city_id: item.city_id
        }));
        setShops(formattedShops);
      } else {
        setShops([]);
      }
    } catch (err) {
      console.error('Error fetching shops:', err);
      setError('Failed to fetch shops');
    } finally {
      setLoading(false);
    }
  };

  // ============================================
  // UPDATE SHOP - PUT /locations/shops/{id}/city
  // ============================================

  const handleUpdateShop = async () => {
    if (!selectedCityId) {
      setError('Please select a city');
      return;
    }
    
    setIsSaving(true);
    setError('');
    
    try {
      await updateShop(editingId, { city_id: parseInt(selectedCityId) });
      
      await fetchShops();
      
      setEditingId(null);
      setEditingShopName('');
      setSelectedRegionId('');
      setSelectedRegionName('');
      setSelectedCityId('');
      setSelectedCityName('');
      setError('');
      setIsModalOpen(false);
      setIsRegionDropdownOpen(false);
      setIsCityDropdownOpen(false);
    } catch (err) {
      console.error('Error updating shop:', err);
      setError(err.message || 'Failed to update shop');
    } finally {
      setIsSaving(false);
    }
  };

  // Open Edit Modal
  const handleEdit = (shop) => {
    setEditingId(shop.id);
    setEditingShopName(shop.name);
    setSelectedRegionId(shop.region_id || '');
    setSelectedRegionName(shop.region || '');
    setSelectedCityId(shop.city_id || '');
    setSelectedCityName(shop.city || '');
    setError('');
    setIsModalOpen(true);
    if (shop.region_id) {
      fetchCitiesByRegion(shop.region_id);
    }
  };

  const handleCancel = () => {
    setEditingId(null);
    setEditingShopName('');
    setSelectedRegionId('');
    setSelectedRegionName('');
    setSelectedCityId('');
    setSelectedCityName('');
    setError('');
    setIsModalOpen(false);
    setIsRegionDropdownOpen(false);
    setIsCityDropdownOpen(false);
    setIsSaving(false);
  };

  // ============================================
  // FILTER SHOPS
  // ============================================

  const filteredShops = shops.filter(shop =>
    shop.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    shop.region.toLowerCase().includes(searchTerm.toLowerCase()) ||
    shop.city.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // ============================================
  // HANDLERS
  // ============================================

  const toggleRegionDropdown = () => {
    setIsRegionDropdownOpen(!isRegionDropdownOpen);
    setIsCityDropdownOpen(false);
  };

  const toggleCityDropdown = () => {
    if (!selectedRegionId) {
      setError('Please select a region first');
      return;
    }
    setIsCityDropdownOpen(!isCityDropdownOpen);
  };

  const selectRegion = (region) => {
    setSelectedRegionId(region.id);
    setSelectedRegionName(region.name);
    setSelectedCityId('');
    setSelectedCityName('');
    setIsRegionDropdownOpen(false);
    if (error) setError('');
  };

  const selectCity = (city) => {
    setSelectedCityId(city.id);
    setSelectedCityName(city.name);
    setIsCityDropdownOpen(false);
    if (error) setError('');
  };

  // ============================================
  // RENDER
  // ============================================

  return (
    <DeviceManagementLayout>
      {/* Search */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4 mb-3 sm:mb-4 animate-fade-in-down">
        <div className="relative w-full sm:w-64 md:w-72">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
          <input
            type="text"
            placeholder="Search shops..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-3 py-1.5 sm:py-2 text-xs sm:text-sm border border-gray-300 rounded-full focus:outline-none focus:ring-1 focus:ring-gray-400 focus:border-transparent transition-all bg-white"
          />
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-3 p-2 sm:p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-[10px] sm:text-xs text-red-600">{error}</p>
        </div>
      )}

      {/* Table Container */}
      <div className="bg-white shadow-lg border border-gray-300 overflow-hidden rounded-lg animate-fade-in-up delay-100">
        <div className="overflow-x-auto" style={{ maxHeight: '400px', overflowY: 'auto' }}>
          <table className="w-full min-w-[500px] sm:min-w-full">
            <thead className="sticky top-0 z-10">
              <tr className="bg-gradient-to-b from-[#0b1a30] to-[#1a3a6b] border-b border-gray-600">
                <th className="px-2 sm:px-3 py-1.5 sm:py-2 text-left text-[10px] sm:text-xs font-normal text-white uppercase tracking-wider" style={{ fontFamily: 'Jura, sans-serif' }}>SR</th>
                <th className="px-2 sm:px-3 py-1.5 sm:py-2 text-left text-[10px] sm:text-xs font-normal text-white uppercase tracking-wider" style={{ fontFamily: 'Jura, sans-serif' }}>Shop Name</th>
                <th className="px-2 sm:px-3 py-1.5 sm:py-2 text-left text-[10px] sm:text-xs font-normal text-white uppercase tracking-wider" style={{ fontFamily: 'Jura, sans-serif' }}>Region</th>
                <th className="px-2 sm:px-3 py-1.5 sm:py-2 text-left text-[10px] sm:text-xs font-normal text-white uppercase tracking-wider" style={{ fontFamily: 'Jura, sans-serif' }}>City</th>
                <th className="px-2 sm:px-3 py-1.5 sm:py-2 text-right text-[10px] sm:text-xs font-normal text-white uppercase tracking-wider" style={{ fontFamily: 'Jura, sans-serif' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="5" className="text-center py-8">
                    <div className="flex items-center justify-center gap-2">
                      <FiLoader className="animate-spin text-blue-600" size={20} />
                      <span className="text-gray-500 text-xs sm:text-sm">Loading shops...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredShops.length === 0 ? (
                <tr>
                  <td colSpan="5" className="text-center py-8 text-gray-500 text-xs sm:text-sm">
                    {searchTerm ? 'No shops found matching your search' : 'No shops found'}
                  </td>
                </tr>
              ) : (
                filteredShops.map((shop, index) => (
                  <tr 
                    key={shop.id} 
                    className={`border-b border-gray-200 hover:bg-gray-100 transition-colors ${
                      index === filteredShops.length - 1 ? 'border-b-0' : ''
                    } animate-fade-in-up`}
                    style={{ animationDelay: `${0.15 + index * 0.05}s` }}
                  >
                    <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-[11px] sm:text-sm text-gray-600">{index + 1}</td>
                    <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-[11px] sm:text-sm font-medium text-black">{shop.name}</td>
                    <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-[11px] sm:text-sm text-black">{shop.region}</td>
                    <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-[11px] sm:text-sm text-black">{shop.city}</td>
                    <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-right">
                      <div className="flex items-center justify-end gap-1 sm:gap-2">
                        <button 
                          onClick={() => handleEdit(shop)}
                          className="p-1 sm:p-1.5 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
                          disabled={loading}
                        >
                          <FiEdit2 size={14} className="sm:w-4 sm:h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Modal - Update City */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm p-4 animate-fade-in-up">
          <div className="bg-white border border-gray-400 shadow-lg w-full max-w-[90%] sm:max-w-md mx-auto p-4 sm:p-6 animate-fade-in-up">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm sm:text-md text-black" style={{ fontFamily: 'Poppins, sans-serif' }}>
                Update Shop: {editingShopName}
              </h3>
              <button
                onClick={handleCancel}
                className="text-gray-400 hover:text-gray-600 transition-colors"
                disabled={isSaving}
              >
                <FiX size={20} />
              </button>
            </div>
            <div className="mb-4 sm:mb-6">
              {/* Region Dropdown - Read Only */}
              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-1.5" style={{ fontFamily: 'Poppins, sans-serif' }}>
                Region <span className="text-red-600">*</span>
              </label>
              <div className="relative">
                <div
                  onClick={toggleRegionDropdown}
                  className={`w-full px-3 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm border cursor-pointer flex items-center justify-between bg-white ${
                    selectedRegionId ? 'border-green-500' : 'border-gray-400'
                  }`}
                >
                  <span className={selectedRegionId ? 'text-black' : 'text-gray-400'}>
                    {selectedRegionName || 'Select a region'}
                  </span>
                  <FiChevronDown className={`transition-transform duration-200 ${isRegionDropdownOpen ? 'rotate-180' : ''}`} />
                </div>
                
                {isRegionDropdownOpen && (
                  <div className="absolute z-20 w-full mt-1 bg-white border border-gray-300 shadow-lg max-h-[120px] overflow-y-auto">
                    {regions.map((region) => (
                      <div
                        key={region.id}
                        onClick={() => selectRegion(region)}
                        className={`px-3 sm:px-4 py-2 text-xs sm:text-sm cursor-pointer hover:bg-gray-100 transition-colors ${
                          selectedRegionId === region.id ? 'bg-blue-50 text-blue-600' : 'text-gray-700'
                        }`}
                      >
                        {region.name}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* City Dropdown */}
              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-1.5 mt-3 sm:mt-4" style={{ fontFamily: 'Poppins, sans-serif' }}>
                City <span className="text-red-600">*</span>
              </label>
              <div className="relative">
                <div
                  onClick={toggleCityDropdown}
                  className={`w-full px-3 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm border cursor-pointer flex items-center justify-between bg-white ${
                    error && !selectedCityId
                      ? 'border-red-500' 
                      : selectedCityId 
                        ? 'border-green-500' 
                        : 'border-gray-400'
                  } ${!selectedRegionId ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <span className={selectedCityId ? 'text-black' : 'text-gray-400'}>
                    {selectedCityName || (selectedRegionId ? 'Select a city' : 'Select region first')}
                  </span>
                  <FiChevronDown className={`transition-transform duration-200 ${isCityDropdownOpen ? 'rotate-180' : ''}`} />
                </div>
                
                {isCityDropdownOpen && selectedRegionId && (
                  <div className="absolute z-20 w-full mt-1 bg-white border border-gray-300 shadow-lg max-h-[120px] overflow-y-auto">
                    {cities.map((city) => (
                      <div
                        key={city.id}
                        onClick={() => selectCity(city)}
                        className={`px-3 sm:px-4 py-2 text-xs sm:text-sm cursor-pointer hover:bg-gray-100 transition-colors ${
                          selectedCityId === city.id ? 'bg-blue-50 text-blue-600' : 'text-gray-700'
                        }`}
                      >
                        {city.name}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Shop Name - Read Only */}
              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-1.5 mt-3 sm:mt-4" style={{ fontFamily: 'Poppins, sans-serif' }}>
                Shop Name
              </label>
              <div className="w-full px-3 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm border border-gray-300 bg-gray-100 text-black">
                {editingShopName}
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 sm:gap-3">
              <button
                onClick={handleCancel}
                className="px-3 sm:px-5 py-1.5 sm:py-2 text-xs sm:text-sm font-medium text-red-600 border border-red-500 hover:bg-red-50 transition-colors"
                style={{ fontFamily: 'Jura, sans-serif' }}
                disabled={isSaving}
              >
                Cancel
              </button>
              <button
                onClick={handleUpdateShop}
                className="px-3 sm:px-5 py-1.5 sm:py-2 text-xs sm:text-sm font-medium text-white bg-blue-600 border border-blue-600 hover:bg-blue-700 transition-colors flex items-center gap-2"
                style={{ fontFamily: 'Jura, sans-serif' }}
                disabled={isSaving}
              >
                {isSaving ? (
                  <>
                    <FiLoader className="animate-spin" size={14} />
                    Updating...
                  </>
                ) : (
                  'Update City'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </DeviceManagementLayout>
  );
};

export default ShopsPage;