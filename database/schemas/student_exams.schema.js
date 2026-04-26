/**
 * STUDENT_EXAMS TABLE SCHEMA
 * Stores AI-corrected chapter exams so difficulty-level performance can
 * be reflected in the student profile.
 */

const studentExamsSchema = {
  tableName: 'student_exams',
  columns: {
    id: {
      type: 'UUID',
      primaryKey: true,
      required: true,
    },
    user_id: {
      type: 'STRING',
      required: true,
    },
    exam_id: {
      type: 'STRING',
      required: true,
    },
    subject: {
      type: 'STRING',
      enum: ['aoth', 'aepp', 'math'],
      required: true,
    },
    difficulty: {
      type: 'STRING',
      enum: ['easy', 'normal', 'hard'],
      required: true,
    },
    total_score: {
      type: 'FLOAT',
      required: true,
      default: 0,
    },
    max_score: {
      type: 'FLOAT',
      required: true,
      default: 100,
    },
    created_at: {
      type: 'TIMESTAMP',
      required: true,
    },
  },
  indexes: [
    'user_id',
    'subject',
    'difficulty',
    ['user_id', 'subject'],
    ['user_id', 'subject', 'difficulty'],
  ],
};

module.exports = studentExamsSchema;
