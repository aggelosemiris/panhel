import { FILE_BASED_QUIZ_BANKS } from './fileBasedQuizBanks.ts';
import { SUBJECTS, getSubjectById } from './curricula.ts';

export type TheoryQuizQuestion = {
  id?: string;
  subjectId?: string;
  chapterId?: string;
  prompt: string;
  options: string[];
  answer: string;
  explanation?: string;
};

export type TheoryQuizEntry = {
  chapterId: string;
  question: TheoryQuizQuestion;
};

export const THEORY_QUIZ_DATA: Record<string, TheoryQuizEntry> = {
  'math-1': {
    chapterId: 'math-1',
    question: {
      prompt: 'Αν μια συνάρτηση έχει όριο στο x0 ίσο με f(x0), τότε στο x0 είναι:',
      options: ['παραγωγίσιμη', 'συνεχής', 'πάντα γνησίως αύξουσα', 'πάντα άρτια'],
      answer: 'συνεχής',
      explanation: 'Αυτός είναι ο βασικός ορισμός της συνέχειας στο σημείο x0.',
    },
  },
  'math-2': {
    chapterId: 'math-2',
    question: {
      prompt: "Για τη συνάρτηση f(x)=x^2, ποια είναι η παράγωγος f'(x);",
      options: ['x', '2x', 'x^2', '2'],
      answer: '2x',
      explanation: 'Η παράγωγος της x^2 είναι 2x.',
    },
  },
  'math-3': {
    chapterId: 'math-3',
    question: {
      prompt: 'Το αόριστο ολοκλήρωμα ∫(x^2)dx είναι:',
      options: ['x^2/2 + c', 'x^3/3 + c', '2x + c', 'x^3 + c'],
      answer: 'x^3/3 + c',
      explanation: 'Η αρχική συνάρτηση της x^2 είναι x^3/3 + c.',
    },
  },
  'aoth-1': {
    chapterId: 'aoth-1',
    question: {
      prompt: 'Το οικονομικό πρόβλημα εκφράζει κυρίως:',
      options: [
        'τα αγαθά που χρησιμοποιούνται για παραγωγή άλλων αγαθών',
        'την αξία της καλύτερης εναλλακτικής που θυσιάζεται',
        'την ανεπάρκεια των πόρων σε σχέση με τις ανάγκες',
        'τα αγαθά που χρησιμοποιούνται άμεσα για ικανοποίηση αναγκών',
      ],
      answer: 'την ανεπάρκεια των πόρων σε σχέση με τις ανάγκες',
      explanation: 'Στο ΑΟΘ αυτός είναι ο βασικός ορισμός του οικονομικού προβλήματος.',
    },
  },
  'aoth-2': {
    chapterId: 'aoth-2',
    question: {
      prompt: 'Αν αυξηθεί το εισόδημα και το αγαθό είναι κανονικό, τότε συνήθως:',
      options: [
        'η ζήτηση αυξάνεται',
        'η ζήτηση μειώνεται',
        'η καμπύλη ζήτησης μένει πάντα ίδια',
        'μεταβάλλεται μόνο η προσφορά',
      ],
      answer: 'η ζήτηση αυξάνεται',
      explanation: 'Για κανονικά αγαθά, η αύξηση εισοδήματος μετατοπίζει τη ζήτηση προς τα δεξιά.',
    },
  },
  'aoth-3': {
    chapterId: 'aoth-3',
    question: {
      prompt: 'Το σταθερό κόστος στο βραχυχρόνιο διάστημα:',
      options: [
        'μεταβάλλεται με την ποσότητα παραγωγής',
        'παραμένει αμετάβλητο όταν αλλάζει η παραγωγή',
        'είναι πάντα ίσο με το μεταβλητό κόστος',
        'μηδενίζεται όταν αυξάνεται η παραγωγή',
      ],
      answer: 'παραμένει αμετάβλητο όταν αλλάζει η παραγωγή',
      explanation: 'Το σταθερό κόστος δεν εξαρτάται από την παραγόμενη ποσότητα στο βραχυχρόνιο διάστημα.',
    },
  },
  'aoth-4': {
    chapterId: 'aoth-4',
    question: {
      prompt: 'Η βελτίωση της τεχνολογίας συνήθως:',
      options: [
        'αυξάνει την προσφορά',
        'μειώνει πάντα τη ζήτηση',
        'δεν επηρεάζει την αγορά',
        'αυξάνει μόνο την τιμή',
      ],
      answer: 'αυξάνει την προσφορά',
      explanation: 'Η καλύτερη τεχνολογία μειώνει συνήθως το κόστος και μετατοπίζει την προσφορά προς τα δεξιά.',
    },
  },
  'aoth-5': {
    chapterId: 'aoth-5',
    question: {
      prompt: 'Ισορροπία αγοράς σημαίνει ότι:',
      options: [
        'η τιμή είναι πάντα υψηλή',
        'η ζητούμενη ποσότητα ισούται με την προσφερόμενη',
        'υπάρχει πάντα πλεόνασμα',
        'το κράτος καθορίζει την τιμή',
      ],
      answer: 'η ζητούμενη ποσότητα ισούται με την προσφερόμενη',
      explanation: 'Στο σημείο ισορροπίας δεν υπάρχει ούτε έλλειμμα ούτε πλεόνασμα.',
    },
  },
  'aoth-7': {
    chapterId: 'aoth-7',
    question: {
      prompt: 'Το ΑΕΠ με τη μέθοδο δαπάνης υπολογίζεται από:',
      options: ['C + I + G + X - M', 'C + I - G + X + M', 'C + G + M - X', 'C + I + G + M - X'],
      answer: 'C + I + G + X - M',
      explanation: 'Αυτή είναι η βασική ταυτότητα της μεθόδου δαπάνης για το ΑΕΠ.',
    },
  },
  'aoth-9': {
    chapterId: 'aoth-9',
    question: {
      prompt: 'Όταν ένας οικοδόμος μένει χωρίς δουλειά λόγω χειμώνα, έχουμε:',
      options: ['διαρθρωτική ανεργία', 'τριβής ανεργία', 'εποχιακή ανεργία', 'τεχνολογική ανεργία'],
      answer: 'εποχιακή ανεργία',
      explanation: 'Η ανεργία αυτή εξαρτάται από την εποχή και τις συνθήκες του κλάδου.',
    },
  },
  'aoth-10': {
    chapterId: 'aoth-10',
    question: {
      prompt: 'Ο φόρος εισοδήματος θεωρείται:',
      options: ['έμμεσος φόρος', 'άμεσος φόρος', 'δημόσιο αγαθό', 'κρατική δαπάνη'],
      answer: 'άμεσος φόρος',
      explanation: 'Ο φόρος εισοδήματος επιβάλλεται άμεσα στο εισόδημα του φορολογουμένου.',
    },
  },
  'aepp-1': {
    chapterId: 'aepp-1',
    question: {
      prompt: 'Στην ανάλυση προβλήματος, τα δεδομένα είναι:',
      options: [
        'τα αποτελέσματα που πρέπει να παραχθούν',
        'οι πληροφορίες που δίνονται ως είσοδος',
        'οι όροι που πρέπει να τηρηθούν',
        'ο έτοιμος αλγόριθμος',
      ],
      answer: 'οι πληροφορίες που δίνονται ως είσοδος',
      explanation: 'Δεδομένα είναι τα στοιχεία που έχουμε διαθέσιμα για να λύσουμε το πρόβλημα.',
    },
  },
  'aepp-2': {
    chapterId: 'aepp-2',
    question: {
      prompt: 'Η περατότητα ενός αλγορίθμου σημαίνει ότι:',
      options: [
        'κάθε βήμα είναι ακριβές και σαφές',
        'ο αλγόριθμος δέχεται πάντα δεδομένα',
        'ο αλγόριθμος τελειώνει σε πεπερασμένο αριθμό βημάτων',
        'ο αλγόριθμος γράφεται μόνο σε διάγραμμα ροής',
      ],
      answer: 'ο αλγόριθμος τελειώνει σε πεπερασμένο αριθμό βημάτων',
      explanation: 'Η περατότητα είναι βασική ιδιότητα κάθε σωστού αλγορίθμου.',
    },
  },
  'aepp-3': {
    chapterId: 'aepp-3',
    question: {
      prompt: 'Σε μια στοίβα, ποιο στοιχείο βγαίνει πρώτο;',
      options: ['το πρώτο που μπήκε', 'το τελευταίο που μπήκε', 'το μικρότερο αριθμητικά', 'το μεγαλύτερο αριθμητικά'],
      answer: 'το τελευταίο που μπήκε',
      explanation: 'Η στοίβα λειτουργεί με λογική LIFO.',
    },
  },
  'aepp-4': {
    chapterId: 'aepp-4',
    question: {
      prompt: 'Η τεχνική "διαίρει και βασίλευε" σημαίνει κυρίως ότι:',
      options: [
        'σπάμε το πρόβλημα σε μικρότερα υποπροβλήματα',
        'γράφουμε πάντα έναν μόνο αλγόριθμο',
        'δουλεύουμε μόνο με πίνακες',
        'αποφεύγουμε την ανάλυση προβλήματος',
      ],
      answer: 'σπάμε το πρόβλημα σε μικρότερα υποπροβλήματα',
      explanation: 'Έτσι η λύση γίνεται πιο καθαρή και πιο εύκολη στην υλοποίηση.',
    },
  },
  'aepp-6': {
    chapterId: 'aepp-6',
    question: {
      prompt: 'Μετά τις αναθέσεις "Α ← 5, Β ← Α+3", ποια είναι η τιμή του Β;',
      options: ['5', '8', '3', '15'],
      answer: '8',
      explanation: 'Πρώτα το Α γίνεται 5 και μετά το Β παίρνει την τιμή 5+3.',
    },
  },
  'aepp-7': {
    chapterId: 'aepp-7',
    question: {
      prompt: 'Η τιμή της έκφρασης 3+2*5 είναι:',
      options: ['25', '13', '17', '10'],
      answer: '13',
      explanation: 'Πρώτα γίνεται ο πολλαπλασιασμός και μετά η πρόσθεση.',
    },
  },
  'aepp-8': {
    chapterId: 'aepp-8',
    question: {
      prompt: 'Η δομή "ΓΙΑ i ΑΠΟ 1 ΜΕΧΡΙ 5" εκτελεί:',
      options: ['4 επαναλήψεις', '5 επαναλήψεις', '6 επαναλήψεις', 'άπειρες επαναλήψεις'],
      answer: '5 επαναλήψεις',
      explanation: 'Η μεταβλητή παίρνει τις τιμές 1, 2, 3, 4, 5.',
    },
  },
  'aepp-9': {
    chapterId: 'aepp-9',
    question: {
      prompt: 'Για τον πίνακα A=[3,7,2,9], ποιο είναι το μέγιστο στοιχείο;',
      options: ['2', '3', '7', '9'],
      answer: '9',
      explanation: 'Το 9 είναι η μεγαλύτερη τιμή του πίνακα.',
    },
  },
  'aepp-10': {
    chapterId: 'aepp-10',
    question: {
      prompt: 'Μια συνάρτηση στην ΑΕΠΠ συνήθως:',
      options: [
        'επιστρέφει μία τιμή',
        'δεν έχει ποτέ παραμέτρους',
        'χρησιμοποιείται μόνο για είσοδο',
        'εκτελεί μόνο επαναλήψεις',
      ],
      answer: 'επιστρέφει μία τιμή',
      explanation: 'Αυτή είναι η βασική διαφορά της από μια διαδικασία.',
    },
  },
  'aepp-13': {
    chapterId: 'aepp-13',
    question: {
      prompt: 'Αν λείπει το ΤΟΤΕ σε μια εντολή ΑΝ, έχουμε:',
      options: ['λογικό λάθος', 'λάθος εκτέλεσης', 'συντακτικό λάθος', 'λάθος δεδομένων'],
      answer: 'συντακτικό λάθος',
      explanation: 'Το πρόγραμμα δεν ακολουθεί σωστά τη σύνταξη της γλώσσας.',
    },
  },
  'aepp-supp-1': {
    chapterId: 'aepp-supp-1',
    question: {
      prompt: 'Στο συμπληρωματικό υλικό, η στοίβα λειτουργεί με λογική:',
      options: ['FIFO', 'LIFO', 'τυχαία σειρά', 'δυαδική αναζήτηση'],
      answer: 'LIFO',
      explanation: 'Η στοίβα βγάζει πρώτο το τελευταίο στοιχείο που μπήκε.',
    },
  },
  'aepp-supp-2': {
    chapterId: 'aepp-supp-2',
    question: {
      prompt: 'Η μέθοδος "Διαίρει και Βασίλευε" βασίζεται κυρίως στο ότι:',
      options: [
        'σπάμε το πρόβλημα σε μικρότερα μέρη',
        'γράφουμε μόνο επαναληπτικούς αλγορίθμους',
        'χρησιμοποιούμε πάντα πίνακες',
        'αποφεύγουμε τα υποπρογράμματα',
      ],
      answer: 'σπάμε το πρόβλημα σε μικρότερα μέρη',
      explanation: 'Η λύση προκύπτει ευκολότερα όταν το πρόβλημα χωρίζεται σε υποπροβλήματα.',
    },
  },
  'aepp-supp-3': {
    chapterId: 'aepp-supp-3',
    question: {
      prompt: 'Η ΕΠΙΛΕΞΕ είναι πιο χρήσιμη όταν έχουμε:',
      options: [
        'πολλές διακριτές περιπτώσεις της ίδιας μεταβλητής',
        'ένα μόνο βήμα',
        'μόνο πίνακες δύο διαστάσεων',
        'μόνο αριθμητικές πράξεις',
      ],
      answer: 'πολλές διακριτές περιπτώσεις της ίδιας μεταβλητής',
      explanation: 'Είναι πιο καθαρή από πολλά διαδοχικά ΑΝ σε τέτοιες περιπτώσεις.',
    },
  },
  'aepp-supp-4': {
    chapterId: 'aepp-supp-4',
    question: {
      prompt: 'Στον αντικειμενοστραφή προγραμματισμό, οι κλάσεις χρησιμοποιούνται για:',
      options: [
        'ομαδοποίηση αντικειμένων με κοινά χαρακτηριστικά',
        'υπολογισμό μόνο ακεραίων',
        'αντικατάσταση όλων των πινάκων',
        'μόνο για εκσφαλμάτωση',
      ],
      answer: 'ομαδοποίηση αντικειμένων με κοινά χαρακτηριστικά',
      explanation: 'Οι κλάσεις είναι το βασικό δομικό στοιχείο της αντικειμενοστραφούς λογικής.',
    },
  },
  'aepp-supp-5': {
    chapterId: 'aepp-supp-5',
    question: {
      prompt: 'Η διαίρεση με το μηδέν κατά την εκτέλεση είναι:',
      options: ['συντακτικό λάθος', 'λογικό λάθος', 'λάθος εκτέλεσης', 'λάθος πληκτρολόγησης'],
      answer: 'λάθος εκτέλεσης',
      explanation: 'Το σφάλμα εμφανίζεται όσο τρέχει το πρόγραμμα.',
    },
  },
};

