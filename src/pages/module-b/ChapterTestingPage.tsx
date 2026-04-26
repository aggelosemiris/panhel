import React, { useState } from 'react';
import SubjectSelector from '../../components/SubjectSelector';

export default function ChapterTestingPage() {
  const [selectedSubject, setSelectedSubject] = useState<'MATH' | 'AOTh' | 'AEPP' | null>(null);

  if (!selectedSubject) {
    return <SubjectSelector onSelect={setSelectedSubject} />;
  }

  return (
    <div>
      <h1>Ενότητα Β: Δοκιμές Κεφαλαίου</h1>
      <p>Επιλεγμένο μάθημα: {selectedSubject}</p>
    </div>
  );
}
