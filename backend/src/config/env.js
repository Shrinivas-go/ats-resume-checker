const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../../.env') });

/**
 * Validated application configuration.
 * Crashes at boot if required secrets are missing — never run with undefined keys.
 */

const REQUIRED_SECRETS = ['JWT_ACCESS_SECRET', 'JWT_REFRESH_SECRET'];

for (const key of REQUIRED_SECRETS) {
    if (!process.env[key] || process.env[key].length < 32) {
        throw new Error(`${key} must be set and at least 32 characters. Got: ${process.env[key] ? 'too short' : 'undefined'}`);
    }
}

const config = {
    env: process.env.NODE_ENV || 'development',
    port: parseInt(process.env.PORT, 10) || 5000,

    mongodb: {
        uri: process.env.MONGODB_URI,
        retryAttempts: parseInt(process.env.MONGODB_RETRY_ATTEMPTS, 10) || 5,
        retryDelay: parseInt(process.env.MONGODB_RETRY_DELAY, 10) || 1000,
    },

    jwt: {
        accessSecret: process.env.JWT_ACCESS_SECRET,
        refreshSecret: process.env.JWT_REFRESH_SECRET,
        accessExpiresIn: process.env.JWT_ACCESS_EXPIRES_IN || '15m',
        refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
    },

    cors: {
        frontendUrls: (process.env.FRONTEND_URL || 'http://localhost:5173')
            .split(',')
            .map(url => url.trim().replace(/\/$/, ''))
            .filter(url => url && url !== '*'),
    },

    google: {
        clientId: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    },

    rateLimit: {
        windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS, 10) || 15 * 60 * 1000,
        maxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS, 10) || 5,
    },

    adminEmail: process.env.ADMIN_EMAIL || null,
};

module.exports = config;
