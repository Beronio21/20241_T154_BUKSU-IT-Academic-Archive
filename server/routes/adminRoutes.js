const express = require('express');
const router = express.Router();
const AdminController = require('../controllers/AdminController');

// Route to get all admins
router.get('/', AdminController.getAllAdmins);

// Route to get admin by ID
router.get('/:admin_id', AdminController.getAdminById);

// Route to create a new admin
router.post('/', AdminController.createAdmin);

// Route to update an admin
router.put('/:admin_id', AdminController.updateAdmin);

// Route to delete an admin
router.delete('/:admin_id', AdminController.deleteAdmin);

module.exports = router;
