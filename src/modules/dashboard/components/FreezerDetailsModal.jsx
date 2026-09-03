import React, { useState, useEffect } from 'react';
import { getFreezers, getRegions } from '../../../services/api/api';
import { FiX, FiSearch, FiLoader } from 'react-icons/fi';

const FreezerDetailsModal = ({ isOpen, onClose, status, title, color }) => {
  const [freezers, setFreezers] = useState([]);
  const [filteredFreezers, setFilteredFreezers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRegion, setSelectedRegion] = useState('');
  const [regions, setRegions] = useState([]);

  // Get status badge class
  const getStatusBadgeClass = (status) => {
    const statusMap = {
      'normal': 'bg-green-100 text-green-700',
      'warning': 'bg-yellow-100 text-yellow-700',
      'high': 'bg-yellow-100 text-yellow-700',
      'critical': 'bg-red-100 text-red-700',
      'inactive': 'bg-gray-100 text-gray-700'
    };
    return statusMap[status?.toLowerCase()] || 'bg-gray-100 text-gray-700';
  };

  // Fetch freezers data
  const fetchFreezers = async () => {
    setLoading(true);
    try {
      const response = await getFreezers();
      console.log('Freezers response:', response);
      
      if (response.success && response.data) {
        setFreezers(response.data);
        setFilteredFreezers(response.data);
      }
    } catch (error) {
      console.error('Error fetching freezers:', error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch regions for dropdown
  const fetchRegions = async () => {
    try {
      const response = await getRegions();
      console.log('Regions response:', response);
      
      if (response.success && response.data) {
        setRegions(response.data);
      }
    } catch (error) {
      console.error('Error fetching regions:', error);
    }
  };

  // Filter freezers based on status, region, and search
  const filterFreezers = () => {
    let filtered = [...freezers];
    
    if (status) {
      filtered = filtered.filter(f => 
        f.status?.toLowerCase() === status.toLowerCase()
      );
    }
    
    if (selectedRegion) {
      filtered = filtered.filter(f => 
        f.region?.toLowerCase() === selectedRegion.toLowerCase()
      );
    }
    
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(f => 
        f.freezer_name?.toLowerCase().includes(term) ||
        f.shop_name?.toLowerCase().includes(term) ||
        f.city?.toLowerCase().includes(term)
      );
    }
    
    setFilteredFreezers(filtered);
  };

  useEffect(() => {
    if (isOpen) {
      fetchFreezers();
      fetchRegions();
    }
  }, [isOpen]);

  useEffect(() => {
    filterFreezers();
  }, [status, selectedRegion, searchTerm, freezers]);

  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    document.addEventListener('keydown', handleEsc);
    return () => document.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  const formatTemp = (temp) => {
    const num = parseFloat(temp);
    return isNaN(num) ? 'N/A' : `${num.toFixed(1)}°C`;
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9999] animate-fade-in"
        onClick={onClose}
      />
      
      {/* Modal - Fully Responsive */}
      <div className="fixed inset-0 flex items-center justify-center z-[9999] p-2 sm:p-3 md:p-4 animate-fade-in-up">
        <div className="bg-white rounded-xl shadow-2xl w-full max-h-[95vh] sm:max-h-[90vh] md:max-h-[85vh] overflow-hidden max-w-[95vw] sm:max-w-[90vw] md:max-w-5xl relative">
          
          {/* ✅ Close Button - Always Visible Top Right */}
          <button
            onClick={onClose}
            className="absolute top-3 right-3 z-20 p-1.5 hover:bg-gray-100 rounded-full transition-colors bg-white shadow-sm"
          >
            <FiX size={20} className="text-gray-500" />
          </button>
          
          {/* Title */}
          <div className="px-3 sm:px-4 md:px-6 pt-3 sm:pt-4 md:pt-5 pb-1.5 sm:pb-2 pr-12">
            <h2 className="text-sm sm:text-base md:text-lg font-semibold text-black" style={{ fontFamily: 'Jura, sans-serif' }}>
              {title || 'Freezers'}
              <span className="ml-1.5 sm:ml-2 text-xs font-normal text-gray-400">
                ({filteredFreezers.length})
              </span>
            </h2>
          </div>
          
          {/* Filters - Responsive */}
          <div className="px-3 sm:px-4 md:px-6 pb-2 sm:pb-3 border-b border-gray-100">
            <div className="flex flex-wrap gap-1.5 sm:gap-2">
              <select
                value={selectedRegion}
                onChange={(e) => setSelectedRegion(e.target.value)}
                className="px-2 sm:px-3 py-1 border border-gray-400 rounded-sm text-[10px] sm:text-xs bg-white flex-1 sm:flex-none min-w-[80px] sm:min-w-[100px]"
              >
                <option value="">All Regions</option>
                {regions.map((region) => (
                  <option key={region.region_id || region.id} value={region.region_name || region.name}>
                    {region.region_name || region.name}
                  </option>
                ))}
              </select>
              
              <div className="flex-1 min-w-[100px] sm:min-w-[150px] relative">
                <FiSearch className="absolute left-2 sm:left-2.5 top-1/2 -translate-y-1/2 text-gray-400" size={12} />
                <input
                  type="text"
                  placeholder="Search..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-6 sm:pl-8 pr-2 sm:pr-3 py-1.5 border border-gray-400 rounded-sm text-[10px] sm:text-xs focus:outline-none focus:ring-1 focus:ring-[#1a3a6b] focus:border-transparent bg-white"
                />
              </div>
              
              {(selectedRegion || searchTerm) && (
                <button
                  onClick={() => {
                    setSelectedRegion('');
                    setSearchTerm('');
                  }}
                  className="px-2 sm:px-3 py-1 text-[10px] sm:text-xs text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                >
                  Clear
                </button>
              )}
            </div>
          </div>
          
          {/* ✅ Table - Fixed Scrolling */}
          <div className="overflow-y-auto px-0.5 sm:px-1" style={{ maxHeight: 'calc(85vh - 140px)', overflowY: 'auto' }}>
            <table className="w-full min-w-[500px] sm:min-w-[600px] md:min-w-[700px] text-[10px] sm:text-xs">
              <thead className="sticky top-0 z-10">
                <tr className="bg-gradient-to-b from-[#0b1a30] to-[#1a3a6b]">
                  <th className="px-1.5 sm:px-2 py-1 sm:py-1.5 text-left text-[8px] sm:text-[9px] font-normal text-white/80 uppercase tracking-wider">#</th>
                  <th className="px-1.5 sm:px-2 py-1 sm:py-1.5 text-left text-[8px] sm:text-[9px] font-normal text-white/80 uppercase tracking-wider">Freezer</th>
                  <th className="px-1.5 sm:px-2 py-1 sm:py-1.5 text-left text-[8px] sm:text-[9px] font-normal text-white/80 uppercase tracking-wider">Shop</th>
                  <th className="px-1.5 sm:px-2 py-1 sm:py-1.5 text-left text-[8px] sm:text-[9px] font-normal text-white/80 uppercase tracking-wider">Temp</th>
                  <th className="px-1.5 sm:px-2 py-1 sm:py-1.5 text-left text-[8px] sm:text-[9px] font-normal text-white/80 uppercase tracking-wider hidden sm:table-cell">City</th>
                  <th className="px-1.5 sm:px-2 py-1 sm:py-1.5 text-left text-[8px] sm:text-[9px] font-normal text-white/80 uppercase tracking-wider hidden md:table-cell">Region</th>
                  <th className="px-1.5 sm:px-2 py-1 sm:py-1.5 text-left text-[8px] sm:text-[9px] font-normal text-white/80 uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="7" className="text-center py-4 sm:py-6">
                      <FiLoader className="animate-spin text-blue-600 mx-auto" size={16} />
                      <span className="text-[10px] sm:text-xs text-gray-400 mt-1 block">Loading...</span>
                    </td>
                  </tr>
                ) : filteredFreezers.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="text-center py-4 sm:py-6 text-gray-400 text-[10px] sm:text-xs">
                      {searchTerm ? 'No results found' : 'No freezers'}
                    </td>
                  </tr>
                ) : (
                  filteredFreezers.map((freezer, index) => {
                    const statusClass = getStatusBadgeClass(freezer.status);
                    return (
                      <tr 
                        key={freezer.sensor_rom || index}
                        className={`border-b border-gray-100 hover:bg-gray-50 transition-colors ${
                          index === filteredFreezers.length - 1 ? 'border-b-0' : ''
                        }`}
                      >
                        <td className="px-1.5 sm:px-2 py-1 sm:py-1.5 text-gray-400 text-[9px] sm:text-[10px]">{index + 1}</td>
                        <td className="px-1.5 sm:px-2 py-1 sm:py-1.5 font-medium text-black text-[9px] sm:text-[10px] truncate max-w-[60px] sm:max-w-[100px]">
                          {freezer.freezer_name}
                        </td>
                        <td className="px-1.5 sm:px-2 py-1 sm:py-1.5 text-gray-600 text-[9px] sm:text-[10px] truncate max-w-[50px] sm:max-w-[80px]">
                          {freezer.shop_name}
                        </td>
                        <td className="px-1.5 sm:px-2 py-1 sm:py-1.5 font-semibold text-[#1a2332] text-[9px] sm:text-[10px]">
                          {formatTemp(freezer.temperature)}
                        </td>
                        <td className="px-1.5 sm:px-2 py-1 sm:py-1.5 text-gray-600 text-[9px] sm:text-[10px] hidden sm:table-cell">
                          {freezer.city || 'N/A'}
                        </td>
                        <td className="px-1.5 sm:px-2 py-1 sm:py-1.5 text-gray-600 text-[9px] sm:text-[10px] hidden md:table-cell">
                          {freezer.region || 'N/A'}
                        </td>
                        <td className="px-1.5 sm:px-2 py-1 sm:py-1.5">
                          <span className={`inline-flex items-center px-1.5 sm:px-2 py-0.5 text-[8px] sm:text-[9px] font-medium rounded-full ${statusClass}`}>
                            {freezer.status || 'Unknown'}
                          </span>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
          
          {/* Footer - Responsive */}
          <div className="px-3 sm:px-4 md:px-6 py-2 sm:py-2.5 border-t border-gray-100 bg-gray-50/50 flex flex-wrap justify-between items-center gap-1.5">
            <span className="text-[9px] sm:text-[10px] text-gray-400">
              {filteredFreezers.length} of {freezers.length}
            </span>
            <button
              onClick={onClose}
              className="px-3 sm:px-4 py-1 sm:py-1.5 text-[10px] sm:text-xs bg-gradient-to-b from-[#0b1a30] to-[#1a3a6b] text-white rounded-sm hover:opacity-90 transition-opacity"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default FreezerDetailsModal;