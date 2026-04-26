import React, { useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import SubjectSelector from '../components/SubjectSelector.tsx';
import { getSubjectById, type Chapter, type ChapterGroup } from '../config/curricula.ts';
import { getTrueFalseQuestions } from '../config/trueFalseQuiz.ts';
import { useAuth } from '../context/AuthContext.tsx';
import { DEFAULT_QUIZ_USER_ID, useQuiz } from '../context/QuizContext.tsx';

type SubjectCode = 'MATH' | 'AOTh' | 'AEPP';

const SUBJECT_ID_MAP: Record<SubjectCode, string> = {
  MATH: 'math',
  AOTh: 'aoth',
  AEPP: 'aepp',
};

function buildChapterGroups(subjectCode: SubjectCode): ChapterGroup[] {
  const subject = getSubjectById(SUBJECT_ID_MAP[subjectCode]);

  if (!subject) {
    return [];
  }

  if (subject.chapterGroups?.length) {
    return subject.chapterGroups;
  }

  return [
    {
      id: `${subject.id}-default`,
      title: subject.greekName,
      chapters: subject.chapters,
    },
  ];
}

function ChapterButton({
  chapter,
  available,
  onSelect,
}: {
  chapter: Chapter;
  available: boolean;
  onSelect: () => void;
}) {
  return (
    <button className="generator-chapter-card theory-quiz-chapter-card" onClick={onSelect} type="button">
      <span>{`Κεφάλαιο ${chapter.number}`}</span>
      <strong>{chapter.title}</strong>
      <small className={available ? 'theory-quiz-available' : 'theory-quiz-missing'}>
        {available ? 'Ξεκίνα Σ/Λ' : 'Δεν έχει προστεθεί ακόμη'}
      </small>
    </button>
  );
}

export default function TrueFalsePage() {
  const navigate = useNavigate();
  const { subjectID } = useParams<{ subjectID: string }>();
  const [selectedSubject, setSelectedSubject] = useState<SubjectCode | null>(null);
  const { resetQuiz, startQuiz } = useQuiz();
  const { currentUser } = useAuth();

  const resolvedSubjectId = subjectID ?? (selectedSubject ? SUBJECT_ID_MAP[selectedSubject] : null);
  const subject = resolvedSubjectId ? getSubjectById(resolvedSubjectId) : undefined;

  const chapterGroups = useMemo(() => {
    if (selectedSubject) {
      return buildChapterGroups(selectedSubject);
    }

    if (!resolvedSubjectId) {
      return [];
    }

    if (resolvedSubjectId === 'math') {
      return buildChapterGroups('MATH');
    }

    if (resolvedSubjectId === 'aoth') {
      return buildChapterGroups('AOTh');
    }

    return buildChapterGroups('AEPP');
  }, [resolvedSubjectId, selectedSubject]);

  if (!resolvedSubjectId) {
    return (
      <SubjectSelector
        onSelect={(subjectCode) => {
          setSelectedSubject(subjectCode);
          navigate(`/true-false/${SUBJECT_ID_MAP[subjectCode]}`);
        }}
      />
    );
  }

  if (!subject) {
    return (
      <div className="simple-module-page">
        <div className="module-b-hero">
          <h1>Το μάθημα δεν βρέθηκε</h1>
          <button className="module-b-back-button" onClick={() => navigate('/true-false')} type="button">
            ← Επιστροφή στα μαθήματα
          </button>
        </div>
      </div>
    );
  }

  const userId = currentUser?.id ?? DEFAULT_QUIZ_USER_ID;

  const handleChapterSelect = (chapter: Chapter) => {
    const questions = getTrueFalseQuestions(chapter.id);

    if (questions.length === 0) {
      resetQuiz();
      navigate(`/true-false/${subject.id}/${chapter.id}`);
      return;
    }

    startQuiz({
      questions,
      chapterId: chapter.id,
      subjectId: subject.id,
      userId,
      quizMode: 'chapter',
      quizLabel: `Σωστό / Λάθος · Κεφάλαιο ${chapter.number}`,
    });

    navigate(`/true-false/${subject.id}/${chapter.id}`);
  };

  return (
    <div className="simple-module-page">
      <div className="module-b-hero">
        <button className="module-b-back-button" onClick={() => navigate('/true-false')} type="button">
          ← Πίσω στα μαθήματα
        </button>
        <h1>Σωστό / Λάθος</h1>
        <p>Επίλεξε κεφάλαιο και θα λυθείς ερώτηση-ερώτηση μόνο με απαντήσεις Σωστό ή Λάθος.</p>
      </div>

      <section className="generator-panel">
        <h2>{`${subject.emoji} ${subject.greekName}`}</h2>
        <div className="generator-chapter-groups">
          {chapterGroups.map((group) => (
            <div key={group.id} className="generator-chapter-group">
              <h3>{group.title}</h3>
              <div className="generator-chapter-list">
                {group.chapters.map((chapter) => (
                  <ChapterButton
                    key={chapter.id}
                    chapter={chapter}
                    available={getTrueFalseQuestions(chapter.id).length > 0}
                    onSelect={() => handleChapterSelect(chapter)}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
