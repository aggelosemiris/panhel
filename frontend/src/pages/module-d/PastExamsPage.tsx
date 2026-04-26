import React from 'react';
import { useNavigate } from 'react-router-dom';
import SubjectSelector from '../../components/SubjectSelector.tsx';

const EXAMS_BY_SUBJECT = {
  MATH: {
    title: '📐 Μαθηματικά - Παλαιά Θέματα',
    description: 'Επίλεξε έτος για να ανοίξεις το αντίστοιχο PDF θεμάτων.',
    routePrefix: 'math',
    exams: [
      { year: 2025, file: '/exams/math/math_2025.pdf' },
      { year: 2024, file: '/exams/math/math_2024.pdf' },
      { year: 2023, file: '/exams/math/math_2023.pdf' },
      { year: 2022, file: '/exams/math/math_2022.pdf' },
      { year: 2021, file: '/exams/math/math_2021_panellinies_net.pdf' },
      { year: 2020, file: '/exams/math/math_2020_panellinies_net.pdf' },
      { year: 2019, file: '/exams/math/math_pros_2019_panellinies_net.pdf' },
      { year: 2018, file: '/exams/math/math_pros_2018_panellinies_net.pdf' },
      { year: 2017, file: '/exams/math/math_kat_2017_panellinies_net.pdf' },
      { year: 2016, file: '/exams/math/math_kat_2016_panellinies_net.pdf' },
    ],
  },
  AOTh: {
    title: '💼 ΑΟΘ - Παλαιά Θέματα',
    description: 'Επίλεξε έτος για να ανοίξεις το αντίστοιχο PDF θεμάτων.',
    routePrefix: 'aoth',
    exams: [
      { year: 2025, file: '/exams/aoth/aoth_2025_00.pdf' },
      { year: 2024, file: '/exams/aoth/aoth_2024.pdf' },
      { year: 2023, file: '/exams/aoth/aoth_2023.pdf' },
      { year: 2022, file: '/exams/aoth/aoth_2022.pdf' },
      { year: 2021, file: '/exams/aoth/aoth_2021_panellinies_net.pdf' },
      { year: 2020, file: '/exams/aoth/aoth_2020_panellinies_net (1).pdf' },
      { year: 2019, file: '/exams/aoth/aoth_2019_panellinies_net.pdf' },
      { year: 2018, file: '/exams/aoth/aoth_2018_panellinies_net.pdf' },
      { year: 2017, file: '/exams/aoth/aoth_2017_panellinies_net.pdf' },
      { year: 2016, file: '/exams/aoth/aoth_2016_panellinies_net.pdf' },
    ],
  },
  AEPP: {
    title: '💻 ΑΕΠΠ - Παλαιά Θέματα',
    description: 'Επίλεξε έτος για να ανοίξεις το αντίστοιχο PDF θεμάτων.',
    routePrefix: 'aepp',
    exams: [
      { year: 2025, file: '/exams/aepp/aepp_2025 (1).pdf' },
      { year: 2024, file: '/exams/aepp/aepp_2024.pdf' },
      { year: 2023, file: '/exams/aepp/aepp_2023.pdf' },
      { year: 2022, file: '/exams/aepp/aepp_2022.pdf' },
      { year: 2021, file: '/exams/aepp/aepp_2021_panellinies_net.pdf' },
      { year: 2020, file: '/exams/aepp/aepp_2020_panellinies_net.pdf' },
      { year: 2019, file: '/exams/aepp/aepp_2019_panellinies_net.pdf' },
      { year: 2018, file: '/exams/aepp/aepp_2018_panellinies_net.pdf' },
      { year: 2017, file: '/exams/aepp/aepp_2017_panellinies_net.pdf' },
      { year: 2016, file: '/exams/aepp/aepp_2016_panellinies_net.pdf' },
    ],
  },
} as const;

export default function PastExamsPage() {
  const navigate = useNavigate();
  const [selectedSubject, setSelectedSubject] = React.useState<'MATH' | 'AOTh' | 'AEPP' | null>(null);

  if (!selectedSubject) {
    return <SubjectSelector onSelect={setSelectedSubject} />;
  }

  const subjectConfig = EXAMS_BY_SUBJECT[selectedSubject as 'MATH' | 'AOTh' | 'AEPP'];

  if (!subjectConfig) {
    return (
      <div className="module-d-page">
        <div className="module-d-hero">
          <button className="module-b-back-button" onClick={() => setSelectedSubject(null)}>
            ← Πίσω στα μαθήματα
          </button>
          <h1>Ενότητα Δ: Παλαιές Εξετάσεις</h1>
          <p>Προς το παρόν έχουν προστεθεί μόνο τα θέματα Μαθηματικών, ΑΟΘ και ΑΕΠΠ για τα έτη 2016-2025.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="module-d-page">
      <div className="module-d-hero">
        <button className="module-b-back-button" onClick={() => setSelectedSubject(null)}>
          ← Πίσω στα μαθήματα
        </button>
        <h1>{subjectConfig.title}</h1>
        <p>{subjectConfig.description}</p>
      </div>

      <div className="module-d-years-grid">
        {subjectConfig.exams.map((exam) => (
          <button
            key={exam.year}
            className="module-d-year-card"
            onClick={() => navigate(`/exams/${subjectConfig.routePrefix}-${exam.year}`)}
          >
            <span className="module-d-year-label">Θέματα {exam.year}</span>
            <span className="module-d-year-action">Άνοιγμα PDF</span>
          </button>
        ))}
      </div>
    </div>
  );
}
