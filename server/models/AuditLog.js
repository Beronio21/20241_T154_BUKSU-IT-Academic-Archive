const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema({
    audit_log_id: Number,
    admin_id: String,
    action: String,
    timestamp: Date,
    details: String
});

module.exports = mongoose.model('AuditLog', auditLogSchema);
