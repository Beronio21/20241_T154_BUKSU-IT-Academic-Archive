// src/services/studentService.js
import authFetch from '../utils/authFetch';

export const fetchStudents = async () => {
    try {
        const students = await authFetch('/students');
        return students; // Return the fetched data
    } catch (error) {
        throw new Error(error.message); // Re-throw error for handling in the component
    }
};
