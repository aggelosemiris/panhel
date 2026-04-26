import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getSubjectById } from '../config/curricula.ts';
import { getTrueFalseQuestions } from '../config/trueFalseQuiz.ts';
import { normalizeQuizText } from '../config/theoryQuiz.ts';
import { useQuiz } from '../context/QuizContext.tsx';
import { updateStudentStats } from '../services/studentStats.ts';

type QuizStatus = 'correct' | 'wrong' | null;

export default function TrueFalseAttemptPage() {
  const navigate = useNavigate();
  const { subjectID, chapterID } = useParams<{ subjectID: string; chapterID: string }>();
  const subject = useMemo(() => (subjectID ? getSubjectById(subjectID) : undefined), [subjectID]);
  const chapter = subject?.chapters.find((item) => item.id === chapterID);
  const {
    questions,
    currentQuestionIndex,
    chapterId,
    subjectId,
    userId,
    isComplete,
    registerAnswer,
    goToNextQuestion,
  } = useQuiz();

  const [selectedOption, setSelectedOption] = useState('');
  const [status, setStatus] = useState<QuizStatus>(null);
  const [showAnswer, setShowAnswer] = useState(false);
  const [hasVerifiedCurrentQuestion, setHasVerifiedCurrentQuestion] = useState(false);
  const [isSubmittingAnswer, setIsSubmittingAnswer] = useState(false);

  const activeQuestion = questions[currentQuestionIndex];
  const chapterHasQuiz = Boolean(chapterID && getTrueFalseQuestions(chapterID).length > 0);
  const isActiveQuizSession = Boolean(
    subjectID && chapterID && subjectId === subjectID && chapterId === chapterID && questions.length > 0,
  );

  useEffect(() => {
    setSelectedOption('');
    setStatus(null);
    setShowAnswer(false);
    setHasVerifiedCurrentQuestion(false);
    setIsSubmittingAnswer(false);
  }, [currentQuestionIndex, subjectID, chapterID]);

  useEffect(() => {
    if (isComplete && isActiveQuizSession && subjectID && chapterID) {
      navigate(`/true-false/${subjectID}/${chapterID}/result`, { replace: true });
    }
  }, [chapterID, isActiveQuizSession, isComplete, navigate, subjectID]);

  if (!subject || !chapter) {
    return (
      <div className="simple-module-page">
        <div className="module-b-hero">
          <h1>Το Σ/Λ δεν βρέθηκε</h1>
          <button className="module-b-back-button" onClick={() => navigate('/true-false')} type="button">
            ← Επιστροφή
          </button>
        </div>
      </div>
    );
  }

  if (!chapterHasQuiz) {
    return (
      <div className="simple-module-page">
        <div className="module-b-hero">
          <button className="module-b-back-button" onClick={() => navigate(`/true-false/${subject.id}`)} type="button">
            ← Πίσω στα κεφάλαια
          </button>
          <h1>{`${subject.emoji} ${subject.greekName}`}</h1>
          <p>{`Κεφάλαιο ${chapter.number}: ${chapter.title}`}</p>
        </div>
        <div className="generator-panel theory-quiz-center-panel">
          <h2>Δεν έχει προστεθεί ακόμη Σ/Λ για αυτό το κεφάλαιο.</h2>
        </div>
      </div>
    );
  }

  if (!isActiveQuizSession || !activeQuestion) {
    return (
      <div className="simple-module-page">
        <div className="module-b-hero">
          <button className="module-b-back-button" onClick={() => navigate(`/true-false/${subject.id}`)} type="button">
            ← Πίσω στα κεφάλαια
          </button>
          <h1>{`${subject.emoji} ${subject.greekName}`}</h1>
          <p>{`Κεφάλαιο ${chapter.number}: ${chapter.title}`}</p>
        </div>
        <div className="generator-panel theory-quiz-result-card">
          <h2>Το Σ/Λ δεν ξεκίνησε σωστά.</h2>
          <p>Επίλεξε ξανά το κεφάλαιο για να δημιουργηθεί νέο session με όλες τις ερωτήσεις.</p>
          <div className="theory-quiz-result-actions">
            <button className="generator-next-button" onClick={() => navigate(`/true-false/${subject.id}`)} type="button">
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
        chapterId: activeQuestion.chapterId ?? chapter.id,
        questionId: activeQuestion.id ?? `${chapter.id}-tf-q${currentQuestionIndex + 1}`,
        isCorrect,
      });
    } catch {
      // Continue even if stats sync fails.
    }

    registerAnswer(isCorrect);
    setStatus(isCorrect ? 'correct' : 'wrong');
    setHasVerifiedCurrentQuestion(true);
    setIsSubmittingAnswer(false);

    if (isCorrect) {
      setShowAnswer(false);
    }
  };

  const handleContinue = () => {
    if (!subjectID || !chapterID) {
      return;
    }

    const hasNextQuestion = goToNextQuestion();

    if (!hasNextQuestion) {
      navigate(`/true-false/${subjectID}/${chapterID}/result`);
    }
  };

  return (
    <div className="simple-module-page">
      <div className="module-b-hero">
        <button className="module-b-back-button" onClick={() => navigate(`/true-false/${subject.id}`)} type="button">
          ← Πίσω στα κεφάλαια
        </button>
        <h1>{`${subject.emoji} ${subject.greekName}`}</h1>
        <p>{`Κεφάλαιο ${chapter.number}: ${chapter.title} · Ερώτηση ${currentQuestionIndex + 1}/${questions.length}`}</p>
      </div>

      <div className="generator-panel theory-quiz-center-panel">
        <div className="theory-quiz-card">
          <h3>{normalizeQuizText(activeQuestion.prompt)}</h3>

          <div className="theory-quiz-options">
            {activeQuestion.options.map((option) => (
              <label key={option} className={`theory-quiz-option selectable ${selectedOption === option ? 'selected' : ''}`}>
                <input
                  type="radio"
                  name="true-false-option"
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
