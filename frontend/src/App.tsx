import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import Navigation from './components/Navigation.tsx';
import FloatingThemeToggle from './components/FloatingThemeToggle.tsx';
import { QuizProvider } from './context/QuizContext.tsx';
import { AuthProvider, useAuth } from './context/AuthContext.tsx';
import Dashboard from './pages/Dashboard.tsx';
import LandingPage from './pages/LandingPage.tsx';
import LoginPage from './pages/LoginPage.tsx';
import RegisterPage from './pages/RegisterPage.tsx';
import NotFoundPage from './pages/NotFoundPage.tsx';
import LegalPage from './pages/LegalPage.tsx';
import TheoryQuizPage from './pages/TheoryQuizPage.tsx';
import TheoryQuizAttemptPage from './pages/TheoryQuizAttemptPage.tsx';
import TheoryQuizResultPage from './pages/TheoryQuizResultPage.tsx';
import TrueFalsePage from './pages/TrueFalsePage.tsx';
import TrueFalseAttemptPage from './pages/TrueFalseAttemptPage.tsx';
import TrueFalseResultPage from './pages/TrueFalseResultPage.tsx';
import SmartQuizAttemptPage from './pages/SmartQuizAttemptPage.tsx';
import SmartQuizResultPage from './pages/SmartQuizResultPage.tsx';
import OefePage from './pages/OefePage.tsx';
import ProfilePage from './pages/ProfilePage.tsx';
import SubjectOnlyModulePage from './pages/SubjectOnlyModulePage.tsx';
import SingleTopicsPage from './pages/SingleTopicsPage.tsx';
import SpecializedTeacherPage from './pages/SpecializedTeacherPage.tsx';
import PanicModePage from './pages/PanicModePage.tsx';
import FinDocAiPage from './pages/FinDocAiPage.tsx';

import TextbookPage from './pages/module-a/TextbookPage.tsx';
import ChapterPage from './pages/module-a/ChapterPage.tsx';

import ModuleBIndexPage from './pages/module-b/ModuleBIndexPage.tsx';
import ChapterSelectionPage from './pages/module-b/ChapterSelectionPage.tsx';
import ChapterTestingPage from './pages/module-b/ChapterTestingPage.tsx';
import TestPage from './pages/module-b/TestPage.tsx';
import TestResultsPage from './pages/module-b/TestResultsPage.tsx';

import GeneratorPage from './pages/module-c/GeneratorPage.tsx';
import CustomTestPage from './pages/module-c/CustomTestPage.tsx';
import SyllabusTestPage from './pages/module-c/SyllabusTestPage.tsx';

import PastExamsPage from './pages/module-d/PastExamsPage.tsx';
import ExamDetailPage from './pages/module-d/ExamDetailPage.tsx';

import EssayPage from './pages/module-e/EssayPage.tsx';
import EssayThemePage from './pages/module-e/EssayThemePage.tsx';
import EssaySubmitPage from './pages/module-e/EssaySubmitPage.tsx';

import './App.css';

function ProtectedRoute({ children }: { children: React.ReactElement }) {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? children : <Navigate to="/app" replace />;
}

function ScrollToTop() {
  const { pathname } = useLocation();

  React.useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' as ScrollBehavior });
  }, [pathname]);

  return null;
}

function ScrollRevealManager() {
  const { pathname } = useLocation();

  React.useEffect(() => {
    const revealNodes = Array.from(document.querySelectorAll<HTMLElement>('[data-reveal]'));

    if (!revealNodes.length) return;

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    revealNodes.forEach((node, index) => {
      node.classList.add('is-reveal-ready');
      node.classList.remove('is-reveal-visible');

      const rect = node.getBoundingClientRect();
      if (index === 0 || rect.top < window.innerHeight * 1.02) {
        node.classList.add('is-reveal-visible');
      }
    });

    if (prefersReducedMotion) {
      revealNodes.forEach((node) => node.classList.add('is-reveal-visible'));
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-reveal-visible');
            observer.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.08,
        rootMargin: '0px 0px -12% 0px',
      },
    );

    const frame = window.requestAnimationFrame(() => {
      revealNodes.forEach((node) => {
        if (!node.classList.contains('is-reveal-visible')) {
          observer.observe(node);
        }
      });
    });

    return () => {
      window.cancelAnimationFrame(frame);
      observer.disconnect();
    };
  }, [pathname]);

  return null;
}

