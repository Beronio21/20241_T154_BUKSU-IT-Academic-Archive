// controllers/AdminController.js
const Admin = require('../models/Admin');
const bcrypt = require('bcryptjs'); // For hashing passwords
const jwt = require('jsonwebtoken'); // For generating JWT tokens

// Controller for creating a new admin
exports.createAdmin = async (req, res) => {
    try {
        const { admin_id, first_name, last_name, email, password, contact_number } = req.body;

        // Hash the password
        const password_hash = await bcrypt.hash(password, 10);

        // Create a new admin instance
        const admin = new Admin({
            admin_id,
            first_name,
            last_name,
            email,
            password_hash,
            contact_number
        });

        // Save to database
        await admin.save();
        res.status(201).json({ message: 'Admin created successfully', admin });
    } catch (error) {
        res.status(400).json({ message: 'Error creating admin', error });
    }
};

// Controller for logging in an admin
exports.loginAdmin = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Find admin by email
        const admin = await Admin.findOne({ email });
        if (!admin) {
            return res.status(404).json({ message: 'Admin not found' });
        }

        // Check password
        const isMatch = await bcrypt.compare(password, admin.password_hash);
        if (!isMatch) {
            return res.status(400).json({ message: 'Incorrect password' });
        }

        // Generate JWT token
        const token = jwt.sign(
            { admin_id: admin._id, role: admin.role },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );

        res.status(200).json({ message: 'Login successful', token });
    } catch (error) {
        res.status(400).json({ message: 'Error logging in', error });
    }
};

// Controller for getting all admins
exports.getAllAdmins = async (req, res) => {
    try {
        const admins = await Admin.find();
        res.status(200).json(admins);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching admins', error });
    }
};

// Controller for getting an admin by ID
exports.getAdminById = async (req, res) => {
    try {
        const admin = await Admin.findById(req.params.admin_id);
        if (!admin) {
            return res.status(404).json({ message: 'Admin not found' });
        }
        res.status(200).json(admin);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching admin', error });
    }
};

// Controller for updating an admin
exports.updateAdmin = async (req, res) => {
    try {
        const updatedData = req.body;
        if (updatedData.password) {
            updatedData.password_hash = await bcrypt.hash(updatedData.password, 10);
            delete updatedData.password;
        }

        const admin = await Admin.findByIdAndUpdate(req.params.admin_id, updatedData, { new: true });
        if (!admin) {
            return res.status(404).json({ message: 'Admin not found' });
        }
        res.status(200).json({ message: 'Admin updated successfully', admin });
    } catch (error) {
        res.status(400).json({ message: 'Error updating admin', error });
    }
};

// Controller for deleting an admin
exports.deleteAdmin = async (req, res) => {
    try {
        const admin = await Admin.findByIdAndDelete(req.params.admin_id);
        if (!admin) {
            return res.status(404).json({ message: 'Admin not found' });
        }
        res.status(200).json({ message: 'Admin deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting admin', error });
    }
};

const blacklist = new Set(); // In-memory store for blacklisted tokens

// Admin Logout
exports.logoutAdmin = (req, res) => {
    const token = req.headers['authorization']?.split(' ')[1]; // Extract the token from the header

    if (token) {
        blacklist.add(token); // Add the token to the blacklist
        return res.json({ message: 'Admin logged out successfully' });
    } else {
        return res.status(400).json({ message: 'No token provided' });
    }
};