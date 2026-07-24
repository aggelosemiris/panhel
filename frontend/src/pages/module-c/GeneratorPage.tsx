import React, { useEffect, useMemo, useState } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import SubjectSelector from '../../components/SubjectSelector.tsx';
import { getSubjectById } from '../../config/curricula.ts';
import { generateAiCustomExam, type GeneratedCustomExam } from '../../services/customTestGenerator.ts';

pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

const subjectRouteMap = {
  MATH: 'math',
  AOTh: 'aoth',
  AEPP: 'aepp',
} as const;

const difficultyLabels = {
  easy: '1ο διαγώνισμα',
  normal: '2ο διαγώνισμα',
  hard: '3ο διαγώνισμα',
} as const;

type Difficulty = keyof typeof difficultyLabels;

export default function GeneratorPage() {
  const [selectedSubject, setSelectedSubject] = useState<'MATH' | 'AOTh' | 'AEPP' | null>(null);
  const [selectedChapterIds, setSelectedChapterIds] = useState<string[]>([]);
  const [difficulty, setDifficulty] = useState<Difficulty | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [isGeneratingExam, setIsGeneratingExam] = useState(false);
  const [generationError, setGenerationError] = useState<string | null>(null);
  const [generatedExam, setGeneratedExam] = useState<GeneratedCustomExam | null>(null);
  const [generatedPdfUrl, setGeneratedPdfUrl] = useState<string | null>(null);
  const [embeddedPdfUrl, setEmbeddedPdfUrl] = useState<string | null>(null);
  const [isPdfFullscreen, setIsPdfFullscreen] = useState(false);
  const [pdfPages, setPdfPages] = useState(0);
  const [pdfRenderError, setPdfRenderError] = useState<string | null>(null);

  useEffect(() => {
    let objectUrl: string | null = null;

    async function loadEmbeddedPdf() {
      if (!generatedPdfUrl) {
        setEmbeddedPdfUrl(null);
        setPdfPages(0);
        setPdfRenderError(null);
        return;
      }

      try {
        const response = await fetch(generatedPdfUrl);

        if (!response.ok) {
          throw new Error('Το PDF δεν φορτώθηκε σωστά για προεπισκόπηση.');
        }

        const blob = await response.blob();
        objectUrl = URL.createObjectURL(blob);
        setEmbeddedPdfUrl(objectUrl);
        setPdfRenderError(null);
      } catch {
        setEmbeddedPdfUrl(null);
        setPdfPages(0);
        setPdfRenderError('Δεν μπόρεσα να προετοιμάσω το PDF για προβολή μέσα στη σελίδα.');
      }
    }

    loadEmbeddedPdf();

    return () => {
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
      }
    };
  }, [generatedPdfUrl]);

  const subject = useMemo(() => {
    return selectedSubject ? getSubjectById(subjectRouteMap[selectedSubject]) : undefined;
  }, [selectedSubject]);

  const chapterGroups = subject?.chapterGroups?.length
    ? subject.chapterGroups
    : subject
      ? [{ id: `${subject.id}-chapters`, title: subject.greekName, chapters: subject.chapters }]
      : [];

  const selectedChapters = subject?.chapters.filter((chapter) => selectedChapterIds.includes(chapter.id)) ?? [];
  const canContinue = selectedChapterIds.length >= 2 && Boolean(difficulty);

  const resetState = () => {
    setShowPreview(false);
    setGeneratedExam(null);
    setGeneratedPdfUrl(null);
    setEmbeddedPdfUrl(null);
    setGenerationError(null);
    setPdfPages(0);
    setPdfRenderError(null);
    setIsPdfFullscreen(false);
  };

  const handleSubjectSelect = (subjectId: 'MATH' | 'AOTh' | 'AEPP') => {
    setSelectedSubject(subjectId);
    setSelectedChapterIds([]);
    setDifficulty(null);
    resetState();
  };

  const resetSubject = () => {
    setSelectedSubject(null);
    setSelectedChapterIds([]);
    setDifficulty(null);
    resetState();
  };

  const toggleChapter = (chapterId: string) => {
    resetState();
    setSelectedChapterIds((current) => (current.includes(chapterId) ? current.filter((id) => id !== chapterId) : [...current, chapterId]));
  };

  const handleGenerateExam = async () => {
    if (!subject || !difficulty || selectedChapters.length < 2) {
      return;
    }

    setShowPreview(true);
    setIsGeneratingExam(true);
    setGenerationError(null);
    setGeneratedExam(null);
    setGeneratedPdfUrl(null);
    setEmbeddedPdfUrl(null);
    setPdfPages(0);
    setPdfRenderError(null);

    try {
      const response = await generateAiCustomExam({
        subjectId: subject.id,
        difficulty,
        selectedChapters: selectedChapters.map((chapter) => ({
          id: chapter.id,
          number: Number(chapter.number),
          title: chapter.title,
          sections: (chapter.sections ?? []).map((section) =>
            typeof section === 'string' ? section : `${section.number ?? ''} ${section.title ?? ''}`.trim(),
          ),
        })),
      });

      if (!response?.exam || !Array.isArray(response.exam.questions)) {
        throw new Error('Το διαγώνισμα δεν γύρισε σωστά από τον server.');
      }

      setGeneratedExam(response.exam);
      setGeneratedPdfUrl(response.resolvedPdfUrl ?? response.pdfUrl ?? null);
    } catch (error) {
      setGenerationError(error instanceof Error ? error.message : 'Δεν μπόρεσα να ετοιμάσω το διαγώνισμα σε PDF.');
    } finally {
      setIsGeneratingExam(false);
    }
  };

  if (!selectedSubject || !subject) {
    return <SubjectSelector onSelect={handleSubjectSelect} />;
  }

  return (
    <div className="generator-page">
      <div className="module-b-hero">
        <button className="module-b-back-button" onClick={resetSubject} type="button">
          ← Πίσω στα μαθήματα
        </button>
        <h1>Φτιάξε το δικό σου διαγώνισμα</h1>
        <p>Επίλεξε μάθημα, τουλάχιστον δύο κεφάλαια και τύπο διαγωνίσματος. Η γεννήτρια θα ετοιμάσει κανονικό PDF με δομή Πανελληνίων.</p>
      </div>

      <div className="generator-layout">
        <section className="generator-panel">
          <h2>
            {subject.emoji} {subject.greekName}
          </h2>
          <p>Επίλεξε τουλάχιστον δύο κεφάλαια. Το παραγόμενο διαγώνισμα θα βασιστεί μόνο στην ύλη που διάλεξες.</p>

          <div className="generator-chapter-groups">
            {chapterGroups.map((group) => (
              <div key={group.id} className="generator-chapter-group">
                <h3>{group.title}</h3>
                <div className="generator-chapter-list">
                  {group.chapters.map((chapter) => {
                    const isSelected = selectedChapterIds.includes(chapter.id);

                    return (
                      <button
                        key={chapter.id}
                        className={`generator-chapter-card ${isSelected ? 'selected' : ''}`}
                        onClick={() => toggleChapter(chapter.id)}
                        type="button"
                      >
                        <span>{`Κεφάλαιο ${chapter.number}`}</span>
                        <strong>{chapter.title}</strong>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </section>

        <aside className="generator-sidebar">
          <h2>Ρυθμίσεις</h2>
          <p>Διάλεξε ποιο από τα τρία διαγωνίσματα θέλεις να δημιουργηθεί.</p>

          <div className="generator-difficulty-grid">
            {(Object.keys(difficultyLabels) as Difficulty[]).map((level) => (
              <button
                key={level}
                className={`generator-difficulty-button ${difficulty === level ? 'selected' : ''}`}
                onClick={() => {
                  setDifficulty(level);
                  resetState();
                }}
                type="button"
              >
                {difficultyLabels[level]}
              </button>
            ))}
          </div>

          <div className="generator-summary">
            <span>Επιλεγμένα κεφάλαια: {selectedChapterIds.length}</span>
            <span>Τύπος: {difficulty ? difficultyLabels[difficulty] : 'Δεν έχει επιλεγεί'}</span>
          </div>

          <button className="generator-next-button" disabled={!canContinue || isGeneratingExam} onClick={handleGenerateExam} type="button">
            {isGeneratingExam ? 'Δημιουργία...' : 'Επόμενο'}
          </button>

          {!canContinue ? <p className="generator-warning">Πρέπει να επιλέξεις τουλάχιστον δύο κεφάλαια και έναν τύπο διαγωνίσματος.</p> : null}
        </aside>
      </div>

      {showPreview && difficulty ? (
        <section className="generator-ai-preview">
          <h2>Έτοιμο διαγώνισμα</h2>
          <div className="generator-ai-card">
            <strong>Μάθημα:</strong> {subject.greekName}
            <strong>Τύπος:</strong> {difficultyLabels[difficulty]}
            <strong>Κεφάλαια:</strong> {selectedChapters.map((chapter) => `Κεφ. ${chapter.number}`).join(', ')}
          </div>

          {isGeneratingExam ? <p>Η γεννήτρια ετοιμάζει τώρα κανονικό διαγώνισμα σε PDF με δομή ΘΕΜΑ Α-Β-Γ-Δ...</p> : null}
          {generationError ? <p className="exam-correction-error">{generationError}</p> : null}

          {generatedExam ? (
            <div className="module-b-ai-exam-content">
              <div className="module-b-ai-exam-meta">
                <strong>{generatedExam.title}</strong>
                <span>{`Εκτιμώμενος χρόνος: ${generatedExam.estimatedTimeMinutes} λεπτά`}</span>
                <span>{`Τρόπος δημιουργίας: ${generatedExam.generationMode === 'openai' ? 'AI μοντέλο' : 'Επίσημο πρότυπο γεννήτριας'}`}</span>
                <span>{`Θέματα: ${generatedExam.questions.length}`}</span>
              </div>

              <div className="module-b-ai-exam-instructions">
                <h3>Οδηγίες</h3>
                <ul>
                  {(generatedExam.instructions ?? []).map((instruction) => (
                    <li key={instruction}>{instruction}</li>
                  ))}
                </ul>
              </div>

              {generatedPdfUrl ? (
                <div className={`generator-pdf-shell ${isPdfFullscreen ? 'fullscreen' : ''}`}>
                  <div className="generator-pdf-toolbar">
                    <a className="generator-pdf-button" href={generatedPdfUrl} target="_blank" rel="noreferrer">
                      Άνοιγμα σε νέο tab
                    </a>
                    <a className="generator-pdf-button" href={generatedPdfUrl} download>
                      Λήψη PDF
                    </a>
                    <button className="generator-pdf-button" onClick={() => setIsPdfFullscreen((current) => !current)} type="button">
                      {isPdfFullscreen ? 'Έξοδος full screen' : 'Full screen'}
                    </button>
                  </div>

                  <div className="generator-pdf-frame generator-pdf-rendered">
                    {embeddedPdfUrl && !pdfRenderError ? (
                      <Document
                        file={embeddedPdfUrl}
                        loading={
                          <div className="generator-pdf-fallback">
                            <strong>Φορτώνω το PDF...</strong>
                          </div>
                        }
                        onLoadSuccess={({ numPages }) => {
                          setPdfPages(numPages);
                          setPdfRenderError(null);
                        }}
                        onLoadError={() => {
                          setPdfPages(0);
                          setPdfRenderError('Η προεπισκόπηση δεν φορτώθηκε σωστά μέσα στη σελίδα.');
                        }}
                      >
                        {Array.from({ length: pdfPages }, (_, index) => (
                          <div key={`page-${index + 1}`} className="generator-pdf-page">
                            <Page pageNumber={index + 1} width={isPdfFullscreen ? 1120 : 980} renderTextLayer={false} renderAnnotationLayer={false} />
                          </div>
                        ))}
                      </Document>
                    ) : null}

                    {!embeddedPdfUrl || pdfRenderError ? (
                      <div className="generator-pdf-fallback">
                        <strong>{pdfRenderError ?? 'Η προεπισκόπηση δεν φορτώθηκε μέσα στη σελίδα.'}</strong>
                        <p>Το PDF είναι έτοιμο. Άνοιξέ το σε νέο tab για να το δεις κανονικά.</p>
                        <a className="generator-pdf-button" href={generatedPdfUrl} target="_blank" rel="noreferrer">
                          Άνοιγμα PDF σε νέο tab
                        </a>
                      </div>
                    ) : null}
                  </div>
                </div>
              ) : null}
            </div>
          ) : null}
        </section>
      ) : null}
    </div>
  );
}
