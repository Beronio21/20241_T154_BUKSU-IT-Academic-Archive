const mongoose = require('mongoose');

// Define the schema for User Management records
const userManagementSchema = new mongoose.Schema({
    user_management_id: {
        type: Number,
        required: true,
        unique: true
    },
    admin_id: {
        type: String,
        required: true,
        ref: 'Admin' // Links to the Admin collection by ID
    },
    action: {
        type: String,
        required: true,
        enum: ['Add User', 'Remove User', 'Update User'] // Possible actions
    },
    user_id: {
        type: String,
        required: true,
        ref: 'User' // Links to the User collection by ID
    },
    timestamp: {
        type: Date,
        default: Date.now
    }
});

// Compile model from schema
const UserManagement = mongoose.model('UserManagement', userManagementSchema);

module.exports = UserManagement;
