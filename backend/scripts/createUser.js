require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/userModel');
const Teacher = require('../models/teacherModel');

async function createTestUser() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        
        // Hash password
        const hashedPassword = await bcrypt.hash('ivangwapo', 10);
        
        // Create user
        const user = new User({
            name: 'Ivan Rebato',
            email: '2201104172@student.buksu.edu.ph',
            role: 'student',
            password: hashedPassword,
            isProfileComplete: false
        });

        await user.save();
        console.log('Test user created successfully');

        // Create teacher
        const teacher = new Teacher({
            name: 'Test Teacher',
            email: 'teacher@gmail.com',
            role: 'teacher',
            password: hashedPassword,
            isProfileComplete: false
        });

        await teacher.save();
        console.log('Test teacher created successfully');

        process.exit(0);
    } catch (error) {
        console.error('Error creating test user:', error);
        process.exit(1);
    }
}

createTestUser(); 