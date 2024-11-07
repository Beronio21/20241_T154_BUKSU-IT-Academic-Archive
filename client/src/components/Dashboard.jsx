// src/components/Dashboard.jsx
import React from 'react';
import logo from '../images/buksu.jpg'; // Ensure this path is correct
import DashboardLayout from './DashboardLayout'; // Import the new layout

const Dashboard = () => {
    return (
        <DashboardLayout>
            <img src={logo} alt="Logo" style={{ width: '150px', height: 'auto' }} />
            <h2>Welcome to Your Dashboard!</h2>
            {/* Additional dashboard content goes here */}
            <p>This is your dashboard where you can manage your thesis submissions and reviews.</p>
        </DashboardLayout>
    );
};

export default Dashboard;
