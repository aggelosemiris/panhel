import React, { useEffect, useMemo, useRef, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import {
  LuBookMarked,
  LuBot,
  LuBrain,
  LuCheckCheck,
  LuCpu,
  LuDownload,
  LuFileUp,
  LuPin,
  LuSend,
  LuSparkles,
  LuTerminal,
  LuTrash2,
  LuUser,
} from 'react-icons/lu';
import {
  askSpecializedTeacherWithContext,
  type TeacherAttachmentContext,
  type TeacherChatHistoryItem,
  type TeacherDetectedState,
  type TeacherMode,
  type TeacherReplyMeta,
} from '../services/specializedTeacher.ts';
import { DEFAULT_QUIZ_USER_ID } from '../context/QuizContext.tsx';
import { useAuth } from '../context/AuthContext.tsx';
import { SUBJECTS, getSubjectById } from '../config/curricula.ts';

type ChatMessage = {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  timestamp: string;
  status?: 'sent' | 'read';
  meta?: TeacherReplyMeta;
};

type SavedPoint = {
  id: string;
  text: string;
  timestamp: string;
  preview: string;
};

type AttachedFile = {
  id: string;
  name: string;
  size: number;
  sizeLabel: string;
  type: string;
  extractedText: string;
  note?: string;
};

const CHAT_HISTORY_PREFIX = 'panhel-cortex-chat-v5';
const SAVED_POINTS_PREFIX = 'panhel-cortex-saved-v5';

const quickPrompts: Array<{ label: string; mode: TeacherMode; prompt: string }> = [
  {
    label: 'Εξήγησέ μου απλά',
    mode: 'explain',
    prompt: 'Εξήγησέ μου απλά μια δύσκολη έννοια με καθαρά βήματα, bullet points και ένα μικρό παράδειγμα.',
  },
  {
    label: 'Άσκηση τύπου Πανελληνίων',
    mode: 'exercise',
    prompt: 'Φτιάξε μου μία άσκηση τύπου Πανελληνίων και καθοδήγησέ με βήμα-βήμα χωρίς να μου δώσεις αμέσως όλη τη λύση.',
  },
  {
    label: 'Μεθοδολογία σκέψης',
    mode: 'methodology',
    prompt: 'Δείξε μου τη σωστή μεθοδολογία σκέψης και τα συχνά λάθη.',
  },
  {
    label: 'SOS λεπτομέρεια',
    mode: 'normal',
    prompt: 'Πες μου μια SOS λεπτομέρεια ή παγίδα που πέφτει συχνά στις Πανελλήνιες πάνω σε αυτό το θέμα.',
  },
];

function formatTime() {
  return new Date().toLocaleTimeString('el-GR', { hour: '2-digit', minute: '2-digit' });
}

function createId(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function formatBytes(bytes: number) {
  if (bytes < 1024) {
    return `${bytes} B`;
  }

  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`;
  }

  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function safeReadJson<T>(key: string, fallback: T): T {
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function getStateLabel(state?: TeacherDetectedState) {
  switch (state) {
    case 'panic':
      return 'Calm support mode';
    case 'exercise':
      return 'Exercise mode';
    case 'methodology':
      return 'Methodology mode';
    case 'explain':
      return 'Explain mode';
    default:
      return 'Reasoning mode';
  }
}

function buildWelcomeMessage(username?: string): ChatMessage {
  return {
    id: 'assistant-welcome',
    role: 'assistant',
    timestamp: formatTime(),
    status: 'read',
    text: `**Ψηφιακός Καθηγητής Πανελληνίων ενεργός.**

Γεια σου${username ? `, ${username}` : ''}. Είμαι ο **Ψηφιακός Καθηγητής Πανελληνίων** του Ψηφιακού Φροντιστηρίου+.

Μπορούμε να δουλέψουμε:
- **Μαθηματικά, ΑΟΘ και ΑΕΠΠ** με ύφος Πανελληνίων
- **θεωρία, μεθοδολογία, ασκήσεις και λύσεις**
- **αρχεία, σημειώσεις, απορίες και κώδικα**
- με στόχο όχι απλώς την απάντηση, αλλά την **κατανόηση και την προετοιμασία για το 20**

Διάλεξε μάθημα αν θέλεις πιο στοχευμένη καθοδήγηση ή απλώς γράψε ό,τι σε απασχολεί.`,
    meta: {
      detectedState: 'normal',
      subjectFocus: null,
      suggestions: [
        {
          id: 'welcome-explain',
          label: 'Εξήγησέ μου μια έννοια',
          prompt: 'Εξήγησέ μου μια δύσκολη έννοια απλά και καθαρά.',
          mode: 'explain',
        },
        {
          id: 'welcome-exercise',
          label: 'Δώσε μου άσκηση',
          prompt: 'Φτιάξε μου μία άσκηση τύπου Πανελληνίων.',
          mode: 'exercise',
        },
        {
          id: 'welcome-method',
          label: 'Δώσε μεθοδολογία',
          prompt: 'Δείξε μου τη σωστή μεθοδολογία για να σκέφτομαι σωστά σε τέτοια θέματα.',
          mode: 'methodology',
        },
      ],
    },
  };
}

async function extractTextFromFile(file: File) {
  const lowerName = file.name.toLowerCase();
  const isTextLike =
    file.type.startsWith('text/') ||
    lowerName.endsWith('.txt') ||
    lowerName.endsWith('.md') ||
    lowerName.endsWith('.json') ||
    lowerName.endsWith('.csv') ||
    lowerName.endsWith('.js') ||
    lowerName.endsWith('.ts') ||
    lowerName.endsWith('.tsx') ||
    lowerName.endsWith('.jsx') ||
    lowerName.endsWith('.html') ||
    lowerName.endsWith('.css') ||
    lowerName.endsWith('.py');

  if (isTextLike) {
    const text = await file.text();
    return {
      extractedText: text.slice(0, 14000),
      note: text.length > 14000 ? 'Το αρχείο ήταν μεγάλο, οπότε στάλθηκε μόνο το πρώτο μέρος.' : undefined,
    };
  }

  return {
    extractedText: '',
    note: 'Το αρχείο επισυνάφθηκε, αλλά ο browser μπορεί να διαβάσει αυτόματα κυρίως αρχεία κειμένου.',
  };
}

export default function SpecializedTeacherPage() {
  const { currentUser } = useAuth();
  const userId = currentUser?.id ?? DEFAULT_QUIZ_USER_ID;
  const chatStorageKey = `${CHAT_HISTORY_PREFIX}-${userId}`;
  const savedStorageKey = `${SAVED_POINTS_PREFIX}-${userId}`;
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const scrollRef = useRef<HTMLDivElement | null>(null);

  const [messages, setMessages] = useState<ChatMessage[]>(() =>
    safeReadJson<ChatMessage[]>(chatStorageKey, [buildWelcomeMessage(currentUser?.username)]),
  );
  const [savedPoints, setSavedPoints] = useState<SavedPoint[]>(() => safeReadJson<SavedPoint[]>(savedStorageKey, []));
  const [input, setInput] = useState('');
  const [attachedFiles, setAttachedFiles] = useState<AttachedFile[]>([]);
  const [activePanel, setActivePanel] = useState<'tools' | 'saved'>('tools');
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedSubjectId, setSelectedSubjectId] = useState<string | null>(null);
  const [activeMode, setActiveMode] = useState<TeacherMode>('normal');

  useEffect(() => {
    setMessages(safeReadJson<ChatMessage[]>(chatStorageKey, [buildWelcomeMessage(currentUser?.username)]));
    setSavedPoints(safeReadJson<SavedPoint[]>(savedStorageKey, []));
  }, [chatStorageKey, currentUser?.username, savedStorageKey]);

  useEffect(() => {
    window.localStorage.setItem(chatStorageKey, JSON.stringify(messages));
  }, [chatStorageKey, messages]);

  useEffect(() => {
    window.localStorage.setItem(savedStorageKey, JSON.stringify(savedPoints));
  }, [savedPoints, savedStorageKey]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, isSending]);

  const selectedSubject = useMemo(
    () => (selectedSubjectId ? getSubjectById(selectedSubjectId) ?? null : null),
    [selectedSubjectId],
  );

  const canSend = useMemo(
    () => (input.trim().length > 0 || attachedFiles.length > 0) && !isSending,
    [attachedFiles.length, input, isSending],
  );

  const historyForAi = useMemo<TeacherChatHistoryItem[]>(
    () =>
      messages
        .filter((message) => message.id !== 'assistant-welcome')
        .slice(-10)
        .map((message) => ({
          role: message.role,
          text: message.text.slice(0, 2200),
        })),
    [messages],
  );

  const attachmentContext = useMemo<TeacherAttachmentContext[]>(
    () =>
      attachedFiles.map((file) => ({
        name: file.name,
        sizeLabel: file.sizeLabel,
        extractedText: file.extractedText,
        note: file.note,
      })),
    [attachedFiles],
  );

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? []);

    if (files.length === 0) {
      return;
    }

    const processedFiles = await Promise.all(
      files.map(async (file) => {
        const extracted = await extractTextFromFile(file);

        return {
          id: createId('file'),
          name: file.name,
          size: file.size,
          sizeLabel: formatBytes(file.size),
          type: file.type,
          extractedText: extracted.extractedText,
          note: extracted.note,
        } satisfies AttachedFile;
      }),
    );

    setAttachedFiles((current) => [...current, ...processedFiles]);
    event.target.value = '';
  };

  const removeAttachedFile = (id: string) => {
    setAttachedFiles((current) => current.filter((file) => file.id !== id));
  };

  const savePoint = (message: ChatMessage) => {
    setSavedPoints((current) => {
      if (current.some((point) => point.id === message.id)) {
        return current;
      }

      return [
        {
          id: message.id,
          text: message.text,
          timestamp: message.timestamp,
          preview: message.text.replace(/\s+/g, ' ').slice(0, 120),
        },
        ...current,
      ];
    });
    setActivePanel('saved');
  };

  const deleteSavedPoint = (id: string) => {
    setSavedPoints((current) => current.filter((point) => point.id !== id));
  };

  const clearChat = () => {
    setMessages([buildWelcomeMessage(currentUser?.username)]);
    setAttachedFiles([]);
    setError(null);
  };

  const downloadChat = () => {
    const content = messages
      .map((message) => `[${message.timestamp}] ${message.role === 'assistant' ? 'Cortex AI' : 'Χρήστης'}:\n${message.text}`)
      .join('\n\n---\n\n');
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `cortex-ai-chat-${new Date().toISOString().slice(0, 10)}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleSend = async (overrideInput?: string, mode: TeacherMode = activeMode) => {
    const trimmedInput = (overrideInput ?? input).trim();

    if ((!trimmedInput && attachedFiles.length === 0) || isSending) {
      return;
    }

    const finalMode = mode ?? activeMode;
    setActiveMode(finalMode);

    const userMessage: ChatMessage = {
      id: createId('user'),
      role: 'user',
      text: [
        trimmedInput || 'Σου έστειλα αρχεία για να τα δεις.',
        attachedFiles.length > 0 ? `Αρχεία: ${attachedFiles.map((file) => `${file.name} (${file.sizeLabel})`).join(', ')}` : '',
      ]
        .filter(Boolean)
        .join('\n'),
      timestamp: formatTime(),
      status: 'sent',
    };

    setMessages((current) => [...current, userMessage]);
    setInput('');
    setError(null);
    setIsSending(true);

    try {
      const response = await askSpecializedTeacherWithContext(trimmedInput || 'Δες τα συνημμένα και βοήθησέ με.', {
        userId,
        history: historyForAi,
        attachments: attachmentContext,
        mode: finalMode,
        subject: selectedSubject
          ? {
              id: selectedSubject.id,
              label: selectedSubject.greekName,
            }
          : null,
      });

      const assistantMessage: ChatMessage = {
        id: createId('assistant'),
        role: 'assistant',
        text: response.reply,
        timestamp: formatTime(),
        status: 'read',
        meta: response.meta,
      };

      setMessages((current) => [
        ...current.map((message) => (message.id === userMessage.id ? { ...message, status: 'read' as const } : message)),
        assistantMessage,
      ]);
      setAttachedFiles([]);
    } catch (sendError) {
      console.error('SpecializedTeacherPage handleSend error:', sendError);
      const message = sendError instanceof Error ? sendError.message : 'Δεν μπόρεσα να πάρω απάντηση από το Cortex AI.';
      setError(message);
      setMessages((current) => [
        ...current.map((item) => (item.id === userMessage.id ? { ...item, status: 'read' as const } : item)),
        {
          id: createId('assistant-error'),
          role: 'assistant',
          text: 'Κάτι πήγε στραβά στη σύνδεση. Δοκίμασε ξανά σε λίγο ή γράψε την ερώτηση πιο σύντομα και πιο καθαρά.',
          timestamp: formatTime(),
          meta: {
            detectedState: 'normal',
            subjectFocus: selectedSubjectId,
            suggestions: [
              {
                id: 'retry-short',
                label: 'Ξαναρώτα πιο σύντομα',
                prompt: 'Θα το ξαναγράψω πιο σύντομα και πιο καθαρά.',
                mode: 'normal',
              },
            ],
          },
        },
      ]);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="teacher-page">
      <aside className="teacher-page__sidebar">
        <div className="teacher-page__intro">
          <span className="teacher-page__eyebrow">AI Καθηγητής</span>
          <h2 className="teacher-page__title">Ψηφιακός Καθηγητής Πανελληνίων</h2>
          <p className="teacher-page__description">
            Εξειδικευμένος στα Μαθηματικά, το ΑΟΘ και την ΑΕΠΠ. Στόχος του είναι να εξηγεί δύσκολα σημεία απλά, να
            σε καθοδηγεί σωστά και να σε προετοιμάζει ουσιαστικά για τις Πανελλήνιες.
          </p>
        </div>

        <div className="teacher-page__subject-section">
          <div className="teacher-page__section-label">Subject context</div>
          <div className="teacher-page__subject-chips">
            <button
              type="button"
              className={!selectedSubjectId ? 'teacher-page__subject-chip teacher-page__subject-chip--active' : 'teacher-page__subject-chip'}
              onClick={() => setSelectedSubjectId(null)}
            >
              Γενικό
            </button>
            {SUBJECTS.map((subject) => (
              <button
                key={subject.id}
                type="button"
                className={
                  selectedSubjectId === subject.id
                    ? 'teacher-page__subject-chip teacher-page__subject-chip--active'
                    : 'teacher-page__subject-chip'
                }
                onClick={() => setSelectedSubjectId(subject.id)}
              >
                {subject.code}
              </button>
            ))}
          </div>
        </div>

        <div className="teacher-page__tabs">
          <button
            className={activePanel === 'tools' ? 'teacher-page__tab teacher-page__tab--active' : 'teacher-page__tab'}
            onClick={() => setActivePanel('tools')}
            type="button"
          >
            Εργαλεία
          </button>
          <button
            className={activePanel === 'saved' ? 'teacher-page__tab teacher-page__tab--active' : 'teacher-page__tab'}
            onClick={() => setActivePanel('saved')}
            type="button"
          >
            Σημειώσεις ({savedPoints.length})
          </button>
        </div>

        {activePanel === 'tools' ? (
          <div className="teacher-page__tool-list">
            {quickPrompts.map((item) => (
              <button
                key={item.label}
                className="teacher-page__tool-card"
                onClick={() => {
                  setActiveMode(item.mode);
                  handleSend(item.prompt, item.mode);
                }}
                type="button"
              >
                <strong className="teacher-page__tool-card-title">{item.label}</strong>
                <span className="teacher-page__tool-card-text">{item.prompt}</span>
              </button>
            ))}

            <button className="teacher-page__action-button teacher-page__action-button--secondary" onClick={downloadChat} type="button">
              <LuDownload size={16} />
              Κατέβασμα συνομιλίας
            </button>

            <button className="teacher-page__action-button teacher-page__action-button--danger" onClick={clearChat} type="button">
              <LuTrash2 size={16} />
              Καθαρισμός chat
            </button>
          </div>
        ) : (
          <div className="teacher-page__saved-list">
            {savedPoints.length === 0 ? (
              <div className="teacher-page__empty-saved">Δεν έχεις αποθηκεύσει ακόμη απαντήσεις.</div>
            ) : (
              savedPoints.map((point) => (
                <article key={point.id} className="teacher-page__saved-card">
                  <div className="teacher-page__saved-card-head">
                    <span className="teacher-page__saved-time">{point.timestamp}</span>
                    <button className="teacher-page__saved-remove" onClick={() => deleteSavedPoint(point.id)} type="button">
                      Αφαίρεση
                    </button>
                  </div>
                  <p className="teacher-page__saved-preview">{point.preview}...</p>
                </article>
              ))
            )}
          </div>
        )}

        <div className="teacher-page__teacher-card">
          <div className="teacher-page__teacher-card-head">
            <div className="teacher-page__teacher-card-icon">
              <LuTerminal size={20} />
            </div>
            <div>
              <div className="teacher-page__teacher-card-title">Καθηγητής Πανελληνίων</div>
              <div className="teacher-page__teacher-card-subtitle">Study-first mode</div>
            </div>
          </div>
          <p className="teacher-page__teacher-card-text">
            Socratic tutoring, subject-aware context, file reading, memory από την πρόοδό σου και προτάσεις για επόμενο
            βήμα μετά από κάθε απάντηση.
          </p>
        </div>
      </aside>

      <section className="teacher-page__main">
        <header className="teacher-page__chat-header">
          <div className="teacher-page__chat-header-main">
            <div className="teacher-page__chat-avatar">
              <LuCpu size={22} />
              <span className="teacher-page__chat-status-dot" />
            </div>
            <div>
              <div className="teacher-page__chat-title">Συνομιλία με τον καθηγητή</div>
              <div className="teacher-page__chat-subtitle">
                {selectedSubject ? `Focus στο μάθημα: ${selectedSubject.greekName}` : 'Μπορείς να ρωτήσεις θεωρία, άσκηση, μεθοδολογία ή απορία πάνω στην ύλη.'}
              </div>
            </div>
          </div>
          <div className="teacher-page__chat-header-actions">
            <span className="teacher-page__online-pill">{getStateLabel(messages[messages.length - 1]?.meta?.detectedState)}</span>
          </div>
        </header>

        {error ? <div className="teacher-page__error">{error}</div> : null}

        <div ref={scrollRef} className="teacher-page__messages">
          <div className="teacher-page__messages-inner">
            {messages.map((message) => (
              <article
                key={message.id}
                className={`teacher-page__message ${message.role === 'user' ? 'teacher-page__message--user' : 'teacher-page__message--assistant'}`}
              >
                <div
                  className={`teacher-page__message-icon ${
                    message.role === 'user' ? 'teacher-page__message-icon--user' : 'teacher-page__message-icon--assistant'
                  }`}
                >
                  {message.role === 'user' ? <LuUser size={20} /> : <LuBot size={20} />}
                </div>

                <div className={`teacher-page__message-body ${message.role === 'user' ? 'teacher-page__message-body--user' : ''}`}>
                  <div className="teacher-page__message-meta">
                    <span>{message.role === 'assistant' ? 'Cortex AI' : 'Χρήστης'}</span>
                    <span>{message.timestamp}</span>
                    {message.role === 'user' && message.status === 'read' ? <LuCheckCheck size={14} className="teacher-page__message-read" /> : null}
                  </div>

                  <div className={`teacher-page__bubble ${message.role === 'user' ? 'teacher-page__bubble--user' : 'teacher-page__bubble--assistant'}`}>
                    {message.role === 'assistant' ? (
                      <div className="teacher-page__markdown">
                        <ReactMarkdown>{message.text}</ReactMarkdown>
                      </div>
                    ) : (
                      <p className="teacher-page__message-text">{message.text}</p>
                    )}
                  </div>

                  {message.role === 'assistant' && message.meta ? (
                    <div className="teacher-page__meta-row">
                      <span className="teacher-page__state-pill">{getStateLabel(message.meta.detectedState)}</span>
                      {message.meta.subjectFocus ? (
                        <span className="teacher-page__state-pill teacher-page__state-pill--subject">{message.meta.subjectFocus.toUpperCase()}</span>
                      ) : null}
                    </div>
                  ) : null}

                  {message.role === 'assistant' && message.meta?.suggestions?.length ? (
                    <div className="teacher-page__suggestions">
                      {message.meta.suggestions.map((suggestion) => (
                        <button
                          key={suggestion.id}
                          className="teacher-page__suggestion-button"
                          onClick={() => {
                            setActiveMode(suggestion.mode);
                            handleSend(suggestion.prompt, suggestion.mode);
                          }}
                          type="button"
                        >
                          {suggestion.label}
                        </button>
                      ))}
                    </div>
                  ) : null}

                  {message.role === 'assistant' ? (
                    <button className="teacher-page__save-answer" onClick={() => savePoint(message)} type="button">
                      <LuPin size={14} />
                      Αποθήκευση απάντησης
                    </button>
                  ) : null}
                </div>
              </article>
            ))}

            {isSending ? (
              <article className="teacher-page__message teacher-page__message--assistant">
                <div className="teacher-page__message-icon teacher-page__message-icon--assistant">
                  <LuBot size={20} />
                </div>
                <div className="teacher-page__typing">
                  <div className="teacher-page__typing-dots">
                    <span className="teacher-page__typing-dot" />
                    <span className="teacher-page__typing-dot teacher-page__typing-dot--delay-1" />
                    <span className="teacher-page__typing-dot teacher-page__typing-dot--delay-2" />
                  </div>
                </div>
              </article>
            ) : null}
          </div>
        </div>

        <div className="teacher-page__composer">
          <div className="teacher-page__composer-inner">
            <div className="teacher-page__chips">
              {quickPrompts.map((item) => (
                <button
                  key={item.label}
                  className={`teacher-page__chip ${activeMode === item.mode ? 'teacher-page__chip--active' : ''}`}
                  onClick={() => setActiveMode(item.mode)}
                  type="button"
                >
                  {item.label}
                </button>
              ))}
            </div>

            {attachedFiles.length > 0 ? (
              <div className="teacher-page__attachments">
                {attachedFiles.map((file) => (
                  <div key={file.id} className="teacher-page__attachment-card">
                    <div className="teacher-page__attachment-icon">
                      <LuBookMarked size={16} />
                    </div>
                    <div className="teacher-page__attachment-info">
                      <div className="teacher-page__attachment-name">{file.name}</div>
                      <div className="teacher-page__attachment-meta">
                        {file.sizeLabel}
                        {file.note ? ` · ${file.note}` : ''}
                      </div>
                    </div>
                    <button className="teacher-page__attachment-remove" onClick={() => removeAttachedFile(file.id)} type="button">
                      ×
                    </button>
                  </div>
                ))}
              </div>
            ) : null}

            <div className="teacher-page__composer-row">
              <div className="teacher-page__textarea-wrap">
                <textarea
                  className="teacher-page__textarea"
                  placeholder="Ρώτησε οτιδήποτε. Από θεωρία και ασκήσεις μέχρι κώδικα, αρχεία, reasoning ή γενικές απορίες."
                  value={input}
                  onChange={(event) => setInput(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter' && !event.shiftKey) {
                      event.preventDefault();
                      handleSend();
                    }
                  }}
                />
              </div>

              <input ref={fileInputRef} hidden multiple type="file" onChange={handleFileChange} />

              <div className="teacher-page__composer-actions">
                <button className="teacher-page__composer-button teacher-page__composer-button--secondary" onClick={() => fileInputRef.current?.click()} type="button">
                  <LuFileUp size={18} />
                  Επισύναψη
                </button>
                <button
                  className={`teacher-page__composer-button ${canSend ? 'teacher-page__composer-button--primary' : 'teacher-page__composer-button--disabled'}`}
                  disabled={!canSend}
                  onClick={() => handleSend()}
                  type="button"
                >
                  <LuSend size={18} />
                  {isSending ? 'Στέλνω...' : 'Αποστολή'}
                </button>
              </div>
            </div>

            <div className="teacher-page__footer-meta">
              <span className="teacher-page__footer-pill">
                <LuSparkles size={14} className="teacher-page__footer-icon--blue" />
                Socratic tutoring
              </span>
              <span className="teacher-page__footer-pill">
                <LuBrain size={14} className="teacher-page__footer-icon--violet" />
                Subject-aware prompting
              </span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
