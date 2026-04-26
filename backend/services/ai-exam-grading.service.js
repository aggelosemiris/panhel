const fs = require('fs/promises');
const path = require('path');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const PROJECT_ROOT = path.join(__dirname, '..', '..');
const FRONTEND_PUBLIC_DIRECTORY = path.join(PROJECT_ROOT, 'frontend', 'public');

const OPENAI_API_URL = 'https://api.openai.com/v1/responses';
const DEFAULT_OPENAI_MODEL = process.env.OPENAI_EXAM_GRADING_MODEL || 'gpt-4.1-mini';
const DEFAULT_GEMINI_MODEL =
  process.env.GEMINI_EXAM_GRADING_MODEL || process.env.GEMINI_SPECIALIZED_TEACHER_MODEL || 'gemini-2.5-flash';

const SUBJECT_LABELS = {
  aoth: 'ΑΟΘ',
  aepp: 'ΑΕΠΠ',
  math: 'Μαθηματικά',
};

const DIFFICULTY_LABELS = {
  easy: 'easy',
  normal: 'medium',
  hard: 'hard',
};

function resolveExamPdfPath(relativePublicPath) {
  const normalizedPath = String(relativePublicPath || '').replace(/^\/+/, '');
  return path.join(FRONTEND_PUBLIC_DIRECTORY, normalizedPath);
}

async function readPdfAsBase64(relativePublicPath) {
  const absolutePath = resolveExamPdfPath(relativePublicPath);
  const fileBuffer = await fs.readFile(absolutePath);
  return fileBuffer.toString('base64');
}

function buildFallbackGradeResult({
  subjectId,
  chapterId,
  chapterTitle,
  difficulty,
  mode = 'chapter-exam',
  topicKey,
  fallbackReason,
}) {
  const baseScoreByDifficulty = {
    easy: 78,
    normal: 68,
    hard: 58,
  };

  const totalScore = baseScoreByDifficulty[difficulty] ?? 65;
  const maxTotalScore = 100;
  const breakdown =
    mode === 'single-topic'
      ? [
          {
            question_id: topicKey || 'topic',
            chapter_id: chapterId,
            chapter: chapterTitle,
            score: totalScore,
            max_score: 100,
          },
        ]
      : [
          { question_id: 'q1', chapter_id: chapterId, chapter: chapterTitle, score: totalScore * 0.25, max_score: 25 },
          { question_id: 'q2', chapter_id: chapterId, chapter: chapterTitle, score: totalScore * 0.25, max_score: 25 },
          { question_id: 'q3', chapter_id: chapterId, chapter: chapterTitle, score: totalScore * 0.25, max_score: 25 },
          { question_id: 'q4', chapter_id: chapterId, chapter: chapterTitle, score: totalScore * 0.25, max_score: 25 },
        ].map((item) => ({
          ...item,
          score: Number(item.score.toFixed(2)),
        }));

  return {
    subject: SUBJECT_LABELS[subjectId] ?? subjectId,
    questions: breakdown,
    total_score: totalScore,
    max_total_score: maxTotalScore,
    summary:
      fallbackReason ||
      'Fallback grading ενεργοποιήθηκε επειδή η AI διόρθωση δεν ήταν διαθέσιμη αυτή τη στιγμή. Το αποτέλεσμα είναι ενδεικτικό μέχρι να ενεργοποιηθεί πραγματική AI διόρθωση.',
    gradingMode: 'fallback',
  };
}

