import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useNavigate, useParams } from 'react-router-dom';
const EXAM_MAP = {
    'math-2025': { title: 'Μαθηματικά - Θέματα 2025', file: '/exams/math/math_2025.pdf' },
    'math-2024': { title: 'Μαθηματικά - Θέματα 2024', file: '/exams/math/math_2024.pdf' },
    'math-2023': { title: 'Μαθηματικά - Θέματα 2023', file: '/exams/math/math_2023.pdf' },
    'math-2022': { title: 'Μαθηματικά - Θέματα 2022', file: '/exams/math/math_2022.pdf' },
    'math-2021': { title: 'Μαθηματικά - Θέματα 2021', file: '/exams/math/math_2021_panellinies_net.pdf' },
    'math-2020': { title: 'Μαθηματικά - Θέματα 2020', file: '/exams/math/math_2020_panellinies_net.pdf' },
    'math-2019': { title: 'Μαθηματικά - Θέματα 2019', file: '/exams/math/math_pros_2019_panellinies_net.pdf' },
    'math-2018': { title: 'Μαθηματικά - Θέματα 2018', file: '/exams/math/math_pros_2018_panellinies_net.pdf' },
    'math-2017': { title: 'Μαθηματικά - Θέματα 2017', file: '/exams/math/math_kat_2017_panellinies_net.pdf' },
    'math-2016': { title: 'Μαθηματικά - Θέματα 2016', file: '/exams/math/math_kat_2016_panellinies_net.pdf' },
    'aoth-2025': { title: 'ΑΟΘ - Θέματα 2025', file: '/exams/aoth/aoth_2025_00.pdf' },
    'aoth-2024': { title: 'ΑΟΘ - Θέματα 2024', file: '/exams/aoth/aoth_2024.pdf' },
    'aoth-2023': { title: 'ΑΟΘ - Θέματα 2023', file: '/exams/aoth/aoth_2023.pdf' },
    'aoth-2022': { title: 'ΑΟΘ - Θέματα 2022', file: '/exams/aoth/aoth_2022.pdf' },
    'aoth-2021': { title: 'ΑΟΘ - Θέματα 2021', file: '/exams/aoth/aoth_2021_panellinies_net.pdf' },
    'aoth-2020': { title: 'ΑΟΘ - Θέματα 2020', file: '/exams/aoth/aoth_2020_panellinies_net (1).pdf' },
    'aoth-2019': { title: 'ΑΟΘ - Θέματα 2019', file: '/exams/aoth/aoth_2019_panellinies_net.pdf' },
    'aoth-2018': { title: 'ΑΟΘ - Θέματα 2018', file: '/exams/aoth/aoth_2018_panellinies_net.pdf' },
    'aoth-2017': { title: 'ΑΟΘ - Θέματα 2017', file: '/exams/aoth/aoth_2017_panellinies_net.pdf' },
    'aoth-2016': { title: 'ΑΟΘ - Θέματα 2016', file: '/exams/aoth/aoth_2016_panellinies_net.pdf' },
    'aepp-2025': { title: 'ΑΕΠΠ - Θέματα 2025', file: '/exams/aepp/aepp_2025 (1).pdf' },
    'aepp-2024': { title: 'ΑΕΠΠ - Θέματα 2024', file: '/exams/aepp/aepp_2024.pdf' },
    'aepp-2023': { title: 'ΑΕΠΠ - Θέματα 2023', file: '/exams/aepp/aepp_2023.pdf' },
    'aepp-2022': { title: 'ΑΕΠΠ - Θέματα 2022', file: '/exams/aepp/aepp_2022.pdf' },
    'aepp-2021': { title: 'ΑΕΠΠ - Θέματα 2021', file: '/exams/aepp/aepp_2021_panellinies_net.pdf' },
    'aepp-2020': { title: 'ΑΕΠΠ - Θέματα 2020', file: '/exams/aepp/aepp_2020_panellinies_net.pdf' },
    'aepp-2019': { title: 'ΑΕΠΠ - Θέματα 2019', file: '/exams/aepp/aepp_2019_panellinies_net.pdf' },
    'aepp-2018': { title: 'ΑΕΠΠ - Θέματα 2018', file: '/exams/aepp/aepp_2018_panellinies_net.pdf' },
    'aepp-2017': { title: 'ΑΕΠΠ - Θέματα 2017', file: '/exams/aepp/aepp_2017_panellinies_net.pdf' },
    'aepp-2016': { title: 'ΑΕΠΠ - Θέματα 2016', file: '/exams/aepp/aepp_2016_panellinies_net.pdf' },
};
export default function ExamDetailPage() {
    const navigate = useNavigate();
    const { examID } = useParams();
    const exam = examID ? EXAM_MAP[examID] : undefined;
    if (!exam) {
        return (_jsx("div", { className: "module-d-page", children: _jsxs("div", { className: "module-d-hero", children: [_jsx("h1", { children: "\u0397 \u03B5\u03BE\u03AD\u03C4\u03B1\u03C3\u03B7 \u03B4\u03B5\u03BD \u03B2\u03C1\u03AD\u03B8\u03B7\u03BA\u03B5" }), _jsx("button", { className: "module-b-back-button", onClick: () => navigate('/exams'), children: "\u2190 \u0395\u03C0\u03B9\u03C3\u03C4\u03C1\u03BF\u03C6\u03AE \u03C3\u03C4\u03B9\u03C2 \u03B5\u03BE\u03B5\u03C4\u03AC\u03C3\u03B5\u03B9\u03C2" })] }) }));
    }
    return (_jsxs("div", { className: "module-d-page", children: [_jsxs("div", { className: "module-d-hero", children: [_jsx("button", { className: "module-b-back-button", onClick: () => navigate('/exams'), children: "\u2190 \u03A0\u03AF\u03C3\u03C9 \u03C3\u03C4\u03B1 \u03B8\u03AD\u03BC\u03B1\u03C4\u03B1" }), _jsx("h1", { children: exam.title }), _jsxs("p", { children: ["\u0391\u03BD \u03B4\u03B5\u03BD \u03B1\u03BD\u03BF\u03AF\u03BE\u03B5\u03B9 \u03BC\u03AD\u03C3\u03B1 \u03C3\u03C4\u03B7 \u03C3\u03B5\u03BB\u03AF\u03B4\u03B1, \u03C0\u03AC\u03C4\u03B7\u03C3\u03B5 ", _jsx("a", { href: exam.file, target: "_blank", rel: "noreferrer", children: "\u03B5\u03B4\u03CE" }), " \u03B3\u03B9\u03B1 \u03BD\u03AD\u03BF", ' ', "tab."] })] }), _jsx("div", { className: "module-d-pdf-shell", children: _jsx("iframe", { title: exam.title, src: exam.file, className: "module-d-pdf-frame" }) })] }));
}
