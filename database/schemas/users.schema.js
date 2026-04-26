/**
 * USERS TABLE SCHEMA
 * Core user account and authentication
 */

const usersSchema = {
  tableName: 'users',
  columns: {
    id: {
      type: 'UUID',
      primaryKey: true,
      required: true
    },
    email: {
      type: 'STRING',
      unique: true,
      required: true,
      validate: 'email'
    },
    password_hash: {
      type: 'STRING',
      required: true
    },
    firstName_el: {
      type: 'STRING',
      required: true
    },
    lastName_el: {
      type: 'STRING',
      required: true
    },
    schoolName: {
      type: 'STRING',
      required: false
    },
    role: {
      type: 'ENUM',
      values: ['STUDENT', 'TEACHER', 'ADMIN'],
      default: 'STUDENT'
    },
    enrolledSubjects: {
      type: 'JSON_ARRAY',
      default: [],
      description: 'Array of subject IDs student is enrolled in'
    },
    subscriptionStatus: {
      type: 'ENUM',
      values: ['FREE', 'PREMIUM', 'TEACHER'],
      default: 'FREE'
    },
    createdAt: {
      type: 'TIMESTAMP',
      required: true
    },
    updatedAt: {
      type: 'TIMESTAMP',
      required: true
    },
    lastLoginAt: {
      type: 'TIMESTAMP',
      required: false
    }
  },
  indexes: [
    'email',
    'role'
  ]
};

module.exports = usersSchema;
