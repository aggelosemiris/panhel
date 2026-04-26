/**
 * USER ROUTES
 * User profile, preferences, subscription, progress overview
 */

const express = require('express');
const router = express.Router();
const {
  getStudentProfile,
  getStudentWeakChapters,
  updateStudentStats,
} = require('../services/student-stats.service');
const { askSpecializedTeacher } = require('../services/specialized-teacher.service');
const {
  generateExplanationLesson,
  getExplanationLessons,
  getExplanationLessonById,
  updateExplanationLesson,
} = require('../services/explanation-lessons.service');
const { generateExplanationAudioOverview } = require('../services/explanation-audio.service');
const {
  getExamDifficultyStats,
  getExamDifficultyStatsBySubject,
  getSingleTopicStatsBySubject,
} = require('../services/student-exams.service');

function resolveUserId(req) {
  return (
    req.body?.userId ||
    req.query?.userId ||
    req.headers['x-user-id'] ||
    req.user?.id ||
    'guest-user'
  );
}

router.post('/student-stats', async (req, res, next) => {
  try {
    const userId = resolveUserId(req);
    const { subject, chapterId, questionId, isCorrect } = req.body;
    const stat = await updateStudentStats({
      userId,
      subject,
      chapterId,
      questionId,
      isCorrect: Boolean(isCorrect),
    });

    res.json({
      success: true,
      stat,
    });
  } catch (error) {
    next(error);
  }
});

router.get('/student-stats/weak-chapters/:subjectID', async (req, res, next) => {
  try {
    const userId = resolveUserId(req);
    const chapters = await getStudentWeakChapters(userId, req.params.subjectID);

    res.json({
      success: true,
      userId,
      subject: req.params.subjectID,
      chapters,
    });
  } catch (error) {
    next(error);
  }
});

router.get('/profile-stats', async (req, res, next) => {
  try {
    const userId = resolveUserId(req);
    const profile = await getStudentProfile(userId);
    const examDifficultyBySubject = await getExamDifficultyStatsBySubject(userId);
    const singleTopicBySubject = await getSingleTopicStatsBySubject(userId);

    res.json({
      success: true,
      profile: {
        ...profile,
        examDifficultyBySubject,
        singleTopicBySubject,
      },
    });
  } catch (error) {
    next(error);
  }
});

router.post('/specialized-teacher/respond', async (req, res, next) => {
  try {
    const userId = resolveUserId(req);
    const baseProfile = await getStudentProfile(userId);
    const examDifficultyBySubject = await getExamDifficultyStatsBySubject(userId);
    const singleTopicBySubject = await getSingleTopicStatsBySubject(userId);
    const profile = {
      ...baseProfile,
      examDifficultyBySubject,
      singleTopicBySubject,
    };

    const response = await askSpecializedTeacher({
      question: req.body?.question,
      context: req.body?.context,
      profile,
    });

    res.json({
      success: true,
      reply: response.answer,
      model: response.model,
      provider: response.provider,
      meta: {
        provider: response.provider,
        model: response.model,
        detectedState: response.detectedState,
        subjectFocus: response.subjectFocus,
        suggestions: response.suggestions ?? [],
      },
      profile,
    });
  } catch (error) {
    next(error);
  }
});

router.get('/specialized-teacher/lessons', async (req, res, next) => {
  try {
    const userId = resolveUserId(req);
    const lessons = await getExplanationLessons(userId);

    res.json({
      success: true,
      lessons,
    });
  } catch (error) {
    next(error);
  }
});

router.post('/specialized-teacher/lessons', async (req, res, next) => {
  try {
    const userId = resolveUserId(req);
    const baseProfile = await getStudentProfile(userId);
    const examDifficultyBySubject = await getExamDifficultyStatsBySubject(userId);
    const singleTopicBySubject = await getSingleTopicStatsBySubject(userId);
    const profile = {
      ...baseProfile,
      examDifficultyBySubject,
      singleTopicBySubject,
    };

    const lesson = await generateExplanationLesson({
      userId,
      subject: req.body?.subject ? {
        id: req.body.subject.id,
        greekName: req.body.subject.greekName,
      } : null,
      chapter: req.body?.chapter ? {
        id: req.body.chapter.id,
        number: req.body.chapter.number,
        title: req.body.chapter.title,
      } : null,
      currentUnit: req.body?.currentUnit,
      selectedText: req.body?.selectedText,
      userQuestion: req.body?.userQuestion,
      explanationStyle: req.body?.explanationStyle,
      targetDuration: req.body?.targetDuration,
      outputMode: req.body?.outputMode,
      profile,
    });

    res.json({
      success: true,
      lesson,
      profile,
    });
  } catch (error) {
    next(error);
  }
});

