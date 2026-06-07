import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import '../styles/SubjectSelector.css';
export default function SubjectSelector({ onSelect }) {
    const [selected, setSelected] = useState(null);
    const subjects = [
        { id: 'MATH', label: 'Μαθηματικά', emoji: '📐' },
        { id: 'AOTh', label: 'Αρχές Οικονομικής Θεωρίας (ΑΟΘ)', emoji: '💼' },
        { id: 'AEPP', label: 'Ανάπτυξη Εφαρμογών σε Προγ/κό Περιβάλλον (ΑΕΠΠ)', emoji: '💻' },
    ];
    const handleSelect = (subjectId) => {
        setSelected(subjectId);
        window.setTimeout(() => {
            onSelect(subjectId);
        }, 180);
    };
    return (_jsx("div", { className: "subject-selector-overlay", children: _jsxs("div", { className: "subject-selector-card", children: [_jsx("h2", { children: "\u0395\u03C0\u03B9\u03BB\u03AD\u03BE\u03C4\u03B5 \u039C\u03AC\u03B8\u03B7\u03BC\u03B1" }), _jsx("p", { children: "\u0394\u03B9\u03B1\u03BB\u03AD\u03BE\u03C4\u03B5 \u03C4\u03BF \u03BC\u03AC\u03B8\u03B7\u03BC\u03B1 \u03C0\u03BF\u03C5 \u03B8\u03AD\u03BB\u03B5\u03C4\u03B5 \u03BD\u03B1 \u03B4\u03BF\u03C5\u03BB\u03AD\u03C8\u03B5\u03C4\u03B5" }), _jsx("div", { className: "subjects-grid", children: subjects.map((subject) => (_jsxs("button", { className: `subject-button ${selected === subject.id ? 'selected' : ''}`, onClick: () => handleSelect(subject.id), children: [_jsx("span", { className: "subject-emoji", children: subject.emoji }), _jsx("span", { className: "subject-label", children: subject.label })] }, subject.id))) })] }) }));
}
