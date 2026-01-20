
// FILE: OTP.js
// DESCRIPTION:
// Mongoose Model for Temporary One-Time Passwords (OTP).
// Used for Email Verification (Sign up) and Password Resets.


const mongoose = require('mongoose');

const otpSchema = mongoose.Schema({
    // The email associated with this OTP code
    email: {
        type: String,
        required: true,
    },
    // The 6-digit numeric code
    code: {
        type: String,
        required: true,
    },
    // Context: 'signup' or 'reset'
    type: {
        type: String,
        required: true,
    },
    // Time when the OTP becomes invalid
    expires_at: {
        type: Date,
        required: true,
    },
});

const OTP = mongoose.model('OTP', otpSchema);

module.exports = OTP;
