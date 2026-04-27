import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { LuBot, LuChevronRight, LuFileText, LuGraduationCap, LuSparkles, LuX } from 'react-icons/lu';

type FeatureCard = {
  icon: React.ComponentType<{ size?: number }>;
  title: string;
  text: string;
  modalText: string;
  href: string;
  tone: 'blue' | 'green' | 'yellow' | 'violet';
  art: 'teacher' | 'quiz' | 'sos' | 'generator';
};

const experienceCards: FeatureCard[] = [
  {
    icon: LuBot,
    title: 'AI Καθηγητής+',
    text: 'Ρώτα απορίες σε Μαθηματικά, ΑΟΘ ή ΑΕΠΠ και πάρε απάντηση σαν να μιλάς με καθηγητή δίπλα σου.',
    modalText:
      'Κολλάς σε άσκηση, θεωρία ή απορία της στιγμής; Ρώτα άμεσα και πάρε ξεκάθαρη εξήγηση βήμα βήμα, προσαρμοσμένη στο επίπεδό σου. Σαν να έχεις έναν καθηγητή δίπλα σου κάθε στιγμή, έτοιμο να σε βοηθήσει όταν τον χρειάζεσαι.',
    href: '/specialized-teacher',
    tone: 'blue',
    art: 'teacher',
  },
  {
    icon: LuGraduationCap,
    title: 'Quiz Θεωρίας',
    text: 'Επανάληψη ανά κεφάλαιο με σωστή ροή ερωτήσεων, score και καθαρό feedback μέχρι να κλείσουν τα κενά σου.',
    modalText:
      'Κάνε οργανωμένη επανάληψη ανά κεφάλαιο με σωστή ροή ερωτήσεων και άμεσο feedback. Δες το score σου, εντόπισε τα κενά σου και βελτιώσου σταδιακά μέχρι να ολοκληρώσεις όλο το quiz με σιγουριά.',
    href: '/theory-quiz',
    tone: 'green',
    art: 'quiz',
  },
  {
    icon: LuSparkles,
    title: 'SOS Θέματα',
    text: 'Τα πιο χρήσιμα μοτίβα των Πανελληνίων συγκεντρωμένα για στοχευμένη επανάληψη χωρίς χάσιμο χρόνου.',
    modalText:
      'Τα πιο σημαντικά και συχνά μοτίβα των Πανελληνίων συγκεντρωμένα σε ένα σημείο, ώστε να κάνεις στοχευμένη επανάληψη χωρίς χάσιμο χρόνου. Ιδανικό για τις τελευταίες ημέρες πριν τις εξετάσεις, όταν κάθε λεπτό μετράει.',
    href: '/panic-mode',
    tone: 'yellow',
    art: 'sos',
  },
  {
    icon: LuFileText,
    title: 'Custom Generator',
    text: 'Διάλεξε μάθημα, κεφάλαια και δυσκολία και ετοίμασε δικό σου διαγώνισμα σε μορφή PDF.',
    modalText:
      'Δημιούργησε το δικό σου διαγώνισμα σε λίγα δευτερόλεπτα. Επίλεξε μάθημα, κεφάλαια και επίπεδο δυσκολίας και πάρε έτοιμο PDF για σοβαρή εξάσκηση, ακριβώς πάνω στα σημεία που θέλεις να δουλέψεις περισσότερο.',
    href: '/generator',
    tone: 'violet',
    art: 'generator',
  },
];

const subjectCards = [
  {
    title: 'ΑΟΘ',
    subtitle: 'Ζήτηση, προσφορά, κόστος, ΑΕΠ, πληθωρισμός και δημόσια οικονομικά σε καθαρή, εξεταστική ροή.',
    tags: ['Θεωρία', 'Ασκήσεις', 'Πανελλήνιες'],
  },
  {
    title: 'ΑΕΠΠ',
    subtitle: 'Αλγόριθμοι, ΓΛΩΣΣΑ, πίνακες, υποπρογράμματα και εκσφαλμάτωση με λογική Πανελληνίων.',
    tags: ['ΓΛΩΣΣΑ', 'Πίνακες', 'Θέματα Γ-Δ'],
  },
  {
    title: 'Μαθηματικά',
    subtitle: 'Συναρτήσεις, όρια, παράγωγοι, ολοκληρώματα και μελέτη συνάρτησης με σωστή μεθοδολογία.',
    tags: ['Όρια', 'Παράγωγοι', 'Ολοκληρώματα'],
  },
];

