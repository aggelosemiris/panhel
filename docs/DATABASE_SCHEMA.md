# Database Schema & Tagging Taxonomy

## Overview

The database uses a strict **tagging taxonomy** system to enable the dynamic test generator (Module C) to query and assemble cohesive exams. Every single question is tagged with metadata that allows filtering, sorting, and intelligent test assembly.

## Core Tables

### 1. **users**
User accounts and authentication.

```sql
CREATE TABLE users (
  id UUID PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  firstName_el VARCHAR(255) NOT NULL,
  lastName_el VARCHAR(255) NOT NULL,
  schoolName VARCHAR(255),
  role ENUM('STUDENT', 'TEACHER', 'ADMIN') DEFAULT 'STUDENT',
  enrolledSubjects JSON DEFAULT '[]',
  subscriptionStatus ENUM('FREE', 'PREMIUM', 'TEACHER') DEFAULT 'FREE',
  createdAt TIMESTAMP DEFAULT NOW(),
  updatedAt TIMESTAMP DEFAULT NOW(),
  lastLoginAt TIMESTAMP
);
```

### 2. **questions** ⭐ CORE
The central repository for all exam questions. Every question must be tagged with metadata.

```sql
CREATE TABLE questions (
  id UUID PRIMARY KEY,
  subjectID VARCHAR(50) NOT NULL,  -- AOTH, AEPP, MATH, EKTHESI
  chapterID VARCHAR(50) NOT NULL,  -- Ch.1, Ch.2, etc.
  subChapterID VARCHAR(50),        -- 2.3, 5.1, etc.
  questionType ENUM(...) NOT NULL, -- See QuestionType enum
  difficulty ENUM('EASY', 'NORMAL', 'HARD') NOT NULL,
  source ENUM(...) NOT NULL,       -- ORIGINAL_CONTENT, PAST_EXAM_2023, etc.
  timeEstimateMinutes INT NOT NULL, -- For balanced test generation
  question_el TEXT NOT NULL,       -- Question in Greek
  question_en TEXT,                -- Optional English version
  answerKey JSON NOT NULL,         -- Correct answer(s) + explanation
  tags JSON,                       -- Additional searchable tags
  isMemorizable BOOLEAN NOT NULL,  -- Must-memorize content flag
  createdAt TIMESTAMP DEFAULT NOW(),
  updatedAt TIMESTAMP DEFAULT NOW(),
  createdBy UUID NOT NULL,
  
  INDEX (subjectID),
  INDEX (chapterID),
  INDEX (difficulty),
  INDEX (source),
  INDEX (questionType),
  INDEX (subjectID, chapterID, difficulty),
  INDEX (subjectID, source)
);
```

**Key Tagging Fields**:
- **subjectID**: AOTH | AEPP | MATH | EKTHESI
- **chapterID**: Ch.1, Ch.2, Ch.3, Ch.4, Ch.5
- **difficulty**: Tier 1 (Easy) | Tier 2 (Normal) | Tier 3 (Hard)
- **timeEstimateMinutes**: 2-60 minutes (used for balanced 60-min test generation)
- **source**: Original, Textbook Example, Past Exam Year
- **questionType**: Multiple Choice, True/False, Definition, Calculation, Algorithm, etc.

### 3. **textbook_chapters**
Module A: Official textbook content with interactive blocks.

```sql
CREATE TABLE textbook_chapters (
  id UUID PRIMARY KEY,
  subjectID VARCHAR(50) NOT NULL,
  chapterID VARCHAR(50) NOT NULL,
  chapterTitle_el TEXT NOT NULL,
  chapterTitle_en TEXT,
  description_el TEXT NOT NULL,
  interactiveBlocks JSON NOT NULL,  -- Array of interactive theory blocks
  keyDefinitions JSON NOT NULL,     -- Must-memorize definitions
  keyFormulas JSON,                 -- Important formulas
  estimatedReadingMinutes INT NOT NULL,
  createdAt TIMESTAMP DEFAULT NOW(),
  updatedAt TIMESTAMP DEFAULT NOW(),
  
  UNIQUE INDEX (subjectID, chapterID)
);
```

### 4. **user_progress**
Tracks chapter completion and test readiness.

