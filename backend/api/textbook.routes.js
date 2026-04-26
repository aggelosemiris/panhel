/**
 * MODULE A: TEXTBOOK ROUTES
 * Interactive Textbook: Theory chapters with interactive blocks
 */

const express = require('express');
const router = express.Router();

/**
 * GET /api/textbook/subjects
 * Get all available subjects (AOTH, AEPP, MATH, EKTHESI)
 */
router.get('/subjects', (req, res) => {
  // TODO: Return all subjects with chapter counts
  res.json({
    success: true,
    data: [
      {
        subjectID: 'AOTH',
        name_el: 'Αρχές Οικονομικής Θεωρίας',
        chapters: 5
      },
      {
        subjectID: 'AEPP',
        name_el: 'Αρχές Επιχειρηματικότητας & Διοίκησης',
        chapters: 5
      },
      {
        subjectID: 'MATH',
        name_el: 'Μαθηματικά',
        chapters: 4
      }
    ]
  });
});

/**
 * GET /api/textbook/:subjectID/chapters
 * Get all chapters for a subject
 */
router.get('/:subjectID/chapters', (req, res) => {
  const { subjectID } = req.params;
  // TODO: Query textbook_chapters table
  // TODO: Return chapters with metadata
  res.json({
    success: true,
    subjectID,
    chapters: []
  });
});

/**
 * GET /api/textbook/:subjectID/chapters/:chapterID
 * Get single chapter with all interactive blocks
 */
router.get('/:subjectID/chapters/:chapterID', (req, res) => {
  const { subjectID, chapterID } = req.params;
  // TODO: Fetch chapter from database
  // TODO: Return chapter content with interactive blocks
  // TODO: Track user progress
  res.json({
    success: true,
    chapter: {
      chapterID,
      title_el: 'Chapter Title',
      interactiveBlocks: [],
      keyDefinitions: [],
      keyFormulas: []
    }
  });
});

/**
 * POST /api/textbook/:subjectID/chapters/:chapterID/mark-complete
 * Mark chapter as completed by user
 * Enables testing modules for that chapter
 */
router.post('/:subjectID/chapters/:chapterID/mark-complete', (req, res) => {
  const { subjectID, chapterID } = req.params;
  const userID = req.user.id; // From JWT token
  // TODO: Update user_progress table
  // TODO: Set status to 'COMPLETED' and completedAt timestamp
  res.json({
    success: true,
    message: 'Chapter marked as complete'
  });
});

/**
 * GET /api/textbook/:subjectID/chapters/:chapterID/progress
 * Get user's progress in chapter
 */
router.get('/:subjectID/chapters/:chapterID/progress', (req, res) => {
  // TODO: Query user_progress
  res.json({
    success: true,
    progress: {
      status: 'IN_PROGRESS',
      percentageRead: 45,
      lastAccessedAt: new Date()
    }
  });
});

module.exports = router;
