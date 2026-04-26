import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { getSubjectById } from '../config/curricula.ts';
import { useAuth } from '../context/AuthContext.tsx';
import { getStudentProfileStats, type StudentChapterPerformance, type StudentProfileStats } from '../services/studentStats.ts';

function formatPercent(value: number) {
  return `${value.toFixed(1)}%`;
}

function getTopicLabel(topicType: string) {
  const labels: Record<string, string> = {
    'topic-a': 'Θέμα Α',
    'topic-b': 'Θέμα Β',
    'topic-c': 'Θέμα Γ',
    'topic-d': 'Θέμα Δ',
  };

  return labels[topicType] ?? topicType;
}

function getChapterLabel(chapterStat: StudentChapterPerformance | null) {
  if (!chapterStat) {
    return 'Δεν υπάρχουν ακόμα δεδομένα';
  }

  const subject = getSubjectById(chapterStat.subject);
  const chapter = subject?.chapters.find((item) => item.id === chapterStat.chapterId);

  if (!subject || !chapter) {
    return chapterStat.chapterId;
  }

  return `${subject.code} · Κεφάλαιο ${chapter.number} - ${chapter.title}`;
}

export default function ProfilePage() {
  const { currentUser } = useAuth();
  const [profile, setProfile] = useState<StudentProfileStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function loadProfile() {
      try {
        const nextProfile = await getStudentProfileStats(currentUser?.id ?? 'guest-user');

        if (!cancelled) {
          setProfile(nextProfile);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadProfile();

    return () => {
      cancelled = true;
    };
  }, [currentUser?.id]);

  const chapterStats = useMemo(() => profile?.byChapter ?? [], [profile]);
  const examDifficultyBySubject = useMemo(() => profile?.examDifficultyBySubject ?? [], [profile]);
  const trueFalseBySubject = useMemo(() => profile?.trueFalseBySubject ?? [], [profile]);
  const singleTopicBySubject = useMemo(() => profile?.singleTopicBySubject ?? [], [profile]);

  if (loading) {
    return (
      <div className="simple-module-page">
        <div className="module-b-hero">
          <h1>Προφίλ Μαθητή</h1>
          <p>Φορτώνω τα στατιστικά προόδου σου...</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="simple-module-page">
        <div className="module-b-hero">
          <h1>Προφίλ Μαθητή</h1>
          <p>Δεν μπόρεσα να φορτώσω τα στατιστικά αυτή τη στιγμή.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="simple-module-page">
      <div className="module-b-hero">
        <h1>Προφίλ Μαθητή</h1>
        <p>Παρακολούθησε την πρόοδό σου ανά μάθημα, κεφάλαιο και συνολικό score.</p>
      </div>

      <section className="profile-overview-grid">
        <article className="profile-stat-card">
          <span>Συνολικό ποσοστό επιτυχίας</span>
          <strong>{formatPercent(profile.overallAccuracyPercent)}</strong>
        </article>
        <article className="profile-stat-card">
          <span>Σύνολο απαντημένων ερωτήσεων</span>
          <strong>{profile.totalAnsweredQuestions}</strong>
        </article>
        <article className="profile-stat-card">
          <span>Πιο αδύναμο κεφάλαιο</span>
          <strong>{getChapterLabel(profile.weakestChapter)}</strong>
        </article>
        <article className="profile-stat-card">
          <span>Πιο δυνατό κεφάλαιο</span>
          <strong>{getChapterLabel(profile.strongestChapter)}</strong>
        </article>
      </section>

      <section className="generator-panel profile-panel">
        <h2>Επίδοση ανά Σ/Λ</h2>
        {trueFalseBySubject.length === 0 ? (
          <p>Μόλις ξεκινήσει να γράφεται πρόοδος από τις ασκήσεις σωστού ή λάθους, εδώ θα βλέπεις την επίδοση ανά μάθημα.</p>
        ) : (
          <div className="profile-list">
            {trueFalseBySubject.map((subjectStat) => {
              const subject = getSubjectById(subjectStat.subject);

              return (
                <article key={`tf-${subjectStat.subject}`} className="profile-list-card">
                  <div>
                    <strong>{subject ? `${subject.emoji} ${subject.greekName}` : subjectStat.subject}</strong>
                    <p>{`${subjectStat.timesCorrect}/${subjectStat.timesAnswered} σωστές απαντήσεις σε Σ/Λ`}</p>
                  </div>
                  <span>{formatPercent(subjectStat.accuracyPercent)}</span>
                </article>
              );
            })}
          </div>
        )}
      </section>

      <section className="generator-panel profile-panel">
        <h2>Επίδοση ανά Θέμα</h2>
        <p>
          Από εδώ παρακολουθείς την απόδοσή σου στα μεμονωμένα θέματα. Για νέα AI διόρθωση πήγαινε στα{' '}
          <Link to="/single-topics">Μεμονωμένα Θέματα</Link>.
        </p>
        {singleTopicBySubject.length === 0 ? (
          <p>
            Μόλις διορθώσεις το πρώτο μεμονωμένο θέμα με AI, εδώ θα βλέπεις μέσους όρους ανά θέμα. Μπορείς να ξεκινήσεις από το{' '}
            <Link to="/single-topics">Μεμονωμένα Θέματα</Link>.
          </p>
        ) : (
          <div className="profile-list">
            {singleTopicBySubject.map((subjectStats) => {
              const subject = getSubjectById(subjectStats.subject);

              return (
                <article key={`topic-${subjectStats.subject}`} className="profile-list-card profile-exam-card">
                  <div>
                    <strong>{subject ? `${subject.emoji} ${subject.greekName}` : subjectStats.subject}</strong>
                    {subjectStats.topics.map((topic) => (
                      <p key={`${subjectStats.subject}-${topic.topicType}`}>
                        {`${getTopicLabel(topic.topicType)}: ${formatPercent(topic.averagePercent)} (${topic.attempts})`}
                      </p>
                    ))}
                  </div>
                  <span>
                    {formatPercent(
                      subjectStats.topics.length
                        ? subjectStats.topics.reduce((sum, topic) => sum + topic.averagePercent, 0) / subjectStats.topics.length
                        : 0,
                    )}
                  </span>
                </article>
              );
            })}
          </div>
        )}
      </section>

      <section className="generator-panel profile-panel">
        <h2>Μέσοι όροι διαγωνισμάτων ανά δυσκολία</h2>
        {examDifficultyBySubject.length === 0 ? (
          <p>Μόλις διορθώσεις το πρώτο διαγώνισμα με AI, εδώ θα βλέπεις μέσο όρο σε εύκολα, μέτρια και δύσκολα.</p>
        ) : (
          <div className="profile-list">
            {examDifficultyBySubject.map((subjectStats) => {
              const subject = getSubjectById(subjectStats.subject);
              const averages = [
                subjectStats.easy.averagePercent,
                subjectStats.medium.averagePercent,
                subjectStats.hard.averagePercent,
              ].filter((value, index) => {
                const attempts = [subjectStats.easy.attempts, subjectStats.medium.attempts, subjectStats.hard.attempts][index];
                return attempts > 0;
              });
              const expectedResult =
                averages.length > 0 ? averages.reduce((sum, value) => sum + value, 0) / averages.length : 0;

              return (
                <article key={`exam-${subjectStats.subject}`} className="profile-list-card profile-exam-card">
                  <div>
                    <strong>{subject ? `${subject.emoji} ${subject.greekName}` : subjectStats.subject}</strong>
                    <p>{`Εύκολα: ${formatPercent(subjectStats.easy.averagePercent)} (${subjectStats.easy.attempts})`}</p>
                    <p>{`Μέτρια: ${formatPercent(subjectStats.medium.averagePercent)} (${subjectStats.medium.attempts})`}</p>
                    <p>{`Δύσκολα: ${formatPercent(subjectStats.hard.averagePercent)} (${subjectStats.hard.attempts})`}</p>
                    <p>{`Αναμενόμενο αποτέλεσμα: ${formatPercent(expectedResult)}`}</p>
                  </div>
                  <span>{formatPercent(expectedResult)}</span>
                </article>
              );
            })}
          </div>
        )}
      </section>

      <section className="generator-panel profile-panel">
        <h2>Επίδοση ανά μάθημα</h2>
        {profile.bySubject.length === 0 ? (
          <p>
            Δεν υπάρχουν ακόμη καταγεγραμμένες απαντήσεις. Ξεκίνα από το <Link to="/theory-quiz">Quiz θεωρίας</Link> για
            να αρχίσει να χτίζεται το προφίλ σου.
          </p>
        ) : (
          <div className="profile-list">
            {profile.bySubject.map((subjectStat) => {
              const subject = getSubjectById(subjectStat.subject);

              return (
                <article key={subjectStat.subject} className="profile-list-card">
                  <div>
                    <strong>{subject ? `${subject.emoji} ${subject.greekName}` : subjectStat.subject}</strong>
                    <p>{`${subjectStat.timesCorrect}/${subjectStat.timesAnswered} σωστές απαντήσεις`}</p>
                  </div>
                  <span>{formatPercent(subjectStat.accuracyPercent)}</span>
                </article>
              );
            })}
          </div>
        )}
      </section>

      <section className="generator-panel profile-panel">
        <h2>Επίδοση ανά κεφάλαιο</h2>
        {chapterStats.length === 0 ? (
          <p>Μόλις απαντήσεις στα πρώτα quiz, εδώ θα εμφανιστεί η ανάλυση ανά κεφάλαιο.</p>
        ) : (
          <div className="profile-list">
            {chapterStats.map((chapterStat) => (
              <article key={`${chapterStat.subject}-${chapterStat.chapterId}`} className="profile-list-card">
                <div>
                  <strong>{getChapterLabel(chapterStat)}</strong>
                  <p>{`${chapterStat.timesCorrect}/${chapterStat.timesAnswered} σωστές απαντήσεις`}</p>
                </div>
                <span>{formatPercent(chapterStat.accuracyPercent)}</span>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
