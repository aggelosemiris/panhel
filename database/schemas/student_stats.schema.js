/**
 * STUDENT_STATS TABLE SCHEMA
 * Tracks per-question performance so the app can build adaptive quizzes
 * and student progress analytics.
 */

const studentStatsSchema = {
  tableName: 'student_stats',
  columns: {
    id: {
      type: 'UUID',
      primaryKey: true,
      required: true,
    },
    user_id: {
      type: 'STRING',
      required: true,
      description: 'Student identifier',
    },
    subject: {
      type: 'STRING',
      enum: ['aoth', 'aepp', 'math'],
      required: true,
    },
    chapter_id: {
      type: 'STRING',
      required: true,
    },
    question_id: {
      type: 'STRING',
      required: true,
    },
    times_answered: {
      type: 'INTEGER',
      required: true,
      default: 0,
      min: 0,
    },
    times_correct: {
      type: 'INTEGER',
      required: true,
      default: 0,
      min: 0,
    },
    last_answered_at: {
      type: 'TIMESTAMP',
      required: true,
    },
  },
  indexes: [
    'user_id',
    'subject',
    'chapter_id',
    'question_id',
    ['user_id', 'subject', 'chapter_id'],
    ['user_id', 'subject', 'chapter_id', 'question_id'],
  ],
  uniqueConstraints: [['user_id', 'subject', 'chapter_id', 'question_id']],
};

module.exports = studentStatsSchema;
