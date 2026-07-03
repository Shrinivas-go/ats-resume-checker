require('dotenv').config();

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');
const multer = require('multer');

const config = require('./src/config/env');
const { connectDB, getConnectionState } = require('./src/config/database');
const { apiLimiter } = require('./src/middlewares/rateLimiter');

// Route modules
const authRoutes = require('./src/routes/auth.routes');
const creditRoutes = require('./src/routes/credit.routes');
const profileRoutes = require('./src/routes/profile.routes');
const supportRoutes = require('./src/routes/support.routes');
const jdRoutes = require('./src/routes/jd.routes');
const assistantRoutes = require('./src/routes/assistant.routes');
const atsRoutes = require('./src/routes/ats.routes');

const app = express();

// Security headers
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));

// CORS
app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    if (config.cors.frontendUrls.includes('*') || config.cors.frontendUrls.includes(origin)) {
      callback(null, true);
    } else {
      console.warn(`CORS blocked origin: ${origin}`);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// Rate limiting on all /api routes
app.use('/api', apiLimiter);

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    database: getConnectionState(),
    timestamp: new Date().toISOString(),
  });
});

// Root route
app.get('/', (req, res) => {
  res.json({ message: 'ATS Resume Checker API', version: '2.0' });
});

// Mount routes
app.use('/auth', authRoutes);
app.use('/credits', creditRoutes);
app.use('/profile', profileRoutes);
app.use('/support', supportRoutes);
app.use('/jd', jdRoutes);
app.use('/assistant', assistantRoutes);
app.use('/', atsRoutes); // ATS endpoints at root level for backward compatibility

// 404 handler
app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Server error:', err.message);

  if (err.message === 'Not allowed by CORS') {
    return res.status(403).json({ success: false, message: 'CORS verification failed' });
  }

  if (err instanceof multer.MulterError) {
    return res.status(400).json({ success: false, message: 'File upload error: ' + err.message });
  }

  if (err.message === 'Only PDF files are allowed!') {
    return res.status(400).json({ success: false, message: err.message });
  }

  res.status(500).json({ success: false, message: 'Internal server error' });
});

// Start server
const PORT = config.port || 5000;

const startServer = async () => {
  try {
    await connectDB();
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to connect to database:', error.message);
    // Start anyway for health checks and non-DB routes
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`Server running on port ${PORT} (DB disconnected)`);
    });
  }
};

startServer();
