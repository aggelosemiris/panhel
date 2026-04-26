# Setup & Configuration Guide

## Project Overview

**Interactive Panhellenic Exam Coach** - A comprehensive learning platform for Greek high school students preparing for Panhellenic exams.

**Tech Stack**:
- **Backend**: Node.js + Express
- **Frontend**: React + TypeScript
- **Database**: PostgreSQL
- **Authentication**: JWT
- **API**: RESTful

---

## Prerequisites

- Node.js v16+ 
- npm v8+ or yarn
- PostgreSQL 12+
- Git

---

## Environment Setup

### 1. Clone & Install Dependencies

```bash
# Navigate to project root
cd panhel_app

# Install root dependencies
npm install

# Install backend dependencies
cd backend
npm install
cd ..

# Install frontend dependencies  
cd frontend
npm install
cd ..
```

### 2. Create Environment Files

#### Backend `.env` file
```bash
# backend/.env

# Server
PORT=5000
NODE_ENV=development

# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=panhel_app
DB_USER=postgres
DB_PASSWORD=your_password

# JWT
JWT_SECRET=your_super_secret_key_here_change_in_production
JWT_EXPIRE=7d

# CORS
FRONTEND_URL=http://localhost:3000

# File uploads
UPLOAD_DIR=./uploads
MAX_FILE_SIZE=50mb

# External APIs
OPENAI_API_KEY=your_openai_key_for_essay_grading
```

#### Frontend `.env` file
```bash
# frontend/.env

REACT_APP_API_BASE_URL=http://localhost:5000
REACT_APP_ENV=development
```

### 3. Database Setup

```bash
# Create database
createdb panhel_app -U postgres

# Or using psql
psql -U postgres -c "CREATE DATABASE panhel_app;"

# Run migrations (from backend directory)
cd backend
npm run db:migrate

# Seed initial data
npm run db:seed
```

---

## Project Structure Details

```
panhel_app/
│
├── backend/
│   ├── modules/
│   │   ├── module-a-textbook/       # All Module A logic
│   │   ├── module-b-chapter-testing/ # All Module B logic
│   │   ├── module-c-dynamic-generator/
│   │   ├── module-d-past-exams/
│   │   └── module-e-essay-sandbox/
│   │
│   ├── api/                         # API route handlers
│   │   ├── auth.routes.js
│   │   ├── textbook.routes.js
│   │   ├── test.routes.js
│   │   ├── generator.routes.js
│   │   ├── past-exam.routes.js
│   │   ├── essay.routes.js
│   │   └── user.routes.js
│   │
│   ├── services/                    # Business logic
│   │   └── (to be implemented)
│   │
│   ├── config/                      # Configuration files
│   │   └── (to be implemented)
│   │
│   ├── server.js                    # Express app entry point
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── components/              # React components by module
│   │   │   ├── module-a-textbook/
│   │   │   ├── module-b-testing/
│   │   │   ├── module-c-generator/
│   │   │   ├── module-d-archives/
│   │   │   ├── module-e-essay/
│   │   │   └── Navigation.tsx
│   │   │
│   │   ├── pages/                   # Page components per module
│   │   │   ├── module-a/
│   │   │   ├── module-b/
│   │   │   ├── module-c/
│   │   │   ├── module-d/
│   │   │   ├── module-e/
│   │   │   ├── Dashboard.tsx
│   │   │   ├── LoginPage.tsx
│   │   │   └── NotFoundPage.tsx
│   │   │
│   │   ├── hooks/                   # Custom React hooks
│   │   │   └── (to be implemented)
│   │   │
│   │   ├── utils/                   # Utility functions
│   │   │   └── (to be implemented)
│   │   │
│   │   ├── App.tsx                  # Main app routing
│   │   ├── App.css
│   │   ├── index.tsx
│   │   └── index.css
│   │
│   ├── public/                      # Static assets
│   ├── package.json
│   └── tsconfig.json                # TypeScript config
│
├── database/
│   ├── schemas/                     # Table schema definitions (JS)
│   │   ├── users.schema.js
│   │   ├── questions.schema.js
│   │   ├── textbook_chapters.schema.js
│   │   ├── user_progress.schema.js
│   │   ├── test_results.schema.js
│   │   ├── essay_submissions.schema.js
│   │   ├── essay_themes.schema.js
│   │   ├── vocabulary_bank.schema.js
│   │   └── past_exams.schema.js
│   │
│   ├── migrations/                  # Database migration scripts
│   │   └── (to be created)
│   │
│   └── seeds/                       # Seed data for initialization
│       └── (to be created)
│
├── docs/
│   ├── DATABASE_SCHEMA.md           # Full database documentation
│   ├── MODULES.md                   # Module specifications
│   ├── API_ENDPOINTS.md             # API reference
│   └── GREEK_CONTENT_GUIDELINES.md  # (To be created)
│
├── README.md                        # Project overview
└── package.json                     # Root package.json (monorepo)
```

