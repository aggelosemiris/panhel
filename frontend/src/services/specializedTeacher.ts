import { DEFAULT_QUIZ_USER_ID } from '../context/QuizContext.tsx';
import type { StudentProfileStats } from './studentStats.ts';

function resolveApiBaseUrl() {
  const configuredUrl = process.env.REACT_APP_API_URL;

  if (typeof window !== 'undefined') {
    const host = window.location.hostname;
    const isLocalHost = host === 'localhost' || host === '127.0.0.1' || host === '::1';

    // When the app is opened on localhost:3000, talk directly to the backend.
    // This avoids stale CRA proxy behavior and relies on the backend CORS allowlist.
    if (isLocalHost && window.location.port !== '5000') return 'http://localhost:5000/api';
  }

  return configuredUrl ?? '/api';
}

const API_BASE_URL = resolveApiBaseUrl();

export type TeacherChatRole = 'user' | 'assistant';
export type TeacherMode = 'normal' | 'exercise' | 'explain' | 'methodology';
export type TeacherDetectedState = 'normal' | 'panic' | 'exercise' | 'methodology' | 'explain';

export type TeacherChatHistoryItem = {
  role: TeacherChatRole;
  text: string;
};

export type TeacherAttachmentContext = {
  name: string;
  sizeLabel: string;
  extractedText?: string;
  note?: string;
};

export type TeacherSubjectContext = {
  id: string;
  label: string;
};

export type TeacherChapterContext = {
  id: string;
  label: string;
};

export type TeacherSuggestedAction = {
  id: string;
  label: string;
  prompt: string;
  mode: TeacherMode;
};

export type TeacherReplyMeta = {
  provider?: string;
  model?: string;
  detectedState?: TeacherDetectedState;
  subjectFocus?: string | null;
  suggestions: TeacherSuggestedAction[];
};

export type TeacherReplyPayload = {
  success: boolean;
  reply: string;
  model: string;
  provider?: string;
  meta?: TeacherReplyMeta;
  profile: StudentProfileStats;
};

export type TeacherStreamHandlers = {
  onDelta: (delta: string) => void;
  onMeta?: (meta: TeacherReplyMeta, profile?: StudentProfileStats) => void;
};

export type AskSpecializedTeacherOptions = {
  userId?: string;
  history?: TeacherChatHistoryItem[];
  attachments?: TeacherAttachmentContext[];
  mode?: TeacherMode;
  subject?: TeacherSubjectContext | null;
  chapter?: TeacherChapterContext | null;
  selectedText?: string;
};

type TeacherContextPayload = {
  mode: TeacherMode;
  history: TeacherChatHistoryItem[];
  attachments: TeacherAttachmentContext[];
  subject?: TeacherSubjectContext | null;
  chapter?: TeacherChapterContext | null;
  selectedText?: string;
};

export type ExplanationStyle = 'simple' | 'detailed' | 'short' | 'step-by-step';
export type ExplanationDuration = '1-2' | '3-5' | '5-8';
export type ExplanationOutputMode = 'text' | 'audio' | 'video';

export type ExplanationBlock = {
  id: string;
  heading: string;
  blockType: string;
  summary: string;
  content: string;
  durationEstimateSeconds: number;
  onScreenKeywords: string[];
  bulletPoints: string[];
};

export type VideoLessonScene = {
  id: string;
  heading: string;
  narrationText: string;
  onScreenKeywords: string[];
  bulletContent: string[];
  durationEstimateSeconds: number;
};

export type ExplanationLesson = {
  id: string;
  requestId: string;
  userId: string;
  subject: string;
  subjectLabel: string;
  chapterId: string;
  chapterLabel: string;
  currentUnit: string | null;
  lessonTitle: string;
  lessonObjective: string;
  difficultyLevel: string;
  targetDuration: ExplanationDuration;
  targetDurationLabel: string;
  outputMode: ExplanationOutputMode;
  explanationStyle: ExplanationStyle;
  shortSummary: string;
  explanationSummary: string;
  fullExplanation: string;
  stepByStepBreakdown: string[];
  workedExample: string;
  commonMistakes: string[];
  recap: string;
  suggestedNextAction: string;
  suggestedExercises: string[];
  suggestedFollowUp: string;
  explanationBlocks: ExplanationBlock[];
  narrationScript: string;
  videoScenes: VideoLessonScene[];
  audioOverview?: {
    status: string;
    provider?: string | null;
    model?: string | null;
    voice?: string | null;
    audioUrl?: string | null;
    generatedAt?: string | null;
    error?: string | null;
  } | null;
  generationMode: string;
  model: string;
  createdAt: string;
};

function wait(ms: number) {
  return new Promise((resolve) => window.setTimeout(resolve, ms));
}

async function requestJson<T>(path: string, init?: RequestInit, retries = 2): Promise<T> {
  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= retries; attempt += 1) {
    try {
      const response = await fetch(`${API_BASE_URL}${path}`, {
        ...init,
        headers: {
          'Content-Type': 'application/json',
          ...(init?.headers ?? {}),
        },
      });

      if (!response.ok) {
        const errorPayload = await response.json().catch(() => null);
        const message = errorPayload?.message ?? `Request failed with status ${response.status}`;
        throw new Error(message);
      }

      return response.json() as Promise<T>;
    } catch (error) {
      console.error(`[specializedTeacher] request failed (attempt ${attempt + 1}/${retries + 1})`, error);
      lastError = error instanceof Error ? error : new Error('Unknown request error');

      if (attempt < retries) {
        await wait(450 * (attempt + 1));
        continue;
      }
    }
  }

  throw lastError ?? new Error('Unknown request error');
}

