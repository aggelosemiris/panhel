const API_BASE_URL = process.env.REACT_APP_API_URL ?? '/api';

function resolveApiOrigin() {
  if (API_BASE_URL.startsWith('http://') || API_BASE_URL.startsWith('https://')) {
    return API_BASE_URL.replace(/\/api\/?$/, '');
  }

  if (typeof window !== 'undefined') {
    if (window.location.hostname === 'localhost' && window.location.port === '3000') {
      return 'http://localhost:5000';
    }

    return window.location.origin;
  }

  return '';
}

function resolvePdfUrl(pdfUrl: string) {
  if (!pdfUrl) {
    return pdfUrl;
  }

  if (pdfUrl.startsWith('http://') || pdfUrl.startsWith('https://')) {
    return pdfUrl;
  }

  return `${resolveApiOrigin()}${pdfUrl}`;
}

export type GeneratedCustomExamQuestion = {
  id: string;
  title: string;
  prompt: string;
  points: number;
};

export type GeneratedCustomExam = {
  title: string;
  subject: string;
  chapterIds: string[];
  difficulty: string;
  difficultyLabel: string;
  estimatedTimeMinutes: number;
  instructions: string[];
  questions: GeneratedCustomExamQuestion[];
  generationMode: string;
  model: string;
};

export async function generateAiCustomExam({
  subjectId,
  selectedChapters,
  difficulty,
}: {
  subjectId: string;
  selectedChapters: Array<{ id: string; number: number; title: string; sections: string[] }>;
  difficulty: string;
}) {
  const response = await fetch(`${API_BASE_URL}/tests/generator/custom-ai-exam`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      subjectID: subjectId,
      selectedChapters,
      difficulty,
    }),
  });

  if (!response.ok) {
    const errorPayload = await response.json().catch(() => null);
    throw new Error(errorPayload?.message ?? 'Η δημιουργία AI διαγωνίσματος απέτυχε.');
  }

  const payload = (await response.json()) as {
    success: boolean;
    exam: GeneratedCustomExam;
    pdfUrl: string;
    fileName: string;
  };

  return {
    ...payload,
    resolvedPdfUrl: resolvePdfUrl(payload.pdfUrl),
  };
}
