const fs = require('fs/promises');
const path = require('path');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const PROJECT_ROOT = path.join(__dirname, '..', '..');
const FRONTEND_PUBLIC_DIRECTORY = path.join(PROJECT_ROOT, 'frontend', 'public');
const DEFAULT_MODEL =
  process.env.GEMINI_PDF_EXPLAIN_MODEL || process.env.GEMINI_SPECIALIZED_TEACHER_MODEL || 'gemini-2.5-flash';
const MAX_PDF_BYTES = 25 * 1024 * 1024;
const MAX_CONTINUATIONS = 2;

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
    '7. Μην αφήνεις ποτέ μισή πρόταση, μισό heading ή κομμένη λέξη. Αν χρειάζεται, προτίμησε πιο συμπυκνωμένη αλλά ολοκληρωμένη απάντηση.',
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

function getResponseText(result) {
  return result?.response?.text?.()?.trim?.() || '';
}

function getFinishReason(result) {
  return result?.response?.candidates?.[0]?.finishReason || '';
}

function looksCutOff(text) {
  const normalized = String(text || '').trim();
  if (!normalized) return false;
  if (normalized.endsWith('...')) return true;
  if (/\*\*[^*]*$/.test(normalized)) return true;
  if (/[:;,–-]\s*$/.test(normalized)) return true;
  const lastLine = normalized.split('\n').filter(Boolean).pop() || '';
  return lastLine.length > 0 && lastLine.length < 18 && !/[.!;;;)]$/.test(lastLine);
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
      maxOutputTokens: 6000,
    },
  });

  const generateWithPrompt = (promptText) =>
    model.generateContent({
      contents: [
        {
          role: 'user',
          parts: [{ text: promptText }, pdfInlineData],
        },
      ],
    });

  let result = await generateWithPrompt(buildPdfTeacherPrompt({ question, title, subjectHint }));
  let answer = getResponseText(result);
  let finishReason = getFinishReason(result);

  for (let attempt = 0; attempt < MAX_CONTINUATIONS && (finishReason === 'MAX_TOKENS' || looksCutOff(answer)); attempt += 1) {
    const continuationPrompt = [
      'Η προηγούμενη απάντησή σου κόπηκε πριν ολοκληρωθεί.',
      'Συνέχισε ΜΟΝΟ από το σημείο που σταμάτησες, χωρίς να επαναλάβεις την αρχή.',
      'Κλείσε την απάντηση με ολοκληρωμένη πρόταση και την ενότητα "**Επόμενο βήμα**".',
      '',
      `Προηγούμενη απάντηση που κόπηκε:\n${answer}`,
      '',
      `Αρχική ερώτηση μαθητή: ${question || 'Εξήγησέ μου το PDF.'}`,
    ].join('\n');

    result = await generateWithPrompt(continuationPrompt);
    const continuation = getResponseText(result);
    finishReason = getFinishReason(result);

    if (!continuation) break;
    answer = `${answer}\n\n${continuation}`.trim();
  }

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
