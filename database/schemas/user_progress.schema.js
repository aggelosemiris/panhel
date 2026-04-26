/**
 * USER_PROGRESS TABLE SCHEMA
 * Tracks chapter completion and test readiness across all modules
 */

const userProgressSchema = {
  tableName: 'user_progress',
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
    chapterID: {
      type: 'STRING',
      pattern: 'Ch\\.[1-9][0-9]*',
      required: true
    },
    status: {
      type: 'ENUM',
      values: ['NOT_STARTED', 'IN_PROGRESS', 'COMPLETED'],
      required: true,
      default: 'NOT_STARTED'
    },
    completedAt: {
      type: 'TIMESTAMP',
      required: false,
      description: 'When chapter marked complete (unlocks testing)'
    },
    percentageRead: {
      type: 'FLOAT',
      min: 0,
      max: 100,
      required: true,
      default: 0
    },
    lastAccessedAt: {
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
    'subjectID',
    ['userID', 'subjectID', 'chapterID']
  ],
  uniqueConstraints: [
    ['userID', 'subjectID', 'chapterID']
  ]
};

module.exports = userProgressSchema;
