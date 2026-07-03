const express = require('express');
const router = express.Router();
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const os = require('os');

const config = require('../config/env');
const { parseResumeText } = require('../../ats/parser');
const { extractTextFromPdf } = require('../../ats/pdfExtract');
const { analyzeResume } = require('../../ats/analyzer');
const { extractJDSkills, extractWeightedJDSkills } = require('../../ats/jd');
const { compareSkills, compareWeightedSkills } = require('../../ats/compare');
const { calculateATSScore, calculateWeightedATSScore } = require('../../ats/score');
const { generateATSFeedback } = require('../../ats/feedback');
const { simulateATSImprovements } = require('../../ats/simulator');
const { auth, optionalAuth } = require('../middlewares/auth');
const { uploadLimiter } = require('../middlewares/rateLimiter');
const ScanHistory = require('../models/ScanHistory');

const uploadDir = config.env === 'production'
    ? path.join(os.tmpdir(), 'ats-uploads')
    : path.join(__dirname, '../../uploads');

if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, uploadDir),
    filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname.replace(/\s+/g, '_')}`),
});

const fileFilter = (req, file, cb) => {
    const isPdf = file.mimetype === 'application/pdf' || file.mimetype === 'application/x-pdf';
    const hasPdfExt = /\.pdf$/i.test(file.originalname || '');
    const isOctetPdf = file.mimetype === 'application/octet-stream' && hasPdfExt;
    cb(isPdf || isOctetPdf ? null : new Error('Only PDF files are allowed!'), isPdf || isOctetPdf);
};

const upload = multer({ storage, fileFilter, limits: { fileSize: 5 * 1024 * 1024 } });

/** Always delete the uploaded file after processing. */
function cleanupFile(filePath) {
    if (filePath && fs.existsSync(filePath)) {
        try { fs.unlinkSync(filePath); } catch { /* best-effort cleanup */ }
    }
}

/** POST /parse-resume — Upload PDF, return structured resume data. */
router.post('/parse-resume', uploadLimiter, upload.single('resume'), async (req, res) => {
    let filePath = null;
    try {
        if (!req.file) return res.status(400).json({ success: false, message: 'No file uploaded' });
        filePath = req.file.path;

        const text = await extractTextFromPdf(fs.readFileSync(filePath));
        if (!text) {
            return res.status(422).json({ success: false, message: 'No readable text in PDF. Use a text-based export.' });
        }

        const data = parseResumeText(text);
        return res.json({ success: true, data });
    } catch (error) {
        return res.status(error.statusCode || 500).json({ success: false, message: error.message || 'Error parsing resume' });
    } finally {
        cleanupFile(filePath);
    }
});

/** POST /extract-jd-skills — Extract skills from job description text. */
router.post('/extract-jd-skills', (req, res) => {
    const { jobDescription } = req.body;
    if (!jobDescription) return res.status(400).json({ success: false, message: 'jobDescription is required' });
    const skills = extractJDSkills(jobDescription);
    return res.json({ success: true, skills });
});

/** POST /compare-skills — Compare resume skills against JD. */
router.post('/compare-skills', (req, res) => {
    const { resumeSkills, jobDescription } = req.body;
    if (!resumeSkills || !jobDescription) {
        return res.status(400).json({ success: false, message: 'resumeSkills and jobDescription are required' });
    }
    const jdSkills = extractJDSkills(jobDescription);
    const comparison = compareSkills(resumeSkills, jdSkills);
    return res.json({ success: true, jdSkills, ...comparison });
});

/** POST /ats-score — Unweighted ATS score. */
router.post('/ats-score', (req, res) => {
    const { resumeSkills, jobDescription } = req.body;
    if (!resumeSkills || !jobDescription) {
        return res.status(400).json({ success: false, message: 'resumeSkills and jobDescription are required' });
    }
    const jdSkills = extractJDSkills(jobDescription);
    const { matchedSkills, missingSkills } = compareSkills(resumeSkills, jdSkills);
    const { atsScore, explanation } = calculateATSScore(jdSkills, matchedSkills);
    return res.json({ success: true, atsScore, explanation, matchedSkills, missingSkills });
});

/** POST /ats-score-weighted — Full weighted score with optional scan tracking. */
router.post('/ats-score-weighted', optionalAuth, async (req, res) => {
    try {
        const { resumeSkills, jobDescription } = req.body;
        if (!resumeSkills || !jobDescription) {
            return res.status(400).json({ success: false, message: 'resumeSkills and jobDescription are required' });
        }

        const { coreSkills, optionalSkills } = extractWeightedJDSkills(jobDescription);
        const comparison = compareWeightedSkills(resumeSkills, coreSkills, optionalSkills);
        const { atsScore, explanation } = calculateWeightedATSScore(comparison);
        const feedback = generateATSFeedback({ atsScore, ...comparison });

        // Fire-and-forget scan recording
        recordScan(req, atsScore, comparison).catch(() => {});

        return res.json({ success: true, atsScore, explanation, feedback, coreSkills, optionalSkills, ...comparison });
    } catch (error) {
        return res.status(500).json({ success: false, message: 'Error calculating weighted score' });
    }
});

/** POST /ats-simulator — What-if skill addition simulation. */
router.post('/ats-simulator', (req, res) => {
    const { resumeSkills, jobDescription } = req.body;
    if (!resumeSkills || !jobDescription) {
        return res.status(400).json({ success: false, message: 'resumeSkills and jobDescription are required' });
    }
    const { coreSkills, optionalSkills } = extractWeightedJDSkills(jobDescription);
    const comparison = compareWeightedSkills(resumeSkills, coreSkills, optionalSkills);
    const simulation = simulateATSImprovements({ coreSkills, optionalSkills, ...comparison });
    return res.json({ success: true, ...simulation });
});

/** POST /ats-analyze — Full orchestrated resume analysis. */
router.post('/ats-analyze', (req, res) => {
    const { parsedResume, jobDescription } = req.body;
    if (!parsedResume || !jobDescription) {
        return res.status(400).json({ success: false, message: 'parsedResume and jobDescription are required' });
    }
    const result = analyzeResume(parsedResume, jobDescription);
    return res.json(result);
});

/** GET /ats/history — Fetch user's scan history and analytics. */
router.get('/ats/history', auth, async (req, res) => {
    try {
        const limit = Math.min(parseInt(req.query.limit) || 10, 50);
        const scans = await ScanHistory.find({ userId: req.user.id })
            .sort({ createdAt: -1 })
            .limit(limit)
            .lean();

        // Calculate stats
        const validScores = scans.filter(s => s.score != null);
        const avgScore = validScores.length > 0
            ? Math.round(validScores.reduce((sum, s) => sum + s.score, 0) / validScores.length)
            : 0;

        return res.json({
            success: true,
            scans,
            stats: {
                totalScans: scans.length,
                avgScore
            }
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: 'Error fetching scan history' });
    }
});

/** Record scan for analytics (non-blocking). */
async function recordScan(req, score, comparison) {
    const ip = req.headers['x-forwarded-for']?.split(',')[0]?.trim() || req.ip || 'unknown';
    await ScanHistory.create({
        userId: req.user?.id || null,
        ipAddress: ip,
        filename: req.file?.originalname || 'web-analysis',
        score,
        coreSkillsMatch: comparison.coreMatchPercentage,
        optionalSkillsMatch: comparison.optionalMatchPercentage,
        jobTitle: req.body?.jobTitle,
    });
}

module.exports = router;
