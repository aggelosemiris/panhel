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

const SINGLE_TOPIC_LIBRARY: Record<string, Record<string, SingleTopicPdfItem[]>> = {
  math: {
    'topic-a': mathTopicA,
    'topic-b': mathTopicB,
    'topic-c': mathTopicC,
    'topic-d': mathTopicD,
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
