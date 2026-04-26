const fs = require('fs/promises');
const path = require('path');
const { randomUUID } = require('crypto');

const DATA_DIRECTORY = path.join(__dirname, '..', 'data');
const EXPLANATION_FILE = path.join(DATA_DIRECTORY, 'explanation-lessons.json');
const DEFAULT_MODEL = process.env.OPENAI_EXPLANATION_MODEL || 'gpt-5';
const OPENAI_API_URL = 'https://api.openai.com/v1/responses';

const DEFAULT_STORE = {
  explanationRequests: [],
  explanationLessons: [],
};

let pendingWrite = Promise.resolve();

function normalizeUserId(userId) {
  const value = String(userId ?? 'guest-user').trim();
  return value || 'guest-user';
}

function normalizeSubject(subject) {
  const value = String(subject ?? '').trim().toLowerCase();
  return value || '';
}

function normalizeText(value) {
  return String(value ?? '').trim();
}

function inferDifficultyFromProfile(profile, subject, chapterId) {
  const chapterStat = (profile?.byChapter ?? []).find((item) => item.subject === subject && item.chapterId === chapterId);

  if (chapterStat) {
    if (chapterStat.accuracyPercent < 45) {
      return 'needs-foundation';
    }
    if (chapterStat.accuracyPercent < 70) {
      return 'intermediate';
    }
    return 'advanced';
  }

  const subjectStat = (profile?.bySubject ?? []).find((item) => item.subject === subject);
  if (subjectStat) {
    if (subjectStat.accuracyPercent < 45) {
      return 'needs-foundation';
    }
    if (subjectStat.accuracyPercent < 70) {
      return 'intermediate';
    }
  }

  return 'unknown';
}

function mapDurationLabel(targetDuration) {
  const mapping = {
    '1-2': '1-2 λεπτά',
    '3-5': '3-5 λεπτά',
    '5-8': '5-8 λεπτά',
  };

  return mapping[targetDuration] ?? targetDuration;
}

async function ensureStore() {
  await fs.mkdir(DATA_DIRECTORY, { recursive: true });

  try {
    await fs.access(EXPLANATION_FILE);
  } catch {
    await fs.writeFile(EXPLANATION_FILE, JSON.stringify(DEFAULT_STORE, null, 2), 'utf8');
  }
}

async function readStore() {
  await ensureStore();

  try {
    const raw = await fs.readFile(EXPLANATION_FILE, 'utf8');
    const parsed = JSON.parse(raw);

    return {
      explanationRequests: Array.isArray(parsed.explanationRequests) ? parsed.explanationRequests : [],
      explanationLessons: Array.isArray(parsed.explanationLessons) ? parsed.explanationLessons : [],
    };
  } catch {
    return { ...DEFAULT_STORE };
  }
}

async function writeStore(store) {
  await ensureStore();

  pendingWrite = pendingWrite.then(async () => {
    const tempFile = `${EXPLANATION_FILE}.tmp`;
    await fs.writeFile(tempFile, JSON.stringify(store, null, 2), 'utf8');
    await fs.rename(tempFile, EXPLANATION_FILE);
  });

  return pendingWrite;
}

function buildProfileContext(profile, subject, chapterId) {
  const weakestChapters = (profile?.byChapter ?? []).slice(0, 5);
  const weakSubject = (profile?.bySubject ?? []).slice().sort((a, b) => a.accuracyPercent - b.accuracyPercent)[0];
  const singleTopicSnapshot = (profile?.singleTopicBySubject ?? [])
    .map((item) => `${item.subject}: ${item.topics.map((topic) => `${topic.topicType} ${topic.averagePercent}%`).join(', ')}`)
    .join(' | ');

  return {
    overallAccuracyPercent: profile?.overallAccuracyPercent ?? 0,
    weakestChapter: profile?.weakestChapter ?? null,
    strongestChapter: profile?.strongestChapter ?? null,
    weakSubject: weakSubject ?? null,
    weakestChapters,
    trueFalseBySubject: profile?.trueFalseBySubject ?? [],
    examDifficultyBySubject: profile?.examDifficultyBySubject ?? [],
    singleTopicSnapshot,
    inferredLevel: inferDifficultyFromProfile(profile, subject, chapterId),
  };
}

