import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Dashboard.css';

const Dashboard = () => {
    const [statistics, setStatistics] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchStatistics = async () => {
            try {
                const response = await axios.get('http://localhost:8080/api/thesis/statistics');
                setStatistics(response.data.data);
                setLoading(false);
            } catch (err) {
                setError('Failed to load statistics. Please try again later.');
                setLoading(false);
            }
        };

        fetchStatistics();
    }, []);

    if (loading) {
        return <div className="loading">Loading statistics...</div>;
    }

    if (error) {
        return <div className="error">{error}</div>;
    }

    if (!statistics) {
        return <div className="error">No statistics available</div>;
    }

    return (
        <div className="statistics-container">
            <div className="statistics-header">
                <h1>Dashboard</h1>
                <p>Overview of capstone submissions and approvals</p>
            </div>

            <div className="statistics-grid">
                <div className="stat-card">
                    <h3>Total Capstones</h3>
                    <div className="stat-number">{statistics.totalCapstones}</div>
                    <div className="stat-label">Total submissions</div>
                </div>

                <div className="stat-card">
                    <h3>Approved Capstones</h3>
                    <div className="stat-number">
                        {Object.values(statistics.yearlyApprovals).reduce((a, b) => a + b, 0)}
                    </div>
                    <div className="stat-label">Total approved submissions</div>
                </div>

                <div className="stat-card">
                    <h3>Categories</h3>
                    <div className="stat-number">{Object.keys(statistics.categoryCounts).length}</div>
                    <div className="stat-label">Different categories</div>
                </div>

                <div className="stat-card">
                    <h3>Latest Year</h3>
                    <div className="stat-number">
                        {Math.max(...Object.keys(statistics.yearlyApprovals).map(Number))}
                    </div>
                    <div className="stat-label">Most recent submissions</div>
                </div>
            </div>

            <div className="chart-container">
                <h3>Approvals by Year</h3>
                <div className="chart">
                    <ul className="category-list">
                        {Object.entries(statistics.yearlyApprovals)
                            .sort(([a], [b]) => b - a)
                            .map(([year, count]) => (
                                <li key={year} className="category-item">
                                    <span className="category-name">{year}</span>
                                    <span className="category-count">{count} approved</span>
                                </li>
                            ))}
                    </ul>
                </div>
            </div>

            <div className="chart-container">
                <h3>Capstones by Category</h3>
                <div className="chart">
                    <ul className="category-list">
                        {Object.entries(statistics.categoryCounts)
                            .sort(([, a], [, b]) => b - a)
                            .map(([category, count]) => (
                                <li key={category} className="category-item">
                                    <span className="category-name">{category}</span>
                                    <span className="category-count">{count} submissions</span>
                                </li>
                            ))}
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default Dashboard; 