---

## Running the Project

### Development Mode (Both frontend & backend)

```bash
# From root directory
npm run dev
```

This will start:
- **Backend**: `http://localhost:5000`
- **Frontend**: `http://localhost:3000`

### Backend Only

```bash
cd backend
npm run dev
```

### Frontend Only

```bash
cd frontend
npm start
```

---

## Development Workflow

### 1. Creating New Endpoints

**Pattern**: 
1. Create route handler in `backend/api/[module].routes.js`
2. Implement service logic in `backend/services/[module].service.js`
3. Follow REST conventions
4. Add comprehensive error handling

**Example**:
```javascript
// backend/api/textbook.routes.js
router.get('/:subjectID/chapters/:chapterID', async (req, res) => {
  try {
    // Service call
    const chapter = await textbookService.getChapter(...);
    res.json({ success: true, data: chapter });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});
```

### 2. Creating React Components

**Pattern**:
1. Create component in `frontend/src/components/[module]/[ComponentName].tsx`
2. Use TypeScript for type safety
3. Import styles locally
4. Use hooks for state management (Redux/Zustand)

**Example**:
```typescript
// frontend/src/components/module-a-textbook/InteractiveBlock.tsx
import React, { useState } from 'react';

interface Props {
  blockID: string;
  content: string;
  onComplete: () => void;
}

export const InteractiveBlock: React.FC<Props> = ({ blockID, content, onComplete }) => {
  const [isCompleted, setIsCompleted] = useState(false);

  return (
    <div className="interactive-block">
      {/* Block content */}
    </div>
  );
};
```

### 3. Testing

```bash
# Backend tests
cd backend
npm run test

# Frontend tests
cd frontend
npm test
```

---

## Database Migrations

### Create a Migration

```bash
cd backend
node scripts/create-migration.js name-of-migration
```

### Run Migrations

```bash
npm run db:migrate
```

### Rollback

```bash
npm run db:rollback
```

---

## Styling Guidelines

- **Framework**: Tailwind CSS (frontend)
- **CSS Files**: One per page/component
- **Color Scheme**:
  - Primary: `#0066cc` (blue)
  - Dark: `#1a1a1a` (near black)
  - Light backgrounds: `#f5f5f5`
  - Success: `#66cc00` (green)
  - Error: `#cc0000` (red)

---

## Greek Content Guidelines

All educational content must:
1. ✅ Come from official Greek Ministry of Education textbooks
2. ✅ Be 1:1 replicas (zero hallucination)
3. ✅ Support rote memorization for AOTH/AEPP
4. ✅ Mirror official exam structure exactly

**Files for Greek Content**:
- See `docs/GREEK_CONTENT_GUIDELINES.md` (to be created)

---

## Build & Deployment

### Build for Production

```bash
npm run build
```

This creates:
- `backend/dist/` - compiled backend
- `frontend/build/` - compiled frontend

### Production Environment

Create `production.env`:
```bash
NODE_ENV=production
DB_HOST=production-db-host
JWT_SECRET=production_secret_key
# ... other production variables
```

### Deploy

(Deployment strategy to be defined - Docker, AWS, Heroku, etc.)

---

## Troubleshooting

### Database Connection Issues
```bash
# Check PostgreSQL is running
brew services list  # macOS
# or
sudo systemctl status postgresql  # Linux
```

### Port Already in Use
```bash
# Kill process on port 5000
lsof -i :5000
kill -9 <PID>

# Kill process on port 3000
lsof -i :3000
kill -9 <PID>
```

### Node Modules Issues
```bash
# Clean install
rm -rf node_modules
npm install
```

---

## Next Steps

1. ✅ Project structure created
2. ⏳ Database migrations setup (implement)
3. ⏳ Service layer implementation (by module)
4. ⏳ React component development (by module)
5. ⏳ Integration testing
6. ⏳ E2E testing
7. ⏳ Greek content data loading
8. ⏳ Production deployment

---

## Contributing Guidelines

- Create feature branches: `feature/module-name`
- Follow naming conventions
- Write tests for new features
- Document API changes
- Submit pull requests with descriptions

---

**For detailed module information, see [MODULES.md](MODULES.md)**

**For database schema details, see [DATABASE_SCHEMA.md](DATABASE_SCHEMA.md)**

**For API reference, see [API_ENDPOINTS.md](API_ENDPOINTS.md)**
