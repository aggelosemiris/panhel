import React, { useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getSubjectById } from '../../config/curricula';

export default function TestPage() {
  const { subjectID, chapterID, tier } = useParams<{
    subjectID: string;
    chapterID: string;
    tier: string;
  }>();
  const navigate = useNavigate();

  const subject = useMemo(() => {
    return subjectID ? getSubjectById(subjectID) : undefined;
  }, [subjectID]);

  const chapter = subject?.chapters.find((item) => item.id === chapterID);

  if (!subject || !chapter) {
    return (
      <div className="module-b-page">
        <div className="module-b-hero">
          <h1>Δεν βρέθηκε δοκιμή</h1>
          <button className="module-b-back-button" onClick={() => navigate('/tests/chapter')}>
            ← Επιστροφή
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="module-b-page">
      <div className="module-b-hero">
        <button className="module-b-back-button" onClick={() => navigate(`/tests/chapter/${subject.id}`)}>
          ← Πίσω στα κεφάλαια
        </button>
        <h1>
          {subject.emoji} {subject.greekName}
        </h1>
        <p>
          Δοκιμή για το {chapter.title} με δυσκολία <strong>{tier}</strong>.
        </p>
      </div>

      <div className="module-b-group-card">
        <h2>Επιλεγμένο κεφάλαιο</h2>
        <p>
          Κεφάλαιο {chapter.number}: {chapter.title}
        </p>
        {chapter.sections.length > 0 && (
          <div className="module-b-section-list">
            {chapter.sections.map((section) => (
              <div key={section.id} className="module-b-section-item">
                <span className="module-b-section-number">{section.number}</span>
                <span>{section.title}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
