import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Bar, Pie } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, ArcElement, Title, Tooltip, Legend } from 'chart.js';
import './Dashboard.css';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

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

    // Prepare data for the bar chart (Approvals by Year)
    const yearlyApprovalsData = {
        labels: Object.keys(statistics.yearlyApprovals).sort((a, b) => b - a),
        datasets: [
            {
                label: 'Approved Capstones',
                data: Object.keys(statistics.yearlyApprovals)
                    .sort((a, b) => b - a)
                    .map(year => statistics.yearlyApprovals[year]),
                backgroundColor: 'rgba(75, 192, 192, 0.6)',
                borderColor: 'rgba(75, 192, 192, 1)',
                borderWidth: 1,
            },
        ],
    };

    // Prepare data for the pie chart (Capstones by Category)
    const categoryCountsData = {
        labels: Object.keys(statistics.categoryCounts),
        datasets: [
            {
                label: 'Submissions by Category',
                data: Object.values(statistics.categoryCounts),
                backgroundColor: [
                    'rgba(255, 99, 132, 0.6)',
                    'rgba(54, 162, 235, 0.6)',
                    'rgba(255, 206, 86, 0.6)',
                    'rgba(75, 192, 192, 0.6)',
                    'rgba(153, 102, 255, 0.6)',
                ],
                borderColor: [
                    'rgba(255, 99, 132, 1)',
                    'rgba(54, 162, 235, 1)',
                    'rgba(255, 206, 86, 1)',
                    'rgba(75, 192, 192, 1)',
                    'rgba(153, 102, 255, 1)',
                ],
                borderWidth: 1,
            },
        ],
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

            <div className="chart-container">
                <h3>Approvals by Year</h3>
                <div className="chart">
                    <Bar 
                        data={yearlyApprovalsData} 
                        options={{
                            responsive: true,
                            plugins: {
                                legend: {
                                    position: 'top',
                                },
                                title: {
                                    display: true,
                                    text: 'Approved Capstones by Year',
                                },
                            },
                        }} 
                    />
                </div>
            </div>

            <div className="chart-container">
                <h3>Capstones by Category</h3>
                <div className="chart">
                    <Pie 
                        data={categoryCountsData} 
                        options={{
                            responsive: true,
                            plugins: {
                                legend: {
                                    position: 'top',
                                },
                                title: {
                                    display: true,
                                    text: 'Submissions by Category',
                                },
                            },
                        }} 
                    />
                </div>
            </div>
        </div>
    );
};

export default Dashboard; 