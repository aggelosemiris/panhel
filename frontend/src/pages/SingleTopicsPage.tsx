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

type SectionGroupConfig = string[] | {
  ids: string[];
  number?: string;
  title: string;
};

const MATH_SINGLE_TOPIC_SECTION_GROUPS: Record<string, SectionGroupConfig[]> = {
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

const AOTH_SINGLE_TOPIC_SECTION_GROUPS: Record<string, SectionGroupConfig[]> = {
  'aoth-1': [
    ['aoth-1-1', 'aoth-1-2'],
    ['aoth-1-3', 'aoth-1-4'],
    ['aoth-1-5', 'aoth-1-6'],
    ['aoth-1-7', 'aoth-1-8'],
    ['aoth-1-9', 'aoth-1-10'],
    ['aoth-1-11', 'aoth-1-12'],
  ],
  'aoth-2': [
    ['aoth-2-1', 'aoth-2-2', 'aoth-2-3'],
    ['aoth-2-4', 'aoth-2-5', 'aoth-2-6'],
    ['aoth-2-7', 'aoth-2-8'],
    ['aoth-2-9', 'aoth-2-10', 'aoth-2-11', 'aoth-2-12'],
    ['aoth-2-13', 'aoth-2-14'],
    ['aoth-2-15'],
  ],
  'aoth-3': [
    ['aoth-3-1a', 'aoth-3-2a'],
    ['aoth-3-3a', 'aoth-3-4a', 'aoth-3-5a'],
    ['aoth-3-6a', 'aoth-3-7a'],
    ['aoth-3-8', 'aoth-3-9', 'aoth-3-10'],
    ['aoth-3-11', 'aoth-3-12', 'aoth-3-13'],
    ['aoth-3-14'],
  ],
  'aoth-4': [
    ['aoth-4-1', 'aoth-4-2', 'aoth-4-3'],
    ['aoth-4-4', 'aoth-4-5'],
    ['aoth-4-6', 'aoth-4-7'],
    ['aoth-4-8', 'aoth-4-9'],
  ],
  'aoth-5': [
    ['aoth-5-1', 'aoth-5-2'],
    ['aoth-5-3', 'aoth-5-4'],
    ['aoth-5-5'],
  ],
  'aoth-7': [
    ['aoth-7-1', 'aoth-7-2'],
    ['aoth-7-3', 'aoth-7-4'],
    ['aoth-7-7', 'aoth-7-9', 'aoth-7-10'],
  ],
  'aoth-9': [
    ['aoth-9-1', 'aoth-9-2'],
    ['aoth-9-3', 'aoth-9-5'],
    ['aoth-9-4'],
  ],
  'aoth-10': [
    ['aoth-10-3', 'aoth-10-4'],
  ],
};

const AEPP_SINGLE_TOPIC_SECTION_GROUPS: Record<string, SectionGroupConfig[]> = {
  'aepp-1': [
    { ids: ['aepp-1-1', 'aepp-1-2', 'aepp-1-3'], title: 'Έννοια, κατανόηση και δομή προβλήματος' },
    { ids: ['aepp-1-4'], title: 'Καθορισμός απαιτήσεων και ανάλυση δεδομένων' },
  ],
  'aepp-2': [
    { ids: ['aepp-2-1', 'aepp-2-2', 'aepp-2-3'], title: 'Έννοια, χαρακτηριστικά και αναπαράσταση αλγορίθμου' },
    { ids: ['aepp-2-4', 'aepp-2-4-1'], title: 'Δομή ακολουθίας και βασικές εντολές' },
    { ids: ['aepp-2-4-2', 'aepp-2-4-3'], title: 'Απλή, σύνθετη και πολλαπλή επιλογή' },
    { ids: ['aepp-2-4-4'], title: 'Εμφωλευμένες επιλογές' },
    { ids: ['aepp-2-4-5'], title: 'Δομές επανάληψης' },
  ],
  'aepp-3': [
    { ids: ['aepp-3-1', 'aepp-3-2'], title: 'Δεδομένα, αλγόριθμοι και δομές δεδομένων' },
    { ids: ['aepp-3-3'], title: 'Πίνακες και βασική επεξεργασία' },
    { ids: ['aepp-3-4'], title: 'Στοίβα' },
    { ids: ['aepp-3-5'], title: 'Ουρά' },
    { ids: ['aepp-3-6'], title: 'Αναζήτηση σε πίνακες' },
    { ids: ['aepp-3-7'], title: 'Ταξινόμηση και παράλληλοι πίνακες' },
  ],
  'aepp-4': [
    { ids: ['aepp-4-1'], title: 'Ανάλυση και διάσπαση προβλήματος' },
  ],
  'aepp-6': [
    { ids: ['aepp-6-1', 'aepp-6-3', 'aepp-6-7'], title: 'Πρόγραμμα, γλώσσες και προγραμματιστικά περιβάλλοντα' },
    { ids: ['aepp-6-4', 'aepp-6-4-1', 'aepp-6-4-2', 'aepp-6-4-3'], title: 'Τεχνικές και μοντέλα προγραμματισμού' },
    { ids: ['aepp-6-5'], title: 'Αντικειμενοστραφής προγραμματισμός' },
  ],
  'aepp-7': [
    { ids: ['aepp-7-1', 'aepp-7-2', 'aepp-7-3', 'aepp-7-4'], title: 'Αλφάβητο, τύποι δεδομένων, σταθερές και μεταβλητές' },
    { ids: ['aepp-7-5', 'aepp-7-6', 'aepp-7-7'], title: 'Τελεστές, συναρτήσεις και αριθμητικές εκφράσεις' },
    { ids: ['aepp-7-8', 'aepp-7-9'], title: 'Εκχώρηση και εντολές εισόδου και εξόδου' },
    { ids: ['aepp-7-10'], title: 'Δομή ολοκληρωμένου προγράμματος' },
  ],
  'aepp-8': [
    { ids: ['aepp-8-1', 'aepp-8-1-1'], title: 'Απλή και σύνθετη εντολή ΑΝ' },
    { ids: ['aepp-8-1-2'], title: 'Εντολή ΕΠΙΛΕΞΕ και πολλαπλή επιλογή' },
    { ids: ['aepp-8-2', 'aepp-8-2-1'], title: 'Επανάληψη με ΟΣΟ' },
    { ids: ['aepp-8-2-2'], title: 'Επανάληψη με ΑΡΧΗ ΕΠΑΝΑΛΗΨΗΣ και ΜΕΧΡΙΣ ΟΤΟΥ' },
    { ids: ['aepp-8-2-3'], title: 'Επανάληψη με ΓΙΑ' },
    { ids: ['aepp-8-2', 'aepp-8-2-1', 'aepp-8-2-2', 'aepp-8-2-3'], title: 'Μετατροπές, εμφωλεύσεις και συνδυασμός επαναλήψεων' },
  ],
  'aepp-9': [
    { ids: ['aepp-9-1', 'aepp-9-2'], title: 'Μονοδιάστατοι πίνακες και βασικές επεξεργασίες' },
    { ids: ['aepp-9-1', 'aepp-9-2'], title: 'Αναζήτηση, πλήθος και θέσεις στοιχείων' },
    { ids: ['aepp-9-4'], title: 'Ταξινόμηση και παράλληλοι πίνακες' },
    { ids: ['aepp-9-3'], title: 'Δισδιάστατοι πίνακες' },
    { ids: ['aepp-9-4'], title: 'Τυπικές και συνδυαστικές επεξεργασίες πινάκων' },
  ],
  'aepp-10': [
    { ids: ['aepp-10-1', 'aepp-10-2', 'aepp-10-3'], title: 'Τμηματικός προγραμματισμός, χαρακτηριστικά και πλεονεκτήματα' },
    { ids: ['aepp-10-4', 'aepp-10-5-3'], title: 'Παράμετροι και μεταφορά τιμών' },
    { ids: ['aepp-10-5', 'aepp-10-5-1'], title: 'Συναρτήσεις' },
    { ids: ['aepp-10-5', 'aepp-10-5-2'], title: 'Διαδικασίες' },
    { ids: ['aepp-10-6'], title: 'Εμβέλεια μεταβλητών και σύνθετες ασκήσεις υποπρογραμμάτων' },
  ],
  'aepp-supp-1': [
    { ids: ['aepp-supp-1-1', 'aepp-supp-1-1-1'], title: 'Στοίβα' },
    { ids: ['aepp-supp-1-2', 'aepp-supp-1-2-1'], title: 'Ουρά' },
    { ids: ['aepp-supp-1-3', 'aepp-supp-1-3-1', 'aepp-supp-1-3-2', 'aepp-supp-1-3-3'], title: 'Σύνθετες δομές δεδομένων' },
  ],
  'aepp-supp-2': [
    { ids: ['aepp-supp-2-1'], title: 'Μέθοδος Διαίρει και Βασίλευε' },
  ],
  'aepp-supp-3': [
    { ids: ['aepp-supp-3-1', 'aepp-supp-3-1-1', 'aepp-supp-3-1-2'], title: 'ΕΠΙΛΕΞΕ' },
  ],
  'aepp-supp-4': [
    { ids: ['aepp-supp-4-1', 'aepp-supp-4-2', 'aepp-supp-4-2-1', 'aepp-supp-4-2-2'], title: 'Εισαγωγή στον Αντικειμενοστραφή Προγραμματισμό' },
    { ids: ['aepp-supp-4-3', 'aepp-supp-4-3-1'], title: 'Κλάσεις και Αντικείμενα' },
    { ids: ['aepp-supp-4-4', 'aepp-supp-4-5'], title: 'Κληρονομικότητα και Πολυμορφισμός' },
  ],
  'aepp-supp-5': [
    { ids: ['aepp-supp-5-1', 'aepp-supp-5-1-1', 'aepp-supp-5-1-2', 'aepp-supp-5-1-3', 'aepp-supp-13-1'], title: 'Κατηγορίες λαθών' },
    { ids: ['aepp-supp-5-2', 'aepp-supp-5-2-1', 'aepp-supp-5-2-2'], title: 'Εντοπισμός και διόρθωση λαθών σε επιλογές και επαναλήψεις' },
    { ids: ['aepp-supp-5-2-3', 'aepp-supp-5-2-4'], title: 'Εκσφαλμάτωση σε πίνακες και υποπρογράμματα' },
    { ids: ['aepp-supp-5-2-5', 'aepp-supp-13-2'], title: 'Μέθοδος μαύρου κουτιού και ολοκληρωμένος έλεγχος προγράμματος' },
  ],
};

function buildSectionButtonGroup(sections: Section[], overrides?: { number?: string; title?: string }): SectionButtonGroup {
  const first = sections[0];
  const last = sections[sections.length - 1];
  const number = sections.length === 1 ? first.number : `${first.number} - ${last.number}`;

  return {
    id: sections.map((section) => section.id).join('__'),
    number: overrides?.number ?? number,
    title: overrides?.title ?? sections.map((section) => section.title).join(' / '),
    sections,
  };
}

function getGreekOrdinal(index: number): string {
  return `${index + 1}η υποενότητα`;
}

function getSingleTopicSectionGroups(subjectId: string, chapter: Chapter): SectionButtonGroup[] {
  const configuredGroups =
    subjectId === 'math'
      ? MATH_SINGLE_TOPIC_SECTION_GROUPS[chapter.id]
      : subjectId === 'aoth'
        ? AOTH_SINGLE_TOPIC_SECTION_GROUPS[chapter.id]
        : subjectId === 'aepp'
          ? AEPP_SINGLE_TOPIC_SECTION_GROUPS[chapter.id]
          : undefined;

  if (!configuredGroups) {
    return chapter.sections.map((section) => buildSectionButtonGroup([section]));
  }

  const sectionsById = new Map(chapter.sections.map((section) => [section.id, section]));

  return configuredGroups
    .map((group) => {
      const sectionIds = Array.isArray(group) ? group : group.ids;
      const sections = sectionIds.map((sectionId) => sectionsById.get(sectionId)).filter(Boolean) as Section[];
      const overrides = Array.isArray(group) ? undefined : { number: group.number, title: group.title };

      return { sections, overrides };
    })
    .filter(({ sections }) => sections.length > 0)
    .map(({ sections, overrides }) => buildSectionButtonGroup(sections, overrides));
}

function getSectionTopicCopy(subjectId: string | undefined, topicKey: string | undefined) {
  if (!subjectId || !topicKey) return undefined;

  const subject = getSubjectById(subjectId);
  if (!subject) return undefined;

  const sectionIds = topicKey.split('__');
  const sections = subject.chapters.flatMap((chapter) => chapter.sections).filter((section) => sectionIds.includes(section.id));

  if (!sections.length) return undefined;

  const sectionTitle = sections.map((section) => `${section.number} ${section.title}`).join(' / ');

  return {
    title: sectionTitle,
    description: `Διάλεξε ποια άσκηση θέλεις να ανοίξεις για την υποενότητα ${sectionTitle}.`,
  };
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
    const topicCopy = TOPIC_DETAIL_COPY[topicKey] ?? getSectionTopicCopy(subjectID, topicKey);

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
          <h2>{subjectID === 'math' ? 'Διαθέσιμες ασκήσεις' : 'Διαθέσιμα PDF'}</h2>
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
                    <span>{subjectID === 'math' ? 'Άνοιγμα άσκησης' : 'Άνοιγμα PDF'}</span>
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

        <SingleTopicCorrectionPanel
          exercisePdfPath={selectedPdfPath}
          subjectId={subjectID}
          topicKey={topicKey}
        />
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
                                key={`${sectionGroup.id}-${sectionIndex}`}
                                className="module-b-section-item single-topic-section-item single-topic-branch-item"
                                style={{ animationDelay: `${sectionIndex * 95}ms` }}
                                onClick={() => navigate(`/single-topics/${selectedSubject.id}/${sectionGroup.id}`)}
                                type="button"
                              >
                                <span className="single-topic-branch-label">{getGreekOrdinal(sectionIndex)}</span>
                                <span className="single-topic-branch-line" aria-hidden="true" />
                                <span className="single-topic-branch-sections">
                                  <span className="single-topic-branch-group-title">{sectionGroup.title}</span>
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
