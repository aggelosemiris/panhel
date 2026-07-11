const fs = require('fs/promises');
const path = require('path');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const PROJECT_ROOT = path.join(__dirname, '..', '..');
const FRONTEND_PUBLIC_DIRECTORY = path.join(PROJECT_ROOT, 'frontend', 'public');
const DEFAULT_MODEL =
  process.env.GEMINI_PDF_EXPLAIN_MODEL || process.env.GEMINI_SPECIALIZED_TEACHER_MODEL || 'gemini-2.5-flash';
const MAX_PDF_BYTES = 25 * 1024 * 1024;

function resolvePublicPdfPath(relativePublicPath) {
  const normalizedPath = String(relativePublicPath || '')
    .replace(/^https?:\/\/[^/]+/i, '')
    .replace(/^\/+/, '');

  if (!normalizedPath || !normalizedPath.toLowerCase().endsWith('.pdf')) {
    throw new Error('Invalid PDF path');
  }

  const publicRoot = path.resolve(FRONTEND_PUBLIC_DIRECTORY);
  const absolutePath = path.resolve(publicRoot, normalizedPath);

  if (!absolutePath.startsWith(publicRoot + path.sep)) {
    throw new Error('Invalid PDF path');
  }

  return absolutePath;
}

async function readPdfAsInlineData(pdfPath) {
  const absolutePath = resolvePublicPdfPath(pdfPath);
  const stats = await fs.stat(absolutePath);

  if (!stats.isFile()) {
    throw new Error('PDF file not found');
  }

  if (stats.size > MAX_PDF_BYTES) {
    throw new Error('Το PDF είναι πολύ μεγάλο για άμεση AI ανάγνωση. Άνοιξέ το σε νέο tab ή ρώτα για συγκεκριμένη σελίδα.');
  }

  const fileBuffer = await fs.readFile(absolutePath);
  return {
    inlineData: {
      mimeType: 'application/pdf',
      data: fileBuffer.toString('base64'),
    },
  };
}

function buildPdfTeacherPrompt({ question, title, subjectHint }) {
  const safeQuestion = String(question || '').trim();

  return [
    'Είσαι ο Ψηφιακός Καθηγητής Πανελληνίων για το 4ο Πεδίο.',
    'Δουλεύεις σαν καθηγητής φροντιστηρίου: καθαρά, υποστηρικτικά, αυστηρά ως προς την ύλη και με σχολική ορολογία.',
    '',
    'Αποστολή:',
    '1. Διάβασε/σάρωσε με OCR ολόκληρο το συνημμένο PDF.',
    '2. Εντόπισε τα σημεία που απαντούν στην ερώτηση του μαθητή.',
    '3. Εξήγησε με βάση το PDF, όχι γενικά από μνήμη, εκτός αν λείπει πληροφορία από το PDF.',
    '4. Αν η ερώτηση είναι αόριστη, κάνε συνοπτική εξήγηση του πιο σημαντικού σημείου του PDF και πρότεινε τι να ρωτήσει μετά.',
    '5. Αν υπάρχει άσκηση, μη δίνεις κατευθείαν τελική λύση. Δώσε καθοδήγηση βήμα-βήμα και μετά ένα μικρό “αν κολλήσεις” hint.',
    '6. Χρησιμοποίησε Markdown, μικρές ενότητες, bullets και όπου χρειάζεται τύπους με $...$.',
    '',
    `Τίτλος PDF: ${title || 'PDF εφαρμογής'}`,
    subjectHint ? `Μάθημα/ενότητα: ${subjectHint}` : '',
    '',
    `Ερώτηση μαθητή: ${safeQuestion || 'Εξήγησέ μου τι πρέπει να προσέξω σε αυτό το PDF.'}`,
    '',
    'Δομή απάντησης:',
    '- **Τι κοιτάμε στο PDF**: 1-2 προτάσεις.',
    '- **Εξήγηση βήμα-βήμα**: η βασική διδασκαλία.',
    '- **SOS για Πανελλήνιες**: μία λεπτομέρεια βαθμολόγησης ή παγίδα.',
    '- **Επόμενο βήμα**: μία μικρή ερώτηση/άσκηση για τον μαθητή.',
  ]
    .filter(Boolean)
    .join('\n');
}

async function explainPdf({ pdfPath, question, title, subjectHint }) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY missing');
  }

  const pdfInlineData = await readPdfAsInlineData(pdfPath);
  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({
    model: DEFAULT_MODEL,
    generationConfig: {
      temperature: 0.35,
      topP: 0.9,
      maxOutputTokens: 2200,
    },
  });

  const result = await model.generateContent({
    contents: [
      {
        role: 'user',
        parts: [{ text: buildPdfTeacherPrompt({ question, title, subjectHint }) }, pdfInlineData],
      },
    ],
  });

  const answer = result?.response?.text?.()?.trim?.() || '';
  if (!answer) {
    throw new Error('AI returned empty PDF explanation');
  }

  return {
    answer,
    model: DEFAULT_MODEL,
    provider: 'gemini',
  };
}

module.exports = {
  explainPdf,
};
