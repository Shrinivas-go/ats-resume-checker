const jwt = require('jsonwebtoken');
const config = require('../config/env');

const ACCESS_TOKEN_EXPIRY = '15m';
const REFRESH_TOKEN_EXPIRY = '7d';
const CLOCK_TOLERANCE = 30; // seconds

// Create an error with a code property for token failures
function tokenError(message, code) {
    const err = new Error(message);
    err.code = code;
    return err;
}

const tokenService = {
    /**
     * Generate access token
     */
    generateAccessToken(userId, role = 'user') {
        if (!userId) throw new Error('userId is required');

        return jwt.sign(
            {
                userId,
                role,
                type: 'access',
                iat: Math.floor(Date.now() / 1000), // Explicit issued-at time
            },
            config.jwt.accessSecret,
            {
                expiresIn: config.jwt.accessExpiresIn || ACCESS_TOKEN_EXPIRY,
            }
        );
    },

    /**
     * Generate refresh token
     */
    generateRefreshToken(userId) {
        if (!userId) throw new Error('userId is required');

        return jwt.sign(
            {
                userId,
                type: 'refresh',
                iat: Math.floor(Date.now() / 1000), // Explicit issued-at time
            },
            config.jwt.refreshSecret,
            {
                expiresIn: config.jwt.refreshExpiresIn || REFRESH_TOKEN_EXPIRY,
            }
        );
    },

    /**
     * Generate both access and refresh tokens
     */
    generateTokens(userId, role = 'user') {
        return {
            accessToken: this.generateAccessToken(userId, role),
            refreshToken: this.generateRefreshToken(userId),
        };
    },

    /**
     * Verify access token
     */
    verifyAccessToken(token) {
        if (!token) throw tokenError('No token provided', 'TOKEN_INVALID');

        try {
            const decoded = jwt.verify(token, config.jwt.accessSecret, {
                clockTolerance: CLOCK_TOLERANCE,
            });

            if (decoded.type !== 'access') {
                throw tokenError('Invalid token type', 'TOKEN_INVALID');
            }

            return decoded;
        } catch (error) {
            if (error.code) throw error; // already our error
            if (error.name === 'TokenExpiredError') throw tokenError('Access token has expired', 'TOKEN_EXPIRED');
            throw tokenError('Invalid access token', 'TOKEN_INVALID');
        }
    },

    /**
     * Verify refresh token
     */
    verifyRefreshToken(token) {
        if (!token) throw tokenError('No token provided', 'TOKEN_INVALID');

        try {
            const decoded = jwt.verify(token, config.jwt.refreshSecret, {
                clockTolerance: CLOCK_TOLERANCE,
            });

            if (decoded.type !== 'refresh') {
                throw tokenError('Invalid token type', 'TOKEN_INVALID');
            }

            return decoded;
        } catch (error) {
            if (error.code) throw error;
            if (error.name === 'TokenExpiredError') throw tokenError('Refresh token has expired', 'TOKEN_EXPIRED');
            throw tokenError('Invalid refresh token', 'TOKEN_INVALID');
        }
    },
};

module.exports = tokenService;
