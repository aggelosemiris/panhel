/**
 * VOCABULARY_BANK TABLE SCHEMA
 * Module E: High-level academic vocabulary repository
 */

const vocabularyBankSchema = {
  tableName: 'vocabulary_bank',
  columns: {
    id: {
      type: 'UUID',
      primaryKey: true,
      required: true
    },
    word_el: {
      type: 'STRING',
      required: true,
      unique: true,
      description: 'Greek vocabulary term'
    },
    definition_el: {
      type: 'TEXT',
      required: true,
      description: 'Definition in Greek'
    },
    partOfSpeech_el: {
      type: 'STRING',
      enum: ['NOUN', 'VERB', 'ADJECTIVE', 'ADVERB', 'CONJUNCTION'],
      required: true
    },
    difficulty: {
      type: 'ENUM',
      values: ['BASIC', 'INTERMEDIATE', 'ADVANCED'],
      required: true
    },
    exampleSentence_el: {
      type: 'TEXT',
      required: false,
      description: 'Example usage in Greek'
    },
    synonyms: {
      type: 'JSON_ARRAY',
      required: false,
      description: 'Similar words with nuance explanations'
    },
    transitionWords: {
      type: 'BOOLEAN',
      default: false,
      description: 'Is this a transition word (γιατί, επομένως, ωστόσο)?'
    },
    themes: {
      type: 'JSON_ARRAY',
      required: true,
      description: 'Associated essay themes'
    },
    frequency: {
      type: 'INTEGER',
      required: true,
      default: 0,
      description: 'Times this word appears in excellent essays'
    },
    createdAt: {
      type: 'TIMESTAMP',
      required: true
    }
  },
  indexes: [
    'word_el',
    'difficulty',
    'transitionWords'
  ]
};

module.exports = vocabularyBankSchema;
