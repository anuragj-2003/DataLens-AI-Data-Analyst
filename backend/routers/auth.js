const express = require('express');
const router = express.Router();
const User = require('../models/User');
const OTP = require('../models/OTP');
const PendingUser = require('../models/PendingUser');
const { getPasswordHash, verifyPassword } = require('../utils/security');
const { sendOtpEmail, generateOtp } = require('../utils/email_manager');
const jwt = require('jsonwebtoken');
require('dotenv').config();


// FILE: auth.js
// DESCRIPTION:
// This file handles all user authentication and authorization logic.
// It manages User Sign Up, Login (Token creation), OTP Verification,
// Password Resets, and Profile Retrieval.


// FUNCTION: generateToken
// DESCRIPTION: Creates a JWT (JSON Web Token) for an authenticated user.
// INPUT: user (Object) - The user database object.
// OUTPUT: String - The signed JWT token.
const generateToken = (user) => {
    return jwt.sign(
        { sub: user.email, role: "user" }, // Payload
        process.env.JWT_SECRET,            // Secret Key
        { expiresIn: '7d' }                // Expiration
    );
};

// MIDDLEWARE: verifyToken
// DESCRIPTION: Protects routes by checking for a valid JWT in the Authorization header.
// INPUT: req, res, next (Standard Express Middleware)
// OUTPUT: Calls next() if valid, or returns 401/403 error.
const verifyToken = (req, res, next) => {
    // 1. Check for Authorization header
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) return res.status(403).json({ detail: "Token missing" });

    // 2. Verify the token using our secret
    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) return res.status(401).json({ detail: "Invalid token" });
        req.user = decoded; // Attach user info to request
        next(); // Proceed to the next handler
    });
};

// MIDDLEWARE: optionalVerifyToken
// DESCRIPTION: Checks for a token but doesn't block request if missing.
// Useful for routes that support both guest and logged-in users.
// INPUT: req, res, next
// OUTPUT: Calls next() always, identifying user if token is valid.
const optionalVerifyToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) {
        req.user = null; // No user logged in
        return next();
    }
    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) req.user = null; // Token invalid, treat as guest
        else req.user = decoded;
        next();
    });
};

// ROUTE: POST /signup
// DESCRIPTION: Registers a new user and sends an OTP for verification.
// INPUT: email, password, full_name
// OUTPUT: JSON { email, full_name, is_verified }
router.post('/signup', async (req, res) => {
    const { email, password, full_name } = req.body;

    try {
        const existingUser = await User.findOne({ email });
        if (existingUser && existingUser.is_verified) {
            return res.status(400).json({ detail: "Email already registered" });
        }

        const hashedPassword = await getPasswordHash(password);

        // Upsert pending user
        await PendingUser.findOneAndUpdate(
            { email },
            { email, password: hashedPassword, full_name },
            { upsert: true, new: true }
        );

        const otp = generateOtp();
        const expiry = new Date(Date.now() + 10 * 60000); // 10 mins

        await OTP.findOneAndUpdate(
            { email },
            { email, code: otp, type: 'signup', expires_at: expiry },
            { upsert: true, new: true }
        );

        sendOtpEmail(email, otp);
        res.json({ email, full_name, is_verified: false });

    } catch (e) {
        console.error("Signup error", e);
        res.status(500).json({ detail: e.message });
    }
});

