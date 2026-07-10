export type SingleTopicPdfItem = {
  id: string;
  title: string;
  pdfPath: string;
};

function pad(value: number) {
  return String(value).padStart(2, '0');
}

const mathTopicA: SingleTopicPdfItem[] = Array.from({ length: 50 }, (_, index) => {
  const order = index + 1;
  const suffix = pad(order);

  return {
    id: `math-topic-a-${suffix}`,
    title: `Θέμα Α ${suffix}`,
    pdfPath: `/single-topics/math/topic-a/Thema_A_${suffix}.pdf`,
  };
});

const aeppTopicA: SingleTopicPdfItem[] = Array.from({ length: 50 }, (_, index) => {
  const order = index + 1;
  const suffix = pad(order);

  return {
    id: `aepp-topic-a-${suffix}`,
    title: `Θέμα Α ${suffix}`,
    pdfPath: `/single-topics/aepp/topic-a/AEPP_Selected_Chapters_Theme_A_${suffix}.pdf`,
  };
});

const aothTopicA: SingleTopicPdfItem[] = Array.from({ length: 50 }, (_, index) => {
  const order = index + 1;
  const suffix = pad(order);

  return {
    id: `aoth-topic-a-${suffix}`,
    title: `Θέμα Α ${suffix}`,
    pdfPath: `/single-topics/aoth/topic-a/AOTH_Selected_Chapters_Theme_A_${suffix}.pdf`,
  };
});

const mathTopicB: SingleTopicPdfItem[] = Array.from({ length: 50 }, (_, index) => {
  const order = index + 1;
  const suffix = pad(order);

  return {
    id: `math-topic-b-${suffix}`,
    title: `Θέμα Β ${suffix}`,
    pdfPath: `/single-topics/math/topic-b/Mathimatika_Thema_B_${suffix}.pdf`,
  };
});

const aeppTopicB: SingleTopicPdfItem[] = Array.from({ length: 50 }, (_, index) => {
  const order = index + 1;
  const suffix = pad(order);

  return {
    id: `aepp-topic-b-${suffix}`,
    title: `Θέμα Β ${suffix}`,
    pdfPath: `/single-topics/aepp/topic-b/AEPP_Thema_B_${suffix}.pdf`,
  };
});

const aothTopicB: SingleTopicPdfItem[] = Array.from({ length: 50 }, (_, index) => {
  const order = index + 1;
  const suffix = pad(order);

  return {
    id: `aoth-topic-b-${suffix}`,
    title: `Θέμα Β ${suffix}`,
    pdfPath: `/single-topics/aoth/topic-b/AOTH_Thema_B_${suffix}.pdf`,
  };
});

const mathTopicC: SingleTopicPdfItem[] = Array.from({ length: 50 }, (_, index) => {
  const order = index + 1;
  const suffix = pad(order);

  return {
    id: `math-topic-c-${suffix}`,
    title: `Θέμα Γ ${suffix}`,
    pdfPath: `/single-topics/math/topic-c/Mathimatika_${suffix}.pdf`,
  };
});

const aeppTopicC: SingleTopicPdfItem[] = Array.from({ length: 50 }, (_, index) => {
  const order = index + 1;
  const suffix = pad(order);

  return {
    id: `aepp-topic-c-${suffix}`,
    title: `Θέμα Γ ${suffix}`,
    pdfPath: `/single-topics/aepp/topic-c/AEPP_${suffix}.pdf`,
  };
});

const aothTopicC: SingleTopicPdfItem[] = Array.from({ length: 50 }, (_, index) => {
  const order = index + 1;
  const suffix = pad(order);

  return {
    id: `aoth-topic-c-${suffix}`,
    title: `Θέμα Γ ${suffix}`,
    pdfPath: `/single-topics/aoth/topic-c/AOTH_${suffix}.pdf`,
  };
});

const mathTopicD: SingleTopicPdfItem[] = Array.from({ length: 50 }, (_, index) => {
  const order = index + 1;
  const suffix = pad(order);

  return {
    id: `math-topic-d-${suffix}`,
    title: `Θέμα Δ ${suffix}`,
    pdfPath: `/single-topics/math/topic-d/${suffix}_Mathimatika_Thema_D.pdf`,
  };
});