```sql
CREATE TABLE user_progress (
  id UUID PRIMARY KEY,
  userID UUID NOT NULL,
  subjectID VARCHAR(50) NOT NULL,
  chapterID VARCHAR(50) NOT NULL,
  status ENUM('NOT_STARTED', 'IN_PROGRESS', 'COMPLETED') DEFAULT 'NOT_STARTED',
  completedAt TIMESTAMP,            -- Enables testing for this chapter
  percentageRead FLOAT DEFAULT 0,   -- 0-100
  lastAccessedAt TIMESTAMP NOT NULL,
  createdAt TIMESTAMP DEFAULT NOW(),
  updatedAt TIMESTAMP DEFAULT NOW(),
  
  UNIQUE INDEX (userID, subjectID, chapterID),
  INDEX (userID, subjectID)
);
```

### 5. **test_results**
Module B & C: Test attempt results with scoring and analysis.

```sql
CREATE TABLE test_results (
  id UUID PRIMARY KEY,
  userID UUID NOT NULL,
  subjectID VARCHAR(50) NOT NULL,
  testType ENUM(
    'CHAPTER_TIER1',    -- Easy chapter test
    'CHAPTER_TIER2',    -- Normal chapter test
    'CHAPTER_TIER3',    -- Hard chapter test
    'CUSTOM_MIX',       -- Custom mix-and-match
    'FULL_SYLLABUS',    -- Complete final exam
    'PAST_EXAM'         -- Full past exam
  ) NOT NULL,
  chaptersIncluded JSON NOT NULL,   -- Array of chapter IDs
  difficulty ENUM('EASY', 'NORMAL', 'HARD') NOT NULL,
  totalQuestions INT NOT NULL,
  questionsAnswered INT NOT NULL,
  correctAnswers INT NOT NULL,
  score FLOAT NOT NULL,             -- 0-100
  timeSpentSeconds INT NOT NULL,
  estimatedTimeSeconds INT NOT NULL,
  answers JSON NOT NULL,            -- Answer records with metadata
  analysis JSON,                    -- AI weakness analysis
  startedAt TIMESTAMP NOT NULL,
  completedAt TIMESTAMP NOT NULL,
  createdAt TIMESTAMP DEFAULT NOW(),
  
  INDEX (userID, subjectID),
  INDEX (testType)
);
```

### 6. **essay_submissions**
Module E: Greek essay submissions with AI grading.

```sql
CREATE TABLE essay_submissions (
  id UUID PRIMARY KEY,
  userID UUID NOT NULL,
  themeID UUID NOT NULL,
  themeName_el ENUM('ENVIRONMENT', 'AI', 'EDUCATION', 'HUMAN_RIGHTS') NOT NULL,
  prompt_el TEXT NOT NULL,
  essayText_el TEXT NOT NULL,
  wordCount INT NOT NULL,
  characterCount INT NOT NULL,
  rubricScores JSON NOT NULL,       -- {periomeno, domi, ekfrasi}
  overallScore FLOAT NOT NULL,      -- 0-100
  aiFeedback JSON NOT NULL,         -- Detailed feedback
  structureAnalysis JSON NOT NULL,  -- Prologos/Kyrio Thema/Epilogos analysis
  vocabularySuggestions JSON,
  grammarIssues JSON,
  submittedAt TIMESTAMP NOT NULL,
  createdAt TIMESTAMP DEFAULT NOW(),
  updatedAt TIMESTAMP DEFAULT NOW(),
  
  INDEX (userID, themeName_el)
);
```

### 7. **essay_themes**
Module E: Theme library for essay prompts.

```sql
CREATE TABLE essay_themes (
  id UUID PRIMARY KEY,
  themeName_el ENUM('ENVIRONMENT', 'AI', 'EDUCATION', 'HUMAN_RIGHTS') NOT NULL,
  description_el TEXT NOT NULL,
  prompts JSON NOT NULL,            -- Array of essay prompts
  structureBlueprint JSON NOT NULL, -- Template: Prologos, Kyrio Thema, Epilogos
  argumentExamples JSON,
  relatedVocabulary JSON NOT NULL,  -- Array of vocabulary_bank IDs
  createdAt TIMESTAMP DEFAULT NOW(),
  updatedAt TIMESTAMP DEFAULT NOW(),
  
  UNIQUE INDEX (themeName_el)
);
```

### 8. **vocabulary_bank**
Module E: High-level academic vocabulary repository.

