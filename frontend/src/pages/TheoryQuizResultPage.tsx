import React, { useEffect, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getSubjectById } from '../config/curricula.ts';
import { THEORY_QUIZ_DATA } from '../config/theoryQuiz.ts';
import { useQuiz } from '../context/QuizContext.tsx';

export default function TheoryQuizResultPage() {
  const navigate = useNavigate();
  const { subjectID, chapterID } = useParams<{ subjectID: string; chapterID: string }>();
  const { questions, score, chapterId, subjectId, isComplete, restartQuiz } = useQuiz();

  const subject = useMemo(() => (subjectID ? getSubjectById(subjectID) : undefined), [subjectID]);
  const chapter = subject?.chapters.find((item) => item.id === chapterID);
  const chapterHasQuiz = Boolean(chapterID && THEORY_QUIZ_DATA[chapterID]);
  const matchesActiveQuiz = subjectId === subjectID && chapterId === chapterID && questions.length > 0;

  useEffect(() => {
    if (matchesActiveQuiz && !isComplete && subjectID && chapterID) {
      navigate(`/theory-quiz/${subjectID}/${chapterID}`, { replace: true });
    }
  }, [chapterID, isComplete, matchesActiveQuiz, navigate, subjectID]);

  if (!subject || !chapter) {
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

  if (!chapterHasQuiz) {
    return (
      <div className="simple-module-page">
        <div className="module-b-hero">
          <button className="module-b-back-button" onClick={() => navigate(`/theory-quiz/${subject.id}`)} type="button">
            ← Πίσω στα κεφάλαια
          </button>
          <h1>{`${subject.emoji} ${subject.greekName}`}</h1>
          <p>{`Κεφάλαιο ${chapter.number}: ${chapter.title}`}</p>
        </div>
        <div className="generator-panel theory-quiz-result-card">
          <h2>Δεν έχει προστεθεί ακόμα quiz για αυτό το κεφάλαιο.</h2>
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
          <p>{`Κεφάλαιο ${chapter.number}: ${chapter.title}`}</p>
        </div>
        <div className="generator-panel theory-quiz-result-card">
          <h2>Δεν υπάρχει ολοκληρωμένο quiz session.</h2>
          <p>Ξεκίνα ξανά το quiz από τη λίστα κεφαλαίων για να δεις σωστό αποτέλεσμα.</p>
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
    navigate(`/theory-quiz/${subject.id}/${chapter.id}`);
  };

  return (
    <div className="simple-module-page">
      <div className="module-b-hero">
        <button className="module-b-back-button" onClick={() => navigate(`/theory-quiz/${subject.id}`)} type="button">
          ← Πίσω στα κεφάλαια
        </button>
        <h1>Αποτέλεσμα Quiz</h1>
        <p>{`${subject.emoji} ${subject.greekName} · Κεφάλαιο ${chapter.number}`}</p>
      </div>

      <div className="generator-panel theory-quiz-result-card">
        <h2>{`Score: ${score}/${questions.length}`}</h2>
        <p>{`Ολοκλήρωσες όλες τις ερωτήσεις του quiz για το κεφάλαιο ${chapter.number}.`}</p>
        <div className="theory-quiz-result-actions">
          <button
            className="generator-next-button theory-quiz-secondary-button"
            onClick={() => navigate(`/theory-quiz/${subject.id}`)}
            type="button"
          >
            Συνέχεια
          </button>
          <button className="generator-next-button" onClick={handleRestart} type="button">
            Ξανά το ίδιο quiz
          </button>
        </div>
      </div>
    </div>
  );
}
