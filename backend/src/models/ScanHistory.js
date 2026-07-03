const mongoose = require('mongoose');

/**
 * Scan History Model
 * Tracks resume scans for user analytics and dashboard history
 */
const scanHistorySchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null,
        index: true,
    },
    ipAddress: {
        type: String,
        index: true,
    },
    filename: {
        type: String,
        required: true,
    },
    fileSize: {
        type: Number,
    },
    score: {
        type: Number,
    },
    coreSkillsMatch: {
        type: Number,
    },
    optionalSkillsMatch: {
        type: Number,
    },
    jobTitle: {
        type: String,
    },
}, {
    timestamps: true,
});

scanHistorySchema.index({ userId: 1, createdAt: -1 });

const ScanHistory = mongoose.model('ScanHistory', scanHistorySchema);

module.exports = ScanHistory;
