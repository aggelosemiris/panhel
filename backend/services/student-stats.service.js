const fs = require('fs/promises');
const path = require('path');
const { randomUUID } = require('crypto');

const DATA_DIRECTORY = path.join(__dirname, '..', 'data');
const STUDENT_STATS_FILE = path.join(DATA_DIRECTORY, 'student-stats.json');
const DEFAULT_STORE = {
  studentStats: [],
  studyActivity: [],
};

let pendingWrite = Promise.resolve();

function normalizeUserId(userId) {
  const value = String(userId ?? 'guest-user').trim();
  return value || 'guest-user';
}

function normalizeSubject(subject) {
  return String(subject ?? '').trim().toLowerCase();
}

function normalizeChapterId(chapterId) {
  return String(chapterId ?? '').trim();
}

function normalizeQuestionId(questionId) {
  return String(questionId ?? '').trim();
}

function normalizeQuestionType(questionType) {
  const value = String(questionType ?? 'quiz').trim().toLowerCase();
  return value || 'quiz';
}

function toAccuracy(timesCorrect, timesAnswered) {
  if (!timesAnswered) {
    return 0;
  }

  return timesCorrect / timesAnswered;
}

function withAccuracyMetrics(item) {
  const accuracy = toAccuracy(item.timesCorrect, item.timesAnswered);

  return {
    ...item,
    accuracy,
    accuracyPercent: Number((accuracy * 100).toFixed(2)),
  };
}

function getAthensDateKey(date = new Date()) {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Europe/Athens',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(date);

  const values = Object.fromEntries(parts.map((part) => [part.type, part.value]));

  return `${values.year}-${values.month}-${values.day}`;
}

function shiftDateKey(dateKey, dayDelta) {
  const [year, month, day] = dateKey.split('-').map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  date.setUTCDate(date.getUTCDate() + dayDelta);

  return date.toISOString().slice(0, 10);
}

function calculateStudyStreak(activityDays, todayKey = getAthensDateKey()) {
  const days = new Set((activityDays ?? []).map((item) => item.dateKey).filter(Boolean));
  const yesterdayKey = shiftDateKey(todayKey, -1);

  if (!days.has(todayKey) && !days.has(yesterdayKey)) {
    return 0;
  }

  let streak = 0;
  let cursor = days.has(todayKey) ? todayKey : yesterdayKey;

  while (days.has(cursor)) {
    streak += 1;
    cursor = shiftDateKey(cursor, -1);
  }

  return streak;
}

async function ensureStore() {
  await fs.mkdir(DATA_DIRECTORY, { recursive: true });

  try {
    await fs.access(STUDENT_STATS_FILE);
  } catch {
    await fs.writeFile(STUDENT_STATS_FILE, JSON.stringify(DEFAULT_STORE, null, 2), 'utf8');
  }
}

async function readStore() {
  await ensureStore();

  try {
    const raw = await fs.readFile(STUDENT_STATS_FILE, 'utf8');
    const parsed = JSON.parse(raw);

    return {
      studentStats: Array.isArray(parsed.studentStats) ? parsed.studentStats : [],
      studyActivity: Array.isArray(parsed.studyActivity) ? parsed.studyActivity : [],
    };
  } catch {
    return { ...DEFAULT_STORE };
  }
}

async function writeStore(store) {
  await ensureStore();

  pendingWrite = pendingWrite.then(async () => {
    const tempFile = `${STUDENT_STATS_FILE}.tmp`;
    await fs.writeFile(tempFile, JSON.stringify(store, null, 2), 'utf8');
    await fs.rename(tempFile, STUDENT_STATS_FILE);
  });

  return pendingWrite;
}

function aggregateBySubject(stats) {
  const subjectMap = new Map();

  stats.forEach((stat) => {
    const current = subjectMap.get(stat.subject) ?? {
      subject: stat.subject,
      timesAnswered: 0,
      timesCorrect: 0,
    };

    current.timesAnswered += stat.timesAnswered;
    current.timesCorrect += stat.timesCorrect;
    subjectMap.set(stat.subject, current);
  });

  return Array.from(subjectMap.values())
    .map(withAccuracyMetrics)
    .sort((left, right) => left.subject.localeCompare(right.subject));
}

function aggregateByChapter(stats) {
  const chapterMap = new Map();

  stats.forEach((stat) => {
    const key = `${stat.subject}:${stat.chapterId}`;
    const current = chapterMap.get(key) ?? {
      subject: stat.subject,
      chapterId: stat.chapterId,
      timesAnswered: 0,
      timesCorrect: 0,
      lastAnsweredAt: stat.lastAnsweredAt,
    };

    current.timesAnswered += stat.timesAnswered;
    current.timesCorrect += stat.timesCorrect;
    current.lastAnsweredAt =
      new Date(stat.lastAnsweredAt).getTime() > new Date(current.lastAnsweredAt).getTime()
        ? stat.lastAnsweredAt
        : current.lastAnsweredAt;

    chapterMap.set(key, current);
  });

  return Array.from(chapterMap.values())
    .map(withAccuracyMetrics)
    .sort((left, right) => {
      if (left.accuracy !== right.accuracy) {
        return left.accuracy - right.accuracy;
      }

      if (left.timesAnswered !== right.timesAnswered) {
        return right.timesAnswered - left.timesAnswered;
      }

      return left.chapterId.localeCompare(right.chapterId);
    });
}

