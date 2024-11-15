// src/components/ProtectedRoute.jsx
import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../AuthContext';

const ProtectedRoute = ({ requiredRole }) => {
    const { isAuthenticated, userType } = useAuth(); // Assuming userType is stored in context

    // If not authenticated, redirect to login
    if (!isAuthenticated) {
        return <Navigate to="/login" />;
    }

    // If userType does not match requiredRole, redirect to unauthorized page or home
    if (requiredRole && userType !== requiredRole) {
        return <Navigate to="/" />; // Or redirect to an 'unauthorized' page
    }

    return <Outlet />; // Render the protected route
};

export default ProtectedRoute;
