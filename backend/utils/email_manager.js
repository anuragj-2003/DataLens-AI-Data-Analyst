
// FILE: email_manager.js
// DESCRIPTION:
// Handles sending emails (OTP) to users. Currently supports Gmail SMTP
// and has a fallback "Mock Mode" if no credentials are provided.


const nodemailer = require('nodemailer');
require('dotenv').config();

const SMTP_SERVER = process.env.SMTP_SERVER || "smtp.gmail.com";
const SMTP_PORT = parseInt(process.env.SMTP_PORT || "587");
const SMTP_USER = process.env.SMTP_USER || "";
const SMTP_PASSWORD = process.env.SMTP_PASSWORD || "";

// FUNCTION: sendOtpEmail
// DESCRIPTION: Sends a verification OTP to the user's email.
// INPUT: toEmail (String), otp (String)
// OUTPUT: Boolean (True if successful)
const sendOtpEmail = async (toEmail, otp) => {
    // MOCK MODE:
    // If no SMTP credentials are in .env, just log the OTP to console.
    // This allows the app to work for testing without setting up real email.
    if (!SMTP_USER || !SMTP_PASSWORD) {
        console.log(`!!! MOCK EMAIL !!! To: ${toEmail}, OTP: ${otp}`);
        return true;
    }

    try {
        let transporter = nodemailer.createTransport({
            host: SMTP_SERVER,
            port: SMTP_PORT,
            secure: false, // true for 465, false for other ports
            auth: {
                user: SMTP_USER,
                pass: SMTP_PASSWORD,
            },
        });

        let info = await transporter.sendMail({
            from: SMTP_USER,
            to: toEmail,
            subject: "Your Verification Code",
            text: `Your OTP is: ${otp}`,
        });

        return true;
    } catch (e) {
        console.error(`Failed to send email: ${e}`);
        return false;
    }
};

// FUNCTION: generateOtp
// DESCRIPTION: Generates a random numeric string of a given length.
// INPUT: length (Number) - Default 6
// OUTPUT: String (e.g., "123456")
const generateOtp = (length = 6) => {
    let otp = '';
    const digits = '0123456789';
    for (let i = 0; i < length; i++) {
        otp += digits[Math.floor(Math.random() * 10)];
    }
    return otp;
};

module.exports = {
    sendOtpEmail,
    generateOtp
};
