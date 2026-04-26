import React, { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import PdfAiExplainPanel from '../../components/PdfAiExplainPanel.tsx';

const EXAM_MAP: Record<string, { title: string; file: string }> = {
  'math-2025': { title: 'Μαθηματικά - Θέματα 2025', file: '/exams/math/math_2025.pdf' },
  'math-2024': { title: 'Μαθηματικά - Θέματα 2024', file: '/exams/math/math_2024.pdf' },
  'math-2023': { title: 'Μαθηματικά - Θέματα 2023', file: '/exams/math/math_2023.pdf' },
  'math-2022': { title: 'Μαθηματικά - Θέματα 2022', file: '/exams/math/math_2022.pdf' },
  'math-2021': { title: 'Μαθηματικά - Θέματα 2021', file: '/exams/math/math_2021_panellinies_net.pdf' },
  'math-2020': { title: 'Μαθηματικά - Θέματα 2020', file: '/exams/math/math_2020_panellinies_net.pdf' },
  'math-2019': { title: 'Μαθηματικά - Θέματα 2019', file: '/exams/math/math_pros_2019_panellinies_net.pdf' },
  'math-2018': { title: 'Μαθηματικά - Θέματα 2018', file: '/exams/math/math_pros_2018_panellinies_net.pdf' },
  'math-2017': { title: 'Μαθηματικά - Θέματα 2017', file: '/exams/math/math_kat_2017_panellinies_net.pdf' },
  'math-2016': { title: 'Μαθηματικά - Θέματα 2016', file: '/exams/math/math_kat_2016_panellinies_net.pdf' },
  'aoth-2025': { title: 'ΑΟΘ - Θέματα 2025', file: '/exams/aoth/aoth_2025_00.pdf' },
  'aoth-2024': { title: 'ΑΟΘ - Θέματα 2024', file: '/exams/aoth/aoth_2024.pdf' },
  'aoth-2023': { title: 'ΑΟΘ - Θέματα 2023', file: '/exams/aoth/aoth_2023.pdf' },
  'aoth-2022': { title: 'ΑΟΘ - Θέματα 2022', file: '/exams/aoth/aoth_2022.pdf' },
  'aoth-2021': { title: 'ΑΟΘ - Θέματα 2021', file: '/exams/aoth/aoth_2021_panellinies_net.pdf' },
  'aoth-2020': { title: 'ΑΟΘ - Θέματα 2020', file: '/exams/aoth/aoth_2020_panellinies_net (1).pdf' },
  'aoth-2019': { title: 'ΑΟΘ - Θέματα 2019', file: '/exams/aoth/aoth_2019_panellinies_net.pdf' },
  'aoth-2018': { title: 'ΑΟΘ - Θέματα 2018', file: '/exams/aoth/aoth_2018_panellinies_net.pdf' },
  'aoth-2017': { title: 'ΑΟΘ - Θέματα 2017', file: '/exams/aoth/aoth_2017_panellinies_net.pdf' },
  'aoth-2016': { title: 'ΑΟΘ - Θέματα 2016', file: '/exams/aoth/aoth_2016_panellinies_net.pdf' },
  'aepp-2025': { title: 'ΑΕΠΠ - Θέματα 2025', file: '/exams/aepp/aepp_2025 (1).pdf' },
  'aepp-2024': { title: 'ΑΕΠΠ - Θέματα 2024', file: '/exams/aepp/aepp_2024.pdf' },
  'aepp-2023': { title: 'ΑΕΠΠ - Θέματα 2023', file: '/exams/aepp/aepp_2023.pdf' },
  'aepp-2022': { title: 'ΑΕΠΠ - Θέματα 2022', file: '/exams/aepp/aepp_2022.pdf' },
  'aepp-2021': { title: 'ΑΕΠΠ - Θέματα 2021', file: '/exams/aepp/aepp_2021_panellinies_net.pdf' },
  'aepp-2020': { title: 'ΑΕΠΠ - Θέματα 2020', file: '/exams/aepp/aepp_2020_panellinies_net.pdf' },
  'aepp-2019': { title: 'ΑΕΠΠ - Θέματα 2019', file: '/exams/aepp/aepp_2019_panellinies_net.pdf' },
  'aepp-2018': { title: 'ΑΕΠΠ - Θέματα 2018', file: '/exams/aepp/aepp_2018_panellinies_net.pdf' },
  'aepp-2017': { title: 'ΑΕΠΠ - Θέματα 2017', file: '/exams/aepp/aepp_2017_panellinies_net.pdf' },
  'aepp-2016': { title: 'ΑΕΠΠ - Θέματα 2016', file: '/exams/aepp/aepp_2016_panellinies_net.pdf' },
  'oefe-math-2025': { title: 'ΟΕΦΕ Μαθηματικά - Θέματα 2025', file: '/exams/oefe/math/oefe_math_2025.pdf' },
  'oefe-math-2024': { title: 'ΟΕΦΕ Μαθηματικά - Θέματα 2024', file: '/exams/oefe/math/oefe_math_2024.pdf' },
  'oefe-math-2023': { title: 'ΟΕΦΕ Μαθηματικά - Θέματα 2023', file: '/exams/oefe/math/oefe_math_2023.pdf' },
  'oefe-math-2022': { title: 'ΟΕΦΕ Μαθηματικά - Θέματα 2022', file: '/exams/oefe/math/oefe_math_2022.pdf' },
  'oefe-math-2021': { title: 'ΟΕΦΕ Μαθηματικά - Θέματα 2021', file: '/exams/oefe/math/oefe_math_2021_panellinies_net.pdf' },
  'oefe-math-2020': { title: 'ΟΕΦΕ Μαθηματικά - Θέματα 2020', file: '/exams/oefe/math/oefe_math_2020.pdf' },
  'oefe-math-2019': { title: 'ΟΕΦΕ Μαθηματικά - Θέματα 2019', file: '/exams/oefe/math/oefe_math_pros_2019_panellinies_net.pdf' },
  'oefe-aoth-2025': { title: 'ΟΕΦΕ ΑΟΘ - Θέματα 2025', file: '/exams/oefe/aoth/oefe_aoth_2025.pdf' },
  'oefe-aoth-2024': { title: 'ΟΕΦΕ ΑΟΘ - Θέματα 2024', file: '/exams/oefe/aoth/oefe_aoth_2024.pdf' },
  'oefe-aoth-2023': { title: 'ΟΕΦΕ ΑΟΘ - Θέματα 2023', file: '/exams/oefe/aoth/oefe_aoth_2023.pdf' },
  'oefe-aoth-2022': { title: 'ΟΕΦΕ ΑΟΘ - Θέματα 2022', file: '/exams/oefe/aoth/oefe_aoth_2022.pdf' },
  'oefe-aoth-2021': { title: 'ΟΕΦΕ ΑΟΘ - Θέματα 2021', file: '/exams/oefe/aoth/oefe_aoth_2021_panellinies_net.pdf' },
  'oefe-aoth-2020': { title: 'ΟΕΦΕ ΑΟΘ - Θέματα 2020', file: '/exams/oefe/aoth/oefe_aoth_2020.pdf' },
  'oefe-aoth-2019': { title: 'ΟΕΦΕ ΑΟΘ - Θέματα 2019', file: '/exams/oefe/aoth/oefe_aoth_2019_panellinies_net.pdf' },
  'oefe-aepp-2025': { title: 'ΟΕΦΕ ΑΕΠΠ - Θέματα 2025', file: '/exams/oefe/aepp/oefe_aepp_2025.pdf' },
  'oefe-aepp-2024': { title: 'ΟΕΦΕ ΑΕΠΠ - Θέματα 2024', file: '/exams/oefe/aepp/oefe_aepp_2024.pdf' },
  'oefe-aepp-2023': { title: 'ΟΕΦΕ ΑΕΠΠ - Θέματα 2023', file: '/exams/oefe/aepp/oefe_aepp_2023.pdf' },
  'oefe-aepp-2022': { title: 'ΟΕΦΕ ΑΕΠΠ - Θέματα 2022', file: '/exams/oefe/aepp/oefe_aepp_2022.pdf' },
  'oefe-aepp-2021': { title: 'ΟΕΦΕ ΑΕΠΠ - Θέματα 2021', file: '/exams/oefe/aepp/oefe_aepp_2021_panellinies_net.pdf' },
  'oefe-aepp-2020': { title: 'ΟΕΦΕ ΑΕΠΠ - Θέματα 2020', file: '/exams/oefe/aepp/oefe_aepp_2020.pdf' },
  'oefe-aepp-2019': { title: 'ΟΕΦΕ ΑΕΠΠ - Θέματα 2019', file: '/exams/oefe/aepp/oefe_aepp_2019_panellinies_net.pdf' },
};

export default function ExamDetailPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { examID } = useParams<{ examID: string }>();
  const exam = examID ? EXAM_MAP[examID] : undefined;
  const viewerRef = useRef<HTMLDivElement | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const isOefeRoute = location.pathname.startsWith('/oefe/');
  const backPath = isOefeRoute ? '/oefe' : '/exams';

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
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

  if (!exam) {
    return (
      <div className="module-d-page">
        <div className="module-d-hero">
          <h1>Η εξέταση δεν βρέθηκε</h1>
          <button className="module-b-back-button" onClick={() => navigate(backPath)} type="button">
            {isOefeRoute ? '← Επιστροφή στα θέματα ΟΕΦΕ' : '← Επιστροφή στις εξετάσεις'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="module-d-page">
      <div className="module-d-hero">
        <button className="module-b-back-button" onClick={() => navigate(backPath)} type="button">
          {isOefeRoute ? '← Πίσω στα θέματα ΟΕΦΕ' : '← Πίσω στα θέματα'}
        </button>
        <h1>{exam.title}</h1>
        <p>
          Αν δεν ανοίξει μέσα στη σελίδα, πάτησε <a href={exam.file} target="_blank" rel="noreferrer">εδώ</a> για νέο tab.
        </p>
      </div>

      <div ref={viewerRef} className={`module-d-pdf-shell ${isFullscreen ? 'fullscreen' : ''}`}>
        <div className="module-d-pdf-toolbar">
          <button className="module-d-toolbar-button" onClick={handleFullscreenToggle} type="button">
            {isFullscreen ? 'Έξοδος από full screen' : 'Full screen'}
          </button>
        </div>
        <iframe title={exam.title} src={exam.file} className="module-d-pdf-frame" />
        <PdfAiExplainPanel title={exam.title} pdfPath={exam.file} subjectHint={examID ?? 'Παλαιά θέματα'} />
      </div>
    </div>
  );
}
