import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import SubjectSelector from '../../components/SubjectSelector';
export default function GeneratorPage() {
    const [selectedSubject, setSelectedSubject] = useState(null);
    if (!selectedSubject) {
        return _jsx(SubjectSelector, { onSelect: setSelectedSubject });
    }
    return (_jsxs("div", { children: [_jsx("h1", { children: "\u0395\u03BD\u03CC\u03C4\u03B7\u03C4\u03B1 \u0393: \u0394\u03C5\u03BD\u03B1\u03BC\u03B9\u03BA\u03CC\u03C2 \u0393\u03B5\u03BD\u03BD\u03AE\u03C4\u03C1\u03B9\u03B1 \u0394\u03BF\u03BA\u03B9\u03BC\u03CE\u03BD" }), _jsxs("p", { children: ["\u0395\u03C0\u03B9\u03BB\u03B5\u03B3\u03BC\u03AD\u03BD\u03BF \u03BC\u03AC\u03B8\u03B7\u03BC\u03B1: ", selectedSubject] })] }));
}