// ROUTE: POST /verify-otp
// DESCRIPTION: Verifies the OTP sent to email. Activates user if valid.
// INPUT: email, otp, [new_password] (optional, for reset)
// OUTPUT: JSON { message, [access_token] }
router.post('/verify-otp', async (req, res) => {
    const { email, otp, new_password } = req.body;

    try {
        const record = await OTP.findOne({ email });

        if (!record) {
            return res.status(400).json({ detail: "Invalid or expired OTP" });
        }

        if (record.code !== otp) {
            return res.status(400).json({ detail: "Invalid OTP" });
        }

        const authType = record.type;

        if (authType === 'signup') {
            const pendingUser = await PendingUser.findOne({ email });

            if (!pendingUser) {
                const user = await User.findOne({ email });
                if (user) {
                    return res.json({ message: "Account already verified" });
                }
                return res.status(400).json({ detail: "No pending registration found" });
            }

            // Create User
            const newUser = new User({
                email: pendingUser.email,
                password: pendingUser.password,
                full_name: pendingUser.full_name,
                is_verified: true
            });
            await newUser.save();

            await PendingUser.deleteOne({ email });
            await OTP.deleteOne({ email });

            const accessToken = generateToken(newUser);
            res.json({ message: "Account verified and created successfully", access_token: accessToken, token_type: "bearer" });

        } else if (authType === 'reset') {
            if (!new_password) {
                return res.status(400).json({ detail: "New password required for reset" });
            }
            const hashed = await getPasswordHash(new_password);

            await User.findOneAndUpdate({ email }, { password: hashed });
            await OTP.deleteOne({ email });

            res.json({ message: "Password reset successfully" });
        } else {
            await OTP.deleteOne({ email });
            res.json({ message: "OTP Verified" });
        }
    } catch (e) {
        console.error("Verify OTP error", e);
        res.status(500).json({ detail: e.message });
    }
});

// ROUTE: POST /login
// DESCRIPTION: Authenticates user using email and password.
// INPUT: username (email), password
// OUTPUT: JSON { access_token, token_type }
router.post('/login', async (req, res) => {
    const username = req.body.username || req.body.email;
    const password = req.body.password;

    console.log("LOGIN DEBUG: Attempting login for:", username);
    // console.log("LOGIN DEBUG: Password provided:", password); // Security risk to log plain password, but useful for local debug if needed.

    try {
        const user = await User.findOne({ email: username });
        if (!user) {
            console.log("LOGIN DEBUG: User not found in DB");
            return res.status(401).json({ detail: "Incorrect username or password (Debug: User not found)" });
        }

        console.log("LOGIN DEBUG: User found. Hash:", user.password);

        const isValid = await verifyPassword(password, user.password);
        console.log("LOGIN DEBUG: Password valid?", isValid);

        if (!isValid) {
            return res.status(401).json({ detail: "Incorrect username or password (Debug: Password invalid)" });
        }

        const accessToken = generateToken(user);
        res.json({ access_token: accessToken, token_type: "bearer" });
    } catch (e) {
        console.error("Login error", e);
        res.status(500).json({ detail: e.message });
    }
});

// ROUTE: GET /me
// DESCRIPTION: Returns the current logged-in user's profile.
// INPUT: Authorization Header (Bearer Token)
// OUTPUT: JSON { profile }
router.get('/me', verifyToken, async (req, res) => {
    try {
        const user = await User.findOne({ email: req.user.sub });
        if (!user) {
            return res.status(401).json({ detail: "User not found" });
        }
        res.json({
            email: user.email,
            full_name: user.full_name,
            is_verified: !!user.is_verified
        });
    } catch (e) {
        console.error("Get Me error", e);
        res.status(500).json({ detail: e.message });
    }
});

// ROUTE: POST /forgot-password
// DESCRIPTION: Initiates password reset by sending an OTP.
// INPUT: email
// OUTPUT: JSON { message }
router.post('/forgot-password', async (req, res) => {
    const { email } = req.body;

    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.json({ message: "If email exists, OTP sent." });
        }

        const otp = generateOtp();
        const expiry = new Date(Date.now() + 10 * 60000);

        await OTP.findOneAndUpdate(
            { email },
            { email, code: otp, type: 'reset', expires_at: expiry },
            { upsert: true, new: true }
        );

        sendOtpEmail(email, otp);
        res.json({ message: "OTP sent" });
    } catch (e) {
        console.error("Forgot password error", e);
        res.status(500).json({ detail: e.message });
    }
});

// (Redundant middleware definition removed)

module.exports = router;
module.exports.verifyToken = verifyToken;
module.exports.optionalVerifyToken = optionalVerifyToken;
