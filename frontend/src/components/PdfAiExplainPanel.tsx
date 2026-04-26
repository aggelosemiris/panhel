import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { DEFAULT_QUIZ_USER_ID } from '../context/QuizContext.tsx';
import { useAuth } from '../context/AuthContext.tsx';
import { askSpecializedTeacherWithContext } from '../services/specializedTeacher.ts';

type PdfAiExplainPanelProps = {
  title: string;
  pdfPath: string;
  subjectHint?: string;
};

export default function PdfAiExplainPanel({ title, pdfPath, subjectHint }: PdfAiExplainPanelProps) {
  const { currentUser } = useAuth();
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

      const response = await askSpecializedTeacherWithContext(prompt, {
        userId: currentUser?.id ?? DEFAULT_QUIZ_USER_ID,
        mode: 'explain',
        attachments: [
          {
            name: title,
            sizeLabel: 'PDF μέσα στην εφαρμογή',
            note: `Ο μαθητής βλέπει το PDF στη διαδρομή ${pdfPath}. ${subjectHint ? `Μάθημα/ενότητα: ${subjectHint}.` : ''} Αν δεν υπάρχει πλήρες κείμενο PDF, δώσε καθοδήγηση με βάση τον τίτλο και ζήτησε από τον μαθητή να γράψει τη σελίδα ή την πρόταση που δεν κατάλαβε.`,
          },
        ],
      });

      setReply(response.reply);
    } catch {
      setError('Δεν μπόρεσα να πάρω απάντηση τώρα. Δοκίμασε ξανά ή γράψε πιο συγκεκριμένα τη σελίδα/άσκηση.');
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
            {isLoading ? 'Ο καθηγητής σκέφτεται...' : 'Πάρε εξήγηση'}
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
