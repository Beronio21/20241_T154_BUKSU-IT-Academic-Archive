const Admin = require('../models/Admin');
const bcrypt = require('bcrypt');

class AdminController {
    // Get all admins
    static async getAllAdmins(req, res) {
        try {
            const admins = await Admin.find();
            res.json(admins);
        } catch (error) {
            res.status(500).json({ message: "Error retrieving admins", error: error.message });
        }
    }

    // Get admin by ID
    static async getAdminById(req, res) {
        try {
            const admin = await Admin.findById(req.params.admin_id);
            if (!admin) {
                return res.status(404).json({ message: "Admin not found" });
            }
            res.json(admin);
        } catch (error) {
            res.status(500).json({ message: "Error retrieving admin", error: error.message });
        }
    }

    // Create a new admin
    static async createAdmin(req, res) {
        const { admin_id, first_name, last_name, email, password, contact_number, gender, birthday, role } = req.body;

        // Check if admin_id or email already exists
        const existingAdmin = await Admin.findOne({ $or: [{ admin_id }, { email }] });
        if (existingAdmin) {
            return res.status(400).json({ message: "Admin ID or email already exists" });
        }

        // Hash the password before saving
        const hashedPassword = await bcrypt.hash(password, 10);

        const newAdmin = new Admin({
            admin_id,
            first_name,
            last_name,
            email,
            password_hash: hashedPassword, // Use the hashed password
            contact_number,
            gender,
            birthday,
            role,
        });

        try {
            const savedAdmin = await newAdmin.save();
            res.status(201).json({ message: "Admin created successfully", admin: savedAdmin });
        } catch (error) {
            res.status(400).json({ message: "Error creating admin", error: error.message });
        }
    }

    // Update an admin
    static async updateAdmin(req, res) {
        try {
            const updatedAdmin = await Admin.findByIdAndUpdate(req.params.admin_id, req.body, { new: true });
            if (!updatedAdmin) {
                return res.status(404).json({ message: "Admin not found" });
            }
            res.json({ message: "Admin updated successfully", admin: updatedAdmin });
        } catch (error) {
            res.status(400).json({ message: "Error updating admin", error: error.message });
        }
    }

    // Delete an admin
    static async deleteAdmin(req, res) {
        try {
            const admin = await Admin.findById(req.params.admin_id);
            if (!admin) {
                return res.status(404).json({ message: "Admin not found" });
            }

            await admin.remove();
            res.json({ message: `Admin with ID ${req.params.admin_id} deleted successfully` });
        } catch (error) {
            res.status(500).json({ message: "Error deleting admin", error: error.message });
        }
    }
}

module.exports = AdminController;
