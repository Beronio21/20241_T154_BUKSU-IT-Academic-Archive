import React from 'react';
import { Outlet } from 'react-router-dom';
import StudentNavbar from '../../Navbar/StudentNavbar';

const StudentLayout = () => {
    return (
        <div className="d-flex">
            <StudentNavbar activeSection="dashboard" handleSectionChange={() => {}} />
            <main className="main-content position-relative border-radius-lg">
                <Outlet />
            </main>
        </div>
    );
};

export default StudentLayout;