function aggregateByQuestionType(stats, questionType) {
  const filteredStats = stats.filter((stat) => stat.questionType === questionType);
  const subjectMap = new Map();

  filteredStats.forEach((stat) => {
    const current = subjectMap.get(stat.subject) ?? {
      subject: stat.subject,
      timesAnswered: 0,
      timesCorrect: 0,
    };

    current.timesAnswered += stat.timesAnswered;
    current.timesCorrect += stat.timesCorrect;
    subjectMap.set(stat.subject, current);
  });

  return Array.from(subjectMap.values())
    .map(withAccuracyMetrics)
    .sort((left, right) => left.subject.localeCompare(right.subject));
}

async function updateStudentStats({ userId, subject, chapterId, questionId, isCorrect, questionType = 'quiz' }) {
  const normalizedUserId = normalizeUserId(userId);
  const normalizedSubject = normalizeSubject(subject);
  const normalizedChapterId = normalizeChapterId(chapterId);
  const normalizedQuestionId = normalizeQuestionId(questionId);
  const normalizedQuestionType = normalizeQuestionType(questionType);

  if (!normalizedSubject || !normalizedChapterId || !normalizedQuestionId) {
    throw new Error('subject, chapterId and questionId are required');
  }

  const store = await readStore();
  const now = new Date().toISOString();

  let stat = store.studentStats.find(
    (item) =>
      item.userId === normalizedUserId &&
      item.subject === normalizedSubject &&
      item.chapterId === normalizedChapterId &&
      item.questionId === normalizedQuestionId,
  );

  if (!stat) {
    stat = {
      id: randomUUID(),
      userId: normalizedUserId,
      subject: normalizedSubject,
      chapterId: normalizedChapterId,
      questionId: normalizedQuestionId,
      questionType: normalizedQuestionType,
      timesAnswered: 0,
      timesCorrect: 0,
      lastAnsweredAt: now,
    };

    store.studentStats.push(stat);
  }

  stat.timesAnswered += 1;
  if (isCorrect) {
    stat.timesCorrect += 1;
  }
  stat.questionType = normalizedQuestionType;
  stat.lastAnsweredAt = now;
  touchStudyActivityInStore(store, normalizedUserId, now);

  await writeStore(store);

  return withAccuracyMetrics(stat);
}

function touchStudyActivityInStore(store, userId, isoTimestamp = new Date().toISOString()) {
  const normalizedUserId = normalizeUserId(userId);
  const dateKey = getAthensDateKey(new Date(isoTimestamp));
  const activity = Array.isArray(store.studyActivity) ? store.studyActivity : [];
  const existing = activity.find((item) => item.userId === normalizedUserId && item.dateKey === dateKey);

  if (existing) {
    existing.lastSeenAt = isoTimestamp;
  } else {
    activity.push({
      userId: normalizedUserId,
      dateKey,
      firstSeenAt: isoTimestamp,
      lastSeenAt: isoTimestamp,
    });
  }

  store.studyActivity = activity;
}

async function touchStudyActivity(userId) {
  const normalizedUserId = normalizeUserId(userId);
  const store = await readStore();
  touchStudyActivityInStore(store, normalizedUserId);
  await writeStore(store);

  return {
    userId: normalizedUserId,
    studyStreak: calculateStudyStreak(store.studyActivity.filter((item) => item.userId === normalizedUserId)),
  };
}

async function getStudentWeakChapters(userId, subject) {
  const normalizedUserId = normalizeUserId(userId);
  const normalizedSubject = normalizeSubject(subject);
  const store = await readStore();

  const filteredStats = store.studentStats.filter(
    (item) => item.userId === normalizedUserId && item.subject === normalizedSubject,
  );

  return aggregateByChapter(filteredStats);
}

async function getStudentProfile(userId) {
  const normalizedUserId = normalizeUserId(userId);
  const store = await readStore();
  const studentStats = store.studentStats.filter((item) => item.userId === normalizedUserId);
  const studyActivity = [
    ...(store.studyActivity ?? []).filter((item) => item.userId === normalizedUserId),
    ...studentStats
      .filter((item) => item.lastAnsweredAt)
      .map((item) => ({
        userId: normalizedUserId,
        dateKey: getAthensDateKey(new Date(item.lastAnsweredAt)),
      })),
  ];

  const totalAnsweredQuestions = studentStats.reduce((sum, item) => sum + item.timesAnswered, 0);
  const totalCorrectAnswers = studentStats.reduce((sum, item) => sum + item.timesCorrect, 0);
  const overallAccuracy = toAccuracy(totalCorrectAnswers, totalAnsweredQuestions);
  const bySubject = aggregateBySubject(studentStats);
  const byChapter = aggregateByChapter(studentStats);
  const trueFalseBySubject = aggregateByQuestionType(studentStats, 'true-false');

  return {
    userId: normalizedUserId,
    totalAnsweredQuestions,
    totalCorrectAnswers,
    overallAccuracy,
    overallAccuracyPercent: Number((overallAccuracy * 100).toFixed(2)),
    bySubject,
    byChapter,
    trueFalseBySubject,
    studyStreak: calculateStudyStreak(studyActivity),
    weakestChapter: byChapter[0] ?? null,
    strongestChapter: byChapter.length ? byChapter[byChapter.length - 1] : null,
  };
}

module.exports = {
  getStudentProfile,
  getStudentWeakChapters,
  touchStudyActivity,
  updateStudentStats,
};
