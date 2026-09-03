import React, { useState, useEffect } from 'react';
import DeviceManagementLayout from '../layout/DeviceManagementLayout';
import { FiSearch, FiLoader } from 'react-icons/fi';
import { getSensors } from '../../../services/api/api';

const SensorsPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sensors, setSensors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // ============================================
  // FETCH DATA ON MOUNT
  // ============================================
  
  useEffect(() => {
    fetchSensors();
  }, []);

  // ============================================
  // API CALLS
  // ============================================

  // GET /devices/sensors
  const fetchSensors = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await getSensors();
      console.log('Sensors response:', response);
      
      let sensorData = response.data || response;
      
      if (Array.isArray(sensorData)) {
        const formattedSensors = sensorData.map(item => ({
          id: item.sensor_id || item.id,
          sensor_rom: item.sensor_rom || '-',
          sensor_name: item.sensor_name || '-',
          freezer_name: item.freezer_name || '-',
          temperature: item.temperature || '-',
          shop_name: item.shop_name || '-',
          city_name: item.city_name || '-',
          region_name: item.region_name || '-',
          created_at: item.created_at || '-'
        }));
        setSensors(formattedSensors);
        console.log('Total sensors:', formattedSensors.length);
      } else {
        setSensors([]);
      }
    } catch (err) {
      console.error('Error fetching sensors:', err);
      setError('Failed to fetch sensors');
    } finally {
      setLoading(false);
    }
  };

  // ============================================
  // FILTER SENSORS
  // ============================================

  const filteredSensors = sensors.filter(sensor =>
    sensor.sensor_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    sensor.sensor_rom.toLowerCase().includes(searchTerm.toLowerCase()) ||
    sensor.freezer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    sensor.shop_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    sensor.city_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    sensor.region_name.toLowerCase().includes(searchTerm.toLowerCase())
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
            placeholder="Search sensors..."
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
                <th className="px-2 sm:px-3 py-1.5 sm:py-2 text-left text-[10px] sm:text-xs font-normal text-white uppercase tracking-wider" style={{ fontFamily: 'Jura, sans-serif' }}>Sensor Name</th>
                <th className="px-2 sm:px-3 py-1.5 sm:py-2 text-left text-[10px] sm:text-xs font-normal text-white uppercase tracking-wider" style={{ fontFamily: 'Jura, sans-serif' }}>Sensor ROM</th>
                <th className="px-2 sm:px-3 py-1.5 sm:py-2 text-left text-[10px] sm:text-xs font-normal text-white uppercase tracking-wider" style={{ fontFamily: 'Jura, sans-serif' }}>Freezer Name</th>
                <th className="px-2 sm:px-3 py-1.5 sm:py-2 text-left text-[10px] sm:text-xs font-normal text-white uppercase tracking-wider" style={{ fontFamily: 'Jura, sans-serif' }}>Temperature</th>
                <th className="px-2 sm:px-3 py-1.5 sm:py-2 text-left text-[10px] sm:text-xs font-normal text-white uppercase tracking-wider" style={{ fontFamily: 'Jura, sans-serif' }}>Shop</th>
                <th className="px-2 sm:px-3 py-1.5 sm:py-2 text-left text-[10px] sm:text-xs font-normal text-white uppercase tracking-wider" style={{ fontFamily: 'Jura, sans-serif' }}>City</th>
                <th className="px-2 sm:px-3 py-1.5 sm:py-2 text-left text-[10px] sm:text-xs font-normal text-white uppercase tracking-wider" style={{ fontFamily: 'Jura, sans-serif' }}>Region</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="8" className="text-center py-8">
                    <div className="flex items-center justify-center gap-2">
                      <FiLoader className="animate-spin text-blue-600" size={20} />
                      <span className="text-gray-500 text-xs sm:text-sm">Loading sensors...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredSensors.length === 0 ? (
                <tr>
                  <td colSpan="8" className="text-center py-8 text-gray-500 text-xs sm:text-sm">
                    {searchTerm ? 'No sensors found matching your search' : 'No sensors found'}
                  </td>
                </tr>
              ) : (
                filteredSensors.map((sensor, index) => (
                  <tr 
                    key={sensor.id || index} 
                    className={`border-b border-gray-200 hover:bg-gray-100 transition-colors ${
                      index === filteredSensors.length - 1 ? 'border-b-0' : ''
                    } animate-fade-in-up`}
                    style={{ animationDelay: `${0.15 + index * 0.05}s` }}
                  >
                    <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-[11px] sm:text-sm text-gray-600">{index + 1}</td>
                    <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-[11px] sm:text-sm font-medium text-black">{sensor.sensor_name}</td>
                    <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-[11px] sm:text-sm text-black font-mono">{sensor.sensor_rom}</td>
                    <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-[11px] sm:text-sm text-black">{sensor.freezer_name}</td>
                    <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-[11px] sm:text-sm text-black">{sensor.temperature}°C</td>
                    <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-[11px] sm:text-sm text-black">{sensor.shop_name}</td>
                    <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-[11px] sm:text-sm text-black">{sensor.city_name}</td>
                    <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-[11px] sm:text-sm text-black">{sensor.region_name}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </DeviceManagementLayout>
  );
};

export default SensorsPage;