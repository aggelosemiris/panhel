import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navigation from './components/Navigation';
import Dashboard from './pages/Dashboard';
import LoginPage from './pages/LoginPage';
import NotFoundPage from './pages/NotFoundPage';

// Module A
import TextbookPage from './pages/module-a/TextbookPage';
import ChapterPage from './pages/module-a/ChapterPage';

// Module B
import ModuleBIndexPage from './pages/module-b/ModuleBIndexPage';
import ChapterSelectionPage from './pages/module-b/ChapterSelectionPage';
import ChapterTestingPage from './pages/module-b/ChapterTestingPage';
import TestPage from './pages/module-b/TestPage';
import TestResultsPage from './pages/module-b/TestResultsPage';

// Module C
import GeneratorPage from './pages/module-c/GeneratorPage';
import CustomTestPage from './pages/module-c/CustomTestPage';
import SyllabusTestPage from './pages/module-c/SyllabusTestPage';

// Module D
import PastExamsPage from './pages/module-d/PastExamsPage';
import ExamDetailPage from './pages/module-d/ExamDetailPage';

// Module E
import EssayPage from './pages/module-e/EssayPage';
import EssayThemePage from './pages/module-e/EssayThemePage';
import EssaySubmitPage from './pages/module-e/EssaySubmitPage';

import './App.css';

function App() {
  return (
    <Router>
      <div className="app">
        <Navigation />
        <main className="main-content">
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/" element={<Dashboard />} />
            
            <Route path="/textbook" element={<TextbookPage />} />
            <Route path="/textbook/:subjectID/:chapterID" element={<ChapterPage />} />
            
            <Route path="/tests/chapter" element={<ModuleBIndexPage />} />
            <Route path="/tests/chapter/:subjectID" element={<ChapterSelectionPage />} />
            <Route path="/tests/chapter/:subjectID/:chapterID" element={<ChapterTestingPage />} />
            <Route path="/tests/chapter/:subjectID/:chapterID/:tier" element={<TestPage />} />
            <Route path="/tests/results/:testResultID" element={<TestResultsPage />} />
            
            <Route path="/generator" element={<GeneratorPage />} />
            <Route path="/generator/custom" element={<CustomTestPage />} />
            <Route path="/generator/syllabus" element={<SyllabusTestPage />} />
            
            <Route path="/exams" element={<PastExamsPage />} />
            <Route path="/exams/:examID" element={<ExamDetailPage />} />
            
            <Route path="/essays" element={<EssayPage />} />
            <Route path="/essays/theme/:themeID" element={<EssayThemePage />} />
            <Route path="/essays/submit/:themeID" element={<EssaySubmitPage />} />
            
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
