/**
 * MongoDB connection with retry logic.
 * Uses exponential backoff (1s, 2s, 4s...) up to 5 retries.
 */

const mongoose = require('mongoose');
const config = require('./env');

// Connection state tracking
let isConnected = false;
let connectionPromise = null;
let retryCount = 0;

// Configuration
const MAX_RETRIES = config.mongodb?.retryAttempts || 5;
const BASE_RETRY_DELAY = config.mongodb?.retryDelay || 1000; // 1 second

/**
 * Calculate exponential backoff delay
 * @param {number} attempt - Current attempt number (0-indexed)
 * @returns {number} Delay in milliseconds
 */
const getRetryDelay = (attempt) => {
    return Math.min(BASE_RETRY_DELAY * Math.pow(2, attempt), 30000); // Max 30 seconds
};

/**
 * Connect to MongoDB with retry logic
 * @returns {Promise<mongoose.Connection>}
 */
const connectDB = async () => {
    // Return existing connection promise if already connecting
    if (connectionPromise) {
        return connectionPromise;
    }

    // Return immediately if already connected
    if (isConnected && mongoose.connection.readyState === 1) {
        return mongoose.connection;
    }

    connectionPromise = attemptConnection();
    return connectionPromise;
};

/**
 * Attempt database connection with retries
 * @returns {Promise<mongoose.Connection>}
 */
const attemptConnection = async () => {
    const uri = config.mongodb?.uri || process.env.MONGODB_URI;

    if (!uri) {
        console.error('❌ MongoDB URI not configured. Set MONGODB_URI environment variable.');
        throw new Error('MongoDB URI not configured');
    }

    while (retryCount <= MAX_RETRIES) {
        try {
            if (retryCount > 0) {
                console.log(`🔄 Retrying MongoDB connection (attempt ${retryCount}/${MAX_RETRIES})...`);
            } else {
                console.log('🔌 Connecting to MongoDB...');
            }

            const conn = await mongoose.connect(uri, {
                serverSelectionTimeoutMS: 10000,
                socketTimeoutMS: 45000,
                maxPoolSize: 10,
                minPoolSize: 2,
            });

            isConnected = true;
            retryCount = 0;
            connectionPromise = null;
            console.log(`✅ MongoDB Connected: ${conn.connection.host}`);

            return conn.connection;
        } catch (error) {
            retryCount++;

            if (retryCount > MAX_RETRIES) {
                console.error(`❌ MongoDB connection failed after ${MAX_RETRIES} attempts: ${error.message}`);
                connectionPromise = null;
                retryCount = 0;
                throw error;
            }

            const delay = getRetryDelay(retryCount - 1);
            console.warn(`⚠️ MongoDB connection attempt failed: ${error.message}`);
            console.log(`⏳ Waiting ${delay / 1000}s before retry...`);

            await new Promise(resolve => setTimeout(resolve, delay));
        }
    }
};

/**
 * Check if database is currently connected
 * @returns {boolean}
 */
const isDbConnected = () => {
    return isConnected && mongoose.connection.readyState === 1;
};


const getConnectionState = () => {
    const states = { 0: 'disconnected', 1: 'connected', 2: 'connecting', 3: 'disconnecting' };
    return states[mongoose.connection.readyState] || 'unknown';
};

// Setup mongoose connection event handlers
mongoose.connection.on('connected', () => {
    isConnected = true;
    console.log('📡 MongoDB connection established');
});

mongoose.connection.on('disconnected', () => {
    isConnected = false;
    console.log('⚠️ MongoDB Disconnected');
});

mongoose.connection.on('reconnected', () => {
    isConnected = true;
    console.log('🔄 MongoDB Reconnected');
});

mongoose.connection.on('error', (err) => {
    console.error('❌ MongoDB connection error:', err.message);
    isConnected = false;
});

// Handle process termination gracefully
process.on('SIGINT', async () => {
    try {
        await mongoose.connection.close();
        console.log('📴 MongoDB connection closed due to application termination');
        process.exit(0);
    } catch (err) {
        console.error('Error closing MongoDB connection:', err);
        process.exit(1);
    }
});

module.exports = {
    connectDB,
    isDbConnected,
    getConnectionState,
};
