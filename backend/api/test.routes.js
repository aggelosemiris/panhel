/**
 * MODULE B: CHAPTER-LEVEL TESTING ROUTES
 * Progressive 3-tier testing: Easy (Tier 1) -> Normal (Tier 2) -> Hard (Tier 3)
 */

const express = require('express');
const { gradeExamSubmission, gradeSingleTopicSubmission } = require('../services/ai-exam-grading.service');
const { saveStudentExam } = require('../services/student-exams.service');
const { updateStudentStats } = require('../services/student-stats.service');

const router = express.Router();

const MAX_UPLOAD_COUNT = 5;
const MAX_UPLOAD_BASE64_CHARS = 16 * 1024 * 1024;
const ALLOWED_UPLOAD_MIME_TYPES = new Set([
  'application/pdf',
  'image/jpeg',
  'image/png',
  'image/webp',
]);

const SUBJECT_LABELS = {
  aoth: 'ΑΟΘ',
  aepp: 'ΑΕΠΠ',
  math: 'Μαθηματικά',
};

const TIER_LABELS = {
  easy: 'easy',
  normal: 'medium',
  hard: 'hard',
};

function resolveUserId(req) {
  return (
    req.body?.userId ||
    req.query?.userId ||
    req.headers['x-user-id'] ||
    req.user?.id ||
    'guest-user'
  );
}

function getChapterTestPdfPath(subjectId, chapterId, tier) {
  return `/tests/${subjectId}/${chapterId}-${tier}.pdf`;
}

function validateUploadedFiles(uploadedFiles) {
  if (!Array.isArray(uploadedFiles) || uploadedFiles.length === 0) {
    return 'At least one uploaded file is required.';
  }

  if (uploadedFiles.length > MAX_UPLOAD_COUNT) {
    return `Upload up to ${MAX_UPLOAD_COUNT} files at a time.`;
  }

  const invalidFile = uploadedFiles.find((file) => {
    const mimeType = String(file?.mimeType || '').toLowerCase();
    const dataUrl = String(file?.dataUrl || '');
    return !ALLOWED_UPLOAD_MIME_TYPES.has(mimeType) || dataUrl.length > MAX_UPLOAD_BASE64_CHARS;
  });

  return invalidFile ? 'Upload only PDF, PNG, JPG or WEBP files under the allowed size.' : null;
}

router.get('/:subjectID/:chapterID/available-tiers', (req, res) => {
  res.json({
    success: true,
    availableTiers: [1, 2, 3],
  });
});

router.post('/:subjectID/:chapterID/start/:tier', (req, res) => {
  const { tier } = req.params;

  res.json({
    success: true,
    testSessionID: 'SESSION_UUID',
    testType: `CHAPTER_TIER${tier}`,
    questions: [],
  });
});

router.post('/:subjectID/submit-answers', (req, res) => {
  res.json({
    success: true,
    testResult: {
      score: 85.5,
      totalQuestions: 10,
      correctAnswers: 8,
      analysis: {
        weakAreas: ['supply-demand', 'elasticity'],
        strongAreas: ['definitions', 'basic-theory'],
      },
    },
  });
});

router.post('/:subjectID/:chapterID/:tier/grade-submission', async (req, res, next) => {
  try {
    const userId = resolveUserId(req);
    const { subjectID, chapterID, tier } = req.params;
    const { uploadedFiles = [], chapterTitle } = req.body;

    const uploadError = validateUploadedFiles(uploadedFiles);
    if (uploadError) {
      return res.status(400).json({
        success: false,
        message: uploadError,
      });
    }

    const examId = `${chapterID}-${tier}`;
    const difficulty = tier;
    const grading = await gradeExamSubmission({
      subjectId: subjectID,
      chapterId: chapterID,
      chapterTitle: chapterTitle || chapterID,
      difficulty,
      examPdfPath: getChapterTestPdfPath(subjectID, chapterID, tier),
      uploadedFiles,
    });

    for (const question of grading.questions) {
      await updateStudentStats({
        userId,
        subject: subjectID,
        chapterId: question.chapter_id || chapterID,
        questionId: question.question_id || `${examId}-question`,
        isCorrect: Number(question.score) >= Number(question.max_score) * 0.7,
        questionType: 'exam',
      });
    }

    const studentExam = await saveStudentExam({
      userId,
      examId,
      subject: subjectID,
      difficulty,
      examType: 'chapter-exam',
      totalScore: grading.total_score,
      maxScore: grading.max_total_score,
      breakdown: grading.questions,
      gradingMode: grading.gradingMode,
    });

    res.json({
      success: true,
      result: {
        ...grading,
        subject_id: subjectID,
        subject_label: SUBJECT_LABELS[subjectID] ?? subjectID,
        difficulty_label: TIER_LABELS[tier] ?? tier,
      },
      studentExam,
    });
  } catch (error) {
    next(error);
  }
});

router.post('/single-topic/:subjectID/:topicKey/grade-submission', async (req, res, next) => {
  try {
    const userId = resolveUserId(req);
    const { subjectID, topicKey } = req.params;
    const { uploadedFiles = [], exercisePdfPath } = req.body;

    const uploadError = validateUploadedFiles(uploadedFiles);
    if (uploadError) {
      return res.status(400).json({
        success: false,
        message: uploadError,
      });
    }

    const grading = await gradeSingleTopicSubmission({
      subjectId: subjectID,
      topicKey,
      uploadedFiles,
      exercisePdfPath,
    });

    for (const question of grading.questions) {
      await updateStudentStats({
        userId,
        subject: subjectID,
        chapterId: topicKey,
        questionId: `${topicKey}-${question.question_id || 'submission'}`,
        isCorrect: Number(question.score) >= Number(question.max_score) * 0.7,
        questionType: 'single-topic',
      });
    }

    const studentExam = await saveStudentExam({
      userId,
      examId: `${subjectID}-${topicKey}`,
      subject: subjectID,
      difficulty: 'normal',
      examType: 'single-topic',
      topicType: topicKey,
      totalScore: grading.total_score,
      maxScore: grading.max_total_score,
      breakdown: grading.questions,
      gradingMode: grading.gradingMode,
    });

    res.json({
      success: true,
      result: {
        ...grading,
        subject_id: subjectID,
        subject_label: SUBJECT_LABELS[subjectID] ?? subjectID,
        difficulty_label: 'single-topic',
      },
      studentExam,
    });
  } catch (error) {
    next(error);
  }
});

router.get('/:subjectID/:chapterID/results', (req, res) => {
  res.json({
    success: true,
    results: [],
  });
});

router.get('/:subjectID/:chapterID/:testResultID/detailed', (req, res) => {
  res.json({
    success: true,
    details: {
      questions: [],
    },
  });
});

module.exports = router;
