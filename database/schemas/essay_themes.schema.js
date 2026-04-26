/**
 * ESSAY_THEMES TABLE SCHEMA
 * Module E: Theme Library for Greek Essay Sandbox
 */

const essayThemesSchema = {
  tableName: 'essay_themes',
  columns: {
    id: {
      type: 'UUID',
      primaryKey: true,
      required: true
    },
    themeName_el: {
      type: 'STRING',
      enum: ['ENVIRONMENT', 'AI', 'EDUCATION', 'HUMAN_RIGHTS'],
      required: true
    },
    description_el: {
      type: 'TEXT',
      required: true
    },
    prompts: {
      type: 'JSON_ARRAY',
      required: true,
      description: 'Collection of essay prompts for this theme'
    },
    structureBlueprint: {
      type: 'JSON',
      required: true,
      description: 'Template: Prologos (Intro), Kyrio Thema (Main), Epilogos (Conclusion)'
    },
    argumentExamples: {
      type: 'JSON_ARRAY',
      required: false,
      description: 'Model arguments for reference'
    },
    relatedVocabulary: {
      type: 'JSON_ARRAY',
      required: true,
      foreignKey: 'vocabulary_bank.id',
      description: 'IDs of relevant vocabulary terms'
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
    'themeName_el'
  ]
};

module.exports = essayThemesSchema;
