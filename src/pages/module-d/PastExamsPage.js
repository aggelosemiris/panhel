import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React from 'react';
import { useNavigate } from 'react-router-dom';
import SubjectSelector from '../../components/SubjectSelector';
const EXAMS_BY_SUBJECT = {
    MATH: {
        title: '📐 Μαθηματικά - Παλαιά Θέματα',
        description: 'Επίλεξε έτος για να ανοίξεις το αντίστοιχο PDF θεμάτων.',
        routePrefix: 'math',
        exams: [
            { year: 2025, file: '/exams/math/math_2025.pdf' },
            { year: 2024, file: '/exams/math/math_2024.pdf' },
            { year: 2023, file: '/exams/math/math_2023.pdf' },
            { year: 2022, file: '/exams/math/math_2022.pdf' },
            { year: 2021, file: '/exams/math/math_2021_panellinies_net.pdf' },
            { year: 2020, file: '/exams/math/math_2020_panellinies_net.pdf' },
            { year: 2019, file: '/exams/math/math_pros_2019_panellinies_net.pdf' },
            { year: 2018, file: '/exams/math/math_pros_2018_panellinies_net.pdf' },
            { year: 2017, file: '/exams/math/math_kat_2017_panellinies_net.pdf' },
            { year: 2016, file: '/exams/math/math_kat_2016_panellinies_net.pdf' },
        ],
    },
    AOTh: {
        title: '💼 ΑΟΘ - Παλαιά Θέματα',
        description: 'Επίλεξε έτος για να ανοίξεις το αντίστοιχο PDF θεμάτων.',
        routePrefix: 'aoth',
        exams: [
            { year: 2025, file: '/exams/aoth/aoth_2025_00.pdf' },
            { year: 2024, file: '/exams/aoth/aoth_2024.pdf' },
            { year: 2023, file: '/exams/aoth/aoth_2023.pdf' },
            { year: 2022, file: '/exams/aoth/aoth_2022.pdf' },
            { year: 2021, file: '/exams/aoth/aoth_2021_panellinies_net.pdf' },
            { year: 2020, file: '/exams/aoth/aoth_2020_panellinies_net (1).pdf' },
            { year: 2019, file: '/exams/aoth/aoth_2019_panellinies_net.pdf' },
            { year: 2018, file: '/exams/aoth/aoth_2018_panellinies_net.pdf' },
            { year: 2017, file: '/exams/aoth/aoth_2017_panellinies_net.pdf' },
            { year: 2016, file: '/exams/aoth/aoth_2016_panellinies_net.pdf' },
        ],
    },
    AEPP: {
        title: '💻 ΑΕΠΠ - Παλαιά Θέματα',
        description: 'Επίλεξε έτος για να ανοίξεις το αντίστοιχο PDF θεμάτων.',
        routePrefix: 'aepp',
        exams: [
            { year: 2025, file: '/exams/aepp/aepp_2025 (1).pdf' },
            { year: 2024, file: '/exams/aepp/aepp_2024.pdf' },
            { year: 2023, file: '/exams/aepp/aepp_2023.pdf' },
            { year: 2022, file: '/exams/aepp/aepp_2022.pdf' },
            { year: 2021, file: '/exams/aepp/aepp_2021_panellinies_net.pdf' },
            { year: 2020, file: '/exams/aepp/aepp_2020_panellinies_net.pdf' },
            { year: 2019, file: '/exams/aepp/aepp_2019_panellinies_net.pdf' },
            { year: 2018, file: '/exams/aepp/aepp_2018_panellinies_net.pdf' },
            { year: 2017, file: '/exams/aepp/aepp_2017_panellinies_net.pdf' },
            { year: 2016, file: '/exams/aepp/aepp_2016_panellinies_net.pdf' },
        ],
    },
};
export default function PastExamsPage() {
    const navigate = useNavigate();
    const [selectedSubject, setSelectedSubject] = React.useState(null);
    if (!selectedSubject) {
        return _jsx(SubjectSelector, { onSelect: setSelectedSubject });
    }
    const subjectConfig = EXAMS_BY_SUBJECT[selectedSubject];
    if (!subjectConfig) {
        return (_jsx("div", { className: "module-d-page", children: _jsxs("div", { className: "module-d-hero", children: [_jsx("button", { className: "module-b-back-button", onClick: () => setSelectedSubject(null), children: "\u2190 \u03A0\u03AF\u03C3\u03C9 \u03C3\u03C4\u03B1 \u03BC\u03B1\u03B8\u03AE\u03BC\u03B1\u03C4\u03B1" }), _jsx("h1", { children: "\u0395\u03BD\u03CC\u03C4\u03B7\u03C4\u03B1 \u0394: \u03A0\u03B1\u03BB\u03B1\u03B9\u03AD\u03C2 \u0395\u03BE\u03B5\u03C4\u03AC\u03C3\u03B5\u03B9\u03C2" }), _jsx("p", { children: "\u03A0\u03C1\u03BF\u03C2 \u03C4\u03BF \u03C0\u03B1\u03C1\u03CC\u03BD \u03AD\u03C7\u03BF\u03C5\u03BD \u03C0\u03C1\u03BF\u03C3\u03C4\u03B5\u03B8\u03B5\u03AF \u03BC\u03CC\u03BD\u03BF \u03C4\u03B1 \u03B8\u03AD\u03BC\u03B1\u03C4\u03B1 \u039C\u03B1\u03B8\u03B7\u03BC\u03B1\u03C4\u03B9\u03BA\u03CE\u03BD, \u0391\u039F\u0398 \u03BA\u03B1\u03B9 \u0391\u0395\u03A0\u03A0 \u03B3\u03B9\u03B1 \u03C4\u03B1 \u03AD\u03C4\u03B7 2016-2025." })] }) }));
    }
    return (_jsxs("div", { className: "module-d-page", children: [_jsxs("div", { className: "module-d-hero", children: [_jsx("button", { className: "module-b-back-button", onClick: () => setSelectedSubject(null), children: "\u2190 \u03A0\u03AF\u03C3\u03C9 \u03C3\u03C4\u03B1 \u03BC\u03B1\u03B8\u03AE\u03BC\u03B1\u03C4\u03B1" }), _jsx("h1", { children: subjectConfig.title }), _jsx("p", { children: subjectConfig.description })] }), _jsx("div", { className: "module-d-years-grid", children: subjectConfig.exams.map((exam) => (_jsxs("button", { className: "module-d-year-card", onClick: () => navigate(`/exams/${subjectConfig.routePrefix}-${exam.year}`), children: [_jsxs("span", { className: "module-d-year-label", children: ["\u0398\u03AD\u03BC\u03B1\u03C4\u03B1 ", exam.year] }), _jsx("span", { className: "module-d-year-action", children: "\u0386\u03BD\u03BF\u03B9\u03B3\u03BC\u03B1 PDF" })] }, exam.year))) })] }));
}
