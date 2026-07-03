const { MongoMemoryServer } = require('mongodb-memory-server');
const { connectDB } = require('../../src/config/database');
const config = require('../../src/config/env');
const mongoose = require('mongoose');

let mongoServer;

/**
 * Connect to in-memory MongoDB before tests
 */
async function connect() {
    // Create in-memory MongoDB instance
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();

    // Configure mongoose via connectDB wrapper
    process.env.MONGODB_URI = mongoUri;
    config.mongodb.uri = mongoUri;
    await connectDB();

    return mongoUri;
}

/**
 * Clear all collections between tests
 */
async function clearDatabase() {
    const collections = mongoose.connection.collections;
    for (const key in collections) {
        await collections[key].deleteMany({});
    }
}

/**
 * Close connection and stop MongoDB server
 */
async function disconnect() {
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
    if (mongoServer) {
        await mongoServer.stop();
    }
}

module.exports = {
    connect,
    clearDatabase,
    disconnect,
};
