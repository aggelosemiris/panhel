const fs = require('fs');
const path = require('path');
const { randomUUID } = require('crypto');
const PDFDocument = require('pdfkit');

const OUTPUT_DIR = path.join(__dirname, '..', 'data', 'generated-exams');

function ensureOutputDir() {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

function slugify(value) {
  return String(value || 'exam')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .toLowerCase();
}

function resolveFontPaths() {
  const regularCandidates = [
    'C:\\Windows\\Fonts\\arial.ttf',
    'C:\\Windows\\Fonts\\segoeui.ttf',
    '/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf',
  ];
  const boldCandidates = [
    'C:\\Windows\\Fonts\\arialbd.ttf',
    'C:\\Windows\\Fonts\\segoeuib.ttf',
    '/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf',
  ];

  const regular = regularCandidates.find((fontPath) => fs.existsSync(fontPath));
  const bold = boldCandidates.find((fontPath) => fs.existsSync(fontPath));

  return { regular, bold: bold || regular };
}

function normalizeNotation(text, subject = '') {
  let value = String(text ?? '').replace(/\r\n/g, '\n').replace(/\r/g, '\n').trim();

  if (/μαθη/i.test(subject) || /math/i.test(subject)) {
    value = value
      .replace(/\^2/g, '²')
      .replace(/\^3/g, '³')
      .replace(/\^4/g, '⁴')
      .replace(/\^5/g, '⁵')
      .replace(/\bx0\b/g, 'x₀')
      .replace(/\bx1\b/g, 'x₁')
      .replace(/\bx2\b/g, 'x₂')
      .replace(/\bf'\(x\)/g, 'f′(x)')
      .replace(/\bg'\(x\)/g, 'g′(x)')
      .replace(/\bh'\(x\)/g, 'h′(x)')
      .replace(/\bR\b/g, 'ℝ')
      .replace(/lim\s*x\s*->\s*/g, 'lim x→')
      .replace(/->/g, '→')
      .replace(/<=/g, '≤')
      .replace(/>=/g, '≥');
  }

  return value;
}

function addPageChrome(doc, fonts) {
  const pageWidth = doc.page.width;
  const pageHeight = doc.page.height;

  doc.save();
  doc.rect(0, 0, pageWidth, 28).fill('#ffffff');
  doc.rect(0, 28, pageWidth, 2).fill('#1d4ed8');
  doc.font(fonts.regular).fontSize(8).fillColor('#64748b');
  doc.text('Ψηφιακό Φροντιστήριο+ | Προσαρμοσμένο διαγώνισμα', doc.page.margins.left, 10, {
    width: pageWidth - doc.page.margins.left - doc.page.margins.right,
    align: 'center',
  });
  doc.moveTo(doc.page.margins.left, pageHeight - 42)
    .lineTo(pageWidth - doc.page.margins.right, pageHeight - 42)
    .lineWidth(0.7)
    .strokeColor('#cbd5e1')
    .stroke();
  doc.restore();
}

function addPageNumbers(doc, fonts) {
  const range = doc.bufferedPageRange();

  for (let index = 0; index < range.count; index += 1) {
    doc.switchToPage(index);
    doc.font(fonts.regular).fontSize(9).fillColor('#64748b');
    doc.text(`Σελίδα ${index + 1} από ${range.count}`, doc.page.margins.left, doc.page.height - 32, {
      width: doc.page.width - doc.page.margins.left - doc.page.margins.right,
      align: 'right',
    });
  }
}

function ensureSpace(doc, requiredHeight) {
  const remaining = doc.page.height - doc.page.margins.bottom - doc.y;

  if (remaining < requiredHeight) {
    doc.addPage();
  }
}

function writeWrapped(doc, text, options = {}) {
  const subject = options.subject ?? '';
  const lines = normalizeNotation(text, subject).split('\n');
  const x = options.x ?? doc.page.margins.left;
  const width = options.width ?? doc.page.width - doc.page.margins.left - doc.page.margins.right;

  lines.forEach((line, index) => {
    const trimmed = line.trim();
    const isBullet = /^[-•]\s+/.test(trimmed);
    const isSubQuestion = /^[Α-Δ][1-9]\./.test(trimmed);
    const textX = isBullet ? x + 12 : x;
    const textWidth = isBullet ? width - 12 : width;

    if (isSubQuestion) {
      doc.moveDown(0.25);
      doc.font(options.boldFont).fillColor('#0f172a');
    } else {
      doc.font(options.font).fillColor(options.color ?? '#1f2937');
    }

    doc.text(trimmed || ' ', textX, doc.y, {
      width: textWidth,
      lineGap: options.lineGap ?? 4,
      paragraphGap: index === lines.length - 1 ? 0 : 2,
    });
  });
}

function writeMetaRow(doc, fonts, label, value, x, y, labelWidth, valueWidth) {
  doc.font(fonts.bold).fontSize(9.8).fillColor('#0f172a').text(`${label}:`, x, y, { width: labelWidth });
  doc.font(fonts.regular).fontSize(9.8).fillColor('#334155').text(value, x + labelWidth, y, { width: valueWidth });
}

async function renderCustomExamPdf({ exam, selectedChapters }) {
  ensureOutputDir();

  const fontPaths = resolveFontPaths();
  const fileName = `${slugify(exam.subject)}-${slugify(exam.difficulty)}-${Date.now()}-${randomUUID().slice(0, 8)}.pdf`;
  const filePath = path.join(OUTPUT_DIR, fileName);

  await new Promise((resolve, reject) => {
    const stream = fs.createWriteStream(filePath);
    const doc = new PDFDocument({
      size: 'A4',
      margins: { top: 58, right: 48, bottom: 56, left: 48 },
      bufferPages: true,
      info: {
        Title: exam.title,
        Author: 'Ψηφιακό Φροντιστήριο+',
        Subject: exam.subject,
        Keywords: 'Πανελλήνιες, διαγώνισμα, γεννήτρια',
      },
    });

    doc.pipe(stream);

    if (fontPaths.regular) {
      doc.registerFont('PanhelRegular', fontPaths.regular);
    }
    if (fontPaths.bold) {
      doc.registerFont('PanhelBold', fontPaths.bold);
    }

    const fonts = {
      regular: fontPaths.regular ? 'PanhelRegular' : 'Helvetica',
      bold: fontPaths.bold ? 'PanhelBold' : 'Helvetica-Bold',
    };

    doc.on('pageAdded', () => {
      addPageChrome(doc, fonts);
      doc.font(fonts.regular).fillColor('#1f2937');
    });

    addPageChrome(doc, fonts);

    const usableWidth = doc.page.width - doc.page.margins.left - doc.page.margins.right;

    doc.font(fonts.bold).fontSize(10).fillColor('#1d4ed8').text('ΠΡΟΣΑΡΜΟΣΜΕΝΟ ΔΙΑΓΩΝΙΣΜΑ ΠΡΟΕΤΟΙΜΑΣΙΑΣ', {
      align: 'center',
      characterSpacing: 1.1,
    });
    doc.moveDown(0.45);
    doc.font(fonts.bold).fontSize(18).fillColor('#0f172a').text(normalizeNotation(exam.title, exam.subject), {
      align: 'center',
      lineGap: 4,
    });
    doc.moveDown(0.35);
    doc.font(fonts.regular).fontSize(9.5).fillColor('#475569').text('Δομή τύπου Πανελληνίων | ΘΕΜΑ Α - Β - Γ - Δ | Σύνολο 100 μονάδες', {
      align: 'center',
    });
    doc.moveDown(0.9);

    const metaTop = doc.y;
    const metaHeight = 118;
    doc.roundedRect(doc.page.margins.left, metaTop, usableWidth, metaHeight, 12).fillAndStroke('#f8fafc', '#cbd5e1');

    const metaX = doc.page.margins.left + 16;
    const labelWidth = 145;
    const valueWidth = usableWidth - labelWidth - 32;
    let rowY = metaTop + 14;
    const chapterText =
      selectedChapters?.length
        ? selectedChapters.map((chapter) => `Κεφ. ${chapter.number}: ${chapter.title}`).join(' | ')
        : (exam.chapterIds ?? []).join(', ');

    [
      ['Εξεταζόμενο μάθημα', exam.subject],
      ['Τύπος διαγωνίσματος', exam.difficultyLabel],
      ['Διάρκεια εξέτασης', `${exam.estimatedTimeMinutes} λεπτά`],
      ['Εξεταζόμενη ύλη', chapterText],
    ].forEach(([label, value]) => {
      writeMetaRow(doc, fonts, label, normalizeNotation(value, exam.subject), metaX, rowY, labelWidth, valueWidth);
      rowY = doc.y + 5;
    });

    doc.y = metaTop + metaHeight + 18;

    doc.font(fonts.bold).fontSize(12.5).fillColor('#0f172a').text('ΟΔΗΓΙΕΣ ΓΙΑ ΤΟΥΣ ΥΠΟΨΗΦΙΟΥΣ');
    doc.moveDown(0.35);
    (exam.instructions ?? []).forEach((instruction, index) => {
      doc.font(fonts.regular).fontSize(10.5).fillColor('#334155').text(`${index + 1}. ${normalizeNotation(instruction, exam.subject)}`, {
        lineGap: 4,
      });
      doc.moveDown(0.2);
    });

    doc.moveDown(0.55);

    (exam.questions ?? []).forEach((question) => {
      ensureSpace(doc, 155);

      const headerTop = doc.y;
      doc.roundedRect(doc.page.margins.left, headerTop, usableWidth, 34, 8).fillAndStroke('#eaf2ff', '#bfdbfe');
      doc.font(fonts.bold).fontSize(12.5).fillColor('#1d4ed8').text(question.id, doc.page.margins.left + 12, headerTop + 9, {
        width: 82,
      });
      doc.font(fonts.bold).fontSize(11.5).fillColor('#0f172a').text(normalizeNotation(question.title, exam.subject), doc.page.margins.left + 92, headerTop + 9, {
        width: usableWidth - 205,
      });
      doc.font(fonts.bold).fontSize(10.5).fillColor('#0f172a').text(`${question.points} μονάδες`, doc.page.width - doc.page.margins.right - 96, headerTop + 9, {
        width: 84,
        align: 'right',
      });

      doc.y = headerTop + 44;
      doc.font(fonts.regular).fontSize(10.8).fillColor('#1f2937');
      writeWrapped(doc, question.prompt, {
        font: fonts.regular,
        boldFont: fonts.bold,
        subject: exam.subject,
        width: usableWidth,
        lineGap: 4,
      });
      doc.moveDown(1.05);
    });

    ensureSpace(doc, 70);
    doc.moveDown(0.2);
    doc.font(fonts.bold).fontSize(12).fillColor('#1d4ed8').text('Καλή επιτυχία', { align: 'center' });
    doc.moveDown(0.25);
    doc.font(fonts.regular).fontSize(9.5).fillColor('#64748b').text(
      'Το διαγώνισμα δημιουργήθηκε αυτόματα με βάση τα κεφάλαια που επέλεξες και είναι έτοιμο για εκτύπωση ή αποθήκευση.',
      { align: 'center', lineGap: 4 },
    );

    addPageNumbers(doc, fonts);
    doc.end();

    stream.on('finish', resolve);
    stream.on('error', reject);
  });

  return {
    filePath,
    fileName,
  };
}

module.exports = {
  renderCustomExamPdf,
};
