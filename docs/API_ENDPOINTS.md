`cd c:\Users\User\Downloads\panhel_app

# Remove old installations
rm -r node_modules -Force
rm -r backend\node_modules -Force
rm -r frontend\node_modules -Force
rm package-lock.json -Force
rm backend\package-lock.json -Force
rm frontend\package-lock.json -Force

# Fresh install
npm install
cd backend && npm install && cd ..
cd frontend && npm install && cd ..

# Start the app
npm run dev# API Endpoints Reference

All endpoints require JWT authentication (except login/register) via `Authorization: Bearer <TOKEN>` header.

## Authentication

### Register
```
POST /api/auth/register
Body: {
  email: "student@example.com",
  password: "secure_password",
  firstName_el: "Γιάννης",
  lastName_el: "Παπαδόπουλος",
  role: "STUDENT"
}
Response: { success: true, token: "JWT_TOKEN" }
```

### Login
```
POST /api/auth/login
Body: { email, password }
Response: { success: true, token: "JWT_TOKEN", user: {...} }
```

### Refresh Token
```
POST /api/auth/refresh-token
Response: { success: true, token: "NEW_TOKEN" }
```

---

## Module A: Textbook

### Get All Subjects
```
GET /api/textbook/subjects
Response: {
  success: true,
  data: [
    { subjectID: "AOTH", name_el: "Αρχές Οικονομικής Θεωρίας", chapters: 5 },
    ...
  ]
}
```

### Get Subject Chapters
```
GET /api/textbook/:subjectID/chapters
Response: {
  success: true,
  subjectID: "AOTH",
  chapters: [
    {
      chapterID: "Ch.1",
      title_el: "...",
      description_el: "...",
      estimatedReadingMinutes: 45
    },
    ...
  ]
}
```

### Get Chapter Content
```
GET /api/textbook/:subjectID/chapters/:chapterID
Response: {
  success: true,
  chapter: {
    chapterID: "Ch.1",
    title_el: "...",
    interactiveBlocks: [...],
    keyDefinitions: [...],
    keyFormulas: [...]
  }
}
```

### Mark Chapter Complete
```
POST /api/textbook/:subjectID/chapters/:chapterID/mark-complete
Response: { success: true, message: "Chapter marked complete" }
```

### Get Chapter Progress
```
GET /api/textbook/:subjectID/chapters/:chapterID/progress
Response: {
  success: true,
  progress: {
    status: "IN_PROGRESS",
    percentageRead: 45,
    lastAccessedAt: "2024-04-08T10:30:00Z"
  }
}
```

---

## Module B: Chapter Testing

### Get Available Tiers
```
GET /api/tests/chapter/:subjectID/:chapterID/available-tiers
Response: {
  success: true,
  availableTiers: [1, 2, 3]  // Only if chapter completed
}
```

### Start Test
```
POST /api/tests/chapter/:subjectID/:chapterID/start/:tier
Params: tier = 1 (Easy) | 2 (Normal) | 3 (Hard)
Response: {
  success: true,
  testSessionID: "SESSION_UUID",
  testType: "CHAPTER_TIER2",
  questions: [
    {
      questionID: "Q_UUID",
      questionType: "MULTIPLE_CHOICE",
      question_el: "Τι είναι...",
      options: ["A", "B", "C", "D"],
      timeEstimate: 3
    },
    ...
  ]
}
```

### Submit Answers
```
POST /api/tests/chapter/:subjectID/submit-answers
Body: {
  testSessionID: "SESSION_UUID",
  answers: [
    { questionID: "Q1", userAnswer: "A" },
    { questionID: "Q2", userAnswer: "True" },
    ...
  ]
}
Response: {
  success: true,
  testResult: {
    score: 85.5,
    totalQuestions: 10,
    correctAnswers: 8,
    analysis: {
      weakAreas: ["elasticity"],
      strongAreas: ["definitions"]
    }
  }
}
```

### Get Test Results
```
GET /api/tests/chapter/:subjectID/:chapterID/results
Response: {
  success: true,
  results: [
    {
      testResultID: "...",
      tier: 1,
      score: 85.5,
      completedAt: "2024-04-08",
      analysis: {...}
    },
    ...
  ]
}
```

### Get Detailed Test Feedback
```
GET /api/tests/chapter/:subjectID/:chapterID/:testResultID/detailed
Response: {
  success: true,
  details: {
    questions: [
      {
        questionID: "Q1",
        question_el: "...",
        userAnswer: "A",
        correctAnswer: "B",
        explanation: "...",
        status: "INCORRECT"
      },
      ...
    ]
  }
}
```

---

## Module C: Dynamic Test Generator

### Create Custom Test
```
POST /api/tests/generator/custom
Body: {
  subjectID: "AOTH",
  selectedChapters: ["Ch.1", "Ch.3"],
  difficulty: "HARD",
  questionCount: 20
}
Response: {
  success: true,
  testSessionID: "SESSION_UUID",
  testType: "CUSTOM_MIX",
  questionCount: 20,
  estimatedTimeMinutes: 45,
  questions: [...]
}
```

### Create Full Syllabus Exam
```
POST /api/tests/generator/full-syllabus
Body: { subjectID: "AOTH" }
Response: {
  success: true,
  testSessionID: "SESSION_UUID",
  testType: "FULL_SYLLABUS",
  totalQuestions: 35,
  estimatedTimeMinutes: 180,
  structure: {
    themeA: { title: "Theory", questions: [...] },
    themeB: { title: "Exercises", questions: [...] }
  }
}
```

### Submit Custom Test
```
POST /api/tests/generator/submit
Body: {
  testSessionID: "SESSION_UUID",
  answers: [...]
}
Response: {
  success: true,
  testResult: {
    score: 78.5,
    totalQuestions: 25,
    correctAnswers: 20,
    chapterBreakdown: [
      { chapterID: "Ch.1", score: 90 },
      { chapterID: "Ch.2", score: 65 }
    ]
  }
}
```

---

## Module D: Past Exams

### Get Available Exams
```
GET /api/exams/available?subject=AOTH&year=2023&session=JUNE
Response: {
  success: true,
  exams: [
    {
      id: "EXAM_UUID",
      subjectID: "AOTH",
      examYear: 2023,
      examSession: "JUNE",
      title_el: "Εξετάσεις Ιουνίου 2023",
      totalQuestions: 35
    },
    ...
  ]
}
```

### Get Exam Details
```
GET /api/exams/:examID
Response: {
  success: true,
  exam: {
    id: "EXAM_UUID",
    title_el: "...",
    duration_minutes: 180,
    structure: {
      themeA: { title: "Theory", questions: [...] },
      themeB: { title: "Exercises", questions: [...] }
    }
  }
}
```

### Start Exam Attempt
```
POST /api/exams/:examID/start
Response: {
  success: true,
  testSessionID: "SESSION_UUID",
  testType: "PAST_EXAM",
  totalQuestions: 35,
  estimatedTimeMinutes: 180,
  questions: [...]
}
```

### Submit Exam Answers
```
POST /api/exams/:examID/submit-answers
Body: {
  testSessionID: "SESSION_UUID",
  answers: [...]
}
Response: {
  success: true,
  testResult: {
    score: 82.5,
    correctAnswers: 29,
    totalQuestions: 35,
    solutions: [...]  // Official answers
  }
}
```

### Filter Past Exam Questions by Chapter
```
GET /api/exams/filter-by-chapter?subject=AOTH&chapter=Ch.2&startYear=2015&endYear=2024
Response: {
  success: true,
  filters: { subject: "AOTH", chapter: "Ch.2", startYear: 2015, endYear: 2024 },
  questions: [...],
  totalFound: 35
}
```

### Create Practice Test from Past Exams
```
POST /api/exams/filter-practice
Body: {
  subject: "AOTH",
  chapters: ["Ch.1", "Ch.2"],
  startYear: 2015,
  endYear: 2024
}
Response: {
  success: true,
  testSessionID: "SESSION_UUID",
  questionsCount: 15,
  estimatedTimeMinutes: 45,
  questions: [...]
}
```

---

## Module E: Greek Essay

### Get All Themes
```
GET /api/essays/themes
Response: {
  success: true,
  themes: [
    {
      id: "THEME_UUID",
      themeName_el: "ENVIRONMENT",
      description_el: "...",
      prompts: [...],
      structureBlueprint: {...}
    },
    ...
  ]
}
```

### Get Theme Details
```
GET /api/essays/themes/:themeID
Response: {
  success: true,
  theme: {
    themeName_el: "ENVIRONMENT",
    prompts: [...],
    structureBlueprint: {
      prologos: "...",
      kyrioThema: "...",
      epilogos: "..."
    },
    relatedVocabulary: [...]
  }
}
```

### Get Vocabulary Bank
```
GET /api/essays/vocabulary-bank?difficulty=ADVANCED&theme=ENVIRONMENT&transitionWords=true
Response: {
  success: true,
  vocabulary: [
    {
      word_el: "ωστόσο",
      definition_el: "...",
      difficulty: "BASIC",
      transitionWords: true,
      exampleSentence_el: "..."
    },
    ...
  ]
}
```

### Submit Essay
```
POST /api/essays/submit
Body: {
  themeID: "THEME_UUID",
  prompt_el: "Εξηγείστε...",
  essayText_el: "Ο κόσμος αλλάζει..."
}
Response: {
  success: true,
  submissionID: "SUBMISSION_UUID",
  rubricScores: {
    periomeno: 8.5,   // Content
    domi: 7.8,        // Structure
    ekfrasi: 8.2      // Language
  },
  overallScore: 82.5,
  feedback: {
    strengths: [...],
    weaknesses: [...],
    sentenceLevel: [...]
  },
  structureAnalysis: {...},
  vocabularySuggestions: [...],
  grammarIssues: [...]
}
```

### Get Submission Details
```
GET /api/essays/submissions/:submissionID
Response: {
  success: true,
  submission: {
    submissionID: "...",
    essayText_el: "...",
    overallScore: 82.5,
    rubricScores: {...},
    feedback: {...},
    submittedAt: "2024-04-08T10:30:00Z"
  }
}
```

### Get User's Essay History
```
GET /api/essays/my-submissions
Response: {
  success: true,
  submissions: [
    {
      submissionID: "...",
      themeName_el: "ENVIRONMENT",
      overallScore: 82.5,
      submittedAt: "2024-04-08"
    },
    ...
  ]
}
```

### Get Essay Progress
```
GET /api/essays/progress
Response: {
  success: true,
  progress: {
    totalEssaysWritten: 12,
    averageScore: 76.5,
    themeStats: [
      { theme: "ENVIRONMENT", attempts: 4, averageScore: 78 },
      ...
    ],
    improvementTrend: [...]
  }
}
```

---

## User Profile

### Get Profile
```
GET /api/users/profile
Response: {
  success: true,
  user: {
    id: "UUID",
    email: "student@example.com",
    firstName_el: "Γιάννης",
    lastName_el: "Παπαδόπουλος",
    enrolledSubjects: ["AOTH", "AEPP"],
    subscriptionStatus: "PREMIUM"
  }
}
```

### Get Dashboard
```
GET /api/users/dashboard
Response: {
  success: true,
  dashboard: {
    enrolledSubjects: [
      {
        subjectID: "AOTH",
        chaptersCompleted: 3,
        chaptersTotal: 5,
        averageTestScore: 82.5
      }
    ],
    recentTests: [...],
    recentEssays: [...]
  }
}
```

### Get Subject Stats
```
GET /api/users/stats/:subjectID
Response: {
  success: true,
  stats: {
    chaptersCompleted: 3,
    totalChapters: 5,
    averageScore: 82.5,
    testAttempts: 12,
    chapterBreakdown: [...]
  }
}
```

---

**Base URL**: `http://localhost:5000`

**Headers**: 
```
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json
```

**Error Responses**: All errors return HTTP status codes and JSON:
```json
{
  "success": false,
  "message": "Error description"
}
```