function stripLeakedPrompt(text: string) {
  if (!text) {
    return '';
  }

  const normalized = text.toLowerCase();
  if (
    normalized.includes('λειτουργια εξειδικευμενου καθηγητη') ||
    normalized.includes('system prompt') ||
    normalized.includes('hidden reasoning')
  ) {
    return '';
  }

  return text.slice(0, 2200);
}

function buildTeacherContext(options: AskSpecializedTeacherOptions = {}): TeacherContextPayload {
  return {
    mode: options.mode ?? 'normal',
    history: (options.history ?? [])
      .map((message) => ({
        role: message.role,
        text: stripLeakedPrompt(message.text),
      }))
      .filter((message) => message.text.trim().length > 0)
      .slice(-10),
    attachments: (options.attachments ?? []).map((attachment) => ({
      ...attachment,
      extractedText: attachment.extractedText?.slice(0, 9000),
    })),
    subject: options.subject ?? null,
    chapter: options.chapter ?? null,
    selectedText: options.selectedText?.slice(0, 5000),
  };
}

export async function askSpecializedTeacher(question: string, userId = DEFAULT_QUIZ_USER_ID) {
  return askSpecializedTeacherWithContext(question, { userId });
}

export async function askSpecializedTeacherWithContext(
  question: string,
  options: AskSpecializedTeacherOptions = {},
) {
  const userId = options.userId ?? DEFAULT_QUIZ_USER_ID;
  const context = buildTeacherContext(options);

  return requestJson<TeacherReplyPayload>('/users/specialized-teacher/respond', {
    method: 'POST',
    body: JSON.stringify({
      userId,
      question,
      context,
    }),
  });
}

export async function streamSpecializedTeacherWithContext(
  question: string,
  options: AskSpecializedTeacherOptions = {},
  handlers: TeacherStreamHandlers,
) {
  const userId = options.userId ?? DEFAULT_QUIZ_USER_ID;
  const context = buildTeacherContext(options);
  const response = await fetch(`${API_BASE_URL}/users/specialized-teacher/stream`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'text/event-stream',
    },
    body: JSON.stringify({
      userId,
      question,
      context,
    }),
  });

  if (!response.ok) {
    const errorPayload = await response.json().catch(() => null);
    throw new Error(errorPayload?.message ?? `Teacher stream failed with status ${response.status}`);
  }

  if (!response.body) {
    throw new Error('Teacher stream response has no body');
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';
  let fullReply = '';
  let finalMeta: TeacherReplyMeta | undefined;
  let finalProfile: StudentProfileStats | undefined;

  const consumeEvent = (eventText: string) => {
    const dataLines = eventText
      .split('\n')
      .map((line) => line.trim())
      .filter((line) => line.startsWith('data:'))
      .map((line) => line.slice(5).trim());

    if (!dataLines.length) return;

    const raw = dataLines.join('\n');
    const payload = JSON.parse(raw) as {
      type?: string;
      delta?: string;
      message?: string;
      meta?: TeacherReplyMeta;
      profile?: StudentProfileStats;
    };

    if (payload.type === 'delta' && payload.delta) {
      fullReply += payload.delta;
      handlers.onDelta(payload.delta);
      return;
    }

    if (payload.type === 'done') {
      finalMeta = payload.meta;
      finalProfile = payload.profile;
      if (finalMeta) handlers.onMeta?.(finalMeta, finalProfile);
      return;
    }

    if (payload.type === 'error') {
      throw new Error(payload.message ?? 'Teacher stream error');
    }
  };

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const events = buffer.split('\n\n');
    buffer = events.pop() ?? '';

    for (const eventText of events) {
      if (eventText.trim()) {
        consumeEvent(eventText);
      }
    }
  }

  if (buffer.trim()) {
    consumeEvent(buffer);
  }

  return {
    success: true,
    reply: fullReply,
    model: finalMeta?.model ?? 'stream',
    provider: finalMeta?.provider,
    meta: finalMeta,
    profile: finalProfile as StudentProfileStats,
  } satisfies TeacherReplyPayload;
}

export async function listExplanationLessons(userId = DEFAULT_QUIZ_USER_ID) {
  const encodedUserId = encodeURIComponent(userId);
  const payload = await requestJson<{ success: boolean; lessons: ExplanationLesson[] }>(
    `/users/specialized-teacher/lessons?userId=${encodedUserId}`,
  );

  return payload.lessons;
}

export async function generateExplanationLesson({
  userId = DEFAULT_QUIZ_USER_ID,
  subject,
  chapter,
  currentUnit,
  selectedText,
  userQuestion,
  explanationStyle,
  targetDuration,
  outputMode,
}: {
  userId?: string;
  subject?: { id: string; greekName: string } | null;
  chapter?: { id: string; number: number; title: string } | null;
  currentUnit?: string;
  selectedText?: string;
  userQuestion: string;
  explanationStyle: ExplanationStyle;
  targetDuration: ExplanationDuration;
  outputMode: ExplanationOutputMode;
}) {
  const payload = await requestJson<{ success: boolean; lesson: ExplanationLesson; profile: StudentProfileStats }>(
    '/users/specialized-teacher/lessons',
    {
      method: 'POST',
      body: JSON.stringify({
        userId,
        subject,
        chapter,
        currentUnit,
        selectedText,
        userQuestion,
        explanationStyle,
        targetDuration,
        outputMode,
      }),
    },
  );

  return payload;
}

export async function generateExplanationAudioOverview(lessonId: string, userId = DEFAULT_QUIZ_USER_ID) {
  const encodedLessonId = encodeURIComponent(lessonId);
  const payload = await requestJson<{ success: boolean; lesson: ExplanationLesson }>(
    `/users/specialized-teacher/lessons/${encodedLessonId}/audio-overview`,
    {
      method: 'POST',
      body: JSON.stringify({ userId }),
    },
  );

  return payload.lesson;
}
