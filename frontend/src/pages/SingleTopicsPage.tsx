import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import SubjectSelector from '../components/SubjectSelector.tsx';
import SingleTopicCorrectionPanel from '../components/SingleTopicCorrectionPanel.tsx';
import PdfAiExplainPanel from '../components/PdfAiExplainPanel.tsx';
import { getSingleTopicPdfs } from '../config/singleTopics.ts';

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

export default function SingleTopicsPage() {
  const navigate = useNavigate();
  const { subjectID, topicKey } = useParams();
  const pdfItems = useMemo(
    () => (subjectID && topicKey ? getSingleTopicPdfs(subjectID, topicKey) : []),
    [subjectID, topicKey],
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
            ← Πίσω στα θέματα
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

  return (
    <div className="simple-module-page subject-module-page">
      <div className="module-b-hero">
        <button className="module-b-back-button" onClick={() => navigate('/single-topics')}>
          ← Πίσω στα μαθήματα
        </button>
        <h1>Μεμονωμένα Θέματα</h1>
        <p>
          Επιλεγμένο μάθημα: <strong>{SUBJECT_LABELS[subjectID] ?? subjectID}</strong>
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