function AppLayout() {
  const location = useLocation();
  const hideNavigation =
    location.pathname === '/' ||
    location.pathname === '/login' ||
    location.pathname === '/register' ||
    location.pathname === '/terms' ||
    location.pathname === '/privacy' ||
    location.pathname === '/specialized-teacher';
  const isCortexPage = location.pathname === '/specialized-teacher';

  React.useEffect(() => {
    document.body.classList.toggle('is-cortex-route', isCortexPage);

    return () => {
      document.body.classList.remove('is-cortex-route');
    };
  }, [isCortexPage]);

  return (
    <div className="app">
      <ScrollToTop />
      <ScrollRevealManager />
      {hideNavigation ? null : <Navigation />}
      {isCortexPage ? null : <FloatingThemeToggle />}
      <main
        className={`main-content ${hideNavigation ? 'main-content-marketing' : ''} ${
          isCortexPage ? 'main-content-cortex' : ''
        }`}
      >
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/terms" element={<LegalPage type="terms" />} />
          <Route path="/privacy" element={<LegalPage type="privacy" />} />
          <Route path="/app" element={<Dashboard />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <ProfilePage />
              </ProtectedRoute>
            }
          />

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

          <Route path="/theory-quiz" element={<TheoryQuizPage />} />
          <Route path="/theory-quiz/:subjectID" element={<TheoryQuizPage />} />
          <Route path="/theory-quiz/:subjectID/smart" element={<SmartQuizAttemptPage />} />
          <Route path="/theory-quiz/:subjectID/smart/result" element={<SmartQuizResultPage />} />
          <Route path="/theory-quiz/:subjectID/:chapterID" element={<TheoryQuizAttemptPage />} />
          <Route path="/theory-quiz/:subjectID/:chapterID/result" element={<TheoryQuizResultPage />} />
          <Route path="/oefe" element={<OefePage />} />
          <Route path="/oefe/:examID" element={<ExamDetailPage />} />

          <Route path="/single-topics" element={<SingleTopicsPage />} />
          <Route path="/single-topics/:subjectID" element={<SingleTopicsPage />} />
          <Route path="/single-topics/:subjectID/:topicKey" element={<SingleTopicsPage />} />
          <Route path="/panic-mode" element={<PanicModePage />} />
          <Route path="/panic-mode/:subjectID" element={<PanicModePage />} />
          <Route path="/findoc-ai" element={<FinDocAiPage />} />

          <Route path="/methodology" element={<SubjectOnlyModulePage moduleKey="methodology" />} />
          <Route path="/methodology/:subjectID" element={<SubjectOnlyModulePage moduleKey="methodology" />} />
          <Route path="/topic-a" element={<SubjectOnlyModulePage moduleKey="topic-a" />} />
          <Route path="/topic-a/:subjectID" element={<SubjectOnlyModulePage moduleKey="topic-a" />} />
          <Route path="/topic-b" element={<SubjectOnlyModulePage moduleKey="topic-b" />} />
          <Route path="/topic-b/:subjectID" element={<SubjectOnlyModulePage moduleKey="topic-b" />} />
          <Route path="/topic-c" element={<SubjectOnlyModulePage moduleKey="topic-c" />} />
          <Route path="/topic-c/:subjectID" element={<SubjectOnlyModulePage moduleKey="topic-c" />} />
          <Route path="/topic-d" element={<SubjectOnlyModulePage moduleKey="topic-d" />} />
          <Route path="/topic-d/:subjectID" element={<SubjectOnlyModulePage moduleKey="topic-d" />} />
          <Route path="/true-false" element={<TrueFalsePage />} />
          <Route path="/true-false/:subjectID" element={<TrueFalsePage />} />
          <Route path="/true-false/:subjectID/:chapterID" element={<TrueFalseAttemptPage />} />
          <Route path="/true-false/:subjectID/:chapterID/result" element={<TrueFalseResultPage />} />
          <Route
            path="/specialized-teacher"
            element={
              <ProtectedRoute>
                <SpecializedTeacherPage />
              </ProtectedRoute>
            }
          />

          <Route path="/essays" element={<EssayPage />} />
          <Route path="/essays/theme/:themeID" element={<EssayThemePage />} />
          <Route path="/essays/submit/:themeID" element={<EssaySubmitPage />} />

          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </main>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <QuizProvider>
        <Router>
          <AppLayout />
        </Router>
      </QuizProvider>
    </AuthProvider>
  );
}

export default App;
