import React, { useState, useEffect } from 'react';
import DeviceManagementLayout from '../layout/DeviceManagementLayout';
import { FiSearch, FiPlus, FiEdit2, FiTrash2, FiX, FiLoader } from 'react-icons/fi';
import { getRegions, createRegion, updateRegion, deleteRegion, getCities, getShops } from '../../../services/api/api';

const RegionsPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [regions, setRegions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingCounts, setLoadingCounts] = useState(false);
  const [error, setError] = useState('');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newRegionName, setNewRegionName] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // ============================================
  // FETCH REGIONS ON MOUNT
  // ============================================
  
  useEffect(() => {
    fetchRegions();
  }, []);

  // ============================================
  // API CALLS
  // ============================================

  // GET /locations/regions + counts from cities and shops APIs
  const fetchRegions = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await getRegions();
      console.log('Regions response:', response);
      
      let regionData = response.data || response;
      
      if (Array.isArray(regionData)) {
        const formattedRegions = regionData.map(item => ({
          id: item.region_id || item.id,
          name: item.region_name || item.name,
          cities: 0,
          shops: 0
        }));
        
        setRegions(formattedRegions);
        
        await updateRegionCounts(formattedRegions);
      } else {
        setRegions([]);
      }
    } catch (err) {
      console.error('Error fetching regions:', err);
      setError('Failed to fetch regions');
    } finally {
      setLoading(false);
    }
  };

  // Update counts for each region
  const updateRegionCounts = async (regionsList) => {
    setLoadingCounts(true);
    try {
      const [citiesRes, shopsRes] = await Promise.all([
        getCities(),
        getShops()
      ]);
      
      const citiesData = citiesRes.data || citiesRes;
      const shopsData = shopsRes.data || shopsRes;
      
      console.log('All cities:', citiesData);
      console.log('All shops:', shopsData);
      
      const updatedRegions = regionsList.map((region) => {
        let cityCount = 0;
        if (Array.isArray(citiesData)) {
          cityCount = citiesData.filter(city => {
            return (city.region_name && city.region_name === region.name) ||
                   (city.region_id && city.region_id === parseInt(region.id));
          }).length;
        }
        
        let shopCount = 0;
        if (Array.isArray(shopsData)) {
          shopCount = shopsData.filter(shop => {
            return (shop.region_name && shop.region_name === region.name) ||
                   (shop.region_id && shop.region_id === parseInt(region.id));
          }).length;
        }
        
        return { 
          ...region, 
          cities: cityCount, 
          shops: shopCount 
        };
      });
      
      setRegions(updatedRegions);
    } catch (err) {
      console.error('Error updating region counts:', err);
    } finally {
      setLoadingCounts(false);
    }
  };

  // POST /locations/regions | PUT /locations/regions/:id
  const handleAddRegion = async () => {
    if (!newRegionName.trim()) {
      setError('Region name is required');
      return;
    }
    
    setIsSaving(true);
    setError('');
    
    try {
      if (editingId) {
        await updateRegion(editingId, { name: newRegionName.trim() });
      } else {
        await createRegion({ name: newRegionName.trim() });
      }
      
      await fetchRegions();
      
      setNewRegionName('');
      setError('');
      setEditingId(null);
      setIsModalOpen(false);
    } catch (err) {
      console.error('Error saving region:', err);
      setError(err.message || 'Failed to save region');
    } finally {
      setIsSaving(false);
    }
  };

  // PUT /locations/regions/:id
  const handleEdit = (region) => {
    setEditingId(region.id);
    setNewRegionName(region.name);
    setError('');
    setIsModalOpen(true);
  };

  const handleDeleteClick = (id) => {
    setDeleteId(id);
    setIsDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    setIsDeleting(true);
    setError('');
    
    try {
      await deleteRegion(deleteId);
      await fetchRegions();
      setIsDeleteModalOpen(false);
      setDeleteId(null);
    } catch (err) {
      console.error('Error deleting region:', err);
      setError(err.message || 'Failed to delete region');
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
    setNewRegionName('');
    setError('');
    setEditingId(null);
    setIsModalOpen(false);
    setIsSaving(false);
  };

  // ============================================
  // FILTER REGIONS
  // ============================================

  const filteredRegions = regions.filter(region =>
    region.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
            placeholder="Search regions..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-3 py-1.5 sm:py-2 text-xs sm:text-sm border border-gray-300 rounded-full focus:outline-none focus:ring-1 focus:ring-gray-400 focus:border-transparent transition-all bg-white"
          />
        </div>
        <button 
          onClick={() => {
            setEditingId(null);
            setNewRegionName('');
            setError('');
            setIsModalOpen(true);
          }}
          className="flex items-center gap-1 px-3 sm:px-4 py-1.5 sm:py-2 bg-gradient-to-b from-[#0b1a30] to-[#1a3a6b] text-white text-[10px] sm:text-xs rounded-full shadow-lg hover:opacity-90 transition-opacity w-full sm:w-auto justify-center sm:justify-start" 
          style={{ fontFamily: 'Poppins, sans-serif' }}
          disabled={loading}
        >
          <FiPlus size={12} />
          Add Region
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
                <th className="px-2 sm:px-3 py-1.5 sm:py-2 text-left text-[10px] sm:text-xs font-normal text-white uppercase tracking-wider" style={{ fontFamily: 'Jura, sans-serif' }}>Region Name</th>
                <th className="px-2 sm:px-3 py-1.5 sm:py-2 text-left text-[10px] sm:text-xs font-normal text-white uppercase tracking-wider" style={{ fontFamily: 'Jura, sans-serif' }}>Cities</th>
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
                      <span className="text-gray-500 text-xs sm:text-sm">Loading regions...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredRegions.length === 0 ? (
                <tr>
                  <td colSpan="5" className="text-center py-8 text-gray-500 text-xs sm:text-sm">
                    {searchTerm ? 'No regions found matching your search' : 'No regions found'}
                  </td>
                </tr>
              ) : (
                filteredRegions.map((region, index) => (
                  <tr 
                    key={region.id} 
                    className={`border-b border-gray-200 hover:bg-gray-100 transition-colors ${
                      index === filteredRegions.length - 1 ? 'border-b-0' : ''
                    } animate-fade-in-up`}
                    style={{ animationDelay: `${0.15 + index * 0.05}s` }}
                  >
                    <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-[11px] sm:text-sm text-gray-600">{index + 1}</td>
                    <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-[11px] sm:text-sm font-medium text-black">{region.name}</td>
                    <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-[11px] sm:text-sm text-black">
                      {loadingCounts ? (
                        <FiLoader className="animate-spin text-gray-400 inline" size={12} />
                      ) : (
                        region.cities
                      )}
                    </td>
                    <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-[11px] sm:text-sm text-black">
                      {loadingCounts ? (
                        <FiLoader className="animate-spin text-gray-400 inline" size={12} />
                      ) : (
                        region.shops
                      )}
                    </td>
                    <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-right">
                      <div className="flex items-center justify-end gap-1 sm:gap-2">
                        <button 
                          onClick={() => handleEdit(region)}
                          className="p-1 sm:p-1.5 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
                          disabled={loading}
                        >
                          <FiEdit2 size={14} className="sm:w-4 sm:h-4" />
                        </button>
                        <button 
                          onClick={() => handleDeleteClick(region.id)}
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
                {editingId ? 'Update Region' : 'Add New Region'}
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
              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-1.5" style={{ fontFamily: 'Poppins, sans-serif' }}>
                Region Name <span className="text-red-600">*</span>
              </label>
              <input
                type="text"
                value={newRegionName}
                onChange={(e) => {
                  setNewRegionName(e.target.value);
                  if (error) setError('');
                }}
                placeholder="Enter region name..."
                className={`w-full px-3 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm border focus:outline-none transition-all bg-white ${
                  error 
                    ? 'border-red-500' 
                    : newRegionName.trim() 
                      ? 'border-green-500' 
                      : 'border-red-400'
                }`}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleAddRegion();
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
                onClick={handleAddRegion}
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
                Delete Region
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
                Are you sure you want to delete this region?
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

export default RegionsPage;