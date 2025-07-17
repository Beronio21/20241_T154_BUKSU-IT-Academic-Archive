const mongoose = require('mongoose');
const Notification = require('../models/notification');

const teacherEmail = 'blaze.sedo@yourdomain.com'; // <-- Set this to your actual teacher email used for login
const teacherId = 'T-12345678-ABCD'; // <-- Set this to your actual teacherId from the teacher's account

const notifications = [
  {
    recipientEmail: teacherEmail,
    teacherId: teacherId,
    title: 'Thesis Approved',
    message: 'Your thesis "Development of a Coffee Bean Quality Sorting System using Object Detection in YOLO" has been reviewed. Congratulations! Your thesis has been APPROVED.',
    type: 'status_update',
    status: 'approved',
    thesisTitle: 'Development of a Coffee Bean Quality Sorting System using Object Detection in YOLO',
    reviewerComments: '',
    createdAt: new Date('2025-07-13T22:23:00'),
    updatedAt: new Date('2025-07-13T22:23:00'),
  },
  {
    recipientEmail: teacherEmail,
    teacherId: teacherId,
    title: 'Thesis Rejected',
    message: 'Your thesis "Development of a Coffee Bean Quality Sorting System using Object Detection in YOLO" has been reviewed. Unfortunately, your thesis has been REJECTED.',
    type: 'status_update',
    status: 'rejected',
    thesisTitle: 'Development of a Coffee Bean Quality Sorting System using Object Detection in YOLO',
    reviewerComments: '',
    createdAt: new Date('2025-07-13T22:23:00'),
    updatedAt: new Date('2025-07-13T22:23:00'),
  },
  {
    recipientEmail: teacherEmail,
    teacherId: teacherId,
    title: 'Thesis Approved',
    message: 'Your thesis "Development of a Coffee Bean Quality Sorting System using Object Detection in YOLO" has been reviewed. Congratulations! Your thesis has been APPROVED. Reviewer Comments: Double check',
    type: 'status_update',
    status: 'approved',
    thesisTitle: 'Development of a Coffee Bean Quality Sorting System using Object Detection in YOLO',
    reviewerComments: 'Double check',
    createdAt: new Date('2025-07-08T05:30:00'),
    updatedAt: new Date('2025-07-08T05:30:00'),
  },
  {
    recipientEmail: teacherEmail,
    teacherId: teacherId,
    title: 'Thesis Needs Revision',
    message: 'Your thesis "Development of a Coffee Bean Quality Sorting System using Object Detection in YOLO" has been reviewed. Your thesis needs REVISION. Reviewer Comments: Double check',
    type: 'status_update',
    status: 'revision',
    thesisTitle: 'Development of a Coffee Bean Quality Sorting System using Object Detection in YOLO',
    reviewerComments: 'Double check',
    createdAt: new Date('2025-07-07T23:03:00'),
    updatedAt: new Date('2025-07-07T23:03:00'),
  },
  {
    recipientEmail: teacherEmail,
    teacherId: teacherId,
    title: 'Thesis Review Update',
    message: 'Your thesis "Development of a Coffee Bean Quality Sorting System using Object Detection in YOLO" has been reviewed. Status: PENDING Reviewer Comments: Double check',
    type: 'status_update',
    status: 'pending',
    thesisTitle: 'Development of a Coffee Bean Quality Sorting System using Object Detection in YOLO',
    reviewerComments: 'Double check',
    createdAt: new Date('2025-07-08T05:30:00'),
    updatedAt: new Date('2025-07-08T05:30:00'),
  },
];

async function run() {
  await mongoose.connect('mongodb://localhost:27017/YOUR_DB_NAME'); // Replace with your DB name
  for (const notif of notifications) {
    // Prevent duplicates
    const exists = await Notification.findOne({
      recipientEmail: notif.recipientEmail,
      teacherId: notif.teacherId,
      thesisTitle: notif.thesisTitle,
      status: notif.status,
      type: notif.type
    });
    if (!exists) {
      await Notification.create(notif);
      console.log(`Inserted: ${notif.title} (${notif.status})`);
    } else {
      console.log(`Skipped duplicate: ${notif.title} (${notif.status})`);
    }
  }
  console.log('Teacher notifications seeding complete!');
  process.exit();
}

run(); 