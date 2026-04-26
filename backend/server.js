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

const app = express();

// === Security & Middleware ===
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use(limiter);

// Body parsing
app.use(express.json({ limit: '80mb' }));
app.use(express.urlencoded({ limit: '80mb', extended: true }));

// Logging
app.use(morgan('combined'));

// === API Routes ===

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'Server is running', timestamp: new Date() });
});

// Authentication routes
app.use('/api/auth', authRoutes);

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
