export interface Section {
  id: string;
  number: string;
  title: string;
}

export interface Chapter {
  id: string;
  number: number;
  title: string;
  sections: Section[];
}

export interface ChapterGroup {
  id: string;
  title: string;
  description?: string;
  chapters: Chapter[];
}

export interface Subject {
  id: string;
  code: string;
  greekName: string;
  emoji: string;
  color: string;
  chapters: Chapter[];
  chapterGroups?: ChapterGroup[];
}

const AOTH: Chapter[] = [
  {
    id: 'aoth-1',
    number: 1,
    title: 'Βασικές Οικονομικές Έννοιες',
    sections: [
      { id: 'aoth-1-1', number: '1.1', title: 'Οικονομικό πρόβλημα' },
      { id: 'aoth-1-2', number: '1.2', title: 'Ανάγκες' },
      { id: 'aoth-1-3', number: '1.3', title: 'Αγαθά' },
      { id: 'aoth-1-4', number: '1.4', title: 'Παραγωγικοί συντελεστές' },
      { id: 'aoth-1-5', number: '1.5', title: 'Επιχειρήσεις' },
      { id: 'aoth-1-6', number: '1.6', title: 'Τεχνολογία παραγωγής (εκτός τελευταίας περιόδου)' },
      { id: 'aoth-1-7', number: '1.7', title: 'Καταμερισμός έργων' },
      { id: 'aoth-1-8', number: '1.8', title: 'Οικονομικά συστήματα' },
      { id: 'aoth-1-9', number: '1.9', title: 'Καμπύλη παραγωγικών δυνατοτήτων' },
      { id: 'aoth-1-10', number: '1.10', title: 'Ευκαιριακό κόστος' },
      { id: 'aoth-1-11', number: '1.11', title: 'Μετατοπίσεις ΚΠΔ' },
      { id: 'aoth-1-12', number: '1.12', title: 'Βασικές οικονομικές αποφάσεις' },
    ],
  },
  {
    id: 'aoth-2',
    number: 2,
    title: 'Ζήτηση αγαθών',
    sections: [
      { id: 'aoth-2-1', number: '2.1', title: 'Ζήτηση' },
      { id: 'aoth-2-2', number: '2.2', title: 'Νόμος ζήτησης' },
      { id: 'aoth-2-3', number: '2.3', title: 'Καμπύλη ζήτησης' },
      { id: 'aoth-2-4', number: '2.4', title: 'Ατομική και αγοραία ζήτηση' },
      { id: 'aoth-2-5', number: '2.5', title: 'Μεταβολές ζήτησης' },
      { id: 'aoth-2-6', number: '2.6', title: 'Μεταβολές ζητούμενης ποσότητας' },
      { id: 'aoth-2-7', number: '2.7', title: 'Εισόδημα' },
      { id: 'aoth-2-8', number: '2.8', title: 'Τιμές άλλων αγαθών' },
      { id: 'aoth-2-9', number: '2.9', title: 'Προτιμήσεις' },
      { id: 'aoth-2-10', number: '2.10', title: 'Προσδοκίες' },
      { id: 'aoth-2-11', number: '2.11', title: 'Διαφήμιση' },
      { id: 'aoth-2-12', number: '2.12', title: 'Πληθυσμός' },
      { id: 'aoth-2-13', number: '2.13', title: 'Ελαστικότητα ζήτησης (εισοδήματος)' },
      { id: 'aoth-2-14', number: '2.14', title: 'Ελαστικότητα ζήτησης (σταυροειδής)' },
      { id: 'aoth-2-15', number: '2.15', title: 'Ελαστικότητα ζήτησης (τιμής)' },
    ],
  },
  {
    id: 'aoth-3',
    number: 3,
    title: 'Παραγωγή & Κόστος',
    sections: [
      { id: 'aoth-3-1a', number: '3.1', title: 'Συνάρτηση παραγωγής' },
      { id: 'aoth-3-2a', number: '3.2', title: 'Βραχυχρόνια περίοδος' },
      { id: 'aoth-3-3a', number: '3.3', title: 'Συνολικό προϊόν' },
      { id: 'aoth-3-4a', number: '3.4', title: 'Μέσο προϊόν' },
      { id: 'aoth-3-5a', number: '3.5', title: 'Οριακό προϊόν' },
      { id: 'aoth-3-6a', number: '3.6', title: 'Νόμος φθίνουσας απόδοσης' },
      { id: 'aoth-3-7a', number: '3.7', title: 'Στάδια παραγωγής' },
      { id: 'aoth-3-8', number: '3.8', title: 'Έννοια κόστους' },
      { id: 'aoth-3-9', number: '3.9', title: 'Σταθερό κόστος' },
      { id: 'aoth-3-10', number: '3.10', title: 'Μεταβλητό κόστος' },
      { id: 'aoth-3-11', number: '3.11', title: 'Συνολικό κόστος' },
      { id: 'aoth-3-12', number: '3.12', title: 'Μέσο κόστος' },
      { id: 'aoth-3-13', number: '3.13', title: 'Οριακό κόστος' },
      { id: 'aoth-3-14', number: '3.14', title: 'Καμπύλες κόστους' },
    ],
  },
  {
    id: 'aoth-4',
    number: 4,
    title: 'Προσφορά αγαθών',
    sections: [
      { id: 'aoth-4-1', number: '4.1', title: 'Προσφορά' },
      { id: 'aoth-4-2', number: '4.2', title: 'Νόμος προσφοράς' },
      { id: 'aoth-4-3', number: '4.3', title: 'Καμπύλη προσφοράς' },
      { id: 'aoth-4-4', number: '4.4', title: 'Μεταβολές προσφοράς' },
      { id: 'aoth-4-5', number: '4.5', title: 'Μεταβολές προσφερόμενης ποσότητας' },
      { id: 'aoth-4-6', number: '4.6', title: 'Κόστος παραγωγής' },
      { id: 'aoth-4-7', number: '4.7', title: 'Τεχνολογία' },
      { id: 'aoth-4-8', number: '4.8', title: 'Φόροι - επιδοτήσεις' },
      { id: 'aoth-4-9', number: '4.9', title: 'Προσδοκίες παραγωγών' },
    ],
  },
  {
    id: 'aoth-5',
    number: 5,
    title: 'Προσδιορισμός τιμών',
    sections: [
      { id: 'aoth-5-1', number: '5.1', title: 'Ισορροπία αγοράς' },
      { id: 'aoth-5-2', number: '5.2', title: 'Τιμή ισορροπίας' },
      { id: 'aoth-5-3', number: '5.3', title: 'Πλεόνασμα' },
      { id: 'aoth-5-4', number: '5.4', title: 'Έλλειμμα' },
      { id: 'aoth-5-5', number: '5.5', title: 'Παρεμβάσεις κράτους' },
    ],
  },
  {
    id: 'aoth-7',
    number: 7,
    title: 'ΑΕΠ',
    sections: [
      { id: 'aoth-7-1', number: '7.1', title: 'Έννοια ΑΕΠ' },
      { id: 'aoth-7-2', number: '7.2', title: 'Υπολογισμός ΑΕΠ (εκτός συγκεκριμένης πρότασης)' },
      { id: 'aoth-7-3', number: '7.3', title: 'Ονομαστικό και πραγματικό ΑΕΠ' },
      { id: 'aoth-7-4', number: '7.4', title: 'Κατά κεφαλήν ΑΕΠ' },
      { id: 'aoth-7-7', number: '7.7', title: 'ΑΕΠ και ευημερία' },
      { id: 'aoth-7-9', number: '7.9', title: 'Περιορισμοί ΑΕΠ' },
      { id: 'aoth-7-10', number: '7.10', title: 'Συμπεράσματα' },
    ],
  },
  {
    id: 'aoth-9',
    number: 9,
    title: 'Πληθωρισμός - Ανεργία',
    sections: [
      { id: 'aoth-9-1', number: '9.1', title: 'Οικονομικές διακυμάνσεις' },
      { id: 'aoth-9-2', number: '9.2', title: 'Φάσεις οικονομικού κύκλου' },
      { id: 'aoth-9-3', number: '9.3', title: 'Πληθωρισμός (μέχρι συγκεκριμένο σημείο)' },
      { id: 'aoth-9-4', number: '9.4', title: 'Ανεργία (με εξαιρέσεις)' },
      { id: 'aoth-9-5', number: '9.5', title: 'Συνέπειες πληθωρισμού' },
    ],
  },
  {
    id: 'aoth-10',
    number: 10,
    title: 'Δημόσια οικονομικά',
    sections: [
      { id: 'aoth-10-3', number: '10.3', title: 'Δημόσιες δαπάνες (με εξαίρεση)' },
      { id: 'aoth-10-4', number: '10.4', title: 'Δημόσια έσοδα' },
    ],
  },
];

