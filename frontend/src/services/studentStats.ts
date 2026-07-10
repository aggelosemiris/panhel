export type StudentStatsUpdateInput = {
  userId: string;
  subject: string;
  chapterId: string;
  questionId: string;
  isCorrect: boolean;
};

export type StudentStatRecord = {
  id: string;
  userId: string;
  subject: string;
  chapterId: string;
  questionId: string;
  timesAnswered: number;
  timesCorrect: number;
  lastAnsweredAt: string;
  accuracy: number;
  accuracyPercent: number;
};

export type StudentChapterPerformance = {
  subject: string;
  chapterId: string;
  timesAnswered: number;
  timesCorrect: number;
  lastAnsweredAt?: string;
  accuracy: number;
  accuracyPercent: number;
};

export type StudentSubjectPerformance = {
  subject: string;
  timesAnswered: number;
  timesCorrect: number;
  accuracy: number;
  accuracyPercent: number;
};

export type StudentSingleTopicPerformance = {
  topicType: string;
  average: number;
  averagePercent: number;
  attempts: number;
};

export type StudentProfileStats = {
  userId: string;
  totalAnsweredQuestions: number;
  totalCorrectAnswers: number;
  overallAccuracy: number;
  overallAccuracyPercent: number;
  studyStreak: number;
  bySubject: StudentSubjectPerformance[];
  byChapter: StudentChapterPerformance[];
  trueFalseBySubject?: StudentSubjectPerformance[];
  singleTopicBySubject?: Array<{
    subject: string;
    topics: StudentSingleTopicPerformance[];
  }>;
  weakestChapter: StudentChapterPerformance | null;
  strongestChapter: StudentChapterPerformance | null;
  examDifficultyBySubject?: Array<{
    subject: string;
    easy: { average: number; averagePercent: number; attempts: number };
    medium: { average: number; averagePercent: number; attempts: number };
    hard: { average: number; averagePercent: number; attempts: number };
  }>;
};

const API_BASE_URL = process.env.REACT_APP_API_URL ?? '/api';
const LOCAL_STORAGE_KEY = 'student-stats-local-fallback-v1';

type LocalStore = {
  studentStats: Array<{
    id: string;
    userId: string;
    subject: string;
    chapterId: string;
    questionId: string;
    timesAnswered: number;
    timesCorrect: number;
    lastAnsweredAt: string;
  }>;
  studyActivity: Array<{
    userId: string;
    dateKey: string;
    firstSeenAt: string;
    lastSeenAt: string;
  }>;
};

const defaultStore: LocalStore = {
  studentStats: [],
  studyActivity: [],
};

function normalizeUserId(userId: string) {
  const value = userId.trim();
  return value || 'guest-user';
}

function normalizeSubject(subject: string) {
  return subject.trim().toLowerCase();
}

function computeAccuracy(timesCorrect: number, timesAnswered: number) {
  if (!timesAnswered) {
    return 0;
  }

  return timesCorrect / timesAnswered;
}

function withAccuracy<T extends { timesCorrect: number; timesAnswered: number }>(item: T) {
  const accuracy = computeAccuracy(item.timesCorrect, item.timesAnswered);

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

function shiftDateKey(dateKey: string, dayDelta: number) {
  const [year, month, day] = dateKey.split('-').map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  date.setUTCDate(date.getUTCDate() + dayDelta);

  return date.toISOString().slice(0, 10);
}

function calculateStudyStreak(activityDays: LocalStore['studyActivity'], todayKey = getAthensDateKey()) {
  const days = new Set(activityDays.map((item) => item.dateKey).filter(Boolean));
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

function readLocalStore(): LocalStore {
  if (typeof window === 'undefined') {
    return defaultStore;
  }

  try {
    const raw = window.localStorage.getItem(LOCAL_STORAGE_KEY);

    if (!raw) {
      return defaultStore;
    }

    const parsed = JSON.parse(raw) as Partial<LocalStore>;

    return {
      studentStats: Array.isArray(parsed.studentStats) ? parsed.studentStats : [],
      studyActivity: Array.isArray(parsed.studyActivity) ? parsed.studyActivity : [],
    };
  } catch {
    return defaultStore;
  }
}

function writeLocalStore(store: LocalStore) {
  if (typeof window === 'undefined') {
    return;
  }

  window.localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(store));
}

async function requestJson<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(init?.headers ?? {}),
    },
  });

  if (!response.ok) {
    throw new Error(`Request failed with status ${response.status}`);
  }

  return response.json() as Promise<T>;
}

