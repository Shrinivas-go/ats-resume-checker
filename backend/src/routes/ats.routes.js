const express = require('express');
const router = express.Router();
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const os = require('os');

const config = require('../config/env');
const { parseResumeText } = require('../../ats/parser.utils');
const { extractTextFromPdf } = require('../../ats/pdfExtract.utils');
const { analyzeResume } = require('../../ats/analyzer.utils');
const { extractJDSkills } = require('../../ats/jd.utils');
const { compareSkills } = require('../../ats/compare.utils');
const { calculateATSScore } = require('../../ats/score.utils');
const { extractWeightedJDSkills } = require('../../ats/jdWeight.utils');
const { compareWeightedSkills } = require('../../ats/compareWeighted.utils');
const { calculateWeightedATSScore } = require('../../ats/scoreWeighted.utils');
const { generateATSFeedback } = require('../../ats/feedback.utils');
const { simulateATSImprovements } = require('../../ats/simulator.utils');
const { optionalAuth } = require('../middlewares/auth');
const { uploadLimiter } = require('../middlewares/rateLimiter');
const { requireCreditsForScan, recordScanUsage } = require('../middlewares/creditGate');

// File upload config — use OS temp dir in production (ephemeral disk)
const uploadDir = config.env === 'production'
  ? path.join(os.tmpdir(), 'ats-uploads')
  : path.join(__dirname, '../../uploads');

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const uniqueName = Date.now() + '-' + file.originalname.replace(/\s+/g, '_');
    cb(null, uniqueName);
  }
});

const fileFilter = (req, file, cb) => {
  const isPdf = file.mimetype === 'application/pdf' || file.mimetype === 'application/x-pdf';
  const isPdfByName = /\.pdf$/i.test(file.originalname || '');
  const isOctetPdf = file.mimetype === 'application/octet-stream' && isPdfByName;

  if (isPdf || isOctetPdf) {
    cb(null, true);
  } else {
    cb(new Error('Only PDF files are allowed!'), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 } // 5 MB
});

/**
 * POST /parse-resume
 * Upload and parse a PDF resume into structured data
 */
router.post('/parse-resume', uploadLimiter, upload.single('resume'), async (req, res) => {
  let filePath = null;

  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded. Please upload a PDF resume.' });
    }

    filePath = req.file.path;
    const dataBuffer = fs.readFileSync(filePath);
    const text = await extractTextFromPdf(dataBuffer);

    if (!text) {
      return res.status(422).json({
        success: false,
        message: 'No readable text in PDF. If it is a scan, use a text-based PDF export.',
      });
    }

    const extractedData = parseResumeText(text);

    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    return res.status(200).json({ success: true, data: extractedData });
  } catch (error) {
    if (filePath && fs.existsSync(filePath)) {
      try { fs.unlinkSync(filePath); } catch (e) { }
    }

    const status = error.statusCode || 500;
    return res.status(status).json({
      success: false,
      message: error.message || 'Error parsing resume',
    });
  }
});

/**
 * POST /extract-jd-skills
 * Extract skills from a job description
 */
router.post('/extract-jd-skills', (req, res) => {
  try {
    const { jobDescription } = req.body;
    if (!jobDescription) {
      return res.status(400).json({ success: false, message: 'jobDescription is required' });
    }
    const skills = extractJDSkills(jobDescription);
    return res.json({ success: true, skills });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Error extracting skills' });
  }
});

/**
 * POST /compare-skills
 * Compare resume skills against job description skills
 */
router.post('/compare-skills', (req, res) => {
  try {
    const { resumeSkills, jobDescription } = req.body;
    if (!resumeSkills || !jobDescription) {
      return res.status(400).json({ success: false, message: 'resumeSkills and jobDescription are required' });
    }
    const jdSkills = extractJDSkills(jobDescription);
    const comparison = compareSkills(resumeSkills, jdSkills);
    return res.json({ success: true, jdSkills, ...comparison });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Error comparing skills' });
  }
});

/**
 * POST /ats-score
 * Calculate basic ATS score (unweighted)
 */
router.post('/ats-score', (req, res) => {
  try {
    const { resumeSkills, jobDescription } = req.body;
    if (!resumeSkills || !jobDescription) {
      return res.status(400).json({ success: false, message: 'resumeSkills and jobDescription are required' });
    }
    const jdSkills = extractJDSkills(jobDescription);
    const { matchedSkills, missingSkills } = compareSkills(resumeSkills, jdSkills);
    const { atsScore, explanation } = calculateATSScore(jdSkills, matchedSkills);
    return res.json({ success: true, atsScore, explanation, matchedSkills, missingSkills });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Error calculating ATS score' });
  }
});

/**
 * POST /ats-score-weighted
 * Calculate weighted ATS score with credit gating
 */
router.post('/ats-score-weighted', optionalAuth, requireCreditsForScan, async (req, res) => {
  try {
    const { resumeSkills, jobDescription } = req.body;
    if (!resumeSkills || !jobDescription) {
      return res.status(400).json({ success: false, message: 'resumeSkills and jobDescription are required' });
    }

    const { coreSkills, optionalSkills } = extractWeightedJDSkills(jobDescription);
    const comparison = compareWeightedSkills(resumeSkills, coreSkills, optionalSkills);
    const { atsScore, explanation } = calculateWeightedATSScore(comparison);
    const feedback = generateATSFeedback({ atsScore, ...comparison });

    // Record scan usage (async, don't block response)
    const scanResult = {
      overallScore: atsScore,
      coreSkillsMatch: comparison.coreMatchPercentage,
      optionalSkillsMatch: comparison.optionalMatchPercentage,
    };
    recordScanUsage(req, scanResult).catch(err => console.error('Scan recording error:', err));

    const creditInfo = req.creditInfo ? {
      creditsRemaining: req.creditInfo.credits - (req.creditInfo.shouldCharge ? 1 : 0),
      isFreeScan: req.creditInfo.isFreeScan || false,
      isAdmin: req.creditInfo.isAdmin || false,
    } : null;

    return res.json({
      success: true,
      atsScore,
      explanation,
      feedback,
      coreSkills,
      optionalSkills,
      ...comparison,
      creditInfo,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Error calculating weighted ATS score' });
  }
});

/**
 * POST /ats-simulator
 * Simulate how adding missing skills would improve the score
 */
router.post('/ats-simulator', (req, res) => {
  try {
    const { resumeSkills, jobDescription } = req.body;
    if (!resumeSkills || !jobDescription) {
      return res.status(400).json({ success: false, message: 'resumeSkills and jobDescription are required' });
    }

    const { coreSkills, optionalSkills } = extractWeightedJDSkills(jobDescription);
    const comparison = compareWeightedSkills(resumeSkills, coreSkills, optionalSkills);
    const simulation = simulateATSImprovements({ coreSkills, optionalSkills, ...comparison });

    return res.json({ success: true, ...simulation });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Error running ATS simulation' });
  }
});

/**
 * POST /ats-analyze
 * Full resume analysis against a job description
 */
router.post('/ats-analyze', (req, res) => {
  try {
    const { parsedResume, jobDescription } = req.body;
    if (!parsedResume || !jobDescription) {
      return res.status(400).json({ success: false, message: 'parsedResume and jobDescription are required' });
    }

    const result = analyzeResume(parsedResume, jobDescription);
    return res.json(result);
  } catch (error) {
    console.error('Analysis error:', error);
    return res.status(500).json({ success: false, message: 'Error analyzing resume' });
  }
});

module.exports = router;
