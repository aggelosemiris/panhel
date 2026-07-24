const OPENAI_API_URL = 'https://api.openai.com/v1/responses';
const DEFAULT_MODEL = process.env.OPENAI_CHAPTER_TEST_MODEL || 'gpt-5';

const SUBJECT_LABELS = {
  aoth: 'Αρχές Οικονομικής Θεωρίας (ΑΟΘ)',
  aepp: 'Ανάπτυξη Εφαρμογών σε Προγραμματιστικό Περιβάλλον (ΑΕΠΠ)',
  math: 'Μαθηματικά Προσανατολισμού',
};

const SHORT_SUBJECT_LABELS = {
  aoth: 'ΑΟΘ',
  aepp: 'ΑΕΠΠ',
  math: 'Μαθηματικά',
};

const DIFFICULTY_LABELS = {
  easy: '1ο διαγώνισμα',
  normal: '2ο διαγώνισμα',
  hard: '3ο διαγώνισμα',
};

function cleanText(value) {
  return String(value ?? '').replace(/\r\n/g, '\n').replace(/\r/g, '\n').trim();
}

function normalizeMathNotation(text) {
  return cleanText(text)
    .replace(/\^2/g, '²')
    .replace(/\^3/g, '³')
    .replace(/\^4/g, '⁴')
    .replace(/\^5/g, '⁵')
    .replace(/\bR\b/g, 'ℝ')
    .replace(/\bx0\b/g, 'x₀')
    .replace(/\bx1\b/g, 'x₁')
    .replace(/\bx2\b/g, 'x₂')
    .replace(/\ba0\b/g, 'α₀')
    .replace(/\bf'\(x\)/g, 'f′(x)')
    .replace(/\bg'\(x\)/g, 'g′(x)')
    .replace(/\bh'\(x\)/g, 'h′(x)')
    .replace(/lim\s*x\s*->\s*/g, 'lim x→')
    .replace(/->/g, '→')
    .replace(/<=/g, '≤')
    .replace(/>=/g, '≥')
    .replace(/\bCf\b/g, 'C_f');
}

function normalizeExam(exam, subjectId) {
  const normalize = (value) => (subjectId === 'math' ? normalizeMathNotation(value) : cleanText(value));

  return {
    ...exam,
    title: normalize(exam.title),
    subject: SUBJECT_LABELS[subjectId] ?? exam.subject ?? subjectId,
    difficultyLabel: DIFFICULTY_LABELS[exam.difficulty] ?? exam.difficultyLabel ?? exam.difficulty,
    instructions: (exam.instructions ?? []).map(normalize).filter(Boolean),
    questions: (exam.questions ?? []).map((question, index) => ({
      id: cleanText(question.id || `ΘΕΜΑ ${['Α', 'Β', 'Γ', 'Δ'][index] ?? index + 1}`),
      title: normalize(question.title),
      prompt: normalize(question.prompt),
      points: Number(question.points || 25),
    })),
  };
}

function chapterLine(chapters) {
  return chapters.map((chapter) => `Κεφάλαιο ${chapter.number}: ${chapter.title}`).join(' | ');
}

function sectionLine(chapters) {
  return chapters
    .flatMap((chapter) => (chapter.sections ?? []).slice(0, 5).map((section) => cleanText(section.title ?? section)))
    .filter(Boolean)
    .slice(0, 10)
    .join(', ');
}

function buildDifficultyGuidance(difficulty) {
  if (difficulty === 'easy') {
    return 'Το διαγώνισμα έχει βασική κλιμάκωση, καθαρή διατύπωση και ελέγχει πρώτα τη σίγουρη μεθοδολογία.';
  }

  if (difficulty === 'hard') {
    return 'Το διαγώνισμα έχει αυξημένη δυσκολία, συνδυαστικά ερωτήματα και απαιτεί πλήρη αιτιολόγηση.';
  }

  return 'Το διαγώνισμα έχει κανονική εξεταστική δυσκολία και σταδιακή κλιμάκωση από θεωρία σε σύνθετη εφαρμογή.';
}

function buildInstructions({ subjectId, chapters, difficulty }) {
  const subjectInstruction =
    subjectId === 'math'
      ? 'Να χρησιμοποιήσετε σχολικό συμβολισμό, πλήρη μαθηματική αιτιολόγηση και καθαρή διάταξη λύσης.'
      : subjectId === 'aepp'
        ? 'Να γράψετε τους αλγορίθμους με σχολική λογική ΓΛΩΣΣΑΣ, σαφή μεταβλητές και δομημένα βήματα.'
        : 'Να χρησιμοποιήσετε ορολογία σχολικού βιβλίου και να ερμηνεύσετε οικονομικά κάθε αριθμητικό αποτέλεσμα.';

  return [
    `Το διαγώνισμα βασίζεται αποκλειστικά στην ύλη: ${chapterLine(chapters)}.`,
    buildDifficultyGuidance(difficulty),
    subjectInstruction,
    'Όλα τα θέματα βαθμολογούνται με 25 μονάδες. Το σύνολο είναι 100 μονάδες.',
  ];
}

function buildMathQuestions(chapters, difficulty) {
  const refs = chapterLine(chapters);
  const advanced = difficulty === 'hard';

  return [
    {
      id: 'ΘΕΜΑ Α',
      title: 'Θεωρία - Ορισμοί - Σωστό/Λάθος',
      points: 25,
      prompt: `Α1. Να διατυπώσετε έναν βασικό ορισμό ή θεώρημα από την ύλη: ${refs}.

Α2. Να εξηγήσετε με σχολικό συμβολισμό τι σημαίνει όριο συνάρτησης στο x₀ και πότε μια συνάρτηση είναι συνεχής στο x₀.

Α3. Να χαρακτηρίσετε τις παρακάτω προτάσεις ως Σωστές ή Λανθασμένες, αιτιολογώντας σύντομα τις λανθασμένες:
α) Αν μια συνάρτηση είναι παραγωγίσιμη στο x₀, τότε είναι συνεχής στο x₀.
β) Αν f′(x)>0 σε διάστημα Δ, τότε η f είναι γνησίως αύξουσα στο Δ.
γ) Κάθε συνεχής συνάρτηση σε κλειστό διάστημα παίρνει μέγιστη και ελάχιστη τιμή.`,
    },
    {
      id: 'ΘΕΜΑ Β',
      title: 'Καθοδηγούμενη άσκηση με συνάρτηση',
      points: 25,
      prompt: `Δίνεται η συνάρτηση f(x)=x³-3x²+2x+1.

Β1. Να βρείτε το πεδίο ορισμού της f.
Β2. Να υπολογίσετε την f′(x).
Β3. Να μελετήσετε τη μονοτονία της f και να βρείτε τα τοπικά ακρότατα.
Β4. Να εξετάσετε αν η εξίσωση f(x)=1 έχει περισσότερες από μία πραγματικές ρίζες.`,
    },
    {
      id: 'ΘΕΜΑ Γ',
      title: 'Συνδυαστική μελέτη',
      points: 25,
      prompt: `Δίνεται συνάρτηση f συνεχής στο ℝ με f′(x)=3x²-12x+9.

Γ1. Να βρείτε τα διαστήματα μονοτονίας της f.
Γ2. Να προσδιορίσετε τις θέσεις τοπικών ακροτάτων.
Γ3. Αν f(1)=2, να γράψετε τον τύπο της f.
Γ4. Να μελετήσετε τη θέση της C_f ως προς την ευθεία y=2, όπου αυτό είναι εφικτό.`,
    },
    {
      id: 'ΘΕΜΑ Δ',
      title: advanced ? 'Απαιτητικό πρόβλημα Πανελληνίων' : 'Πρόβλημα εμβάθυνσης',
      points: 25,
      prompt: advanced
        ? `Δίνεται η συνάρτηση f(x)=x²·lnx, x>0.

Δ1. Να υπολογίσετε την f′(x) και την f″(x).
Δ2. Να μελετήσετε τη μονοτονία και τα ακρότατα της f.
Δ3. Να εξετάσετε την κυρτότητα και τα σημεία καμπής.
Δ4. Να αποδείξετε ότι η εξίσωση f(x)=1 έχει ακριβώς μία ρίζα στο διάστημα (1, e).
Δ5. Να τεκμηριώσετε κάθε συμπέρασμα με αναφορά στα κατάλληλα θεωρήματα.`
        : `Δίνεται η συνάρτηση f(x)=x²-2x+ln(x), x>0.

Δ1. Να βρείτε την f′(x).
Δ2. Να μελετήσετε τη μονοτονία της f.
Δ3. Να αποδείξετε ότι η εξίσωση f(x)=0 έχει μοναδική ρίζα σε κατάλληλο διάστημα.
Δ4. Να εξηγήσετε γιατί η συνέχεια και η μονοτονία είναι κρίσιμες στη λύση.`,
    },
  ];
}

function buildAothQuestions(chapters, difficulty) {
  const refs = chapterLine(chapters);
  const advanced = difficulty === 'hard';

  return [
    {
      id: 'ΘΕΜΑ Α',
      title: 'Σωστό/Λάθος και πολλαπλής επιλογής',
      points: 25,
      prompt: `Α1. Να χαρακτηρίσετε πέντε προτάσεις ως Σωστές ή Λανθασμένες από την ύλη: ${refs}.

Α2. Να απαντήσετε σε ερωτήσεις πολλαπλής επιλογής που αφορούν βασικούς ορισμούς, διαγράμματα και οικονομικές σχέσεις.

Α3. Για κάθε λανθασμένη πρόταση να δώσετε σύντομη αιτιολόγηση με ορολογία σχολικού βιβλίου.`,
    },
    {
      id: 'ΘΕΜΑ Β',
      title: 'Αναπτυξιακή θεωρία',
      points: 25,
      prompt: `Να αναπτύξετε οργανωμένα ένα θεωρητικό θέμα από την επιλεγμένη ύλη.

Η απάντησή σας πρέπει:
Β1. να περιλαμβάνει σαφή ορισμό,
Β2. να παρουσιάζει τα βασικά σημεία με σχολική οικονομική ορολογία,
Β3. να εξηγεί τη σχέση αιτίας-αποτελέσματος,
Β4. να καταλήγει σε σύντομο οικονομικό συμπέρασμα.`,
    },
    {
      id: 'ΘΕΜΑ Γ',
      title: 'Πίνακας δεδομένων και υπολογισμοί',
      points: 25,
      prompt: `Δίνεται πίνακας δεδομένων αγοράς ή παραγωγής σχετικός με την ύλη ${refs}.

Γ1. Να υπολογίσετε το ζητούμενο οικονομικό μέγεθος.
Γ2. Να συμπληρώσετε τα κενά του πίνακα με σωστή μεθοδολογία.
Γ3. Να ερμηνεύσετε οικονομικά τα αποτελέσματα.
Γ4. Να αιτιολογήσετε αν η μεταβολή οφείλεται σε μετακίνηση πάνω στην καμπύλη ή σε μετατόπιση της καμπύλης, όπου εφαρμόζεται.`,
    },
    {
      id: 'ΘΕΜΑ Δ',
      title: advanced ? 'Σύνθετη άσκηση αγοράς' : 'Αριθμητική άσκηση εφαρμογής',
      points: 25,
      prompt: advanced
        ? `Δίνονται οι συναρτήσεις ζήτησης και προσφοράς:
Qd = 260 - 4P και Qs = 20 + 2P.

Δ1. Να υπολογίσετε την τιμή και την ποσότητα ισορροπίας.
Δ2. Αν επιβληθεί κατώτατη τιμή P=50, να υπολογίσετε ζητούμενη και προσφερόμενη ποσότητα.
Δ3. Να εξετάσετε αν δημιουργείται πλεόνασμα ή έλλειμμα και πόσων μονάδων.
Δ4. Να εξηγήσετε οικονομικά τις συνέπειες της κρατικής παρέμβασης.
Δ5. Να συνδέσετε το αποτέλεσμα με την ελαστικότητα ή με βασικές αρχές λειτουργίας της αγοράς, όπου είναι εφικτό.`
        : `Δίνονται οι συναρτήσεις Qd = 120 - 2P και Qs = 30 + 3P.

Δ1. Να βρείτε την τιμή και την ποσότητα ισορροπίας.
Δ2. Να υπολογίσετε Qd και Qs για P=25.
Δ3. Να προσδιορίσετε αν υπάρχει πλεόνασμα ή έλλειμμα.
Δ4. Να ερμηνεύσετε το αποτέλεσμα με σωστή οικονομική ορολογία.`,
    },
  ];
}

function buildAeppQuestions(chapters, difficulty) {
  const refs = chapterLine(chapters);
  const advanced = difficulty === 'hard';

  return [
    {
      id: 'ΘΕΜΑ Α',
      title: 'Θεωρία και βασικές έννοιες',
      points: 25,
      prompt: `Α1. Να απαντήσετε σε ερωτήσεις θεωρίας από την ύλη: ${refs}.

Α2. Να χαρακτηρίσετε προτάσεις ως Σωστές ή Λανθασμένες και να αιτιολογήσετε σύντομα.

Α3. Να συμπληρώσετε μικρά τμήματα αλγορίθμου ή εντολές ΓΛΩΣΣΑΣ όπου λείπουν βασικά στοιχεία.`,
    },
    {
      id: 'ΘΕΜΑ Β',
      title: 'Κατανόηση αλγορίθμου',
      points: 25,
      prompt: `Δίνεται τμήμα αλγορίθμου σε ΓΛΩΣΣΑ.

Β1. Να δημιουργήσετε πίνακα τιμών για συγκεκριμένες εισόδους.
Β2. Να εντοπίσετε ποια δομή ελέγχου ή επανάληψης χρησιμοποιείται.
Β3. Να εξηγήσετε τι εμφανίζει ο αλγόριθμος.
Β4. Να προτείνετε μία βελτίωση ή διόρθωση αν υπάρχει λογικό σφάλμα.`,
    },
    {
      id: 'ΘΕΜΑ Γ',
      title: 'Ανάπτυξη προγράμματος σε ΓΛΩΣΣΑ',
      points: 25,
      prompt: `Να αναπτύξετε πρόγραμμα σε ΓΛΩΣΣΑ που διαβάζει στοιχεία μαθητών και βαθμούς.

Γ1. Να δηλώσετε κατάλληλες μεταβλητές και πίνακες.
Γ2. Να ελέγχετε την εγκυρότητα των βαθμών.
Γ3. Να υπολογίζετε μέσο όρο ανά μαθητή.
Γ4. Να εμφανίζετε τον μαθητή με τη μεγαλύτερη επίδοση.
Γ5. Να χρησιμοποιήσετε καθαρή δομή και σχολική σύνταξη.`,
    },
    {
      id: 'ΘΕΜΑ Δ',
      title: advanced ? 'Σύνθετο πρόγραμμα με πίνακες και υποπρογράμματα' : 'Συνδυαστική άσκηση προγραμματισμού',
      points: 25,
      prompt: advanced
        ? `Να αναπτύξετε πρόγραμμα σε ΓΛΩΣΣΑ που επεξεργάζεται αποτελέσματα διαγωνίσματος.

Δ1. Να διαβάζει ονόματα και βαθμούς Ν μαθητών σε πίνακες.
Δ2. Να απορρίπτει μη έγκυρες τιμές.
Δ3. Να χρησιμοποιεί συνάρτηση για τον υπολογισμό μέσου όρου.
Δ4. Να ταξινομεί τους μαθητές κατά φθίνουσα επίδοση.
Δ5. Να εμφανίζει τους τρεις πρώτους.
Δ6. Να αιτιολογήσετε γιατί η λύση σας είναι δομημένη και τμηματική.`
        : `Να αναπτύξετε πρόγραμμα σε ΓΛΩΣΣΑ που:

Δ1. διαβάζει στοιχεία Ν μαθητών,
Δ2. υπολογίζει συνολική επίδοση,
Δ3. αποθηκεύει τα δεδομένα σε πίνακες,
Δ4. εμφανίζει όσους ξεπέρασαν μια βάση,
Δ5. αιτιολογεί τη χρήση πίνακα ή επανάληψης όπου χρειάζεται.`,
    },
  ];
}

function buildFallbackCustomTest({ subjectId, chapters, difficulty }) {
  const normalizedChapters = Array.isArray(chapters) && chapters.length ? chapters : [{ id: 'general', number: '-', title: 'Επιλεγμένη ύλη', sections: [] }];
  const questions =
    subjectId === 'math'
      ? buildMathQuestions(normalizedChapters, difficulty)
      : subjectId === 'aepp'
        ? buildAeppQuestions(normalizedChapters, difficulty)
        : buildAothQuestions(normalizedChapters, difficulty);

  return normalizeExam(
    {
      title: `Προσαρμοσμένο Διαγώνισμα Προετοιμασίας - ${SHORT_SUBJECT_LABELS[subjectId] ?? subjectId}`,
      subject: SUBJECT_LABELS[subjectId] ?? subjectId,
      chapterIds: normalizedChapters.map((chapter) => chapter.id),
      difficulty,
      difficultyLabel: DIFFICULTY_LABELS[difficulty] ?? difficulty,
      estimatedTimeMinutes: difficulty === 'hard' ? 180 : difficulty === 'easy' ? 120 : 150,
      instructions: buildInstructions({ subjectId, chapters: normalizedChapters, difficulty }),
      questions,
      generationMode: 'fallback',
      model: 'official-template',
    },
    subjectId,
  );
}

function buildFallbackGeneratedExam({ subjectId, chapterId, chapterTitle, sections, difficulty }) {
  return buildFallbackCustomTest({
    subjectId,
    chapters: [{ id: chapterId, number: chapterId, title: chapterTitle, sections }],
    difficulty,
  });
}

function buildOpenAiPrompt({ subjectId, chapters, difficulty }) {
  const subject = SUBJECT_LABELS[subjectId] ?? subjectId;
  const chaptersText = chapters
    .map((chapter) => `Κεφάλαιο ${chapter.number}: ${chapter.title}. Ενότητες: ${(chapter.sections ?? []).slice(0, 8).join(', ')}`)
    .join('\n');
  const sections = sectionLine(chapters);

  return [
    'Δημιούργησε ένα πλήρες ελληνικό διαγώνισμα Γ΄ Λυκείου για προετοιμασία Πανελληνίων.',
    'Απάντησε ΜΟΝΟ με JSON σύμφωνα με το schema.',
    `Μάθημα: ${subject}`,
    `Δυσκολία: ${DIFFICULTY_LABELS[difficulty] ?? difficulty}`,
    `Ύλη:\n${chaptersText}`,
    sections ? `Εστίαση ενοτήτων: ${sections}` : '',
    'Η δομή πρέπει να είναι ακριβώς 4 θέματα: ΘΕΜΑ Α, ΘΕΜΑ Β, ΘΕΜΑ Γ, ΘΕΜΑ Δ.',
    'Κάθε θέμα έχει 25 μονάδες. Σύνολο 100 μονάδες.',
    'Να γράψεις συγκεκριμένες εκφωνήσεις με αριθμητικά δεδομένα, τύπους, μεταβλητές ή σενάρια. Όχι γενικές οδηγίες μελέτης.',
    'Η γλώσσα πρέπει να θυμίζει επίσημο σχολικό διαγώνισμα του Υπουργείου Παιδείας.',
    subjectId === 'math'
      ? 'Για Μαθηματικά χρησιμοποίησε καθαρό σχολικό συμβολισμό: x², x₀, f′(x), ℝ, lim x→x₀, ∫ όπου χρειάζεται. Απόφυγε ακατέργαστο LaTeX.'
      : '',
    subjectId === 'aoth'
      ? 'Για ΑΟΘ χρησιμοποίησε σχολική οικονομική ορολογία: ζητούμενη ποσότητα, προσφερόμενη ποσότητα, τιμή ισορροπίας, πλεόνασμα, έλλειμμα, ελαστικότητα.'
      : '',
    subjectId === 'aepp'
      ? 'Για ΑΕΠΠ χρησιμοποίησε σχολική ΓΛΩΣΣΑ και όρους όπως ΑΛΓΟΡΙΘΜΟΣ, ΔΕΔΟΜΕΝΑ, ΜΕΤΑΒΛΗΤΕΣ, ΑΡΧΗ, ΤΕΛΟΣ, πίνακες, υποπρογράμματα.'
      : '',
  ]
    .filter(Boolean)
    .join('\n');
}

async function callOpenAiCustomGenerator({ subjectId, chapters, difficulty }) {
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    return buildFallbackCustomTest({ subjectId, chapters, difficulty });
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
          content: [{ type: 'input_text', text: buildOpenAiPrompt({ subjectId, chapters, difficulty }) }],
        },
      ],
      text: {
        format: {
          type: 'json_schema',
          name: 'official_custom_exam',
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
                minItems: 4,
                maxItems: 4,
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
  const normalizedChapters = Array.isArray(chapters) && chapters.length ? chapters : [];

  return normalizeExam(
    {
      title: parsed.title,
      subject: SUBJECT_LABELS[subjectId] ?? subjectId,
      chapterIds: normalizedChapters.map((chapter) => chapter.id),
      difficulty,
      difficultyLabel: DIFFICULTY_LABELS[difficulty] ?? difficulty,
      estimatedTimeMinutes: Number(parsed.estimatedTimeMinutes || (difficulty === 'hard' ? 180 : 150)),
      instructions: Array.isArray(parsed.instructions) ? parsed.instructions : buildInstructions({ subjectId, chapters: normalizedChapters, difficulty }),
      questions: Array.isArray(parsed.questions) ? parsed.questions : [],
      generationMode: 'openai',
      model: DEFAULT_MODEL,
    },
    subjectId,
  );
}

async function generateCustomTest(args) {
  try {
    return await callOpenAiCustomGenerator(args);
  } catch (error) {
    if (process.env.OPENAI_API_KEY) {
      console.error('OpenAI custom test generation failed, using official fallback template:', error);
    }

    return buildFallbackCustomTest(args);
  }
}

async function generateChapterTest(args) {
  try {
    return await callOpenAiCustomGenerator({
      subjectId: args.subjectId,
      chapters: [{ id: args.chapterId, number: args.chapterId, title: args.chapterTitle, sections: args.sections ?? [] }],
      difficulty: args.difficulty,
    });
  } catch (error) {
    if (process.env.OPENAI_API_KEY) {
      console.error('OpenAI chapter test generation failed, using official fallback template:', error);
    }

    return buildFallbackGeneratedExam(args);
  }
}

module.exports = {
  generateChapterTest,
  generateCustomTest,
};