const focusBullets = [
  'AI καθηγητής που μιλά φροντιστηριακά και εξηγεί σαν πραγματικός άνθρωπος, όχι σαν generic chatbot.',
  'Διαγωνίσματα ανά κεφάλαιο, παλιά θέματα, ΟΕΦΕ και μεμονωμένα θέματα σε οργανωμένη δομή.',
  'Quiz θεωρίας με σωστό session flow, feedback σε κάθε βήμα και score στο τέλος.',
  'Custom διαγωνίσματα σε PDF με βάση μάθημα, κεφάλαια και δυσκολία για στοχευμένη εξάσκηση.',
];

const heroMetrics = [
  { label: 'AI Sessions', value: '24/7' },
  { label: 'Study Flow', value: 'Smart' },
  { label: 'Mock Tests', value: 'PDF' },
];

export default function LandingPage() {
  const [activeCard, setActiveCard] = useState<FeatureCard | null>(null);

  const activeToneClass = useMemo(() => {
    if (!activeCard) return '';
    return `landing-feature-modal-v2--${activeCard.tone}`;
  }, [activeCard]);

  const modalBackdropStyle = useMemo(
    () =>
      ({
        '--modal-art': activeCard ? `url(${process.env.PUBLIC_URL}/modal-art/${activeCard.art}.png)` : 'none',
      }) as React.CSSProperties,
    [activeCard],
  );

  return (
    <div className="landing-page-v2">
      <header className="landing-topbar-v2">
        <div className="landing-topbar-inner">
          <Link className="landing-brand-v2" to="/">
            <span className="landing-brand-mark">Ψ</span>
            <span>ΨηφιακοΦροντιστήριο+</span>
          </Link>

          <nav className="landing-nav-v2" aria-label="Κύρια πλοήγηση">
            <a href="#experience">Τι περιλαμβάνει</a>
            <a href="#teacher">AI Καθηγητής</a>
            <a href="#subjects">Μαθήματα</a>
            <a href="#start">Πώς ξεκινάς</a>
          </nav>

          <div className="landing-actions-v2">
            <Link className="landing-ghost-btn-v2" to="/login">
              Σύνδεση
            </Link>
            <Link className="landing-primary-btn-v2" to="/register">
              Εγγραφή Μαθητή
            </Link>
          </div>
        </div>
      </header>

      <main>
        <section className="landing-hero-v2" id="experience">
          <div className="landing-hero-shell-v2">
            <div className="landing-hero-copy-v2" data-reveal style={{ ['--reveal-delay' as string]: '40ms' }}>
              <p className="landing-kicker-v2">ΨΗΦΙΑΚΟ ΦΡΟΝΤΙΣΤΗΡΙΟ ΠΑΝΕΛΛΗΝΙΩΝ</p>
              <h1>
                Ολοκληρωμένη
                <br />
                Εμπειρία
              </h1>
              <p className="landing-lead-v2">
                Ό,τι χρειάζεσαι για ΑΟΘ, ΑΕΠΠ και Μαθηματικά σε ένα μέρος: θεωρία, quiz, διαγωνίσματα, παλιά θέματα
                και καθηγητής AI.
              </p>

              <div className="landing-hero-actions-v2">
                <Link className="landing-dark-btn-v2" to="/app">
                  Μπες στην πλατφόρμα
                  <LuChevronRight size={18} />
                </Link>
                <a className="landing-light-btn-v2" href="#start">
                  Δες πώς λειτουργεί
                </a>
              </div>

              <div className="landing-hero-metrics-v2">
                {heroMetrics.map((metric) => (
                  <article
                    key={metric.label}
                    className="landing-hero-metric-v2"
                    data-reveal
                    style={{ ['--reveal-delay' as string]: `${120 + heroMetrics.indexOf(metric) * 70}ms` }}
                  >
                    <strong>{metric.value}</strong>
                    <span>{metric.label}</span>
                  </article>
                ))}
              </div>
            </div>
          </div>

          <div className="landing-cards-grid-v2">
            {experienceCards.map((card) => {
              const Icon = card.icon;

              return (
                <button
                  key={card.title}
                  className={`landing-feature-card-v2 ${card.tone} ${card.title === 'AI Καθηγητής+' ? 'hero-card' : ''}`}
                  type="button"
                  onClick={() => setActiveCard(card)}
                  data-reveal
                  style={{ ['--reveal-delay' as string]: `${170 + experienceCards.indexOf(card) * 90}ms` }}
                >
                  <div className="landing-feature-icon-v2">
                    <Icon size={24} />
                  </div>
                  <h2>{card.title}</h2>
                  <p>{card.text}</p>
                  <strong>Περισσότερα →</strong>
                </button>
              );
            })}
          </div>
        </section>

        <section className="landing-dark-section-v2" id="teacher">
          <div>
            <div className="landing-dark-copy-v2" data-reveal>
              <p className="landing-kicker-v2 light">AI ΚΑΘΗΓΗΤΗΣ+</p>
              <h2>Γιατί δεν είναι απλά ένα chat...</h2>
              <p>
                Ο καθηγητής είναι φτιαγμένος γύρω από τα τρία μαθήματα της πλατφόρμας. Δεν πετάει γενικές απαντήσεις:
                εξηγεί, καθοδηγεί, δίνει βήματα και προσαρμόζει το ύφος του στην απορία του μαθητή.
              </p>

              <div className="landing-bullet-list-v2">
                {focusBullets.map((item) => (
                  <div key={item}>
                    <span>✓</span>
                    <p>{item}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="landing-chat-card-v2" data-reveal style={{ ['--reveal-delay' as string]: '100ms' }}>
              <div className="landing-chat-head-v2">
                <div>
                  <span>AI Καθηγητής+</span>
                  <strong>Εξειδικευμένος για Πανελλήνιες</strong>
                </div>
                <small>&lt; 2 sec</small>
              </div>

              <div className="landing-chat-message-v2 student">
                Δεν καταλαβαίνω τι σημαίνει όριο στο x₀. Μπορείς να μου το πεις απλά;
              </div>

              <div className="landing-chat-message-v2 teacher">
                Βεβαίως. Σκέψου ότι δεν μας νοιάζει τι γίνεται ακριβώς στο x₀, αλλά τι τιμές πλησιάζει η συνάρτηση
                όταν το x πλησιάζει το x₀ από αριστερά και δεξιά.
              </div>

              <span className="landing-chat-link-v2">Ρώτα τον καθηγητή →</span>
            </div>
          </div>
        </section>

        <section className="landing-subjects-v2" id="subjects">
          <p className="landing-kicker-v2" data-reveal>ΤΑ ΜΑΘΗΜΑΤΑ</p>
          <h2 data-reveal style={{ ['--reveal-delay' as string]: '40ms' }}>Τρία μαθήματα, ένα σύστημα.</h2>
          <p className="landing-section-lead-v2" data-reveal style={{ ['--reveal-delay' as string]: '90ms' }}>
            Κρατάμε όσα έχουμε ήδη χτίσει στην εφαρμογή και τα παρουσιάζουμε πιο καθαρά, ώστε ο μαθητής να μπαίνει
            κατευθείαν στη σωστή ενότητα.
          </p>

          <div className="landing-subject-grid-v2">
            {subjectCards.map((subject, index) => (
              <article
                key={subject.title}
                className="landing-subject-card-v2"
                data-reveal
                style={{ ['--reveal-delay' as string]: `${120 + index * 90}ms` }}
              >
                <span className="landing-subject-index-v2">{index + 1}</span>
                <h3>{subject.title}</h3>
                <p>{subject.subtitle}</p>
                <div className="landing-tag-row-v2">
                  {subject.tags.map((tag) => (
                    <small key={tag}>{tag}</small>
                  ))}
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="landing-steps-v2" id="start">
          <p className="landing-kicker-v2" data-reveal>ΠΩΣ ΞΕΚΙΝΑΣ</p>
          <h2 data-reveal style={{ ['--reveal-delay' as string]: '40ms' }}>Μπαίνεις, διαλέγεις ενότητα, συνεχίζεις.</h2>

          <div className="landing-steps-grid-v2">
            {[
              ['1', 'Διάβασε', 'Άνοιξε το διαδραστικό εγχειρίδιο και βρες την ύλη ανά κεφάλαιο.'],
              ['2', 'Λύσε', 'Πήγαινε σε διαγωνίσματα, quiz ή μεμονωμένα θέματα.'],
              ['3', 'Ρώτα', 'Στείλε την απορία σου στον AI καθηγητή όταν κολλήσεις.'],
              ['4', 'Συνέχισε', 'Χτίσε ρυθμό με SOS, custom tests και παλιά θέματα.'],
            ].map(([number, title, text]) => (
              <article
                key={number}
                className="landing-step-card-v2"
                data-reveal
                style={{ ['--reveal-delay' as string]: `${110 + Number(number) * 70}ms` }}
              >
                <span className="landing-step-index-v2">{number}</span>
                <h3>{title}</h3>
                <p>{text}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="landing-final-cta-v2" data-reveal>
          <div>
            <p className="landing-kicker-v2 light" data-reveal>ΕΤΟΙΜΟΣ;</p>
            <h2 data-reveal style={{ ['--reveal-delay' as string]: '40ms' }}>Μπες στην πλατφόρμα και συνέχισε από εκεί που σταμάτησες.</h2>
          </div>

          <div className="landing-final-actions-v2" data-reveal style={{ ['--reveal-delay' as string]: '90ms' }}>
            <Link className="landing-final-main-v2" to="/app">
              Μπες στην πλατφόρμα →
            </Link>
            <Link className="landing-final-secondary-v2" to="/register">
              Δημιουργία λογαριασμού
            </Link>
          </div>
        </section>
      </main>

      <footer className="landing-footer-v2">
        <div className="landing-footer-inner-v2">
          <div className="landing-footer-brand-v2">
            <strong>ΨηφιακοΦροντιστήριο+</strong>
            <span>Με αγάπη για τους μαθητές του 4ου πεδίου.</span>
          </div>

          <div className="landing-footer-columns-v2">
            <div className="landing-footer-column-v2">
              <small>Πλατφόρμα</small>
              <Link to="/app">Dashboard</Link>
              <Link to="/specialized-teacher">AI Καθηγητής</Link>
              <Link to="/generator">Generator</Link>
            </div>

            <div className="landing-footer-column-v2">
              <small>Μαθήματα</small>
              <Link to="/textbook">Μαθηματικά</Link>
              <Link to="/textbook">ΑΟΘ</Link>
              <Link to="/textbook">ΑΕΠΠ</Link>
            </div>

            <div className="landing-footer-column-v2">
              <small>Νομικά</small>
              <Link to="/terms">Όροι Χρήσης</Link>
              <Link to="/privacy">Πολιτική Προστασίας</Link>
              <Link to="/register">Εγγραφή</Link>
            </div>
          </div>
        </div>
        <div className="landing-footer-bottom-v2">© 2026 Ψηφιακό Φροντιστήριο+</div>
      </footer>

      {activeCard && (
        <div
          className="landing-feature-modal-backdrop-v2"
          style={modalBackdropStyle}
          onClick={() => setActiveCard(null)}
          role="presentation"
        >
          <div
            className={`landing-feature-modal-v2 ${activeToneClass}`}
            style={modalBackdropStyle}
            onClick={(event) => event.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="landing-feature-modal-title"
          >
            <button
              type="button"
              className="landing-feature-modal-close-v2"
              onClick={() => setActiveCard(null)}
              aria-label="Κλείσιμο"
            >
              <LuX size={20} />
            </button>

            <div className="landing-feature-modal-icon-v2">
              <activeCard.icon size={28} />
            </div>

            <h3 id="landing-feature-modal-title">{activeCard.title}</h3>
            <p>{activeCard.modalText}</p>

            <div className="landing-feature-modal-actions-v2">
              <button type="button" className="landing-feature-modal-secondary-v2" onClick={() => setActiveCard(null)}>
                Κλείσιμο
              </button>
              <Link className="landing-feature-modal-primary-v2" to={activeCard.href} onClick={() => setActiveCard(null)}>
                Μετάβαση στην ενότητα
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
