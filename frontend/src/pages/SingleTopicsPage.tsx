import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import SubjectSelector from '../components/SubjectSelector.tsx';
import SingleTopicCorrectionPanel from '../components/SingleTopicCorrectionPanel.tsx';
import PdfAiExplainPanel from '../components/PdfAiExplainPanel.tsx';
import { getSingleTopicPdfs } from '../config/singleTopics.ts';
import { getSubjectById, type Chapter, type Section } from '../config/curricula.ts';

type SubjectCode = 'MATH' | 'AOTh' | 'AEPP';

const SUBJECT_ROUTE_MAP: Record<SubjectCode, string> = {
  MATH: 'math',
  AOTh: 'aoth',
  AEPP: 'aepp',
};

const SUBJECT_LABELS: Record<string, string> = {
  math: 'Μαθηματικά',
  aoth: 'Αρχές Οικονομικής Θεωρίας (ΑΟΘ)',
  aepp: 'Ανάπτυξη Εφαρμογών σε Προγραμματιστικό Περιβάλλον (ΑΕΠΠ)',
};

const TOPIC_OPTIONS = [
  {
    key: 'topic-a',
    title: 'Μόνο Θέμα Α',
    description: 'Στοχευμένη εξάσκηση αποκλειστικά σε θέματα τύπου Α.',
  },
  {
    key: 'topic-b',
    title: 'Μόνο Θέμα Β',
    description: 'Στοχευμένη εξάσκηση αποκλειστικά σε θέματα τύπου Β.',
  },
  {
    key: 'topic-c',
    title: 'Μόνο Θέμα Γ',
    description: 'Στοχευμένη εξάσκηση αποκλειστικά σε θέματα τύπου Γ.',
  },
  {
    key: 'topic-d',
    title: 'Μόνο Θέμα Δ',
    description: 'Στοχευμένη εξάσκηση αποκλειστικά σε θέματα τύπου Δ.',
  },
];

const TOPIC_DETAIL_COPY: Record<string, { title: string; description: string }> = {
  'topic-a': {
    title: 'Μόνο Θέμα Α',
    description: 'Ανέβασε τη λύση σου για αυτό το μεμονωμένο θέμα και η εφαρμογή θα την διορθώσει αυτόματα.',
  },
  'topic-b': {
    title: 'Μόνο Θέμα Β',
    description: 'Ανέβασε τη λύση σου για αυτό το μεμονωμένο θέμα και η εφαρμογή θα την διορθώσει αυτόματα.',
  },
  'topic-c': {
    title: 'Μόνο Θέμα Γ',
    description: 'Ανέβασε τη λύση σου για αυτό το μεμονωμένο θέμα και η εφαρμογή θα την διορθώσει αυτόματα.',
  },
  'topic-d': {
    title: 'Μόνο Θέμα Δ',
    description: 'Ανέβασε τη λύση σου για αυτό το μεμονωμένο θέμα και η εφαρμογή θα την διορθώσει αυτόματα.',
  },
};

type SectionButtonGroup = {
  id: string;
  number: string;
  title: string;
  sections: Section[];
};

const MATH_SINGLE_TOPIC_SECTION_GROUPS: Record<string, string[][]> = {
  'math-1': [
    ['math-1-1', 'math-1-2'],
    ['math-1-3'],
    ['math-1-4', 'math-1-5', 'math-1-6', 'math-1-7'],
    ['math-1-8'],
  ],
  'math-2': [
    ['math-2-1', 'math-2-2'],
    ['math-2-3'],
    ['math-2-4'],
    ['math-2-5', 'math-2-6'],
    ['math-2-7', 'math-2-8', 'math-2-9', 'math-2-10'],
  ],
};

function buildSectionButtonGroup(sections: Section[]): SectionButtonGroup {
  const first = sections[0];
  const last = sections[sections.length - 1];
  const number = sections.length === 1 ? first.number : `${first.number} - ${last.number}`;

  return {
    id: sections.map((section) => section.id).join('__'),
    number,
    title: sections.map((section) => section.title).join(' / '),
    sections,
  };
}

function getGreekOrdinal(index: number): string {
  return `${index + 1}η υποενότητα`;
}

function getSingleTopicSectionGroups(subjectId: string, chapter: Chapter): SectionButtonGroup[] {
  const configuredGroups = subjectId === 'math' ? MATH_SINGLE_TOPIC_SECTION_GROUPS[chapter.id] : undefined;

  if (!configuredGroups) {
    return chapter.sections.map((section) => buildSectionButtonGroup([section]));
  }

  const sectionsById = new Map(chapter.sections.map((section) => [section.id, section]));

  return configuredGroups
    .map((sectionIds) => sectionIds.map((sectionId) => sectionsById.get(sectionId)).filter(Boolean) as Section[])
    .filter((sections) => sections.length > 0)
    .map(buildSectionButtonGroup);
}

