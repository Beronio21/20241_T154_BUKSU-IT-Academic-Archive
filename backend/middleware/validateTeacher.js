const validateTeacher = (req, res, next) => {
    const {
        name,
        email,
        teacher_id,
        contact_number,
        location,
        birthday,
        gender,
        department
    } = req.body;

    const errors = [];

    // Name validation
    if (!name || name.trim().length < 2) {
        errors.push('Name must be at least 2 characters long');
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) {
        errors.push('Please provide a valid email address');
    }

    // Teacher ID validation
    if (!teacher_id || teacher_id.trim().length < 3) {
        errors.push('Teacher ID is required and must be at least 3 characters');
    }

    // Contact number validation
    const phoneRegex = /^\+?[\d\s-]{10,}$/;
    if (!contact_number || !phoneRegex.test(contact_number)) {
        errors.push('Please provide a valid contact number');
    }

    // Location validation
    if (!location || location.trim().length < 2) {
        errors.push('Location is required');
    }

    // Birthday validation
    const birthdayDate = new Date(birthday);
    const minAge = 21;
    const maxAge = 70;
    const today = new Date();
    const age = today.getFullYear() - birthdayDate.getFullYear();
    
    if (!birthday || isNaN(birthdayDate.getTime()) || age < minAge || age > maxAge) {
        errors.push(`Age must be between ${minAge} and ${maxAge} years`);
    }

    // Gender validation
    const validGenders = ['male', 'female', 'other'];
    if (!gender || !validGenders.includes(gender.toLowerCase())) {
        errors.push('Please select a valid gender');
    }

    // Department validation
    if (!department || department.trim().length < 2) {
        errors.push('Department is required');
    }

    if (errors.length > 0) {
        return res.status(400).json({
            success: false,
            errors
        });
    }

    next();
};

module.exports = validateTeacher; 