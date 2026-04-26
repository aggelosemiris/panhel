import React, { useEffect, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getSubjectById } from '../config/curricula.ts';
import { useQuiz } from '../context/QuizContext.tsx';

export default function SmartQuizResultPage() {
  const navigate = useNavigate();
  const { subjectID } = useParams<{ subjectID: string }>();
  const { questions, score, subjectId, isComplete, restartQuiz, quizMode, quizLabel } = useQuiz();
  const subject = useMemo(() => (subjectID ? getSubjectById(subjectID) : undefined), [subjectID]);
  const matchesActiveQuiz = subjectId === subjectID && quizMode === 'smart' && questions.length > 0;

  useEffect(() => {
    if (matchesActiveQuiz && !isComplete && subjectID) {
      navigate(`/theory-quiz/${subjectID}/smart`, { replace: true });
    }
  }, [isComplete, matchesActiveQuiz, navigate, subjectID]);

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

  if (!matchesActiveQuiz || !isComplete) {
    return (
      <div className="simple-module-page">
        <div className="module-b-hero">
          <button className="module-b-back-button" onClick={() => navigate(`/theory-quiz/${subject.id}`)} type="button">
            ← Πίσω στα κεφάλαια
          </button>
          <h1>{`${subject.emoji} ${subject.greekName}`}</h1>
          <p>Δεν υπάρχει ολοκληρωμένο Smart Quiz.</p>
        </div>
        <div className="generator-panel theory-quiz-result-card">
          <h2>Ξεκίνα ξανά ένα Smart Quiz για να δεις αποτέλεσμα.</h2>
          <div className="theory-quiz-result-actions">
            <button className="generator-next-button" onClick={() => navigate(`/theory-quiz/${subject.id}`)} type="button">
              Επιστροφή στα κεφάλαια
            </button>
          </div>
        </div>
      </div>
    );
  }

  const handleRestart = () => {
    restartQuiz();
    navigate(`/theory-quiz/${subject.id}/smart`);
  };

  return (
    <div className="simple-module-page">
      <div className="module-b-hero">
        <button className="module-b-back-button" onClick={() => navigate(`/theory-quiz/${subject.id}`)} type="button">
          ← Πίσω στα κεφάλαια
        </button>
        <h1>Αποτέλεσμα Smart Quiz</h1>
        <p>{quizLabel ?? `${subject.emoji} ${subject.greekName}`}</p>
      </div>

      <div className="generator-panel theory-quiz-result-card">
        <h2>{`Score: ${score}/${questions.length}`}</h2>
        <p>Ολοκλήρωσες όλο το adaptive set των 10 ερωτήσεων με βάση τα στατιστικά προόδου σου.</p>
        <div className="theory-quiz-result-actions">
          <button
            className="generator-next-button theory-quiz-secondary-button"
            onClick={() => navigate(`/theory-quiz/${subject.id}`)}
            type="button"
          >
            Συνέχεια
          </button>
          <button className="generator-next-button" onClick={handleRestart} type="button">
            Ξανά Smart Quiz
          </button>
        </div>
      </div>
    </div>
  );
}
