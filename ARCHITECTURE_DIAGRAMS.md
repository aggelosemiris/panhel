# System Architecture Diagram

## High-Level Data Flow

```
┌─────────────────────────────────────────────────────────────┐
│                          FRONTEND (React)                     │
│  Dashboard → Module A/B/C/D/E Pages → Components             │
└────────────────────────┬────────────────────────────────────┘
                         │ (HTTP + JWT)
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                    API LAYER (Express)                        │
│                                                               │
│  ┌───────┬─────────┬──────────┬──────────┬──────────┐       │
│  │ Auth  │ Module  │ Module B │ Module C │ Module D │       │
│  │       │ A       │ Testing  │ Generator│ Archives │       │
│  │ Login │ Textbook│          │          │          │       │
│  └───────┴─────────┴──────────┴──────────┴──────────┴───┐   │
│                                      │ Module E: Essays  │   │
│                                      │                   │   │
└──────────────────────────────────────┼───────────────────┘
                         │ (SQL)
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                    DATABASE LAYER (PostgreSQL)                │
│                                                               │
│  ┌─────────────┬──────────────┬────────────┐               │
│  │ Core Data   │ Test Data    │ Essay Data │               │
│  │             │              │            │               │
│  │ • Users     │ • Questions  │ • Essays   │               │
│  │ • Progress  │ • Test Reslt │ • Themes   │               │
│  │             │ • Answers    │ • Vocab    │               │
│  └─────────────┴──────────────┴────────────┘               │
│                                                               │
│           Tagging Taxonomy: Subject → Chapter →              │
│           Type → Difficulty → Source → TimeEst              │
└─────────────────────────────────────────────────────────────┘
```

---

## Module A: Interactive Textbook Flow

```
User
  │
  ▼
Select Subject (AOTH/AEPP/MATH)
  │
  ▼
Choose Chapter (Ch.1, Ch.2, etc.)
  │
  ▼
Read + Interact with Theory Blocks
  │ (Drag-drop, reveal, fill-in-blank)
  │
  ▼
Progress Tracking (%)
  │
  ▼
Mark Chapter Complete?
  │ (YES)
  ▼
🔓 Unlock Module B Testing
```

---

## Module B: Chapter Testing Flow

```
User
  │
  ▼
Select Chapter (unlocked chapters only)
  │
  ▼
Choose Test Tier:
  ├─ Tier 1: EASY (10-15 min)
  ├─ Tier 2: NORMAL (20-30 min)
  └─ Tier 3: HARD (30-45 min)
  │
  ▼
Take Test
  │ (Questions fetched from DB)
  │
  ▼
Submit Answers
  │
  ▼
Instant Grading + Analysis
  │ (Score + Weak Areas)
  │
  ▼
View Detailed Feedback
  │
  ▼
Repeat or Move to Next Chapter
```

---

## Module C: Dynamic Test Generator Flow

```
User
  │
  ├─ CUSTOM TEST ──────────────────┐
  │  ├─ Select Subject              │
  │  ├─ Choose Chapters (Ch.1, 3, 5)│
  │  ├─ Set Difficulty (HARD)       │
  │  ├─ Target: 60 minutes          │
  │  │                              │
  │  ▼                              │
  │  Query DB:                      │
  │  WHERE subjectID=AOTH           │
  │  AND chapterID IN (Ch.1, 3, 5)  │
  │  AND difficulty=HARD            │
  │  │                              │
  │  ▼                              │
  │  Assemble Test (balanced by     │
  │  time estimates)                │
  │  │                              │
  │  ▼                              │
  │  Take Test & Submit Answers     │
  │  │                              │
  │  ▼                              │
  │  Grade + Analysis by Chapter    │
  │                                 │
  └─ FULL SYLLABUS TEST ───────────┘
     (Only if ALL chapters done)
     │
     ▼
     Generate Official Exam (180 min)
     ├─ Theme A: Theory (45 min)
     ├─ Theme B: Exercises (90 min)
     └─ Theme C: Complex (45 min)
     │
     ▼
     Take 3-Hour Exam
     │
     ▼
     Grade & Compare to Standards
```

---

## Module D: Past Exams Archive Flow

```
User
  │
  ├─ FULL EXAM MODE ──────────┐
  │  │                        │
  │  ▼                        │
  │  Browse Exams (2015-2024) │
  │                           │
  │  Filter by:               │
  │  • Subject (AOTH, AEPP)   │
  │  • Year                   │
  │  • Session (June/Sept)    │
  │  │                        │
  │  ▼                        │
  │  Select Exam              │
  │  │                        │
  │  ▼                        │
  │  Take Full Exam (180 min) │
  │  │                        │
  │  ▼                        │
  │  Submit & View Official   │
  │  Solutions                │
  │                           │
  └─ CHAPTER FILTER MODE ─────┘
     │
     ▼
     "Show all Ch.2 Qs from 2015-2024"
     │
     ▼
     Filter past exam questions by:
     • Subject
     • Chapter
     • Year range
     │
     ▼
     Create practice test from results
     │
     ▼
     Take test & get graded
```

---

## Module E: Essay Sandbox Flow

