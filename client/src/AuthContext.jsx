import React, { createContext, useContext, useState, useEffect } from 'react';

// Create Context for Auth
const AuthContext = createContext();

// Hook to use AuthContext
export const useAuth = () => {
    return useContext(AuthContext);
};

// AuthProvider Component
export const AuthProvider = ({ children }) => {
    // State to store authentication and user type
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [userType, setUserType] = useState(null); // Store user role (e.g., student, instructor, admin)

    // Initialize auth state from localStorage
    useEffect(() => {
        const token = localStorage.getItem('token');
        const storedUserType = localStorage.getItem('userType');

        if (token) {
            setIsAuthenticated(true);
            setUserType(storedUserType);
        }
    }, []);

    // Login function (updates token and userType)
    const login = (token, type) => {
        localStorage.setItem('token', token);
        localStorage.setItem('userType', type);
        setIsAuthenticated(true);
        setUserType(type);
    };

    // Logout function
    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('userType');
        setIsAuthenticated(false);
        setUserType(null);
    };

    return (
        <AuthContext.Provider value={{ isAuthenticated, userType, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};
