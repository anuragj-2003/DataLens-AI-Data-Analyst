
// FILE: settings.js
// DESCRIPTION:
// Manages User Account Settings such as Password Change, Account Deletion,
// and Clearing Chat History (Memory).


const express = require('express');
const router = express.Router();
const { verifyToken } = require('../routers/auth');
const User = require('../models/User');
const Conversation = require('../models/Conversation');
const Message = require('../models/Message');
const { getPasswordHash, verifyPassword } = require('../utils/security');


// ROUTE: PUT /password
// DESCRIPTION: Updates the authenticated user's password.
// INPUT: old_password, new_password
// OUTPUT: JSON { message }
// ==========================================================================
router.put('/password', verifyToken, async (req, res) => {
    const { old_password, new_password } = req.body;
    const email = req.user.sub;

    try {
        const user = await User.findOne({ email });
        if (!user) return res.status(404).json({ detail: "User not found" });

        const isValid = await verifyPassword(old_password, user.password);
        if (!isValid) return res.status(400).json({ detail: "Incorrect old password" });

        user.password = await getPasswordHash(new_password);
        await user.save();

        res.json({ message: "Password updated successfully" });
    } catch (e) {
        console.error("Password update error", e);
        res.status(500).json({ detail: e.message });
    }
});

// ==========================================================================
// ROUTE: DELETE /account
// DESCRIPTION: Permanently deletes the user account and all associated data.
// INPUT: -
// OUTPUT: JSON { message }
// ==========================================================================
router.delete('/account', verifyToken, async (req, res) => {
    const email = req.user.sub;

    try {
        // Find conversations to get IDs
        const convs = await Conversation.find({ user_id: email });
        const convIds = convs.map(c => c.id);

        // Delete Interactions
        await Message.deleteMany({ conversation_id: { $in: convIds } });

        // Delete Conversations
        await Conversation.deleteMany({ user_id: email });

        // Delete User
        await User.deleteOne({ email });

        res.json({ message: "Account deleted permanently" });
    } catch (e) {
        console.error("Account delete error", e);
        res.status(500).json({ detail: e.message });
    }
});

// ==========================================================================
// ROUTE: DELETE /memory
// DESCRIPTION: Clears all chat history for the user but keeps the account.
// INPUT: -
// OUTPUT: JSON { message }
// ==========================================================================
router.delete('/memory', verifyToken, async (req, res) => {
    const email = req.user.sub;

    try {
        const convs = await Conversation.find({ user_id: email });
        const convIds = convs.map(c => c.id);

        await Message.deleteMany({ conversation_id: { $in: convIds } });
        await Conversation.deleteMany({ user_id: email });

        res.json({ message: "All conversations and memory cleared" });
    } catch (e) {
        console.error("Memory clear error", e);
        res.status(500).json({ detail: `Failed to clear memory: ${e.message}` });
    }
});

module.exports = router;