function buildFallbackBlocks({ userQuestion, subject, chapter, explanationStyle, selectedText, targetDuration, profileContext }) {
  const styleLine =
    explanationStyle === 'simple'
      ? 'Θα το κρατήσω απλό και καθαρό, σαν πρώτη φροντιστηριακή εξήγηση.'
      : explanationStyle === 'detailed'
        ? 'Θα το ανοίξω πιο αναλυτικά, με λίγο περισσότερο θεωρητικό βάθος.'
        : explanationStyle === 'step-by-step'
          ? 'Θα το πάω βήμα βήμα, ώστε να φαίνεται καθαρά η σειρά σκέψης.'
          : 'Θα στο δώσω σύντομα και στοχευμένα, χωρίς περιττή φλυαρία.';

  const weaknessLine = profileContext.weakestChapter
    ? `Αυτό συνδέεται και με το ότι δυσκολεύεσαι περισσότερο στο ${profileContext.weakestChapter.chapterId}.`
    : 'Δεν υπάρχουν ακόμη αρκετά ιστορικά δεδομένα για πολύ στοχευμένη προσαρμογή.';

  const selectedTextLine = selectedText
    ? `Θα βασιστώ και στο κομμάτι που ξεχώρισες: "${selectedText.slice(0, 220)}${selectedText.length > 220 ? '...' : ''}".`
    : 'Δεν έχεις δώσει επιλεγμένο κείμενο, οπότε η εξήγηση βασίζεται στην ίδια την απορία σου.';

  const chapterLine = chapter ? `${chapter.number}. ${chapter.title}` : 'το σχετικό κεφάλαιο';
  const subjectLine = subject?.greekName ?? subject?.id ?? 'το μάθημα';

  return [
    {
      id: 'intro',
      heading: 'Τι ακριβώς θα καταλάβουμε',
      blockType: 'intro',
      summary: 'Ορίζουμε τον στόχο της εξήγησης.',
      content: `Η απορία σου είναι: "${userQuestion}". Στόχος μας είναι να καταλάβεις καθαρά το σημείο αυτό στο ${subjectLine}, μέσα από ${chapterLine}. ${styleLine}`,
      durationEstimateSeconds: targetDuration === '1-2' ? 25 : 40,
      onScreenKeywords: ['στόχος', 'έννοια', 'πλαίσιο'],
      bulletPoints: ['Τι ζητά η απορία', 'Σε ποιο κεφάλαιο ανήκει', 'Πώς θα προσεγγιστεί'],
    },
    {
      id: 'concept',
      heading: 'Η βασική έννοια',
      blockType: 'concept',
      summary: 'Εξηγούμε τον πυρήνα της θεωρίας.',
      content: `Πριν πας σε εφαρμογές, πρέπει να ξεχωρίσεις ποια είναι η βασική έννοια, ποια είναι η λέξη-κλειδί και ποια είναι η πρακτική της χρήση στις Πανελλήνιες. ${selectedTextLine}`,
      durationEstimateSeconds: targetDuration === '5-8' ? 80 : 55,
      onScreenKeywords: ['βασική έννοια', 'λέξεις-κλειδιά', 'εφαρμογή'],
      bulletPoints: ['Ορισμός', 'Ρόλος στην άσκηση ή θεωρία', 'Πώς αναγνωρίζεται σε διαγώνισμα'],
    },
    {
      id: 'steps',
      heading: 'Βήμα προς βήμα σκέψη',
      blockType: 'steps',
      summary: 'Η μεθοδολογία που πρέπει να ακολουθεί ο μαθητής.',
      content: `Όταν δεις σχετική ερώτηση, η σωστή πορεία είναι: 1) αναγνωρίζεις τι ζητά, 2) συνδέεις το ζητούμενο με τη σωστή έννοια, 3) γράφεις την απάντηση ή λύνεις την άσκηση με πειθαρχία, χωρίς να πηδάς βήματα.`,
      durationEstimateSeconds: targetDuration === '1-2' ? 35 : 65,
      onScreenKeywords: ['αναγνώριση', 'σύνδεση', 'εκτέλεση'],
      bulletPoints: ['Διάβασε σωστά το ζητούμενο', 'Δέσε το με την κατάλληλη θεωρία', 'Μην παραλείπεις ενδιάμεσα βήματα'],
    },
    {
      id: 'example',
      heading: 'Δουλεμένο παράδειγμα',
      blockType: 'example',
      summary: 'Ένα μικρό worked example για να γίνει πρακτικό.',
      content: `Ένα σωστό worked example εδώ πρέπει να δείχνει όχι μόνο το τελικό αποτέλεσμα αλλά και το γιατί διαλέγεις αυτή τη μέθοδο. Στις Πανελλήνιες η βαθμολόγηση ακολουθεί τη λογική "σωστή πορεία + σωστή αιτιολόγηση".`,
      durationEstimateSeconds: targetDuration === '5-8' ? 95 : 70,
      onScreenKeywords: ['παράδειγμα', 'αιτιολόγηση', 'μονάδες'],
      bulletPoints: ['Τι δίνεται', 'Τι ζητείται', 'Ποια μέθοδος εφαρμόζω', 'Τελικό συμπέρασμα'],
    },
    {
      id: 'mistakes',
      heading: 'Συχνά λάθη που σε ρίχνουν',
      blockType: 'mistake',
      summary: 'Εντοπίζουμε τυπικά λάθη.',
      content: `${weaknessLine} Το πιο συνηθισμένο λάθος είναι ότι ο μαθητής ξέρει "κάτι" από το κεφάλαιο, αλλά δεν αναγνωρίζει ποιο ακριβώς εργαλείο χρειάζεται και γράφει βιαστικά.`,
      durationEstimateSeconds: 45,
      onScreenKeywords: ['βιασύνη', 'λάθος εργαλείο', 'παράλειψη'],
      bulletPoints: ['Μπερδεύεις κοντινές έννοιες', 'Πηδάς αιτιολόγηση', 'Ξεκινάς λύση χωρίς σωστό πλάνο'],
    },
    {
      id: 'recap',
      heading: 'Σύντομη ανακεφαλαίωση',
      blockType: 'recap',
      summary: 'Κλείνουμε το μάθημα σε καθαρά σημεία.',
      content: `Κράτα αυτό: για την απορία σου στο ${subjectLine}, δεν αρκεί να θυμάσαι τον ορισμό. Πρέπει να αναγνωρίζεις πότε εφαρμόζεται, ποια είναι η σωστή σειρά βημάτων και πώς αποφεύγεις τα συχνά λάθη.`,
      durationEstimateSeconds: 30,
      onScreenKeywords: ['τι κρατάς', 'εφαρμογή', 'σειρά βημάτων'],
      bulletPoints: ['Βασική έννοια', 'Σωστή μεθοδολογία', 'Προσοχή στα κλασικά λάθη'],
    },
  ];
}

