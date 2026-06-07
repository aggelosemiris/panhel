import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
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
    return (_jsx(Router, { children: _jsxs("div", { className: "app", children: [_jsx(Navigation, {}), _jsx("main", { className: "main-content", children: _jsxs(Routes, { children: [_jsx(Route, { path: "/login", element: _jsx(LoginPage, {}) }), _jsx(Route, { path: "/", element: _jsx(Dashboard, {}) }), _jsx(Route, { path: "/textbook", element: _jsx(TextbookPage, {}) }), _jsx(Route, { path: "/textbook/:subjectID/:chapterID", element: _jsx(ChapterPage, {}) }), _jsx(Route, { path: "/tests/chapter", element: _jsx(ModuleBIndexPage, {}) }), _jsx(Route, { path: "/tests/chapter/:subjectID", element: _jsx(ChapterSelectionPage, {}) }), _jsx(Route, { path: "/tests/chapter/:subjectID/:chapterID", element: _jsx(ChapterTestingPage, {}) }), _jsx(Route, { path: "/tests/chapter/:subjectID/:chapterID/:tier", element: _jsx(TestPage, {}) }), _jsx(Route, { path: "/tests/results/:testResultID", element: _jsx(TestResultsPage, {}) }), _jsx(Route, { path: "/generator", element: _jsx(GeneratorPage, {}) }), _jsx(Route, { path: "/generator/custom", element: _jsx(CustomTestPage, {}) }), _jsx(Route, { path: "/generator/syllabus", element: _jsx(SyllabusTestPage, {}) }), _jsx(Route, { path: "/exams", element: _jsx(PastExamsPage, {}) }), _jsx(Route, { path: "/exams/:examID", element: _jsx(ExamDetailPage, {}) }), _jsx(Route, { path: "/essays", element: _jsx(EssayPage, {}) }), _jsx(Route, { path: "/essays/theme/:themeID", element: _jsx(EssayThemePage, {}) }), _jsx(Route, { path: "/essays/submit/:themeID", element: _jsx(EssaySubmitPage, {}) }), _jsx(Route, { path: "*", element: _jsx(NotFoundPage, {}) })] }) })] }) }));
}
export default App;
