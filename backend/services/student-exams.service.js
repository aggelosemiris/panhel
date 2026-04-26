const fs = require('fs/promises');
const path = require('path');
const { randomUUID } = require('crypto');

const DATA_DIRECTORY = path.join(__dirname, '..', 'data');
const STUDENT_EXAMS_FILE = path.join(DATA_DIRECTORY, 'student-exams.json');
const DEFAULT_STORE = {
  studentExams: [],
};

let pendingWrite = Promise.resolve();

function normalizeUserId(userId) {
  const value = String(userId ?? 'guest-user').trim();
  return value || 'guest-user';
}

function normalizeSubject(subject) {
  return String(subject ?? '').trim().toLowerCase();
}

function normalizeDifficulty(difficulty) {
  return String(difficulty ?? '').trim().toLowerCase();
}

async function ensureStore() {
  await fs.mkdir(DATA_DIRECTORY, { recursive: true });

  try {
    await fs.access(STUDENT_EXAMS_FILE);
  } catch {
    await fs.writeFile(STUDENT_EXAMS_FILE, JSON.stringify(DEFAULT_STORE, null, 2), 'utf8');
  }
}

async function readStore() {
  await ensureStore();

  try {
    const raw = await fs.readFile(STUDENT_EXAMS_FILE, 'utf8');
    const parsed = JSON.parse(raw);

    return {
      studentExams: Array.isArray(parsed.studentExams) ? parsed.studentExams : [],
    };
  } catch {
    return { ...DEFAULT_STORE };
  }
}

async function writeStore(store) {
  await ensureStore();

  pendingWrite = pendingWrite.then(async () => {
    const tempFile = `${STUDENT_EXAMS_FILE}.tmp`;
    await fs.writeFile(tempFile, JSON.stringify(store, null, 2), 'utf8');
    await fs.rename(tempFile, STUDENT_EXAMS_FILE);
  });

  return pendingWrite;
}

function toPercent(totalScore, maxScore) {
  if (!maxScore) {
    return 0;
  }

  return totalScore / maxScore;
}

async function saveStudentExam({
  userId,
  examId,
  subject,
  difficulty,
  examType = 'chapter-exam',
  topicType = null,
  totalScore,
  maxScore,
  breakdown = [],
  gradingMode = 'fallback',
}) {
  const normalizedUserId = normalizeUserId(userId);
  const normalizedSubject = normalizeSubject(subject);
  const normalizedDifficulty = normalizeDifficulty(difficulty);
  const store = await readStore();

  const record = {
    id: randomUUID(),
    userId: normalizedUserId,
    examId: String(examId),
    subject: normalizedSubject,
    difficulty: normalizedDifficulty,
    examType: String(examType || 'chapter-exam'),
    topicType: topicType ? String(topicType) : null,
    totalScore: Number(totalScore) || 0,
    maxScore: Number(maxScore) || 100,
    createdAt: new Date().toISOString(),
    breakdown,
    gradingMode,
  };

  store.studentExams.push(record);
  await writeStore(store);

  return {
    ...record,
    average: toPercent(record.totalScore, record.maxScore),
    averagePercent: Number((toPercent(record.totalScore, record.maxScore) * 100).toFixed(2)),
  };
}

async function getExamDifficultyStats(userId, subject) {
  const normalizedUserId = normalizeUserId(userId);
  const normalizedSubject = normalizeSubject(subject);
  const store = await readStore();
  const exams = store.studentExams.filter(
    (item) => item.userId === normalizedUserId && item.subject === normalizedSubject && (item.examType ?? 'chapter-exam') === 'chapter-exam',
  );

  const grouped = {
    easy: { totalScore: 0, maxScore: 0, count: 0 },
    normal: { totalScore: 0, maxScore: 0, count: 0 },
    hard: { totalScore: 0, maxScore: 0, count: 0 },
  };

  exams.forEach((exam) => {
    const bucket = grouped[exam.difficulty];

    if (!bucket) {
      return;
    }

    bucket.totalScore += exam.totalScore;
    bucket.maxScore += exam.maxScore;
    bucket.count += 1;
  });

  const buildAverage = (key) => {
    const bucket = grouped[key];
    const average = toPercent(bucket.totalScore, bucket.maxScore);
    return {
      average,
      averagePercent: Number((average * 100).toFixed(2)),
      attempts: bucket.count,
    };
  };

  return {
    subject: normalizedSubject,
    easy: buildAverage('easy'),
    medium: buildAverage('normal'),
    hard: buildAverage('hard'),
  };
}

async function getExamDifficultyStatsBySubject(userId) {
  const normalizedUserId = normalizeUserId(userId);
  const store = await readStore();
  const subjects = Array.from(
    new Set(
      store.studentExams
        .filter((item) => item.userId === normalizedUserId && (item.examType ?? 'chapter-exam') === 'chapter-exam')
        .map((item) => item.subject),
    ),
  );
  const entries = await Promise.all(subjects.map(async (subject) => getExamDifficultyStats(normalizedUserId, subject)));
  return entries;
}

async function getSingleTopicStatsBySubject(userId) {
  const normalizedUserId = normalizeUserId(userId);
  const store = await readStore();
  const relevantExams = store.studentExams.filter(
    (item) => item.userId === normalizedUserId && (item.examType ?? 'chapter-exam') === 'single-topic',
  );
  const subjectMap = new Map();

  relevantExams.forEach((exam) => {
    const subjectBucket = subjectMap.get(exam.subject) ?? {
      subject: exam.subject,
      topics: {},
    };
    const topicKey = exam.topicType || 'topic-unknown';
    const topicBucket = subjectBucket.topics[topicKey] ?? {
      topicType: topicKey,
      totalScore: 0,
      maxScore: 0,
      attempts: 0,
    };

    topicBucket.totalScore += Number(exam.totalScore) || 0;
    topicBucket.maxScore += Number(exam.maxScore) || 0;
    topicBucket.attempts += 1;
    subjectBucket.topics[topicKey] = topicBucket;
    subjectMap.set(exam.subject, subjectBucket);
  });

  return Array.from(subjectMap.values()).map((subjectBucket) => ({
    subject: subjectBucket.subject,
    topics: Object.values(subjectBucket.topics)
      .map((topicBucket) => {
        const average = toPercent(topicBucket.totalScore, topicBucket.maxScore);
        return {
          topicType: topicBucket.topicType,
          average,
          averagePercent: Number((average * 100).toFixed(2)),
          attempts: topicBucket.attempts,
        };
      })
      .sort((left, right) => left.topicType.localeCompare(right.topicType)),
  }));
}

module.exports = {
  getExamDifficultyStats,
  getExamDifficultyStatsBySubject,
  getSingleTopicStatsBySubject,
  saveStudentExam,
};
