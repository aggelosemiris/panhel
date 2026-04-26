export type SosTopic = {
  id: string;
  subject: 'math' | 'aoth' | 'aepp';
  subjectLabel: string;
  chapter: string;
  title: string;
  frequency: number;
  examYears: number[];
  whyImportant: string;
  suggestedAction: string;
  relatedExamIds: string[];
};

export const SOS_TOPICS: SosTopic[] = [
  {
    id: 'math-derivatives-study',
    subject: 'math',
    subjectLabel: 'Μαθηματικά',
    chapter: 'Κεφάλαιο 2',
    title: 'Παράγωγοι, μονοτονία, ακρότατα και κυρτότητα',
    frequency: 95,
    examYears: [2025, 2024, 2023, 2022, 2021],
    whyImportant: 'Εμφανίζεται σχεδόν κάθε χρόνο σε Θέμα Β, Γ ή Δ και ενώνει τεχνικές παραγώγου με αιτιολόγηση.',
    suggestedAction: 'Λύσε ένα Θέμα Β και ένα Θέμα Γ με πλήρη μελέτη συνάρτησης.',
    relatedExamIds: ['math-2025', 'math-2024', 'math-2023'],
  },
  {
    id: 'math-limits-continuity',
    subject: 'math',
    subjectLabel: 'Μαθηματικά',
    chapter: 'Κεφάλαιο 1',
    title: 'Όρια, συνέχεια και Θεώρημα Ενδιάμεσων Τιμών',
    frequency: 88,
    examYears: [2025, 2024, 2022, 2020, 2019],
    whyImportant: 'Χρησιμοποιείται ως θεωρία στο Θέμα Α και ως εργαλείο μέσα σε Θέματα Γ/Δ.',
    suggestedAction: 'Κάνε επανάληψη ορισμών και λύσε άσκηση με συνέχεια/ρίζες.',
    relatedExamIds: ['math-2025', 'math-2024', 'math-2022'],
  },
  {
    id: 'math-integrals-area',
    subject: 'math',
    subjectLabel: 'Μαθηματικά',
    chapter: 'Κεφάλαιο 3',
    title: 'Ολοκληρώματα και εμβαδόν χωρίου',
    frequency: 72,
    examYears: [2024, 2023, 2021, 2020],
    whyImportant: 'Συχνά ζητείται στο τέλος μιας άσκησης για να συνδέσει γραφική παράσταση και υπολογισμό.',
    suggestedAction: 'Δούλεψε ορισμένο ολοκλήρωμα, αλλαγή ορίων και εμβαδόν μεταξύ καμπυλών.',
    relatedExamIds: ['math-2024', 'math-2023', 'math-2021'],
  },
  {
    id: 'aoth-demand-elasticity',
    subject: 'aoth',
    subjectLabel: 'ΑΟΘ',
    chapter: 'Κεφάλαιο 2',
    title: 'Ζήτηση και ελαστικότητα ζήτησης',
    frequency: 94,
    examYears: [2025, 2024, 2022, 2021, 2019],
    whyImportant: 'Συνδυάζει θεωρία, υπολογισμούς και οικονομική ερμηνεία, άρα είναι ιδανικό για Θέμα Γ/Δ.',
    suggestedAction: 'Κάνε μία άσκηση με μεταβολή τιμής, έσοδα και χαρακτηρισμό ελαστικότητας.',
    relatedExamIds: ['aoth-2025', 'aoth-2024', 'aoth-2022'],
  },
  {
    id: 'aoth-supply-equilibrium',
    subject: 'aoth',
    subjectLabel: 'ΑΟΘ',
    chapter: 'Κεφάλαια 4-5',
    title: 'Προσφορά, ισορροπία αγοράς και κρατική παρέμβαση',
    frequency: 90,
    examYears: [2025, 2023, 2022, 2020, 2018],
    whyImportant: 'Είναι από τα πιο κλασικά τελευταία θέματα, γιατί έχει συναρτήσεις, τιμή ισορροπίας και ερμηνεία.',
    suggestedAction: 'Λύσε άσκηση με κατώτατη/ανώτατη τιμή και πλεόνασμα ή έλλειμμα.',
    relatedExamIds: ['aoth-2025', 'aoth-2023', 'aoth-2022'],
  },
  {
    id: 'aoth-kpd-cost',
    subject: 'aoth',
    subjectLabel: 'ΑΟΘ',
    chapter: 'Κεφάλαιο 1',
    title: 'ΚΠΔ και κόστος ευκαιρίας',
    frequency: 82,
    examYears: [2025, 2021, 2020, 2017],
    whyImportant: 'Ελέγχει αν ο μαθητής μπορεί να κάνει υπολογισμό και να εξηγήσει οικονομικά τη θυσία παραγωγής.',
    suggestedAction: 'Κάνε πίνακα ΚΠΔ και υπολόγισε κόστος ευκαιρίας σε δύο διαδοχικά σημεία.',
    relatedExamIds: ['aoth-2025', 'aoth-2021', 'aoth-2020'],
  },
  {
    id: 'aepp-arrays',
    subject: 'aepp',
    subjectLabel: 'ΑΕΠΠ',
    chapter: 'Κεφάλαιο 9',
    title: 'Πίνακες, ταξινόμηση και αναζήτηση',
    frequency: 96,
    examYears: [2025, 2024, 2023, 2022, 2021],
    whyImportant: 'Οι πίνακες είναι κεντρικός μηχανισμός για Θέμα Γ και κυρίως Θέμα Δ.',
    suggestedAction: 'Γράψε πρόγραμμα με 1Δ/2Δ πίνακες, έλεγχο εγκυρότητας και ταξινόμηση.',
    relatedExamIds: ['aepp-2025', 'aepp-2024', 'aepp-2023'],
  },
  {
    id: 'aepp-repetition-selection',
    subject: 'aepp',
    subjectLabel: 'ΑΕΠΠ',
    chapter: 'Κεφάλαιο 8',
    title: 'Επιλογή και επανάληψη',
    frequency: 92,
    examYears: [2025, 2024, 2022, 2020, 2019],
    whyImportant: 'Χωρίς σωστή ροή ΑΝ/ΟΣΟ/ΓΙΑ δεν στέκεται κανένα ολοκληρωμένο πρόγραμμα.',
    suggestedAction: 'Λύσε άσκηση με sentinel, μετρητές, αθροιστές και μέγιστο.',
    relatedExamIds: ['aepp-2025', 'aepp-2024', 'aepp-2022'],
  },
  {
    id: 'aepp-subprograms',
    subject: 'aepp',
    subjectLabel: 'ΑΕΠΠ',
    chapter: 'Κεφάλαιο 10',
    title: 'Υποπρογράμματα, παράμετροι και εμβέλεια',
    frequency: 78,
    examYears: [2025, 2023, 2021, 2019],
    whyImportant: 'Συχνά μπαίνει ως θεωρία ή ως κομμάτι σύνθετης άσκησης με συνάρτηση/διαδικασία.',
    suggestedAction: 'Δούλεψε πραγματικές/τυπικές παραμέτρους και διαφορά συνάρτησης-διαδικασίας.',
    relatedExamIds: ['aepp-2025', 'aepp-2023', 'aepp-2021'],
  },
];

export const SOS_SUBJECTS = [
  { id: 'all', label: 'Όλα' },
  { id: 'math', label: 'Μαθηματικά' },
  { id: 'aoth', label: 'ΑΟΘ' },
  { id: 'aepp', label: 'ΑΕΠΠ' },
] as const;
