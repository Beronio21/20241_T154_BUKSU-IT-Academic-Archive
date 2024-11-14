// src/components/AdminDashboard.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../AuthContext'; // Import the auth context for logout handling
import { useNavigate } from 'react-router-dom';

const AdminDashboard = () => {
    const { logout } = useAuth(); // Get logout function from the AuthContext
    const navigate = useNavigate(); // Hook for navigation
  
    // Handle Logout
    const handleLogout = () => {
      logout(); // Clear the token and authentication state
      navigate('/'); // Redirect to login page after logout
    };
    return (
        <div className="admin-dashboard">
            <h2>Admin Dashboard</h2>
            <ul>
                <li><Link to="/manage-users">Manage Users</Link></li>
                <li><Link to="/manage-thesis">Manage Thesis Submissions</Link></li>
                <li><Link to="/settings">Settings</Link></li>
                <li><button onClick={handleLogout}>Logout</button></li> {/* Updated logout button */}
            </ul>
            {/* Add additional admin features here */}
        </div>
    );
};

export default AdminDashboard;