const MATH: Chapter[] = [
  {
    id: 'math-1',
    number: 1,
    title: 'Κεφάλαιο 1',
    sections: [
      { id: 'math-1-1', number: '1.1', title: 'Πραγματικοί αριθμοί' },
      { id: 'math-1-2', number: '1.2', title: 'Συναρτήσεις' },
      { id: 'math-1-3', number: '1.3', title: 'Μονότονες - αντίστροφη' },
      { id: 'math-1-4', number: '1.4', title: 'Όριο στο x0' },
      { id: 'math-1-5', number: '1.5', title: 'Ιδιότητες ορίων' },
      { id: 'math-1-6', number: '1.6', title: 'Μη πεπερασμένο όριο' },
      { id: 'math-1-7', number: '1.7', title: 'Όριο στο άπειρο' },
      { id: 'math-1-8', number: '1.8', title: 'Συνέχεια' },
    ],
  },
  {
    id: 'math-2',
    number: 2,
    title: 'Κεφάλαιο 2',
    sections: [
      { id: 'math-2-1', number: '2.1', title: 'Παράγωγος' },
      { id: 'math-2-2', number: '2.2', title: 'Παραγωγίσιμες' },
      { id: 'math-2-3', number: '2.3', title: 'Κανόνες' },
      { id: 'math-2-4', number: '2.4', title: 'Ρυθμός μεταβολής' },
      { id: 'math-2-5', number: '2.5', title: 'Θ.Μ.Τ.' },
      { id: 'math-2-6', number: '2.6', title: 'Συνέπειες' },
      { id: 'math-2-7', number: '2.7', title: 'Ακρότατα' },
      { id: 'math-2-8', number: '2.8', title: 'Κυρτότητα' },
      { id: 'math-2-9', number: '2.9', title: "Ασύμπτωτες - De L'Hospital" },
      { id: 'math-2-10', number: '2.10', title: 'Μελέτη συνάρτησης' },
    ],
  },
  {
    id: 'math-3',
    number: 3,
    title: 'Κεφάλαιο 3',
    sections: [
      { id: 'math-3-1', number: '3.1', title: 'Αόριστο ολοκλήρωμα' },
      { id: 'math-3-4', number: '3.4', title: 'Ορισμένο ολοκλήρωμα' },
      { id: 'math-3-5', number: '3.5', title: 'Συνάρτηση ολοκληρώματος' },
      { id: 'math-3-7', number: '3.7', title: 'Εμβαδόν' },
    ],
  },
];

