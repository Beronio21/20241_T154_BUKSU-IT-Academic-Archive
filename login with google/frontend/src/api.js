import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:8080',
    headers: {
        'Content-Type': 'application/json',
    }
});

// Add a request interceptor to include the token dynamically
api.interceptors.request.use(config => {
    const token = JSON.parse(localStorage.getItem('user-info'))?.token;
    if (token) {
        config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
}, error => {
    return Promise.reject(error);
});

export const googleAuth = async (access_token) => {
    try {
        console.log('Sending auth request with access token:', access_token);
        const response = await api.post('/auth/google', { access_token });
        return response.data;
    } catch (error) {
        console.error('API Error:', error.response?.data || error);
        throw error;
    }
};

export const emailLogin = async (email, password) => {
    try {
        const response = await api.post('/api/students/login', { email, password });
        return response.data;
    } catch (error) {
        console.error('Auth error:', error.response?.data || error);
        throw error;
    }
};

export const registerInstructor = async (instructorData) => {
    try {
        const response = await api.post('/api/instructors/register', instructorData);
        return response.data;
    } catch (error) {
        console.error('Registration error:', error.response?.data || error);
        throw error;
    }
};

export const registerStudent = async (studentData) => {
    try {
        const response = await api.post('/api/students/register', studentData);
        return response.data;
    } catch (error) {
        console.error('Registration error:', error.response?.data || error);
        throw error;
    }
};

export const registerAdmin = async (adminData) => {
    try {
        const response = await api.post('/api/admins/register', adminData);
        return response.data;
    } catch (error) {
        console.error('Registration error:', error.response?.data || error);
        throw error;
    }
};

export default api;