function buildLessonFromBlocks({
  requestId,
  userId,
  subject,
  chapter,
  currentUnit,
  userQuestion,
  explanationStyle,
  targetDuration,
  outputMode,
  profileContext,
  blocks,
  generationMode,
  model,
}) {
  const lessonTitle = `${subject?.greekName ?? 'Μάθημα'} · ${chapter ? `Κεφάλαιο ${chapter.number}` : 'Στοχευμένη επεξήγηση'}`;
  const lessonObjective = `Να καταλάβει ο μαθητής καθαρά: ${userQuestion}`;
  const narrationScript = blocks.map((block) => `${block.heading}\n${block.content}`).join('\n\n');
  const workedExample = blocks.find((block) => block.blockType === 'example')?.content ?? '';
  const commonMistakes = blocks
    .filter((block) => block.blockType === 'mistake')
    .flatMap((block) => block.bulletPoints ?? [])
    .slice(0, 5);
  const recap = blocks.find((block) => block.blockType === 'recap')?.content ?? blocks.at(-1)?.content ?? '';
  const suggestedExercises = [
    `Δούλεψε 2 στοχευμένες ασκήσεις από ${chapter ? `το ${chapter.id}` : 'το σχετικό κεφάλαιο'}.`,
    'Ξαναγράψε τη μεθοδολογία με δικά σου λόγια σε 4-5 γραμμές.',
    'Έλεγξε αν μπορείς να εξηγήσεις το ίδιο σημείο χωρίς βοήθεια μετά από 10 λεπτά.',
  ];
  const suggestedFollowUp = profileContext.weakestChapter
    ? `Μετά προχώρησε και σε επανάληψη του ${profileContext.weakestChapter.chapterId}, γιατί εκεί φαίνεται η μεγαλύτερη αδυναμία σου.`
    : 'Μετά δοκίμασε ένα μικρό quiz ή μία στοχευμένη άσκηση για επιβεβαίωση κατανόησης.';

  const videoScenes = blocks.map((block, index) => ({
    id: `scene-${index + 1}`,
    heading: block.heading,
    narrationText: block.content,
    onScreenKeywords: block.onScreenKeywords ?? [],
    bulletContent: block.bulletPoints ?? [],
    durationEstimateSeconds: block.durationEstimateSeconds,
  }));

  return {
    id: randomUUID(),
    requestId,
    userId,
    subject: subject?.id ?? '',
    subjectLabel: subject?.greekName ?? '',
    chapterId: chapter?.id ?? '',
    chapterLabel: chapter ? `Κεφάλαιο ${chapter.number} - ${chapter.title}` : '',
    currentUnit: currentUnit || null,
    lessonTitle,
    lessonObjective,
    difficultyLevel: profileContext.inferredLevel,
    targetDuration,
    targetDurationLabel: mapDurationLabel(targetDuration),
    outputMode,
    explanationStyle,
    shortSummary: blocks[0]?.content ?? '',
    explanationSummary: blocks.map((block) => `${block.heading}: ${block.summary}`).join(' | '),
    fullExplanation: narrationScript,
    stepByStepBreakdown: blocks
      .filter((block) => block.blockType === 'steps')
      .flatMap((block) => block.bulletPoints ?? []),
    workedExample,
    commonMistakes,
    recap,
    suggestedNextAction: suggestedFollowUp,
    suggestedExercises,
    suggestedFollowUp,
    explanationBlocks: blocks,
    narrationScript,
    videoScenes,
    audioOverview: null,
    generationMode,
    model,
    createdAt: new Date().toISOString(),
  };
}

