const jwt = require('jsonwebtoken');
const config = require('../config/env');

const CLOCK_TOLERANCE = 30; // seconds — accounts for minor server clock skew

function tokenError(message, code) {
    const err = new Error(message);
    err.code = code;
    return err;
}

const tokenService = {
    generateAccessToken(userId, role = 'user') {
        if (!userId) throw new Error('userId is required');
        return jwt.sign(
            { userId, role, type: 'access' },
            config.jwt.accessSecret,
            { expiresIn: config.jwt.accessExpiresIn }
        );
    },

    generateRefreshToken(userId) {
        if (!userId) throw new Error('userId is required');
        return jwt.sign(
            { userId, type: 'refresh' },
            config.jwt.refreshSecret,
            { expiresIn: config.jwt.refreshExpiresIn }
        );
    },

    generateTokens(userId, role = 'user') {
        return {
            accessToken: this.generateAccessToken(userId, role),
            refreshToken: this.generateRefreshToken(userId),
        };
    },

    verifyAccessToken(token) {
        if (!token) throw tokenError('No token provided', 'TOKEN_INVALID');
        try {
            const decoded = jwt.verify(token, config.jwt.accessSecret, { clockTolerance: CLOCK_TOLERANCE });
            if (decoded.type !== 'access') throw tokenError('Invalid token type', 'TOKEN_INVALID');
            return decoded;
        } catch (error) {
            if (error.code) throw error;
            if (error.name === 'TokenExpiredError') throw tokenError('Access token expired', 'TOKEN_EXPIRED');
            throw tokenError('Invalid access token', 'TOKEN_INVALID');
        }
    },

    verifyRefreshToken(token) {
        if (!token) throw tokenError('No token provided', 'TOKEN_INVALID');
        try {
            const decoded = jwt.verify(token, config.jwt.refreshSecret, { clockTolerance: CLOCK_TOLERANCE });
            if (decoded.type !== 'refresh') throw tokenError('Invalid token type', 'TOKEN_INVALID');
            return decoded;
        } catch (error) {
            if (error.code) throw error;
            if (error.name === 'TokenExpiredError') throw tokenError('Refresh token expired', 'TOKEN_EXPIRED');
            throw tokenError('Invalid refresh token', 'TOKEN_INVALID');
        }
    },
};

module.exports = tokenService;