export const THEORY_QUIZ_EXTRA_QUESTIONS: Record<string, TheoryQuizQuestion[]> = {
  'math-1': [
    {
      prompt: 'Όταν λέμε ότι lim f(x) για x→x0 είναι πραγματικός αριθμός, τότε το όριο είναι:',
      options: ['μη πεπερασμένο', 'πεπερασμένο', 'πάντα άπειρο', 'πάντα μηδέν'],
      answer: 'πεπερασμένο',
      explanation: 'Πεπερασμένο όριο σημαίνει ότι η συνάρτηση πλησιάζει έναν συγκεκριμένο πραγματικό αριθμό.',
    },
    {
      prompt: 'Αν μια συνάρτηση είναι συνεχής σε ένα σημείο x0, τότε απαραίτητα:',
      options: ['ορίζεται στο x0', 'είναι άρτια', 'είναι παραγωγίσιμη', 'έχει ασύμπτωτη'],
      answer: 'ορίζεται στο x0',
      explanation: 'Για να είναι συνεχής σε σημείο πρέπει μεταξύ άλλων να είναι ορισμένη εκεί.',
    },
  ],
  'aepp-supp-1': [
    {
      prompt: 'Η ουρά λειτουργεί με λογική:',
      options: ['LIFO', 'FIFO', 'τυχαία σειρά', 'δυαδική ταξινόμηση'],
      answer: 'FIFO',
      explanation: 'Στην ουρά βγαίνει πρώτο το στοιχείο που μπήκε πρώτο.',
    },
    {
      prompt: 'Τα δένδρα χρησιμοποιούνται κυρίως για:',
      options: ['ιεραρχικές δομές δεδομένων', 'μόνο αριθμητικές πράξεις', 'εκτύπωση PDF', 'αντικατάσταση ουρών'],
      answer: 'ιεραρχικές δομές δεδομένων',
      explanation: 'Το δένδρο είναι τυπική ιεραρχική δομή δεδομένων.',
    },
  ],
  'aepp-supp-2': [
    {
      prompt: 'Στη μέθοδο "Διαίρει και Βασίλευε" μετά το σπάσιμο του προβλήματος ακολουθεί:',
      options: ['λύση των υποπροβλημάτων και σύνθεση', 'διαγραφή των δεδομένων', 'μόνο επανάληψη ΓΙΑ', 'υποχρεωτικά ταξινόμηση'],
      answer: 'λύση των υποπροβλημάτων και σύνθεση',
      explanation: 'Η μέθοδος βασίζεται σε διαίρεση, επίλυση και τελική σύνθεση.',
    },
    {
      prompt: 'Η μέθοδος "Διαίρει και Βασίλευε" είναι χρήσιμη επειδή:',
      options: ['κάνει το πρόβλημα πιο διαχειρίσιμο', 'καταργεί τις συναρτήσεις', 'χρησιμοποιείται μόνο στη ΓΛΩΣΣΑ', 'αποφεύγει κάθε έλεγχο'],
      answer: 'κάνει το πρόβλημα πιο διαχειρίσιμο',
      explanation: 'Τα μικρότερα κομμάτια λύνονται ευκολότερα από το αρχικό μεγάλο πρόβλημα.',
    },
  ],
  'aepp-supp-3': [
    {
      prompt: 'Η ΕΠΙΛΕΞΕ συνήθως προτιμάται όταν έχουμε:',
      options: ['πολλές τιμές της ίδιας μεταβλητής', 'ένα μόνο boolean', 'μόνο πίνακες', 'μόνο επανάληψη'],
      answer: 'πολλές τιμές της ίδιας μεταβλητής',
      explanation: 'Κάνει τον κώδικα πιο καθαρό όταν υπάρχουν πολλές διακριτές περιπτώσεις.',
    },
    {
      prompt: 'Η ΕΠΙΛΕΞΕ είναι μορφή:',
      options: ['επιλογής', 'επανάληψης', 'ταξινόμησης', 'αναζήτησης'],
      answer: 'επιλογής',
      explanation: 'Ανήκει στις δομές επιλογής.',
    },
  ],
  'aepp-supp-4': [
    {
      prompt: 'Ο πολυμορφισμός στον αντικειμενοστραφή προγραμματισμό αφορά:',
      options: ['διαφορετική συμπεριφορά με κοινή διεπαφή', 'μόνο διαγραφή κλάσεων', 'μόνο πίνακες', 'μόνο λάθη εκτέλεσης'],
      answer: 'διαφορετική συμπεριφορά με κοινή διεπαφή',
      explanation: 'Είναι μία από τις βασικές έννοιες της αντικειμενοστραφούς προσέγγισης.',
    },
    {
      prompt: 'Η ομαδοποίηση αντικειμένων σε κλάσεις γίνεται με βάση:',
      options: ['κοινά χαρακτηριστικά και συμπεριφορά', 'το μέγεθος του αρχείου', 'το χρώμα της οθόνης', 'μόνο αριθμητικές τιμές'],
      answer: 'κοινά χαρακτηριστικά και συμπεριφορά',
      explanation: 'Αυτός είναι ο λόγος ύπαρξης των κλάσεων.',
    },
  ],
  'aepp-supp-5': [
    {
      prompt: 'Το "μαύρο κουτί" σημαίνει έλεγχο:',
      options: ['βάσει εισόδων και εξόδων', 'μόνο του κώδικα γραμμή-γραμμή', 'μόνο της σύνταξης', 'χωρίς δεδομένα'],
      answer: 'βάσει εισόδων και εξόδων',
      explanation: 'Η μέθοδος ελέγχει το πρόγραμμα εξωτερικά, χωρίς ανάλυση του εσωτερικού κώδικα.',
    },
    {
      prompt: 'Τα λογικά λάθη είναι δύσκολα γιατί:',
      options: ['το πρόγραμμα τρέχει αλλά δίνει λάθος αποτέλεσμα', 'το πρόγραμμα δεν αποθηκεύεται', 'χαλάει το PDF', 'λείπει πάντα το ΤΟΤΕ'],
      answer: 'το πρόγραμμα τρέχει αλλά δίνει λάθος αποτέλεσμα',
      explanation: 'Δεν εντοπίζονται εύκολα από τον μεταγλωττιστή, αφού η σύνταξη είναι σωστή.',
    },
  ],
};

