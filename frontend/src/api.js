import axios from 'axios';

// Central API config for backend URL
export const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8080";

// Create axios instance
const axiosInstance = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json'
    }
});

// Email login
export const emailLogin = async (email, password) => {
    try {
        const response = await axiosInstance.post('/auth/login', {
            email,
            password
        });
        return response.data;
    } catch (error) {
        console.error('Auth error:', error.response?.data);
        throw error.response?.data || error;
    }
};

// Google auth
export const googleAuth = async (accessToken) => {
    try {
        const response = await axiosInstance.post('/auth/google', {
            access_token: accessToken
        });
        return response.data;
    } catch (error) {
        console.error('Google auth error:', error.response?.data);
        throw error.response?.data || error;
    }
};

// Verify token
export const verifyToken = async (token) => {
    try {
        const response = await axiosInstance.post('/auth/verify-token', { token });
        return response.data;
    } catch (error) {
        console.error('Token verification error:', error.response?.data);
        throw error.response?.data || error;
    }
};

// Add auth token to requests
export const setAuthToken = (token) => {
    if (token) {
        axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
        delete axiosInstance.defaults.headers.common['Authorization'];
    }
};

export default axiosInstance;