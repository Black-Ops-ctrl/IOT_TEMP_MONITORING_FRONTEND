// src/config/routes.js
export const ROLE_PERMISSIONS = {
    ADMIN: {
        allowedRoutes: [
            'dashboard',
            'live-report',
            'historical',
            'device-management',
            'user-management'
        ]
    },
    OPERATIONS: {
        allowedRoutes: [
            'dashboard',
            'live-report',
            'historical',
            'device-management'
        ]
    },
    VIEW_ONLY: {
        allowedRoutes: [
            'dashboard',
            'live-report',
            'historical'
        ]
    }
};

export const getMenuItems = (role) => {
    const rolePermissions = ROLE_PERMISSIONS[role] || ROLE_PERMISSIONS.VIEW_ONLY;
    
    // ✅ SIRF MAIN PAGES - Sub-pages nahi dikhenge
    const allMenus = [
        { id: 'dashboard', label: 'Dashboard', icon: '📊', path: '/dashboard' },
        { id: 'live-report', label: 'Live Report', icon: '📈', path: '/live-report' },
        { id: 'historical', label: 'Historical', icon: '📅', path: '/historical' },
        { id: 'device-management', label: 'Device Management', icon: '🖥️', path: '/device-management' },
        { id: 'user-management', label: 'User Management', icon: '👥', path: '/user-management' }
    ];
    
    return allMenus.filter(menu => rolePermissions.allowedRoutes.includes(menu.id));
};

export const isRouteAllowed = (role, routePath) => {
    const rolePermissions = ROLE_PERMISSIONS[role] || ROLE_PERMISSIONS.VIEW_ONLY;
    const routeMap = {
        '/dashboard': 'dashboard',
        '/live-report': 'live-report',
        '/historical': 'historical',
        '/device-management': 'device-management',
        '/device-management/freezers': 'device-management',
        '/device-management/sensors': 'device-management',
        '/device-management/regions': 'device-management',
        '/device-management/cities': 'device-management',
        '/device-management/shops': 'device-management',
        '/user-management': 'user-management',
        '/user-management/users': 'user-management'
    };
    
    const routeId = routeMap[routePath];
    if (!routeId) return false;
    return rolePermissions.allowedRoutes.includes(routeId);
};