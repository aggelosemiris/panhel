import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import ExamCorrectionPanel from '../../components/ExamCorrectionPanel.tsx';
import { getSubjectById } from '../../config/curricula.ts';

const AOTH_TEST_PDFS: Record<string, string> = {
  'aoth-1-easy': '/tests/aoth/aoth-1-easy.pdf',
  'aoth-1-normal': '/tests/aoth/aoth-1-normal.pdf',
  'aoth-1-hard': '/tests/aoth/aoth-1-hard.pdf',
  'aoth-2-easy': '/tests/aoth/aoth-2-easy.pdf',
  'aoth-2-normal': '/tests/aoth/aoth-2-normal.pdf',
  'aoth-2-hard': '/tests/aoth/aoth-2-hard.pdf',
  'aoth-3-easy': '/tests/aoth/aoth-3-easy.pdf',
  'aoth-3-normal': '/tests/aoth/aoth-3-normal.pdf',
  'aoth-3-hard': '/tests/aoth/aoth-3-hard.pdf',
  'aoth-4-easy': '/tests/aoth/aoth-4-easy.pdf',
  'aoth-4-normal': '/tests/aoth/aoth-4-normal.pdf',
  'aoth-4-hard': '/tests/aoth/aoth-4-hard.pdf',
  'aoth-5-easy': '/tests/aoth/aoth-5-easy.pdf',
  'aoth-5-normal': '/tests/aoth/aoth-5-normal.pdf',
  'aoth-5-hard': '/tests/aoth/aoth-5-hard.pdf',
  'aoth-7-easy': '/tests/aoth/aoth-7-easy.pdf',
  'aoth-7-normal': '/tests/aoth/aoth-7-normal.pdf',
  'aoth-7-hard': '/tests/aoth/aoth-7-hard.pdf',
  'aoth-9-easy': '/tests/aoth/aoth-9-easy.pdf',
  'aoth-9-normal': '/tests/aoth/aoth-9-normal.pdf',
  'aoth-9-hard': '/tests/aoth/aoth-9-hard.pdf',
  'aoth-10-easy': '/tests/aoth/aoth-10-easy.pdf',
  'aoth-10-normal': '/tests/aoth/aoth-10-normal.pdf',
  'aoth-10-hard': '/tests/aoth/aoth-10-hard.pdf',
};

const MATH_TEST_PDFS: Record<string, string> = {
  'math-1-easy': '/tests/math/math-1-easy.pdf',
  'math-1-normal': '/tests/math/math-1-normal.pdf',
  'math-1-hard': '/tests/math/math-1-hard.pdf',
  'math-2-easy': '/tests/math/math-2-easy.pdf',
  'math-2-normal': '/tests/math/math-2-normal.pdf',
  'math-2-hard': '/tests/math/math-2-hard.pdf',
  'math-3-easy': '/tests/math/math-3-easy.pdf',
  'math-3-normal': '/tests/math/math-3-normal.pdf',
  'math-3-hard': '/tests/math/math-3-hard.pdf',
};

