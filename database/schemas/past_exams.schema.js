/**
 * PAST_EXAMS TABLE SCHEMA
 * Module D: 10-Year Past Exams Archive
 * Official Panhellenic exams (2015-2024) with chapter tagging
 */

const pastExamsSchema = {
  tableName: 'past_exams',
  columns: {
    id: {
      type: 'UUID',
      primaryKey: true,
      required: true
    },
    subjectID: {
      type: 'STRING',
      enum: ['AOTH', 'AEPP', 'MATH'],
      required: true,
      description: 'Subject (not EKTHESI as essays are separate)'
    },
    examYear: {
      type: 'INTEGER',
      min: 2015,
      max: 2024,
      required: true
    },
    examSession: {
      type: 'ENUM',
      values: ['JUNE', 'SEPTEMBER'],
      required: true
    },
    title_el: {
      type: 'STRING',
      required: true,
      description: 'Exam title/name in Greek'
    },
    totalQuestions: {
      type: 'INTEGER',
      required: true
    },
    duration_minutes: {
      type: 'INTEGER',
      default: 180,
      description: 'Official exam duration (180 minutes)'
    },
    themeStructure: {
      type: 'JSON',
      required: true,
      description: 'Official exam structure: Theme A (Theory), Theme B (Exercises)'
    },
    questionReferences: {
      type: 'JSON_ARRAY',
      required: true,
      description: 'Array of question IDs from questions table'
    },
    sampleSolutions: {
      type: 'JSON',
      required: false,
      description: 'Official exam solutions/answers'
    },
    tags: {
      type: 'JSON_ARRAY',
      required: false,
      description: 'Searchable tags (e.g., "supply-demand", "monopoly")'
    },
    createdAt: {
      type: 'TIMESTAMP',
      required: true
    },
    updatedAt: {
      type: 'TIMESTAMP',
      required: true
    }
  },
  indexes: [
    'subjectID',
    'examYear',
    ['subjectID', 'examYear']
  ]
};

module.exports = pastExamsSchema;
