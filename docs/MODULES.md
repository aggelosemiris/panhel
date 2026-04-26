# Module Specifications

## Module A: Interactive Textbook (Θεωρία)

### Purpose
Present the exact official Greek textbook content broken into interactive micro-steps, supporting progressive learning.

### Key Features
1. **Structure**: Subject → Chapter → Sub-chapter → Interactive Block
2. **Interactive Elements**:
   - Drag-and-drop keyword matching into definitions
   - Click-to-reveal formula derivations
   - Fill-in-the-blank essential vocabulary
   - Interactive diagrams (supply/demand curves, etc.)

3. **Visual Distinction**:
   - ⭐ **Must-Memorize** content highlighted in yellow
   - 📌 Key definitions boxed and emphasized
   - 🧮 Formulas shown with step-by-step derivation

4. **Progress Tracking**:
   - Percentage of chapter read
   - Time spent per chapter
   - Number of interactive interactions completed
   - Must reach 100% before unlocking chapter tests

### Technical Implementation
- **Database**: `textbook_chapters` table with JSON `interactiveBlocks` array
- **Frontend**: React components per subject/chapter with drag-drop libraries (dnd-kit)
- **Progression Logic**: User cannot skip to next section until current section completed

---

## Module B: Chapter-Level Testing Engine (Κεφαλαιακές Δοκιμές)

### Purpose
Progressive 3-tier testing system that unlocks only after chapter completion.

### Testing Tiers

#### **Tier 1: Easy (Θέματα Εύκολα)**
- **Use Case**: Basic comprehension after chapter reading
- **Question Types**: Definition fill-in, True/False, basic multiple choice
- **Time**: 10-15 minutes per chapter
- **Passing Score**: >60%
- **Questions**: ~8-10 per chapter

#### **Tier 2: Normal (Κανονικά Θέματα)**
- **Use Case**: Standard school-level practice
- **Question Types**: Multiple choice (complex), short calculations, algorithm steps
- **Time**: 20-30 minutes per chapter
- **Passing Score**: >60%
- **Questions**: ~15-18 per chapter

#### **Tier 3: Hard (Δύσκολα - Επίπεδο Πανελληνίων)**
- **Use Case**: Panhellenic-level preparation
- **Question Types**: Complex problems, edge cases, combined theory
- **Time**: 30-45 minutes per chapter
- **Passing Score**: >70%
- **Questions**: ~20-25 per chapter

### Unlock Logic
```javascript
IF (userProgress[subjectID][chapterID].status === 'COMPLETED') {
  UNLOCK(Tier1, Tier2, Tier3)
} ELSE {
  DISABLE_ALL_TIERS()
}
```

### Feedback System
- Immediate answer explanation
- Category breakdown (e.g., supply-demand: 80%, elasticity: 60%)
- AI-generated "Review these topics" recommendations

---

## Module C: Dynamic Test Generator (Προσαρμοσμένες Δοκιμές)

### Purpose
Enable users to create custom tests and simulate official Panhellenic exams.

### Feature 1: Custom Mix-and-Match

**User Input**:
```
Select Subject: AOTH
Select Chapters: [Ch.1, Ch.3, Ch.5]
Select Difficulty: HARD
Target: 60 minutes
```

**Backend Assembly**:
1. Query all questions: `subjectID=AOTH AND chapterID IN [Ch.1, Ch.3, Ch.5] AND difficulty=HARD`
2. Calculate total time estimate
3. Shuffle and select questions to match 60-minute target
4. Ensure balanced question type distribution
5. Return test session

### Feature 2: Full-Syllabus Exam (Final Revision)

**Trigger**: Available only when ALL chapters completed

**Structure** (Official Panhellenic Format):
```
Theme A: Theory (Θέματα Θεωρίας)
  - Definitions & explanations
  - 45 minutes
  - ~15-20 questions

Theme B: Exercises (Θέματα Ασκήσεων)
  - Calculations, algorithms
  - 90 minutes
  - ~15-20 questions

Theme C: Extended Problems (Optional)
  - Complex scenarios
  - 45 minutes
  - ~5-10 questions

TOTAL: 180 minutes (3 hours)
```

**Weighting**: Weighted by official exam distribution (e.g., 40% theory, 50% exercises, 10% complex)

### Grading & Feedback
- Immediate score with breakdown by chapter
- AI analysis of weak chapters
- "Focus on Ch.2 (50% accuracy)" recommendations
- Comparison to historical passing rates

---

## Module D: 10-Year Past Exams Archive (Παλαιές Εξετάσεις)

### Purpose
Provide access to official Panhellenic exams from 2015-2024 with chapter tagging for filtering.

### Data Organization

