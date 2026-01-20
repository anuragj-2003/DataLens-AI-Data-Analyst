const mongoose = require('mongoose');

const fileSchema = new mongoose.Schema({
    filename: {
        type: String,
        required: true
    },
    content: {
        type: String,
        required: true // For CSV/Text content
    },
    mimeType: {
        type: String,
        default: 'text/csv'
    },
    created_at: {
        type: Date,
        default: Date.now,
        expires: 86400 // TTL: Delete after 24 hours to save space
    }
});

module.exports = mongoose.model('File', fileSchema);
