import React, { useMemo, useState } from 'react';
import { useAuth } from '../context/AuthContext.tsx';
import { fileToUploadPayload, submitSingleTopicForAiCorrection, type ExamGradingResult, type UploadedExamFile } from '../services/examGrading.ts';
import AiCorrectionResult from './AiCorrectionResult.tsx';

const TOPIC_LABELS: Record<string, string> = {
  'topic-a': 'Θέμα Α',
  'topic-b': 'Θέμα Β',
  'topic-c': 'Θέμα Γ',
  'topic-d': 'Θέμα Δ',
};

export default function SingleTopicCorrectionPanel({
  subjectId,
  topicKey,
  exercisePdfPath,
}: {
  subjectId: string;
  topicKey: string;
  exercisePdfPath?: string | null;
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
      setErrorMessage('Διάλεξε πρώτα φωτογραφίες ή PDF της απάντησής σου.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const uploadedFiles: UploadedExamFile[] = await Promise.all(selectedFiles.map((file) => fileToUploadPayload(file)));
      const response = await submitSingleTopicForAiCorrection({
        subjectId,
        topicKey,
        uploadedFiles,
        exercisePdfPath,
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
        <h2>{`Ανέβασε την απάντησή σου για ${TOPIC_LABELS[topicKey] ?? topicKey}`}</h2>
        <p>Ανέβασε φωτογραφίες ή PDF και η εφαρμογή θα το διορθώσει αυτόματα, ενημερώνοντας και το προφίλ σου.</p>
      </div>

      <div className="exam-correction-actions">
        <label className="exam-upload-input">
          <span>Επίλεξε αρχεία</span>
          <input accept="image/*,application/pdf" multiple onChange={handleFilesChange} type="file" />
        </label>

        <button className="module-b-test-pdf-button exam-correction-submit" disabled={isSubmitting} onClick={handleSubmit} type="button">
          {isSubmitting ? 'Γίνεται διόρθωση...' : 'Διόρθωσε την απάντησή μου'}
        </button>
      </div>

      {acceptedFormatsLabel ? <p className="exam-upload-selected">{acceptedFormatsLabel}</p> : null}
      {errorMessage ? <p className="exam-correction-error">{errorMessage}</p> : null}

      {gradingResult ? <AiCorrectionResult result={gradingResult} /> : null}
    </section>
  );
}
