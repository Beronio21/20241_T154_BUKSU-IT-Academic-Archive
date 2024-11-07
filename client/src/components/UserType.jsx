import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/UserType.css'; // Add your own styles if needed

const UserType = () => {
    return (
        <div className="user-type-container">
            <h1>Select User Type</h1>
            <div className="user-type-options">
                <Link to="/register-student" className="user-type-button">
                    <button>Student</button>
                </Link>
                <Link to="/register-instructor" className="user-type-button">
                    <button>Instructor</button>
                </Link>
                <Link to="/register-admin" className="user-type-button">
                    <button>Admin</button>
                </Link>
            </div>
        </div>
    );
};

export default UserType;
