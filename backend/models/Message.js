
// FILE: Message.js
// DESCRIPTION:
// Mongoose Model for individual Chat Messages.
// Stores the user prompt, AI response, feedback, and associated metadata.


const mongoose = require('mongoose');

const messageSchema = mongoose.Schema({
    // ID of the parent conversation
    conversation_id: {
        type: String,
        required: true,
    },
    // The user's input/query
    user_prompt: {
        type: String,
        required: true,
    },
    // Context retrieved from web search (if any)
    web_context: {
        type: String,
    },
    // The AI's generated response
    llm_response: {
        type: String,
    },
    // User rating (1 = like, -1 = dislike, 0 = none)
    rating: {
        type: Number,
        default: 0,
    },
    // Deprecated? Source of truth
    source: {
        type: String,
    },
    // RAG Sources (JSON stringified)
    sources: {
        type: String,
    },
    // Generated Chart Configuration (JSON stringified)
    chart: {
        type: String,
    },
    // Text feedback from user
    feedback: {
        type: String,
    },
    timestamp: {
        type: Date,
        default: Date.now,
    },
});

const Message = mongoose.model('Message', messageSchema);

module.exports = Message;
