/**
 * ESSAY_SUBMISSIONS TABLE SCHEMA
 * Module E: Greek Essay AI Sandbox
 * Stores student essays with AI feedback and rubric scoring
 */

const essaySubmissionSchema = {
  tableName: 'essay_submissions',
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
    themeID: {
      type: 'UUID',
      required: true,
      foreignKey: 'essay_themes.id'
    },
    themeName_el: {
      type: 'STRING',
      enum: ['ENVIRONMENT', 'AI', 'EDUCATION', 'HUMAN_RIGHTS'],
      required: true,
      description: 'Standard Panhellenic theme'
    },
    prompt_el: {
      type: 'TEXT',
      required: true,
      description: 'The essay prompt in Greek'
    },
    essayText_el: {
      type: 'TEXT',
      required: true,
      description: 'Student essay in Greek'
    },
    wordCount: {
      type: 'INTEGER',
      required: true
    },
    characterCount: {
      type: 'INTEGER',
      required: true
    },
    rubricScores: {
      type: 'JSON',
      required: true,
      description: 'Scores for Content/Periomeno, Structure/Domi, Language/Ekfrasi'
    },
    overallScore: {
      type: 'FLOAT',
      min: 0,
      max: 100,
      required: true
    },
    aiFeedback: {
      type: 'JSON',
      required: true,
      description: 'Detailed AI feedback with sentence-level suggestions'
    },
    structureAnalysis: {
      type: 'JSON',
      required: true,
      description: 'Analysis: Prologos, Kyrio Thema, Epilogos structure'
    },
    vocabularySuggestions: {
      type: 'JSON_ARRAY',
      required: false,
      description: 'Suggested vocabulary upgrades from vocabulary bank'
    },
    grammarIssues: {
      type: 'JSON_ARRAY',
      required: false,
      description: 'Identified syntax and grammar errors'
    },
    submittedAt: {
      type: 'TIMESTAMP',
      required: true
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
    'userID',
    'themeName_el',
    ['userID', 'themeID']
  ]
};

module.exports = essaySubmissionSchema;
