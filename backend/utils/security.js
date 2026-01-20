
// FILE: security.js
// DESCRIPTION:
// Handles cryptographic operations including Password Hashing (Bcrypt/PBKDF2)
// and JWT (JSON Web Token) generation and decoding.


const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
require('dotenv').config();

const SECRET_KEY = process.env.SECRET_KEY || "supersecretkey";
const ALGORITHM = "HS256";
const ACCESS_TOKEN_EXPIRE_MINUTES = 300;

// FUNCTION: getPasswordHash
// DESCRIPTION: Hashes a plain text password using bcrypt for secure storage.
// INPUT: password (String)
// OUTPUT: String (Hashed password)
const getPasswordHash = async (password) => {
    const salt = await bcrypt.genSalt(10);
    return await bcrypt.hash(password, salt);
};

// FUNCTION: verifyPassword
// DESCRIPTION: Verifies if a plain password matches the stored hash.
// Supports both standard Bcrypt and legacy Django PBKDF2 hashes.
// INPUT: plainPassword (String), hashedPassword (String)
// OUTPUT: Boolean (True if match)
const verifyPassword = async (plainPassword, hashedPassword) => {
    if (!hashedPassword) return false;

    // Check for PBKDF2_SHA256 (Legacy Support)
    // Format: $pbkdf2-sha256$rounds$salt$hash
    if (hashedPassword.startsWith('$pbkdf2-sha256$') || hashedPassword.startsWith('$pbkdf2_sha256$')) {
        try {
            const parts = hashedPassword.split('$');
            const rounds = parseInt(parts[2]);
            const salt = parts[3];
            const originalHash = parts[4];

            return new Promise((resolve) => {
                crypto.pbkdf2(plainPassword, salt, rounds, 32, 'sha256', (err, derivedKey) => {
                    if (err) return resolve(false);

                    // Adapt Node's base64 to match Passlib's format (replace + with .)
                    let hashBase64 = derivedKey.toString('base64');
                    let adaptedHash = hashBase64.replace(/\+/g, '.').replace(/=+$/, '');

                    if (adaptedHash === originalHash) {
                        resolve(true);
                    } else {
                        // Try standard base64 match just in case
                        if (derivedKey.toString('base64') === originalHash) {
                            resolve(true);
                        } else {
                            resolve(false);
                        }
                    }
                });
            });
        } catch (e) {
            console.error("PBKDF2 verify error", e);
            return false;
        }
    }

    // Default: Bcrypt check
    try {
        return await bcrypt.compare(plainPassword, hashedPassword);
    } catch (e) {
        return false;
    }
};

// FUNCTION: createAccessToken
// DESCRIPTION: Creates a JWT token for user sessions.
// INPUT: data (Object - payload), expiresInMinutes (Number)
// OUTPUT: String (JWT)
const createAccessToken = (data, expiresInMinutes = ACCESS_TOKEN_EXPIRE_MINUTES) => {
    return jwt.sign(data, SECRET_KEY, { algorithm: ALGORITHM, expiresIn: `${expiresInMinutes}m` });
};

// FUNCTION: decodeAccessToken
// DESCRIPTION: Decodes and verifies a JWT token.
// INPUT: token (String)
// OUTPUT: Object (Payload) or null if invalid
const decodeAccessToken = (token) => {
    try {
        return jwt.verify(token, SECRET_KEY);
    } catch (e) {
        return null;
    }
};

module.exports = {
    getPasswordHash,
    verifyPassword,
    createAccessToken,
    decodeAccessToken,
    SECRET_KEY
};
