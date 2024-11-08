// src/components/DashboardLayout.jsx
import React from 'react';

const DashboardLayout = ({ children }) => {
    return (
        <div>
            <header>
                {/* Dashboard-specific header or logo can be added here if needed */}
                <h1>Your Dashboard</h1>
            </header>
            <main>
                {children}
            </main>
        </div>
    );
};

export default DashboardLayout;
