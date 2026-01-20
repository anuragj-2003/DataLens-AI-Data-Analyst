import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../api';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    const fetchUser = async () => {
        try {
            const res = await api.get('/auth/me');
            setUser(res.data);
        } catch (err) {
            // If 401 (Unauthorized), the token is likely expired or invalid.
            if (err.response?.status === 401) {
                console.warn("Session expired or invalid token. Clearing session.");
                localStorage.removeItem('token');
                setUser(null);
            } else {
                console.error("Failed to fetch user:", err.message);
                if (err.code === 'ECONNABORTED') {
                    // Timeout handling if needed
                }
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            fetchUser(token);
        } else {
            setLoading(false);
        }
    }, []);

    const login = async (username, password) => {
        // Send as JSON, which express.json() handles by default
        const res = await api.post('/auth/login', { username, password });
        const token = res.data.access_token;
        localStorage.setItem('token', token);
        await fetchUser(token);
    };

    const signup = async (email, password, fullName) => {
        await api.post('/auth/signup', { email, password, full_name: fullName });
        // Don't auto-login, wait for OTP if enforced, or just allow login
        // For now, let's auto-login to simplify, or redirect to OTP logic in UI
    };

    const verifyOtp = async (email, otp) => {
        return await api.post('/auth/verify-otp', { email, otp });
    };

    const forgotPassword = async (email) => {
        return await api.post('/auth/forgot-password', { email });
    };

    const resetPassword = async (email, otp, newPassword) => {
        return await api.post('/auth/verify-otp', { email, otp, new_password: newPassword });
    };

    const logout = () => {
        localStorage.removeItem('token');
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, isAuthenticated: !!user, loading, login, signup, logout, verifyOtp, forgotPassword, resetPassword }}>
            {children}
        </AuthContext.Provider>
    );
};