const aeppTopicD: SingleTopicPdfItem[] = Array.from({ length: 50 }, (_, index) => {
  const order = index + 1;
  const suffix = pad(order);

  return {
    id: `aepp-topic-d-${suffix}`,
    title: `Θέμα Δ ${suffix}`,
    pdfPath: `/single-topics/aepp/topic-d/${suffix}_AEPP_Thema_D.pdf`,
  };
});

const aothTopicD: SingleTopicPdfItem[] = Array.from({ length: 50 }, (_, index) => {
  const order = index + 1;
  const suffix = pad(order);

  return {
    id: `aoth-topic-d-${suffix}`,
    title: `Θέμα Δ ${suffix}`,
    pdfPath: `/single-topics/aoth/topic-d/${suffix}_AOTH_Thema_D.pdf`,
  };
});

const MATH_CORRECT_WRITING_PACKS: Record<string, string> = {
  'math-1-1__math-1-2': 'Συνδυαστικές ασκήσεις: Πραγματικοί αριθμοί - Συναρτήσεις',
  'math-1-3': 'Συνδυαστικές ασκήσεις: Μονοτονία - Αντίστροφη',
  'math-1-4__math-1-5__math-1-6__math-1-7': 'Συνδυαστικές ασκήσεις: Όρια και συνέχεια',
  'math-1-8': 'Συνδυαστικές ασκήσεις: Σύνοψη 1ου κεφαλαίου',
  'math-2-1__math-2-2': 'Συνδυαστικές ασκήσεις: Παράγωγος - Εφαπτομένη',
  'math-2-3': 'Συνδυαστικές ασκήσεις: Κανόνες παραγώγισης',
  'math-2-4': 'Συνδυαστικές ασκήσεις: Ρυθμός μεταβολής',
  'math-2-5__math-2-6': 'Συνδυαστικές ασκήσεις: Θεώρημα μέσης τιμής',
  'math-2-7__math-2-8__math-2-9__math-2-10': 'Συνδυαστικές ασκήσεις: Μελέτη συνάρτησης',
  'math-3-1': 'Συνδυαστικές ασκήσεις: Αόριστο ολοκλήρωμα',
  'math-3-4': 'Συνδυαστικές ασκήσεις: Ορισμένο ολοκλήρωμα',
  'math-3-5': 'Συνδυαστικές ασκήσεις: Συνάρτηση ολοκληρώματος',
  'math-3-7': 'Συνδυαστικές ασκήσεις: Εμβαδόν',
};

function buildMathCorrectWritingPack(groupKey: string, title: string): SingleTopicPdfItem[] {
  return [
    {
      id: `${groupKey}-correct-writing`,
      title,
      pdfPath: `/single-topics/math/correct-writing/${groupKey}/correct-writing-exercises.pdf`,
    },
  ];
}

const mathCorrectWritingExercises = Object.fromEntries(
  Object.entries(MATH_CORRECT_WRITING_PACKS).map(([groupKey, title]) => [
    groupKey,
    buildMathCorrectWritingPack(groupKey, title),
  ]),
) as Record<string, SingleTopicPdfItem[]>;

const SINGLE_TOPIC_LIBRARY: Record<string, Record<string, SingleTopicPdfItem[]>> = {
  math: {
    'topic-a': mathTopicA,
    'topic-b': mathTopicB,
    'topic-c': mathTopicC,
    'topic-d': mathTopicD,
    ...mathCorrectWritingExercises,
  },
  aepp: {
    'topic-a': aeppTopicA,
    'topic-b': aeppTopicB,
    'topic-c': aeppTopicC,
    'topic-d': aeppTopicD,
  },
  aoth: {
    'topic-a': aothTopicA,
    'topic-b': aothTopicB,
    'topic-c': aothTopicC,
    'topic-d': aothTopicD,
  },
};

export function getSingleTopicPdfs(subjectId: string, topicKey: string) {
  return SINGLE_TOPIC_LIBRARY[subjectId]?.[topicKey] ?? [];
}
