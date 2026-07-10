import { DEFAULT_QUIZ_USER_ID } from '../context/QuizContext.tsx';

const API_BASE_URL = process.env.REACT_APP_API_URL ?? '/api';

export type UploadedExamFile = {
  name: string;
  mimeType: string;
  dataUrl: string;
  size: number;
};

export type ExamGradingQuestion = {
  question_id: string;
  chapter_id: string;
  chapter: string;
  score: number;
  max_score: number;
  feedback?: string;
  hint?: string;
};

export type ExamGradingMistake = {
  description: string;
  stepNumber?: number;
  explanation: string;
  hintToFix: string;
};

export type ExamGradingResult = {
  subject: string;
  subject_id: string;
  subject_label: string;
  difficulty_label: string;
  questions: ExamGradingQuestion[];
  total_score: number;
  max_total_score: number;
  summary: string;
  praise_points?: string[];
  mistakes_found?: ExamGradingMistake[];
  pedagogical_guidance?: string;
  complete_solution?: string;
  next_steps?: string[];
  gradingMode: string;
};

export type StudentExamRecord = {
  id: string;
  userId: string;
  examId: string;
  subject: string;
  difficulty: string;
  totalScore: number;
  maxScore: number;
  createdAt: string;
  average: number;
  averagePercent: number;
};

export async function fileToUploadPayload(file: File): Promise<UploadedExamFile> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => {
      resolve({
        name: file.name,
        mimeType: file.type || 'application/octet-stream',
        dataUrl: String(reader.result),
        size: file.size,
      });
    };

    reader.onerror = () => reject(new Error(`Δεν μπόρεσα να διαβάσω το αρχείο ${file.name}`));
    reader.readAsDataURL(file);
  });
}

export async function submitExamForAiCorrection({
  subjectId,
  chapterId,
  tier,
  chapterTitle,
  uploadedFiles,
  userId = DEFAULT_QUIZ_USER_ID,
}: {
  subjectId: string;
  chapterId: string;
  tier: string;
  chapterTitle: string;
  uploadedFiles: UploadedExamFile[];
  userId?: string;
}) {
  const response = await fetch(`${API_BASE_URL}/tests/chapter/${subjectId}/${chapterId}/${tier}/grade-submission`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      userId,
      chapterTitle,
      uploadedFiles,
    }),
  });

  if (!response.ok) {
    const errorPayload = await response.json().catch(() => null);
    throw new Error(errorPayload?.message ?? 'Η AI διόρθωση απέτυχε.');
  }

  return response.json() as Promise<{
    success: boolean;
    result: ExamGradingResult;
    studentExam: StudentExamRecord;
  }>;
}

export async function submitSingleTopicForAiCorrection({
  subjectId,
  topicKey,
  uploadedFiles,
  exercisePdfPath,
  userId = DEFAULT_QUIZ_USER_ID,
}: {
  subjectId: string;
  topicKey: string;
  uploadedFiles: UploadedExamFile[];
  exercisePdfPath?: string | null;
  userId?: string;
}) {
  const response = await fetch(`${API_BASE_URL}/tests/chapter/single-topic/${subjectId}/${topicKey}/grade-submission`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      userId,
      uploadedFiles,
      exercisePdfPath,
    }),
  });

  if (!response.ok) {
    const errorPayload = await response.json().catch(() => null);
    throw new Error(errorPayload?.message ?? 'Η AI διόρθωση απέτυχε.');
  }

  return response.json() as Promise<{
    success: boolean;
    result: ExamGradingResult;
    studentExam: StudentExamRecord;
  }>;
}
