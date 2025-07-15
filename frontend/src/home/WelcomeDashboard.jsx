import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './WelcomeDashboard.css';
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

const WelcomeDashboard = () => {
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
    return <div className="no-data">No statistics available</div>;
  }

  return (
    <div className="welcome-dashboard">
      <div className="charts-container">
        <div className="line-chart">
          <h3>Capstone Projects Per Year</h3>
          <Line
            data={{
              labels: Object.keys(statistics.yearlyApprovals).sort(),
              datasets: [
                {
                  label: 'Projects',
                  data: Object.keys(statistics.yearlyApprovals).sort().map(year => statistics.yearlyApprovals[year]),
                  fill: true,
                  backgroundColor: 'rgba(52, 152, 219, 0.15)',
                  borderColor: 'rgba(52, 152, 219, 0.95)',
                  borderWidth: 2, // Thinner border
                  pointBackgroundColor: '#e67e22',
                  pointBorderColor: '#fff',
                  pointRadius: 4, // Smaller points
                  pointHoverRadius: 6,
                  pointBorderWidth: 1,
                  tension: 0.3, // Smoother line
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
                  callbacks: {
                    label: (context) => ` ${context.parsed.y} projects`,
                  },
                },
              },
              scales: {
                x: {
                  title: { display: true, text: 'Year', color: '#1a75ff', font: { size: 16 } },
                  ticks: { color: '#333', font: { size: 14 } }, // Smaller ticks
                  grid: { color: '#e6f0ff' },
                },
                y: {
                  title: { display: true, text: 'Projects', color: '#1a75ff', font: { size: 16 } },
                  beginAtZero: true,
                  ticks: { stepSize: 1, color: '#333', font: { size: 14 } }, // Smaller ticks
                  grid: { color: '#f4f8ff' },
                },
              },
            }}
            height={450} // Increased height
          />
        </div>
        <div className="doughnut-chart">
          <h3>Capstone Project Categories</h3>
          <Doughnut
            data={{
              labels: Object.keys(statistics.categoryCounts),
              datasets: [
                {
                  label: 'Categories',
                  data: Object.values(statistics.categoryCounts),
                  backgroundColor: [
                    '#3498db', '#e67e22', '#2ecc71', '#9b59b6', '#f1c40f',
                    '#e74c3c', '#1abc9c', '#34495e', '#fd79a8', '#00b894',
                  ],
                  borderColor: '#fff',
                  borderWidth: 1, // Thinner border
                },
              ],
            }}
            options={{
              responsive: true,
              maintainAspectRatio: false,
              cutout: '65%', // Smaller hole in the center
              plugins: {
                legend: { 
                  position: 'bottom', 
                  labels: { 
                    boxWidth: 10, // Smaller legend boxes
                    font: { size: 14 } // Larger legend
                  } 
                },
                title: { display: false },
                tooltip: {
                  callbacks: {
                    label: (context) => {
                      const label = context.label || '';
                      const value = context.parsed;
                      const total = context.dataset.data.reduce((a, b) => a + b, 0);
                      const percent = ((value / total) * 100).toFixed(1);
                      return ` ${label}: ${value} (${percent}%)`;
                    },
                  },
                },
              },
            }}
            height={450} // Increased height
          />
        </div>
      </div>
      <div className="stats-grid">
        <div className="stat-card">
          <h3>Total Capstones</h3>
          <div className="stat-number">{statistics.totalCapstones}</div>
          <div className="stat-detail">Total submissions</div>
        </div>
        <div className="stat-card">
          <h3>Latest Year</h3>
          <div className="stat-number">
            {Object.keys(statistics.yearlyApprovals).length > 0 
              ? Math.max(...Object.keys(statistics.yearlyApprovals).map(Number))
              : 'N/A'}
          </div>
          <div className="stat-detail">Most recent submissions</div>
        </div>
        <div className="stat-card">
          <h3>Categories</h3>
          <div className="stat-number">{Object.keys(statistics.categoryCounts).length}</div>
          <div className="stat-detail">Different categories</div>
        </div>
      </div>
    </div>
  );
};

export default WelcomeDashboard;