```sql
CREATE TABLE vocabulary_bank (
  id UUID PRIMARY KEY,
  word_el VARCHAR(255) UNIQUE NOT NULL,
  definition_el TEXT NOT NULL,
  partOfSpeech_el ENUM('NOUN', 'VERB', 'ADJECTIVE', 'ADVERB', 'CONJUNCTION') NOT NULL,
  difficulty ENUM('BASIC', 'INTERMEDIATE', 'ADVANCED') NOT NULL,
  exampleSentence_el TEXT,
  synonyms JSON,
  transitionWords BOOLEAN DEFAULT FALSE,
  themes JSON NOT NULL,             -- Associated essay themes
  frequency INT DEFAULT 0,          -- Times in excellent essays
  createdAt TIMESTAMP DEFAULT NOW(),
  
  INDEX (word_el),
  INDEX (difficulty),
  INDEX (transitionWords)
);
```

### 9. **past_exams**
Module D: Official Panhellenic exam metadata.

```sql
CREATE TABLE past_exams (
  id UUID PRIMARY KEY,
  subjectID VARCHAR(50) NOT NULL,     -- AOTH, AEPP, MATH
  examYear INT NOT NULL,              -- 2015-2024
  examSession ENUM('JUNE', 'SEPTEMBER') NOT NULL,
  title_el VARCHAR(255) NOT NULL,
  totalQuestions INT NOT NULL,
  duration_minutes INT DEFAULT 180,
  themeStructure JSON NOT NULL,       -- Official structure
  questionReferences JSON NOT NULL,   -- Array of question IDs
  sampleSolutions JSON,               -- Official answers
  tags JSON,
  createdAt TIMESTAMP DEFAULT NOW(),
  updatedAt TIMESTAMP DEFAULT NOW(),
  
  UNIQUE INDEX (subjectID, examYear, examSession),
  INDEX (subjectID, examYear)
);
```

## Tagging Taxonomy Summary

### Subjects
```
AOTH     - Αρχές Οικονομικής Θεωρίας
AEPP     - Αρχές Επιχειρηματικότητας & Διοίκησης
MATH     - Μαθηματικά
EKTHESI  - Έκθεση
```

### Question Types
```
MULTIPLE_CHOICE        - Multiple choice
TRUE_FALSE            - True/False
DEFINITION            - Definition fill-in
CALCULATION           - Numerical calculation
ALGORITHM_DEVELOPMENT - Step-by-step algorithm
SHORT_ANSWER          - Written response
ESSAY_PROMPT          - Full essay
```

### Difficulty Levels
```
EASY   (Tier 1) - Basic comprehension
NORMAL (Tier 2) - Standard school level
HARD   (Tier 3) - Panhellenic level
```

### Sources
```
ORIGINAL_CONTENT
TEXTBOOK_EXAMPLE
PAST_EXAM_2024
PAST_EXAM_2023
... (2022-2015)
STUDY_GUIDE
```

## Dynamic Test Assembly

The **Module C: Dynamic Test Generator** uses these tags to assemble balanced tests:

```javascript
function generateCustomTest(params) {
  const {
    subjectID,
    selectedChapters,    // e.g., ['Ch.1', 'Ch.3']
    difficulty,          // 'EASY' | 'NORMAL' | 'HARD'
    targetTimeMinutes    // e.g., 60 (for custom test)
  } = params;

  // Query: SELECT * FROM questions WHERE
  //   subjectID = :subjectID AND
  //   chapterID IN (:selectedChapters) AND
  //   difficulty = :difficulty
  // ORDER BY timeEstimateMinutes ASC

  // Assemble questions to match targetTimeMinutes
  // Respecting balance of question types
  // Return assembled test
}

function generateFullSyllabus(subjectID) {
  // Generate official Panhellenic structure (180 minutes)
  // Theme A: Theory questions
  // Theme B: Exercise questions
  // Weighted by official exam distribution
}
```

## Design Principles

1. **Strict Tagging**: Every question must have complete metadata
2. **De-normalized Search**: Indexes on common filters (subjectID, chapterID, difficulty)
3. **Time Estimates**: Enable balanced test generation
4. **Source Tracking**: Differentiate original vs. past exam content
5. **Memorization Tagging**: Distinguish must-memorize from conceptual content
6. **Chapter-based Organization**: All filtering starts with chapter ID

---

**Status**: ✅ Ready for implementation
**Next Step**: Implement database migrations and seed data loaders
