const fs = require('fs/promises');
const path = require('path');
const { randomUUID } = require('crypto');

const AUDIO_DIRECTORY = path.join(__dirname, '..', 'data', 'generated-explanations');
const OPENAI_AUDIO_URL = 'https://api.openai.com/v1/audio/speech';
const DEFAULT_TTS_MODEL = process.env.OPENAI_TTS_MODEL || 'gpt-4o-mini-tts';
const DEFAULT_TTS_VOICE = process.env.OPENAI_TTS_VOICE || 'cedar';

async function ensureAudioDirectory() {
  await fs.mkdir(AUDIO_DIRECTORY, { recursive: true });
}

function sanitizeName(value) {
  return String(value || 'lesson')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .toLowerCase();
}

function buildGreekNarrationPrompt(lesson) {
  return [
    `Τίτλος μαθήματος: ${lesson.lessonTitle}`,
    `Στόχος: ${lesson.lessonObjective}`,
    '',
    'Να γίνει άπταιστη ελληνική αφήγηση, με φυσικό τόνο έμπειρου καθηγητή φροντιστηρίου.',
    'Η προφορά πρέπει να είναι καθαρή, φυσική, χωρίς αγγλική χροιά και χωρίς να ακούγεται σαν ρομπότ.',
    'Να υπάρχουν μικρές παύσεις ανάμεσα στις σκηνές και έμφαση στις βασικές έννοιες.',
    '',
    lesson.narrationScript,
  ].join('\n');
}

async function generateExplanationAudioOverview(lesson) {
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    return {
      status: 'unavailable',
      error: 'Δεν υπάρχει OPENAI_API_KEY για παραγωγή φυσικής ελληνικής αφήγησης.',
      provider: 'none',
      audioUrl: null,
      generatedAt: new Date().toISOString(),
    };
  }

  await ensureAudioDirectory();

  const response = await fetch(OPENAI_AUDIO_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: DEFAULT_TTS_MODEL,
      voice: DEFAULT_TTS_VOICE,
      language: 'el',
      format: 'mp3',
      input: buildGreekNarrationPrompt(lesson),
      instructions:
        'Speak in fluent, native-sounding Greek for Greek high-school students preparing for the Panhellenic exams. Maintain clear pronunciation, tutoring warmth, calm pacing, and confident educational delivery.',
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Audio overview generation failed (${response.status}): ${errorText}`);
  }

  const buffer = Buffer.from(await response.arrayBuffer());
  const fileName = `${sanitizeName(lesson.subjectLabel)}-${sanitizeName(lesson.lessonTitle)}-${randomUUID().slice(0, 8)}.mp3`;
  const filePath = path.join(AUDIO_DIRECTORY, fileName);
  await fs.writeFile(filePath, buffer);

  return {
    status: 'ready',
    provider: 'openai',
    model: DEFAULT_TTS_MODEL,
    voice: DEFAULT_TTS_VOICE,
    audioUrl: `/generated-explanations/${fileName}`,
    generatedAt: new Date().toISOString(),
    error: null,
  };
}

module.exports = {
  generateExplanationAudioOverview,
};
