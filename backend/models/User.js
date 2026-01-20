
// FILE: User.js
// DESCRIPTION:
// Mongoose Model for the 'User' collection.
// Stores essential user profile data including authentication credentials.


const mongoose = require('mongoose');

const userSchema = mongoose.Schema({
    // Unique email used for login
    email: {
        type: String,
        required: true,
        unique: true,
    },
    // Hashed password (Bcrypt)
    password: {
        type: String,
        required: true,
    },
    // Optional Google ID for OAuth (future use)
    google_id: {
        type: String,
    },
    // Display name of the user
    full_name: {
        type: String,
    },
    // Flag to track if email OTP verification is complete
    is_verified: {
        type: Boolean,
        default: false,
    },
}, {
    // Automatically manage created_at and updated_at
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
});

const User = mongoose.model('User', userSchema);

module.exports = User;
