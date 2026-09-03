const API_BASE_URL = '/api';

console.log('🌐 API_BASE_URL:', API_BASE_URL);

// Helper function for API calls - NO JWT TOKEN
const apiCall = async (endpoint, options = {}) => {
    const headers = {
        'Content-Type': 'application/json',
        ...options.headers,
    };
    
    const config = {
        ...options,
        headers,
        credentials: 'include', 
    };
    
    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
    const data = await response.json();
    
    if (!response.ok) {
        throw new Error(data.message || 'API call failed');
    }
    
    return data;
};

// ============================================
// AUTH APIs (No JWT Token)
// ============================================

// Login - No JWT token required
export const loginUser = async (credentials) => {
    return apiCall('/auth/login', {
        method: 'POST',
        body: JSON.stringify(credentials),
    });
};

// Logout
export const logoutUser = async () => {
    return apiCall('/auth/logout', {
        method: 'POST',
    });
};

// Check session
export const checkSession = async () => {
    return apiCall('/auth/check-session', {
        method: 'GET',
    });
};

// Get current user
export const getCurrentUser = async () => {
    return apiCall('/users/me', {
        method: 'GET',
    });
};

// ============================================
// USER MANAGEMENT APIs (No JWT Token)
// ============================================

// Get all users
export const getUsers = async () => {
    return apiCall('/users', {
        method: 'GET',
    });
};

// Get companies for dropdown
export const getCompanies = async () => {
    return apiCall('/users/companies', {
        method: 'GET',
    });
};

// Get roles for dropdown
export const getRoles = async () => {
    return apiCall('/users/roles', {
        method: 'GET',
    });
};

// Create user
export const createUser = async (userData) => {
    return apiCall('/users', {
        method: 'POST',
        body: JSON.stringify(userData),
    });
};

// Update user
export const updateUser = async (userId, userData) => {
    return apiCall(`/users/${userId}`, {
        method: 'PUT',
        body: JSON.stringify(userData),
    });
};

