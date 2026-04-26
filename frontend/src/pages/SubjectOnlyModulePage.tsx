import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import SubjectSelector from '../components/SubjectSelector.tsx';

type SubjectCode = 'MATH' | 'AOTh' | 'AEPP';

interface ModuleConfig {
  title: string;
  subtitle: string;
  selectedTitle: string;
  selectedDescription: string;
}

const MODULE_CONFIG: Record<string, ModuleConfig> = {
  methodology: {
    title: 'Μεθοδολογία - Επεξήγηση Κεφαλαίων',
    subtitle: 'Επιλέξτε μάθημα για να οργανώσουμε το υλικό της μεθοδολογίας και της επεξήγησης ανά κεφάλαιο.',
    selectedTitle: 'Μεθοδολογία - Επεξήγηση Κεφαλαίων',
    selectedDescription: 'Το περιεχόμενο για το επιλεγμένο μάθημα θα προστεθεί εδώ στο επόμενο βήμα.',
  },
  'topic-a': {
    title: 'Μόνο Θέμα Α',
    subtitle: 'Επιλέξτε μάθημα για να δουλέψουμε αποκλειστικά θέματα τύπου Α.',
    selectedTitle: 'Μόνο Θέμα Α',
    selectedDescription: 'Οι επιλογές και το περιεχόμενο για το Θέμα Α θα μπουν εδώ στο επόμενο βήμα.',
  },
  'topic-b': {
    title: 'Μόνο Θέμα Β',
    subtitle: 'Επιλέξτε μάθημα για να δουλέψουμε αποκλειστικά θέματα τύπου Β.',
    selectedTitle: 'Μόνο Θέμα Β',
    selectedDescription: 'Οι επιλογές και το περιεχόμενο για το Θέμα Β θα μπουν εδώ στο επόμενο βήμα.',
  },
  'topic-c': {
    title: 'Μόνο Θέμα Γ',
    subtitle: 'Επιλέξτε μάθημα για να δουλέψουμε αποκλειστικά θέματα τύπου Γ.',
    selectedTitle: 'Μόνο Θέμα Γ',
    selectedDescription: 'Οι επιλογές και το περιεχόμενο για το Θέμα Γ θα μπουν εδώ στο επόμενο βήμα.',
  },
  'topic-d': {
    title: 'Μόνο Θέμα Δ',
    subtitle: 'Επιλέξτε μάθημα για να δουλέψουμε αποκλειστικά θέματα τύπου Δ.',
    selectedTitle: 'Μόνο Θέμα Δ',
    selectedDescription: 'Οι επιλογές και το περιεχόμενο για το Θέμα Δ θα μπουν εδώ στο επόμενο βήμα.',
  },
  'true-false': {
    title: 'Σωστό ή Λάθος',
    subtitle: 'Επιλέξτε μάθημα για να οργανώσουμε τις ασκήσεις σωστού ή λάθους.',
    selectedTitle: 'Σωστό ή Λάθος',
    selectedDescription: 'Οι επιλογές και το περιεχόμενο για τις ασκήσεις σωστού ή λάθους θα μπουν εδώ στο επόμενο βήμα.',
  },
  'specialized-teacher': {
    title: 'Εξειδικευμένος Καθηγητής',
    subtitle: 'Επιλέξτε μάθημα για να φτιάξουμε την εμπειρία του εξειδικευμένου καθηγητή ανά αντικείμενο.',
    selectedTitle: 'Εξειδικευμένος Καθηγητής',
    selectedDescription: 'Οι λειτουργίες του εξειδικευμένου καθηγητή για το επιλεγμένο μάθημα θα μπουν εδώ στο επόμενο βήμα.',
  },
};

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

interface SubjectOnlyModulePageProps {
  moduleKey?: string;
}

export default function SubjectOnlyModulePage({ moduleKey: moduleKeyProp }: SubjectOnlyModulePageProps) {
  const navigate = useNavigate();
  const { moduleKey: moduleKeyParam = '', subjectID } = useParams();
  const moduleKey = moduleKeyProp ?? moduleKeyParam;
  const config = MODULE_CONFIG[moduleKey];

  if (!config) {
    return null;
  }

  const handleSelect = (subject: SubjectCode) => {
    navigate(`/${moduleKey}/${SUBJECT_ROUTE_MAP[subject]}`);
  };

  if (!subjectID) {
    return <SubjectSelector onSelect={handleSelect} />;
  }

  return (
    <div className="simple-module-page subject-module-page">
      <div className="module-b-hero">
        <button className="module-b-back-button" onClick={() => navigate(`/${moduleKey}`)}>
          ← Πίσω στα μαθήματα
        </button>
        <h1>{config.selectedTitle}</h1>
        <p>
          Επιλεγμένο μάθημα: <strong>{SUBJECT_LABELS[subjectID] ?? subjectID}</strong>
        </p>
      </div>

      <section className="generator-panel subject-module-panel">
        <h2>{config.selectedTitle}</h2>
        <p>{config.selectedDescription}</p>
      </section>
    </div>
  );
}
