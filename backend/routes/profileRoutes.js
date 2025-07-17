const express = require('express');
const router = express.Router();
const User = require('../models/userModel');
const auth = require('../middleware/auth');
const bcrypt = require('bcryptjs');
const Teacher = require('../models/Teacher');

// Get profile
router.get('/', auth, async (req, res) => {
    try {
        let profile;
        if (req.user.role === 'teacher') {
            profile = await Teacher.findById(req.user._id);
            if (!profile) {
                return res.status(404).json({
                    status: 'error',
                    message: 'Teacher not found'
                });
            }
            return res.json({
                status: 'success',
                data: {
                    name: profile.name,
                    email: profile.email,
                    image: profile.image,
                    role: profile.role,
                    teacher_id: profile.teacher_id,
                    contact_number: profile.contact_number,
                    location: profile.location,
                    birthday: profile.birthday,
                    gender: profile.gender,
                    department: profile.department,
                    isProfileComplete: profile.isProfileComplete
                }
            });
        } else {
            profile = await User.findById(req.user._id);
            if (!profile) {
                return res.status(404).json({
                    status: 'error',
                    message: 'User not found'
                });
            }
            return res.json({
                status: 'success',
                data: {
                    name: profile.name,
                    email: profile.email,
                    image: profile.image,
                    role: profile.role,
                    student_id: profile.student_id,
                    contact_number: profile.contact_number,
                    location: profile.location,
                    birthday: profile.birthday,
                    gender: profile.gender,
                    course: profile.course,
                    year: profile.year,
                    isProfileComplete: profile.isProfileComplete
                }
            });
        }
    } catch (error) {
        console.error('Profile fetch error:', error);
        res.status(500).json({
            status: 'error',
            message: 'Failed to fetch profile'
        });
    }
});

// Update profile
router.put('/', auth, async (req, res) => {
    try {
        const updates = req.body;
        if (updates.birthday) {
            updates.birthday = new Date(updates.birthday);
        }
        if (updates.password) {
            updates.password = await bcrypt.hash(updates.password, 10);
        }
        let updatedProfile;
        if (req.user.role === 'teacher') {
            const io = req.app.get('io');
            // Fetch the old profile for comparison
            const Teacher = require('../models/Teacher');
            const Notification = require('../models/notification');
            const oldProfile = await Teacher.findById(req.user._id);
            updatedProfile = await Teacher.findByIdAndUpdate(
                req.user._id,
                { $set: updates },
                { new: true, runValidators: true }
            );
            if (!updatedProfile) {
                return res.status(404).json({
                    status: 'error',
                    message: 'Teacher not found'
                });
            }
            // Emit real-time update event
            io.emit('teacherUpdated', { teacherId: updatedProfile._id, data: updatedProfile });

            // --- Admin notification for teacher profile update ---
            // Only notify if relevant fields changed or first-time completion
            const fieldsToCheck = ['name', 'email', 'contact_number', 'department', 'gender', 'birthday'];
            const changedFields = fieldsToCheck.filter(field => {
                // Compare as string for date
                if (field === 'birthday') {
                    return oldProfile[field]?.toISOString().slice(0,10) !== (updates[field] ? new Date(updates[field]).toISOString().slice(0,10) : oldProfile[field]?.toISOString().slice(0,10));
                }
                return updates[field] !== undefined && oldProfile[field] !== updates[field];
            });

            // Check for first-time profile completion
            const wasProfileComplete = oldProfile.isProfileComplete;
            // Use the checkProfileComplete method from the model
            const willBeProfileComplete = updatedProfile.checkProfileComplete();

            if (!wasProfileComplete && willBeProfileComplete) {
                // First-time completion
                updatedProfile.isProfileComplete = true;
                await updatedProfile.save();
                const notifMsg = `Teacher ${oldProfile.name} (${oldProfile.email}) completed their profile for the first time.`;
                const adminNotif = await Notification.create({
                    forAdmins: true,
                    recipientEmail: 'admin', // Set a placeholder to satisfy schema
                    title: 'Teacher Profile Completed',
                    message: notifMsg,
                    type: 'admin_event',
                    status: 'pending', // Use a valid enum value
                    thesisId: null,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                    readBy: [],
                    deletedBy: []
                });
                if (io && adminNotif) {
                    io.to('admins').emit('admin_notification', adminNotif);
                }
            } else if (changedFields.length > 0) {
                // Subsequent edits
                const teacherName = oldProfile.name;
                const teacherEmail = oldProfile.email;
                const now = new Date();
                const notifMsg = `Teacher ${teacherName} (${teacherEmail}) has updated their profile.`;
                const adminNotif = await Notification.create({
                    forAdmins: true,
                    recipientEmail: 'admin', // Set a placeholder to satisfy schema
                    title: 'Teacher Profile Updated',
                    message: notifMsg,
                    type: 'admin_event',
                    status: 'pending', // Use a valid enum value
                    thesisId: null,
                    createdAt: now,
                    updatedAt: now,
                    readBy: [],
                    deletedBy: []
                });
                if (io && adminNotif) {
                    io.to('admins').emit('admin_notification', adminNotif);
                }
            }
            // --- End admin notification logic ---
            return res.json({
                status: 'success',
                data: {
                    name: updatedProfile.name,
                    email: updatedProfile.email,
                    image: updatedProfile.image,
                    role: updatedProfile.role,
                    teacher_id: updatedProfile.teacher_id,
                    contact_number: updatedProfile.contact_number,
                    location: updatedProfile.location,
                    birthday: updatedProfile.birthday,
                    gender: updatedProfile.gender,
                    department: updatedProfile.department,
                    isProfileComplete: updatedProfile.isProfileComplete
                }
            });
        } else {
            updatedProfile = await User.findByIdAndUpdate(
                req.user._id,
                { $set: updates },
                { new: true, runValidators: true }
            );
            if (!updatedProfile) {
                return res.status(404).json({
                    status: 'error',
                    message: 'User not found'
                });
            }
            return res.json({
                status: 'success',
                data: {
                    name: updatedProfile.name,
                    email: updatedProfile.email,
                    image: updatedProfile.image,
                    role: updatedProfile.role,
                    student_id: updatedProfile.student_id,
                    contact_number: updatedProfile.contact_number,
                    location: updatedProfile.location,
                    birthday: updatedProfile.birthday,
                    gender: updatedProfile.gender,
                    course: updatedProfile.course,
                    year: updatedProfile.year,
                    isProfileComplete: updatedProfile.isProfileComplete
                }
            });
        }
    } catch (error) {
        console.error('Profile update error:', error);
        res.status(500).json({
            status: 'error',
            message: error.message || 'Failed to update profile'
        });
    }
});

// Add this to your routes
router.get('/health', (req, res) => {
    res.json({ status: 'ok', message: 'Server is running' });
});

module.exports = router; 