export default function SingleTopicsPage() {
  const navigate = useNavigate();
  const { subjectID, topicKey } = useParams();
  const [expandedChapter, setExpandedChapter] = useState<string | null>(null);
  const pdfItems = useMemo(
    () => (subjectID && topicKey ? getSingleTopicPdfs(subjectID, topicKey) : []),
    [subjectID, topicKey],
  );
  const selectedSubject = useMemo(
    () => (subjectID ? getSubjectById(subjectID) : undefined),
    [subjectID],
  );
  const [selectedPdfPath, setSelectedPdfPath] = useState<string | null>(null);
  const [isPdfFullscreen, setIsPdfFullscreen] = useState(false);
  const selectedPdf = useMemo(
    () => pdfItems.find((item) => item.pdfPath === selectedPdfPath),
    [pdfItems, selectedPdfPath],
  );

  useEffect(() => {
    setSelectedPdfPath(pdfItems[0]?.pdfPath ?? null);
    setIsPdfFullscreen(false);
  }, [pdfItems]);

  const handleSelect = (subject: SubjectCode) => {
    navigate(`/single-topics/${SUBJECT_ROUTE_MAP[subject]}`);
  };

  if (!subjectID) {
    return <SubjectSelector onSelect={handleSelect} />;
  }

  if (subjectID && topicKey) {
    const topicCopy = TOPIC_DETAIL_COPY[topicKey];

    return (
      <div className="simple-module-page subject-module-page">
        <div className="module-b-hero">
          <button className="module-b-back-button" onClick={() => navigate(`/single-topics/${subjectID}`)}>
            ← Πίσω στις ασκήσεις
          </button>
          <h1>{topicCopy?.title ?? topicKey}</h1>
          <p>
            Επιλεγμένο μάθημα: <strong>{SUBJECT_LABELS[subjectID] ?? subjectID}</strong>
          </p>
        </div>

        <section className="generator-panel subject-module-panel">
          <h2>{topicCopy?.title ?? topicKey}</h2>
          <p>{topicCopy?.description ?? 'Ανέβασε τη λύση σου και διόρθωσέ την αυτόματα.'}</p>
        </section>

        <section className="generator-panel subject-module-panel">
          <h2>Διαθέσιμα PDF</h2>
          {pdfItems.length === 0 ? (
            <p>Δεν έχουν προστεθεί ακόμη αρχεία για αυτό το θέμα.</p>
          ) : (
            <div className="single-topic-library-layout">
              <div className="single-topic-library-grid">
                {pdfItems.map((item) => (
                  <button
                    key={item.id}
                    className={`generator-chapter-card single-topic-pdf-card ${selectedPdfPath === item.pdfPath ? 'selected' : ''}`}
                    onClick={() => setSelectedPdfPath(item.pdfPath)}
                    type="button"
                  >
                    <strong>{item.title}</strong>
                    <span>Άνοιγμα PDF</span>
                  </button>
                ))}
              </div>

              {selectedPdfPath ? (
                <div className={`module-d-pdf-shell ${isPdfFullscreen ? 'fullscreen' : ''}`}>
                  <div className="module-d-pdf-toolbar">
                    <a className="module-d-toolbar-button" href={selectedPdfPath} rel="noreferrer" target="_blank">
                      Άνοιγμα σε νέο tab
                    </a>
                    <button className="module-d-toolbar-button" onClick={() => setIsPdfFullscreen((current) => !current)} type="button">
                      {isPdfFullscreen ? 'Έξοδος full screen' : 'Full screen'}
                    </button>
                  </div>
                  <iframe className="module-d-pdf-frame" src={selectedPdfPath} title={topicCopy?.title ?? topicKey} />
                  <PdfAiExplainPanel
                    title={selectedPdf?.title ?? topicCopy?.title ?? topicKey}
                    pdfPath={selectedPdfPath}
                    subjectHint={`${subjectID} / ${topicKey}`}
                  />
                </div>
              ) : null}
            </div>
          )}
        </section>

        <SingleTopicCorrectionPanel subjectId={subjectID} topicKey={topicKey} />
      </div>
    );
  }

  if (!selectedSubject) {
    return (
      <div className="module-b-page">
        <div className="module-b-hero">
          <button className="module-b-back-button" onClick={() => navigate('/single-topics')}>
            ← Επιστροφή στα μαθήματα
          </button>
          <h1>Το μάθημα δεν βρέθηκε</h1>
          <p>Διάλεξε ξανά μάθημα για να δεις τις μεμονωμένες ασκήσεις.</p>
        </div>
      </div>
    );
  }

  const chapterGroups = selectedSubject.chapterGroups ?? [
    {
      id: `${selectedSubject.id}-default-group`,
      title: `${selectedSubject.emoji} ${selectedSubject.greekName}`,
      chapters: selectedSubject.chapters,
    },
  ];

  return (
    <div className="module-b-page tests-chapter-page single-topics-chapters-page">
      <div className="module-b-hero">
        <button className="module-b-back-button" onClick={() => navigate('/single-topics')}>
          ← Πίσω στα μαθήματα
        </button>
        <h1>
          {selectedSubject.emoji} {selectedSubject.greekName}
        </h1>
        <p>
          Μεμονωμένες ασκήσεις από κάθε ξεχωριστό κεφάλαιο. Πάτησε ένα κεφάλαιο για να ανοίξουν τα υποκεφάλαιά του.
        </p>
      </div>

      <div className="module-b-groups tests-chapter-panel single-topics-chapter-panel">
        {chapterGroups.map((group) => (
          <section key={group.id} className="module-b-group-card">
            {selectedSubject.chapterGroups && (
              <div className="module-b-group-header">
                <h2>{group.title}</h2>
                {group.description && <p>{group.description}</p>}
              </div>
            )}

            <div className="module-b-chapter-list">
              {group.chapters.map((chapter) => {
                const isExpanded = expandedChapter === chapter.id;
                const sectionGroups = getSingleTopicSectionGroups(selectedSubject.id, chapter);

                return (
                  <article
                    key={chapter.id}
                    className="module-b-chapter-card single-topic-chapter-card"
                    style={{ borderLeftColor: selectedSubject.color }}
                  >
                    <button
                      className="module-b-chapter-toggle"
                      onClick={() => setExpandedChapter(isExpanded ? null : chapter.id)}
                      type="button"
                    >
                      <div>
                        <span className="module-b-chapter-number">Κεφάλαιο {chapter.number}</span>
                        <h3>{chapter.title}</h3>
                      </div>
                      <span className={`module-b-expand-icon ${isExpanded ? 'expanded' : ''}`}>▼</span>
                    </button>

                    {isExpanded && (
                      <div className="module-b-section-panel single-topic-section-panel">
                        {sectionGroups.length > 0 ? (
                          <div className="module-b-section-list">
                            {sectionGroups.map((sectionGroup, sectionIndex) => (
                              <button
                                key={sectionGroup.id}
                                className="module-b-section-item single-topic-section-item single-topic-branch-item"
                                style={{ animationDelay: `${sectionIndex * 95}ms` }}
                                type="button"
                              >
                                <span className="single-topic-branch-label">{getGreekOrdinal(sectionIndex)}</span>
                                <span className="single-topic-branch-line" aria-hidden="true" />
                                <span className="single-topic-branch-sections">
                                  {sectionGroup.sections.map((section) => (
                                    <span key={section.id} className="single-topic-branch-section">
                                      <strong>{section.number}</strong>
                                      <span>{section.title}</span>
                                    </span>
                                  ))}
                                </span>
                              </button>
                            ))}
                          </div>
                        ) : (
                          <div className="module-b-empty-sections">
                            Δεν έχουν προστεθεί υποκεφάλαια για αυτό το κεφάλαιο.
                          </div>
                        )}
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

  // eslint-disable-next-line no-unreachable
  return (
    <div className="simple-module-page subject-module-page">
      <div className="module-b-hero">
        <button className="module-b-back-button" onClick={() => navigate('/single-topics')}>
          ← Πίσω στα μαθήματα
        </button>
        <h1>Μεμονωμένες Ασκήσεις</h1>
        <p>
          Μεμονωμένες ασκήσεις από κάθε ξεχωριστό κεφάλαιο. Επιλεγμένο μάθημα: <strong>{SUBJECT_LABELS[subjectID] ?? subjectID}</strong>
        </p>
      </div>

      <div className="module-b-subject-grid">
        {TOPIC_OPTIONS.map((option, index) => (
          <button
            key={option.key}
            className="module-b-subject-card single-topic-option-card"
            style={{ borderColor: ['#2563eb', '#d97706', '#059669', '#dc2626'][index] }}
            onClick={() => navigate(`/single-topics/${subjectID}/${option.key}`)}
          >
            <span className="module-b-subject-name">{option.title}</span>
            <span className="module-b-subject-meta">{option.description}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
