const OPENAI_API_URL = 'https://api.openai.com/v1/responses';
const DEFAULT_MODEL = process.env.OPENAI_CHAPTER_TEST_MODEL || 'gpt-5';

const SUBJECT_LABELS = {
  aoth: 'ΑΟΘ',
  aepp: 'ΑΕΠΠ',
  math: 'Μαθηματικά',
};

const DIFFICULTY_LABELS = {
  easy: 'εύκολο',
  normal: 'μέτριο',
  hard: 'δύσκολο',
};

function buildDifficultyGuidance(difficulty) {
  if (difficulty === 'easy') {
    return 'Κράτησε το διαγώνισμα φιλικό, με καθαρή διατύπωση, βασική θεωρία και άμεσες εφαρμογές.';
  }

  if (difficulty === 'hard') {
    return 'Κάνε το διαγώνισμα απαιτητικό, με συνδυαστικές ερωτήσεις, αυξημένη κρίση, παγίδες μεθοδολογίας και ύφος προχωρημένης προετοιμασίας.';
  }

  return 'Κάνε το διαγώνισμα ισορροπημένο, με κανονική δυσκολία και σταδιακή κλιμάκωση.';
}

function formatMathTypography(text) {
  return String(text || '')
    .replace(/\^2/g, '²')
    .replace(/\^3/g, '³')
    .replace(/\^4/g, '⁴')
    .replace(/\^5/g, '⁵')
    .replace(/\bR\b/g, 'ℝ')
    .replace(/\bx0\b/g, 'x₀')
    .replace(/\bx1\b/g, 'x₁')
    .replace(/\bx2\b/g, 'x₂')
    .replace(/\bf'\(x\)/g, 'f′(x)')
    .replace(/\bg'\(x\)/g, 'g′(x)')
    .replace(/\bh'\(x\)/g, 'h′(x)')
    .replace(/\bCf\b/g, 'C_f')
    .replace(/\blim x->/g, 'lim x→')
    .replace(/\blim\(x->/g, 'lim(x→')
    .replace(/\blim x→/g, 'lim x→')
    .replace(/x'x/g, 'x′x')
    .replace(/y'y/g, 'y′y');
}

function normalizeExamTypography(exam, subjectId) {
  if (subjectId !== 'math') {
    return exam;
  }

  return {
    ...exam,
    title: formatMathTypography(exam.title),
    instructions: (exam.instructions ?? []).map((instruction) => formatMathTypography(instruction)),
    questions: (exam.questions ?? []).map((question) => ({
      ...question,
      title: formatMathTypography(question.title),
      prompt: formatMathTypography(question.prompt),
    })),
  };
}

function buildFallbackQuestionTemplates({ subjectId, chapterTitle, sections, difficulty }) {
  const focusList = sections.length ? sections.slice(0, 6).join(', ') : chapterTitle;

  if (subjectId === 'math') {
    return [
      {
        id: 'Q1',
        title: 'Θεωρία και βασικές έννοιες',
        prompt: `Να παρουσιάσετε συνοπτικά τις βασικές έννοιες του ${chapterTitle} και να εξηγήσετε πώς συνδέονται με τις ενότητες: ${focusList}.`,
        points: 20,
      },
      {
        id: 'Q2',
        title: 'Εφαρμογή βασικής μεθοδολογίας',
        prompt: `Να λυθεί άσκηση βασικής εφαρμογής από το ${chapterTitle}, με πλήρη αιτιολόγηση όλων των βημάτων και σωστή χρήση της σχετικής μεθοδολογίας.`,
        points: 25,
      },
      {
        id: 'Q3',
        title: 'Συνδυαστική άσκηση',
        prompt: `Να διατυπωθεί και να λυθεί συνδυαστική άσκηση που αξιοποιεί περισσότερες από μία έννοιες του ${chapterTitle}, με έμφαση στην ορθή πορεία λύσης.`,
        points: 25,
      },
      {
        id: 'Q4',
        title: difficulty === 'hard' ? 'Απαιτητικό πρόβλημα κρίσης' : 'Πρόβλημα εμβάθυνσης',
        prompt: `Να δοθεί πρόβλημα αυξημένης δυσκολίας πάνω στο ${chapterTitle}, το οποίο να απαιτεί ανάλυση, σωστή στρατηγική και τεκμηρίωση του τελικού συμπεράσματος.`,
        points: 30,
      },
    ];
  }

  if (subjectId === 'aepp') {
    return [
      {
        id: 'Q1',
        title: 'Θεωρία / Ορισμοί',
        prompt: `Να απαντηθούν θεωρητικά ερωτήματα πάνω στο ${chapterTitle}, με βάση τις ενότητες ${focusList}.`,
        points: 20,
      },
      {
        id: 'Q2',
        title: 'Σύντομες εφαρμογές',
        prompt: `Να δοθούν μικρές εφαρμογές ή ερωτήσεις κατανόησης που ελέγχουν αν ο μαθητής μπορεί να εφαρμόσει τις βασικές αρχές του ${chapterTitle}.`,
        points: 20,
      },
      {
        id: 'Q3',
        title: 'Ανάπτυξη αλγορίθμου',
        prompt: `Να ζητηθεί ανάπτυξη αλγορίθμου ή ψευδοκώδικα που αξιοποιεί το περιεχόμενο του ${chapterTitle}, με σαφή βήματα και σωστή λογική.`,
        points: 30,
      },
      {
        id: 'Q4',
        title: 'Πρόγραμμα / συνδυαστική άσκηση',
        prompt: `Να δοθεί πιο αναλυτική άσκηση προγραμματισμού ή ανάλυσης, που να ελέγχει ουσιαστικά την κατανόηση του ${chapterTitle}.`,
        points: 30,
      },
    ];
  }

  return [
    {
      id: 'Q1',
      title: 'Θεωρία',
      prompt: `Να αναπτυχθούν οι βασικές έννοιες του ${chapterTitle} με αναφορά στις ενότητες ${focusList}.`,
      points: 20,
    },
    {
      id: 'Q2',
      title: 'Σύντομες ερωτήσεις κατανόησης',
      prompt: `Να απαντηθούν στοχευμένες ερωτήσεις κατανόησης που ελέγχουν αν ο μαθητής έχει αφομοιώσει τον πυρήνα του ${chapterTitle}.`,
      points: 20,
    },
    {
      id: 'Q3',
      title: 'Άσκηση εφαρμογής',
      prompt: `Να δοθεί άσκηση εφαρμογής πάνω στο ${chapterTitle}, με σαφή ζητούμενα και βήμα-βήμα αιτιολόγηση.`,
      points: 25,
    },
    {
      id: 'Q4',
      title: difficulty === 'hard' ? 'Σύνθετη άσκηση οικονομικής κρίσης' : 'Άσκηση εμβάθυνσης',
      prompt: `Να δοθεί συνδυαστική άσκηση που απαιτεί κριτική σκέψη και σύνθεση γνώσεων από το ${chapterTitle}.`,
      points: 35,
    },
  ];
}

function buildFallbackGeneratedExam({ subjectId, chapterId, chapterTitle, sections, difficulty }) {
  const exam = {
    title: `AI Διαγώνισμα - ${SUBJECT_LABELS[subjectId] ?? subjectId} / ${chapterTitle}`,
    subject: SUBJECT_LABELS[subjectId] ?? subjectId,
    chapterId,
    chapterTitle,
    difficulty,
    difficultyLabel: DIFFICULTY_LABELS[difficulty] ?? difficulty,
    estimatedTimeMinutes: difficulty === 'hard' ? 80 : difficulty === 'easy' ? 50 : 65,
    instructions: [
      `Το διαγώνισμα καλύπτει αποκλειστικά το ${chapterTitle}.`,
      'Δούλεψε με σαφή αιτιολόγηση και πλήρη βήματα λύσης.',
      buildDifficultyGuidance(difficulty),
    ],
    questions: buildFallbackQuestionTemplates({ subjectId, chapterTitle, sections, difficulty }),
    generationMode: 'fallback',
    model: 'fallback',
  };

  return normalizeExamTypography(exam, subjectId);
}

async function callOpenAiChapterTestGenerator({ subjectId, chapterId, chapterTitle, sections, difficulty }) {
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    return buildFallbackGeneratedExam({ subjectId, chapterId, chapterTitle, sections, difficulty });
  }

  const response = await fetch(OPENAI_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: DEFAULT_MODEL,
      input: [
        {
          role: 'user',
          content: [
            {
              type: 'input_text',
              text: [
                'Create a Greek high-school chapter exam in Greek.',
                'Return JSON only.',
                `Subject: ${SUBJECT_LABELS[subjectId] ?? subjectId}`,
                `Canonical subject id: ${subjectId}`,
                `Canonical chapter id: ${chapterId}`,
                `Chapter title: ${chapterTitle}`,
                `Chapter sections: ${sections.join(', ') || chapterTitle}`,
                `Difficulty: ${DIFFICULTY_LABELS[difficulty] ?? difficulty}`,
                'Generate a complete ready-to-use chapter test.',
                'The test should have 4 questions and total 100 points.',
                'Keep the exam realistic and suitable for Greek students preparing for Panhellenic-style study.',
              ].join('\n'),
            },
          ],
        },
      ],
      text: {
        format: {
          type: 'json_schema',
          name: 'chapter_exam',
          strict: true,
          schema: {
            type: 'object',
            additionalProperties: false,
            properties: {
              title: { type: 'string' },
              instructions: {
                type: 'array',
                items: { type: 'string' },
              },
              estimatedTimeMinutes: { type: 'number' },
              questions: {
                type: 'array',
                items: {
                  type: 'object',
                  additionalProperties: false,
                  properties: {
                    id: { type: 'string' },
                    title: { type: 'string' },
                    prompt: { type: 'string' },
                    points: { type: 'number' },
                  },
                  required: ['id', 'title', 'prompt', 'points'],
                },
              },
            },
            required: ['title', 'instructions', 'estimatedTimeMinutes', 'questions'],
          },
        },
      },
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`OpenAI chapter generator failed (${response.status}): ${errorText}`);
  }

  const payload = await response.json();
  const outputText =
    payload.output_text ||
    (payload.output ?? [])
      .flatMap((item) => item.content ?? [])
      .filter((item) => item.type === 'output_text' && typeof item.text === 'string')
      .map((item) => item.text)
      .join('\n')
      .trim();

  if (!outputText) {
    throw new Error('OpenAI chapter generator returned empty output.');
  }

  const parsed = JSON.parse(outputText);
  return normalizeExamTypography(
    {
      title: parsed.title,
      subject: SUBJECT_LABELS[subjectId] ?? subjectId,
      chapterId,
      chapterTitle,
      difficulty,
      difficultyLabel: DIFFICULTY_LABELS[difficulty] ?? difficulty,
      estimatedTimeMinutes: Number(parsed.estimatedTimeMinutes ?? 60),
      instructions: Array.isArray(parsed.instructions) ? parsed.instructions : [],
      questions: Array.isArray(parsed.questions) ? parsed.questions : [],
      generationMode: 'openai',
      model: DEFAULT_MODEL,
    },
    subjectId,
  );
}

async function generateChapterTest(args) {
  try {
    return await callOpenAiChapterTestGenerator(args);
  } catch (error) {
    if (process.env.OPENAI_API_KEY) {
      console.error('OpenAI chapter test generation failed, using fallback:', error);
    }

    return buildFallbackGeneratedExam(args);
  }
}

function buildFallbackCustomTest({ subjectId, chapters, difficulty }) {
  const chapterLine = chapters.map((chapter) => `${chapter.number}. ${chapter.title}`).join(', ');
  const sectionPool = chapters.flatMap((chapter) => (chapter.sections ?? []).slice(0, 4).map((section) => section.title));
  const sectionLine = sectionPool.slice(0, 8).join(', ');
  const chapterRefs = chapters.map((chapter) => `Κεφάλαιο ${chapter.number}`).join(', ');
  const isHard = difficulty === 'hard';
  const isEasy = difficulty === 'easy';

  function buildMathQuestions() {
    return [
      {
        id: 'Θέμα Α',
        title: 'Θεωρία, ορισμοί και σωστό-λάθος',
        prompt: `Α1. Να αποδείξετε μία βασική πρόταση ή ένα θεώρημα που συνδέεται άμεσα με τα κεφάλαια ${chapterRefs}.
Α2. Να διατυπώσετε:
α) έναν ορισμό από την επιλεγμένη ύλη,
β) ένα θεώρημα ή μία πρόταση που χρησιμοποιείται συχνά στις ασκήσεις,
γ) τη γεωμετρική ή αναλυτική ερμηνεία του.
Α3. Να χαρακτηρίσετε τις παρακάτω προτάσεις ως Σωστό ή Λάθος, αιτιολογώντας σύντομα τις λανθασμένες:
α) Κάθε παραγωγίσιμη συνάρτηση είναι συνεχής στο x₀.
β) Αν lim x→x₀ f(x)=0 και lim x→x₀ g(x)=0, τότε lim x→x₀ f(x)/g(x)=1.
γ) Αν f′(x)>0 σε ένα διάστημα, τότε η f είναι γνησίως αύξουσα σε αυτό.`,
        points: 25,
      },
      {
        id: 'Θέμα Β',
        title: 'Καθοδηγούμενη άσκηση πάνω σε συνάρτηση',
        prompt: isEasy
          ? `Δίνεται η συνάρτηση f(x)=x²-4x+3.
Β1. Να βρείτε το πεδίο ορισμού της.
Β2. Να υπολογίσετε την παράγωγο f′(x).
Β3. Να μελετήσετε τη μονοτονία και να βρείτε τα ακρότατα.
Β4. Να βρείτε τα σημεία τομής της γραφικής παράστασης με τους άξονες και να σχολιάσετε τη μορφή της C_f.`
          : `Δίνεται η συνάρτηση f(x)=x³-3x²+2x+1.
Β1. Να βρείτε το πεδίο ορισμού και να υπολογίσετε την f′(x).
Β2. Να μελετήσετε τη μονοτονία της f και να βρείτε τα τοπικά ακρότατα.
Β3. Να μελετήσετε την κυρτότητα της f και να εξετάσετε αν υπάρχουν σημεία καμπής.
Β4. Να γράψετε την εξίσωση της εφαπτομένης της C_f στο σημείο με τετμημένη x=1.`,
        points: 25,
      },
      {
        id: 'Θέμα Γ',
        title: 'Συνδυαστικό πανελλαδικό θέμα',
        prompt: isHard
          ? `Δίνεται η συνάρτηση
f(x)= { x²+αx+β,   x≤1
      { ln(x)+1,   x>1

Γ1. Να προσδιορίσετε τις τιμές των α, β ώστε η f να είναι συνεχής και παραγωγίσιμη στο x₀=1.
Γ2. Να εξετάσετε αν η ευθεία y=2x-1 τέμνει τη γραφική παράσταση της f, αξιοποιώντας κατάλληλο θεώρημα.
Γ3. Να μελετήσετε αν η γραφική παράσταση παρουσιάζει κατακόρυφη ή πλάγια ασύμπτωτη όπου έχει νόημα.
Γ4. Ένα σημείο Μ κινείται πάνω στην C_f. Να εξετάσετε αν υπάρχει χρονική στιγμή όπου ο ρυθμός μεταβολής της τεταγμένης ισούται με τον ρυθμό μεταβολής της τετμημένης.`
          : `Δίνεται η συνάρτηση
f(x)= { x²-1,   x≤1
      { x+lnx, x>1

Γ1. Να εξετάσετε τη συνέχεια της f στο x₀=1.
Γ2. Να μελετήσετε την παραγωγισιμότητα της f στο x₀=1.
Γ3. Να βρείτε, αν υπάρχουν, ασύμπτωτες της γραφικής παράστασης.
Γ4. Να αποδείξετε ότι η εξίσωση f(x)=2 έχει τουλάχιστον μία λύση.`,
        points: 25,
      },
      {
        id: 'Θέμα Δ',
        title: 'Απαιτητικό θέμα στρατηγικής και απόδειξης',
        prompt: isHard
          ? `Έστω παραγωγίσιμη συνάρτηση f:(0,+∞)→ℝ και μία παράγουσα F της f στο (0,+∞), για τις οποίες ισχύει
x·f(x)=2F(x)lnx, για κάθε x>0.
Δ1. Να αποδείξετε ότι η συνάρτηση g(x)=F(x)/x^(lnx), x>0, είναι σταθερή.
Δ2. Δίνεται ακόμη ότι η εφαπτομένη της γραφικής παράστασης της f στο σημείο Μ(1,f(1)) είναι παράλληλη στην ευθεία y=2x.
α) Να υπολογίσετε το lim x→1 f(x)/lnx.
β) Να αποδείξετε ότι F(1)=1 και F(x)=x^(lnx), για κάθε x>0.
γ) Να συναγάγετε ρητό τύπο για τη f και να μελετήσετε τη μονοτονία της.
δ) Να αξιολογήσετε πώς συνδυάζονται όριο, παράγωγος και λογάριθμος στη λύση.`
          : `Έστω συνεχής συνάρτηση f:[0,2]→ℝ με f′(x)=2x+1 και f(0)=1.
Δ1. Να βρείτε τον τύπο της f.
Δ2. Να μελετήσετε τη μονοτονία και την κυρτότητα της f.
Δ3. Να υπολογίσετε το εμβαδόν του χωρίου που περικλείεται από τη γραφική παράσταση της f, τον άξονα x′x και τις ευθείες x=0, x=1.
Δ4. Να εξηγήσετε ποια θεωρήματα και ποιες τεχνικές της ύλης χρησιμοποιήσατε σε κάθε βήμα.`,
        points: 25,
      },
    ];
  }

  function buildAeppQuestions() {
    return [
      {
        id: 'Θέμα Α',
        title: 'Θεωρία και μικρές εφαρμογές',
        prompt: `Α1. Να χαρακτηρίσετε ως Σωστό ή Λάθος τις παρακάτω προτάσεις:
α) Η στοίβα λειτουργεί με λογική FIFO.
β) Οι πίνακες έχουν σταθερό μέγεθος.
γ) Η εμβέλεια μίας μεταβλητής καθορίζει πού μπορεί να χρησιμοποιηθεί.
Α2. Να απαντήσετε σύντομα:
α) Ποια είναι η διαφορά πίνακα και λίστας;
β) Τι σημαίνει "ώθηση" σε στοίβα υλοποιημένη με πίνακα;
Α3. Να συμπληρώσετε μικρό τμήμα αλγορίθμου σε ΓΛΩΣΣΑ σχετικό με την ύλη ${chapterLine}.`,
        points: 25,
      },
      {
        id: 'Θέμα Β',
        title: 'Αναπαράσταση και κατανόηση αλγορίθμου',
        prompt: `Β1. Δίνεται διάγραμμα ροής που επεξεργάζεται δεδομένα από τα κεφάλαια ${chapterLine}. Να το μετατρέψετε σε ψευδογλώσσα.
Β2. Να συμπληρώσετε τα κενά σε τμήμα αλγορίθμου ώστε να λειτουργεί σωστά.
Β3. Να εξηγήσετε ποια δομή επιλογής ή επανάληψης είναι η καταλληλότερη και γιατί.
Β4. Να αναφέρετε ποιο τμήμα του αλγορίθμου είναι κρίσιμο για την ορθότητά του.`,
        points: 25,
      },
      {
        id: 'Θέμα Γ',
        title: 'Πλήρες πρόγραμμα σε ΓΛΩΣΣΑ',
        prompt: isHard
          ? `Σε σχολικούς αγώνες συμμετέχουν αθλητές. Να γραφεί πρόγραμμα σε ΓΛΩΣΣΑ το οποίο:
Γ1. Να διαβάζει στοιχεία αθλητών μέχρι να δοθεί ως όνομα η λέξη "ΤΕΛΟΣ".
Γ2. Να ελέγχει την εγκυρότητα των επιδόσεων.
Γ3. Να εμφανίζει το πλήθος των έγκυρων συμμετοχών και το ποσοστό επιτυχίας.
Γ4. Να βρίσκει τις δύο καλύτερες επιδόσεις και τα αντίστοιχα ονόματα.
Γ5. Να αιτιολογείτε τις επιλογές σας σε μετρητές, αθροιστές και ελέγχους.`
          : `Να γραφεί πρόγραμμα σε ΓΛΩΣΣΑ το οποίο:
Γ1. Να διαβάζει στοιχεία μαθητών μέχρι να δοθεί sentinel τιμή.
Γ2. Να υπολογίζει μέσο όρο επιδόσεων.
Γ3. Να εμφανίζει το πλήθος όσων ξεπερνούν ένα όριο.
Γ4. Να βρίσκει τη μέγιστη και τη δεύτερη μέγιστη τιμή με σωστή αιτιολόγηση.`,
        points: 25,
      },
      {
        id: 'Θέμα Δ',
        title: 'Σύνθετο προγραμματιστικό θέμα',
        prompt: isHard
          ? `Να αναπτύξετε πρόγραμμα σε ΓΛΩΣΣΑ που διαχειρίζεται βαθμολογίες μαθητών:
Δ1. Να χρησιμοποιεί πίνακα 1Δ για ονόματα και πίνακα 2Δ για βαθμούς μαθημάτων.
Δ2. Να ελέγχει την εγκυρότητα κάθε βαθμού.
Δ3. Να υλοποιεί συνάρτηση που υπολογίζει τελικό σταθμισμένο αποτέλεσμα.
Δ4. Να ταξινομεί τους μαθητές κατά φθίνουσα επίδοση.
Δ5. Να εμφανίζει τους τρεις κορυφαίους μαθητές με το τελικό τους αποτέλεσμα.
Δ6. Να σχολιάσετε γιατί η λύση σας θεωρείται δομημένη και τμηματική.`
          : `Να αναπτύξετε πρόγραμμα σε ΓΛΩΣΣΑ που:
Δ1. Διαβάζει στοιχεία Ν μαθητών.
Δ2. Υπολογίζει συνολική επίδοση με βάση δύο κριτήρια.
Δ3. Αποθηκεύει τα δεδομένα σε πίνακες.
Δ4. Εμφανίζει τον καλύτερο μαθητή και όσους ξεπέρασαν μία βάση.
Δ5. Αιτιολογεί τη χρήση υποπρογραμμάτων ή πινάκων όπου χρειάζεται.`,
        points: 25,
      },
    ];
  }

  function buildAothQuestions() {
    return [
      {
        id: 'Θέμα Α',
        title: 'Σωστό-λάθος και πολλαπλής επιλογής',
        prompt: `Α1. Να χαρακτηρίσετε ως Σωστό ή Λάθος πέντε προτάσεις από τα κεφάλαια ${chapterLine}.
Α2. Να απαντήσετε σε δύο ερωτήσεις πολλαπλής επιλογής πάνω σε ορισμούς, βασικές οικονομικές σχέσεις και έννοιες της ύλης.
Α3. Σε κάθε λανθασμένη πρόταση να δώσετε σύντομη αιτιολόγηση.`,
        points: 25,
      },
      {
        id: 'Θέμα Β',
        title: 'Αναπτυξιακή θεωρία',
        prompt: `Να αναπτύξετε οργανωμένα ένα θεωρητικό θέμα από τα κεφάλαια ${chapterLine}.
Η απάντησή σας πρέπει:
Β1. να περιλαμβάνει σαφή ορισμό,
Β2. να παρουσιάζει αναλυμένα τα βασικά σημεία,
Β3. να χρησιμοποιεί σχολική οικονομική ορολογία,
Β4. να καταλήγει σε σύντομο συμπέρασμα ή αξιολόγηση.
Έμφαση να δοθεί στις ενότητες: ${sectionLine || chapterLine}.`,
        points: 25,
      },
      {
        id: 'Θέμα Γ',
        title: 'Εφαρμογή με πίνακα και υπολογισμούς',
        prompt: `Δίνεται πίνακας παραγωγικών δυνατοτήτων ή πίνακας δεδομένων αγοράς σχετικός με την ύλη ${chapterLine}.
Γ1. Να υπολογίσετε το κόστος ευκαιρίας ή το ζητούμενο οικονομικό μέγεθος.
Γ2. Να ξεχωρίσετε εφικτούς και ανέφικτους συνδυασμούς.
Γ3. Να υπολογίσετε τη θυσία μονάδων ή τη μεταβολή που προκύπτει από τα δεδομένα.
Γ4. Να ερμηνεύσετε οικονομικά τα αποτελέσματα, και όχι μόνο αριθμητικά.`,
        points: 25,
      },
      {
        id: 'Θέμα Δ',
        title: 'Απαιτητικό αριθμητικό και εννοιολογικό θέμα',
        prompt: isHard
          ? `Δίνονται οι συναρτήσεις ζήτησης και προσφοράς:
Qd = 260 - 4P και Qs = 20 + 2P.
Δ1. Να υπολογίσετε την τιμή και την ποσότητα ισορροπίας.
Δ2. Αν το κράτος επιβάλει κατώτατη τιμή P=50, να υπολογίσετε ζητούμενη και προσφερόμενη ποσότητα.
Δ3. Να εξετάσετε αν δημιουργείται πλεόνασμα ή έλλειμμα και πόσων μονάδων.
Δ4. Να ερμηνεύσετε οικονομικά την παρέμβαση και να αιτιολογήσετε ποιοι επηρεάζονται περισσότερο.
Δ5. Να συνδέσετε το αποτέλεσμα με την ελαστικότητα ή με βασικές αρχές λειτουργίας της αγοράς, όπου είναι εφικτό.`
          : `Δίνονται οι συναρτήσεις ζήτησης και προσφοράς:
Qd = 120 - 2P και Qs = 30 + 3P.
Δ1. Να υπολογίσετε την τιμή και την ποσότητα ισορροπίας.
Δ2. Να εξετάσετε την επίδραση κρατικής παρέμβασης με κατώτατη ή ανώτατη τιμή.
Δ3. Να ερμηνεύσετε το αποτέλεσμα οικονομικά, χρησιμοποιώντας σωστή ορολογία.`,
        points: 25,
      },
    ];
  }

  const exam = {
    title: `Προσαρμοσμένο Διαγώνισμα Προετοιμασίας - ${SUBJECT_LABELS[subjectId] ?? subjectId}`,
    subject: SUBJECT_LABELS[subjectId] ?? subjectId,
    chapterIds: chapters.map((chapter) => chapter.id),
    difficulty,
    difficultyLabel: DIFFICULTY_LABELS[difficulty] ?? difficulty,
    estimatedTimeMinutes: subjectId === 'math' ? (isHard ? 180 : 165) : isHard ? 180 : 150,
    instructions: [
      `Το διαγώνισμα καλύπτει τα κεφάλαια: ${chapterLine}.`,
      buildDifficultyGuidance(difficulty),
      subjectId === 'math'
        ? 'Απάντησε με πλήρη μαθηματική αιτιολόγηση, σωστό συμβολισμό, αναφορά σε θεωρήματα όπου χρειάζεται και καθαρή διάταξη λύσης.'
        : subjectId === 'aepp'
          ? 'Απάντησε με σωστή αλγοριθμική λογική, οργανωμένα βήματα και καθαρή σύνταξη σε ΓΛΩΣΣΑ όπου ζητείται.'
          : 'Απάντησε με πλήρη ανάπτυξη, σωστή οικονομική ορολογία και σαφή ερμηνεία όλων των αριθμητικών αποτελεσμάτων.',
    ],
    questions:
      subjectId === 'math' ? buildMathQuestions() : subjectId === 'aepp' ? buildAeppQuestions() : buildAothQuestions(),
    generationMode: 'fallback',
    model: 'fallback',
  };

  return normalizeExamTypography(exam, subjectId);
}

async function generateCustomTest({ subjectId, chapters, difficulty }) {
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    return buildFallbackCustomTest({ subjectId, chapters, difficulty });
  }

  try {
    const response = await fetch(OPENAI_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: DEFAULT_MODEL,
        input: [
          {
            role: 'user',
            content: [
              {
                type: 'input_text',
                text: [
                  'Create a Greek high-school custom exam in Greek.',
                  'Return JSON only.',
                  `Subject: ${SUBJECT_LABELS[subjectId] ?? subjectId}`,
                  `Difficulty: ${DIFFICULTY_LABELS[difficulty] ?? difficulty}`,
                  `Chapters: ${chapters
                    .map((chapter) => `${chapter.number}. ${chapter.title} [${(chapter.sections ?? []).slice(0, 5).join(', ')}]`)
                    .join(', ')}`,
                  'Generate a complete ready-to-use custom exam based only on the selected chapters.',
                  'The exam must feel like an authentic Panhellenic-style written paper for Greek students.',
                  'Total score must be 100.',
                  'Do not write generic study advice.',
                  'Write concrete exam tasks with actual data, formulas, variable values, scenarios, or programming requirements.',
                  'The result must be a real exam sheet, not a plan.',
                  'Make the wording feel like an authentic written exam, not like study notes.',
                  'For hard difficulty, raise the level significantly and include at least one clearly demanding exercise.',
                  subjectId === 'math'
                    ? [
                        'For Mathematics, the structure must be exactly Θέμα Α, Θέμα Β, Θέμα Γ, Θέμα Δ.',
                        'Θέμα Α: theory, theorem/proposition proof, definitions, and σωστό-λάθος.',
                        'Θέμα Β: guided exercise around one function or one central idea.',
                        'Θέμα Γ: combined chapters, continuity/derivative/graph/application style.',
                        'Θέμα Δ: the most demanding and most Panhellenic-style original problem.',
                        'Use textbook-like mathematical notation: x² not x^2, x₀ not x0, f′(x), ℝ, clean integral/limit notation.',
                        'Require proper justification and theorem-based reasoning, not only calculations.',
                      ].join('\n')
                    : subjectId === 'aepp'
                      ? [
                          'For AEPP, the structure must be exactly Θέμα Α, Θέμα Β, Θέμα Γ, Θέμα Δ.',
                          'Θέμα Α: theory, σωστό-λάθος, small applications, tiny ΓΛΩΣΣΑ snippets where useful.',
                          'Θέμα Β: algorithm representation, flowchart to pseudocode, understanding the logic of code.',
                          'Θέμα Γ: full program in ΓΛΩΣΣΑ with realistic but controlled scenario.',
                          'Θέμα Δ: heavier programming problem with arrays, validation, functions/procedures, sorting or advanced processing.',
                          'Do not produce generic advice; produce concrete exam prompts only.',
                        ].join('\n')
                      : [
                          'For AOTH, the structure must be exactly Θέμα Α, Θέμα Β, Θέμα Γ, Θέμα Δ.',
                          'Θέμα Α: σωστό-λάθος and multiple choice on definitions and basic relations.',
                          'Θέμα Β: organized developmental theory answer in school style.',
                          'Θέμα Γ: application with table/data and calculations plus economic interpretation.',
                          'Θέμα Δ: the most demanding numeric and conceptual market-style exercise with equilibrium/intervention logic.',
                          'Do not write generic economic commentary; write concrete exam tasks with values and interpretation demands.',
                        ].join('\n'),
                ].join('\n'),
              },
            ],
          },
        ],
        text: {
          format: {
            type: 'json_schema',
            name: 'custom_exam',
            strict: true,
            schema: {
              type: 'object',
              additionalProperties: false,
              properties: {
                title: { type: 'string' },
                instructions: { type: 'array', items: { type: 'string' } },
                estimatedTimeMinutes: { type: 'number' },
                questions: {
                  type: 'array',
                  items: {
                    type: 'object',
                    additionalProperties: false,
                    properties: {
                      id: { type: 'string' },
                      title: { type: 'string' },
                      prompt: { type: 'string' },
                      points: { type: 'number' },
                    },
                    required: ['id', 'title', 'prompt', 'points'],
                  },
                },
              },
              required: ['title', 'instructions', 'estimatedTimeMinutes', 'questions'],
            },
          },
        },
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`OpenAI custom generator failed (${response.status}): ${errorText}`);
    }

    const payload = await response.json();
    const outputText =
      payload.output_text ||
      (payload.output ?? [])
        .flatMap((item) => item.content ?? [])
        .filter((item) => item.type === 'output_text' && typeof item.text === 'string')
        .map((item) => item.text)
        .join('\n')
        .trim();

    if (!outputText) {
      throw new Error('OpenAI custom generator returned empty output.');
    }

    const parsed = JSON.parse(outputText);
    return normalizeExamTypography(
      {
        title: parsed.title,
        subject: SUBJECT_LABELS[subjectId] ?? subjectId,
        chapterIds: chapters.map((chapter) => chapter.id),
        difficulty,
        difficultyLabel: DIFFICULTY_LABELS[difficulty] ?? difficulty,
        estimatedTimeMinutes: Number(parsed.estimatedTimeMinutes ?? 75),
        instructions: Array.isArray(parsed.instructions) ? parsed.instructions : [],
        questions: Array.isArray(parsed.questions) ? parsed.questions : [],
        generationMode: 'openai',
        model: DEFAULT_MODEL,
      },
      subjectId,
    );
  } catch (error) {
    if (process.env.OPENAI_API_KEY) {
      console.error('OpenAI custom test generation failed, using fallback:', error);
    }

    return buildFallbackCustomTest({ subjectId, chapters, difficulty });
  }
}

module.exports = {
  generateChapterTest,
  generateCustomTest,
};
