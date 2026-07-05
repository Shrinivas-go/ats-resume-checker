require('dotenv').config();
const dns = require('dns');
dns.setDefaultResultOrder('ipv4first');

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');
const multer = require('multer');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const fs = require('fs');
const path = require('path');
const { OAuth2Client } = require('google-auth-library');

// Import our database models and ATS checker utilities
const { User, ScanHistory } = require('./models');
const {
    extractTextFromPdf,
    extractContactInfo,
    extractSkills,
    extractWeightedJDSkills,
    compareWeightedSkills,
    calculateWeightedATSScore,
    predictCategoryAndConfidence
} = require('./ats_checker');

const app = express();
const PORT = process.env.PORT || 5000;

// Configuration options
const JWT_ACCESS_SECRET = process.env.JWT_ACCESS_SECRET || 'fallback-access-secret-32-chars-minimum-here';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'fallback-refresh-secret-32-chars-minimum-here';
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || '';

// Connect to database
const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/ats-resume-checker');
        console.log('MongoDB connected successfully!');
    } catch (err) {
        console.error('MongoDB connection error:', err.message);
    }
};
connectDB();

// Express middleware configuration
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
app.use(cors({
    origin: FRONTEND_URL,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// Multer setup for temporary file uploads
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}
const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, uploadDir),
    filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname.replace(/\s+/g, '_')}`)
});
const fileFilter = (req, file, cb) => {
    // Only allow PDFs
    if (file.mimetype === 'application/pdf' || /\.pdf$/i.test(file.originalname)) {
        cb(null, true);
    } else {
        cb(new Error('Only PDF files are allowed!'), false);
    }
};
const upload = multer({ storage, fileFilter, limits: { fileSize: 5 * 1024 * 1024 } });

// JWT helper functions
const ACCESS_COOKIE_MAX_AGE = 15 * 60 * 1000;       // 15 minutes
const REFRESH_COOKIE_MAX_AGE = 7 * 24 * 60 * 60 * 1000; // 7 days

const getCookieOptions = (maxAge) => ({
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    maxAge,
    path: '/',
});

// Generate both access and refresh tokens
function generateTokens(userId, role) {
    const accessToken = jwt.sign({ userId, role }, JWT_ACCESS_SECRET, { expiresIn: '15m' });
    const refreshToken = jwt.sign({ userId }, JWT_REFRESH_SECRET, { expiresIn: '7d' });
    return { accessToken, refreshToken };
}

// Auth middlewares
// Checks if the user is logged in using JWT access tokens.
// If the access token is missing or expired, it tries to silently refresh it using the refresh token.
async function authMiddleware(req, res, next) {
    let accessToken = req.cookies?.accessToken;
    
    // Also allow bearer token in Authorization header
    if (!accessToken && req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
        accessToken = req.headers.authorization.split(' ')[1];
    }

    if (!accessToken) {
        // No access token: try to refresh using refresh token
        return handleSilentRefresh(req, res, next);
    }

    try {
        const decoded = jwt.verify(accessToken, JWT_ACCESS_SECRET);
        req.user = { id: decoded.userId, role: decoded.role };
        return next();
    } catch (err) {
        // Access token is invalid or expired, try silent refresh
        return handleSilentRefresh(req, res, next);
    }
}

// Optional Auth: doesn't block if not logged in, but sets req.user if token is present
async function optionalAuthMiddleware(req, res, next) {
    let accessToken = req.cookies?.accessToken;
    if (!accessToken && req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
        accessToken = req.headers.authorization.split(' ')[1];
    }

    if (!accessToken) {
        const refreshToken = req.cookies?.refreshToken;
        if (refreshToken) {
            try {
                const decodedRef = jwt.verify(refreshToken, JWT_REFRESH_SECRET);
                const user = await User.findById(decodedRef.userId);
                if (user) {
                    const tokens = generateTokens(user._id, user.role);
                    res.cookie('accessToken', tokens.accessToken, getCookieOptions(ACCESS_COOKIE_MAX_AGE));
                    res.cookie('refreshToken', tokens.refreshToken, getCookieOptions(REFRESH_COOKIE_MAX_AGE));
                    req.user = { id: user._id.toString(), role: user.role };
                }
            } catch (e) { /* ignore */ }
        }
        return next();
    }

    try {
        const decoded = jwt.verify(accessToken, JWT_ACCESS_SECRET);
        req.user = { id: decoded.userId, role: decoded.role };
    } catch (err) {
        // Expired access token, try refresh
        const refreshToken = req.cookies?.refreshToken;
        if (refreshToken) {
            try {
                const decodedRef = jwt.verify(refreshToken, JWT_REFRESH_SECRET);
                const user = await User.findById(decodedRef.userId);
                if (user) {
                    const tokens = generateTokens(user._id, user.role);
                    res.cookie('accessToken', tokens.accessToken, getCookieOptions(ACCESS_COOKIE_MAX_AGE));
                    res.cookie('refreshToken', tokens.refreshToken, getCookieOptions(REFRESH_COOKIE_MAX_AGE));
                    req.user = { id: user._id.toString(), role: user.role };
                }
            } catch (e) { /* ignore */ }
        }
    }
    next();
}

async function handleSilentRefresh(req, res, next) {
    const refreshToken = req.cookies?.refreshToken;
    if (!refreshToken) {
        req.user = null;
        return next(); // Proceed without user auth (will fail on protected routes)
    }

    try {
        const decodedRef = jwt.verify(refreshToken, JWT_REFRESH_SECRET);
        const user = await User.findById(decodedRef.userId);
        if (!user) {
            req.user = null;
            return next();
        }

        // Issue new tokens
        const tokens = generateTokens(user._id, user.role);
        res.cookie('accessToken', tokens.accessToken, getCookieOptions(ACCESS_COOKIE_MAX_AGE));
        res.cookie('refreshToken', tokens.refreshToken, getCookieOptions(REFRESH_COOKIE_MAX_AGE));
        
        req.user = { id: user._id.toString(), role: user.role };
        next();
    } catch (err) {
        // Refresh token expired or corrupt: clear cookies
        res.clearCookie('accessToken', { path: '/' });
        res.clearCookie('refreshToken', { path: '/' });
        req.user = null;
        next();
    }
}

// Require auth helper
function requireAuth(req, res, next) {
    if (!req.user) {
        return res.status(401).json({ success: false, message: 'Authentication required. Please log in.' });
    }
    next();
}

// Authentication endpoints

// User registration
app.post('/auth/register', async (req, res) => {
    try {
        const { name, email, password } = req.body;
        if (!name || !email || !password) {
            return res.status(400).json({ success: false, message: 'All fields are required' });
        }

        const existing = await User.findOne({ email });
        if (existing) {
            return res.status(400).json({ success: false, message: 'User with this email already exists' });
        }

        const user = await User.create({ name, email, password });
        const tokens = generateTokens(user._id, user.role);

        res.cookie('accessToken', tokens.accessToken, getCookieOptions(ACCESS_COOKIE_MAX_AGE));
        res.cookie('refreshToken', tokens.refreshToken, getCookieOptions(REFRESH_COOKIE_MAX_AGE));

        return res.status(201).json({
            success: true,
            message: 'Registration successful',
            user: user.toJSON(),
            tokens
        });
    } catch (err) {
        return res.status(500).json({ success: false, message: err.message });
    }
});

// User login
app.post('/auth/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ success: false, message: 'Email and password are required' });
        }

        const user = await User.findOne({ email }).select('+password');
        if (!user) {
            return res.status(401).json({ success: false, message: 'Invalid email or password' });
        }

        // Google-only accounts have no password — prevent bcrypt crash
        if (!user.password) {
            return res.status(401).json({
                success: false,
                message: 'This account was created with Google. Please use Google Login instead.'
            });
        }

        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(401).json({ success: false, message: 'Invalid email or password' });
        }

        const tokens = generateTokens(user._id, user.role);

        res.cookie('accessToken', tokens.accessToken, getCookieOptions(ACCESS_COOKIE_MAX_AGE));
        res.cookie('refreshToken', tokens.refreshToken, getCookieOptions(REFRESH_COOKIE_MAX_AGE));

        return res.json({
            success: true,
            message: 'Login successful',
            user: user.toJSON(),
            tokens
        });
    } catch (err) {
        return res.status(500).json({ success: false, message: err.message });
    }
});

// Google OAuth Login
app.post('/auth/google', async (req, res) => {
    try {
        const { credential } = req.body;
        if (!credential) {
            return res.status(400).json({ success: false, message: 'Google credential required' });
        }

        const client = new OAuth2Client(GOOGLE_CLIENT_ID);
        let ticket;
        try {
            ticket = await client.verifyIdToken({
                idToken: credential,
                audience: GOOGLE_CLIENT_ID,
            });
        } catch (err) {
            return res.status(401).json({ success: false, message: 'Google token verification failed' });
        }

        const payload = ticket.getPayload();
        const { sub: googleId, email, name } = payload;

        if (!googleId || !email) {
            return res.status(400).json({ success: false, message: 'Invalid Google token payload' });
        }

        // Find or create the user in MongoDB Atlas
        let user = await User.findOne({ $or: [{ googleId }, { email }] });

        if (user) {
            // Update googleId and provider if they logged in locally before
            if (!user.googleId) {
                user.googleId = googleId;
                user.authProvider = 'google';
                await user.save();
            }
        } else {
            // Create new Google OAuth user
            user = await User.create({
                name: name || 'Google User',
                email,
                googleId,
                authProvider: 'google',
            });
        }

        const tokens = generateTokens(user._id, user.role);

        res.cookie('accessToken', tokens.accessToken, getCookieOptions(ACCESS_COOKIE_MAX_AGE));
        res.cookie('refreshToken', tokens.refreshToken, getCookieOptions(REFRESH_COOKIE_MAX_AGE));

        return res.json({
            success: true,
            message: 'Google login successful',
            user: user.toJSON(),
            tokens
        });
    } catch (err) {
        return res.status(500).json({ success: false, message: err.message });
    }
});

// Refresh tokens
app.post('/auth/refresh', async (req, res) => {
    const refreshToken = req.cookies?.refreshToken || req.body?.refreshToken;
    if (!refreshToken) {
        return res.status(401).json({ success: false, message: 'Refresh token required' });
    }
    try {
        const decoded = jwt.verify(refreshToken, JWT_REFRESH_SECRET);
        const user = await User.findById(decoded.userId);
        if (!user) {
            return res.status(401).json({ success: false, message: 'User not found' });
        }
        const tokens = generateTokens(user._id, user.role);
        res.cookie('accessToken', tokens.accessToken, getCookieOptions(ACCESS_COOKIE_MAX_AGE));
        res.cookie('refreshToken', tokens.refreshToken, getCookieOptions(REFRESH_COOKIE_MAX_AGE));
        return res.json({ success: true, tokens });
    } catch (err) {
        res.clearCookie('accessToken', { path: '/' });
        res.clearCookie('refreshToken', { path: '/' });
        return res.status(401).json({ success: false, message: 'Invalid refresh token' });
    }
});

// User logout
app.post('/auth/logout', (req, res) => {
    res.clearCookie('accessToken', { path: '/' });
    res.clearCookie('refreshToken', { path: '/' });
    return res.json({ success: true, message: 'Logged out successfully' });
});

// Get current logged-in user profile
app.get('/auth/me', authMiddleware, requireAuth, async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }
        return res.json({ success: true, user: user.toJSON() });
    } catch (err) {
        return res.status(500).json({ success: false, message: err.message });
    }
});

// Core resume analyzer routes

// Processes uploaded PDF resume and target Job Description text
app.post('/api/analyze', optionalAuthMiddleware, upload.single('resume'), async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ success: false, message: 'We couldn\'t find a file. Please select a resume PDF to upload.' });
    }

    const jobDescription = req.body.jobDescription || '';
    const jobTitle = req.body.jobTitle || 'General Scan';
    const filePath = req.file.path;

    try {
        // 1. Read the PDF content
        const buffer = fs.readFileSync(filePath);
        const resumeText = await extractTextFromPdf(buffer);

        if (!resumeText) {
            return res.status(422).json({
                success: false,
                message: 'We couldn\'t find any readable text in your resume. If this is a scanned image, please convert it to a text-based PDF (e.g., save directly from Word or Google Docs).'
            });
        }

        // 2. Predict job category using local JS classifier
        const prediction = predictCategoryAndConfidence(resumeText);
        const predictedCategory = prediction.category;
        const predictionConfidence = prediction.confidence;
        const similarityScore = null;

        // 3. Extract contact info and skills from resume text
        const contactInfo = extractContactInfo(resumeText);
        const resumeSkills = extractSkills(resumeText);

        // 4. Extract skills from Job Description and compare
        const { coreSkills, optionalSkills } = extractWeightedJDSkills(jobDescription);
        const comparison = compareWeightedSkills(resumeSkills, coreSkills, optionalSkills);

        // 5. Calculate Weighted ATS Score, Explanation, Gaps & Strengths
        const { atsScore, explanation, details, confidence } = calculateWeightedATSScore(comparison, resumeText, jobDescription, similarityScore);

        const results = {
            success: true,
            score: atsScore,
            explanation,
            details,
            predictedCategory,
            predictionConfidence: confidence / 100,
            contactInfo,
            skillsAnalyzed: {
                resumeSkillsCount: resumeSkills.length,
                matchedCoreCount: comparison.matchedCoreSkills.length,
                missingCoreCount: comparison.missingCoreSkills.length,
                matchedCore: comparison.matchedCoreSkills,
                missingCore: comparison.missingCoreSkills,
                matchedOptional: comparison.matchedOptionalSkills,
                missingOptional: comparison.missingOptionalSkills,
            }
        };

        // 6. Save in ScanHistory if user is logged in
        if (req.user) {
            const scan = await ScanHistory.create({
                userId: req.user.id,
                ipAddress: req.ip || '127.0.0.1',
                filename: req.file.originalname,
                fileSize: req.file.size,
                score: atsScore,
                coreSkillsMatch: comparison.coreMatchPercentage,
                optionalSkillsMatch: comparison.optionalMatchPercentage,
                jobTitle: jobTitle,
                predictedCategory,
                matchedSkills: [...comparison.matchedCoreSkills, ...comparison.matchedOptionalSkills],
                missingSkills: [...comparison.missingCoreSkills, ...comparison.missingOptionalSkills],
                contactInfo: contactInfo
            });
            results.scanId = scan._id;
            
            // Increment total scans count for the user
            await User.findByIdAndUpdate(req.user.id, { $inc: { totalScans: 1 } });
        }

        return res.json(results);
    } catch (err) {
        console.error('Resume analysis error:', err);
        return res.status(500).json({ success: false, message: err.message || 'An unexpected error occurred while analyzing your resume. Please try again.' });
    } finally {
        // Clean up the uploaded file to prevent disk fill-up
        if (fs.existsSync(filePath)) {
            try {
                fs.unlinkSync(filePath);
            } catch (cleanErr) {
                console.error('File cleanup error:', cleanErr.message);
            }
        }
    }
});

// Fetch user's scan history list
app.get('/api/history', authMiddleware, requireAuth, async (req, res) => {
    try {
        const scans = await ScanHistory.find({ userId: req.user.id })
            .sort({ createdAt: -1 })
            .limit(20)
            .lean();

        return res.json({ success: true, scans });
    } catch (err) {
        return res.status(500).json({ success: false, message: 'Failed to fetch scan history.' });
    }
});

// Simple health check and status verification
app.get('/health', (req, res) => {
    res.json({
        status: 'ok',
        database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
        timestamp: new Date().toISOString()
    });
});

// Catch-all route handler for 404
app.use((req, res) => {
    res.status(404).json({ success: false, message: 'Route not found' });
});

// Centralized error handling
app.use((err, req, res, next) => {
    if (err instanceof multer.MulterError) {
        return res.status(400).json({ success: false, message: `Upload error: ${err.message}` });
    }
    console.error('Centralized error handler:', err.message);
    res.status(500).json({ success: false, message: err.message || 'Internal Server Error' });
});

app.listen(PORT, () => {
    console.log(`Node Express backend running on port ${PORT}`);
});