// Update user status
export const updateUserStatus = async (userId, isActive) => {
    return apiCall(`/users/${userId}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ is_active: isActive }),
    });
};

// Update user role
export const updateUserRole = async (userId, roleId) => {
    return apiCall(`/users/${userId}/role`, {
        method: 'PUT',
        body: JSON.stringify({ role_id: roleId }),
    });
};

// Delete user
export const deleteUser = async (userId) => {
    return apiCall(`/users/${userId}`, {
        method: 'DELETE',
    });
};

// ============================================
// LOCATION APIs
// ============================================

// ===== REGION APIs =====

// Get all regions - /locations/regions
export const getRegions = async () => {
    return apiCall('/locations/regions', {
        method: 'GET',
    });
};

// Create region - /locations/regions
export const createRegion = async (regionData) => {
    return apiCall('/locations/regions', {
        method: 'POST',
        body: JSON.stringify(regionData),
    });
};

// Update region - /locations/regions/:id
export const updateRegion = async (id, regionData) => {
    return apiCall(`/locations/regions/${id}`, {
        method: 'PUT',
        body: JSON.stringify(regionData),
    });
};

// Delete region - /locations/regions/:id
export const deleteRegion = async (id) => {
    return apiCall(`/locations/regions/${id}`, {
        method: 'DELETE',
    });
};

// ===== CITY APIs =====

// Get all cities - /locations/cities
// Get all cities - /locations/cities (with optional region filter)
export const getCities = async (regionId = null) => {
    const query = regionId ? `?region_id=${encodeURIComponent(regionId)}` : '';
    return apiCall(`/locations/cities${query}`, {
        method: 'GET',
    });
};

// Get cities by region_id - /locations/cities?region_id={regionId}
export const getCitiesByRegionId = async (regionId) => {
    const query = regionId ? `?region_id=${encodeURIComponent(regionId)}` : '';
    return apiCall(`/locations/cities${query}`, {
        method: 'GET',
    });
};

// Create city - /locations/cities
export const createCity = async (cityData) => {
    return apiCall('/locations/cities', {
        method: 'POST',
        body: JSON.stringify(cityData),
    });
};

// Update city - /locations/cities/:id
export const updateCity = async (id, cityData) => {
    return apiCall(`/locations/cities/${id}`, {
        method: 'PUT',
        body: JSON.stringify(cityData),
    });
};

// Delete city - /locations/cities/:id
export const deleteCity = async (id) => {
    return apiCall(`/locations/cities/${id}`, {
        method: 'DELETE',
    });
};

// ===== SHOP APIs =====

// Get all shops - /locations/shops
// Get all shops - /locations/shops (with optional city filter)
export const getShops = async (cityId = null) => {
    const query = cityId ? `?city_id=${encodeURIComponent(cityId)}` : '';
    return apiCall(`/locations/shops${query}`, {
        method: 'GET',
    });
};

// Get shop by ID - /locations/shops/{shopId}
export const getShopById = async (shopId) => {
    return apiCall(`/locations/shops/${shopId}`, {
        method: 'GET',
    });
};

// Get shops by city_id - /locations/shops?city_id={cityId}
export const getShopsByCityId = async (cityId) => {
    const query = cityId ? `?city_id=${encodeURIComponent(cityId)}` : '';
    return apiCall(`/locations/shops${query}`, {
        method: 'GET',
    });
};

// Create shop - /locations/shops
export const createShop = async (shopData) => {
    return apiCall('/locations/shops', {
        method: 'POST',
        body: JSON.stringify(shopData),
    });
};

// Update shop city - /locations/shops/:id/city
export const updateShop = async (id, shopData) => {
    return apiCall(`/locations/shops/${id}/city`, {
        method: 'PUT',
        body: JSON.stringify(shopData),
    });
};

// Delete shop - /locations/shops/:id
export const deleteShop = async (id) => {
    return apiCall(`/locations/shops/${id}`, {
        method: 'DELETE',
    });
};

// Get all locations (full hierarchy)
export const getAllLocations = async () => {
    return apiCall('/locations/all', {
        method: 'GET',
    });
};

// Get location by ID
export const getLocationById = async (id) => {
    return apiCall(`/locations/${id}`, {
        method: 'GET',
    });
};

// Delete location by ID (Generic - use specific delete functions instead)
export const deleteLocation = async (id) => {
    return apiCall(`/locations/${id}`, {
        method: 'DELETE',
    });
};

// Delete all locations by type
export const deleteAllByType = async (type) => {
    return apiCall(`/locations/type/${type}`, {
        method: 'DELETE',
    });
};

// ============================================
// HISTORY APIs
// ============================================

// Get Historical Data - Updated with sensor_rom support
export const getHistoricalData = async (startDate, endDate, filters = {}) => {
    const params = new URLSearchParams();
    if (startDate) params.append('start_date', startDate);
    if (endDate) params.append('end_date', endDate);
    if (filters.region) params.append('region', filters.region);
    if (filters.city) params.append('city', filters.city);
    if (filters.shop) params.append('shop', filters.shop);
    if (filters.freezer_name) params.append('freezer_name', filters.freezer_name);
    if (filters.sensor_name) params.append('sensor_name', filters.sensor_name);
    if (filters.sensor_rom) params.append('sensor_rom', filters.sensor_rom);
    const query = params.toString() ? `?${params.toString()}` : '';
    return apiCall(`/history/data${query}`, {
        method: 'GET',
    });
};

// Get History Freezers by Shop ID - /history/freezers/{shopId}
export const getHistoryFreezers = async (shopId) => {
    return apiCall(`/history/freezers/${shopId}`, {
        method: 'GET',
    });
};

// Get History Sensors by Freezer Name - /history/sensors/{freezerName}
export const getHistorySensors = async (freezerName) => {
    return apiCall(`/history/sensors/${encodeURIComponent(freezerName)}`, {
        method: 'GET',
    });
};

// ============================================
// DASHBOARD APIs
// ============================================

// Get Dashboard Summary
export const getDashboardSummary = async () => {
    return apiCall('/dashboard/summary', {
        method: 'GET',
    });
};

// Get Freezers - Returns all freezers with sensor_name field
export const getFreezers = async (filters = {}) => {
    const params = new URLSearchParams();
    if (filters.region) params.append('region', filters.region);
    if (filters.city) params.append('city', filters.city);
    if (filters.shop) params.append('shop', filters.shop);
    const query = params.toString() ? `?${params.toString()}` : '';
    return apiCall(`/dashboard/freezers${query}`, {
        method: 'GET',
    });
};

// Get Critical Freezers
export const getCriticalFreezers = async (filters = {}) => {
    const params = new URLSearchParams();
    if (filters.region) params.append('region', filters.region);
    if (filters.city) params.append('city', filters.city);
    if (filters.shop) params.append('shop', filters.shop);
    const query = params.toString() ? `?${params.toString()}` : '';
    return apiCall(`/dashboard/critical${query}`, {
        method: 'GET',
    });
};

// Get Freezer Details by ID
export const getFreezerDetails = async (freezerId) => {
    return apiCall(`/dashboard/freezers/${freezerId}`, {
        method: 'GET',
    });
};

// Get Filter Options
export const getFilterOptions = async () => {
    return apiCall('/dashboard/filters', {
        method: 'GET',
    });
};

// ============================================
// REPORT APIs
// ============================================

// Get Live Report
export const getLiveReport = async (filters = {}) => {
    const params = new URLSearchParams();
    if (filters.region) params.append('region', filters.region);
    if (filters.city) params.append('city', filters.city);
    if (filters.shop) params.append('shop', filters.shop);
    if (filters.freezer) params.append('freezer', filters.freezer);
    if (filters.status) params.append('status', filters.status);
    const query = params.toString() ? `?${params.toString()}` : '';
    return apiCall(`/reports/live${query}`, {
        method: 'GET',
    });
};

// Export Report
export const exportReport = async (filters = {}) => {
    const params = new URLSearchParams();
    if (filters.region) params.append('region', filters.region);
    if (filters.city) params.append('city', filters.city);
    if (filters.shop) params.append('shop', filters.shop);
    if (filters.freezer) params.append('freezer', filters.freezer);
    if (filters.status) params.append('status', filters.status);
    const query = params.toString() ? `?${params.toString()}` : '';
    return apiCall(`/reports/export${query}`, {
        method: 'GET',
    });
};

// ============================================
// GATEWAY MANAGEMENT APIs
// ============================================

// CREATE - Add new Gateway (Freezer)
export const createGateway = async (gatewayData) => {
    return apiCall('/gateway/gateway', {
        method: 'POST',
        body: JSON.stringify(gatewayData),
    });
};

// UPDATE - Update existing Gateway (Freezer)
export const updateGateway = async (gatewayId, gatewayData) => {
    return apiCall(`/gateway/gateway/${gatewayId}`, {
        method: 'PUT',
        body: JSON.stringify(gatewayData),
    });
};

// DELETE - Delete Gateway (Freezer)
export const deleteGateway = async (gatewayId) => {
    return apiCall(`/gateway/gateway/${gatewayId}`, {
        method: 'DELETE',
    });
};

// Add/Update Gateway (Freezer) - Legacy
export const upsertGateway = async (gatewayData) => {
    return apiCall('/gateway/gateway', {
        method: 'POST',
        body: JSON.stringify(gatewayData),
    });
};

// ============================================
// SENSOR APIs
// ============================================

// Get all sensors - /devices/sensors
export const getSensors = async (filters = {}) => {
    const params = new URLSearchParams();
    if (filters.shop_id) params.append('shop_id', filters.shop_id);
    if (filters.freezer_name) params.append('freezer_name', filters.freezer_name);
    const query = params.toString() ? `?${params.toString()}` : '';
    return apiCall(`/devices/sensors${query}`, {
        method: 'GET',
    });
};

// CREATE - Add New Sensor
export const createSensor = async (sensorData) => {
    return apiCall('/gateway/sensor', {
        method: 'POST',
        body: JSON.stringify(sensorData),
    });
};

// UPDATE - Update Existing Sensor - /devices/sensors/{sensor_rom}
export const updateSensor = async (sensorId, sensorData) => {
    return apiCall(`/devices/sensors/${sensorId}`, {
        method: 'PUT',
        body: JSON.stringify(sensorData),
    });
};

// UPDATE - Update Sensor Freezer Name - /devices/sensors/{sensor_rom}
export const updateSensorFreezerName = async (sensorRom, freezerName) => {
    return apiCall(`/devices/sensors/${sensorRom}`, {
        method: 'PUT',
        body: JSON.stringify({ freezer_name: freezerName }),
    });
};

// DELETE - Delete Sensor
export const deleteSensor = async (sensorId) => {
    return apiCall(`/gateway/sensor/${sensorId}`, {
        method: 'DELETE',
    });
};

// ============================================
// ADMIN MANAGEMENT APIs (Legacy - Keep for compatibility)
// ============================================

// Add Shop (ADMIN)
export const addShop = async (shopData) => {
    return apiCall('/admin/shop', {
        method: 'POST',
        body: JSON.stringify(shopData),
    });
};

// Update Freezer - /admin/freezer/{freezerId}
export const updateFreezer = async (freezerId, freezerData) => {
    return apiCall(`/admin/freezer/${freezerId}`, {
        method: 'PUT',
        body: JSON.stringify(freezerData),
    });
};

// Attach Sensor
export const attachSensor = async (data) => {
    return apiCall('/admin/sensor/attach', {
        method: 'POST',
        body: JSON.stringify(data),
    });
};

// Disconnect Sensor
export const disconnectSensor = async (data) => {
    return apiCall('/admin/sensor/disconnect', {
        method: 'POST',
        body: JSON.stringify(data),
    });
};

// Replace Sensor
export const replaceSensor = async (data) => {
    return apiCall('/admin/sensor/replace', {
        method: 'POST',
        body: JSON.stringify(data),
    });
};

// ============================================
// LEGACY USER MANAGEMENT APIs (Deprecated - Use new ones above)
// ============================================

// DEPRECATED: Use new getUsers() above
export const getUsersLegacy = async () => {
    return apiCall('/admin/users', {
        method: 'GET',
    });
};

// DEPRECATED: Use new createUser() above
export const createUserLegacy = async (userData) => {
    return apiCall('/admin/user', {
        method: 'POST',
        body: JSON.stringify(userData),
    });
};

// DEPRECATED: Use new updateUser() above
export const updateUserLegacy = async (userId, userData) => {
    return apiCall(`/admin/user/${userId}`, {
        method: 'PUT',
        body: JSON.stringify(userData),
    });
};

// Reset Password
export const resetPassword = async (userId, newPassword) => {
    return apiCall(`/admin/user/${userId}/reset-password`, {
        method: 'POST',
        body: JSON.stringify({ new_password: newPassword }),
    });
};

// Assign Role
export const assignRole = async (userId, roleId) => {
    return apiCall(`/admin/user/${userId}/role`, {
        method: 'POST',
        body: JSON.stringify({ role_id: roleId }),
    });
};

// Create Role
export const createRole = async (roleData) => {
    return apiCall('/admin/role', {
        method: 'POST',
        body: JSON.stringify(roleData),
    });
};

// Update Role
export const updateRole = async (roleId, roleData) => {
    return apiCall(`/admin/role/${roleId}`, {
        method: 'PUT',
        body: JSON.stringify(roleData),
    });
};

// Add Region (Old - Kept for backward compatibility)
export const addRegion = async (regionData) => {
    return apiCall('/admin/region', {
        method: 'POST',
        body: JSON.stringify(regionData),
    });
};

// Add City (Old - Kept for backward compatibility)
export const addCity = async (cityData) => {
    return apiCall('/admin/city', {
        method: 'POST',
        body: JSON.stringify(cityData),
    });
};

// ============================================
// NOTIFICATION APIs
// ============================================

// Send test email
export const sendTestEmail = async () => {
    return apiCall('/notifications/send-test', {
        method: 'POST',
    });
};

// Check and send critical alerts
export const checkCriticalAlerts = async () => {
    return apiCall('/notifications/check-critical', {
        method: 'POST',
    });
};

// Send single alert (manual)
export const sendSingleAlert = async (freezerData) => {
    return apiCall('/notifications/send-single', {
        method: 'POST',
        body: JSON.stringify({ freezer: freezerData }),
    });
};

// Check status changes (Inactive/Active, Normal/Critical)
export const checkStatusChanges = async () => {
    return apiCall('/notifications/check-status-changes', {
        method: 'POST',
    });
};

// Get recent notifications
export const getRecentNotifications = async () => {
    return apiCall('/notifications/recent', {
        method: 'GET',
    });
};

// ============================================
// HEALTH CHECK
// ============================================

export const healthCheck = async () => {
    return apiCall('/health', {
        method: 'GET',
    });
};