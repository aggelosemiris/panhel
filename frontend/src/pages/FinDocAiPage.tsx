import React, { useMemo, useState } from 'react';
import './FinDocAiPage.css';
import {
  askFinDocQuestion,
  createFinDocSession,
  type FinDocAnswerPayload,
  type FinDocCitation,
  type FinDocDocumentSummary,
  type FinDocUpload,
} from '../services/findoc.ts';

type LocalFile = {
  id: string;
  name: string;
  mimeType: string;
  sizeLabel: string;
  dataUrl: string;
  kind: 'document' | 'bank';
};

type ChatMessage = {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  citations?: FinDocCitation[];
  bankReconciliation?: FinDocAnswerPayload['bankReconciliation'];
};

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function toDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ''));
    reader.onerror = () => reject(new Error(`Δεν μπόρεσα να διαβάσω το αρχείο ${file.name}.`));
    reader.readAsDataURL(file);
  });
}

function buildDemoPrompts(hasBankStatement: boolean) {
  const prompts = [
    'Ποιο είναι το συνολικό ποσό στο τιμολόγιο;',
    'Ποιος είναι ο προμηθευτής και ποιος ο αριθμός τιμολογίου;',
    'Υπάρχει line item για cloud hosting ή άλλη αντίστοιχη υπηρεσία;',
  ];

  if (hasBankStatement) {
    prompts.push('Έχει πληρωθεί αυτό το τιμολόγιο σύμφωνα με το bank statement;');
  }

  return prompts;
}

