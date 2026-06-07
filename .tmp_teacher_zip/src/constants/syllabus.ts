
export type SubjectId = 'math' | 'economics' | 'informatics';

export interface Chapter {
  id: string;
  title: string;
  subsections?: string[];
}

export interface Subject {
  id: SubjectId;
  name: string;
  fullName: string;
  icon: string;
  chapters: Chapter[];
}

export const SYLLABUS: Subject[] = [
  {
    id: 'math',
    name: 'Μαθηματικά',
    fullName: 'Μαθηματικά Προσανατολισμού',
    icon: '📐',
    chapters: [
      { 
        id: '1', 
        title: 'Όρια - Συνέχεια', 
        subsections: ['Πραγματικοί αριθμοί', 'Συναρτήσεις', 'Μονότονες - αντίστροφη', 'Όριο στο x0', 'Ιδιότητες ορίων', 'Μη πεπερασμένο όριο', 'Όριο στο άπειρο', 'Συνέχεια']
      },
      { 
        id: '2', 
        title: 'Διαφορικός Λογισμός', 
        subsections: ['Έννοια παραγώγου', 'Κανόνες παραγώγισης', 'Ρυθμός μεταβολής', 'Θ.Μ.Τ.', 'Μονοτονία - Ακρότατα', 'Κυρτότητα - Ασύμπτωτες']
      },
      { 
        id: '3', 
        title: 'Ολοκληρωτικός Λογισμός', 
        subsections: ['Αρχική συνάρτηση', 'Ορισμένο ολοκλήρωμα', 'Εμβαδόν χωρίου']
      }
    ]
  },
  {
    id: 'economics',
    name: 'ΑΟΘ',
    fullName: 'Αρχές Οικονομικής Θεωρίας (ΑΟΘ)',
    icon: '💼',
    chapters: [
      { id: '1', title: 'Βασικές Οικονομικές Έννοιες' },
      { id: '2', title: 'Η ζήτηση των αγαθών' },
      { id: '3', title: 'Η παραγωγή της επιχείρησης και το κόστος' },
      { id: '4', title: 'Η προσφορά των αγαθών' },
      { id: '5', title: 'Ο προσδιορισμός των τιμών' },
      { id: '7', title: 'Ακαθάριστο Εγχώριο Προϊόν' },
      { id: '9', title: 'Το τραπεζικό σύστημα και το χρήμα' },
      { id: '10', title: 'Πληθωρισμός, Ανεργία' }
    ]
  },
  {
    id: 'informatics',
    name: 'ΑΕΠΠ',
    fullName: 'Ανάπτυξη Εφαρμογών σε Πρ. Περιβάλλον (ΑΕΠΠ)',
    icon: '💻',
    chapters: [
      { id: '1', title: 'Εισαγωγή στην Πληροφορική' },
      { id: '2', title: 'Δομή Επιλογής & Επανάληψης' },
      { id: '3', title: 'Πίνακες' },
      { id: '4', title: 'Στοίβα & Ουρά' },
      { id: '5', title: 'Αλγόριθμοι' },
      { id: '6', title: 'Υποπρογράμματα' }
    ]
  }
];
