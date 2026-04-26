/**
 * TEST_RESULTS TABLE SCHEMA
 * Module B & C: Chapter-level and custom test results
 */

const testResultsSchema = {
  tableName: 'test_results',
  columns: {
    id: {
      type: 'UUID',
      primaryKey: true,
      required: true
    },
    userID: {
      type: 'UUID',
      required: true,
      foreignKey: 'users.id'
    },
    subjectID: {
      type: 'STRING',
      enum: ['AOTH', 'AEPP', 'MATH', 'EKTHESI'],
      required: true
    },
    testType: {
      type: 'ENUM',
      values: [
        'CHAPTER_TIER1',      // Easy (chapter-level)
        'CHAPTER_TIER2',      // Normal (chapter-level)
        'CHAPTER_TIER3',      // Hard (chapter-level)
        'CUSTOM_MIX',         // Custom mix-and-match test
        'FULL_SYLLABUS',      // Complete 3-hour final exam
        'PAST_EXAM'           // Full past exam attempt
      ],
      required: true
    },
    chaptersIncluded: {
      type: 'JSON_ARRAY',
      required: true,
      description: 'Array of chapter IDs included in this test'
    },
    difficulty: {
      type: 'ENUM',
      values: ['EASY', 'NORMAL', 'HARD'],
      required: true
    },
    totalQuestions: {
      type: 'INTEGER',
      required: true
    },
    questionsAnswered: {
      type: 'INTEGER',
      required: true
    },
    correctAnswers: {
      type: 'INTEGER',
      required: true
    },
    score: {
      type: 'FLOAT',
      min: 0,
      max: 100,
      required: true
    },
    timeSpentSeconds: {
      type: 'INTEGER',
      required: true
    },
    estimatedTimeSeconds: {
      type: 'INTEGER',
      required: true,
      description: 'Sum of all question time estimates'
    },
    answers: {
      type: 'JSON',
      required: true,
      description: 'User answers with metadata'
    },
    analysis: {
      type: 'JSON',
      required: false,
      description: 'AI-generated analysis of weak areas'
    },
    startedAt: {
      type: 'TIMESTAMP',
      required: true
    },
    completedAt: {
      type: 'TIMESTAMP',
      required: true
    },
    createdAt: {
      type: 'TIMESTAMP',
      required: true
    }
  },
  indexes: [
    'userID',
    'subjectID',
    'testType',
    ['userID', 'subjectID']
  ]
};

module.exports = testResultsSchema;