function buildGradingPrompt({ subjectId, chapterId, chapterTitle, difficulty, mode = 'chapter-exam', topicKey }) {
  return [
    mode === 'single-topic'
      ? 'You are grading a Greek high-school single-topic answer for Panhellenic exams.'
      : 'You are grading a Greek high-school chapter exam for Panhellenic exams.',
    'Return valid JSON only.',
    `Subject: ${SUBJECT_LABELS[subjectId] ?? subjectId}`,
    `Canonical subject id: ${subjectId}`,
    `Canonical chapter id: ${chapterId}`,
    `Chapter title: ${chapterTitle}`,
    `Difficulty label: ${DIFFICULTY_LABELS[difficulty] ?? difficulty}`,
    mode === 'single-topic'
      ? `Topic key: ${topicKey || 'single-topic'}`
      : 'The first attached PDF is the official exam sheet. The following attachments are the student answer sheets.',
    'Grade strictly and conservatively.',
    'Keep max_total_score at 100 when possible.',
    'If the exam has multiple questions, return one item per question.',
    'Every returned question must include: question_id, chapter_id, chapter, score, max_score.',
    'Use the provided canonical chapter_id unless the exam clearly mixes chapters.',
    'Use this JSON schema exactly:',
    JSON.stringify(
      {
        subject: 'string',
        questions: [
          {
            question_id: 'string',
            chapter_id: 'string',
            chapter: 'string',
            score: 0,
            max_score: 0,
          },
        ],
        total_score: 0,
        max_total_score: 100,
        summary: 'string',
      },
      null,
      2,
    ),
  ].join('\n');
}

function extractOpenAiText(responsePayload) {
  if (typeof responsePayload.output_text === 'string' && responsePayload.output_text.trim()) {
    return responsePayload.output_text.trim();
  }

  const fragments = [];

  (responsePayload.output ?? []).forEach((outputItem) => {
    (outputItem.content ?? []).forEach((contentItem) => {
      if (contentItem.type === 'output_text' && typeof contentItem.text === 'string') {
        fragments.push(contentItem.text);
      }
    });
  });

  return fragments.join('\n').trim();
}

function parseJsonText(rawText) {
  const text = String(rawText || '').trim();
  if (!text) {
    throw new Error('AI returned empty text');
  }

  const fencedMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const candidate = fencedMatch ? fencedMatch[1].trim() : text;
  return JSON.parse(candidate);
}

function normalizeAiResult(result, { subjectId, chapterId, chapterTitle, provider }) {
  const rawQuestions = Array.isArray(result.questions) ? result.questions : [];

  const questions = rawQuestions.map((question, index) => ({
    question_id: String(question.question_id ?? `q${index + 1}`),
    chapter_id: String(question.chapter_id ?? chapterId),
    chapter: String(question.chapter ?? chapterTitle),
    score: Number(question.score ?? 0),
    max_score: Number(question.max_score ?? 0),
  }));

  const totalScore =
    typeof result.total_score === 'number' ? result.total_score : questions.reduce((sum, item) => sum + item.score, 0);
  const maxTotalScore =
    typeof result.max_total_score === 'number'
      ? result.max_total_score
      : questions.reduce((sum, item) => sum + item.max_score, 0) || 100;

  return {
    subject: String(result.subject ?? SUBJECT_LABELS[subjectId] ?? subjectId),
    questions,
    total_score: Number(totalScore.toFixed(2)),
    max_total_score: Number(maxTotalScore.toFixed(2)),
    summary: typeof result.summary === 'string' ? result.summary : 'Η AI διόρθωση ολοκληρώθηκε.',
    gradingMode: provider,
  };
}

