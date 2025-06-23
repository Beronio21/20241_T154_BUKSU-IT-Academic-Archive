import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Dashboard.css';
import { Bar, Pie } from 'react-chartjs-2';
import { Chart, BarElement, CategoryScale, LinearScale, ArcElement, Tooltip, Legend } from 'chart.js';
import PropTypes from 'prop-types';

Chart.register(BarElement, CategoryScale, LinearScale, ArcElement, Tooltip, Legend);

const Dashboard = ({ role = "student" }) => {
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

    // Responsive container style
    const chartBoxStyle = {
        flex: '1 1 350px',
        minWidth: '320px',
        background: '#fff',
        borderRadius: '12px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
        padding: '24px',
        margin: '10px 0'
    };

    return (
        <div className="statistics-container">
            <div className="statistics-header">
                <h3>Summary</h3>
            </div>

            <div className="statistics-grid">
                <div className="stat-card">
                    <h3>Total Capstones</h3>
                    <div className="stat-number">{statistics.totalCapstones}</div>
                    <div className="stat-label">Total submissions</div>
                </div>

                {role === "teacher" && (
                    <div className="stat-card">
                        <h3>Approved Capstones</h3>
                        <div className="stat-number">
                            {Object.values(statistics.yearlyApprovals).reduce((a, b) => a + b, 0)}
                        </div>
                        <div className="stat-label">Total approved submissions</div>
                    </div>
                )}

                <div className="stat-card">
                    <h3>Categories</h3>
                    <div className="stat-number">{Object.keys(statistics.categoryCounts).length}</div>
                    <div className="stat-label">Different categories</div>
                </div>

                <div className="stat-card">
                    <h3>Latest Year</h3>
                    <div className="stat-number">
                        {Object.keys(statistics.yearlyApprovals).length > 0 
                            ? Math.max(...Object.keys(statistics.yearlyApprovals).map(Number))
                            : 'No Data'}
                    </div>
                    <div className="stat-label">Most recent submissions</div>
                </div>
            </div>

            {/* Graphs Section */}
            <div className="chart-dashboard" style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: '40px',
                marginTop: '40px',
                justifyContent: 'center'
            }}>
                {role === "teacher" && (
                    <div style={chartBoxStyle}>
                        <h4 style={{ marginBottom: '20px' }}>Approvals by Year</h4>
                        <Bar
                            data={{
                                labels: Object.keys(statistics.yearlyApprovals).sort(),
                                datasets: [
                                    {
                                        label: 'Approved Capstones',
                                        data: Object.keys(statistics.yearlyApprovals).sort().map(year => statistics.yearlyApprovals[year]),
                                        backgroundColor: 'rgba(54, 162, 235, 0.7)',
                                        borderRadius: 8,
                                    }
                                ]
                            }}
                            options={{
                                responsive: true,
                                plugins: {
                                    legend: { display: false },
                                    tooltip: { enabled: true }
                                },
                                scales: {
                                    x: { title: { display: true, text: 'Year' } },
                                    y: { title: { display: true, text: 'Approvals' }, beginAtZero: true }
                                }
                            }}
                        />
                    </div>
                )}

                {/* Pie Chart: Capstones by Category (shown for both roles) */}
                <div style={chartBoxStyle}>
                    <h4 style={{ marginBottom: '20px' }}>Capstones by Category</h4>
                    <Pie
                        data={{
                            labels: Object.keys(statistics.categoryCounts),
                            datasets: [
                                {
                                    label: 'Capstones',
                                    data: Object.values(statistics.categoryCounts),
                                    backgroundColor: [
                                        '#4a6bff', '#34c759', '#ff9500', '#ff2d55', '#5ac8fa', '#af52de', '#ffd60a'
                                    ],
                                    borderWidth: 1,
                                }
                            ]
                        }}
                        options={{
                            responsive: true,
                            plugins: {
                                legend: { position: 'bottom' },
                                tooltip: { enabled: true }
                            }
                        }}
                    />
                </div>
            </div>

            {/* Only for teacher: Approvals by Year list */}
            {role === "teacher" && (
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
            )}
        </div>
    );
};

Dashboard.propTypes = {
    role: PropTypes.oneOf(['student', 'teacher'])
};

export default Dashboard; 