const AEPP_MAIN: Chapter[] = [
  {
    id: 'aepp-1',
    number: 1,
    title: 'Ανάλυση Προβλήματος',
    sections: [
      { id: 'aepp-1-1', number: '1.1', title: 'Η έννοια προβλήματος' },
      { id: 'aepp-1-2', number: '1.2', title: 'Κατανόηση προβλήματος' },
      { id: 'aepp-1-3', number: '1.3', title: 'Δομή προβλήματος' },
      { id: 'aepp-1-4', number: '1.4', title: 'Καθορισμός απαιτήσεων' },
    ],
  },
  {
    id: 'aepp-2',
    number: 2,
    title: 'Βασικές Έννοιες Αλγορίθμων',
    sections: [
      { id: 'aepp-2-1', number: '2.1', title: 'Τι είναι αλγόριθμος' },
      { id: 'aepp-2-2', number: '2.2', title: 'Σπουδαιότητα αλγορίθμων' },
      { id: 'aepp-2-3', number: '2.3', title: 'Περιγραφή και αναπαράσταση αλγορίθμων' },
      { id: 'aepp-2-4', number: '2.4', title: 'Βασικές συνιστώσες / εντολές' },
      { id: 'aepp-2-4-1', number: '2.4.1', title: 'Δομή ακολουθίας' },
      { id: 'aepp-2-4-2', number: '2.4.2', title: 'Δομή επιλογής' },
      { id: 'aepp-2-4-3', number: '2.4.3', title: 'Διαδικασίες πολλαπλών επιλογών' },
      { id: 'aepp-2-4-4', number: '2.4.4', title: 'Εμφωλευμένες διαδικασίες' },
      { id: 'aepp-2-4-5', number: '2.4.5', title: 'Δομή επανάληψης' },
    ],
  },
  {
    id: 'aepp-3',
    number: 3,
    title: 'Δομές Δεδομένων και Αλγόριθμοι',
    sections: [
      { id: 'aepp-3-1', number: '3.1', title: 'Δεδομένα' },
      { id: 'aepp-3-2', number: '3.2', title: 'Αλγόριθμοι + Δομές Δεδομένων = Προγράμματα' },
      { id: 'aepp-3-3', number: '3.3', title: 'Πίνακες' },
      { id: 'aepp-3-4', number: '3.4', title: 'Στοίβα' },
      { id: 'aepp-3-5', number: '3.5', title: 'Ουρά' },
      { id: 'aepp-3-6', number: '3.6', title: 'Αναζήτηση' },
      { id: 'aepp-3-7', number: '3.7', title: 'Ταξινόμηση' },
    ],
  },
  {
    id: 'aepp-4',
    number: 4,
    title: 'Τεχνικές Σχεδίασης Αλγορίθμων',
    sections: [{ id: 'aepp-4-1', number: '4.1', title: 'Ανάλυση προβλημάτων' }],
  },
  {
    id: 'aepp-6',
    number: 6,
    title: 'Εισαγωγή στον Προγραμματισμό',
    sections: [
      { id: 'aepp-6-1', number: '6.1', title: 'Η έννοια του προγράμματος' },
      { id: 'aepp-6-3', number: '6.3', title: 'Φυσικές και τεχνητές γλώσσες' },
      { id: 'aepp-6-4', number: '6.4', title: 'Τεχνικές σχεδίασης προγραμμάτων' },
      { id: 'aepp-6-4-1', number: '6.4.1', title: 'Ιεραρχική σχεδίαση προγράμματος' },
      { id: 'aepp-6-4-2', number: '6.4.2', title: 'Τμηματικός προγραμματισμός' },
      { id: 'aepp-6-4-3', number: '6.4.3', title: 'Δομημένος προγραμματισμός' },
      { id: 'aepp-6-5', number: '6.5', title: 'Αντικειμενοστραφής προγραμματισμός' },
      { id: 'aepp-6-7', number: '6.7', title: 'Προγραμματιστικά περιβάλλοντα' },
    ],
  },
  {
    id: 'aepp-7',
    number: 7,
    title: 'Βασικές Έννοιες Προγραμματισμού',
    sections: [
      { id: 'aepp-7-1', number: '7.1', title: 'Το αλφάβητο της ΓΛΩΣΣΑΣ' },
      { id: 'aepp-7-2', number: '7.2', title: 'Τύποι δεδομένων' },
      { id: 'aepp-7-3', number: '7.3', title: 'Σταθερές' },
      { id: 'aepp-7-4', number: '7.4', title: 'Μεταβλητές' },
      { id: 'aepp-7-5', number: '7.5', title: 'Αριθμητικοί τελεστές' },
      { id: 'aepp-7-6', number: '7.6', title: 'Συναρτήσεις' },
      { id: 'aepp-7-7', number: '7.7', title: 'Αριθμητικές εκφράσεις' },
      { id: 'aepp-7-8', number: '7.8', title: 'Εντολή εκχώρησης' },
      { id: 'aepp-7-9', number: '7.9', title: 'Εντολές εισόδου-εξόδου' },
      { id: 'aepp-7-10', number: '7.10', title: 'Δομή προγράμματος' },
    ],
  },
  {
    id: 'aepp-8',
    number: 8,
    title: 'Επιλογή και Επανάληψη',
    sections: [
      { id: 'aepp-8-1', number: '8.1', title: 'Εντολές επιλογής' },
      { id: 'aepp-8-1-1', number: '8.1.1', title: 'Εντολή ΑΝ' },
      { id: 'aepp-8-1-2', number: '8.1.2', title: 'Εντολή ΕΠΙΛΕΞΕ' },
      { id: 'aepp-8-2', number: '8.2', title: 'Εντολές επανάληψης' },
      { id: 'aepp-8-2-1', number: '8.2.1', title: 'Εντολή ΟΣΟ...ΕΠΑΝΑΛΑΒΕ' },
      { id: 'aepp-8-2-2', number: '8.2.2', title: 'Εντολή ΜΕΧΡΙΣ_ΟΤΟΥ' },
      { id: 'aepp-8-2-3', number: '8.2.3', title: 'Εντολή ΓΙΑ...ΑΠΟ...ΜΕΧΡΙ' },
    ],
  },
  {
    id: 'aepp-9',
    number: 9,
    title: 'Πίνακες',
    sections: [
      { id: 'aepp-9-1', number: '9.1', title: 'Μονοδιάστατοι πίνακες' },
      { id: 'aepp-9-2', number: '9.2', title: 'Πότε χρησιμοποιούνται πίνακες' },
      { id: 'aepp-9-3', number: '9.3', title: 'Πολυδιάστατοι πίνακες' },
      { id: 'aepp-9-4', number: '9.4', title: 'Τυπικές επεξεργασίες πινάκων' },
    ],
  },
  {
    id: 'aepp-10',
    number: 10,
    title: 'Υποπρογράμματα',
    sections: [
      { id: 'aepp-10-1', number: '10.1', title: 'Τμηματικός προγραμματισμός' },
      { id: 'aepp-10-2', number: '10.2', title: 'Χαρακτηριστικά υποπρογραμμάτων' },
      { id: 'aepp-10-3', number: '10.3', title: 'Πλεονεκτήματα' },
      { id: 'aepp-10-4', number: '10.4', title: 'Παράμετροι' },
      { id: 'aepp-10-5', number: '10.5', title: 'Διαδικασίες και συναρτήσεις' },
      { id: 'aepp-10-5-1', number: '10.5.1', title: 'Ορισμός και κλήση συναρτήσεων' },
      { id: 'aepp-10-5-2', number: '10.5.2', title: 'Ορισμός και κλήση διαδικασιών' },
      { id: 'aepp-10-5-3', number: '10.5.3', title: 'Πραγματικές και τυπικές παράμετροι' },
      { id: 'aepp-10-6', number: '10.6', title: 'Εμβέλεια μεταβλητών - σταθερών' },
    ],
  },
  {
    id: 'aepp-13',
    number: 13,
    title: 'Εκσφαλμάτωση Προγράμματος',
    sections: [],
  },
];

