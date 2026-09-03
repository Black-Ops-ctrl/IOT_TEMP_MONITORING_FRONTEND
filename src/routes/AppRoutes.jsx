import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { isRouteAllowed } from "../config/routes";

// Pages
import Login from '../modules/authentication/pages/Login';
import DashboardPage from '../modules/dashboard/pages/DashboardPage';
import ShopsPage from '../modules/device_management/pages/ShopsPage';
import FreezersPage from '../modules/device_management/pages/FreezersPage';
import SensorsPage from '../modules/device_management/pages/SensorsPage';
import RegionsPage from '../modules/device_management/pages/RegionsPage';
import CitiesPage from '../modules/device_management/pages/CitiesPage';
import LiveReportPage from '../modules/live_report/pages/LiveReportPage';
import HistoricalPage from '../modules/historical/pages/HistoricalPage';
import UsersPage from '../modules/user_management/pages/UsersPage';

// ============================================
// ✅ PROTECTED ROUTE COMPONENT
// ============================================
const ProtectedRoute = ({ children, requiredPath }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }
  
  // ✅ Check user from state only (no localStorage)
  if (!user) {
    console.log('🔒 No user found, redirecting to login');
    return <Navigate to="/login" replace />;
  }
  
  // Check if user has access to this route
  const userRole = user.role_name || 'VIEW_ONLY';
  if (requiredPath && !isRouteAllowed(userRole, requiredPath)) {
    console.log('🚫 Role not authorized:', userRole, 'for path:', requiredPath);
    return <Navigate to="/dashboard" replace />;
  }
  
  return children;
};

// ============================================
// ✅ PUBLIC ROUTE COMPONENT
// ============================================
const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
      </div>
    );
  }
  
  // ✅ If user exists, redirect to dashboard
  if (user) {
    return <Navigate to="/dashboard" replace />;
  }
  
  return children;
};

// ============================================
// ✅ APP ROUTES
// ============================================
const AppRoutes = () => {
  return (
    <Routes>
      {/* Public Routes - Login */}
      <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
      
      {/* Protected Routes - Dashboard */}
      <Route path="/dashboard" element={
        <ProtectedRoute requiredPath="/dashboard">
          <DashboardPage />
        </ProtectedRoute>
      } />
      
      {/* Live Report */}
      <Route path="/live-report" element={
        <ProtectedRoute requiredPath="/live-report">
          <LiveReportPage />
        </ProtectedRoute>
      } />
      
      {/* Historical */}
      <Route path="/historical" element={
        <ProtectedRoute requiredPath="/historical">
          <HistoricalPage />
        </ProtectedRoute>
      } />
      
      {/* Device Management Routes */}
      <Route path="/device-management/shops" element={
        <ProtectedRoute requiredPath="/device-management/shops">
          <ShopsPage />
        </ProtectedRoute>
      } />
      
      <Route path="/device-management/freezers" element={
        <ProtectedRoute requiredPath="/device-management/freezers">
          <FreezersPage />
        </ProtectedRoute>
      } />
      
      <Route path="/device-management/sensors" element={
        <ProtectedRoute requiredPath="/device-management/sensors">
          <SensorsPage />
        </ProtectedRoute>
      } />
      
      <Route path="/device-management/regions" element={
        <ProtectedRoute requiredPath="/device-management/regions">
          <RegionsPage />
        </ProtectedRoute>
      } />
      
      <Route path="/device-management/cities" element={
        <ProtectedRoute requiredPath="/device-management/cities">
          <CitiesPage />
        </ProtectedRoute>
      } />
      
      <Route path="/device-management" element={
        <ProtectedRoute requiredPath="/device-management">
          <Navigate to="/device-management/regions" replace />
        </ProtectedRoute>
      } />
      
      {/* User Management Routes */}
      <Route path="/user-management/users" element={
        <ProtectedRoute requiredPath="/user-management/users">
          <UsersPage />
        </ProtectedRoute>
      } />
      
      <Route path="/user-management" element={
        <ProtectedRoute requiredPath="/user-management">
          <Navigate to="/user-management/users" replace />
        </ProtectedRoute>
      } />
      
      {/* Default Routes - Root always goes to Login */}
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
};

export default AppRoutes;