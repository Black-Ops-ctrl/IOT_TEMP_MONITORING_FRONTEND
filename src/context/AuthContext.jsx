import React, { createContext, useState, useContext, useEffect } from 'react';
import { logoutUser } from '../services/api/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(false);

    // ✅ Always start with no user on page load
    useEffect(() => {
        setUser(null);
        setLoading(false);
    }, []);

    // ✅ Login function - sets user
    const login = (userData) => {
        setUser(userData);
    };

    // ✅ Logout function - clears user
    const logout = async () => {
        try {
            await logoutUser();
        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            setUser(null);
        }
    };

    return (
        <AuthContext.Provider value={{ user, setUser, loading, logout, login }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};