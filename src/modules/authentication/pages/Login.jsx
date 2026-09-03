import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import logo from '../../../assets/png/logo.png';
import logoSabir from '../../../assets/png/logo_sabir.png';
import sideImage from '../../../assets/png/img_sabroso.png';
import bgImage from '../../../assets/png/bg_image_one.png';
import { loginUser, getCompanies } from '../../../services/api/api';

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();  // ✅ Use login function
  const [formData, setFormData] = useState({
    company: '',
    username: '',
    password: '',
    rememberMe: false
  });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [companies, setCompanies] = useState([]);
  const [companiesLoading, setCompaniesLoading] = useState(true);

  // Fetch companies on component mount
  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        const response = await getCompanies();
        console.log('Companies response:', response);
        
        if (response.success && response.data) {
          setCompanies(response.data);
        } else {
          console.error('Failed to fetch companies:', response.message);
          setCompanies([]);
        }
      } catch (error) {
        console.error('Error fetching companies:', error);
        setCompanies([]);
      } finally {
        setCompaniesLoading(false);
      }
    };
    fetchCompanies();
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = {};
    if (!formData.company) newErrors.company = 'Please select a company';
    if (!formData.username.trim()) newErrors.username = 'Username is required';
    if (!formData.password.trim()) newErrors.password = 'Password is required';
    
    if (Object.keys(newErrors).length === 0) {
      setLoading(true);
      setErrors({});
      
      try {
        const response = await loginUser({
          username: formData.username,
          password: formData.password,
          company: formData.company
        });
        
        console.log('Login response:', response);
        
        if (response.success) {
          const userData = response.data.user;
          console.log('✅ User logged in:', userData);
          
          // ✅ Use login function - NO localStorage
          login(userData);
          
          navigate('/dashboard');
        } else {
          setErrors({ general: response.message || 'Login failed. Please try again.' });
        }
      } catch (error) {
        console.error('Login error:', error);
        setErrors({ general: error.message || 'Network error. Please try again.' });
      } finally {
        setLoading(false);
      }
    } else {
      setErrors(newErrors);
    }
  };

  return (
    <div 
      className="min-h-screen flex items-center justify-center px-3 sm:px-4 py-3 sm:py-4 bg-cover bg-center bg-no-repeat bg-fixed"
      style={{ backgroundImage: `url(${bgImage})` }}
    >
      <div className="w-full max-w-sm sm:max-w-md md:max-w-2xl lg:max-w-3xl bg-white shadow-2xl overflow-hidden animate-fade-in-up">
        <div className="flex flex-col md:flex-row lg:flex-row">
          <div className="hidden md:flex md:w-2/5 lg:w-3/5 bg-white">
            <img 
              src={sideImage} 
              alt="Temperature Monitoring" 
              className="w-full h-full object-cover"
            />
          </div>

          <div className="w-full md:w-3/5 lg:w-3/5 flex items-center justify-center px-4 sm:px-6 py-4 sm:py-4">
            <div className="w-full max-w-xs sm:max-w-sm">
              <div className="flex items-center justify-between mb-2">
                <img 
                  src={logo} 
                  alt="Sabroso IoT" 
                  className="h-8 sm:h-10 w-auto animate-bounce-in" 
                />
                <img 
                  src={logoSabir} 
                  alt="Sabir" 
                  className="h-8 sm:h-10 w-auto animate-bounce-in" 
                />
              </div>

              <h1 className="text-lg sm:text-xl text-gray-800 mb-0.5" style={{ fontWeight: 600 }}>
                Login
              </h1>
              <p className="text-gray-600 text-[10px] sm:text-[11px] mb-1.5 sm:mb-2" style={{ fontWeight: 500 }}>
                Welcome back! Please login to your account.
              </p>

              {errors.general && (
                <div className="mb-2 p-2 bg-red-50 border border-red-200 rounded-lg animate-shake">
                  <p className="text-[10px] sm:text-xs text-red-600">{errors.general}</p>
                </div>
              )}

              <form onSubmit={handleSubmit}>
                <div className="mb-1 animate-fade-in-up">
                  <label className="block text-[10px] sm:text-[11px] text-gray-600 mb-0.5 sm:mb-1" style={{ fontWeight: 600 }}>
                    Company <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <select
                      name="company"
                      value={formData.company}
                      onChange={handleChange}
                      onFocus={() => setIsDropdownOpen(true)}
                      onBlur={() => setIsDropdownOpen(false)}
                      className={`w-full px-3 py-1 sm:py-1 border text-sm transition-all duration-300 appearance-none cursor-pointer ${
                        !formData.company && errors.company
                          ? 'border-red-500 focus:ring-red-500' 
                          : formData.company 
                            ? 'border-green-500 focus:ring-green-500' 
                            : 'border-gray-400 focus:ring-red-500'
                      } focus:outline-none focus:ring-2 focus:border-transparent bg-white ${
                        isDropdownOpen ? 'ring-2 ring-blue-500 border-transparent' : ''
                      }`}
                      disabled={companiesLoading}
                    >
                      <option value="">
                        {companiesLoading ? 'Loading companies...' : 'Select a company'}
                      </option>
                      {companies.map(company => (
                        <option key={company.id} value={company.name}>
                          {company.name}
                        </option>
                      ))}
                    </select>
                    <div className={`absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none transition-transform duration-300 ${
                      isDropdownOpen ? 'rotate-180' : ''
                    }`}>
                      <svg className="h-3 w-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>
                  {errors.company && (
                    <p className="mt-0.5 text-[9px] text-red-500 animate-shake">{errors.company}</p>
                  )}
                </div>

                <div className="mb-1 animate-fade-in-up">
                  <label className="block text-[10px] sm:text-[11px] font-medium text-gray-600 mb-0.5 sm:mb-1" style={{ fontWeight: 600 }}>
                    Username <span className="text-red-500">*</span>
                  </label>
                  <input
                    name="username"
                    type="text"
                    value={formData.username}
                    onChange={handleChange}
                    placeholder="Enter your username"
                    className={`w-full px-3 py-1 sm:py-1 border text-sm transition-all duration-300 bg-white ${
                      !formData.username && errors.username
                        ? 'border-red-500 focus:ring-red-500' 
                        : formData.username 
                          ? 'border-green-500 focus:ring-green-500' 
                          : 'border-gray-300 focus:ring-red-500'
                    } focus:outline-none focus:ring-2 focus:border-transparent`}
                  />
                  {errors.username && (
                    <p className="mt-0.5 text-[9px] text-red-500 animate-shake">{errors.username}</p>
                  )}
                </div>

                <div className="mb-1 animate-fade-in-up">
                  <label className="block text-[10px] sm:text-[11px] font-medium text-gray-600 mb-0.5 sm:mb-1">
                    Password <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="Enter your password"
                      className={`w-full px-3 py-1 sm:py-1 border text-sm transition-all duration-300 bg-white ${
                        !formData.password && errors.password
                          ? 'border-red-500 focus:ring-red-500' 
                          : formData.password 
                            ? 'border-green-500 focus:ring-green-500' 
                            : 'border-gray-300 focus:ring-red-500'
                      } focus:outline-none focus:ring-2 focus:border-transparent pr-8`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-all duration-200 hover:scale-110"
                    >
                      {showPassword ? (
                        <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      ) : (
                        <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                        </svg>
                      )}
                    </button>
                  </div>
                  {errors.password && (
                    <p className="mt-0.5 text-[9px] text-red-500 animate-shake">{errors.password}</p>
                  )}
                </div>

                <div className="mt-4 sm:mt-4">
                  <button
                    type="submit"
                    disabled={loading}
                    className={`w-full max-w-[130px] sm:max-w-[150px] py-1.5 sm:py-2 px-3 sm:px-4 text-xs sm:text-sm font-semibold text-white bg-gradient-to-r from-purple-600 to-indigo-600 focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] shadow-md hover:shadow-lg mx-auto block flex items-center justify-center gap-2 ${
                      loading ? 'opacity-70 cursor-not-allowed' : ''
                    }`}
                  >
                    {loading ? (
                      <>
                        <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Loading...
                      </>
                    ) : (
                      'Sign in'
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;