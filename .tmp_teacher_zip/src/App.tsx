/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import Home from './components/Home';
import Dashboard from './components/Dashboard';
import TeacherUI from './components/TeacherUI';
import StudyTools from './components/StudyTools';
import NavigationMenu from './components/NavigationMenu';
import SubjectSelector from './components/SubjectSelector';
import { SubjectId } from './constants/syllabus';

export default function App() {
  const [view, setView] = useState<'home' | 'chat'>('home');
  const [darkMode, setDarkMode] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState<SubjectId | null>(null);
  const [isSubjectSelectorOpen, setIsSubjectSelectorOpen] = useState(false);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  const handleSubjectSelect = (subjectId: SubjectId) => {
    setSelectedSubject(subjectId);
    setView('chat');
    setIsSubjectSelectorOpen(false);
  };

  const renderView = () => {
    switch (view) {
      case 'home':
        return <Home onStart={() => setIsSubjectSelectorOpen(true)} />;
      case 'chat':
        return (
          <TeacherUI 
            onBack={() => setView('home')} 
            subjectId={selectedSubject}
            onToggleTheme={() => setDarkMode(!darkMode)}
            darkMode={darkMode}
          />
        );
      default:
        return <Home onStart={() => setIsSubjectSelectorOpen(true)} />;
    }
  };

  return (
    <div className="min-h-screen transition-colors duration-300">
      {renderView()}
      
      {isSubjectSelectorOpen && (
        <SubjectSelector 
          onSelect={handleSubjectSelect} 
          onClose={() => setIsSubjectSelectorOpen(false)} 
        />
      )}
    </div>
  );
}