async function callOpenAiExamGrader({
  subjectId,
  chapterId,
  chapterTitle,
  difficulty,
  examPdfPath,
  uploadedFiles,
  mode = 'chapter-exam',
  topicKey,
}) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error('OPENAI_API_KEY missing');
  }

  const userContent = [
    {
      type: 'input_text',
      text: buildGradingPrompt({ subjectId, chapterId, chapterTitle, difficulty, mode, topicKey }),
    },
  ];

  if (examPdfPath) {
    const examPdfBase64 = await readPdfAsBase64(examPdfPath);
    userContent.push({
      type: 'input_file',
      filename: `${subjectId}-${chapterId}-${difficulty}.pdf`,
      file_data: examPdfBase64,
    });
  }

  uploadedFiles.forEach((file) => {
    if (file.mimeType === 'application/pdf') {
      const base64Data = String(file.dataUrl).split(',')[1] ?? file.dataUrl;
      userContent.push({
        type: 'input_file',
        filename: file.name,
        file_data: base64Data,
      });
      return;
    }

    userContent.push({
      type: 'input_image',
      image_url: file.dataUrl,
    });
  });

  const response = await fetch(OPENAI_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: DEFAULT_OPENAI_MODEL,
      input: [{ role: 'user', content: userContent }],
      text: {
        format: {
          type: 'json_schema',
          name: 'exam_grading_result',
          strict: true,
          schema: {
            type: 'object',
            additionalProperties: false,
            properties: {
              subject: { type: 'string' },
              questions: {
                type: 'array',
                items: {
                  type: 'object',
                  additionalProperties: false,
                  properties: {
                    question_id: { type: 'string' },
                    chapter_id: { type: 'string' },
                    chapter: { type: 'string' },
                    score: { type: 'number' },
                    max_score: { type: 'number' },
                  },
                  required: ['question_id', 'chapter_id', 'chapter', 'score', 'max_score'],
                },
              },
              total_score: { type: 'number' },
              max_total_score: { type: 'number' },
              summary: { type: 'string' },
            },
            required: ['subject', 'questions', 'total_score', 'max_total_score', 'summary'],
          },
        },
      },
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`OpenAI grading request failed (${response.status}): ${errorText}`);
  }

  const responsePayload = await response.json();
  const jsonText = extractOpenAiText(responsePayload);
  return normalizeAiResult(parseJsonText(jsonText), { subjectId, chapterId, chapterTitle, provider: 'openai' });
}

async function callGeminiExamGrader({
  subjectId,
  chapterId,
  chapterTitle,
  difficulty,
  examPdfPath,
  uploadedFiles,
  mode = 'chapter-exam',
  topicKey,
}) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY missing');
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({
    model: DEFAULT_GEMINI_MODEL,
    generationConfig: {
      temperature: 0.2,
      responseMimeType: 'application/json',
    },
  });

  const parts = [{ text: buildGradingPrompt({ subjectId, chapterId, chapterTitle, difficulty, mode, topicKey }) }];

  if (examPdfPath) {
    const examPdfBase64 = await readPdfAsBase64(examPdfPath);
    parts.push({
      inlineData: {
        mimeType: 'application/pdf',
        data: examPdfBase64,
      },
    });
  }

  uploadedFiles.forEach((file) => {
    const base64Data = String(file.dataUrl).split(',')[1] ?? '';
    parts.push({
      inlineData: {
        mimeType: file.mimeType || 'application/octet-stream',
        data: base64Data,
      },
    });
  });

  const result = await model.generateContent({
    contents: [
      {
        role: 'user',
        parts,
      },
    ],
  });

  const text = result?.response?.text?.()?.trim?.() || '';
  return normalizeAiResult(parseJsonText(text), { subjectId, chapterId, chapterTitle, provider: 'gemini' });
}

async function gradeExamSubmission(args) {
  const providerErrors = [];

  try {
    return await callOpenAiExamGrader(args);
  } catch (error) {
    providerErrors.push(`openai: ${error instanceof Error ? error.message : String(error)}`);
    console.error('OpenAI exam grading failed, trying Gemini fallback:', error);
  }

  try {
    return await callGeminiExamGrader(args);
  } catch (error) {
    providerErrors.push(`gemini: ${error instanceof Error ? error.message : String(error)}`);
    console.error('Gemini exam grading failed, using scoring fallback:', error);
  }

  return buildFallbackGradeResult({
    ...args,
    fallbackReason: `Fallback grading ενεργοποιήθηκε επειδή η AI διόρθωση δεν ήταν διαθέσιμη αυτή τη στιγμή. Το αποτέλεσμα είναι ενδεικτικό μέχρι να ενεργοποιηθεί πραγματική AI διόρθωση. (${providerErrors.join(' | ')})`,
  });
}

async function gradeSingleTopicSubmission({ subjectId, topicKey, uploadedFiles }) {
  return gradeExamSubmission({
    subjectId,
    chapterId: topicKey,
    chapterTitle: `Θέμα ${String(topicKey || '').replace('topic-', '').toUpperCase()}`,
    difficulty: 'normal',
    examPdfPath: null,
    uploadedFiles,
    mode: 'single-topic',
    topicKey,
  });
}

module.exports = {
  gradeExamSubmission,
  gradeSingleTopicSubmission,
};
