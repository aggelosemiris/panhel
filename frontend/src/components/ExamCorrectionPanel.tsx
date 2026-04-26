import React, { useMemo, useState } from 'react';
import { useAuth } from '../context/AuthContext.tsx';
import { fileToUploadPayload, submitExamForAiCorrection, type ExamGradingResult, type UploadedExamFile } from '../services/examGrading.ts';

export default function ExamCorrectionPanel({
  subjectId,
  chapterId,
  chapterTitle,
  tier,
}: {
  subjectId: string;
  chapterId: string;
  chapterTitle: string;
  tier: string;
}) {
  const { currentUser } = useAuth();
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [gradingResult, setGradingResult] = useState<ExamGradingResult | null>(null);

  const acceptedFormatsLabel = useMemo(() => selectedFiles.map((file) => file.name).join(', '), [selectedFiles]);

  const handleFilesChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? []);
    setSelectedFiles(files);
    setErrorMessage(null);
  };

  const handleSubmit = async () => {
    if (!selectedFiles.length) {
      setErrorMessage('Διάλεξε πρώτα φωτογραφίες ή PDF του γραπτού σου.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const uploadedFiles: UploadedExamFile[] = await Promise.all(selectedFiles.map((file) => fileToUploadPayload(file)));
      const response = await submitExamForAiCorrection({
        subjectId,
        chapterId,
        tier,
        chapterTitle,
        uploadedFiles,
        userId: currentUser?.id,
      });

      setGradingResult(response.result);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Η διόρθωση απέτυχε.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="exam-correction-panel">
      <div className="exam-correction-header">
        <h2>Ανέβασε το γραπτό σου για AI διόρθωση</h2>
        <p>Βάλε φωτογραφίες ή PDF του γραπτού σου και πάτησε διόρθωση για να ενημερωθεί αυτόματα και το προφίλ σου.</p>
      </div>

      <div className="exam-correction-actions">
        <label className="exam-upload-input">
          <span>Επίλεξε αρχεία</span>
          <input accept="image/*,application/pdf" multiple onChange={handleFilesChange} type="file" />
        </label>

        <button className="module-b-test-pdf-button exam-correction-submit" disabled={isSubmitting} onClick={handleSubmit} type="button">
          {isSubmitting ? 'Γίνεται διόρθωση...' : 'Διόρθωσε το γραπτό μου'}
        </button>
      </div>

      {acceptedFormatsLabel ? <p className="exam-upload-selected">{acceptedFormatsLabel}</p> : null}
      {errorMessage ? <p className="exam-correction-error">{errorMessage}</p> : null}

      {gradingResult ? (
        <div className="exam-correction-result">
          <div className="exam-correction-summary">
            <strong>{`Σκορ: ${gradingResult.total_score}/${gradingResult.max_total_score}`}</strong>
            <span>
              {gradingResult.gradingMode === 'fallback'
                ? 'Fallback grading ενεργοποιήθηκε επειδή η AI διόρθωση δεν ήταν διαθέσιμη αυτή τη στιγμή. Το αποτέλεσμα είναι ενδεικτικό μέχρι να ενεργοποιηθεί πραγματική AI διόρθωση.'
                : gradingResult.summary}
            </span>
          </div>

          <div className="exam-correction-breakdown">
            {gradingResult.questions.map((question) => (
              <article key={question.question_id} className="exam-correction-breakdown-card">
                <strong>{question.chapter}</strong>
                <span>{`Ερώτηση ${question.question_id}`}</span>
                <span>{`${question.score}/${question.max_score}`}</span>
              </article>
            ))}
          </div>

          {gradingResult.gradingMode === 'fallback' ? (
            <p className="exam-correction-note">Το αποτέλεσμα είναι προσωρινή fallback εκτίμηση μέχρι να επανέλθει η πραγματική AI διόρθωση.</p>
          ) : null}
        </div>
      ) : null}
    </section>
  );
}
