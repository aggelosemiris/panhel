import React from 'react';
import { useNavigate } from 'react-router-dom';
import SubjectSelector from '../components/SubjectSelector.tsx';

type SubjectCode = 'MATH' | 'AOTh' | 'AEPP';

const OEFE_EXAMS_BY_SUBJECT = {
  MATH: {
    title: '📐 Μαθηματικά - Παλιά θέματα ΟΕΦΕ',
    description: 'Επίλεξε έτος για να ανοίξεις το αντίστοιχο PDF θεμάτων ΟΕΦΕ.',
    routePrefix: 'math',
    exams: [2025, 2024, 2023, 2022, 2021, 2020, 2019],
  },
  AOTh: {
    title: '💼 ΑΟΘ - Παλιά θέματα ΟΕΦΕ',
    description: 'Επίλεξε έτος για να ανοίξεις το αντίστοιχο PDF θεμάτων ΟΕΦΕ.',
    routePrefix: 'aoth',
    exams: [2025, 2024, 2023, 2022, 2021, 2020, 2019],
  },
  AEPP: {
    title: '💻 ΑΕΠΠ - Παλιά θέματα ΟΕΦΕ',
    description: 'Επίλεξε έτος για να ανοίξεις το αντίστοιχο PDF θεμάτων ΟΕΦΕ.',
    routePrefix: 'aepp',
    exams: [2025, 2024, 2023, 2022, 2021, 2020, 2019],
  },
} as const;

export default function OefePage() {
  const navigate = useNavigate();
  const [selectedSubject, setSelectedSubject] = React.useState<SubjectCode | null>(null);

  if (!selectedSubject) {
    return <SubjectSelector onSelect={setSelectedSubject} />;
  }

  const subjectConfig = OEFE_EXAMS_BY_SUBJECT[selectedSubject];

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
        {subjectConfig.exams.map((year) => (
          <button
            key={year}
            className="module-d-year-card"
            onClick={() => navigate(`/oefe/oefe-${subjectConfig.routePrefix}-${year}`)}
            type="button"
          >
            <span className="module-d-year-label">{`Θέματα ${year}`}</span>
            <span className="module-d-year-action">Άνοιγμα PDF</span>
          </button>
        ))}
      </div>
    </div>
  );
}
