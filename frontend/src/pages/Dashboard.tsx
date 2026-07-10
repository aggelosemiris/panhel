import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.tsx';
import { DEFAULT_QUIZ_USER_ID } from '../context/QuizContext.tsx';
import { getStudentProfileStats, touchStudyActivity, type StudentProfileStats } from '../services/studentStats.ts';
import { LuBookOpen, LuBot, LuFileText, LuGraduationCap, LuHistory, LuSettings, LuSparkles, LuTrophy } from 'react-icons/lu';

const planCards = [
  {
    badge: 'ELITE',
    icon: LuBot,
    title: 'Cortex AI Engine',
    text: 'Ο πιο δυνατός τρόπος να λύνεις απορίες, να παίρνεις reasoning και να δουλεύεις ύλη σαν να έχεις καθηγητή δίπλα σου.',
    href: '/specialized-teacher',
    action: 'Είσοδος',
    locked: true,
    featured: true,
  },
  {
    badge: 'QUIZ',
    icon: LuGraduationCap,
    title: 'Quiz Θεωρίας',
    text: 'Έλεγχος κατανόησης ανά μάθημα και κεφάλαιο με score και καθαρό feedback.',
    href: '/theory-quiz',
    action: 'Είσοδος',
  },
  {
    badge: 'MUST',
    icon: LuSparkles,
    title: 'SOS Θέματα',
    text: 'Τα πιο κρίσιμα μοτίβα των τελευταίων ετών μαζεμένα για γρήγορη επανάληψη.',
    href: '/panic-mode',
    action: 'Είσοδος',
  },
  {
    badge: 'CORE',
    icon: LuBookOpen,
    title: 'Διαδραστικό Βιβλίο',
    text: 'Θεωρία, κεφάλαια και οργανωμένη μελέτη μέσα σε μία ενιαία εμπειρία.',
    href: '/textbook',
    action: 'Είσοδος',
  },
  {
    badge: 'TESTS',
    icon: LuFileText,
    title: 'Διαγωνίσματα',
    text: 'Εξάσκηση ανά κεφάλαιο, difficulty tiers και έτοιμη πορεία μελέτης.',
    href: '/tests/chapter',
    action: 'Είσοδος',
  },
  {
    badge: 'PDF',
    icon: LuHistory,
    title: 'Παλαιές Εξετάσεις',
    text: 'Πανελλήνιες και ΟΕΦΕ σε καθαρό PDF viewer για σοβαρή επανάληψη.',
    href: '/exams',
    action: 'Είσοδος',
  },
];

const toolCards = [
  { icon: LuSettings, title: 'Generator', text: 'Φτιάξε δικό σου διαγώνισμα.', href: '/generator', locked: false },
  { icon: LuTrophy, title: 'Στατιστικά', text: 'Προφίλ μαθητή και επίδοση.', href: '/profile', locked: true },
  { icon: LuGraduationCap, title: 'Σωστό / Λάθος', text: 'Γρήγορη θεωρητική επανάληψη.', href: '/true-false', locked: false },
  { icon: LuFileText, title: 'Μεμονωμένες Ασκήσεις', text: 'Μεμονωμένες ασκήσεις από κάθε ξεχωριστό κεφάλαιο.', href: '/single-topics', locked: false },
  { icon: LuHistory, title: 'ΟΕΦΕ', text: 'Παλαιότερα θέματα ΟΕΦΕ.', href: '/oefe', locked: false },
];

const subjectMeta = [
  { id: 'math', label: 'Μαθηματικά', accent: '#4c7cff', fallback: 45 },
  { id: 'aoth', label: 'ΑΟΘ', accent: '#20bf6b', fallback: 72 },
  { id: 'aepp', label: 'ΑΕΠΠ', accent: '#7b61ff', fallback: 58 },
];

function getProgress(profile: StudentProfileStats | null, subjectId: string, fallback: number) {
  const found = profile?.bySubject?.find((item) => item.subject.toLowerCase() === subjectId);
  return Math.round(found?.accuracyPercent ?? fallback);
}

function AnimatedNumber({ value }: { value: number }) {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    let frame = 0;
    const totalFrames = 24;
    const animate = () => {
      frame += 1;
      const next = Math.round((value * frame) / totalFrames);
      setDisplayValue(next);
      if (frame < totalFrames) {
        window.requestAnimationFrame(animate);
      }
    };

    setDisplayValue(0);
    window.requestAnimationFrame(animate);
  }, [value]);

  return <>{displayValue}%</>;
}

