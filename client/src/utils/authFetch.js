// src/utils/authFetch.js

const API_URL = 'http://localhost:5000'; // Change this to your API base URL

// Function to fetch with authentication
const authFetch = async (url, options = {}) => {
    const token = localStorage.getItem('token'); // Assuming you're storing the JWT in local storage

    // Set default headers
    const headers = {
        'Content-Type': 'application/json',
        ...options.headers, // Merge with any custom headers passed in
    };

    // If token exists, add it to the Authorization header
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    // Perform the fetch request
    try {
        const response = await fetch(`${API_URL}${url}`, {
            ...options,
            headers,
        });

        // Check for errors
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Error fetching data');
        }

        // Parse and return JSON response
        return await response.json();
    } catch (error) {
        console.error('Fetch error:', error);
        throw error; // Re-throw error for handling in the calling function
    }
};

export default authFetch;