function buildFallbackLesson({
  requestId,
  userId,
  subject,
  chapter,
  currentUnit,
  userQuestion,
  explanationStyle,
  targetDuration,
  outputMode,
  selectedText,
  profileContext,
}) {
  const blocks = buildFallbackBlocks({
    userQuestion,
    subject,
    chapter,
    explanationStyle,
    selectedText,
    targetDuration,
    profileContext,
  });

  return buildLessonFromBlocks({
    requestId,
    userId,
    subject,
    chapter,
    currentUnit,
    userQuestion,
    explanationStyle,
    targetDuration,
    outputMode,
    profileContext,
    blocks,
    generationMode: 'fallback',
    model: 'fallback',
  });
}

async function callOpenAiExplanation({
  requestId,
  userId,
  subject,
  chapter,
  currentUnit,
  selectedText,
  userQuestion,
  explanationStyle,
  targetDuration,
  outputMode,
  profileContext,
}) {
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    return buildFallbackLesson({
      requestId,
      userId,
      subject,
      chapter,
      currentUnit,
      selectedText,
      userQuestion,
      explanationStyle,
      targetDuration,
      outputMode,
      profileContext,
    });
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
          role: 'system',
          content: [
            {
              type: 'input_text',
              text:
                'You are a Greek Panhellenic exam explanation engine. You do NOT chat casually. You convert a student doubt into a compact personalized mini-lesson in Greek, with clear teaching structure, tutoring tone, and future-ready narration/video blocks. Avoid generic chatbot phrasing. Write like a strong Greek frontistirio teacher.',
            },
          ],
        },
        {
          role: 'user',
          content: [
            {
              type: 'input_text',
              text: [
                `Student question: ${userQuestion}`,
                `Subject: ${subject?.greekName ?? subject?.id ?? 'unknown'}`,
                `Subject id: ${subject?.id ?? ''}`,
                `Chapter: ${chapter ? `${chapter.number}. ${chapter.title}` : 'not specified'}`,
                `Chapter id: ${chapter?.id ?? ''}`,
                `Current unit: ${currentUnit || 'not specified'}`,
                `Selected text: ${selectedText || 'none'}`,
                `Explanation style: ${explanationStyle}`,
                `Target duration: ${mapDurationLabel(targetDuration)}`,
                `Output mode: ${outputMode}`,
                `Profile context: ${JSON.stringify(profileContext)}`,
                'Return only JSON.',
                'The lesson must be educational, structured, and personalized for Greek Panhellenic preparation.',
              ].join('\n'),
            },
          ],
        },
      ],
      text: {
        format: {
          type: 'json_schema',
          name: 'explanation_lesson',
          strict: true,
          schema: {
            type: 'object',
            additionalProperties: false,
            properties: {
              lessonTitle: { type: 'string' },
              lessonObjective: { type: 'string' },
              shortSummary: { type: 'string' },
              suggestedExercises: { type: 'array', items: { type: 'string' } },
              suggestedFollowUp: { type: 'string' },
              explanationBlocks: {
                type: 'array',
                items: {
                  type: 'object',
                  additionalProperties: false,
                  properties: {
                    id: { type: 'string' },
                    heading: { type: 'string' },
                    blockType: { type: 'string' },
                    summary: { type: 'string' },
                    content: { type: 'string' },
                    durationEstimateSeconds: { type: 'number' },
                    onScreenKeywords: { type: 'array', items: { type: 'string' } },
                    bulletPoints: { type: 'array', items: { type: 'string' } },
                  },
                  required: ['id', 'heading', 'blockType', 'summary', 'content', 'durationEstimateSeconds', 'onScreenKeywords', 'bulletPoints'],
                },
              },
            },
            required: ['lessonTitle', 'lessonObjective', 'shortSummary', 'suggestedExercises', 'suggestedFollowUp', 'explanationBlocks'],
          },
        },
      },
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Explanation lesson request failed (${response.status}): ${errorText}`);
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
    throw new Error('Explanation lesson response was empty.');
  }

  const parsed = JSON.parse(outputText);
  const blocks = Array.isArray(parsed.explanationBlocks) ? parsed.explanationBlocks : [];
  const lesson = buildLessonFromBlocks({
    requestId,
    userId,
    subject,
    chapter,
    currentUnit,
    userQuestion,
    explanationStyle,
    targetDuration,
    outputMode,
    profileContext,
    blocks,
    generationMode: 'openai',
    model: DEFAULT_MODEL,
  });

  lesson.lessonTitle = parsed.lessonTitle || lesson.lessonTitle;
  lesson.lessonObjective = parsed.lessonObjective || lesson.lessonObjective;
  lesson.shortSummary = parsed.shortSummary || lesson.shortSummary;
  lesson.suggestedExercises = Array.isArray(parsed.suggestedExercises) ? parsed.suggestedExercises : lesson.suggestedExercises;
  lesson.suggestedFollowUp = parsed.suggestedFollowUp || lesson.suggestedFollowUp;
  lesson.suggestedNextAction = lesson.suggestedFollowUp;
  lesson.explanationSummary = blocks.map((block) => `${block.heading}: ${block.summary}`).join(' | ');
  lesson.fullExplanation = blocks.map((block) => `${block.heading}\n${block.content}`).join('\n\n');
  lesson.narrationScript = lesson.fullExplanation;
  lesson.stepByStepBreakdown = blocks.filter((block) => block.blockType === 'steps').flatMap((block) => block.bulletPoints ?? []);
  lesson.workedExample = blocks.find((block) => block.blockType === 'example')?.content ?? '';
  lesson.commonMistakes = blocks.filter((block) => block.blockType === 'mistake').flatMap((block) => block.bulletPoints ?? []).slice(0, 5);
  lesson.recap = blocks.find((block) => block.blockType === 'recap')?.content ?? '';
  lesson.videoScenes = blocks.map((block, index) => ({
    id: `scene-${index + 1}`,
    heading: block.heading,
    narrationText: block.content,
    onScreenKeywords: block.onScreenKeywords ?? [],
    bulletContent: block.bulletPoints ?? [],
    durationEstimateSeconds: block.durationEstimateSeconds,
  }));

  return lesson;
}

async function saveExplanationLesson({ request, lesson }) {
  const store = await readStore();
  store.explanationRequests.unshift(request);
  store.explanationLessons.unshift(lesson);
  await writeStore(store);
  return lesson;
}

async function generateExplanationLesson({
  userId,
  subject,
  chapter,
  currentUnit,
  selectedText,
  userQuestion,
  explanationStyle,
  targetDuration,
  outputMode,
  profile,
}) {
  const normalizedUserId = normalizeUserId(userId);
  const profileContext = buildProfileContext(profile, subject?.id ?? '', chapter?.id ?? '');
  const request = {
    id: randomUUID(),
    userId: normalizedUserId,
    subject: subject?.id ?? '',
    subjectLabel: subject?.greekName ?? '',
    chapterId: chapter?.id ?? '',
    chapterLabel: chapter ? `${chapter.number}. ${chapter.title}` : '',
    currentUnit: normalizeText(currentUnit) || null,
    selectedText: normalizeText(selectedText) || null,
    userQuestion: normalizeText(userQuestion),
    explanationStyle: normalizeText(explanationStyle) || 'simple',
    targetDuration: normalizeText(targetDuration) || '3-5',
    outputMode: normalizeText(outputMode) || 'text',
    profileContext,
    createdAt: new Date().toISOString(),
  };

  let lesson;
  try {
    lesson = await callOpenAiExplanation({
      requestId: request.id,
      userId: normalizedUserId,
      subject,
      chapter,
      currentUnit,
      selectedText,
      userQuestion: request.userQuestion,
      explanationStyle: request.explanationStyle,
      targetDuration: request.targetDuration,
      outputMode: request.outputMode,
      profileContext,
    });
  } catch (error) {
    if (process.env.OPENAI_API_KEY) {
      console.error('Explanation lesson generation failed, using fallback:', error);
    }

    lesson = buildFallbackLesson({
      requestId: request.id,
      userId: normalizedUserId,
      subject,
      chapter,
      currentUnit,
      selectedText,
      userQuestion: request.userQuestion,
      explanationStyle: request.explanationStyle,
      targetDuration: request.targetDuration,
      outputMode: request.outputMode,
      profileContext,
    });
  }

  await saveExplanationLesson({ request, lesson });
  return lesson;
}

async function getExplanationLessons(userId) {
  const normalizedUserId = normalizeUserId(userId);
  const store = await readStore();
  return store.explanationLessons.filter((lesson) => lesson.userId === normalizedUserId).slice(0, 20);
}

async function getExplanationLessonById(userId, lessonId) {
  const normalizedUserId = normalizeUserId(userId);
  const normalizedLessonId = normalizeText(lessonId);
  const store = await readStore();

  return (
    store.explanationLessons.find((lesson) => lesson.userId === normalizedUserId && lesson.id === normalizedLessonId) ?? null
  );
}

async function updateExplanationLesson(userId, lessonId, updater) {
  const normalizedUserId = normalizeUserId(userId);
  const normalizedLessonId = normalizeText(lessonId);
  const store = await readStore();
  const lessonIndex = store.explanationLessons.findIndex(
    (lesson) => lesson.userId === normalizedUserId && lesson.id === normalizedLessonId,
  );

  if (lessonIndex === -1) {
    return null;
  }

  const currentLesson = store.explanationLessons[lessonIndex];
  const nextLesson = typeof updater === 'function' ? updater(currentLesson) : { ...currentLesson, ...updater };
  store.explanationLessons[lessonIndex] = nextLesson;
  await writeStore(store);
  return nextLesson;
}

module.exports = {
  generateExplanationLesson,
  getExplanationLessons,
  getExplanationLessonById,
  updateExplanationLesson,
};
