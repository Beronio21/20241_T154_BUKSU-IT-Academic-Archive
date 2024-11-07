const express = require('express');
const router = express.Router();
const AdminController = require('../controllers/AdminController');

// Middleware to validate admin ID
router.param('admin_id', (req, res, next, admin_id) => {
    if (!admin_id || !admin_id.match(/^[0-9a-fA-F]{24}$/)) {
        return res.status(400).json({ message: 'Invalid admin ID' });
    }
    next();
});

// Route to get all admins
router.get('/', AdminController.getAllAdmins);

// Route to get admin by ID
router.get('/:admin_id', AdminController.getAdminById);

// Route to create a new admin (using '/register' endpoint)
router.post('/register', AdminController.createAdmin); // Change here to '/register'

// Route to update an admin
router.put('/:admin_id', AdminController.updateAdmin);

// Route to delete an admin
router.delete('/:admin_id', AdminController.deleteAdmin);

module.exports = router;
