import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { explainPdfWithTeacher } from '../services/specializedTeacher.ts';

type PdfAiExplainPanelProps = {
  title: string;
  pdfPath: string;
  subjectHint?: string;
};

export default function PdfAiExplainPanel({ title, pdfPath, subjectHint }: PdfAiExplainPanelProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [question, setQuestion] = useState('');
  const [reply, setReply] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleExplain = async () => {
    setIsOpen(true);
    setIsLoading(true);
    setError('');
    setReply('');

    try {
      const prompt = question.trim()
        ? question.trim()
        : `Εξήγησέ μου με απλά λόγια τι πρέπει να προσέξω στο PDF "${title}".`;

      const response = await explainPdfWithTeacher({
        pdfPath,
        question: prompt,
        title,
        subjectHint,
      });

      setReply(response.answer);
    } catch (requestError) {
      console.error('[PdfAiExplainPanel] PDF explanation failed:', requestError);
      setError(
        requestError instanceof Error
          ? `Δεν μπόρεσα να διαβάσω το PDF τώρα: ${requestError.message}`
          : 'Δεν μπόρεσα να διαβάσω το PDF τώρα. Δοκίμασε ξανά ή γράψε πιο συγκεκριμένα τη σελίδα/άσκηση.',
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="pdf-ai-explain">
      <button className="pdf-ai-fab" onClick={() => setIsOpen((current) => !current)} type="button">
        Εξήγησέ μου το
      </button>

      {isOpen ? (
        <aside className="pdf-ai-panel">
          <div className="pdf-ai-panel-header">
            <div>
              <span>AI καθηγητής πάνω στο PDF</span>
              <h3>{title}</h3>
            </div>
            <button onClick={() => setIsOpen(false)} type="button">
              ×
            </button>
          </div>

          <textarea
            value={question}
            onChange={(event) => setQuestion(event.target.value)}
            placeholder="Γράψε π.χ. Εξήγησέ μου τη σελίδα 2, το Θέμα Γ ή αυτή την παράγραφο..."
          />

          <button className="pdf-ai-submit" disabled={isLoading} onClick={handleExplain} type="button">
            {isLoading ? 'Σαρώνω το PDF με AI...' : 'Πάρε εξήγηση'}
          </button>

          {error ? <div className="pdf-ai-error">{error}</div> : null}
          {reply ? (
            <div className="pdf-ai-reply">
              <ReactMarkdown>{reply}</ReactMarkdown>
            </div>
          ) : null}
        </aside>
      ) : null}
    </div>
  );
}
