const mongoose = require('mongoose');

// Define the schema for system configurations
const SystemConfigSchema = new mongoose.Schema({
    admin_id: {
        type: String,
        required: true,
    },
    config_name: {
        type: String,
        required: true,
    },
    config_value: {
        type: String,
        required: true,
    },
    last_updated: {
        type: Date,
        default: Date.now,
    }
});

// Create the model from the schema
const SystemConfig = mongoose.model('SystemConfig', SystemConfigSchema);

module.exports = SystemConfig;
