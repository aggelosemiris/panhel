import React, { useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import SubjectSelector from '../components/SubjectSelector.tsx';
import { SOS_TOPICS, type SosTopic } from '../config/sosTopics.ts';
import { DEFAULT_QUIZ_USER_ID } from '../context/QuizContext.tsx';
import { useAuth } from '../context/AuthContext.tsx';
import { askSpecializedTeacherWithContext } from '../services/specializedTeacher.ts';

type SubjectSelectorCode = 'MATH' | 'AOTh' | 'AEPP';

const SUBJECT_ROUTE_MAP: Record<SubjectSelectorCode, SosTopic['subject']> = {
  MATH: 'math',
  AOTh: 'aoth',
  AEPP: 'aepp',
};

const SUBJECT_LABELS: Record<SosTopic['subject'], string> = {
  math: 'Μαθηματικά',
  aoth: 'ΑΟΘ',
  aepp: 'ΑΕΠΠ',
};

function isSosSubject(value: string | undefined): value is SosTopic['subject'] {
  return value === 'math' || value === 'aoth' || value === 'aepp';
}

export default function PanicModePage() {
  const navigate = useNavigate();
  const { subjectID } = useParams<{ subjectID?: string }>();
  const { currentUser } = useAuth();
  const [activeTopicId, setActiveTopicId] = useState<string | null>(null);
  const [aiReply, setAiReply] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const selectedSubject = isSosSubject(subjectID) ? subjectID : null;

  const topics = useMemo(() => {
    if (!selectedSubject) {
      return [];
    }

    return SOS_TOPICS.filter((topic) => topic.subject === selectedSubject).sort((left, right) => right.frequency - left.frequency);
  }, [selectedSubject]);

  const handleSubjectSelect = (subject: SubjectSelectorCode) => {
    navigate(`/panic-mode/${SUBJECT_ROUTE_MAP[subject]}`);
  };

  const askTeacher = async (topicId: string) => {
    const topic = SOS_TOPICS.find((item) => item.id === topicId);
    if (!topic) {
      return;
    }

    setActiveTopicId(topicId);
    setAiReply('');
    setIsLoading(true);

    try {
      const response = await askSpecializedTeacherWithContext(
        `Φτιάξε μου SOS επανάληψη για ${topic.subjectLabel}, ${topic.chapter}: ${topic.title}. Θέλω τι να ξέρω, πώς εξετάζεται και μία μικρή άσκηση Πανελληνίων.`,
        {
          userId: currentUser?.id ?? DEFAULT_QUIZ_USER_ID,
          mode: 'methodology',
          attachments: [
            {
              name: `SOS ${topic.title}`,
              sizeLabel: 'στατικό panic mode',
              extractedText: `${topic.whyImportant}\nΠροτεινόμενη κίνηση: ${topic.suggestedAction}\nΈτη: ${topic.examYears.join(', ')}`,
            },
          ],
        },
      );

      setAiReply(response.reply);
    } catch {
      setAiReply('Δεν μπόρεσα να πάρω απάντηση τώρα. Δοκίμασε ξανά σε λίγο.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!selectedSubject) {
    return <SubjectSelector onSelect={handleSubjectSelect} />;
  }

  return (
    <div className="panic-page">
      <section className="panic-hero" data-reveal>
        <button className="module-b-back-button" onClick={() => navigate('/panic-mode')} type="button">
          ← Πίσω στα μαθήματα
        </button>
        <span className="dashboard-kicker">PANIC MODE</span>
        <h1>{`SOS θέματα ${SUBJECT_LABELS[selectedSubject]}`}</h1>
        <p>
          Συγκεντρωμένα SOS για το μάθημα που διάλεξες. Δες τι αξίζει να προτεραιοποιήσεις και ζήτα από τον καθηγητή
          στοχευμένη επανάληψη.
        </p>
      </section>

      <section className="panic-grid">
        {topics.map((topic, index) => (
          <article
            key={topic.id}
            className="panic-card"
            data-reveal
            style={{ '--reveal-delay': `${90 + index * 70}ms` } as React.CSSProperties}
          >
            <div className="panic-card-top">
              <span>{topic.subjectLabel}</span>
              <strong>{topic.frequency}% συχνότητα</strong>
            </div>
            <h2>{topic.title}</h2>
            <p className="panic-chapter">{topic.chapter}</p>
            <p>{topic.whyImportant}</p>
            <div className="panic-years">Έτη: {topic.examYears.join(' · ')}</div>
            <div className="panic-actions">
              <button onClick={() => askTeacher(topic.id)} type="button">
                {isLoading && activeTopicId === topic.id ? 'Ετοιμάζεται...' : 'Ζήτα SOS επανάληψη'}
              </button>
              {topic.relatedExamIds[0] ? <Link to={`/exams/${topic.relatedExamIds[0]}`}>Δες σχετικό θέμα</Link> : null}
            </div>
            {activeTopicId === topic.id && aiReply ? <pre className="panic-ai-reply">{aiReply}</pre> : null}
          </article>
        ))}
      </section>
    </div>
  );
}
