// Module B: Subject Selector Page
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { SUBJECTS } from '../../config/curricula';
import './SubjectSelectorPage.css';

export default function SubjectSelectorPage() {
  const navigate = useNavigate();

  const handleSubjectSelect = (subjectId: string) => {
    navigate(`/tests/chapter/${subjectId}`, { replace: false });
  };

  return (
    <div className="subject-selector-page">
      <div className="selector-container">
        <h1 className="page-title">Ενότητα Β: Δοκιμές Κατ' Ενότητα</h1>
        <p className="page-subtitle">Επιλέξτε ένα μάθημα για να προχωρήσετε</p>

        <div className="subjects-grid">
          {SUBJECTS.map((subject) => (
            <div
              key={subject.id}
              className="subject-card"
              style={{ borderColor: subject.color }}
              onClick={() => handleSubjectSelect(subject.id)}
            >
              <div className="subject-emoji">{subject.emoji}</div>
              <h2 className="subject-name">{subject.greekName}</h2>
              <p className="subject-code">({subject.code})</p>
              <div className="subject-action">Επιλογή →</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