router.post('/specialized-teacher/lessons/:lessonId/audio-overview', async (req, res, next) => {
  try {
    const userId = resolveUserId(req);
    const lesson = await getExplanationLessonById(userId, req.params.lessonId);

    if (!lesson) {
      return res.status(404).json({
        success: false,
        message: 'Το explanation lesson δεν βρέθηκε.',
      });
    }

    const audioOverview = await generateExplanationAudioOverview(lesson);
    const updatedLesson = await updateExplanationLesson(userId, req.params.lessonId, (currentLesson) => ({
      ...currentLesson,
      audioOverview,
    }));

    return res.json({
      success: true,
      lesson: updatedLesson,
    });
  } catch (error) {
    next(error);
  }
});

router.get('/exam-stats/:subjectID', async (req, res, next) => {
  try {
    const userId = resolveUserId(req);
    const stats = await getExamDifficultyStats(userId, req.params.subjectID);

    res.json({
      success: true,
      stats,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/users/profile
 * Get current user's profile
 */
router.get('/profile', (req, res) => {
  const userID = resolveUserId(req);
  
  // TODO: Query users table
  res.json({
    success: true,
    user: {
      id: userID,
      email: 'student@example.com',
      firstName_el: 'Γιάννης',
      lastName_el: 'Παπαδόπουλος',
      schoolName: 'Γενικό Λύκειο Αθηνών',
      role: 'STUDENT',
      enrolledSubjects: ['AOTH', 'AEPP'],
      subscriptionStatus: 'PREMIUM'
    }
  });
});

/**
 * PUT /api/users/profile
 * Update user profile
 */
router.put('/profile', (req, res) => {
  const userID = resolveUserId(req);
  const { firstName_el, lastName_el, schoolName } = req.body;
  
  // TODO: Update users table
  res.json({
    success: true,
    message: 'Profile updated'
  });
});

/**
 * GET /api/users/dashboard
 * Get user's overall progress dashboard
 */
router.get('/dashboard', (req, res) => {
  const userID = resolveUserId(req);
  
  // TODO: Aggregate data from multiple tables:
  //   - user_progress (completion per chapter)
  //   - test_results (recent scores)
  //   - essay_submissions (essay progress)
  res.json({
    success: true,
    dashboard: {
      enrolledSubjects: [
        {
          subjectID: 'AOTH',
          chaptersCompleted: 3,
          chaptersTotal: 5,
          averageTestScore: 82.5,
          lastTestDate: new Date(),
          nextChapterToStudy: 'Ch.4'
        }
      ],
      recentTests: [],
      recentEssays: [],
      progressTrend: []
    }
  });
});

/**
 * GET /api/users/stats/:subjectID
 * Get detailed stats for a specific subject
 */
router.get('/stats/:subjectID', (req, res) => {
  const { subjectID } = req.params;
  const userID = resolveUserId(req);
  
  // TODO: Query all test results and progress for subject
  res.json({
    success: true,
    subjectID,
    stats: {
      chaptersCompleted: 3,
      totalChapters: 5,
      averageScore: 82.5,
      testAttempts: 12,
      estimatedReadyForExam: true,
      chapterBreakdown: []
    }
  });
});

/**
 * GET /api/users/subscription
 * Get subscription details
 */
router.get('/subscription', (req, res) => {
  const userID = resolveUserId(req);
  
  // TODO: Query subscription info
  res.json({
    success: true,
    subscription: {
      status: 'PREMIUM',
      expiresAt: new Date(),
      features: {
        fullSyllabusExams: true,
        essayAIGrading: true,
        pastExamsArchive: true,
        customTestGenerator: true
      }
    }
  });
});

/**
 * POST /api/users/enroll-subject
 * Enroll in a new subject
 * Body: { subjectID }
 */
router.post('/enroll-subject', (req, res) => {
  const { subjectID } = req.body;
  const userID = resolveUserId(req);
  
  // TODO: Update users table enrolledSubjects
  // TODO: Create initial user_progress records
  res.json({
    success: true,
    message: `Enrolled in ${subjectID}`,
    initialChapters: []
  });
});

module.exports = router;
