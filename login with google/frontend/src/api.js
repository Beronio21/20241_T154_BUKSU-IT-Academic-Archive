import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:8080',
    headers: {
        'Content-Type': 'application/json'
    }
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
        const response = await api.post('/auth/login', { email, password });
        return response.data;
    } catch (error) {
        console.error('Auth error:', error.response?.data || error);
        throw error;
    }
};

export default api;