import React, { useState, useEffect } from 'react';
import DeviceManagementLayout from '../layout/DeviceManagementLayout';
import { FiSearch, FiPlus, FiEdit2, FiTrash2, FiX, FiChevronDown, FiLoader } from 'react-icons/fi';
import { getCities, createCity, updateCity, deleteCity, getRegions, getShops } from '../../../services/api/api';

const CitiesPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [cities, setCities] = useState([]);
  const [regions, setRegions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingCounts, setLoadingCounts] = useState(false);
  const [error, setError] = useState('');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newCityName, setNewCityName] = useState('');
  const [selectedRegionId, setSelectedRegionId] = useState('');
  const [selectedRegionName, setSelectedRegionName] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // ============================================
  // FETCH DATA ON MOUNT
  // ============================================
  
  useEffect(() => {
    fetchRegions();
    fetchCities();
  }, []);

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

  // GET /locations/cities
  const fetchCities = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await getCities();
      console.log('Cities response:', response);
      let cityData = response.data || response;
      
      if (Array.isArray(cityData)) {
        const formattedCities = cityData.map(item => ({
          id: item.city_id || item.id,
          name: item.city_name || item.name,
          region_id: item.region_id,
          region_name: item.region_name,
          shops: 0
        }));
        setCities(formattedCities);
        
        // Fetch shop counts in background
        await updateCityShopCounts(formattedCities);
      } else {
        setCities([]);
      }
    } catch (err) {
      console.error('Error fetching cities:', err);
      setError('Failed to fetch cities');
    } finally {
      setLoading(false);
    }
  };

  // Update shop counts for each city
  const updateCityShopCounts = async (citiesList) => {
    setLoadingCounts(true);
    try {
      // Fetch all shops once
      const shopsRes = await getShops();
      const shopsData = shopsRes.data || shopsRes;
      
      console.log('All shops:', shopsData);
      
      const updatedCities = citiesList.map((city) => {
        let shopCount = 0;
        if (Array.isArray(shopsData)) {
          shopCount = shopsData.filter(shop => {
            // Check if shop belongs to this city
            return (shop.city_id && shop.city_id === parseInt(city.id)) ||
                   (shop.city_name && shop.city_name === city.name);
          }).length;
        }
        
        return { 
          ...city, 
          shops: shopCount 
        };
      });
      
      setCities(updatedCities);
    } catch (err) {
      console.error('Error updating city shop counts:', err);
    } finally {
      setLoadingCounts(false);
    }
  };

  // POST /locations/cities | PUT /locations/cities/:id
  const handleAddCity = async () => {
    if (!selectedRegionId) {
      setError('Please select a region');
      return;
    }
    if (!newCityName.trim()) {
      setError('City name is required');
      return;
    }
    
    setIsSaving(true);
    setError('');
    
    try {
      if (editingId) {
        await updateCity(editingId, { 
          name: newCityName.trim(),
          region_id: parseInt(selectedRegionId)
        });
      } else {
        await createCity({ 
          name: newCityName.trim(),
          region_id: parseInt(selectedRegionId)
        });
      }
      
      await fetchCities();
      
      setNewCityName('');
      setSelectedRegionId('');
      setSelectedRegionName('');
      setError('');
      setEditingId(null);
      setIsModalOpen(false);
      setIsDropdownOpen(false);
    } catch (err) {
      console.error('Error saving city:', err);
      setError(err.message || 'Failed to save city');
    } finally {
      setIsSaving(false);
    }
  };

  // PUT /locations/cities/:id
  const handleEdit = (city) => {
    setEditingId(city.id);
    setNewCityName(city.name);
    setSelectedRegionId(city.region_id);
    setSelectedRegionName(city.region_name);
    setError('');
    setIsModalOpen(true);
  };

  // DELETE /locations/cities/:id
  const handleDeleteClick = (id) => {
    setDeleteId(id);
    setIsDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    setIsDeleting(true);
    setError('');
    
    try {
      await deleteCity(deleteId);  // ✅ Changed from deleteLocation to deleteCity
      await fetchCities();
      setIsDeleteModalOpen(false);
      setDeleteId(null);
    } catch (err) {
      console.error('Error deleting city:', err);
      setError(err.message || 'Failed to delete city');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDeleteCancel = () => {
    setIsDeleteModalOpen(false);
    setDeleteId(null);
    setIsDeleting(false);
  };

  const handleCancel = () => {
    setNewCityName('');
    setSelectedRegionId('');
    setSelectedRegionName('');
    setError('');
    setEditingId(null);
    setIsModalOpen(false);
    setIsDropdownOpen(false);
    setIsSaving(false);
  };

  // ============================================
  // FILTER CITIES
  // ============================================

  const filteredCities = cities.filter(city =>
    city.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (city.region_name && city.region_name.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // ============================================
  // HANDLERS
  // ============================================

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  const selectRegion = (region) => {
    setSelectedRegionId(region.id);
    setSelectedRegionName(region.name);
    setIsDropdownOpen(false);
    if (error) setError('');
  };

  // ============================================
  // RENDER
  // ============================================

  return (
    <DeviceManagementLayout>
      {/* Search and Add Button */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4 mb-3 sm:mb-4 animate-fade-in-down">
        <div className="relative w-full sm:w-64 md:w-72">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
          <input
            type="text"
            placeholder="Search cities..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-3 py-1.5 sm:py-2 text-xs sm:text-sm border border-gray-300 rounded-full focus:outline-none focus:ring-1 focus:ring-gray-400 focus:border-transparent transition-all bg-white"
          />
        </div>
        <button 
          onClick={() => {
            setEditingId(null);
            setNewCityName('');
            setSelectedRegionId('');
            setSelectedRegionName('');
            setError('');
            setIsModalOpen(true);
          }}
          className="flex items-center gap-1 px-3 sm:px-4 py-1.5 sm:py-2 bg-gradient-to-b from-[#0b1a30] to-[#1a3a6b] text-white text-[10px] sm:text-xs rounded-full shadow-lg hover:opacity-90 transition-opacity w-full sm:w-auto justify-center sm:justify-start" 
          style={{ fontFamily: 'Poppins, sans-serif' }}
          disabled={loading}
        >
          <FiPlus size={12} />
          Add City
        </button>
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
                <th className="px-2 sm:px-3 py-1.5 sm:py-2 text-left text-[10px] sm:text-xs font-normal text-white uppercase tracking-wider" style={{ fontFamily: 'Jura, sans-serif' }}>City Name</th>
                <th className="px-2 sm:px-3 py-1.5 sm:py-2 text-left text-[10px] sm:text-xs font-normal text-white uppercase tracking-wider" style={{ fontFamily: 'Jura, sans-serif' }}>Region</th>
                <th className="px-2 sm:px-3 py-1.5 sm:py-2 text-left text-[10px] sm:text-xs font-normal text-white uppercase tracking-wider" style={{ fontFamily: 'Jura, sans-serif' }}>Shops</th>
                <th className="px-2 sm:px-3 py-1.5 sm:py-2 text-right text-[10px] sm:text-xs font-normal text-white uppercase tracking-wider" style={{ fontFamily: 'Jura, sans-serif' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="5" className="text-center py-8">
                    <div className="flex items-center justify-center gap-2">
                      <FiLoader className="animate-spin text-blue-600" size={20} />
                      <span className="text-gray-500 text-xs sm:text-sm">Loading cities...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredCities.length === 0 ? (
                <tr>
                  <td colSpan="5" className="text-center py-8 text-gray-500 text-xs sm:text-sm">
                    {searchTerm ? 'No cities found matching your search' : 'No cities found'}
                  </td>
                </tr>
              ) : (
                filteredCities.map((city, index) => (
                  <tr 
                    key={city.id} 
                    className={`border-b border-gray-200 hover:bg-gray-100 transition-colors ${
                      index === filteredCities.length - 1 ? 'border-b-0' : ''
                    } animate-fade-in-up`}
                    style={{ animationDelay: `${0.15 + index * 0.05}s` }}
                  >
                    <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-[11px] sm:text-sm text-gray-600">{index + 1}</td>
                    <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-[11px] sm:text-sm font-medium text-black">{city.name}</td>
                    <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-[11px] sm:text-sm text-black">{city.region_name || '-'}</td>
                    <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-[11px] sm:text-sm text-black">
                      {loadingCounts ? (
                        <FiLoader className="animate-spin text-gray-400 inline" size={12} />
                      ) : (
                        city.shops || 0
                      )}
                    </td>
                    <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-right">
                      <div className="flex items-center justify-end gap-1 sm:gap-2">
                        <button 
                          onClick={() => handleEdit(city)}
                          className="p-1 sm:p-1.5 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
                          disabled={loading}
                        >
                          <FiEdit2 size={14} className="sm:w-4 sm:h-4" />
                        </button>
                        <button 
                          onClick={() => handleDeleteClick(city.id)}
                          className="p-1 sm:p-1.5 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                          disabled={loading}
                        >
                          <FiTrash2 size={14} className="sm:w-4 sm:h-4" />
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

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm p-4 animate-fade-in-up">
          <div className="bg-white border border-gray-400 shadow-lg w-full max-w-[90%] sm:max-w-md mx-auto p-4 sm:p-6 animate-fade-in-up">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm sm:text-md text-black" style={{ fontFamily: 'Poppins, sans-serif' }}>
                {editingId ? 'Update City' : 'Add New City'}
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
              {/* Region Dropdown */}
              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-1.5" style={{ fontFamily: 'Poppins, sans-serif' }}>
                Region <span className="text-red-600">*</span>
              </label>
              <div className="relative">
                <div
                  onClick={toggleDropdown}
                  className={`w-full px-3 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm border cursor-pointer flex items-center justify-between bg-white ${
                    error && !selectedRegionId
                      ? 'border-red-500' 
                      : selectedRegionId 
                        ? 'border-green-500' 
                        : 'border-gray-400'
                  }`}
                >
                  <span className={selectedRegionId ? 'text-black' : 'text-gray-400'}>
                    {selectedRegionName || 'Select a region'}
                  </span>
                  <FiChevronDown className={`transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`} />
                </div>
                
                {isDropdownOpen && (
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

              {/* City Name Input */}
              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-1.5 mt-3 sm:mt-4" style={{ fontFamily: 'Poppins, sans-serif' }}>
                City Name <span className="text-red-600">*</span>
              </label>
              <input
                type="text"
                value={newCityName}
                onChange={(e) => {
                  setNewCityName(e.target.value);
                  if (error) setError('');
                }}
                placeholder="Enter city name..."
                className={`w-full px-3 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm border focus:outline-none transition-all bg-white ${
                  error && !newCityName.trim()
                    ? 'border-red-500' 
                    : newCityName.trim() 
                      ? 'border-green-500' 
                      : 'border-red-400'
                }`}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleAddCity();
                  }
                  if (e.key === 'Escape') {
                    handleCancel();
                  }
                }}
                disabled={isSaving}
              />
              {error && (
                <p className="mt-1 text-[10px] sm:text-xs text-red-500">{error}</p>
              )}
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
                onClick={handleAddCity}
                className="px-3 sm:px-5 py-1.5 sm:py-2 text-xs sm:text-sm font-medium text-white bg-green-600 border border-green-600 hover:bg-green-700 transition-colors flex items-center gap-2"
                style={{ fontFamily: 'Jura, sans-serif' }}
                disabled={isSaving}
              >
                {isSaving ? (
                  <>
                    <FiLoader className="animate-spin" size={14} />
                    {editingId ? 'Updating...' : 'Saving...'}
                  </>
                ) : (
                  editingId ? 'Update' : 'Save'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm p-4 animate-fade-in-up">
          <div className="bg-white border border-gray-400 shadow-lg w-full max-w-[90%] sm:max-w-md mx-auto p-4 sm:p-6 animate-fade-in-up">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm sm:text-md text-black" style={{ fontFamily: 'Poppins, sans-serif' }}>
                Delete City
              </h3>
              <button
                onClick={handleDeleteCancel}
                className="text-gray-400 hover:text-gray-600 transition-colors"
                disabled={isDeleting}
              >
                <FiX size={20} />
              </button>
            </div>
            <div className="mb-4 sm:mb-6">
              <p className="text-xs sm:text-sm text-gray-700" style={{ fontFamily: 'Poppins, sans-serif' }}>
                Are you sure you want to delete this city?
              </p>
              {error && (
                <p className="mt-2 text-[10px] sm:text-xs text-red-500">{error}</p>
              )}
            </div>

            <div className="flex items-center justify-end gap-2 sm:gap-3">
              <button
                onClick={handleDeleteCancel}
                className="px-3 sm:px-5 py-1.5 sm:py-2 text-xs sm:text-sm font-medium text-red-600 border border-red-500 hover:bg-red-50 transition-colors"
                style={{ fontFamily: 'Jura, sans-serif' }}
                disabled={isDeleting}
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
                className="px-3 sm:px-5 py-1.5 sm:py-2 text-xs sm:text-sm font-medium text-white bg-red-600 border border-red-600 hover:bg-red-700 transition-colors flex items-center gap-2"
                style={{ fontFamily: 'Jura, sans-serif' }}
                disabled={isDeleting}
              >
                {isDeleting ? (
                  <>
                    <FiLoader className="animate-spin" size={14} />
                    Deleting...
                  </>
                ) : (
                  'Delete'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </DeviceManagementLayout>
  );
};

export default CitiesPage;