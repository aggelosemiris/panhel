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
  ];
  const boldCandidates = [
    'C:\\Windows\\Fonts\\arialbd.ttf',
    'C:\\Windows\\Fonts\\segoeuib.ttf',
  ];

  const regular = regularCandidates.find((fontPath) => fs.existsSync(fontPath));
  const bold = boldCandidates.find((fontPath) => fs.existsSync(fontPath));

  return { regular, bold: bold || regular };
}

function addPageChrome(doc) {
  const pageWidth = doc.page.width;
  const pageHeight = doc.page.height;

  doc.save();
  doc.rect(0, 0, pageWidth, 26).fill('#10213a');
  doc.rect(0, 26, pageWidth, 6).fill('#e6b54a');
  doc.moveTo(doc.page.margins.left, pageHeight - 42)
    .lineTo(pageWidth - doc.page.margins.right, pageHeight - 42)
    .lineWidth(1)
    .strokeColor('#d1d5db')
    .stroke();
  doc.restore();
}

function addPageNumbers(doc, fonts) {
  const range = doc.bufferedPageRange();

  for (let index = 0; index < range.count; index += 1) {
    doc.switchToPage(index);
    doc.font(fonts.regular || 'Helvetica');
    doc.fontSize(9);
    doc.fillColor('#6b7280');
    doc.text(
      `Σελίδα ${index + 1} / ${range.count}`,
      doc.page.margins.left,
      doc.page.height - 32,
      { align: 'right', width: doc.page.width - doc.page.margins.left - doc.page.margins.right }
    );
  }
}

function ensureSpace(doc, requiredHeight) {
  const remaining = doc.page.height - doc.page.margins.bottom - doc.y;

  if (remaining < requiredHeight) {
    doc.addPage();
  }
}

function writeMultilineText(doc, text, options = {}) {
  const lines = String(text || '').split('\n');
  const startX = options.x ?? doc.page.margins.left;
  const width = options.width ?? doc.page.width - doc.page.margins.left - doc.page.margins.right;

  lines.forEach((line, index) => {
    const content = line.trim().length ? line : ' ';
    doc.text(content, startX, doc.y, {
      ...options,
      width,
      paragraphGap: index === lines.length - 1 ? 0 : 4,
    });
  });
}

