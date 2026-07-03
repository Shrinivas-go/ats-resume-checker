const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../../.env') });

const config = {
    env: process.env.NODE_ENV || 'development',
    port: parseInt(process.env.PORT, 10) || 5000,

    mongodb: {
        uri: process.env.MONGODB_URI,
        retryAttempts: parseInt(process.env.MONGODB_RETRY_ATTEMPTS, 10) || 5,
        retryDelay: parseInt(process.env.MONGODB_RETRY_DELAY, 10) || 1000, // Base delay in ms
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
            .filter(Boolean),
    },

    rateLimit: {
        windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS, 10) || 15 * 60 * 1000, // 15 min
        maxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS, 10) || 5,
    },

    google: {
        clientId: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    },
};

module.exports = config;
