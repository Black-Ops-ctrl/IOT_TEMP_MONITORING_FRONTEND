import React, { useState, useEffect } from 'react';
import UserManagementLayout from '../layout/UserManagementLayout';
import { FiSearch, FiPlus, FiEdit2, FiTrash2, FiX, FiLoader, FiEye, FiEyeOff } from 'react-icons/fi';
import { 
  getUsers, 
  createUser, 
  updateUser, 
  deleteUser, 
  getRoles, 
  getCompanies,
  getRegions,
  getCitiesByRegionId
} from '../../../services/api/api';

const UsersPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  
  // Show password state
  const [showPassword, setShowPassword] = useState(false);
  
  // Form states
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    email: '',
    full_name: '',
    company: '',
    role_id: '',
    region_id: '',
    city_id: '',
  });

  // Delete modal states
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Dropdown options
  const [roles, setRoles] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [regions, setRegions] = useState([]);
  const [cities, setCities] = useState([]);
  const [loadingDropdowns, setLoadingDropdowns] = useState(false);
  const [loadingCities, setLoadingCities] = useState(false);

  // ============================================
  // FETCH DATA ON MOUNT
  // ============================================
  
  useEffect(() => {
    fetchUsers();
    fetchDropdownData();
    fetchRegions();
  }, []);

  // Fetch cities when region changes
  useEffect(() => {
    if (formData.region_id) {
      fetchCitiesByRegion(formData.region_id);
    } else {
      setCities([]);
    }
  }, [formData.region_id]);

  // ============================================
  // API CALLS
  // ============================================

  // ✅ FIXED: GET /api/users
  const fetchUsers = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await getUsers();
      console.log('Users response:', response);
      
      // ✅ Handle different response structures
      let usersData = [];
      if (response.success && response.data) {
        usersData = response.data;
      } else if (Array.isArray(response)) {
        usersData = response;
      } else if (response.data && Array.isArray(response.data)) {
        usersData = response.data;
      }
      
      setUsers(usersData);
      console.log('✅ Users set:', usersData.length);
    } catch (err) {
      console.error('Error fetching users:', err);
      setError(err.message || 'Failed to fetch users');
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  // GET /api/users/roles, /api/users/companies
  const fetchDropdownData = async () => {
    setLoadingDropdowns(true);
    try {
      const [rolesResponse, companiesResponse] = await Promise.all([
        getRoles(),
        getCompanies()
      ]);
      
      console.log('Roles response:', rolesResponse);
      console.log('Companies response:', companiesResponse);
      
      if (rolesResponse.success && rolesResponse.data) {
        setRoles(rolesResponse.data);
      }
      
      if (companiesResponse.success && companiesResponse.data) {
        setCompanies(companiesResponse.data);
      }
    } catch (err) {
      console.error('Error fetching dropdown data:', err);
    } finally {
      setLoadingDropdowns(false);
    }
  };

  // GET /api/locations/regions
  const fetchRegions = async () => {
    try {
      const response = await getRegions();
      console.log('Regions response:', response);
      
      let regionData = [];
      if (response.success && response.data) {
        regionData = response.data;
      } else if (Array.isArray(response)) {
        regionData = response;
      } else if (response.data && Array.isArray(response.data)) {
        regionData = response.data;
      }
      
      const mappedRegions = regionData.map(item => ({
        id: item.id || item.region_id || item.ID,
        name: item.name || item.region_name || item.NAME || item.region
      })).filter(item => item.id && item.name);
      
      console.log('Mapped regions:', mappedRegions);
      setRegions(mappedRegions);
    } catch (err) {
      console.error('Error fetching regions:', err);
    }
  };

  // GET /api/locations/cities?region_id={regionId}
  const fetchCitiesByRegion = async (regionId) => {
    setLoadingCities(true);
    try {
      const response = await getCitiesByRegionId(regionId);
      console.log('Cities response:', response);
      
      let cityData = [];
      if (response.success && response.data) {
        cityData = response.data;
      } else if (Array.isArray(response)) {
        cityData = response;
      } else if (response.data && Array.isArray(response.data)) {
        cityData = response.data;
      }
      
      const mappedCities = cityData.map(item => ({
        id: item.id || item.city_id || item.ID,
        name: item.name || item.city_name || item.NAME || item.city
      })).filter(item => item.id && item.name);
      
      console.log('Mapped cities:', mappedCities);
      setCities(mappedCities);
    } catch (err) {
      console.error('Error fetching cities:', err);
      setCities([]);
    } finally {
      setLoadingCities(false);
    }
  };

  // ✅ FIXED: POST /api/users | PUT /api/users/:id
  const handleSaveUser = async () => {
    // Validate
    if (!formData.username.trim()) {
      setError('Username is required');
      return;
    }
    if (!editingId && !formData.password.trim()) {
      setError('Password is required for new users');
      return;
    }
    if (!formData.company) {
      setError('Company is required');
      return;
    }
    if (!formData.role_id) {
      setError('Role is required');
      return;
    }
    
    setIsSaving(true);
    setError('');
    
    try {
      const selectedRegion = regions.find(r => String(r.id) === String(formData.region_id));
      const selectedCity = cities.find(c => String(c.id) === String(formData.city_id));
      
      const userData = {
        username: formData.username.trim(),
        email: formData.email || null,
        full_name: formData.full_name || null,
        company: formData.company,
        role_id: parseInt(formData.role_id),
        region: selectedRegion ? selectedRegion.name : null,
        city: selectedCity ? selectedCity.name : null,
      };

      let response;
      
      if (editingId) {
        userData.password = undefined; // Remove password for update
        response = await updateUser(editingId, userData);
      } else {
        userData.password = formData.password.trim();
        response = await createUser(userData);
      }
      
      console.log('Save user response:', response);
      
      if (response.success) {
        // ✅ Force refresh users list
        await fetchUsers();
        resetForm();
        setIsModalOpen(false);
      } else {
        setError(response.message || 'Failed to save user');
      }
    } catch (err) {
      console.error('Error saving user:', err);
      setError(err.message || 'Failed to save user');
    } finally {
      setIsSaving(false);
    }
  };

  // Handle Edit - Open modal with user data
  const handleEdit = (user) => {
    const region = regions.find(r => r.name === user.region);
    const city = cities.find(c => c.name === user.city);
    
    setEditingId(user.id);
    setFormData({
      username: user.username || '',
      password: '',
      email: user.email || '',
      full_name: user.full_name || '',
      company: user.company || '',
      role_id: user.role_id ? String(user.role_id) : '',
      region_id: region ? String(region.id) : '',
      city_id: city ? String(city.id) : '',
    });
    setError('');
    setIsModalOpen(true);
  };

  // ✅ FIXED: DELETE /api/users/:id
  const handleDeleteClick = (id) => {
    setDeleteId(id);
    setIsDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    setIsDeleting(true);
    setError('');
    
    try {
      const response = await deleteUser(deleteId);
      console.log('Delete response:', response);
      
      if (response.success) {
        // ✅ Force refresh users list
        await fetchUsers();
        setIsDeleteModalOpen(false);
        setDeleteId(null);
      } else {
        setError(response.message || 'Failed to delete user');
      }
    } catch (err) {
      console.error('Error deleting user:', err);
      setError(err.message || 'Failed to delete user');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDeleteCancel = () => {
    setIsDeleteModalOpen(false);
    setDeleteId(null);
    setIsDeleting(false);
  };

  const resetForm = () => {
    setFormData({
      username: '',
      password: '',
      email: '',
      full_name: '',
      company: '',
      role_id: '',
      region_id: '',
      city_id: '',
    });
    setEditingId(null);
    setError('');
    setShowPassword(false);
  };

  const handleCancel = () => {
    resetForm();
    setIsModalOpen(false);
    setIsSaving(false);
  };

  // ============================================
  // FORMAT DATE
  // ============================================

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    } catch {
      return 'N/A';
    }
  };

  // ============================================
  // FILTER USERS
  // ============================================

  const filteredUsers = users.filter(user =>
    user.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.company?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // ============================================
  // GET ROLE NAME BY ID
  // ============================================

  const getRoleName = (roleId) => {
    const role = roles.find(r => r.id === roleId);
    return role ? role.name : 'N/A';
  };

  // ============================================
  // RENDER
  // ============================================

  return (
    <UserManagementLayout>
      {/* Search and Add Button */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4 mb-3 sm:mb-4 animate-fade-in-down">
        <div className="relative w-full sm:w-64 md:w-72">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
          <input
            type="text"
            placeholder="Search users..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-3 py-1.5 sm:py-2 text-xs sm:text-sm border border-gray-300 rounded-full focus:outline-none focus:ring-1 focus:ring-gray-400 focus:border-transparent transition-all bg-white"
          />
        </div>
        <button 
          onClick={() => {
            resetForm();
            setIsModalOpen(true);
          }}
          className="flex items-center gap-1 px-3 sm:px-4 py-1.5 sm:py-2 bg-gradient-to-b from-[#0b1a30] to-[#1a3a6b] text-white text-[10px] sm:text-xs rounded-full shadow-lg hover:opacity-90 transition-opacity w-full sm:w-auto justify-center sm:justify-start" 
          style={{ fontFamily: 'Poppins, sans-serif' }}
          disabled={loading}
        >
          <FiPlus size={12} />
          Add User
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
          <table className="w-full min-w-[700px] sm:min-w-full">
            <thead className="sticky top-0 z-10">
              <tr className="bg-gradient-to-b from-[#0b1a30] to-[#1a3a6b] border-b border-gray-600">
                <th className="px-2 sm:px-3 py-1.5 sm:py-2 text-left text-[10px] sm:text-xs font-normal text-white uppercase tracking-wider" style={{ fontFamily: 'Jura, sans-serif' }}>SR</th>
                <th className="px-2 sm:px-3 py-1.5 sm:py-2 text-left text-[10px] sm:text-xs font-normal text-white uppercase tracking-wider" style={{ fontFamily: 'Jura, sans-serif' }}>Username</th>
                <th className="px-2 sm:px-3 py-1.5 sm:py-2 text-left text-[10px] sm:text-xs font-normal text-white uppercase tracking-wider" style={{ fontFamily: 'Jura, sans-serif' }}>Full Name</th>
                <th className="px-2 sm:px-3 py-1.5 sm:py-2 text-left text-[10px] sm:text-xs font-normal text-white uppercase tracking-wider" style={{ fontFamily: 'Jura, sans-serif' }}>Email</th>
                <th className="px-2 sm:px-3 py-1.5 sm:py-2 text-left text-[10px] sm:text-xs font-normal text-white uppercase tracking-wider" style={{ fontFamily: 'Jura, sans-serif' }}>Company</th>
                <th className="px-2 sm:px-3 py-1.5 sm:py-2 text-left text-[10px] sm:text-xs font-normal text-white uppercase tracking-wider" style={{ fontFamily: 'Jura, sans-serif' }}>Role</th>
                <th className="px-2 sm:px-3 py-1.5 sm:py-2 text-left text-[10px] sm:text-xs font-normal text-white uppercase tracking-wider" style={{ fontFamily: 'Jura, sans-serif' }}>Created Date</th>
                <th className="px-2 sm:px-3 py-1.5 sm:py-2 text-right text-[10px] sm:text-xs font-normal text-white uppercase tracking-wider" style={{ fontFamily: 'Jura, sans-serif' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="8" className="text-center py-8">
                    <div className="flex items-center justify-center gap-2">
                      <FiLoader className="animate-spin text-blue-600" size={20} />
                      <span className="text-gray-500 text-xs sm:text-sm">Loading users...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan="8" className="text-center py-8 text-gray-500 text-xs sm:text-sm">
                    {searchTerm ? 'No users found matching your search' : 'No users found'}
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user, index) => {
                  const roleName = getRoleName(user.role_id);
                  return (
                    <tr 
                      key={user.id || index} 
                      className={`border-b border-gray-200 hover:bg-gray-100 transition-colors ${
                        index === filteredUsers.length - 1 ? 'border-b-0' : ''
                      } animate-fade-in-up`}
                      style={{ animationDelay: `${0.15 + index * 0.05}s` }}
                    >
                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-[11px] sm:text-sm text-gray-600">{index + 1}</td>
                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-[11px] sm:text-sm font-medium text-black">{user.username}</td>
                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-[11px] sm:text-sm text-black">{user.full_name || 'N/A'}</td>
                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-[11px] sm:text-sm text-black">{user.email || 'N/A'}</td>
                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-[11px] sm:text-sm text-black">{user.company || 'N/A'}</td>
                      <td className="px-2 sm:px-3 py-1.5 sm:py-2">
                        <span className={`inline-flex items-center px-2.5 py-0.5 text-xs font-medium rounded-full ${
                          roleName === 'ADMIN' 
                            ? 'bg-purple-100 text-purple-700' 
                            : roleName === 'OPERATIONS'
                            ? 'bg-blue-100 text-blue-700'
                            : roleName === 'VIEW_ONLY'
                            ? 'bg-gray-100 text-gray-700'
                            : 'bg-gray-100 text-gray-700'
                        }`}>
                          {roleName}
                        </span>
                      </td>
                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-[11px] sm:text-sm text-black">{formatDate(user.created_at)}</td>
                      <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-right">
                        <div className="flex items-center justify-end gap-1 sm:gap-2">
                          <button 
                            onClick={() => handleEdit(user)}
                            className="p-1 sm:p-1.5 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
                            disabled={loading}
                          >
                            <FiEdit2 size={14} className="sm:w-4 sm:h-4" />
                          </button>
                          <button 
                            onClick={() => handleDeleteClick(user.id)}
                            className="p-1 sm:p-1.5 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                            disabled={loading}
                          >
                            <FiTrash2 size={14} className="sm:w-4 sm:h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add/Edit User Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm p-4 animate-fade-in-up">
          <div className="bg-white border border-gray-400 shadow-lg w-full max-w-[90%] sm:max-w-md mx-auto p-4 sm:p-6 animate-fade-in-up max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-3 sticky top-0 bg-white z-10 pb-2 border-b border-gray-100">
              <h3 className="text-sm sm:text-md text-black" style={{ fontFamily: 'Poppins, sans-serif' }}>
                {editingId ? 'Update User' : 'Add New User'}
              </h3>
              <button
                onClick={handleCancel}
                className="text-gray-400 hover:text-gray-600 transition-colors"
                disabled={isSaving}
              >
                <FiX size={20} />
              </button>
            </div>
            
            <div className="space-y-3 sm:space-y-4">
              {/* Username */}
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-1.5" style={{ fontFamily: 'Poppins, sans-serif' }}>
                  Username <span className="text-red-600">*</span>
                </label>
                <input
                  type="text"
                  value={formData.username}
                  onChange={(e) => {
                    setFormData({ ...formData, username: e.target.value });
                    if (error) setError('');
                  }}
                  placeholder="Enter username..."
                  className={`w-full px-3 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm border focus:outline-none transition-all bg-white ${
                    error && !formData.username.trim() 
                      ? 'border-red-500' 
                      : 'border-gray-300 focus:border-blue-500'
                  }`}
                  disabled={isSaving}
                />
              </div>

              {/* Full Name */}
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-1.5" style={{ fontFamily: 'Poppins, sans-serif' }}>
                  Full Name
                </label>
                <input
                  type="text"
                  value={formData.full_name}
                  onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                  placeholder="Enter full name..."
                  className="w-full px-3 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm border border-gray-300 focus:outline-none focus:border-blue-500 transition-all bg-white"
                  disabled={isSaving}
                />
              </div>

              {/* Email */}
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-1.5" style={{ fontFamily: 'Poppins, sans-serif' }}>
                  Email
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="Enter email..."
                  className="w-full px-3 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm border border-gray-300 focus:outline-none focus:border-blue-500 transition-all bg-white"
                  disabled={isSaving}
                />
              </div>

              {/* Password (only show for new users) */}
              {!editingId && (
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-1.5" style={{ fontFamily: 'Poppins, sans-serif' }}>
                    Password <span className="text-red-600">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={formData.password}
                      onChange={(e) => {
                        setFormData({ ...formData, password: e.target.value });
                        if (error) setError('');
                      }}
                      placeholder="Enter password..."
                      className={`w-full px-3 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm border focus:outline-none transition-all bg-white pr-10 ${
                        error && !formData.password.trim() && !editingId
                          ? 'border-red-500' 
                          : 'border-gray-300 focus:border-blue-500'
                      }`}
                      disabled={isSaving}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-all duration-200"
                      disabled={isSaving}
                    >
                      {showPassword ? <FiEyeOff size={16} /> : <FiEye size={16} />}
                    </button>
                  </div>
                </div>
              )}

              {/* Company */}
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-1.5" style={{ fontFamily: 'Poppins, sans-serif' }}>
                  Company <span className="text-red-600">*</span>
                </label>
                <select
                  value={formData.company}
                  onChange={(e) => {
                    setFormData({ ...formData, company: e.target.value });
                    if (error) setError('');
                  }}
                  className={`w-full px-3 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm border focus:outline-none transition-all bg-white ${
                    error && !formData.company 
                      ? 'border-red-500' 
                      : 'border-gray-300 focus:border-blue-500'
                  }`}
                  disabled={isSaving || loadingDropdowns}
                >
                  <option value="">Select Company</option>
                  {companies.map((company) => (
                    <option key={company.id} value={company.name}>
                      {company.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Role */}
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-1.5" style={{ fontFamily: 'Poppins, sans-serif' }}>
                  Role <span className="text-red-600">*</span>
                </label>
                <select
                  value={formData.role_id}
                  onChange={(e) => {
                    setFormData({ ...formData, role_id: e.target.value });
                    if (error) setError('');
                  }}
                  className={`w-full px-3 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm border focus:outline-none transition-all bg-white ${
                    error && !formData.role_id 
                      ? 'border-red-500' 
                      : 'border-gray-300 focus:border-blue-500'
                  }`}
                  disabled={isSaving || loadingDropdowns}
                >
                  <option value="">Select Role</option>
                  {roles.map((role) => (
                    <option key={role.id} value={role.id}>
                      {role.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Region */}
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-1.5" style={{ fontFamily: 'Poppins, sans-serif' }}>
                  Region
                </label>
                <select
                  value={formData.region_id}
                  onChange={(e) => {
                    setFormData({ ...formData, region_id: e.target.value, city_id: '' });
                    if (error) setError('');
                  }}
                  className="w-full px-3 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm border border-gray-300 focus:outline-none focus:border-blue-500 transition-all bg-white"
                  disabled={isSaving || loadingDropdowns}
                >
                  <option value="">Select Region</option>
                  {regions.map((region) => (
                    <option key={region.id} value={region.id}>
                      {region.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* City */}
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-1.5" style={{ fontFamily: 'Poppins, sans-serif' }}>
                  City
                </label>
                <select
                  value={formData.city_id}
                  onChange={(e) => {
                    setFormData({ ...formData, city_id: e.target.value });
                    if (error) setError('');
                  }}
                  className="w-full px-3 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm border border-gray-300 focus:outline-none focus:border-blue-500 transition-all bg-white"
                  disabled={!formData.region_id || isSaving || loadingCities}
                >
                  <option value="">
                    {loadingCities ? 'Loading cities...' : 'Select City'}
                  </option>
                  {cities.map((city) => (
                    <option key={city.id} value={city.id}>
                      {city.name}
                    </option>
                  ))}
                </select>
              </div>

              {error && (
                <p className="text-[10px] sm:text-xs text-red-500">{error}</p>
              )}
            </div>

            <div className="flex items-center justify-end gap-2 sm:gap-3 mt-4 sm:mt-6 sticky bottom-0 bg-white pt-3 border-t border-gray-100">
              <button
                onClick={handleCancel}
                className="px-3 sm:px-5 py-1.5 sm:py-2 text-xs sm:text-sm font-medium text-red-600 border border-red-500 hover:bg-red-50 transition-colors"
                style={{ fontFamily: 'Jura, sans-serif' }}
                disabled={isSaving}
              >
                Cancel
              </button>
              <button
                onClick={handleSaveUser}
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
                Delete User
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
                Are you sure you want to delete this user?
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
    </UserManagementLayout>
  );
};

export default UsersPage;