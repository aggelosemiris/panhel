/**
 * MODULE D: PAST EXAMS ARCHIVE ROUTES
 * 10-year official Panhellenic exams database (2015-2024)
 * Every question tagged by chapter for filtering
 */

const express = require('express');
const router = express.Router();

/**
 * GET /api/exams/available
 * Get list of all available past exams
 * Query params: ?subject=AOTH&year=2019&session=JUNE
 */
router.get('/available', (req, res) => {
  const { subject, year, session } = req.query;
  
  // TODO: Query past_exams table with filters
  // TODO: Return list of available exams with metadata
  res.json({
    success: true,
    exams: [
      {
        id: 'EXAM_UUID',
        subjectID: 'AOTH',
        examYear: 2023,
        examSession: 'JUNE',
        title_el: 'Εξετάσεις Ιουνίου 2023',
        totalQuestions: 35
      }
    ]
  });
});

/**
 * GET /api/exams/:examID
 * Get full exam details and questions
 */
router.get('/:examID', (req, res) => {
  const { examID } = req.params;
  
  // TODO: Query past_exams + questions
  // TODO: Return full exam structure with all questions
  res.json({
    success: true,
    exam: {
      id: examID,
      title_el: 'Εξετάσεις Ιουνίου 2023',
      duration_minutes: 180,
      structure: {
        themeA: { title: 'Theory', questions: [] },
        themeB: { title: 'Exercises', questions: [] }
      }
    }
  });
});

/**
 * POST /api/exams/:examID/start
 * Start attempting a full past exam
 */
router.post('/:examID/start', (req, res) => {
  const { examID } = req.params;
  const userID = req.user.id;
  
  // TODO: Create test session for past exam
  // TODO: Return exam questions without answers
  res.json({
    success: true,
    testSessionID: 'SESSION_UUID',
    testType: 'PAST_EXAM',
    totalQuestions: 35,
    estimatedTimeMinutes: 180,
    questions: []
  });
});

/**
 * POST /api/exams/:examID/submit-answers
 * Submit answers for past exam attempt
 */
router.post('/:examID/submit-answers', (req, res) => {
  const { examID } = req.params;
  const { testSessionID, answers } = req.body;
  const userID = req.user.id;
  
  // TODO: Grade against official answers
  // TODO: Create test_results record
  // TODO: Return score with official solutions
  res.json({
    success: true,
    testResult: {
      score: 82.5,
      correctAnswers: 29,
      totalQuestions: 35,
      solutions: []
    }
  });
});

/**
 * GET /api/exams/filter-by-chapter
 * Get past exam questions filtered by chapter
 * Query params: ?subject=AOTH&chapter=Ch.2&startYear=2015&endYear=2024
 */
router.get('/filter-by-chapter', (req, res) => {
  const { subject, chapter, startYear, endYear } = req.query;
  
  // TODO: Query questions from past_exams within year range
  // TODO: Filter by chapter and tag
  // TODO: Return filtered question set
  res.json({
    success: true,
    filters: { subject, chapter, startYear, endYear },
    questions: [],
    totalFound: 0
  });
});

/**
 * POST /api/exams/filter-practice
 * Create a practice test from filtered past exam questions
 * Body: { subject, chapters: [Ch.1, Ch.2], startYear, endYear }
 */
router.post('/filter-practice', (req, res) => {
  const { subject, chapters, startYear, endYear } = req.body;
  const userID = req.user.id;
  
  // TODO: Query past exam questions with filters
  // TODO: Create practice test session
  res.json({
    success: true,
    testSessionID: 'SESSION_UUID',
    questionsCount: 15,
    estimatedTimeMinutes: 45,
    questions: []
  });
});

module.exports = router;
