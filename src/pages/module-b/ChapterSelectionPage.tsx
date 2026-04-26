import React, { useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getSubjectById } from '../../config/curricula';

export default function ChapterSelectionPage() {
  const { subjectID } = useParams<{ subjectID: string }>();
  const navigate = useNavigate();
  const [expandedChapter, setExpandedChapter] = useState<string | null>(null);

  const subject = useMemo(() => {
    return subjectID ? getSubjectById(subjectID) : undefined;
  }, [subjectID]);

  if (!subject) {
    return (
      <div className="module-b-page">
        <div className="module-b-hero">
          <h1>Το μάθημα δεν βρέθηκε</h1>
          <button className="module-b-back-button" onClick={() => navigate('/tests/chapter')}>
            ← Επιστροφή στα μαθήματα
          </button>
        </div>
      </div>
    );
  }

  const chapterGroups = subject.chapterGroups ?? [
    {
      id: `${subject.id}-default-group`,
      title: `${subject.emoji} ${subject.greekName}`,
      chapters: subject.chapters,
    },
  ];

  return (
    <div className="module-b-page">
      <div className="module-b-hero">
        <button className="module-b-back-button" onClick={() => navigate('/tests/chapter')}>
          ← Πίσω στα μαθήματα
        </button>
        <h1>
          {subject.emoji} {subject.greekName}
        </h1>
        <p>Επίλεξε κεφάλαιο για να δεις τις διαθέσιμες ενότητες.</p>
      </div>

      <div className="module-b-groups">
        {chapterGroups.map((group) => (
          <section key={group.id} className="module-b-group-card">
            {subject.chapterGroups && (
              <div className="module-b-group-header">
                <h2>{group.title}</h2>
                {group.description && <p>{group.description}</p>}
              </div>
            )}

            <div className="module-b-chapter-list">
              {group.chapters.map((chapter) => {
                const isExpanded = expandedChapter === chapter.id;

                return (
                  <article
                    key={chapter.id}
                    className="module-b-chapter-card"
                    style={{ borderLeftColor: subject.color }}
                  >
                    <button
                      className="module-b-chapter-toggle"
                      onClick={() => setExpandedChapter(isExpanded ? null : chapter.id)}
                    >
                      <div>
                        <span className="module-b-chapter-number">Κεφάλαιο {chapter.number}</span>
                        <h3>{chapter.title}</h3>
                      </div>
                      <span className={`module-b-expand-icon ${isExpanded ? 'expanded' : ''}`}>▼</span>
                    </button>

                    {isExpanded && (
                      <div className="module-b-section-panel">
                        {chapter.sections.length > 0 ? (
                          <div className="module-b-section-list">
                            {chapter.sections.map((section) => (
                              <button
                                key={section.id}
                                className="module-b-section-item"
                                onClick={() => navigate(`/tests/chapter/${subject.id}/${chapter.id}/easy`)}
                              >
                                <span className="module-b-section-number">{section.number}</span>
                                <span>{section.title}</span>
                              </button>
                            ))}
                          </div>
                        ) : (
                          <div className="module-b-empty-sections">
                            Δεν έχουν προστεθεί επιμέρους ενότητες για αυτό το κεφάλαιο.
                          </div>
                        )}

                        <div className="module-b-actions">
                          <button onClick={() => navigate(`/tests/chapter/${subject.id}/${chapter.id}/easy`)}>
                            Εύκολη δυσκολία
                          </button>
                          <button onClick={() => navigate(`/tests/chapter/${subject.id}/${chapter.id}/normal`)}>
                            Κανονική δυσκολία
                          </button>
                          <button onClick={() => navigate(`/tests/chapter/${subject.id}/${chapter.id}/hard`)}>
                            Δύσκολη δυσκολία
                          </button>
                        </div>
                      </div>
                    )}
                  </article>
                );
              })}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
