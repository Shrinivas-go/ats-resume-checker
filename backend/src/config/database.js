const mongoose = require('mongoose');
const config = require('./env');

let isConnected = false;
let connectionPromise = null;

const MAX_RETRIES = config.mongodb.retryAttempts;
const BASE_DELAY = config.mongodb.retryDelay;

/** Exponential backoff capped at 30 seconds. */
const getRetryDelay = (attempt) => Math.min(BASE_DELAY * Math.pow(2, attempt), 30000);

/**
 * Connect to MongoDB with retry logic.
 * Reuses an in-flight connection promise to avoid duplicate connections.
 */
const connectDB = async () => {
    if (connectionPromise) return connectionPromise;
    if (isConnected && mongoose.connection.readyState === 1) return mongoose.connection;
    connectionPromise = attemptConnection();
    return connectionPromise;
};

const attemptConnection = async () => {
    const uri = config.mongodb.uri;
    if (!uri) throw new Error('MONGODB_URI not configured');

    let retries = 0;
    while (retries <= MAX_RETRIES) {
        try {
            const conn = await mongoose.connect(uri, {
                serverSelectionTimeoutMS: 10000,
                socketTimeoutMS: 45000,
                maxPoolSize: 10,
                minPoolSize: 2,
            });
            isConnected = true;
            connectionPromise = null;
            return conn.connection;
        } catch (error) {
            retries++;
            if (retries > MAX_RETRIES) {
                connectionPromise = null;
                throw error;
            }
            const delay = getRetryDelay(retries - 1);
            await new Promise(resolve => setTimeout(resolve, delay));
        }
    }
};

const isDbConnected = () => isConnected && mongoose.connection.readyState === 1;

const getConnectionState = () => {
    const states = { 0: 'disconnected', 1: 'connected', 2: 'connecting', 3: 'disconnecting' };
    return states[mongoose.connection.readyState] || 'unknown';
};

mongoose.connection.on('connected', () => { isConnected = true; });
mongoose.connection.on('disconnected', () => { isConnected = false; });
mongoose.connection.on('error', () => { isConnected = false; });

process.on('SIGINT', async () => {
    try { await mongoose.connection.close(); } catch { /* swallow */ }
    process.exit(0);
});

module.exports = { connectDB, isDbConnected, getConnectionState };
