/**
 * SERVER.JS - Backend Entry Point
 * Interactive Panhellenic Exam Coach API Server
 */

const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');

// Import route handlers
const authRoutes = require('./api/auth.routes');
const textbookRoutes = require('./api/textbook.routes');
const testRoutes = require('./api/test.routes');
const generatorRoutes = require('./api/generator.routes');
const pastExamRoutes = require('./api/past-exam.routes');
const essayRoutes = require('./api/essay.routes');
const userRoutes = require('./api/user.routes');
const pdfExplainRoutes = require('./api/pdf-explain.routes');

const app = express();
const isProduction = process.env.NODE_ENV === 'production';

function buildAllowedOrigins() {
  const configuredOrigins = String(process.env.FRONTEND_URL || '')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);
  const localOrigins = [
    'http://localhost:3000',
    'http://localhost:5000',
    'http://127.0.0.1:3000',
    'http://127.0.0.1:5000',
  ];
  const productionOrigins = ['https://panhel-app.onrender.com'];

  return new Set([...localOrigins, ...productionOrigins, ...configuredOrigins]);
}

const allowedOrigins = buildAllowedOrigins();
const localhostOriginPattern = /^https?:\/\/(localhost|127\.0\.0\.1|\[::1\]):\d+$/;
const allowAnyOriginInDev = process.env.ALLOW_ALL_CORS === 'true' || !isProduction;

// === Security & Middleware ===
app.disable('x-powered-by');
app.use(helmet());
app.use(cors({
  origin(origin, callback) {
    if (!origin || allowAnyOriginInDev || allowedOrigins.has(origin) || localhostOriginPattern.test(origin)) {
      return callback(null, true);
    }

    return callback(new Error('CORS origin is not allowed'));
  },
  credentials: true
}));

// Health check should stay outside global rate limiting so hosted probes never get 429.
app.get('/api/health', (req, res) => {
  res.json({ status: 'Server is running', timestamp: new Date() });
});

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => (
    req.path === '/api/users/specialized-teacher/respond' ||
    req.path === '/api/users/specialized-teacher/stream'
  ),
});
app.use(limiter);

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
});

// Body parsing
app.use(express.json({ limit: '80mb' }));
app.use(express.urlencoded({ limit: '80mb', extended: true }));

// Logging
app.use(morgan('combined'));

// === API Routes ===

// Authentication routes
app.use('/api/auth', authLimiter, authRoutes);

// User routes
app.use('/api/users', userRoutes);

// Module A: Interactive Textbook
app.use('/api/textbook', textbookRoutes);

// Module B: Chapter-Level Testing
app.use('/api/tests/chapter', testRoutes);

// Module C: Dynamic Test Generator
app.use('/api/tests/generator', generatorRoutes);

// Module D: Past Exams Archive
app.use('/api/exams', pastExamRoutes);

// Module E: Essay AI Sandbox
app.use('/api/essays', essayRoutes);

// PDF explanation: grounded tutor answers over public in-app PDFs
app.use('/api/pdf-explain', pdfExplainRoutes);

const frontendBuildPath = path.join(__dirname, '..', 'frontend', 'build');
const generatedExamsPath = path.join(__dirname, 'data', 'generated-exams');
const generatedExplanationsPath = path.join(__dirname, 'data', 'generated-explanations');
app.use('/generated-exams', express.static(generatedExamsPath));
app.use('/generated-explanations', express.static(generatedExplanationsPath));
app.use(express.static(frontendBuildPath));

// === Error Handling ===
app.use((err, req, res, next) => {
  console.error('Error:', err);

  const status = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';

  res.status(status).json({
    success: false,
    message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api/')) {
    return next();
  }

  return res.sendFile(path.join(frontendBuildPath, 'index.html'));
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

// === Start Server ===
const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`
╔════════════════════════════════════════════════════════════╗
║  PANHELLENIC EXAM COACH API SERVER                         ║
║  Started on port: ${PORT}                                    ║
║  Modules: A-E (Textbook, Testing, Generator, Archives, Essays) ║
╚════════════════════════════════════════════════════════════╝
  `);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

module.exports = app;
