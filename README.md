# Interactive Panhellenic Exam Coach 📚

A comprehensive, interactive learning and testing platform for Greek high school students preparing for Panhellenic exams. Covers Economics (AOTH), Business Economics (AEPP), Mathematics, and Greek Essay (Ekthesi).

## 🎯 Core Architecture

This platform consists of 5 interconnected modules:

### Module A: Interactive Textbook (Θεωρία)
- Digital replication of official Greek Ministry of Education textbooks
- Subject → Chapter → Sub-chapter → Interactive Blocks structure
- Drag-and-drop theory interactions, formula reveals, keyword matching
- Visual highlighting of must-memorize content
- **Path**: `backend/modules/module-a-textbook` | `frontend/src/components/module-a-textbook`

### Module B: Chapter-Level Testing Engine (Κεφαλαιακές Δοκιμές)
- Progressive 3-tier testing system after chapter completion
- **Tier 1 (Easy)**: Basic comprehension, definitions, True/False
- **Tier 2 (Normal)**: Standard school-level, short exercises
- **Tier 3 (Hard)**: Panhellenic-level difficulty, edge cases
- **Path**: `backend/modules/module-b-chapter-testing` | `frontend/src/components/module-b-testing`

### Module C: Dynamic Test Generator (Προσαρμοσμένες Δοκιμές)
- Custom mix-and-match exam creation
- User inputs: Subject + Chapters + Difficulty
- Full syllabus mode: 3-hour simulated Panhellenic exam
- **Path**: `backend/modules/module-c-dynamic-generator` | `frontend/src/components/module-c-generator`

### Module D: 10-Year Past Exams Archive (Παλαιές Εξετάσεις)
- Complete AOTH, AEPP, Math exams (2015-2024)
- Every question tagged by chapter for filtering
- Users can take full exams or filter by topic
- **Path**: `backend/modules/module-d-past-exams` | `frontend/src/components/module-d-archives`

### Module E: Greek Essay AI Sandbox (Έκθεση)
- Interactive essay themes: Environment, AI, Education, Human Rights
- Structure templates: Prologos → Kyrio Thema → Epilogos
- AI rubric grading: Content (Periomeno), Structure (Domi), Language (Ekfrasi)
- Vocabulary bank with high-level academic terms
- **Path**: `backend/modules/module-e-essay-sandbox` | `frontend/src/components/module-e-essay`

## 📊 Database Schema

All questions follow a strict **tagging taxonomy** for dynamic test generation:

```
SubjectID → ChapterID → SubChapterID
QuestionType: MULTIPLE_CHOICE, TRUE_FALSE, DEFINITION, CALCULATION, etc.
Difficulty: EASY, NORMAL, HARD
Source: ORIGINAL_CONTENT, Past Exam Year
TimeEstimate: Minutes (for balanced test generation)
```

**Tables**:
- `users` - User accounts and authentication
- `questions` - Core question repository with full tagging
- `textbook_chapters` - Module A: Interactive textbook structure
- `user_progress` - Chapter completion tracking
- `test_results` - Module B/C/D exam attempt results
- `essay_submissions` - Module E: Student essays with AI feedback
- `essay_themes` - Module E: Theme templates and structures
- `vocabulary_bank` - Module E: High-level vocabulary repository
- `past_exams` - Module D: Official exam metadata and questions

**Design**: [See database/schemas/](database/schemas/)

## 🚀 Project Structure

```
panhel_app/
├── backend/
│   ├── modules/
│   │   ├── module-a-textbook/       (Interactive theory)
│   │   ├── module-b-chapter-testing/ (3-tier testing)
│   │   ├── module-c-dynamic-generator/ (Custom tests)
│   │   ├── module-d-past-exams/     (10-year archive)
│   │   └── module-e-essay-sandbox/  (Essay AI grader)
│   ├── api/                         (REST endpoints)
│   ├── services/                    (Business logic)
│   ├── config/                      (Configuration)
│   └── server.js                    (Entry point)
├── frontend/
│   ├── src/
│   │   ├── components/              (React components per module)
│   │   ├── pages/                   (Page layouts)
│   │   ├── hooks/                   (Custom React hooks)
│   │   └── utils/                   (Helper functions)
│   └── public/                      (Static assets)
├── database/
│   ├── schemas/                     (Table schemas - JS definitions)
│   ├── migrations/                  (Schema versions)
│   └── seeds/                       (Initialization data)
└── docs/                            (Documentation)
```

## 🛠 Tech Stack

- **Backend**: Node.js + Express
- **Frontend**: React + TypeScript
- **Database**: PostgreSQL (recommended)
- **ORM**: Sequelize or Knex
- **Authentication**: JWT
- **Validation**: Joi
- **PDF Generation**: PDFKit or similar
- **AI/ML**: OpenAI API (for essay grading)

## ✅ Zero-Hallucination Policy

All educational content in this platform:
- ✓ Must be sourced from official Greek Ministry of Education textbooks
- ✓ Cannot contain invented material or "alternative explanations"
- ✓ Supports rote-memorization requirements for AOTH/AEPP
- ✓ Strictly mirrors official exam structure and difficulty

## 📚 Content Organization

**Subjects Supported**:
- AOTH (Αρχές Οικονομικής Θεωρίας) - Economics Principles
- AEPP (Αρχές Επιχειρηματικότητας & Διοίκησης) - Business & Organization
- ΜΑTH (Μαθηματικά) - Mathematics
- EKTHESI (Έκθεση) - Greek Essay

**Chapter Structure**: Each subject divided into official chapters, further subdivided into micro-topics for progressive learning.

## 🎓 Getting Started

```bash
# Install dependencies
npm install

# Set up databases
npm run db:migrate
npm run db:seed

# Development mode
npm run dev

# Production build
npm run build
npm start
```

## 📝 Documentation

- [Database Schema Documentation](docs/DATABASE_SCHEMA.md)
- [API Endpoints](docs/API_ENDPOINTS.md)
- [Module Specifications](docs/MODULES.md)
- [Greek Language Guidelines](docs/GREEK_CONTENT_GUIDELINES.md)
- [Render Deployment Guide](DEPLOY_RENDER.md)

## 📧 Support & Contribution

This project follows strict educational standards. All contributions must maintain zero-hallucination policy and adherence to official Greek curriculum.

---

**Build with precision. Learn with confidence.** 🇬🇷
