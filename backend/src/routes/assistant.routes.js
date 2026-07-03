const express = require('express');
const router = express.Router();
const { processQuery, getSuggestedActions } = require('../ai/assistant');

/**
 * POST /assistant/query
 * Process a natural language query about the candidate's resume/ATS result.
 */
router.post('/query', async (req, res) => {
    try {
        const { query, analysisResult } = req.body;

        if (!query || typeof query !== 'string') {
            return res.status(400).json({
                success: false,
                error: 'Query is required and must be a string'
            });
        }

        if (query.length > 500) {
            return res.status(400).json({
                success: false,
                error: 'Query is too long. Please keep it under 500 characters.'
            });
        }

        const response = await processQuery(query, analysisResult || null);
        return res.json(response);
    } catch (error) {
        return res.status(500).json({
            success: false,
            error: 'Failed to process query',
            message: 'An unexpected error occurred. Please try again.'
        });
    }
});

/**
 * POST /assistant/suggestions
 * Get suggested quick actions based on ATS result.
 */
router.post('/suggestions', async (req, res) => {
    try {
        const { analysisResult } = req.body;
        const suggestions = getSuggestedActions(analysisResult || null);
        return res.json({
            success: true,
            suggestions
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            error: 'Failed to get suggestions'
        });
    }
});

module.exports = router;