export default function Dashboard() {
  const { currentUser, isAuthenticated } = useAuth();
  const [profile, setProfile] = useState<StudentProfileStats | null>(null);

  useEffect(() => {
    const userId = currentUser?.id ?? DEFAULT_QUIZ_USER_ID;

    touchStudyActivity(userId)
      .catch(() => null)
      .finally(() => {
        getStudentProfileStats(userId).then(setProfile).catch(() => setProfile(null));
      });
  }, [currentUser?.id]);

  const dailyTip = useMemo(() => {
    const weakest = profile?.weakestChapter;
    if (!weakest) {
      return 'Αν είσαι στην αρχή, ξεκίνα από θεωρία και μετά κάνε ένα Quiz Θεωρίας τουλάχιστον μία φορά την εβδομάδα.';
    }

    return `Σήμερα δώσε 20 λεπτά στο ${weakest.subject.toUpperCase()} / ${weakest.chapterId}. Μετά κάνε ένα μικρό quiz για έλεγχο.`;
  }, [profile]);

  const statCards = useMemo(
    () => [
      {
        label: 'Συνολική Ακρίβεια',
        value: `${Math.round(profile?.overallAccuracyPercent ?? 68)}%`,
      },
      {
        label: 'Απαντημένες Ερωτήσεις',
        value: `${profile?.totalAnsweredQuestions ?? 128}`,
      },
      {
        label: 'Study Streak',
        value: `${profile?.studyStreak ?? 0} ημέρες`,
      },
    ],
    [profile],
  );

  return (
    <div className="dashboard-v2">
      <section className="dashboard-hero-v2" data-reveal>
        <div className="dashboard-hero-copy-wrap-v2">
          <div className="dashboard-hero-icon-v2">
            <LuTrophy size={26} />
          </div>
          <div>
            <p className="dashboard-kicker-v2">ΠΛΑΤΦΟΡΜΑ ΠΡΟΕΤΟΙΜΑΣΙΑΣ</p>
            <h1>Το Πλάνο σου</h1>
            <p className="dashboard-hero-text-v2">
              {isAuthenticated
                ? `Γεια σου ${currentUser?.username}. Συνέχισε από εκεί που σταμάτησες και κράτα ρυθμό με ξεκάθαρη εικόνα προόδου.`
                : 'Εργαλεία για την καθημερινή σου μελέτη, με καθαρή δομή και πραγματική αίσθηση ελέγχου.'}
            </p>
          </div>
        </div>

        <div className="dashboard-hero-stats-v2">
          {statCards.map((card) => (
            <article
              key={card.label}
              className="dashboard-hero-stat-v2"
              data-reveal
              style={{ ['--reveal-delay' as string]: `${70 + statCards.indexOf(card) * 70}ms` }}
            >
              <strong>{card.value}</strong>
              <span>{card.label}</span>
            </article>
          ))}
        </div>
      </section>

      <section className="dashboard-progress-v2">
        {subjectMeta.map((subject) => {
          const progress = getProgress(profile, subject.id, subject.fallback);

          return (
            <article
              key={subject.id}
              className="dashboard-progress-card-v2"
              data-reveal
              style={{ ['--reveal-delay' as string]: `${100 + subjectMeta.indexOf(subject) * 80}ms` }}
            >
              <div className="dashboard-progress-head-v2">
                <span>{subject.label}</span>
                <strong>
                  <AnimatedNumber value={progress} />
                </strong>
              </div>
              <div className="dashboard-progress-bar-v2" style={{ ['--progress-accent' as string]: subject.accent }}>
                <div className="dashboard-progress-fill-v2" style={{ width: `${progress}%` }} />
              </div>
            </article>
          );
        })}
      </section>

      <section className="dashboard-section-v2">
        <div className="dashboard-section-heading-v2" data-reveal>
          <p>Κύριες Ενότητες</p>
        </div>

        <div className="dashboard-grid-v2">
          {planCards.map((card) => {
            const disabled = card.locked && !isAuthenticated;
            const Icon = card.icon;

            const content = (
              <article
                className={`dashboard-card-v2 ${disabled ? 'locked' : ''} ${card.featured ? 'featured' : ''}`}
                data-reveal
                style={{ ['--reveal-delay' as string]: `${120 + planCards.indexOf(card) * 75}ms` }}
              >
                <span className="dashboard-badge-v2">{card.badge}</span>
                <div className="dashboard-card-icon-v2">
                  <Icon size={24} />
                </div>
                <h2>{card.title}</h2>
                <p>{card.text}</p>
                <div className="dashboard-card-action-v2">{disabled ? 'Μόνο με λογαριασμό' : `${card.action} ›`}</div>
              </article>
            );

            return disabled ? <div key={card.href}>{content}</div> : <Link key={card.href} to={card.href}>{content}</Link>;
          })}
        </div>
      </section>

      <section className="dashboard-section-v2">
        <div className="dashboard-section-heading-v2" data-reveal>
          <p>Βοηθητικά Εργαλεία</p>
        </div>

        <div className="dashboard-tools-grid-v2">
          {toolCards.map((tool) => {
            const Icon = tool.icon;
            const disabled = tool.locked && !isAuthenticated;
            const iconSize = tool.href === '/single-topics' ? 18 : 22;

            const content = (
              <article
                className={`dashboard-tool-card-v2 ${tool.href === '/single-topics' ? 'single-topics-tool-card-v2' : ''} ${tool.href === '/oefe' ? 'oefe-tool-card-v2' : ''} ${disabled ? 'locked' : ''}`}
                data-reveal
                style={{ ['--reveal-delay' as string]: `${100 + toolCards.indexOf(tool) * 65}ms` }}
              >
                <div className="dashboard-tool-icon-v2">
                  <Icon size={iconSize} />
                </div>
                <div className="dashboard-tool-copy-v2">
                  <h3>{tool.title}</h3>
                  <p>{tool.text}</p>
                  <div>{disabled ? 'Κλειδωμένο' : 'Είσοδος ›'}</div>
                </div>
              </article>
            );

            return disabled ? <div key={tool.href}>{content}</div> : <Link key={tool.href} to={tool.href}>{content}</Link>;
          })}
        </div>
      </section>

      <section className="dashboard-tip-v2" data-reveal style={{ ['--reveal-delay' as string]: '120ms' }}>
        <p>
          <strong>Συμβουλή:</strong> {dailyTip}
        </p>
      </section>
    </div>
  );
}