const AEPP_SUPPLEMENTARY: Chapter[] = [
  {
    id: 'aepp-supp-1',
    number: 1,
    title: 'Δομές Δεδομένων και Αλγόριθμοι',
    sections: [
      { id: 'aepp-supp-1-1', number: '1.1', title: 'Στοίβα' },
      { id: 'aepp-supp-1-1-1', number: '1.1.1', title: 'Παραδείγματα υλοποίησης στοίβας' },
      { id: 'aepp-supp-1-1-2', number: '1.1.2', title: 'Ερωτήσεις - Ασκήσεις' },
      { id: 'aepp-supp-1-2', number: '1.2', title: 'Ουρά' },
      { id: 'aepp-supp-1-2-1', number: '1.2.1', title: 'Παραδείγματα υλοποίησης ουράς' },
      { id: 'aepp-supp-1-2-2', number: '1.2.2', title: 'Ερωτήσεις - Ασκήσεις' },
      { id: 'aepp-supp-1-3', number: '1.3', title: 'Άλλες δομές δεδομένων' },
      { id: 'aepp-supp-1-3-1', number: '1.3.1', title: 'Λίστες' },
      { id: 'aepp-supp-1-3-2', number: '1.3.2', title: 'Δένδρα' },
      { id: 'aepp-supp-1-3-3', number: '1.3.3', title: 'Γράφοι' },
      { id: 'aepp-supp-1-3-4', number: '1.3.4', title: 'Ερωτήσεις - Ασκήσεις' },
    ],
  },
  {
    id: 'aepp-supp-2',
    number: 2,
    title: 'Τεχνικές Σχεδίασης Αλγορίθμων',
    sections: [{ id: 'aepp-supp-2-1', number: '2.1', title: 'Μέθοδος Διαίρει και Βασίλευε' }],
  },
  {
    id: 'aepp-supp-3',
    number: 3,
    title: 'Επιλογή και Επανάληψη',
    sections: [
      { id: 'aepp-supp-3-1', number: '3.1', title: 'Εντολή ΕΠΙΛΕΞΕ' },
      { id: 'aepp-supp-3-1-1', number: '3.1.1', title: 'Παραδείγματα με χρήση της ΕΠΙΛΕΞΕ' },
      { id: 'aepp-supp-3-1-2', number: '3.1.2', title: 'Ερωτήσεις - Ασκήσεις' },
    ],
  },
  {
    id: 'aepp-supp-4',
    number: 4,
    title: 'Σύγχρονα Προγραμματιστικά Περιβάλλοντα',
    sections: [
      { id: 'aepp-supp-4-1', number: '4.1', title: 'Αντικειμενοστραφής προγραμματισμός' },
      { id: 'aepp-supp-4-2', number: '4.2', title: 'Χτίζοντας αντικειμενοστραφή προγράμματα' },
      { id: 'aepp-supp-4-2-1', number: '4.2.1', title: 'Μεθοδολογία' },
      { id: 'aepp-supp-4-2-2', number: '4.2.2', title: 'Διαγραμματική αναπαράσταση' },
      { id: 'aepp-supp-4-3', number: '4.3', title: 'Ομαδοποίηση αντικειμένων σε κλάσεις' },
      { id: 'aepp-supp-4-3-1', number: '4.3.1', title: 'Παραδείγματα αναπαράστασης κλάσεων' },
      { id: 'aepp-supp-4-4', number: '4.4', title: 'Κλάσεις πρόγονοι - απόγονοι' },
      { id: 'aepp-supp-4-5', number: '4.5', title: 'Πολυμορφισμός' },
      { id: 'aepp-supp-4-6', number: '4.6', title: 'Ερωτήσεις - Ασκήσεις' },
    ],
  },
  {
    id: 'aepp-supp-5',
    number: 5,
    title: 'Εκσφαλμάτωση Προγράμματος',
    sections: [
      { id: 'aepp-supp-5-1', number: '5.1', title: 'Κατηγορίες λαθών' },
      { id: 'aepp-supp-5-1-1', number: '5.1.1', title: 'Συντακτικά λάθη' },
      { id: 'aepp-supp-5-1-2', number: '5.1.2', title: 'Λάθη εκτέλεσης' },
      { id: 'aepp-supp-5-1-3', number: '5.1.3', title: 'Λογικά λάθη' },
      { id: 'aepp-supp-5-2', number: '5.2', title: 'Εκσφαλμάτωση' },
      { id: 'aepp-supp-5-2-1', number: '5.2.1', title: 'Εκσφαλμάτωση σε επιλογές' },
      { id: 'aepp-supp-5-2-2', number: '5.2.2', title: 'Εκσφαλμάτωση σε επαναλήψεις' },
      { id: 'aepp-supp-5-2-3', number: '5.2.3', title: 'Εκσφαλμάτωση σε πίνακες' },
      { id: 'aepp-supp-5-2-4', number: '5.2.4', title: 'Εκσφαλμάτωση σε υποπρογράμματα' },
      { id: 'aepp-supp-5-2-5', number: '5.2.5', title: 'Μέθοδος «Μαύρο κουτί»' },
      { id: 'aepp-supp-13-1', number: '13.1', title: 'Κατηγορίες λαθών' },
      { id: 'aepp-supp-13-2', number: '13.2', title: 'Εκσφαλμάτωση' },
    ],
  },
];

