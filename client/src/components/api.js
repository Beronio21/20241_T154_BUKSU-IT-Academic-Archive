import axios from 'axios';

const api = axios.create({
    baseURL: "http://localhost:5000/auth/",
    // withCredentials: true,
});

export const googleAuth = (code) => api.get(`/google?code=${code}`);