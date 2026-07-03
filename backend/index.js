require('dotenv').config();

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');
const multer = require('multer');

const config = require('./src/config/env');
const { connectDB, getConnectionState } = require('./src/config/database');
const { apiLimiter } = require('./src/middlewares/rateLimiter');

const authRoutes = require('./src/routes/auth.routes');
const profileRoutes = require('./src/routes/profile.routes');
const jdRoutes = require('./src/routes/jd.routes');
const assistantRoutes = require('./src/routes/assistant.routes');
const atsRoutes = require('./src/routes/ats.routes');

const app = express();

app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));

app.use(cors({
    origin(origin, callback) {
        if (!origin) return callback(null, true);
        if (config.cors.frontendUrls.includes(origin)) return callback(null, true);
        callback(new Error('Not allowed by CORS'));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());
app.use('/api', apiLimiter);

app.get('/health', (req, res) => {
    res.json({ status: 'ok', database: getConnectionState(), timestamp: new Date().toISOString() });
});

app.use('/auth', authRoutes);
app.use('/profile', profileRoutes);
app.use('/jd', jdRoutes);
app.use('/assistant', assistantRoutes);
app.use('/', atsRoutes);

app.use((req, res) => {
    res.status(404).json({ success: false, message: 'Route not found' });
});

app.use((err, req, res, _next) => {
    if (err.message === 'Not allowed by CORS') {
        return res.status(403).json({ success: false, message: 'CORS blocked' });
    }
    if (err instanceof multer.MulterError) {
        return res.status(400).json({ success: false, message: `Upload error: ${err.message}` });
    }
    if (err.message === 'Only PDF files are allowed!') {
        return res.status(400).json({ success: false, message: err.message });
    }
    console.error('Unhandled error:', err.message);
    res.status(500).json({ success: false, message: 'Internal server error' });
});

const PORT = config.port;

const startServer = async () => {
    try {
        await connectDB();
    } catch (error) {
        console.error('Database connection failed:', error.message);
    }
    app.listen(PORT, '0.0.0.0', () => {
        console.error(`Server listening on port ${PORT}`);
    });
};

startServer();
