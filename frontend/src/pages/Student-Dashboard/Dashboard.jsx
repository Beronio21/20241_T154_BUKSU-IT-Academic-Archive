import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import './Dashboard.css';
import { Doughnut, Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, ArcElement);

const Dashboard = () => {
    const [statistics, setStatistics] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const statisticsGridRef = useRef(null);
    const [canScrollLeft, setCanScrollLeft] = useState(false);
    const [canScrollRight, setCanScrollRight] = useState(false);

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

    // Check scrollability
    useEffect(() => {
        const checkScroll = () => {
            const grid = statisticsGridRef.current;
            if (grid) {
                setCanScrollLeft(grid.scrollLeft > 0);
                setCanScrollRight(grid.scrollLeft + grid.clientWidth < grid.scrollWidth - 1);
            }
        };
        checkScroll();
        const grid = statisticsGridRef.current;
        if (grid) {
            grid.addEventListener('scroll', checkScroll);
            window.addEventListener('resize', checkScroll);
        }
        return () => {
            if (grid) grid.removeEventListener('scroll', checkScroll);
            window.removeEventListener('resize', checkScroll);
        };
    }, [statistics]);

    const scrollGrid = (direction) => {
        const grid = statisticsGridRef.current;
        if (grid) {
            const scrollAmount = grid.clientWidth * 0.8;
            grid.scrollBy({ left: direction === 'right' ? scrollAmount : -scrollAmount, behavior: 'smooth' });
        }
    };

    // Modern color palettes
    const lineColor = 'rgba(26, 117, 255, 0.95)';
    const linePointColor = '#1565c0';
    const lineBgGradient = 'rgba(26, 117, 255, 0.10)';
    const doughnutColors = [
        '#1a75ff', '#4d94ff', '#00d4ff', '#00b8d4', '#00e676', '#ffc107', '#dc3545', '#6f42c1', '#20c997', '#fd7e14'
    ];

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
            {/* Charts Row at the Top */}
            <div className="charts-flex" style={{ display: 'flex', gap: '2.5rem', alignItems: 'stretch', justifyContent: 'center', flexWrap: 'wrap', marginBottom: '2.5rem' }}>
                {/* Line Chart - Left (Wider) */}
                <div style={{ flex: 2, minWidth: 350, maxWidth: 700, background: 'white', borderRadius: 16, boxShadow: '0 4px 16px rgba(26,117,255,0.08)', padding: '2rem 2.5rem', display: 'flex', flexDirection: 'column', alignItems: 'flex-start', justifyContent: 'center', height: 320, minHeight: 320 }}>
                    <h4 style={{ marginBottom: 24, color: '#1a75ff', fontWeight: 700, fontSize: '1.25rem' }}>Capstone Projects Per Year</h4>
                    <Line
                        data={{
                            labels: Object.keys(statistics.yearlyApprovals).sort(),
                            datasets: [
                                {
                                    label: 'Projects',
                                    data: Object.keys(statistics.yearlyApprovals).sort().map(year => statistics.yearlyApprovals[year]),
                                    fill: true,
                                    backgroundColor: lineBgGradient,
                                    borderColor: lineColor,
                                    borderWidth: 3,
                                    pointBackgroundColor: linePointColor,
                                    pointBorderColor: '#fff',
                                    pointRadius: 6,
                                    pointHoverRadius: 8,
                                    pointBorderWidth: 2,
                                    tension: 0.4, // smooth line
                                },
                            ],
                        }}
                        options={{
                            responsive: true,
                            maintainAspectRatio: false,
                            plugins: {
                                legend: { display: false },
                                title: { display: false },
                                tooltip: {
                                    enabled: true,
                                    callbacks: {
                                        label: function(context) {
                                            return ` ${context.parsed.y} projects`;
                                        }
                                    }
                                },
                            },
                            scales: {
                                x: {
                                    title: { display: true, text: 'Academic Year', color: '#1a75ff', font: { weight: 'bold' } },
                                    ticks: { color: '#333', font: { size: 13 } },
                                    grid: { color: '#e6f0ff' },
                                },
                                y: {
                                    title: { display: true, text: 'Number of Projects', color: '#1a75ff', font: { weight: 'bold' } },
                                    beginAtZero: true,
                                    ticks: { stepSize: 1, color: '#333', font: { size: 13 } },
                                    grid: { color: '#f4f8ff' },
                                },
                            },
                        }}
                        height={256}
                    />
                </div>
                {/* Doughnut Chart - Right (Compact, Same Height) */}
                <div style={{ flex: 1, minWidth: 200, maxWidth: 320, background: 'white', borderRadius: 16, boxShadow: '0 4px 16px rgba(26,117,255,0.08)', padding: '2rem 1.5rem', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: 320, minHeight: 320 }}>
                    <h4 style={{ marginBottom: 18, color: '#1a75ff', fontWeight: 700, fontSize: '1.1rem', textAlign: 'center' }}>Capstone Project Categories</h4>
                    <Doughnut
                        data={{
                            labels: Object.keys(statistics.categoryCounts),
                            datasets: [
                                {
                                    label: 'Categories',
                                    data: Object.values(statistics.categoryCounts),
                                    backgroundColor: Object.keys(statistics.categoryCounts).map((_, i) => doughnutColors[i % doughnutColors.length]),
                                    borderColor: '#fff',
                                    borderWidth: 2,
                                },
                            ],
                        }}
                        options={{
                            responsive: true,
                            maintainAspectRatio: false,
                            cutout: '70%',
                            plugins: {
                                legend: { position: 'bottom', labels: { boxWidth: 14, font: { size: 12 } } },
                                title: { display: false },
                                tooltip: {
                                    callbacks: {
                                        label: function(context) {
                                            const label = context.label || '';
                                            const value = context.parsed;
                                            const total = context.dataset.data.reduce((a, b) => a + b, 0);
                                            const percent = ((value / total) * 100).toFixed(1);
                                            return ` ${label}: ${value} (${percent}%)`;
                                        }
                                    }
                                },
                            },
                        }}
                        height={256}
                    />
                </div>
            </div>
            {/* Summary/Stat Cards at the Bottom */}
            <div className="statistics-header">
                <h3>Summary</h3>
            </div>
            <div className="statistics-grid" ref={statisticsGridRef} style={{ flexDirection: 'row', gap: '1.5rem', marginBottom: 0 }}>
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
                        {Object.keys(statistics.yearlyApprovals).length > 0 
                            ? Math.max(...Object.keys(statistics.yearlyApprovals).map(Number))
                            : 'No Data'}
                    </div>
                    <div className="stat-label">Most recent submissions</div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard; 