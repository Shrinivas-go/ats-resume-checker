import { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = 'http://localhost:5000';
// const API_URL = 'https://ats-backend-production-c4ad.up.railway.app';

const AuthContext = createContext(undefined);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Configure axios defaults
    useEffect(() => {
        axios.defaults.withCredentials = true; // Send cookies with requests
    }, []);

    // Check if user is logged in on mount
    useEffect(() => {
        const checkAuth = async () => {
            try {
                // Try to get current user - cookie will be sent automatically
                const response = await axios.get(`${API_URL}/auth/me`);
                if (response.data.success) {
                    setUser(response.data.user);
                }
            } catch (err) {
                // If /me fails (401), try to refresh the token
                // We don't check for local token existence anymore since it's a cookie
                const refreshed = await refreshToken();
                if (!refreshed) {
                    setUser(null);
                }
            } finally {
                setLoading(false);
            }
        };

        checkAuth();
    }, []);

    const register = async (name, email, password) => {
        try {
            setError(null);
            const response = await axios.post(`${API_URL}/auth/register`, {
                name,
                email,
                password,
            });

            if (response.data.success) {
                setUser(response.data.user);
                // Cookies are set by the backend automatically
                return { success: true };
            }
            return { success: false, message: response.data.message };
        } catch (err) {
            const message = err.response?.data?.message || 'Registration failed';
            setError(message);
            return { success: false, message };
        }
    };

    const login = async (email, password) => {
        try {
            setError(null);
            const response = await axios.post(`${API_URL}/auth/login`, {
                email,
                password,
            });

            if (response.data.success) {
                setUser(response.data.user);
                // Cookies are set by the backend automatically
                return { success: true };
            }
            return { success: false, message: response.data.message };
        } catch (err) {
            const message = err.response?.data?.message || 'Login failed';
            setError(message);
            return { success: false, message };
        }
    };

    const logout = async () => {
        try {
            await axios.post(`${API_URL}/auth/logout`);
        } catch (err) {
            // Ignore errors on logout
        } finally {
            setUser(null);
            // Cookies are cleared by the backend
        }
    };

    const refreshToken = async () => {
        try {
            // Cookie is sent automatically
            const response = await axios.post(`${API_URL}/auth/refresh`);

            if (response.data.success) {
                // New access token cookie set by backend
                // If we need to update user state immediately, we could do it here
                // but usually the next request will just work.
                // We might want to reload the user if needed, but for now just returning true.
                return true;
            }
            return false;
        } catch (err) {
            return false;
        }
    };

    const googleLogin = async (credential) => {
        try {
            setError(null);
            const response = await axios.post(`${API_URL}/auth/google`, {
                credential,
            });

            if (response.data.success) {
                setUser(response.data.user);
                // Cookies are set by the backend automatically
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
        refreshToken,
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
