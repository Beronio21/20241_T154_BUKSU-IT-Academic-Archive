import React from 'react';
import { Link } from 'react-router-dom';

const NotFound = () => {
    return (
        <div style={{ 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center', 
            justifyContent: 'center',
            height: '100vh',
            textAlign: 'center'
        }}>
            <h1>404 - Page Not Found</h1>
            <p>The page you are looking for does not exist.</p>
            <Link 
                to="/" 
                style={{
                    textDecoration: 'none',
                    color: 'white',
                    backgroundColor: '#007bff',
                    padding: '10px 20px',
                    borderRadius: '5px',
                    marginTop: '20px'
                }}
            >
                Go to Login
            </Link>
        </div>
    );
};

export default NotFound;