function aggregateChapterStats(stats: LocalStore['studentStats']) {
  const chapterMap = new Map<string, StudentChapterPerformance>();

  stats.forEach((item) => {
    const key = `${item.subject}:${item.chapterId}`;
    const current = chapterMap.get(key) ?? {
      subject: item.subject,
      chapterId: item.chapterId,
      timesAnswered: 0,
      timesCorrect: 0,
      lastAnsweredAt: item.lastAnsweredAt,
      accuracy: 0,
      accuracyPercent: 0,
    };

    current.timesAnswered += item.timesAnswered;
    current.timesCorrect += item.timesCorrect;
    current.lastAnsweredAt =
      new Date(item.lastAnsweredAt).getTime() > new Date(current.lastAnsweredAt ?? item.lastAnsweredAt).getTime()
        ? item.lastAnsweredAt
        : current.lastAnsweredAt;

    chapterMap.set(key, current);
  });

  return Array.from(chapterMap.values())
    .map(withAccuracy)
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

function aggregateSubjectStats(stats: LocalStore['studentStats']) {
  const subjectMap = new Map<string, StudentSubjectPerformance>();

  stats.forEach((item) => {
    const current = subjectMap.get(item.subject) ?? {
      subject: item.subject,
      timesAnswered: 0,
      timesCorrect: 0,
      accuracy: 0,
      accuracyPercent: 0,
    };

    current.timesAnswered += item.timesAnswered;
    current.timesCorrect += item.timesCorrect;
    subjectMap.set(item.subject, current);
  });

  return Array.from(subjectMap.values())
    .map(withAccuracy)
    .sort((left, right) => left.subject.localeCompare(right.subject));
}

function buildLocalProfile(userId: string): StudentProfileStats {
  const normalizedUserId = normalizeUserId(userId);
  const store = readLocalStore();
  const stats = store.studentStats.filter((item) => item.userId === normalizedUserId);
  const studyActivity = [
    ...store.studyActivity.filter((item) => item.userId === normalizedUserId),
    ...stats
      .filter((item) => item.lastAnsweredAt)
      .map((item) => ({
        userId: normalizedUserId,
        dateKey: getAthensDateKey(new Date(item.lastAnsweredAt)),
        firstSeenAt: item.lastAnsweredAt,
        lastSeenAt: item.lastAnsweredAt,
      })),
  ];
  const totalAnsweredQuestions = stats.reduce((sum, item) => sum + item.timesAnswered, 0);
  const totalCorrectAnswers = stats.reduce((sum, item) => sum + item.timesCorrect, 0);
  const overallAccuracy = computeAccuracy(totalCorrectAnswers, totalAnsweredQuestions);
  const bySubject = aggregateSubjectStats(stats);
  const byChapter = aggregateChapterStats(stats);

  return {
    userId: normalizedUserId,
    totalAnsweredQuestions,
    totalCorrectAnswers,
    overallAccuracy,
    overallAccuracyPercent: Number((overallAccuracy * 100).toFixed(2)),
    studyStreak: calculateStudyStreak(studyActivity),
    bySubject,
    byChapter,
    trueFalseBySubject: [],
    singleTopicBySubject: [],
    weakestChapter: byChapter[0] ?? null,
    strongestChapter: byChapter.length ? byChapter[byChapter.length - 1] : null,
    examDifficultyBySubject: [],
  };
}

function touchLocalStudyActivity(userId: string) {
  const normalizedUserId = normalizeUserId(userId);
  const store = readLocalStore();
  touchStudyActivityInStore(store, normalizedUserId);
  writeLocalStore(store);

  return {
    userId: normalizedUserId,
    studyStreak: calculateStudyStreak(store.studyActivity.filter((item) => item.userId === normalizedUserId)),
  };
}

function touchStudyActivityInStore(store: LocalStore, userId: string) {
  const normalizedUserId = normalizeUserId(userId);
  const now = new Date().toISOString();
  const dateKey = getAthensDateKey(new Date(now));
  const existing = store.studyActivity.find((item) => item.userId === normalizedUserId && item.dateKey === dateKey);

  if (existing) {
    existing.lastSeenAt = now;
  } else {
    store.studyActivity.push({
      userId: normalizedUserId,
      dateKey,
      firstSeenAt: now,
      lastSeenAt: now,
    });
  }
}

function updateLocalStudentStats({
  userId,
  subject,
  chapterId,
  questionId,
  isCorrect,
}: StudentStatsUpdateInput): StudentStatRecord {
  const normalizedUserId = normalizeUserId(userId);
  const normalizedSubject = normalizeSubject(subject);
  const store = readLocalStore();
  const now = new Date().toISOString();

  let stat = store.studentStats.find(
    (item) =>
      item.userId === normalizedUserId &&
      item.subject === normalizedSubject &&
      item.chapterId === chapterId &&
      item.questionId === questionId,
  );

  if (!stat) {
    stat = {
      id: `${normalizedUserId}-${normalizedSubject}-${chapterId}-${questionId}`,
      userId: normalizedUserId,
      subject: normalizedSubject,
      chapterId,
      questionId,
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
  stat.lastAnsweredAt = now;
  touchStudyActivityInStore(store, normalizedUserId);

  writeLocalStore(store);
  return withAccuracy(stat);
}

export async function updateStudentStats(input: StudentStatsUpdateInput) {
  try {
    const data = await requestJson<{ success: boolean; stat: StudentStatRecord }>('/users/student-stats', {
      method: 'POST',
      body: JSON.stringify(input),
    });

    return data.stat;
  } catch {
    return updateLocalStudentStats(input);
  }
}

export async function getStudentWeakChapters(userId: string, subject: string) {
  try {
    const encodedSubject = encodeURIComponent(subject);
    const encodedUserId = encodeURIComponent(normalizeUserId(userId));
    const data = await requestJson<{ success: boolean; chapters: StudentChapterPerformance[] }>(
      `/users/student-stats/weak-chapters/${encodedSubject}?userId=${encodedUserId}`,
    );

    return data.chapters;
  } catch {
    const profile = buildLocalProfile(userId);
    return profile.byChapter.filter((chapter) => chapter.subject === normalizeSubject(subject));
  }
}

export async function getStudentProfileStats(userId: string) {
  try {
    const encodedUserId = encodeURIComponent(normalizeUserId(userId));
    const data = await requestJson<{ success: boolean; profile: StudentProfileStats }>(
      `/users/profile-stats?userId=${encodedUserId}`,
    );

    return data.profile;
  } catch {
    return buildLocalProfile(userId);
  }
}

export async function touchStudyActivity(userId: string) {
  try {
    const data = await requestJson<{ success: boolean; activity: { userId: string; studyStreak: number } }>('/users/study-activity', {
      method: 'POST',
      body: JSON.stringify({ userId }),
    });

    return data.activity;
  } catch {
    return touchLocalStudyActivity(userId);
  }
}