export default function FinDocAiPage() {
  const [files, setFiles] = useState<LocalFile[]>([]);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [documents, setDocuments] = useState<FinDocDocumentSummary[]>([]);
  const [question, setQuestion] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [status, setStatus] = useState('');
  const [error, setError] = useState('');
  const [isBooting, setIsBooting] = useState(false);
  const [isAsking, setIsAsking] = useState(false);

  const documentFiles = useMemo(() => files.filter((file) => file.kind === 'document'), [files]);
  const bankFile = useMemo(() => files.find((file) => file.kind === 'bank') || null, [files]);
  const prompts = useMemo(() => buildDemoPrompts(Boolean(bankFile)), [bankFile]);

  const handleFiles = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const selected = Array.from(event.target.files || []);
    if (!selected.length) {
      return;
    }

    setError('');

    try {
      const converted = await Promise.all(
        selected.map(async (file) => {
          const dataUrl = await toDataUrl(file);
          const kind = /csv|spreadsheet/i.test(file.type) || /\.csv$/i.test(file.name) ? 'bank' : 'document';
          return {
            id: crypto.randomUUID(),
            name: file.name,
            mimeType: file.type || 'application/octet-stream',
            sizeLabel: formatBytes(file.size),
            dataUrl,
            kind,
          } as LocalFile;
        }),
      );

      setFiles((current) => {
        const nextDocuments = [
          ...current.filter((file) => file.kind === 'document'),
          ...converted.filter((file) => file.kind === 'document'),
        ];
        const nextBank = [
          ...current.filter((file) => file.kind === 'bank'),
          ...converted.filter((file) => file.kind === 'bank'),
        ].slice(-1);
        return [...nextDocuments, ...nextBank];
      });
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : 'Η ανάγνωση των αρχείων απέτυχε.');
    } finally {
      event.target.value = '';
    }
  };

  const initializeSession = async () => {
    if (!documentFiles.length || isBooting) {
      return;
    }

    setIsBooting(true);
    setError('');
    setStatus('Κάνω extraction από τα τιμολόγια/αποδείξεις και χτίζω grounded index...');

    try {
      const payload = await createFinDocSession(
        documentFiles.map((file) => ({ name: file.name, mimeType: file.mimeType, dataUrl: file.dataUrl } as FinDocUpload)),
        bankFile ? { name: bankFile.name, mimeType: bankFile.mimeType, dataUrl: bankFile.dataUrl } : null,
      );

      setSessionId(payload.sessionId);
      setDocuments(payload.documents);
      setStatus(`Έτοιμο. Indexed ${payload.documents.length} document(s).`);
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : 'Δεν κατάφερα να ξεκινήσω το FinDoc session.');
      setStatus('');
    } finally {
      setIsBooting(false);
    }
  };

  const submitQuestion = async (promptText: string) => {
    const trimmed = promptText.trim();
    if (!trimmed || isAsking) {
      return;
    }

    if (!sessionId) {
      setError('Ξεκίνα πρώτα το session με τα έγγραφα.');
      return;
    }

    const nextUserMessage: ChatMessage = {
      id: crypto.randomUUID(),
      role: 'user',
      text: trimmed,
    };

    const nextHistory = [...messages, nextUserMessage].map((message) => ({
      role: message.role,
      text: message.text,
    }));

    setMessages((current) => [...current, nextUserMessage]);
    setQuestion('');
    setIsAsking(true);
    setError('');
    setStatus('Ανακτώ τα πιο σχετικά chunks και ετοιμάζω grounded απάντηση...');

    try {
      const payload = await askFinDocQuestion(sessionId, trimmed, nextHistory);
      setMessages((current) => [
        ...current,
        {
          id: crypto.randomUUID(),
          role: 'assistant',
          text: payload.answer,
          citations: payload.citations,
          bankReconciliation: payload.bankReconciliation,
        },
      ]);
      setDocuments(payload.documents);
      setStatus(payload.grounded ? 'Απάντηση μόνο από retrieved context.' : 'Δεν βρέθηκε πλήρως τεκμηριωμένη απάντηση.');
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : 'Η ερώτηση απέτυχε.');
      setStatus('');
    } finally {
      setIsAsking(false);
    }
  };

  return (
    <div className="findoc-page">
      <div className="findoc-shell">
        <section className="findoc-hero">
          <div className="findoc-hero-card findoc-hero-copy">
            <span className="findoc-kicker">FinDoc AI • Grounded Agent</span>
            <h1>Q&A σε τιμολόγια και αποδείξεις χωρίς hallucinations.</h1>
            <p>
              Ανέβασε πραγματικά οικονομικά έγγραφα, χτίσε retrieval index πάνω στο extracted περιεχόμενο και ρώτα για
              totals, vendors, charges και payment reconciliation με citations σε κάθε απάντηση.
            </p>
            <div className="findoc-hero-metrics">
              <article>
                <strong>OCR/VLM</strong>
                <span>Extraction για PDF, invoices και receipts</span>
              </article>
              <article>
                <strong>RAG</strong>
                <span>Term-vector retrieval πάνω στα extracted chunks</span>
              </article>
              <article>
                <strong>Guardrails</strong>
                <span>Fallback “Δεν βρέθηκε” όταν λείπει evidence</span>
              </article>
            </div>
          </div>

          <aside className="findoc-hero-card findoc-stage">
            <h2>Τι καλύπτει αυτό το MVP</h2>
            <ul>
              <li>Upload οικονομικών εγγράφων και προαιρετικού bank statement CSV</li>
              <li>Structured extraction για supplier, invoice number, totals και line items</li>
              <li>Grounded answers με citations σε file, page και snippet</li>
              <li>Follow-up ερωτήσεις μέσα στο ίδιο chat session</li>
            </ul>
          </aside>
        </section>

        <section className="findoc-grid">
          <aside className="findoc-panel">
            <h3>1. Ανέβασε έγγραφα</h3>
            <div className="findoc-uploader">
              <label className="findoc-dropzone">
                <input accept=".pdf,image/*,.csv" multiple onChange={handleFiles} type="file" />
                <strong>PDF / εικόνες / CSV</strong>
                <span>
                  Τα PDF και images θεωρούνται documents. Αν ανεβάσεις `.csv`, χρησιμοποιείται ως bank statement για
                  reconciliation.
                </span>
              </label>

              {documentFiles.length ? (
                <div className="findoc-file-list">
                  {documentFiles.map((file) => (
                    <div className="findoc-file-chip" key={file.id}>
                      <strong>{file.name}</strong>
                      <span>{file.sizeLabel}</span>
                    </div>
                  ))}
                </div>
              ) : null}

              {bankFile ? (
                <div className="findoc-file-chip">
                  <strong>{bankFile.name}</strong>
                  <span>Bank statement • {bankFile.sizeLabel}</span>
                </div>
              ) : null}

              <button
                className="findoc-button primary"
                disabled={!documentFiles.length || isBooting}
                onClick={initializeSession}
                type="button"
              >
                {isBooting ? 'Γίνεται extraction...' : '2. Δημιούργησε FinDoc session'}
              </button>

              <button
                className="findoc-button secondary"
                onClick={() => {
                  setFiles([]);
                  setSessionId(null);
                  setDocuments([]);
                  setMessages([]);
                  setQuestion('');
                  setError('');
                  setStatus('');
                }}
                type="button"
              >
                Καθάρισε demo
              </button>
            </div>

            {documents.length ? (
              <div className="findoc-session-meta">
                {documents.map((document) => (
                  <article className="findoc-summary-card" key={document.documentId}>
                    <strong>{document.name}</strong>
                    <span>{document.supplierName || 'Unknown supplier'}</span>
                    <span>{document.totalAmount ? `Σύνολο: ${document.totalAmount} ${document.currency || ''}`.trim() : 'Χωρίς total'}</span>
                  </article>
                ))}
              </div>
            ) : null}

            {status ? <div className="findoc-status">{status}</div> : null}
            {error ? <div className="findoc-error">{error}</div> : null}
          </aside>

          <section className="findoc-chat-card">
            <div className="findoc-chat-header">
              <div>
                <h3>3. Ρώτα τον agent</h3>
                <p>{sessionId ? 'Το session είναι ενεργό και απαντά μόνο από τα uploaded docs.' : 'Ξεκίνα πρώτα session για να ενεργοποιηθεί το Q&A.'}</p>
              </div>
              <button className="findoc-button secondary" disabled={!sessionId} onClick={() => setMessages([])} type="button">
                Νέο chat
              </button>
            </div>

            <div className="findoc-chat-stream">
              {!messages.length ? (
                <div className="findoc-empty">
                  Προτεινόμενες ερωτήσεις:
                  {prompts.map((prompt) => (
                    <div key={prompt} style={{ marginTop: 10 }}>
                      <button className="findoc-button secondary" disabled={!sessionId || isAsking} onClick={() => submitQuestion(prompt)} type="button">
                        {prompt}
                      </button>
                    </div>
                  ))}
                </div>
              ) : null}

              {messages.map((message) => (
                <article className={`findoc-message ${message.role}`} key={message.id}>
                  <strong>{message.role === 'user' ? 'You' : 'FinDoc AI'}</strong>
                  <div style={{ marginTop: 10 }}>{message.text}</div>

                  {message.citations?.length ? (
                    <div className="findoc-citations">
                      <h4>Citations</h4>
                      {message.citations.map((citation) => (
                        <div className="findoc-citation" key={citation.chunkId}>
                          <strong>
                            {citation.documentName} • σελ. {citation.page}
                          </strong>
                          <div>{citation.snippet}</div>
                        </div>
                      ))}
                    </div>
                  ) : null}

                  {message.bankReconciliation?.length ? (
                    <div className="findoc-recon">
                      <h4>Bank reconciliation</h4>
                      {message.bankReconciliation.map((item) => (
                        <div className="findoc-recon-item" key={`${item.documentName}-${item.rowNumber}`}>
                          <strong>{item.documentName}</strong>
                          <div>{item.rowText}</div>
                        </div>
                      ))}
                    </div>
                  ) : null}
                </article>
              ))}
            </div>

            <div className="findoc-composer">
              <textarea
                disabled={!sessionId || isAsking}
                onChange={(event) => setQuestion(event.target.value)}
                placeholder="Π.χ. Ποιο είναι το συνολικό ποσό στο τιμολόγιο της TechCorp;"
                value={question}
              />
              <button className="findoc-button primary" disabled={!sessionId || isAsking || !question.trim()} onClick={() => submitQuestion(question)} type="button">
                {isAsking ? 'Απάντηση...' : 'Ρώτα'}
              </button>
            </div>
          </section>
        </section>
      </div>
    </div>
  );
}
