// src/components/AdminDashboard.jsx
import React from 'react';
import { Link } from 'react-router-dom';

const AdminDashboard = () => {
    return (
        <div className="admin-dashboard">
            <h2>Admin Dashboard</h2>
            <ul>
                <li><Link to="/manage-users">Manage Users</Link></li>
                <li><Link to="/manage-thesis">Manage Thesis Submissions</Link></li>
                <li><Link to="/settings">Settings</Link></li>
                <li><Link to="/logout">Log Out</Link></li>
            </ul>
            {/* Add additional admin features here */}
        </div>
    );
};

export default AdminDashboard;
