import React, { createContext, useContext, useState } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [data, setData] = useState(null);

    const fetchProtectedData = async () => {
        const token = localStorage.getItem('token');

        const response = await fetch('http://localhost:5000/api/protected-endpoint', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        const result = await response.json();
        setData(result);
    };

    return (
        <AuthContext.Provider value={{ data, fetchProtectedData }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
