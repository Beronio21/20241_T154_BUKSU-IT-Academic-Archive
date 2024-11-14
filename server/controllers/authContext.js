import React, { createContext, useContext, useState } from 'react';

const AuthContext = createContext();

// Custom hook to access AuthContext
export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem('token'));
    const [data, setData] = useState(null);

    // Login function to store token and update auth state
    const login = (token) => {
        localStorage.setItem('token', token);
        setIsAuthenticated(true);
    };

    // Logout function to remove token and update auth state
    const logout = () => {
        localStorage.removeItem('token');
        setIsAuthenticated(false);
        setData(null); // Clear any protected data when logged out
    };

    // Fetch protected data function for accessing secured API endpoints
    const fetchProtectedData = async () => {
        const token = localStorage.getItem('token');
        if (!token) {
            console.error("No token found");
            return;
        }

        try {
            const response = await fetch('http://localhost:5000/api/protected-endpoint', {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                throw new Error("Failed to fetch protected data");
            }

            const result = await response.json();
            setData(result);
        } catch (error) {
            console.error("Error fetching protected data:", error);
        }
    };

    return (
        <AuthContext.Provider value={{ isAuthenticated, login, logout, data, fetchProtectedData }}>
            {children}
        </AuthContext.Provider>
    );
};