```
User
  │
  ▼
Choose Essay Theme:
├─ Environment (Περιβάλλον)
├─ AI (Τεχνητή Νοημοσύνη)
├─ Education (Εκπαίδευση)
└─ Human Rights (Ανθρώπινα Δικαιώματα)
  │
  ▼
View Theme Details & Structure Blueprint
├─ Πρόλογος (Introduction)
├─ Κύριο Θέμα (Main Body)
└─ Επίλογος (Conclusion)
  │
  ▼
Access Vocabulary Bank (filtered by theme)
  │ (Academic words + transition phrases)
  │
  ▼
Select Prompt & Start Writing
  │
  ▼
Submit Essay
  │
  ▼
AI Grades on 3 Rubrics:
├─ Periomeno (Content): 0-10
├─ Domi (Structure): 0-10
└─ Ekfrasi (Language): 0-10
  │
  ▼
Receive Feedback:
├─ Overall Score (0-100)
├─ Rubric Breakdown
├─ Strengths & Weaknesses
├─ Sentence-Level Suggestions
├─ Vocabulary Upgrades
└─ Grammar Issues
  │
  ▼
Revise & Resubmit (Optional)
  │
  ▼
Track Progress Over Time
  │ (Average scores by theme)
```

---

## Database Query Patterns

### Pattern 1: Dynamic Test Assembly
```sql
SELECT * FROM questions 
WHERE 
  subjectID = 'AOTH' 
  AND chapterID IN ('Ch.1', 'Ch.3', 'Ch.5')
  AND difficulty = 'HARD'
ORDER BY RAND()
LIMIT 20
```

### Pattern 2: Chapter Filtering for Past Exams
```sql
SELECT q.* FROM questions q
INNER JOIN past_exams pe ON q.id = ANY(pe.questionReferences)
WHERE 
  pe.subjectID = 'AOTH'
  AND q.chapterID = 'Ch.2'
  AND YEAR(pe.examYear) BETWEEN 2015 AND 2024
```

### Pattern 3: User Progress Aggregation
```sql
SELECT 
  up.chapterID,
  COUNT(tr.id) as test_attempts,
  AVG(tr.score) as average_score,
  MAX(tr.completedAt) as last_test_date
FROM user_progress up
LEFT JOIN test_results tr ON up.userID = tr.userID 
  AND up.subjectID = tr.subjectID
WHERE up.userID = :userID AND up.subjectID = 'AOTH'
GROUP BY up.chapterID
```

---

## API Request/Response Example

### Getting a Chapter (Module A)
```
REQUEST:
GET /api/textbook/AOTH/chapters/Ch.2
Authorization: Bearer eyJhbGciOi...

RESPONSE:
{
  "success": true,
  "chapter": {
    "chapterID": "Ch.2",
    "title_el": "Ζήτηση - Προσφορά",
    "interactiveBlocks": [
      {
        "id": "block_001",
        "type": "DEFINITION",
        "question": "Συμπληρώστε: Η ζήτηση είναι...",
        "answer": "ηποσότητα που οι καταναλωτές..."
      }
    ],
    "keyDefinitions": [...],
    "keyFormulas": [...]
  }
}
```

### Submitting Test Answers (Module B/C)
```
REQUEST:
POST /api/tests/chapter/AOTH/submit-answers
Authorization: Bearer eyJhbGciOi...
{
  "testSessionID": "sess_12345",
  "answers": [
    { "questionID": "q1", "userAnswer": "A" },
    { "questionID": "q2", "userAnswer": "Elastic" }
  ]
}

RESPONSE:
{
  "success": true,
  "testResult": {
    "score": 85.5,
    "correctAnswers": 8,
    "totalQuestions": 10,
    "chapterBreakdown": [
      { "chapterID": "Ch.1", "score": 90 },
      { "chapterID": "Ch.2", "score": 80 }
    ],
    "analysis": {
      "weakAreas": ["elasticity"],
      "strongAreas": ["definitions", "supply-demand"]
    }
  }
}
```

### Submitting an Essay (Module E)
```
REQUEST:
POST /api/essays/submit
Authorization: Bearer eyJhbGciOi...
{
  "themeID": "theme_env_001",
  "prompt_el": "Εξηγείστε τη σχέση...",
  "essayText_el": "Ο κόσμος αλλάζει..."
}

RESPONSE:
{
  "success": true,
  "submissionID": "essay_12345",
  "rubricScores": {
    "periomeno": 8.5,
    "domi": 7.8,
    "ekfrasi": 8.2
  },
  "overallScore": 82.5,
  "feedback": {
    "strengths": ["Clear arguments", "Good structure"],
    "weaknesses": ["Repeated phrases", "Some grammar"],
    "sentenceLevel": [
      {
        "sentence": "Το περιβάλλον είναι σημαντικό...",
        "issue": "Vague - be more specific",
        "suggestion": "The environment, particularly climate systems, is critical..."
      }
    ]
  }
}
```

---

## Deployment Architecture (Future)

```
┌──────────────────────────────────────┐
│         Load Balancer                 │
│        (AWS / Nginx)                  │
└──────────────┬───────────────────────┘
               │
     ┌─────────┼─────────┐
     │         │         │
     ▼         ▼         ▼
┌────────┐ ┌────────┐ ┌────────┐
│ Node.js│ │ Node.js│ │ Node.js│
│ Server │ │ Server │ │ Server │
│ Port   │ │ Port   │ │ Port   │
│ 5000   │ │ 5000   │ │ 5000   │
└────┬───┘ └────┬───┘ └────┬───┘
     │         │         │
     └─────────┼─────────┘
               │
               ▼
     ┌─────────────────────┐
     │   API Gateway       │
     │   (Express)         │
     └─────────────────────┘
               │
               ▼
     ┌─────────────────────┐
     │ PostgreSQL Master   │
     │ (RDS / Managed DB)  │
     └──────────┬──────────┘
                │
     ┌──────────┴──────────┐
     │                     │
     ▼                     ▼
 (Read)              (Write)
 Replicas          Primary
```

---

**Diagram generated**: April 8, 2026
**Architecture version**: 1.0 (Initialization Phase)
