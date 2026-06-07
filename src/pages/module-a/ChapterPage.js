import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import SubjectSelector from '../../components/SubjectSelector';
import '../../styles/TextbookPage.css';
export default function ChapterPage() {
    const [selectedSubject, setSelectedSubject] = useState(null);
    const pdfLinks = {
        MATH: {
            main: 'https://ebooks.edu.gr/ebooks/v/pdf/8547/2604/22-0273-01_Mathimatika-Teuchos-B_G-Lykeiou-Thetikon-Spoudon-kai-Spoudon-Oikonomias-Pliroforikis_Vivlio-Mathiti/'
        },
        AEPP: {
            main: 'https://ebooks.edu.gr/ebooks/v/pdf/8547/2560/22-0275-01_V2_Anaptyxi-Efarmogon-se-Programmatistiko-Perivallon_G-Lykeiou-SpOikPlir_Vivlio-Mathiti/',
            supplementary: 'https://ebooks.edu.gr/ebooks/v/pdf/8547/5295/22-0279-01_Pliroforiki_G-Lykeiou-SpOikPlir_Sympliromatiko-Ekpaideutiko-Yliko/'
        },
        AOTh: {
            main: 'https://ebooks.edu.gr/ebooks/v/pdf/8547/2522/22-0285-01_V1_Arches-Oikonomikis-Theorias_G-Lykeiou-Spoudon-Oikonomias-Pliroforikis_Vivlio-Mathiti/'
        }
    };
    const subjectNames = {
        MATH: 'Μαθηματικά',
        AEPP: 'Ανάπτυξη Εφαρμογών σε Προγραμματιστικό Περιβάλλον (ΑΕΠΠ)',
        AOTh: 'Αρχές Οικονομικής Θεωρίας (ΑΟΘ)'
    };
    const handlePdfOpen = (url) => {
        window.open(url, '_blank');
    };
    if (!selectedSubject) {
        return _jsx(SubjectSelector, { onSelect: setSelectedSubject });
    }
    const pdfs = pdfLinks[selectedSubject];
    return (_jsxs("div", { className: "textbook-page", children: [_jsx("h1", { children: "\u0395\u03BD\u03CC\u03C4\u03B7\u03C4\u03B1 \u0391: \u039A\u03B5\u03C6\u03AC\u03BB\u03B1\u03B9\u03BF - \u039B\u03B5\u03C0\u03C4\u03BF\u03BC\u03AD\u03C1\u03B5\u03B9\u03B5\u03C2" }), _jsxs("p", { className: "subtitle", children: ["\u039C\u03AC\u03B8\u03B7\u03BC\u03B1: ", subjectNames[selectedSubject]] }), _jsxs("div", { className: "theory-section", children: [_jsx("h2", { children: "\u0395\u03C0\u03AF\u03C3\u03B7\u03BC\u03B1 \u03A3\u03C7\u03BF\u03BB\u03B9\u03BA\u03AC \u0392\u03B9\u03B2\u03BB\u03AF\u03B1" }), _jsx("button", { className: "pdf-button primary", onClick: () => handlePdfOpen(pdfs.main), children: "\uD83D\uDCC4 \u03A3\u03C7\u03BF\u03BB\u03B9\u03BA\u03CC \u0392\u03B9\u03B2\u03BB\u03AF\u03BF (\u039A\u03CD\u03C1\u03B9\u03BF)" }), pdfs.supplementary && (_jsx("button", { className: "pdf-button secondary", onClick: () => handlePdfOpen(pdfs.supplementary), children: "\uD83D\uDCDA \u03A3\u03C5\u03BC\u03C0\u03BB\u03B7\u03C1\u03C9\u03BC\u03B1\u03C4\u03B9\u03BA\u03CC \u03A5\u03BB\u03B9\u03BA\u03CC" })), _jsxs("div", { className: "theory-content", children: [_jsx("p", { children: "\uD83D\uDCA1 \u03A7\u03C1\u03B7\u03C3\u03B9\u03BC\u03BF\u03C0\u03BF\u03B9\u03AE\u03C3\u03C4\u03B5 \u03C4\u03B1 \u03B5\u03C0\u03AF\u03C3\u03B7\u03BC\u03B1 \u03C3\u03C7\u03BF\u03BB\u03B9\u03BA\u03AC \u03B2\u03B9\u03B2\u03BB\u03AF\u03B1 \u03B3\u03B9\u03B1 \u03BD\u03B1 \u03B4\u03B5\u03AF\u03C4\u03B5 \u03CC\u03BB\u03BF \u03C4\u03BF \u03B8\u03B5\u03C9\u03C1\u03B7\u03C4\u03B9\u03BA\u03CC \u03C0\u03B5\u03C1\u03B9\u03B5\u03C7\u03CC\u03BC\u03B5\u03BD\u03BF \u03C4\u03BF\u03C5 \u03BA\u03B5\u03C6\u03B1\u03BB\u03B1\u03AF\u03BF\u03C5." }), _jsx("p", { children: "\uD83D\uDCDA \u03A4\u03BF \u03C0\u03B5\u03C1\u03B9\u03B5\u03C7\u03CC\u03BC\u03B5\u03BD\u03BF \u03C0\u03C1\u03BF\u03AD\u03C1\u03C7\u03B5\u03C4\u03B1\u03B9 \u03B1\u03C0\u03CC \u03C4\u03B1 \u03B5\u03C0\u03AF\u03C3\u03B7\u03BC\u03B1 \u03B5\u03BA\u03C0\u03B1\u03B9\u03B4\u03B5\u03C5\u03C4\u03B9\u03BA\u03AC \u03C5\u03BB\u03B9\u03BA\u03AC \u03C4\u03BF\u03C5 \u03A5\u03C0\u03BF\u03C5\u03C1\u03B3\u03B5\u03AF\u03BF\u03C5 \u03A0\u03B1\u03B9\u03B4\u03B5\u03AF\u03B1\u03C2." }), selectedSubject === 'AEPP' && (_jsx("p", { children: "\u2728 \u0393\u03B9\u03B1 \u03C4\u03BF \u0391\u0395\u03A0\u03A0 \u03C5\u03C0\u03AC\u03C1\u03C7\u03B5\u03B9 \u03BA\u03B1\u03B9 \u03C3\u03C5\u03BC\u03C0\u03BB\u03B7\u03C1\u03C9\u03BC\u03B1\u03C4\u03B9\u03BA\u03CC \u03B5\u03BA\u03C0\u03B1\u03B9\u03B4\u03B5\u03C5\u03C4\u03B9\u03BA\u03CC \u03C5\u03BB\u03B9\u03BA\u03CC \u03B3\u03B9\u03B1 \u03B5\u03BC\u03B2\u03AC\u03B8\u03C5\u03BD\u03C3\u03B7." }))] })] })] }));
}
