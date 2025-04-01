import React, { useEffect, useState } from 'react';
import axios from 'axios';

const CapstoneStatistic = () => {
    const [statistics, setStatistics] = useState({
        totalCapstones: 0,
        yearlyApprovals: {},
        categoryCounts: {}
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchStatistics();
    }, []);

    const fetchStatistics = async () => {
        try {
            const response = await axios.get('http://localhost:8080/api/thesis/statistics');
            if (response.data.status === 'success') {
                setStatistics(response.data.data);
            }
        } catch (error) {
            console.error('Error fetching statistics:', error);
            setError('Failed to load statistics');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="capstone-statistic-container">
            <h2>Capstone Statistics</h2>
            {loading ? (
                <p>Loading statistics...</p>
            ) : error ? (
                <p>{error}</p>
            ) : (
                <div>
                    <p>Total Capstones: {statistics.totalCapstones}</p>
                    <h3>Yearly Approvals</h3>
                    <ul>
                        {Object.entries(statistics.yearlyApprovals).map(([year, count]) => (
                            <li key={year}>{year}: {count}</li>
                        ))}
                    </ul>
                    <h3>Category Counts</h3>
                    <ul>
                        {Object.entries(statistics.categoryCounts).map(([category, count]) => (
                            <li key={category}>{category}: {count}</li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
};

export default CapstoneStatistic; 