export const SUBJECTS: Subject[] = [
  {
    id: 'aoth',
    code: 'ΑΟΘ',
    greekName: 'Αρχές Οικονομικής Θεωρίας',
    emoji: '💰',
    color: '#2563eb',
    chapters: AOTH,
  },
  {
    id: 'math',
    code: 'ΜΑΘΗΜΑΤΙΚΑ',
    greekName: 'Μαθηματικά',
    emoji: '📘',
    color: '#7c3aed',
    chapters: MATH,
  },
  {
    id: 'aepp',
    code: 'ΑΕΠΠ',
    greekName: 'Ανάπτυξη Εφαρμογών σε Προγραμματιστικό Περιβάλλον',
    emoji: '💻',
    color: '#059669',
    chapters: [...AEPP_MAIN, ...AEPP_SUPPLEMENTARY],
    chapterGroups: [
      {
        id: 'aepp-main',
        title: '💻 ΑΕΠΠ - Βιβλίο 1 (Ανάπτυξη Εφαρμογών)',
        description: 'Σχολικό βιβλίο',
        chapters: AEPP_MAIN,
      },
      {
        id: 'aepp-supplementary',
        title: '📚 ΑΕΠΠ - Συμπληρωματικό Υλικό',
        description: 'Ενότητες από το συμπληρωματικό υλικό',
        chapters: AEPP_SUPPLEMENTARY,
      },
    ],
  },
];

export const getSubjectById = (id: string): Subject | undefined => {
  return SUBJECTS.find((subject) => subject.id === id);
};
