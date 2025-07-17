// fixNotifications.js
const mongoose = require('mongoose');
const Notification = require('../models/notification');
require('dotenv').config();

async function fixNotifications() {
  await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/yourdbname');
  console.log('Connected to MongoDB');

  // 1. Fix invalid status values
  const res1 = await Notification.updateMany(
    { status: { $in: ['profile_updated', 'profile_completed'] } },
    { $set: { status: 'pending' } }
  );
  console.log('Updated status for notifications:', res1.modifiedCount);

  // 2. Set recipientEmail to 'admin' for admin notifications missing it
  const res2 = await Notification.updateMany(
    { forAdmins: true, $or: [ { recipientEmail: { $exists: false } }, { recipientEmail: null }, { recipientEmail: '' } ] },
    { $set: { recipientEmail: 'admin' } }
  );
  console.log('Fixed recipientEmail for admin notifications:', res2.modifiedCount);

  // 3. Aggressively delete any notification with invalid status or missing recipientEmail
  const validStatuses = ['pending', 'approved', 'rejected', 'revision', 'needs_revision', 'under_review', 'resubmitted'];
  const res3 = await Notification.deleteMany({
    $or: [
      { status: { $nin: validStatuses } },
      { recipientEmail: { $exists: false } },
      { recipientEmail: null },
      { recipientEmail: '' }
    ]
  });
  console.log('Aggressively deleted invalid notifications:', res3.deletedCount);

  // After existing cleanup, patch missing fields in legacy notifications
  const res4 = await Notification.updateMany(
    { thesisTitle: { $exists: false } },
    { $set: { thesisTitle: 'N/A' } }
  );
  console.log('Patched missing thesisTitle:', res4.modifiedCount);
  const res5 = await Notification.updateMany(
    { status: { $exists: false } },
    { $set: { status: 'pending' } }
  );
  console.log('Patched missing status:', res5.modifiedCount);
  const res6 = await Notification.updateMany(
    { updatedAt: { $exists: false } },
    [ { $set: { updatedAt: "$createdAt" } } ]
  );
  console.log('Patched missing updatedAt:', res6.modifiedCount);

  await mongoose.disconnect();
  console.log('Done.');
}

fixNotifications().catch(err => {
  console.error('Error fixing notifications:', err);
  process.exit(1);
}); 