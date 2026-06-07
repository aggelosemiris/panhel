import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getSubjectById } from '../../config/curricula';
export default function TestPage() {
    const { subjectID, chapterID, tier } = useParams();
    const navigate = useNavigate();
    const subject = useMemo(() => {
        return subjectID ? getSubjectById(subjectID) : undefined;
    }, [subjectID]);
    const chapter = subject?.chapters.find((item) => item.id === chapterID);
    if (!subject || !chapter) {
        return (_jsx("div", { className: "module-b-page", children: _jsxs("div", { className: "module-b-hero", children: [_jsx("h1", { children: "\u0394\u03B5\u03BD \u03B2\u03C1\u03AD\u03B8\u03B7\u03BA\u03B5 \u03B4\u03BF\u03BA\u03B9\u03BC\u03AE" }), _jsx("button", { className: "module-b-back-button", onClick: () => navigate('/tests/chapter'), children: "\u2190 \u0395\u03C0\u03B9\u03C3\u03C4\u03C1\u03BF\u03C6\u03AE" })] }) }));
    }
    return (_jsxs("div", { className: "module-b-page", children: [_jsxs("div", { className: "module-b-hero", children: [_jsx("button", { className: "module-b-back-button", onClick: () => navigate(`/tests/chapter/${subject.id}`), children: "\u2190 \u03A0\u03AF\u03C3\u03C9 \u03C3\u03C4\u03B1 \u03BA\u03B5\u03C6\u03AC\u03BB\u03B1\u03B9\u03B1" }), _jsxs("h1", { children: [subject.emoji, " ", subject.greekName] }), _jsxs("p", { children: ["\u0394\u03BF\u03BA\u03B9\u03BC\u03AE \u03B3\u03B9\u03B1 \u03C4\u03BF ", chapter.title, " \u03BC\u03B5 \u03B4\u03C5\u03C3\u03BA\u03BF\u03BB\u03AF\u03B1 ", _jsx("strong", { children: tier }), "."] })] }), _jsxs("div", { className: "module-b-group-card", children: [_jsx("h2", { children: "\u0395\u03C0\u03B9\u03BB\u03B5\u03B3\u03BC\u03AD\u03BD\u03BF \u03BA\u03B5\u03C6\u03AC\u03BB\u03B1\u03B9\u03BF" }), _jsxs("p", { children: ["\u039A\u03B5\u03C6\u03AC\u03BB\u03B1\u03B9\u03BF ", chapter.number, ": ", chapter.title] }), chapter.sections.length > 0 && (_jsx("div", { className: "module-b-section-list", children: chapter.sections.map((section) => (_jsxs("div", { className: "module-b-section-item", children: [_jsx("span", { className: "module-b-section-number", children: section.number }), _jsx("span", { children: section.title })] }, section.id))) }))] })] }));
}
