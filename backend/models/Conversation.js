
// FILE: Conversation.js
// DESCRIPTION:
// Mongoose Model for a Chat Session (Conversation).
// Links messages together and holds metadata like title and timestamp.


const mongoose = require('mongoose');

const conversationSchema = mongoose.Schema({
    // Unique UUID for the conversation
    id: {
        type: String,
        required: true,
        unique: true,
    },
    // Owner of the conversation (Email or Guest ID)
    user_id: {
        type: String,
        required: true,
    },
    // Auto-generated title (or manually set)
    title: {
        type: String,
        required: true,
    },
    // pinned status for UI
    is_pinned: {
        type: Boolean,
        default: false,
    },
    created_at: {
        type: Date,
        default: Date.now,
    },
});

const Conversation = mongoose.model('Conversation', conversationSchema);

module.exports = Conversation;
