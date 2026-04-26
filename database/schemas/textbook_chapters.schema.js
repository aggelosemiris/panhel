/**
 * TEXTBOOK_CHAPTERS TABLE SCHEMA
 * Module A: Interactive Textbook Structure
 * Stores the official textbook content with interactive blocks
 */

const textbookChapterSchema = {
  tableName: 'textbook_chapters',
  columns: {
    id: {
      type: 'UUID',
      primaryKey: true,
      required: true
    },
    subjectID: {
      type: 'STRING',
      enum: ['AOTH', 'AEPP', 'MATH', 'EKTHESI'],
      required: true
    },
    chapterID: {
      type: 'STRING',
      pattern: 'Ch\\.[1-9][0-9]*',
      required: true
    },
    chapterTitle_el: {
      type: 'TEXT',
      required: true,
      description: 'Chapter title in Greek'
    },
    chapterTitle_en: {
      type: 'TEXT',
      required: false
    },
    description_el: {
      type: 'TEXT',
      required: true
    },
    interactiveBlocks: {
      type: 'JSON_ARRAY',
      required: true,
      description: 'Array of interactive theory blocks with multimedia'
    },
    keyDefinitions: {
      type: 'JSON_ARRAY',
      required: true,
      description: 'Must-memorize definitions (highlighted)'
    },
    keyFormulas: {
      type: 'JSON_ARRAY',
      required: false,
      description: 'Important formulas and their derivations'
    },
    estimatedReadingMinutes: {
      type: 'INTEGER',
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
    ['subjectID', 'chapterID']
  ]
};

module.exports = textbookChapterSchema;
