import React from 'react';
import type { ExamGradingResult } from '../services/examGrading.ts';

function hasItems<T>(items: T[] | undefined): items is T[] {
  return Array.isArray(items) && items.length > 0;
}

export default function AiCorrectionResult({ result }: { result: ExamGradingResult }) {
  const isFallback = result.gradingMode === 'fallback';
  const mistakes = result.mistakes_found ?? [];
  const praisePoints = result.praise_points ?? [];
  const nextSteps = result.next_steps ?? [];

  return (
    <div className="exam-correction-result ai-teacher-correction-result">
      <div className="exam-correction-summary ai-correction-hero">
        <span className="ai-correction-kicker">Διόρθωση Καθηγητή</span>
        <strong>{`Σκορ: ${result.total_score}/${result.max_total_score}`}</strong>
        <span>
          {isFallback
            ? 'Fallback grading ενεργοποιήθηκε επειδή η AI διόρθωση δεν ήταν διαθέσιμη αυτή τη στιγμή. Το αποτέλεσμα είναι ενδεικτικό μέχρι να ενεργοποιηθεί πραγματική AI διόρθωση.'
            : result.summary}
        </span>
      </div>

      {hasItems(praisePoints) ? (
        <section className="ai-correction-section ai-correction-praise">
          <h3>Τι έκανες σωστά</h3>
          <ul>
            {praisePoints.map((point, index) => (
              <li key={`${point}-${index}`}>{point}</li>
            ))}
          </ul>
        </section>
      ) : null}

      <section className="ai-correction-section">
        <h3>Βαθμολογία ανά σημείο</h3>
        <div className="exam-correction-breakdown">
          {result.questions.map((question) => (
            <article key={question.question_id} className="exam-correction-breakdown-card">
              <strong>{question.chapter}</strong>
              <span>{`Ερώτηση ${question.question_id}`}</span>
              <span>{`${question.score}/${question.max_score}`}</span>
              {question.feedback ? <p>{question.feedback}</p> : null}
              {question.hint ? <em>{question.hint}</em> : null}
            </article>
          ))}
        </div>
      </section>

      {hasItems(mistakes) ? (
        <section className="ai-correction-section">
          <h3>Λάθη και πώς να τα διορθώσεις</h3>
          <div className="ai-correction-mistakes">
            {mistakes.map((mistake, index) => (
              <article key={`${mistake.description}-${index}`} className="ai-correction-mistake-card">
                <strong>
                  {mistake.stepNumber ? `Βήμα ${mistake.stepNumber}: ` : ''}
                  {mistake.description}
                </strong>
                {mistake.explanation ? <p>{mistake.explanation}</p> : null}
                {mistake.hintToFix ? <em>{mistake.hintToFix}</em> : null}
              </article>
            ))}
          </div>
        </section>
      ) : null}

      {result.pedagogical_guidance ? (
        <section className="ai-correction-section ai-correction-guidance">
          <h3>Καθοδήγηση</h3>
          <p>{result.pedagogical_guidance}</p>
        </section>
      ) : null}

      {result.complete_solution ? (
        <details className="ai-correction-solution">
          <summary>Άνοιγμα υποδειγματικής λύσης</summary>
          <div>{result.complete_solution}</div>
        </details>
      ) : null}

      {hasItems(nextSteps) ? (
        <section className="ai-correction-section ai-correction-next">
          <h3>Επόμενα βήματα</h3>
          <ul>
            {nextSteps.map((step, index) => (
              <li key={`${step}-${index}`}>{step}</li>
            ))}
          </ul>
        </section>
      ) : null}

      {isFallback ? (
        <p className="exam-correction-note">Το αποτέλεσμα είναι προσωρινή fallback εκτίμηση μέχρι να επανέλθει η πραγματική AI διόρθωση.</p>
      ) : null}
    </div>
  );
}
