import React, { useState } from 'react';
import '../styles/SubjectSelector.css';

interface SubjectSelectorProps {
  onSelect: (subject: 'MATH' | 'AOTh' | 'AEPP') => void;
}

export default function SubjectSelector({ onSelect }: SubjectSelectorProps) {
  const [selected, setSelected] = useState<string | null>(null);

  const subjects = [
    { id: 'MATH', label: 'Μαθηματικά', emoji: '📐' },
    { id: 'AOTh', label: 'Αρχές Οικονομικής Θεωρίας (ΑΟΘ)', emoji: '💼' },
    { id: 'AEPP', label: 'Ανάπτυξη Εφαρμογών σε Προγ/κό Περιβάλλον (ΑΕΠΠ)', emoji: '💻' },
  ];

  const handleSelect = (subjectId: string) => {
    setSelected(subjectId);
    window.setTimeout(() => {
      onSelect(subjectId as 'MATH' | 'AOTh' | 'AEPP');
    }, 180);
  };

  return (
    <div className="subject-selector-overlay">
      <div className="subject-selector-card">
        <h2>Επιλέξτε Μάθημα</h2>
        <p>Διαλέξτε το μάθημα που θέλετε να δουλέψετε</p>

        <div className="subjects-grid">
          {subjects.map((subject) => (
            <button
              key={subject.id}
              className={`subject-button ${selected === subject.id ? 'selected' : ''}`}
              onClick={() => handleSelect(subject.id)}
            >
              <span className="subject-emoji">{subject.emoji}</span>
              <span className="subject-label">{subject.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
