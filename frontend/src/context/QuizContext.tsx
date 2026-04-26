import React, { createContext, useContext, useEffect, useState } from 'react';
import { type TheoryQuizQuestion } from '../config/theoryQuiz.ts';

const QUIZ_STORAGE_KEY = 'theory-quiz-session-v1';
export const DEFAULT_QUIZ_USER_ID = 'guest-user';
export type QuizMode = 'chapter' | 'smart';

export type QuizSession = {
  questions: TheoryQuizQuestion[];
  currentQuestionIndex: number;
  score: number;
  chapterId: string | null;
  subjectId: string | null;
  userId: string;
  isComplete: boolean;
  quizMode: QuizMode;
  quizLabel: string | null;
};

type QuizContextValue = QuizSession & {
  startQuiz: (args: {
    questions: TheoryQuizQuestion[];
    chapterId: string;
    subjectId: string;
    userId?: string;
    quizMode?: QuizMode;
    quizLabel?: string | null;
  }) => void;
  registerAnswer: (isCorrect: boolean) => void;
  goToNextQuestion: () => boolean;
  restartQuiz: () => void;
  resetQuiz: () => void;
};

const emptyQuizSession: QuizSession = {
  questions: [],
  currentQuestionIndex: 0,
  score: 0,
  chapterId: null,
  subjectId: null,
  userId: DEFAULT_QUIZ_USER_ID,
  isComplete: false,
  quizMode: 'chapter',
  quizLabel: null,
};

const QuizContext = createContext<QuizContextValue | undefined>(undefined);

function readStoredQuizSession(): QuizSession {
  if (typeof window === 'undefined') {
    return emptyQuizSession;
  }

  const storedValue = window.sessionStorage.getItem(QUIZ_STORAGE_KEY);

  if (!storedValue) {
    return emptyQuizSession;
  }

  try {
    const parsedSession = JSON.parse(storedValue) as Partial<QuizSession>;

    return {
      questions: Array.isArray(parsedSession.questions) ? parsedSession.questions : [],
      currentQuestionIndex:
        typeof parsedSession.currentQuestionIndex === 'number' ? parsedSession.currentQuestionIndex : 0,
      score: typeof parsedSession.score === 'number' ? parsedSession.score : 0,
      chapterId: typeof parsedSession.chapterId === 'string' ? parsedSession.chapterId : null,
      subjectId: typeof parsedSession.subjectId === 'string' ? parsedSession.subjectId : null,
      userId: typeof parsedSession.userId === 'string' ? parsedSession.userId : DEFAULT_QUIZ_USER_ID,
      isComplete: Boolean(parsedSession.isComplete),
      quizMode: parsedSession.quizMode === 'smart' ? 'smart' : 'chapter',
      quizLabel: typeof parsedSession.quizLabel === 'string' ? parsedSession.quizLabel : null,
    };
  } catch {
    return emptyQuizSession;
  }
}

export function QuizProvider({ children }: { children: React.ReactNode }) {
  const initialSession = readStoredQuizSession();

  const [questions, setQuestions] = useState<TheoryQuizQuestion[]>(initialSession.questions);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(initialSession.currentQuestionIndex);
  const [score, setScore] = useState(initialSession.score);
  const [chapterId, setChapterId] = useState<string | null>(initialSession.chapterId);
  const [subjectId, setSubjectId] = useState<string | null>(initialSession.subjectId);
  const [userId, setUserId] = useState(initialSession.userId);
  const [isComplete, setIsComplete] = useState(initialSession.isComplete);
  const [quizMode, setQuizMode] = useState<QuizMode>(initialSession.quizMode);
  const [quizLabel, setQuizLabel] = useState<string | null>(initialSession.quizLabel);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    const sessionToStore: QuizSession = {
      questions,
      currentQuestionIndex,
      score,
      chapterId,
      subjectId,
      userId,
      isComplete,
      quizMode,
      quizLabel,
    };

    window.sessionStorage.setItem(QUIZ_STORAGE_KEY, JSON.stringify(sessionToStore));
  }, [chapterId, currentQuestionIndex, isComplete, questions, quizLabel, quizMode, score, subjectId, userId]);

  const startQuiz = ({
    questions: quizQuestions,
    chapterId: nextChapterId,
    subjectId: nextSubjectId,
    userId: nextUserId,
    quizMode: nextQuizMode,
    quizLabel: nextQuizLabel,
  }: {
    questions: TheoryQuizQuestion[];
    chapterId: string;
    subjectId: string;
    userId?: string;
    quizMode?: QuizMode;
    quizLabel?: string | null;
  }) => {
    setQuestions(quizQuestions);
    setCurrentQuestionIndex(0);
    setScore(0);
    setChapterId(nextChapterId);
    setSubjectId(nextSubjectId);
    setUserId(nextUserId ?? DEFAULT_QUIZ_USER_ID);
    setIsComplete(false);
    setQuizMode(nextQuizMode ?? 'chapter');
    setQuizLabel(nextQuizLabel ?? null);
  };

  const registerAnswer = (isCorrect: boolean) => {
    if (isCorrect) {
      setScore((currentScore) => currentScore + 1);
    }
  };

  const goToNextQuestion = () => {
    const nextQuestionIndex = currentQuestionIndex + 1;

    if (nextQuestionIndex < questions.length) {
      setCurrentQuestionIndex(nextQuestionIndex);
      return true;
    }

    setCurrentQuestionIndex(nextQuestionIndex);
    setIsComplete(true);
    return false;
  };

  const restartQuiz = () => {
    if (!questions.length) {
      return;
    }

    setCurrentQuestionIndex(0);
    setScore(0);
    setIsComplete(false);
  };

  const resetQuiz = () => {
    setQuestions([]);
    setCurrentQuestionIndex(0);
    setScore(0);
    setChapterId(null);
    setSubjectId(null);
    setUserId(DEFAULT_QUIZ_USER_ID);
    setIsComplete(false);
    setQuizMode('chapter');
    setQuizLabel(null);
  };

  return (
    <QuizContext.Provider
      value={{
        questions,
        currentQuestionIndex,
        score,
        chapterId,
        subjectId,
        userId,
        isComplete,
        quizMode,
        quizLabel,
        startQuiz,
        registerAnswer,
        goToNextQuestion,
        restartQuiz,
        resetQuiz,
      }}
    >
      {children}
    </QuizContext.Provider>
  );
}

export function useQuiz() {
  const context = useContext(QuizContext);

  if (!context) {
    throw new Error('useQuiz must be used within a QuizProvider');
  }

  return context;
}
