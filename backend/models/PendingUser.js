
// FILE: PendingUser.js
// DESCRIPTION:
// Mongoose Model for temporary storage of user registration data.
// Data is held here until the email OTP is verified, then moved to User.js.


const mongoose = require('mongoose');

const pendingUserSchema = mongoose.Schema({
    // User email (Unique key)
    email: {
        type: String,
        required: true,
        unique: true,
    },
    // Hashed password (waiting for verification)
    password: {
        type: String,
        required: true,
    },
    // User's name
    full_name: {
        type: String,
    },
}, {
    // Only track creation, these records are short-lived
    timestamps: { createdAt: 'created_at' }
});

const PendingUser = mongoose.model('PendingUser', pendingUserSchema);

module.exports = PendingUser;
