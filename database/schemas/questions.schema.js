/**
 * QUESTIONS TABLE SCHEMA
 * Core repository for all exam questions across all modules
 * Strict tagging taxonomy for dynamic test generation
 */

const questionSchema = {
  tableName: 'questions',
  columns: {
    id: {
      type: 'UUID',
      primaryKey: true,
      required: true,
      description: 'Unique question identifier'
    },
    subjectID: {
      type: 'STRING',
      enum: ['AOTH', 'AEPP', 'MATH', 'EKTHESI'],
      required: true,
      description: 'Subject identifier'
    },
    chapterID: {
      type: 'STRING',
      pattern: 'Ch\\.[1-9][0-9]*',
      required: true,
      description: 'Chapter identifier (e.g., Ch.2, Ch.5)'
    },
    subChapterID: {
      type: 'STRING',
      pattern: '[1-9][0-9]*\\.[1-9][0-9]*',
      required: false,
      description: 'Sub-chapter identifier (e.g., 2.3, 5.1)'
    },
    questionType: {
      type: 'ENUM',
      values: [
        'MULTIPLE_CHOICE',
        'TRUE_FALSE',
        'DEFINITION',
        'CALCULATION',
        'ALGORITHM_DEVELOPMENT',
        'SHORT_ANSWER',
        'ESSAY_PROMPT'
      ],
      required: true,
      description: 'Type of question'
    },
    difficulty: {
      type: 'ENUM',
      values: ['EASY', 'NORMAL', 'HARD'],
      required: true,
      description: 'Difficulty tier for progressive testing'
    },
    source: {
      type: 'ENUM',
      values: [
        'ORIGINAL_CONTENT',
        'TEXTBOOK_EXAMPLE',
        'PAST_EXAM_2024',
        'PAST_EXAM_2023',
        'PAST_EXAM_2022',
        'PAST_EXAM_2021',
        'PAST_EXAM_2020',
        'PAST_EXAM_2019',
        'PAST_EXAM_2018',
        'PAST_EXAM_2017',
        'PAST_EXAM_2016',
        'PAST_EXAM_2015',
        'STUDY_GUIDE'
      ],
      required: true,
      description: 'Origin of the question'
    },
    timeEstimateMinutes: {
      type: 'INTEGER',
      min: 1,
      max: 60,
      required: true,
      description: 'Estimated time to solve (minutes)'
    },
    question_el: {
      type: 'TEXT',
      required: true,
      description: 'Question text in Greek'
    },
    question_en: {
      type: 'TEXT',
      required: false,
      description: 'Question text in English (optional)'
    },
    answerKey: {
      type: 'JSON',
      required: true,
      description: 'Correct answer(s) and explanation'
    },
    tags: {
      type: 'JSON_ARRAY',
      required: false,
      description: 'Additional searchable tags (e.g., "supply-demand", "equilibrium")'
    },
    isMemorizable: {
      type: 'BOOLEAN',
      required: true,
      description: 'Must-memorize content (for AOTH, AEPP)'
    },
    createdAt: {
      type: 'TIMESTAMP',
      required: true,
      default: 'NOW()'
    },
    updatedAt: {
      type: 'TIMESTAMP',
      required: true,
      default: 'NOW()'
    },
    createdBy: {
      type: 'UUID',
      required: true,
      description: 'Admin user ID who created the question'
    }
  },
  indexes: [
    'subjectID',
    'chapterID',
    'difficulty',
    'source',
    'questionType',
    ['subjectID', 'chapterID', 'difficulty'],
    ['subjectID', 'source']
  ]
};

module.exports = questionSchema;
