import React, { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { SOS_SUBJECTS, SOS_TOPICS } from '../config/sosTopics.ts';
import { DEFAULT_QUIZ_USER_ID } from '../context/QuizContext.tsx';
import { useAuth } from '../context/AuthContext.tsx';
import { askSpecializedTeacherWithContext } from '../services/specializedTeacher.ts';

export default function PanicModePage() {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [selectedSubject, setSelectedSubject] = useState<(typeof SOS_SUBJECTS)[number]['id']>('all');
  const [activeTopicId, setActiveTopicId] = useState<string | null>(null);
  const [aiReply, setAiReply] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const topics = useMemo(() => {
    return SOS_TOPICS.filter((topic) => selectedSubject === 'all' || topic.subject === selectedSubject).sort(
      (left, right) => right.frequency - left.frequency,
    );
  }, [selectedSubject]);

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

  return (
    <div className="panic-page">
      <section className="panic-hero">
        <button className="module-b-back-button" onClick={() => navigate('/app')} type="button">
          ← Πίσω στο ταμπλό
        </button>
        <span className="dashboard-kicker">PANIC MODE</span>
        <h1>SOS θέματα πριν τις εξετάσεις</h1>
        <p>
          Συγκεντρωμένα κεφάλαια που εμφανίζονται συχνά στα τελευταία χρόνια. Διάλεξε μάθημα, δες τι να
          προτεραιοποιήσεις και ζήτα από τον καθηγητή στοχευμένη επανάληψη.
        </p>
      </section>

      <div className="panic-filter-row">
        {SOS_SUBJECTS.map((subject) => (
          <button
            key={subject.id}
            className={selectedSubject === subject.id ? 'active' : ''}
            onClick={() => setSelectedSubject(subject.id)}
            type="button"
          >
            {subject.label}
          </button>
        ))}
      </div>

      <section className="panic-grid">
        {topics.map((topic) => (
          <article key={topic.id} className="panic-card">
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