const AEPP_TEST_PDFS: Record<string, string> = {
  'aepp-1-easy': '/tests/aepp/aepp-1-easy.pdf',
  'aepp-1-normal': '/tests/aepp/aepp-1-normal.pdf',
  'aepp-1-hard': '/tests/aepp/aepp-1-hard.pdf',
  'aepp-2-easy': '/tests/aepp/aepp-2-easy.pdf',
  'aepp-2-normal': '/tests/aepp/aepp-2-normal.pdf',
  'aepp-2-hard': '/tests/aepp/aepp-2-hard.pdf',
  'aepp-3-easy': '/tests/aepp/aepp-3-easy.pdf',
  'aepp-3-normal': '/tests/aepp/aepp-3-normal.pdf',
  'aepp-3-hard': '/tests/aepp/aepp-3-hard.pdf',
  'aepp-4-easy': '/tests/aepp/aepp-4-easy.pdf',
  'aepp-4-normal': '/tests/aepp/aepp-4-normal.pdf',
  'aepp-4-hard': '/tests/aepp/aepp-4-hard.pdf',
  'aepp-6-easy': '/tests/aepp/aepp-6-easy.pdf',
  'aepp-6-normal': '/tests/aepp/aepp-6-normal.pdf',
  'aepp-6-hard': '/tests/aepp/aepp-6-hard.pdf',
  'aepp-7-easy': '/tests/aepp/aepp-7-easy.pdf',
  'aepp-7-normal': '/tests/aepp/aepp-7-normal.pdf',
  'aepp-7-hard': '/tests/aepp/aepp-7-hard.pdf',
  'aepp-8-easy': '/tests/aepp/aepp-8-easy.pdf',
  'aepp-8-normal': '/tests/aepp/aepp-8-normal.pdf',
  'aepp-8-hard': '/tests/aepp/aepp-8-hard.pdf',
  'aepp-9-easy': '/tests/aepp/aepp-9-easy.pdf',
  'aepp-9-normal': '/tests/aepp/aepp-9-normal.pdf',
  'aepp-9-hard': '/tests/aepp/aepp-9-hard.pdf',
  'aepp-10-easy': '/tests/aepp/aepp-10-easy.pdf',
  'aepp-10-normal': '/tests/aepp/aepp-10-normal.pdf',
  'aepp-10-hard': '/tests/aepp/aepp-10-hard.pdf',
  'aepp-13-easy': '/tests/aepp/aepp-13-easy.pdf',
  'aepp-13-normal': '/tests/aepp/aepp-13-normal.pdf',
  'aepp-13-hard': '/tests/aepp/aepp-13-hard.pdf',
  'aepp-supp-1-easy': '/tests/aepp/aepp-supp-1-easy.pdf',
  'aepp-supp-1-normal': '/tests/aepp/aepp-supp-1-normal.pdf',
  'aepp-supp-1-hard': '/tests/aepp/aepp-supp-1-hard.pdf',
  'aepp-supp-2-easy': '/tests/aepp/aepp-supp-2-easy.pdf',
  'aepp-supp-2-normal': '/tests/aepp/aepp-supp-2-normal.pdf',
  'aepp-supp-2-hard': '/tests/aepp/aepp-supp-2-hard.pdf',
  'aepp-supp-3-easy': '/tests/aepp/aepp-supp-3-easy.pdf',
  'aepp-supp-3-normal': '/tests/aepp/aepp-supp-3-normal.pdf',
  'aepp-supp-3-hard': '/tests/aepp/aepp-supp-3-hard.pdf',
  'aepp-supp-4-easy': '/tests/aepp/aepp-supp-4-easy.pdf',
  'aepp-supp-4-normal': '/tests/aepp/aepp-supp-4-normal.pdf',
  'aepp-supp-4-hard': '/tests/aepp/aepp-supp-4-hard.pdf',
  'aepp-supp-5-easy': '/tests/aepp/aepp-supp-5-easy.pdf',
  'aepp-supp-5-normal': '/tests/aepp/aepp-supp-5-normal.pdf',
};

const TIER_LABELS: Record<string, string> = {
  easy: 'Εύκολη',
  normal: 'Κανονική',
  hard: 'Δύσκολη',
};

export default function TestPage() {
  const { subjectID, chapterID, tier } = useParams<{
    subjectID: string;
    chapterID: string;
    tier: string;
  }>();
  const navigate = useNavigate();
  const viewerRef = useRef<HTMLDivElement | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const subject = useMemo(() => {
    return subjectID ? getSubjectById(subjectID) : undefined;
  }, [subjectID]);

  const chapter = subject?.chapters.find((item) => item.id === chapterID);
  const pdfKey = subjectID && chapterID && tier ? `${chapterID}-${tier}` : '';
  const testPdf =
    subjectID === 'aoth'
      ? AOTH_TEST_PDFS[pdfKey]
      : subjectID === 'math'
        ? MATH_TEST_PDFS[pdfKey]
        : subjectID === 'aepp'
          ? AEPP_TEST_PDFS[pdfKey]
          : undefined;

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  const handleFullscreenToggle = async () => {
    try {
      if (!document.fullscreenElement && viewerRef.current) {
        await viewerRef.current.requestFullscreen();
      } else if (document.fullscreenElement) {
        await document.exitFullscreen();
      }
    } catch (_error) {
      setIsFullscreen(Boolean(document.fullscreenElement));
    }
  };

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
          Κεφάλαιο {chapter.number}: {chapter.title} · Δυσκολία: <strong>{TIER_LABELS[tier ?? ''] ?? tier}</strong>
        </p>
      </div>

      {testPdf ? (
        <>
          <div ref={viewerRef} className={`module-b-test-pdf-shell ${isFullscreen ? 'fullscreen' : ''}`}>
            <div className="module-b-test-pdf-toolbar">
              <a className="module-b-test-pdf-link" href={testPdf} target="_blank" rel="noreferrer">
                Άνοιγμα σε νέο tab
              </a>
              <button className="module-b-test-pdf-button" onClick={handleFullscreenToggle}>
                {isFullscreen ? 'Έξοδος από full screen' : 'Full screen'}
              </button>
            </div>
            <iframe title={`${chapter.title} - ${tier}`} src={testPdf} className="module-b-test-pdf-frame" />
          </div>

          <ExamCorrectionPanel
            subjectId={subject.id}
            chapterId={chapter.id}
            chapterTitle={`Κεφάλαιο ${chapter.number}: ${chapter.title}`}
            tier={tier ?? 'normal'}
          />
        </>
      ) : (
        <div className="module-b-group-card">
          <h2>Δεν έχει προστεθεί ακόμα PDF</h2>
          <p>
            Για το {chapter.title} στη δυσκολία <strong>{TIER_LABELS[tier ?? ''] ?? tier}</strong> δεν υπάρχει ακόμα συνδεδεμένο διαγώνισμα.
          </p>
        </div>
      )}
    </div>
  );
}
