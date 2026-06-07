import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getSubjectById } from '../../config/curricula';
export default function ChapterSelectionPage() {
    const { subjectID } = useParams();
    const navigate = useNavigate();
    const [expandedChapter, setExpandedChapter] = useState(null);
    const subject = useMemo(() => {
        return subjectID ? getSubjectById(subjectID) : undefined;
    }, [subjectID]);
    if (!subject) {
        return (_jsx("div", { className: "module-b-page", children: _jsxs("div", { className: "module-b-hero", children: [_jsx("h1", { children: "\u03A4\u03BF \u03BC\u03AC\u03B8\u03B7\u03BC\u03B1 \u03B4\u03B5\u03BD \u03B2\u03C1\u03AD\u03B8\u03B7\u03BA\u03B5" }), _jsx("button", { className: "module-b-back-button", onClick: () => navigate('/tests/chapter'), children: "\u2190 \u0395\u03C0\u03B9\u03C3\u03C4\u03C1\u03BF\u03C6\u03AE \u03C3\u03C4\u03B1 \u03BC\u03B1\u03B8\u03AE\u03BC\u03B1\u03C4\u03B1" })] }) }));
    }
    const chapterGroups = subject.chapterGroups ?? [
        {
            id: `${subject.id}-default-group`,
            title: `${subject.emoji} ${subject.greekName}`,
            chapters: subject.chapters,
        },
    ];
    return (_jsxs("div", { className: "module-b-page", children: [_jsxs("div", { className: "module-b-hero", children: [_jsx("button", { className: "module-b-back-button", onClick: () => navigate('/tests/chapter'), children: "\u2190 \u03A0\u03AF\u03C3\u03C9 \u03C3\u03C4\u03B1 \u03BC\u03B1\u03B8\u03AE\u03BC\u03B1\u03C4\u03B1" }), _jsxs("h1", { children: [subject.emoji, " ", subject.greekName] }), _jsx("p", { children: "\u0395\u03C0\u03AF\u03BB\u03B5\u03BE\u03B5 \u03BA\u03B5\u03C6\u03AC\u03BB\u03B1\u03B9\u03BF \u03B3\u03B9\u03B1 \u03BD\u03B1 \u03B4\u03B5\u03B9\u03C2 \u03C4\u03B9\u03C2 \u03B4\u03B9\u03B1\u03B8\u03AD\u03C3\u03B9\u03BC\u03B5\u03C2 \u03B5\u03BD\u03CC\u03C4\u03B7\u03C4\u03B5\u03C2." })] }), _jsx("div", { className: "module-b-groups", children: chapterGroups.map((group) => (_jsxs("section", { className: "module-b-group-card", children: [subject.chapterGroups && (_jsxs("div", { className: "module-b-group-header", children: [_jsx("h2", { children: group.title }), group.description && _jsx("p", { children: group.description })] })), _jsx("div", { className: "module-b-chapter-list", children: group.chapters.map((chapter) => {
                                const isExpanded = expandedChapter === chapter.id;
                                return (_jsxs("article", { className: "module-b-chapter-card", style: { borderLeftColor: subject.color }, children: [_jsxs("button", { className: "module-b-chapter-toggle", onClick: () => setExpandedChapter(isExpanded ? null : chapter.id), children: [_jsxs("div", { children: [_jsxs("span", { className: "module-b-chapter-number", children: ["\u039A\u03B5\u03C6\u03AC\u03BB\u03B1\u03B9\u03BF ", chapter.number] }), _jsx("h3", { children: chapter.title })] }), _jsx("span", { className: `module-b-expand-icon ${isExpanded ? 'expanded' : ''}`, children: "\u25BC" })] }), isExpanded && (_jsxs("div", { className: "module-b-section-panel", children: [chapter.sections.length > 0 ? (_jsx("div", { className: "module-b-section-list", children: chapter.sections.map((section) => (_jsxs("button", { className: "module-b-section-item", onClick: () => navigate(`/tests/chapter/${subject.id}/${chapter.id}/easy`), children: [_jsx("span", { className: "module-b-section-number", children: section.number }), _jsx("span", { children: section.title })] }, section.id))) })) : (_jsx("div", { className: "module-b-empty-sections", children: "\u0394\u03B5\u03BD \u03AD\u03C7\u03BF\u03C5\u03BD \u03C0\u03C1\u03BF\u03C3\u03C4\u03B5\u03B8\u03B5\u03AF \u03B5\u03C0\u03B9\u03BC\u03AD\u03C1\u03BF\u03C5\u03C2 \u03B5\u03BD\u03CC\u03C4\u03B7\u03C4\u03B5\u03C2 \u03B3\u03B9\u03B1 \u03B1\u03C5\u03C4\u03CC \u03C4\u03BF \u03BA\u03B5\u03C6\u03AC\u03BB\u03B1\u03B9\u03BF." })), _jsxs("div", { className: "module-b-actions", children: [_jsx("button", { onClick: () => navigate(`/tests/chapter/${subject.id}/${chapter.id}/easy`), children: "\u0395\u03CD\u03BA\u03BF\u03BB\u03B7 \u03B4\u03C5\u03C3\u03BA\u03BF\u03BB\u03AF\u03B1" }), _jsx("button", { onClick: () => navigate(`/tests/chapter/${subject.id}/${chapter.id}/normal`), children: "\u039A\u03B1\u03BD\u03BF\u03BD\u03B9\u03BA\u03AE \u03B4\u03C5\u03C3\u03BA\u03BF\u03BB\u03AF\u03B1" }), _jsx("button", { onClick: () => navigate(`/tests/chapter/${subject.id}/${chapter.id}/hard`), children: "\u0394\u03CD\u03C3\u03BA\u03BF\u03BB\u03B7 \u03B4\u03C5\u03C3\u03BA\u03BF\u03BB\u03AF\u03B1" })] })] }))] }, chapter.id));
                            }) })] }, group.id))) })] }));
}
