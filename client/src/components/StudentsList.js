// src/components/StudentsList.js
import React, { useEffect, useState } from 'react';
import { fetchStudents } from '../services/studentService'; // Adjust the path as necessary

const StudentsList = () => {
    const [students, setStudents] = useState([]);
    const [error, setError] = useState(null);

    useEffect(() => {
        const loadStudents = async () => {
            try {
                const fetchedStudents = await fetchStudents();
                setStudents(fetchedStudents.students); // Adjust based on your API response
            } catch (error) {
                setError(error.message);
                console.error('Error fetching students:', error);
            }
        };

        loadStudents();
    }, []); // Empty dependency array means this runs once on mount

    if (error) {
        return <div>Error: {error}</div>;
    }

    return (
        <div>
            <h1>Students List</h1>
            <ul>
                {students.map(student => (
                    <li key={student._id}>{student.first_name} {student.last_name}</li>
                ))}
            </ul>
        </div>
    );
};

export default StudentsList;
