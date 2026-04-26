import React, { useState } from 'react';
import SubjectSelector from '../../components/SubjectSelector.tsx';

export default function SyllabusTestPage() {
  const [selectedSubject, setSelectedSubject] = useState<'MATH' | 'AOTh' | 'AEPP' | null>(null);

  if (!selectedSubject) {
    return <SubjectSelector onSelect={setSelectedSubject} />;
  }

  return (
    <div>
      <h1>Ενότητα Γ: Δοκιμή Πλήρους Αναλυτικού Προγράμματος</h1>
      <p>Επιλεγμένο μάθημα: {selectedSubject}</p>
    </div>
  );
}
