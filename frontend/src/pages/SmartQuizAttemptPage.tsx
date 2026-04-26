import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getSubjectById } from '../config/curricula.ts';
import { normalizeQuizText } from '../config/theoryQuiz.ts';
import { useQuiz } from '../context/QuizContext.tsx';
import { updateStudentStats } from '../services/studentStats.ts';

type QuizStatus = 'correct' | 'wrong' | null;

export default function SmartQuizAttemptPage() {
  const navigate = useNavigate();
  const { subjectID } = useParams<{ subjectID: string }>();
  const subject = useMemo(() => (subjectID ? getSubjectById(subjectID) : undefined), [subjectID]);
  const {
    questions,
    currentQuestionIndex,
    subjectId,
    userId,
    isComplete,
    quizMode,
    quizLabel,
    registerAnswer,
    goToNextQuestion,
  } = useQuiz();

  const [selectedOption, setSelectedOption] = useState('');
  const [status, setStatus] = useState<QuizStatus>(null);
  const [showAnswer, setShowAnswer] = useState(false);
  const [hasVerifiedCurrentQuestion, setHasVerifiedCurrentQuestion] = useState(false);
  const [isSubmittingAnswer, setIsSubmittingAnswer] = useState(false);

  const activeQuestion = questions[currentQuestionIndex];
  const activeChapter = subject?.chapters.find((chapter) => chapter.id === activeQuestion?.chapterId);
  const isActiveQuizSession = Boolean(
    subjectID && subjectId === subjectID && quizMode === 'smart' && questions.length > 0,
  );

  useEffect(() => {
    setSelectedOption('');
    setStatus(null);
    setShowAnswer(false);
    setHasVerifiedCurrentQuestion(false);
    setIsSubmittingAnswer(false);
  }, [currentQuestionIndex, subjectID]);

  useEffect(() => {
    if (isComplete && isActiveQuizSession && subjectID) {
      navigate(`/theory-quiz/${subjectID}/smart/result`, { replace: true });
    }
  }, [isActiveQuizSession, isComplete, navigate, subjectID]);

  if (!subject) {
    return (
      <div className="simple-module-page">
        <div className="module-b-hero">
          <h1>Το quiz δεν βρέθηκε</h1>
          <button className="module-b-back-button" onClick={() => navigate('/theory-quiz')} type="button">
            ← Επιστροφή
          </button>
        </div>
      </div>
    );
  }

  if (!isActiveQuizSession || !activeQuestion) {
    return (
      <div className="simple-module-page">
        <div className="module-b-hero">
          <button className="module-b-back-button" onClick={() => navigate(`/theory-quiz/${subject.id}`)} type="button">
            ← Πίσω στα κεφάλαια
          </button>
          <h1>{`${subject.emoji} ${subject.greekName}`}</h1>
          <p>Το Smart Quiz δεν ξεκίνησε σωστά.</p>
        </div>
        <div className="generator-panel theory-quiz-result-card">
          <h2>Δεν υπάρχει ενεργό smart quiz session.</h2>
          <p>Ξεκίνα ξανά το Smart Quiz από τη σελίδα μαθημάτων για να δημιουργηθεί νέα σειρά ερωτήσεων.</p>
          <div className="theory-quiz-result-actions">
            <button className="generator-next-button" onClick={() => navigate(`/theory-quiz/${subject.id}`)} type="button">
              Επιστροφή στα κεφάλαια
            </button>
          </div>
        </div>
      </div>
    );
  }

  const handleVerify = async () => {
    if (!activeQuestion || hasVerifiedCurrentQuestion || isSubmittingAnswer) {
      return;
    }

    const isCorrect = selectedOption === activeQuestion.answer;
    setIsSubmittingAnswer(true);

    try {
      await updateStudentStats({
        userId,
        subject: activeQuestion.subjectId ?? subject.id,
        chapterId: activeQuestion.chapterId ?? 'smart-quiz',
        questionId: activeQuestion.id ?? `${subject.id}-smart-${currentQuestionIndex + 1}`,
        isCorrect,
      });
    } catch {
      // The quiz should continue even if stats syncing fails.
    }

    registerAnswer(isCorrect);
    setStatus(isCorrect ? 'correct' : 'wrong');
    setHasVerifiedCurrentQuestion(true);
    if (isCorrect) {
      setShowAnswer(false);
    }
    setIsSubmittingAnswer(false);
  };

  const handleContinue = () => {
    if (!subjectID) {
      return;
    }

    const hasNextQuestion = goToNextQuestion();

    if (!hasNextQuestion) {
      navigate(`/theory-quiz/${subjectID}/smart/result`);
    }
  };

  return (
    <div className="simple-module-page">
      <div className="module-b-hero">
        <button className="module-b-back-button" onClick={() => navigate(`/theory-quiz/${subject.id}`)} type="button">
          ← Πίσω στα κεφάλαια
        </button>
        <h1>{quizLabel ?? `Smart Quiz - ${subject.greekName}`}</h1>
        <p>
          {`Ερώτηση ${currentQuestionIndex + 1}/${questions.length}`}
          {activeChapter ? ` · Κεφάλαιο ${activeChapter.number}: ${activeChapter.title}` : ''}
        </p>
      </div>

      <div className="generator-panel theory-quiz-center-panel">
        <div className="theory-quiz-card">
          <h3>{normalizeQuizText(activeQuestion.prompt)}</h3>

          <div className="theory-quiz-options">
            {activeQuestion.options.map((option) => (
              <label key={option} className={`theory-quiz-option selectable ${selectedOption === option ? 'selected' : ''}`}>
                <input
                  type="radio"
                  name="smart-theory-option"
                  checked={selectedOption === option}
                  onChange={() => {
                    if (hasVerifiedCurrentQuestion) {
                      return;
                    }

                    setSelectedOption(option);
                    setStatus(null);
                    setShowAnswer(false);
                  }}
                  disabled={hasVerifiedCurrentQuestion || isSubmittingAnswer}
                />
                <span>{normalizeQuizText(option)}</span>
              </label>
            ))}
          </div>

          <div className="theory-quiz-footer centered">
            {!hasVerifiedCurrentQuestion ? (
              <button
                className="generator-next-button theory-quiz-verify-button"
                disabled={!selectedOption || isSubmittingAnswer}
                onClick={handleVerify}
                type="button"
              >
                {isSubmittingAnswer ? 'Αποθήκευση...' : 'Επαλήθευση'}
              </button>
            ) : null}
          </div>

          {status === 'correct' && (
            <div className="theory-quiz-feedback correct">
              <strong>Σωστό, μπορείς να προχωρήσεις.</strong>
              <div className="theory-quiz-feedback-actions">
                <button className="generator-next-button" onClick={handleContinue} type="button">
                  Συνέχεια
                </button>
              </div>
            </div>
          )}

          {status === 'wrong' && (
            <div className="theory-quiz-feedback wrong">
              <strong>Λάθος, θες να δεις την απάντηση;</strong>
              <div className="theory-quiz-feedback-actions">
                <button
                  className="generator-next-button theory-quiz-secondary-button"
                  onClick={() => setShowAnswer((value) => !value)}
                  type="button"
                >
                  {showAnswer ? 'Κλείσε απάντηση' : 'Δες απάντηση'}
                </button>
                <button className="generator-next-button" onClick={handleContinue} type="button">
                  Συνέχεια
                </button>
              </div>
            </div>
          )}

          {showAnswer && (
            <div className="theory-quiz-answer">
              <strong>Σωστή απάντηση:</strong>
              <p>{normalizeQuizText(activeQuestion.answer)}</p>
              {activeQuestion.explanation && <p>{normalizeQuizText(activeQuestion.explanation)}</p>}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
