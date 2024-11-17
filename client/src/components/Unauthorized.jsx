// src/components/Unauthorized.jsx
import React from 'react';

const Unauthorized = () => (
    <div style={{ textAlign: 'center', marginTop: '50px' }}>
        <h1>Unauthorized</h1>
        <p>You do not have access to this page.</p>
        <a href="/login">Go Back to Login</a>
    </div>
);

export default Unauthorized;
