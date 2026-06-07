import React, { useEffect, useMemo, useRef, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import {
  LuBot,
  LuBrain,
  LuFileText,
  LuMenu,
  LuMessageSquare,
  LuPaperclip,
  LuPlus,
  LuSend,
  LuSparkles,
  LuTrash2,
  LuUser,
  LuX,
} from 'react-icons/lu';
import { useAuth } from '../context/AuthContext.tsx';
import { DEFAULT_QUIZ_USER_ID } from '../context/QuizContext.tsx';
import {
  askSpecializedTeacherWithContext,
  streamSpecializedTeacherWithContext,
  type TeacherAttachmentContext,
  type TeacherChatHistoryItem,
  type TeacherMode,
} from '../services/specializedTeacher.ts';

type AttachedFile = {
  id: string;
  name: string;
  sizeLabel: string;
  mimeType: string;
  preview?: string;
  extractedText?: string;
  note?: string;
};

type ChatPart = {
  text?: string;
  file?: AttachedFile;
};

type ChatMessage = {
  id: string;
  role: 'user' | 'assistant';
  parts: ChatPart[];
  timestamp: number;
};

type ChatSession = {
  id: string;
  title: string;
  messages: ChatMessage[];
  updatedAt: number;
};

const STORAGE_KEY = 'panhel-cortex-ai-engine-sessions-v7';
const SESSION_STALE_MS = 4 * 60 * 60 * 1000;

const starterCards: Array<{ title: string; description: string; prompt: string; mode: TeacherMode }> = [
  {
    title: 'Υπολόγισε Ed & Es',
    description: 'Ασκήσεις ΑΟΘ',
    prompt:
      'Θέλω βοήθεια σε άσκηση ΑΟΘ με ελαστικότητα ζήτησης και προσφοράς. Καθοδήγησέ με βήμα βήμα χωρίς να μου δώσεις αμέσως την τελική απάντηση.',
    mode: 'exercise',
  },
  {
    title: 'Αλγόριθμος Ταξινόμησης',
    description: 'ΑΕΠΠ / Πληροφορική',
    prompt:
      'Εξήγησέ μου βήμα βήμα έναν αλγόριθμο ταξινόμησης στην ΑΕΠΠ, με λογική εκτέλεσης και μικρό trace table.',
    mode: 'methodology',
  },
  {
    title: 'Ολοκληρώματα & Όρια',
    description: 'Μαθηματικά',
    prompt:
      'Θέλω καθαρή εξήγηση για όρια και ολοκληρώματα στα Μαθηματικά Προσανατολισμού, με απλά βήματα και SOS λεπτομέρειες.',
    mode: 'explain',
  },
  {
    title: 'Ανάλυση Γραφήματος',
    description: 'Ανέβασε φωτογραφία',
    prompt:
      'Θέλω να αναλύσουμε ένα γράφημα ή μία φωτογραφία άσκησης. Πες μου τι στοιχεία χρειάζεσαι για να ξεκινήσουμε σωστά.',
    mode: 'normal',
  },
];

const modes: Array<{ mode: TeacherMode; label: string }> = [
  { mode: 'normal', label: 'Κανονικά' },
  { mode: 'explain', label: 'Πιο απλά' },
  { mode: 'methodology', label: 'Μεθοδολογία' },
  { mode: 'exercise', label: 'Άσκηση' },
];

function buildLocalTeacherFallback(question: string, mode: TeacherMode) {
  const normalized = question.toLowerCase();
  const isElasticity =
    normalized.includes('ελαστικ') ||
    normalized.includes('ed') ||
    normalized.includes('es') ||
    normalized.includes('ζήτησ') ||
    normalized.includes('προσφορ');

  if (isElasticity) {
    return [
      'Πάμε σωστά, σαν κανονικό μάθημα ΑΟΘ.',
      '',
      'Για να μη σου δώσω έτοιμη απάντηση, ξεκινάμε από το πρώτο βήμα:',
      '',
      '1. Εντόπισε αν η άσκηση μιλά για **ζήτηση** ή **προσφορά**.',
      '2. Αν είναι ζήτηση, ο βασικός τύπος είναι $E_D = \\frac{\\%\\Delta Q_D}{\\%\\Delta P}$.',
      '3. Αν είναι προσφορά, ο βασικός τύπος είναι $E_S = \\frac{\\%\\Delta Q_S}{\\%\\Delta P}$.',
      '4. Μετά κοιτάμε αν σου δίνει δύο σημεία, ποσοστιαίες μεταβολές ή πίνακα.',
      '',
      '**Ερώτηση για εσένα:** ποια δεδομένα σου δίνει η εκφώνηση; Τιμές και ποσότητες πριν/μετά ή έτοιμες ποσοστιαίες μεταβολές;',
      '',
      '**SOS Πανελληνίων:** στην ελαστικότητα ζήτησης το αποτέλεσμα βγαίνει συνήθως αρνητικό λόγω αντίστροφης σχέσης τιμής-ζητούμενης ποσότητας, αλλά πολλές φορές το σχολικό ζητά την απόλυτη τιμή.',
    ].join('\n');
  }

  if (mode === 'exercise') {
    return [
      'Το έχω. Θα το δουλέψουμε βήμα βήμα.',
      '',
      'Στείλε μου πρώτα την εκφώνηση ή τα δεδομένα της άσκησης και θα ξεκινήσουμε από:',
      '',
      '1. τι ζητάει η άσκηση,',
      '2. ποια δεδομένα έχουμε,',
      '3. ποιον τύπο ή ποια μεθοδολογία πρέπει να χρησιμοποιήσουμε,',
      '4. ποιο είναι το πρώτο ασφαλές βήμα λύσης.',
      '',
      '**SOS Πανελληνίων:** μην ξεκινάς πράξεις πριν γράψεις καθαρά τα δεδομένα και το ζητούμενο. Αυτό βοηθάει και στη βαθμολόγηση.',
    ].join('\n');
  }

  return [
    'Υπάρχει προσωρινό θέμα σύνδεσης με το AI, αλλά δεν σε αφήνω ξεκρέμαστο.',
    '',
    'Γράψε μου την απορία με όσο πιο συγκεκριμένο τρόπο μπορείς και θα τη σπάσουμε σε μικρά βήματα:',
    '',
    '- τι γνωρίζουμε,',
    '- τι ζητάει,',
    '- ποια θεωρία/τύπος μπαίνει,',
    '- ποιο είναι το πρώτο βήμα.',
    '',
    '**SOS Πανελληνίων:** όταν κολλάς, μην ψάχνεις κατευθείαν τελικό αποτέλεσμα. Ξεκίνα από τον ορισμό ή τον τύπο του κεφαλαίου.',
  ].join('\n');
}

function createId() {
  return typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function createSession(): ChatSession {
  return {
    id: createId(),
    title: 'Νέα Συνομιλία',
    messages: [],
    updatedAt: Date.now(),
  };
}

function loadSessions(): ChatSession[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveSessions(sessions: ChatSession[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions));
}

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function getMessageText(message: ChatMessage) {
  return message.parts
    .filter((part) => typeof part.text === 'string')
    .map((part) => part.text)
    .join('\n')
    .trim();
}

function getMessageFiles(message: ChatMessage) {
  return message.parts.filter((part) => part.file).map((part) => part.file as AttachedFile);
}

function fileToPreview(file: File) {
  return new Promise<string>((resolve) => {
    if (!file.type.startsWith('image/')) {
      resolve('');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => resolve(String(event.target?.result ?? ''));
    reader.onerror = () => resolve('');
    reader.readAsDataURL(file);
  });
}

function extractTextFromFile(file: File) {
  const lowerName = file.name.toLowerCase();
  const isTextLike =
    file.type.startsWith('text/') ||
    lowerName.endsWith('.txt') ||
    lowerName.endsWith('.md') ||
    lowerName.endsWith('.csv') ||
    lowerName.endsWith('.json') ||
    lowerName.endsWith('.js') ||
    lowerName.endsWith('.ts') ||
    lowerName.endsWith('.tsx') ||
    lowerName.endsWith('.html') ||
    lowerName.endsWith('.css');

  if (!isTextLike) return Promise.resolve('');
  return file.text().then((text) => text.slice(0, 12000));
}

export default function SpecializedTeacherPage() {
  const { currentUser } = useAuth();
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [currentResponse, setCurrentResponse] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [attachedFiles, setAttachedFiles] = useState<AttachedFile[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [activeMode, setActiveMode] = useState<TeacherMode>('normal');

  const activeSession = sessions.find((session) => session.id === activeSessionId) ?? sessions[0];
  const messages = useMemo(() => activeSession?.messages ?? [], [activeSession?.messages]);
  const hasMessages = messages.length > 0;

  useEffect(() => {
    const loaded = loadSessions().sort((a, b) => b.updatedAt - a.updatedAt);
    const now = Date.now();

    if (!loaded.length || now - loaded[0].updatedAt > SESSION_STALE_MS) {
      const fresh = createSession();
      setSessions(loaded.length ? [fresh, ...loaded] : [fresh]);
      setActiveSessionId(fresh.id);
      return;
    }

    setSessions(loaded);
    setActiveSessionId(loaded[0].id);
  }, []);

  useEffect(() => {
    if (sessions.length) saveSessions(sessions);
  }, [sessions]);

  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: 'smooth',
    });
  }, [messages, currentResponse, attachedFiles]);

  const updateActiveSession = (updater: (session: ChatSession) => ChatSession) => {
    setSessions((previous) =>
      previous.map((session) => (session.id === activeSessionId ? updater(session) : session)),
    );
  };

  const startNewChat = () => {
    const fresh = createSession();
    setSessions((previous) => [fresh, ...previous]);
    setActiveSessionId(fresh.id);
    setInput('');
    setAttachedFiles([]);
    setCurrentResponse('');
    setActiveMode('normal');
    setSidebarOpen(false);
  };

  const deleteSession = (id: string, event: React.MouseEvent) => {
    event.stopPropagation();

    setSessions((previous) => {
      const next = previous.filter((session) => session.id !== id);
      if (!next.length) {
        const fresh = createSession();
        setActiveSessionId(fresh.id);
        return [fresh];
      }

      if (id === activeSessionId) {
        setActiveSessionId(next[0].id);
      }

      return next;
    });
  };

  const processFiles = async (files: FileList | File[]) => {
    const parsed = await Promise.all(
      Array.from(files).map(async (file) => ({
        id: createId(),
        name: file.name,
        sizeLabel: formatBytes(file.size),
        mimeType: file.type || 'application/octet-stream',
        preview: await fileToPreview(file),
        extractedText: await extractTextFromFile(file),
        note: file.type.startsWith('image/')
          ? 'Ο μαθητής ανέβασε εικόνα. Αν δεν υπάρχει OCR, ζήτησε τα βασικά δεδομένα της άσκησης.'
          : undefined,
      })),
    );

    setAttachedFiles((previous) => [...previous, ...parsed]);
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      void processFiles(event.target.files);
    }

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const removeFile = (id: string) => {
    setAttachedFiles((previous) => previous.filter((file) => file.id !== id));
  };

  const appendAssistantMessage = (targetSessionId: string, text: string) => {
    setSessions((previous) =>
      previous.map((session) =>
        session.id === targetSessionId
          ? {
              ...session,
              messages: [
                ...session.messages,
                {
                  id: createId(),
                  role: 'assistant',
                  parts: [{ text }],
                  timestamp: Date.now(),
                },
              ],
              updatedAt: Date.now(),
            }
          : session,
      ),
    );
  };

  const sendMessage = async (textOverride?: string, modeOverride?: TeacherMode) => {
    const textToSend = (textOverride ?? input).trim();
    const mode = modeOverride ?? activeMode;

    if (isLoading || (!textToSend && attachedFiles.length === 0) || !activeSessionId) return;

    const filesForMessage = [...attachedFiles];
    const userMessage: ChatMessage = {
      id: createId(),
      role: 'user',
      parts: [
        ...(textToSend ? [{ text: textToSend }] : []),
        ...filesForMessage.map((file) => ({ file })),
      ],
      timestamp: Date.now(),
    };

    const targetSessionId = activeSessionId;
    const history: TeacherChatHistoryItem[] = messages.slice(-10).map((message) => ({
      role: message.role,
      text: getMessageText(message),
    }));
    const attachments: TeacherAttachmentContext[] = filesForMessage.map((file) => ({
      name: file.name,
      sizeLabel: file.sizeLabel,
      extractedText: file.extractedText,
      note: file.note,
    }));

    updateActiveSession((session) => ({
      ...session,
      title:
        session.messages.length === 0 && textToSend
          ? `${textToSend.slice(0, 32)}${textToSend.length > 32 ? '...' : ''}`
          : session.title,
      messages: [...session.messages, userMessage],
      updatedAt: Date.now(),
    }));

    setInput('');
    setAttachedFiles([]);
    setCurrentResponse('');
    setIsLoading(true);

    const userId = currentUser?.id || DEFAULT_QUIZ_USER_ID;
    const promptText =
      textToSend ||
      'Ανάλυσε το αρχείο που ανέβασα και καθοδήγησέ με βήμα βήμα.';
    let reply = '';

    try {
      try {
        await streamSpecializedTeacherWithContext(
          promptText,
          { userId, history, attachments, mode },
          {
            onDelta: (delta) => {
              reply += delta;
              setCurrentResponse((previous) => previous + delta);
            },
          },
        );
      } catch (streamError) {
        console.error('[Cortex AI] stream failed, falling back to JSON response:', streamError);
        const result = await askSpecializedTeacherWithContext(promptText, {
          userId,
          history,
          attachments,
          mode,
        });
        reply = result.reply?.trim() || '';
        setCurrentResponse(reply);
      }

      const finalReply =
        reply.trim() ||
        'Δεν πήρα καθαρή απάντηση από τον καθηγητή. Δοκίμασε να μου το στείλεις ξανά με λίγα περισσότερα στοιχεία.';
      appendAssistantMessage(targetSessionId, finalReply);
      setCurrentResponse('');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Άγνωστο σφάλμα';
      console.error('[Cortex AI] send failed:', errorMessage, error);
      appendAssistantMessage(targetSessionId, buildLocalTeacherFallback(promptText, mode));
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    void sendMessage();
  };

  const handleStarter = (prompt: string, mode: TeacherMode) => {
    setActiveMode(mode);
    void sendMessage(prompt, mode);
  };

  return (
    <div id="teacher-app" className="cortex-v2-shell">
      {sidebarOpen ? (
        <button className="cortex-v2-overlay" type="button" aria-label="Κλείσιμο μενού" onClick={() => setSidebarOpen(false)} />
      ) : null}

      <aside className={`cortex-v2-sidebar ${sidebarOpen ? 'is-open' : ''}`}>
        <div className="cortex-v2-sidebar-inner">
          <button type="button" className="cortex-v2-new-chat" onClick={startNewChat}>
            <LuPlus size={18} />
            <span>Νέα Συνομιλία</span>
          </button>

          <div className="cortex-v2-session-list">
            <p>Ιστορικό</p>
            {sessions.map((session) => (
              <button
                key={session.id}
                type="button"
                className={`cortex-v2-session-item ${session.id === activeSessionId ? 'is-active' : ''}`}
                onClick={() => {
                  setActiveSessionId(session.id);
                  setSidebarOpen(false);
                }}
              >
                <LuMessageSquare size={16} />
                <span>{session.title}</span>
                <span
                  role="button"
                  tabIndex={0}
                  className="cortex-v2-delete-session"
                  onClick={(event) => deleteSession(session.id, event)}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter' || event.key === ' ') {
                      deleteSession(session.id, event as unknown as React.MouseEvent);
                    }
                  }}
                  aria-label="Διαγραφή συνομιλίας"
                >
                  <LuTrash2 size={14} />
                </span>
              </button>
            ))}
          </div>

          <div className="cortex-v2-mentor-card">
            <div>
              <LuBrain size={18} />
            </div>
            <span>
              <strong>Οικονομική Κατεύθυνση</strong>
              <small>Premium AI Mentor</small>
            </span>
          </div>
        </div>
      </aside>

      <section className="cortex-v2-main">
        <header className="cortex-v2-header">
          <div className="cortex-v2-title-wrap">
            <button type="button" className="cortex-v2-menu-button" onClick={() => setSidebarOpen(true)}>
              <LuMenu size={22} />
            </button>
            <div className="cortex-v2-header-icon">
              <LuBrain size={20} />
            </div>
            <div>
              <h1>{activeSession?.title || 'Νέα Συνομιλία'}</h1>
              <p>ΑΟΘ • ΑΕΠΠ • ΜΑΘΗΜΑΤΙΚΑ</p>
            </div>
          </div>

          <div className="cortex-v2-live-wrap">
            <span className="cortex-v2-live-pill">
              <i />
              LIVE
            </span>
            <strong>GEMINI 2.5 FLASH</strong>
          </div>
        </header>

        <main
          ref={scrollRef}
          className={`cortex-v2-chat ${isDragging ? 'is-dragging' : ''}`}
          onDragOver={(event) => {
            event.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={(event) => {
            event.preventDefault();
            setIsDragging(false);
          }}
          onDrop={(event) => {
            event.preventDefault();
            setIsDragging(false);
            if (event.dataTransfer.files) void processFiles(event.dataTransfer.files);
          }}
        >
          {isDragging ? (
            <div className="cortex-v2-drop-zone">
              <LuPaperclip size={42} />
              <strong>Άφησε τα αρχεία εδώ</strong>
            </div>
          ) : null}

          <div className={`cortex-v2-chat-inner ${hasMessages ? '' : 'is-empty'}`}>
            {!hasMessages ? (
              <section className="cortex-v2-empty">
                <div className="cortex-v2-empty-orb">
                  <LuSparkles size={58} />
                </div>
                <h2>
                  Καλώς ήρθες στην
                  <br />
                  <span>Οικονομική Κατεύθυνση</span>
                </h2>
                <p>
                  Είμαι ο προσωπικός σου μέντορας για το 4ο Πεδίο. Ρώτα για ΑΟΘ, ΑΕΠΠ ή Μαθηματικά και θα σε
                  καθοδηγήσω καθαρά, βήμα βήμα.
                </p>

                <div className="cortex-v2-starters">
                  {starterCards.map((card) => (
                    <button key={card.title} type="button" onClick={() => handleStarter(card.prompt, card.mode)}>
                      <strong>{card.title}</strong>
                      <small>{card.description}</small>
                    </button>
                  ))}
                </div>
              </section>
            ) : null}

            {messages.map((message) => {
              const text = getMessageText(message);
              const files = getMessageFiles(message);

              return (
                <article key={message.id} className={`cortex-v2-message cortex-v2-message--${message.role}`}>
                  <div className="cortex-v2-message-stack">
                    <div className={`cortex-v2-avatar cortex-v2-avatar--${message.role}`}>
                      {message.role === 'user' ? <LuUser size={18} /> : <LuBot size={18} />}
                    </div>
                    <div className="cortex-v2-message-content">
                      {files.length ? (
                        <div className="cortex-v2-file-grid">
                          {files.map((file) =>
                            file.preview ? (
                              <img key={file.id} src={file.preview} alt={file.name} />
                            ) : (
                              <span key={file.id} className="cortex-v2-file-tile">
                                <LuFileText size={16} />
                                {file.name}
                              </span>
                            ),
                          )}
                        </div>
                      ) : null}
                      {text ? (
                        <div className="cortex-v2-bubble">
                          {message.role === 'assistant' ? <ReactMarkdown>{text}</ReactMarkdown> : <p>{text}</p>}
                        </div>
                      ) : null}
                    </div>
                  </div>
                </article>
              );
            })}

            {(isLoading || currentResponse) && (
              <article className="cortex-v2-message cortex-v2-message--assistant">
                <div className="cortex-v2-message-stack">
                  <div className="cortex-v2-avatar cortex-v2-avatar--assistant">
                    <LuBot size={18} />
                  </div>
                  <div className="cortex-v2-bubble">
                    {currentResponse ? (
                      <ReactMarkdown>{currentResponse}</ReactMarkdown>
                    ) : (
                      <div className="cortex-v2-thinking">
                        <span />
                        <span />
                        <span />
                        <strong>Σκέφτομαι...</strong>
                      </div>
                    )}
                  </div>
                </div>
              </article>
            )}
          </div>
        </main>

        <footer className="cortex-v2-composer">
          <div className="cortex-v2-composer-inner">
            {attachedFiles.length ? (
              <div className="cortex-v2-attachment-row">
                {attachedFiles.map((file) => (
                  <div key={file.id} className="cortex-v2-attachment">
                    {file.preview ? <img src={file.preview} alt={file.name} /> : <span><LuFileText size={16} /></span>}
                    <button type="button" onClick={() => removeFile(file.id)} aria-label="Αφαίρεση αρχείου">
                      <LuX size={14} />
                    </button>
                    <small>{file.name}</small>
                  </div>
                ))}
              </div>
            ) : null}

            <div className="cortex-v2-mode-row">
              {modes.map((item) => (
                <button
                  key={item.mode}
                  type="button"
                  className={activeMode === item.mode ? 'is-active' : ''}
                  onClick={() => setActiveMode(item.mode)}
                >
                  {item.label}
                </button>
              ))}
            </div>

            <form className="cortex-v2-form" onSubmit={handleSubmit}>
              <button type="button" onClick={() => fileInputRef.current?.click()} aria-label="Ανέβασμα αρχείου">
                <LuPaperclip size={20} />
              </button>
              <input
                ref={fileInputRef}
                type="file"
                className="sr-only"
                multiple
                accept="image/*,application/pdf,text/*,.txt,.md,.csv,.json,.js,.ts,.tsx,.html,.css"
                onChange={handleFileUpload}
              />
              <textarea
                value={input}
                rows={1}
                disabled={isLoading}
                placeholder="Πληκτρολόγησε ερώτηση ή ανέβασε αρχείο..."
                onChange={(event) => setInput(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' && !event.shiftKey) {
                    event.preventDefault();
                    void sendMessage();
                  }
                }}
              />
              <button type="submit" disabled={isLoading || (!input.trim() && attachedFiles.length === 0)} aria-label="Αποστολή">
                <LuSend size={20} />
              </button>
            </form>
            <p className="cortex-v2-powered">Powered by Gemini 2.5 Flash • Specialized AI Teacher</p>
          </div>
        </footer>
      </section>
    </div>
  );
}