**By Exam**:
- Subject: AOTH | AEPP | MATH
- Year: 2015-2024
- Session: June | September
- Structure: Official exam themes
- ~35 questions per exam

**By Chapter**:
- Every question tagged with source chapter
- Example: "AOTH 2023 June Q3 → Chapter 2"

### Features

#### Feature 1: Full Exam Attempt
```
Browse past exams → Select exam → Start session → Take 3-hour exam → Get grading + official solutions
```

#### Feature 2: Chapter Filter Practice
```
"Show all Ch.2 questions from 2015-2024"
→ Returns ~30-40 questions → Create practice test
```

**Example Query**:
```javascript
getQuestionsFromPastExams({
  subject: 'AOTH',
  chapter: 'Ch.2',
  startYear: 2015,
  endYear: 2024
})
// Returns: 35 questions tagged with Ch.2 from 10 years
```

### Official Solutions
- Provided for all past exams
- Displayed after submission
- Educational commentary on tricky questions

---

## Module E: Greek Essay AI Sandbox (Έκθεση)

### Purpose
AI-powered feedback on Greek essay writing with rubric-based grading.

### Essay Themes (Panhellenic Standard)
1. **Environment (Περιβάλλον)**
   - Climate change, biodiversity, sustainability
   - Prompts: "Εξηγείστε τη σχέση μεταξύ ανθρώπινης δράσης και περιβαλλοντικής αλλοίωσης"

2. **Artificial Intelligence (Τεχνητή Νοημοσύνη)**
   - Ethics, employment, innovation
   - Prompts: "Διακρίνετε τις θετικές και αρνητικές επιπτώσεις της ΤΝ"

3. **Education (Εκπαίδευση)**
   - Role of education, innovation in learning, access
   - Prompts: "Αναλύστε τον ρόλο της τεχνολογίας στη σύγχρονη εκπαίδευση"

4. **Human Rights (Ανθρώπινα Δικαιώματα)**
   - Equality, justice, social issues
   - Prompts: "Υποστηρίξτε τη σημασία της προστασίας των ανθρώπινων δικαιωμάτων"

### Structure Blueprint (Enforced)

Every essay is guided by this structure:

**1. Πρόλογος (Introduction)**
- Hook/attention-grabber
- Clear thesis statement
- Preview of main arguments
- **Length**: 80-150 words

**2. Κύριο Θέμα (Main Body)**
- Argument 1 with evidence
- Argument 2 with evidence
- Argument 3 with evidence (optional)
- Counter-argument + rebuttal (optional)
- **Length**: 300-600 words

**3. Επίλογος (Conclusion)**
- Restatement of thesis
- Summary of key points
- Broader implications
- **Length**: 80-150 words

### AI Grading Rubric (0-10 scale each)

#### **1. Content (Περιεχόμενο) - 0-10**
- ✅ Relevance to prompt
- ✅ Argument quality and depth
- ✅ Evidence/examples provided
- ✅ Logical flow between ideas

#### **2. Structure (Δομή) - 0-10**
- ✅ Clear Prologos → Kyrio Thema → Epilogos
- ✅ Paragraph coherence
- ✅ Transition smoothness
- ✅ Overall organization

#### **3. Language (Έκφραση) - 0-10**
- ✅ Vocabulary sophistication
- ✅ Grammar and syntax correctness
- ✅ Spelling and punctuation
- ✅ Sentence variety

**Overall Score**: Average of 3 rubrics × 10

### Vocabulary Bank (Λεξιλόγιο)

**High-Level Academic Terms** organized by:
- Difficulty: Basic | Intermediate | Advanced
- Theme: Environment | AI | Education | Human Rights
- Type: Transition words | Argument starters | Conclusion markers

**Examples**:
- ωστόσο (however) - Transition
- επομένως (therefore) - Conclusion starter
- διαφωνώ (I disagree) - Argument starter

**AI Suggestions**: 
- "Consider replacing 'καλό' with 'πολύτιμο' for more sophisticated language"

### Feedback System

**User sees**:
1. Overall score (0-100)
2. Rubric breakdown (Content: 8.5, Structure: 7.2, Language: 8.0)
3. **Sentence-level feedback**: Highlighted weak sentences with suggestions
4. **Vocabulary suggestions**: "Upgrade these 3 phrases"
5. **Grammar issues**: Specific error locations with explanations
6. **Structure analysis**: Prologos quality, Kyrio Thema development, Epilogos conclusion strength

**Revision Loop**: Student can revise and resubmit unlimited times

---

## Implementation Priority

```
Phase 1: Module A (Textbook) + Module B (Testing)
Phase 2: Module C (Generator) + Module D (Archives)
Phase 3: Module E (Essay AI)
```

All modules depend on **Database & API infrastructure** being complete first.
