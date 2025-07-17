const mongoose = require('mongoose');
const Notification = require('../models/notification');

async function cleanupAdminNotifications() {
  await mongoose.connect('mongodb://localhost:27017/YOUR_DB_NAME'); // Replace with your DB name
  const adminEmail = 'admin@buksu.edu.ph';
  const result = await Notification.deleteMany({
    recipientEmail: adminEmail,
    type: { $nin: ['submission', 'admin_event'] }
  });
  console.log(`Deleted ${result.deletedCount} non-admin notifications for admin.`);
  process.exit();
}

cleanupAdminNotifications(); 