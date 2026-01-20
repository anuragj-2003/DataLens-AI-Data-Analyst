
// FILE: feedback.js
// DESCRIPTION:
// Handles user feedback (thumbs up/down) for specific chat messages.
// This data can be used to improve the system later.


const express = require('express');
const router = express.Router();
const Message = require('../models/Message');


// ROUTE: POST /
// DESCRIPTION: Logs positive or negative feedback for a conversation.
// INPUT: message_id (Conversation ID), type ('positive' | 'negative'), comment
// OUTPUT: JSON { message }

router.post('/', async (req, res) => {
    const { message_id, type, comment } = req.body;

    // As noted in legacy, 'message_id' might be 'conversation_id' from frontend.
    // If it is conversation_id, we attach feedback to the latest interaction in that convo.

    try {
        // Try to finding interaction by ID first? No, we don't send Interaction ID to frontend yet.
        // Assuming message_id is conversation_id

        const msg = await Message.findOne({ conversation_id: message_id }).sort({ timestamp: -1 });

        if (msg) {
            msg.feedback = type;
            // storing comment could be added to schema if needed
            await msg.save();
            console.log(`FEEDBACK LOGGED: ${type} for convo ${message_id}`);
        } else {
            console.log(`FEEDBACK ORPHANED: ${type} - No interaction found for ${message_id}`);
        }

        res.json({ message: "Feedback received." });

    } catch (e) {
        console.error("Feedback error", e);
        res.status(500).json({ detail: e.message });
    }
});

module.exports = router;
