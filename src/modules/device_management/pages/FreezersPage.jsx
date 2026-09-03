import React, { useState, useEffect } from 'react';
import DeviceManagementLayout from '../layout/DeviceManagementLayout';
import { FiSearch, FiEdit2, FiX, FiLoader } from 'react-icons/fi';
import { getFreezers, updateSensorFreezerName } from '../../../services/api/api';

const FreezersPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [freezers, setFreezers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editingName, setEditingName] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isNameFocused, setIsNameFocused] = useState(false);

  // ============================================
  // FETCH DATA ON MOUNT
  // ============================================
  
  useEffect(() => {
    fetchFreezers();
  }, []);

  // ============================================
  // API CALLS
  // ============================================

  // GET /dashboard/freezers - ALL freezers
  const fetchFreezers = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await getFreezers();
      console.log('All Freezers response:', response);
      
      let freezerData = response.data || response;
      
      if (Array.isArray(freezerData)) {
        const formattedFreezers = freezerData.map(item => ({
          id: item.sensor_rom || item.id,
          name: item.freezer_name || item.name || item.sensor_rom,
          sensor_rom: item.sensor_rom,
          sensor_name: item.sensor_name || '-',
          shop_name: item.shop_name || '-',
          city: item.city || '-',
          region: item.region || '-',
          temperature: item.temperature || '-'
        }));
        setFreezers(formattedFreezers);
        console.log('Total freezers:', formattedFreezers.length);
      } else {
        setFreezers([]);
      }
    } catch (err) {
      console.error('Error fetching freezers:', err);
      setError('Failed to fetch freezers');
    } finally {
      setLoading(false);
    }
  };

  // ============================================
  // UPDATE FREEZER NAME
  // ============================================

  const handleUpdateFreezer = async () => {
    if (!editingName.trim()) {
      setError('Freezer name is required');
      return;
    }
    
    setIsSaving(true);
    setError('');
    
    try {
      const response = await updateSensorFreezerName(editingId, editingName.trim());
      console.log('✅ Freezer updated successfully:', response);
      
      await fetchFreezers();
      
      setEditingId(null);
      setEditingName('');
      setError('');
      setIsModalOpen(false);
      
    } catch (err) {
      console.error('❌ Error updating freezer:', err);
      setError(err.message || 'Failed to update freezer');
    } finally {
      setIsSaving(false);
    }
  };

  // Open Edit Modal
  const handleEdit = (freezer) => {
    setEditingId(freezer.id);
    setEditingName(freezer.name);
    setError('');
    setIsModalOpen(true);
  };

  const handleCancel = () => {
    setEditingId(null);
    setEditingName('');
    setError('');
    setIsModalOpen(false);
    setIsNameFocused(false);
    setIsSaving(false);
  };

  // ============================================
  // FILTER FREEZERS
  // ============================================

  const filteredFreezers = freezers.filter(freezer =>
    freezer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    freezer.sensor_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    freezer.shop_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    freezer.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
    freezer.region.toLowerCase().includes(searchTerm.toLowerCase()) ||
    freezer.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
            placeholder="Search freezers..."
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
          <table className="w-full min-w-[800px] sm:min-w-full">
            <thead className="sticky top-0 z-10">
              <tr className="bg-gradient-to-b from-[#0b1a30] to-[#1a3a6b] border-b border-gray-600">
                <th className="px-2 sm:px-3 py-1.5 sm:py-2 text-left text-[10px] sm:text-xs font-normal text-white uppercase tracking-wider" style={{ fontFamily: 'Jura, sans-serif' }}>SR</th>
                <th className="px-2 sm:px-3 py-1.5 sm:py-2 text-left text-[10px] sm:text-xs font-normal text-white uppercase tracking-wider" style={{ fontFamily: 'Jura, sans-serif' }}>Freezer Name</th>
                <th className="px-2 sm:px-3 py-1.5 sm:py-2 text-left text-[10px] sm:text-xs font-normal text-white uppercase tracking-wider" style={{ fontFamily: 'Jura, sans-serif' }}>Sensor Name</th>
                <th className="px-2 sm:px-3 py-1.5 sm:py-2 text-left text-[10px] sm:text-xs font-normal text-white uppercase tracking-wider" style={{ fontFamily: 'Jura, sans-serif' }}>Sensor ROM</th>
                <th className="px-2 sm:px-3 py-1.5 sm:py-2 text-left text-[10px] sm:text-xs font-normal text-white uppercase tracking-wider" style={{ fontFamily: 'Jura, sans-serif' }}>Shop</th>
                <th className="px-2 sm:px-3 py-1.5 sm:py-2 text-left text-[10px] sm:text-xs font-normal text-white uppercase tracking-wider" style={{ fontFamily: 'Jura, sans-serif' }}>City</th>
                <th className="px-2 sm:px-3 py-1.5 sm:py-2 text-left text-[10px] sm:text-xs font-normal text-white uppercase tracking-wider" style={{ fontFamily: 'Jura, sans-serif' }}>Region</th>
                <th className="px-2 sm:px-3 py-1.5 sm:py-2 text-left text-[10px] sm:text-xs font-normal text-white uppercase tracking-wider" style={{ fontFamily: 'Jura, sans-serif' }}>Temp</th>
                <th className="px-2 sm:px-3 py-1.5 sm:py-2 text-right text-[10px] sm:text-xs font-normal text-white uppercase tracking-wider" style={{ fontFamily: 'Jura, sans-serif' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="9" className="text-center py-8">
                    <div className="flex items-center justify-center gap-2">
                      <FiLoader className="animate-spin text-blue-600" size={20} />
                      <span className="text-gray-500 text-xs sm:text-sm">Loading freezers...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredFreezers.length === 0 ? (
                <tr>
                  <td colSpan="9" className="text-center py-8 text-gray-500 text-xs sm:text-sm">
                    {searchTerm ? 'No freezers found matching your search' : 'No freezers found'}
                  </td>
                </tr>
              ) : (
                filteredFreezers.map((freezer, index) => (
                  <tr 
                    key={freezer.id} 
                    className={`border-b border-gray-200 hover:bg-gray-100 transition-colors ${
                      index === filteredFreezers.length - 1 ? 'border-b-0' : ''
                    } animate-fade-in-up`}
                    style={{ animationDelay: `${0.15 + index * 0.05}s` }}
                  >
                    <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-[11px] sm:text-sm text-gray-600">{index + 1}</td>
                    <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-[11px] sm:text-sm font-medium text-black">{freezer.name}</td>
                    <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-[11px] sm:text-sm text-black">{freezer.sensor_name}</td>
                    <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-[11px] sm:text-sm text-black font-mono">{freezer.id}</td>
                    <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-[11px] sm:text-sm text-black">{freezer.shop_name}</td>
                    <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-[11px] sm:text-sm text-black">{freezer.city}</td>
                    <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-[11px] sm:text-sm text-black">{freezer.region}</td>
                    <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-[11px] sm:text-sm text-black">{freezer.temperature}°C</td>
                    <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-right">
                      <div className="flex items-center justify-end gap-1 sm:gap-2">
                        <button 
                          onClick={() => handleEdit(freezer)}
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

      {/* Edit Modal - Only Freezer Name */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm p-4 animate-fade-in-up">
          <div className="bg-white border border-gray-400 shadow-lg w-full max-w-[90%] sm:max-w-md mx-auto p-4 sm:p-6 animate-fade-in-up">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm sm:text-md text-black" style={{ fontFamily: 'Poppins, sans-serif' }}>
                Update Freezer Name
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
                Freezer Name <span className="text-red-600">*</span>
              </label>
              <input
                type="text"
                value={editingName}
                onChange={(e) => {
                  setEditingName(e.target.value);
                  if (error) setError('');
                }}
                onFocus={() => setIsNameFocused(true)}
                onBlur={() => setIsNameFocused(false)}
                placeholder="Enter freezer name..."
                className={`w-full px-3 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm border focus:outline-none transition-all bg-white ${
                  error && !editingName.trim()
                    ? 'border-red-500' 
                    : !editingName.trim() && isNameFocused
                      ? 'border-red-500'
                      : editingName.trim() 
                        ? 'border-green-500' 
                        : 'border-red-400'
                }`}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleUpdateFreezer();
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
                onClick={handleUpdateFreezer}
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
                  'Update'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </DeviceManagementLayout>
  );
};

export default FreezersPage;