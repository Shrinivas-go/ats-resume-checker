import { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import axios from 'axios';

// Use environment variable for API URL, fallback to localhost for development
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const AuthContext = createContext(undefined);

/**
 * Simplified AuthContext - Production-grade, predictable auth
 * 
 * Principles:
 * - Single source of truth for user state
 * - No complex auto-refresh logic (refresh on explicit actions only)
 * - Clear loading states
 * - Predictable behavior
 */
export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Axios instance with credentials
    const api = useRef(
        axios.create({
            baseURL: API_URL,
            withCredentials: true,
        })
    ).current;

    /**
     * Clear all auth state (internal helper)
     */
    const clearAuth = useCallback(() => {
        setUser(null);
        setError(null);
    }, []);

    /**
     * Logout - clears cookies and state
     */
    const logout = useCallback(async () => {
        try {
            await api.post('/auth/logout');
        } catch {
            // Ignore errors - still clear local state
        }
        clearAuth();
    }, [api, clearAuth]);

    /**
     * Check auth status on mount
     * Simple: try /auth/me, if fails set user to null
     */
    useEffect(() => {
        const checkAuth = async () => {
            try {
                const response = await api.get('/auth/me');
                if (response.data.success && response.data.user) {
                    setUser(response.data.user);
                } else {
                    setUser(null);
                }
            } catch (err) {
                // If access token expired, try to refresh once
                if (err.response?.status === 401) {
                    try {
                        const refreshResponse = await api.post('/auth/refresh');
                        if (refreshResponse.data.success) {
                            // Retry getting user after refresh
                            const retryResponse = await api.get('/auth/me');
                            if (retryResponse.data.success && retryResponse.data.user) {
                                setUser(retryResponse.data.user);
                            } else {
                                setUser(null);
                            }
                        } else {
                            setUser(null);
                        }
                    } catch {
                        // Refresh failed - user is not logged in
                        setUser(null);
                    }
                } else {
                    setUser(null);
                }
            } finally {
                setLoading(false);
            }
        };

        checkAuth();
    }, [api]);

    /**
     * Register new user
     */
    const register = async (name, email, password) => {
        try {
            setError(null);
            console.log('DEBUG: API_URL is:', API_URL);
            console.log('DEBUG: Calling /auth/register with:', { name, email });
            const response = await api.post('/auth/register', { name, email, password });
            console.log('DEBUG: Response:', response.data);

            if (response.data.success) {
                setUser(response.data.user);
                return { success: true };
            }
            return { success: false, message: response.data.message };
        } catch (err) {
            console.error('DEBUG: Error:', err);
            console.error('DEBUG: Error response:', err.response?.data);
            const message = err.response?.data?.message || 'Registration failed';
            setError(message);
            return { success: false, message };
        }
    };

    /**
     * Login user
     */
    const login = async (email, password) => {
        try {
            setError(null);
            const response = await api.post('/auth/login', { email, password });

            if (response.data.success) {
                setUser(response.data.user);
                return { success: true };
            }
            return { success: false, message: response.data.message };
        } catch (err) {
            const message = err.response?.data?.message || 'Login failed';
            setError(message);
            return { success: false, message };
        }
    };

    /**
     * Google OAuth login
     */
    const googleLogin = async (credential) => {
        try {
            setError(null);
            const response = await api.post('/auth/google', { credential });

            if (response.data.success) {
                setUser(response.data.user);
                return { success: true, isNewUser: response.data.isNewUser };
            }
            return { success: false, message: response.data.message };
        } catch (err) {
            const message = err.response?.data?.message || 'Google login failed';
            setError(message);
            return { success: false, message };
        }
    };

    const value = {
        user,
        loading,
        error,
        isAuthenticated: !!user,
        register,
        login,
        logout,
        googleLogin,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