export function normalizeQuizText(text: string) {
  return text.replace(/&gt;/g, '>').replace(/&amp;/g, '&');
}

function getSubjectIdForChapter(chapterId: string) {
  if (chapterId.startsWith('aepp')) {
    return 'aepp';
  }

  return chapterId.split('-')[0];
}

function withQuestionMetadata(chapterId: string, questions: TheoryQuizQuestion[]): TheoryQuizQuestion[] {
  const subjectId = getSubjectIdForChapter(chapterId);

  return questions.map((question, index) => ({
    ...question,
    id: question.id ?? `${chapterId}-q${index + 1}`,
    subjectId: question.subjectId ?? subjectId,
    chapterId: question.chapterId ?? chapterId,
  }));
}

function shuffleArray<T>(items: T[]): T[] {
  const shuffled = [...items];

  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [shuffled[index], shuffled[swapIndex]] = [shuffled[swapIndex], shuffled[index]];
  }

  return shuffled;
}

function randomizeQuestionOptions(question: TheoryQuizQuestion): TheoryQuizQuestion {
  const uniqueOptions = Array.from(new Set(question.options));

  return {
    ...question,
    options: shuffleArray(uniqueOptions),
  };
}

function getUniqueQuestions(questions: TheoryQuizQuestion[]): TheoryQuizQuestion[] {
  const seenPrompts = new Set<string>();
  const uniqueQuestions: TheoryQuizQuestion[] = [];

  questions.forEach((question) => {
    if (seenPrompts.has(question.prompt)) {
      return;
    }

    seenPrompts.add(question.prompt);
    uniqueQuestions.push(question);
  });

  return uniqueQuestions;
}