async function renderCustomExamPdf({ exam, selectedChapters }) {
  ensureOutputDir();

  const fonts = resolveFontPaths();
  const fileName = `${slugify(exam.subject)}-${slugify(exam.difficulty)}-${Date.now()}-${randomUUID().slice(0, 8)}.pdf`;
  const filePath = path.join(OUTPUT_DIR, fileName);

  await new Promise((resolve, reject) => {
    const stream = fs.createWriteStream(filePath);
    const doc = new PDFDocument({
      size: 'A4',
      margins: { top: 64, right: 52, bottom: 56, left: 52 },
      bufferPages: true,
      info: {
        Title: exam.title,
        Author: 'Panhellenic Exam Coach',
        Subject: exam.subject,
        Keywords: 'panhellenics, exam, generator, pdf',
      },
    });

    doc.pipe(stream);

    if (fonts.regular) {
      doc.registerFont('PanhelRegular', fonts.regular);
    }
    if (fonts.bold) {
      doc.registerFont('PanhelBold', fonts.bold);
    }

    const regularFont = fonts.regular ? 'PanhelRegular' : 'Helvetica';
    const boldFont = fonts.bold ? 'PanhelBold' : 'Helvetica-Bold';

    doc.on('pageAdded', () => {
      addPageChrome(doc);
      doc.font(regularFont);
      doc.fillColor('#1f2937');
    });

    addPageChrome(doc);

    doc.font(boldFont).fontSize(11).fillColor('#10213a').text('ΠΡΟΣΑΡΜΟΣΜΕΝΟ ΔΙΑΓΩΝΙΣΜΑ', {
      align: 'center',
      characterSpacing: 1.2,
    });

    doc.moveDown(0.45);
    doc.font(boldFont).fontSize(20).fillColor('#111827').text(exam.title, {
      align: 'center',
      lineGap: 4,
    });

    doc.moveDown(0.8);

    const metaTop = doc.y;
    const metaHeight = 106;
    doc.roundedRect(doc.page.margins.left, metaTop, doc.page.width - doc.page.margins.left - doc.page.margins.right, metaHeight, 14)
      .fillAndStroke('#f8fafc', '#dbe3ef');

    let cursorY = metaTop + 16;
    const labelWidth = 110;
    const valueX = doc.page.margins.left + 18 + labelWidth;
    const valueWidth = doc.page.width - doc.page.margins.left - doc.page.margins.right - labelWidth - 36;

    const rows = [
      ['Μάθημα', exam.subject],
      ['Δυσκολία', exam.difficultyLabel],
      ['Χρόνος', `${exam.estimatedTimeMinutes} λεπτά`],
      ['Κεφάλαια', selectedChapters.map((chapter) => `Κεφ. ${chapter.number} - ${chapter.title}`).join(' | ')],
    ];

    rows.forEach(([label, value]) => {
      doc.font(boldFont).fontSize(10.5).fillColor('#10213a').text(`${label}:`, doc.page.margins.left + 18, cursorY, {
        width: labelWidth,
      });
      doc.font(regularFont).fontSize(10.5).fillColor('#374151').text(value, valueX, cursorY, {
        width: valueWidth,
      });
      cursorY = doc.y + 5;
    });

    doc.y = metaTop + metaHeight + 20;

    doc.font(boldFont).fontSize(13).fillColor('#111827').text('Οδηγίες');
    doc.moveDown(0.35);

    exam.instructions.forEach((instruction, index) => {
      doc.font(regularFont).fontSize(11).fillColor('#374151').text(`${index + 1}. ${instruction}`, {
        lineGap: 4,
      });
      doc.moveDown(0.2);
    });

    doc.moveDown(0.6);
    doc.font(boldFont).fontSize(13).fillColor('#111827').text('Θέματα');
    doc.moveDown(0.35);

    exam.questions.forEach((question) => {
      ensureSpace(doc, 170);

      const boxTop = doc.y;
      doc.roundedRect(doc.page.margins.left, boxTop, doc.page.width - doc.page.margins.left - doc.page.margins.right, 30, 10)
        .fillAndStroke('#eef4ff', '#c7d2fe');

      doc.font(boldFont).fontSize(12).fillColor('#1d4ed8').text(`${question.id}. ${question.title}`, doc.page.margins.left + 14, boxTop + 9, {
        width: 360,
      });
      doc.font(boldFont).fontSize(11).fillColor('#10213a').text(`${question.points} μονάδες`, doc.page.width - doc.page.margins.right - 120, boxTop + 9, {
        width: 106,
        align: 'right',
      });

      doc.y = boxTop + 42;
      doc.font(regularFont).fontSize(11.2).fillColor('#1f2937');
      writeMultilineText(doc, question.prompt, {
        x: doc.page.margins.left,
        width: doc.page.width - doc.page.margins.left - doc.page.margins.right,
        lineGap: 4,
      });
      doc.moveDown(1);
    });

    ensureSpace(doc, 95);
    doc.moveDown(0.4);
    doc.font(boldFont).fontSize(12).fillColor('#10213a').text('Καλή επιτυχία', { align: 'center' });
    doc.moveDown(0.3);
    doc.font(regularFont).fontSize(10.5).fillColor('#4b5563').text(
      'Το διαγώνισμα δημιουργήθηκε αυτόματα με βάση τα κεφάλαια που επέλεξες και είναι έτοιμο για εκτύπωση ή αποθήκευση.',
      { align: 'center', lineGap: 4 }
    );

    addPageNumbers(doc, { regular: regularFont });
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
