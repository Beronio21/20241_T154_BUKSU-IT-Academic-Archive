export const handleRoleBasedNavigation = (role, navigate) => {
    switch(role) {
        case 'student':
            navigate('/student-dashboard');
            break;
        case 'teacher':
            navigate('/teacher-dashboard');
            break;
        case 'admin':
            navigate('/admin-dashboard');
            break;
        default:
            navigate('/login');
    }
}; 