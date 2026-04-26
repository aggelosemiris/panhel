import React, { useState } from 'react';
import SubjectSelector from '../../components/SubjectSelector';
import '../../styles/TextbookPage.css';

export default function TextbookPage() {
  const [selectedSubject, setSelectedSubject] = useState<'MATH' | 'AOTh' | 'AEPP' | null>(null);

  const pdfLinks: Record<string, { main: string; supplementary?: string }> = {
    MATH: { 
      main: 'https://ebooks.edu.gr/ebooks/v/pdf/8547/2604/22-0273-01_Mathimatika-Teuchos-B_G-Lykeiou-Thetikon-Spoudon-kai-Spoudon-Oikonomias-Pliroforikis_Vivlio-Mathiti/'
    },
    AEPP: { 
      main: 'https://ebooks.edu.gr/ebooks/v/pdf/8547/2560/22-0275-01_V2_Anaptyxi-Efarmogon-se-Programmatistiko-Perivallon_G-Lykeiou-SpOikPlir_Vivlio-Mathiti/',
      supplementary: 'https://ebooks.edu.gr/ebooks/v/pdf/8547/5295/22-0279-01_Pliroforiki_G-Lykeiou-SpOikPlir_Sympliromatiko-Ekpaideutiko-Yliko/'
    },
    AOTh: { 
      main: 'https://ebooks.edu.gr/ebooks/v/pdf/8547/2522/22-0285-01_V1_Arches-Oikonomikis-Theorias_G-Lykeiou-Spoudon-Oikonomias-Pliroforikis_Vivlio-Mathiti/'
    }
  };

  const subjectNames: Record<string, string> = {
    MATH: 'Μαθηματικά',
    AEPP: 'Ανάπτυξη Εφαρμογών σε Προγραμματιστικό Περιβάλλον (ΑΕΠΠ)',
    AOTh: 'Αρχές Οικονομικής Θεωρίας (ΑΟΘ)'
  };

  const handlePdfOpen = (url: string) => {
    window.open(url, '_blank');
  };

  if (!selectedSubject) {
    return <SubjectSelector onSelect={setSelectedSubject} />;
  }

  const pdfs = pdfLinks[selectedSubject];

  return (
    <div className="textbook-page">
      <h1>Ενότητα Α: Διαδραστικό Εγχειρίδιο - Θεωρία</h1>
      <p className="subtitle">Μάθημα: {subjectNames[selectedSubject]}</p>
      
      <div className="theory-section">
        <h2>Επίσημα Σχολικά Βιβλία</h2>
        
        <button 
          className="pdf-button primary"
          onClick={() => handlePdfOpen(pdfs.main)}
        >
          📄 Σχολικό Βιβλίο (Κύριο)
        </button>

        {pdfs.supplementary && (
          <button 
            className="pdf-button secondary"
            onClick={() => handlePdfOpen(pdfs.supplementary)}
          >
            📚 Συμπληρωματικό Υλικό
          </button>
        )}
        
        <div className="theory-content">
          <p>💡 Χρησιμοποιήστε τα επίσημα σχολικά βιβλία για να δείτε όλο το θεωρητικό περιεχόμενο.</p>
          <p>📚 Το περιεχόμενο προέρχεται από τα επίσημα εκπαιδευτικά υλικά του Υπουργείου Παιδείας.</p>
          {selectedSubject === 'AEPP' && (
            <p>✨ Για το ΑΕΠΠ υπάρχει και συμπληρωματικό εκπαιδευτικό υλικό για εμβάθυνση.</p>
          )}
        </div>
      </div>
    </div>
  );
}