function buildOptions(correctOption: string, distractors: string[]): string[] {
  const options = [correctOption];

  distractors.forEach((option) => {
    if (!option || option === correctOption || options.includes(option) || options.length === 4) {
      return;
    }

    options.push(option);
  });

  const genericOptions = [
    'Καμία από τις άλλες επιλογές',
    'Δεν ισχύει κάποιο από τα παραπάνω',
    'Δεν μπορεί να προσδιοριστεί',
  ];

  genericOptions.forEach((option) => {
    if (options.length < 4 && !options.includes(option) && option !== correctOption) {
      options.push(option);
    }
  });

  return options.slice(0, 4);
}

function buildGeneratedFallbackQuestions(chapterId: string, excludedPrompts: Set<string>): TheoryQuizQuestion[] {
  const subjectId = chapterId.startsWith('aepp') ? 'aepp' : chapterId.split('-')[0];
  const subject = getSubjectById(subjectId);
  const chapter = subject?.chapters.find((item) => item.id === chapterId);

  if (!subject || !chapter) {
    return [];
  }

  const otherSubjects = SUBJECTS.filter((item) => item.id !== subject.id).map((item) => item.greekName);
  const otherChapterTitles = subject.chapters
    .filter((item) => item.id !== chapter.id)
    .map((item) => item.title);
  const sectionTitles = chapter.sections.map((section) => section.title);
  const sectionNumbers = chapter.sections.map((section) => section.number);
  const otherSectionTitles = subject.chapters
    .flatMap((item) => item.sections)
    .filter((section) => !sectionTitles.includes(section.title))
    .map((section) => section.title);
  const otherSectionNumbers = subject.chapters
    .flatMap((item) => item.sections)
    .filter((section) => !sectionNumbers.includes(section.number))
    .map((section) => section.number);

  const generatedQuestions: TheoryQuizQuestion[] = [];

  const pushQuestion = (question: TheoryQuizQuestion | null) => {
    if (!question || excludedPrompts.has(question.prompt)) {
      return;
    }

    excludedPrompts.add(question.prompt);
    generatedQuestions.push(question);
  };

  pushQuestion({
    prompt: `Σε ποιο μάθημα ανήκει το κεφάλαιο "${chapter.title}";`,
    options: buildOptions(subject.greekName, otherSubjects),
    answer: subject.greekName,
    explanation: `Το κεφάλαιο "${chapter.title}" ανήκει στο μάθημα ${subject.greekName}.`,
  });

  pushQuestion({
    prompt: `Ποιος είναι ο αριθμός του κεφαλαίου "${chapter.title}" στο μάθημα ${subject.greekName};`,
    options: buildOptions(String(chapter.number), ['1', '2', '3', '4', '5', '7', '9', '10']),
    answer: String(chapter.number),
    explanation: `Στο ${subject.greekName}, το "${chapter.title}" είναι το Κεφάλαιο ${chapter.number}.`,
  });

  pushQuestion({
    prompt: `Ποιος είναι ο σωστός τίτλος του Κεφαλαίου ${chapter.number} στο μάθημα ${subject.greekName};`,
    options: buildOptions(chapter.title, otherChapterTitles),
    answer: chapter.title,
    explanation: `Ο σωστός τίτλος είναι "${chapter.title}".`,
  });

  chapter.sections.forEach((section) => {
    pushQuestion({
      prompt: `Σε ποια ενότητα του "${chapter.title}" αντιστοιχεί ο τίτλος "${section.title}";`,
      options: buildOptions(section.number, otherSectionNumbers),
      answer: section.number,
      explanation: `Ο τίτλος "${section.title}" αντιστοιχεί στην ενότητα ${section.number}.`,
    });

    pushQuestion({
      prompt: `Ποιος τίτλος αντιστοιχεί στην ενότητα ${section.number} του "${chapter.title}";`,
      options: buildOptions(section.title, otherSectionTitles),
      answer: section.title,
      explanation: `Η ενότητα ${section.number} έχει τίτλο "${section.title}".`,
    });
  });

  if (chapter.sections.length > 0) {
    pushQuestion({
      prompt: `Ποια από τις παρακάτω ενότητες ανήκει στο "${chapter.title}";`,
      options: buildOptions(chapter.sections[0].title, otherSectionTitles),
      answer: chapter.sections[0].title,
      explanation: `Η ενότητα "${chapter.sections[0].title}" ανήκει στο κεφάλαιο "${chapter.title}".`,
    });

    pushQuestion({
      prompt: `Πόσες ενότητες είναι καταγεγραμμένες για το "${chapter.title}";`,
      options: buildOptions(String(chapter.sections.length), ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10']),
      answer: String(chapter.sections.length),
      explanation: `Για το "${chapter.title}" έχουν καταγραφεί ${chapter.sections.length} ενότητες.`,
    });

    if (otherSectionTitles.length > 0) {
      pushQuestion({
        prompt: `Ποια από τις παρακάτω επιλογές δεν ανήκει στο "${chapter.title}";`,
        options: buildOptions(otherSectionTitles[0], sectionTitles),
        answer: otherSectionTitles[0],
        explanation: `Η επιλογή "${otherSectionTitles[0]}" δεν ανήκει στο κεφάλαιο "${chapter.title}".`,
      });
    }
  }

  pushQuestion({
    prompt: `Το κεφάλαιο "${chapter.title}" εμφανίζεται στο μάθημα ${subject.greekName};`,
    options: ['Σωστό', 'Λάθος', 'Και τα δύο', 'Καμία από τις άλλες επιλογές'],
    answer: 'Σωστό',
    explanation: `Το "${chapter.title}" πράγματι ανήκει στο μάθημα ${subject.greekName}.`,
  });

  return generatedQuestions;
}

function ensureMinimumQuizLength(chapterId: string, questions: TheoryQuizQuestion[], minimumQuestions = 10): TheoryQuizQuestion[] {
  const uniqueQuestions = getUniqueQuestions(questions);

  if (uniqueQuestions.length === 0) {
    return [];
  }

  if (uniqueQuestions.length >= minimumQuestions) {
    return uniqueQuestions.slice(0, minimumQuestions);
  }

  const excludedPrompts = new Set(uniqueQuestions.map((question) => question.prompt));
  const generatedQuestions = buildGeneratedFallbackQuestions(chapterId, excludedPrompts);
  const expandedQuestions = [...uniqueQuestions, ...generatedQuestions];

  return expandedQuestions.slice(0, minimumQuestions);
}

export function getTheoryQuizQuestions(chapterId: string): TheoryQuizQuestion[] {
  const fileBasedQuestions = FILE_BASED_QUIZ_BANKS[chapterId];

  if (fileBasedQuestions?.length) {
    return withQuestionMetadata(chapterId, ensureMinimumQuizLength(chapterId, fileBasedQuestions, 10)).map(
      randomizeQuestionOptions,
    );
  }

  const baseQuestion = THEORY_QUIZ_DATA[chapterId]?.question;
  if (!baseQuestion) {
    return [];
  }

  return withQuestionMetadata(
    chapterId,
    ensureMinimumQuizLength(chapterId, [baseQuestion, ...(THEORY_QUIZ_EXTRA_QUESTIONS[chapterId] ?? [])], 10),
  ).map(randomizeQuestionOptions);
}

export function getTheoryQuizChapterIds(subjectId: string) {
  const subject = getSubjectById(subjectId);

  if (!subject) {
    return [];
  }

  return subject.chapters
    .map((chapter) => chapter.id)
    .filter((chapterId) => getTheoryQuizQuestions(chapterId).length > 0);
}

export function getSmartQuizQuestions(subjectId: string, weakChapterIds: string[] = [], quizSize = 10) {
  const availableChapterIds = getTheoryQuizChapterIds(subjectId);

  if (!availableChapterIds.length) {
    return [];
  }

  const prioritizedWeakChapters = weakChapterIds.filter((chapterId) => availableChapterIds.includes(chapterId));
  const remainingChapterIds = availableChapterIds.filter((chapterId) => !prioritizedWeakChapters.includes(chapterId));
  const orderedChapterIds =
    prioritizedWeakChapters.length > 0
      ? [...prioritizedWeakChapters, ...remainingChapterIds]
      : [...remainingChapterIds].sort(() => Math.random() - 0.5);

  const chapterQueues = orderedChapterIds.map((chapterId) => [...getTheoryQuizQuestions(chapterId)]);
  const selectedQuestions: TheoryQuizQuestion[] = [];
  const seenQuestionIds = new Set<string>();

  while (selectedQuestions.length < quizSize && chapterQueues.some((queue) => queue.length > 0)) {
    for (const queue of chapterQueues) {
      const nextQuestion = queue.shift();

      if (!nextQuestion || !nextQuestion.id || seenQuestionIds.has(nextQuestion.id)) {
        continue;
      }

      seenQuestionIds.add(nextQuestion.id);
      selectedQuestions.push(nextQuestion);

      if (selectedQuestions.length >= quizSize) {
        break;
      }
    }
  }

  return selectedQuestions;
}
