import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.tsx';

type RegisterStep = 1 | 2 | 3 | 4 | 5;

function shouldSuppressRegisterError(message?: string) {
  if (!message) {
    return false;
  }

  const normalized = message.toLowerCase();
  return normalized.includes('κωδικός επιβεβαίωσης') || normalized.includes('verification');
}

export default function RegisterPage() {
  const navigate = useNavigate();
  const { registerUser, startRegistration } = useAuth();

  const [step, setStep] = useState<RegisterStep>(1);
  const [contact, setContact] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [previewCode, setPreviewCode] = useState<string | null>(null);
  const [previewMessage, setPreviewMessage] = useState<string | null>(null);

  const passwordLength = password.length;
  const confirmPasswordLength = confirmPassword.length;
  const hasMinimumLength = passwordLength >= 12;
  const confirmHasMinimumLength = confirmPasswordLength >= 12;
  const passwordsMatch = password.length > 0 && confirmPassword.length > 0 && password === confirmPassword;

  const passwordStepValid = useMemo(() => {
    return hasMinimumLength && confirmHasMinimumLength && passwordsMatch;
  }, [hasMinimumLength, confirmHasMinimumLength, passwordsMatch]);

  const isStepValid =
    (step === 1 && contact.trim().length > 0) ||
    (step === 2 && verificationCode.trim().length >= 6) ||
    (step === 3 && passwordStepValid) ||
    (step === 4 && fullName.trim().length > 1) ||
    (step === 5 && username.trim().length > 2);

  const handleNext = async () => {
    if (!isStepValid) {
      return;
    }

    setError(null);
    setSuccess(null);

    if (step === 1) {
      setIsSubmitting(true);
      const result = await startRegistration(contact);
      setIsSubmitting(false);

      if (!result.ok) {
        setError(result.message ?? 'Δεν μπόρεσα να στείλω κωδικό επιβεβαίωσης.');
        return;
      }

      setPreviewCode(result.previewCode ?? null);
      setPreviewMessage(result.previewMessage ?? null);
      setSuccess(result.message ?? 'Στάλθηκε κωδικός επιβεβαίωσης.');
      setStep(2);
      return;
    }

    if (step < 5) {
      setStep((current) => (current + 1) as RegisterStep);
      return;
    }

    setIsSubmitting(true);
    const result = await registerUser({
      contact,
      code: verificationCode,
      password,
      fullName,
      username,
    });
    setIsSubmitting(false);

    if (!result.ok) {
      if (!shouldSuppressRegisterError(result.message)) {
        setError(result.message ?? 'Δεν μπόρεσα να δημιουργήσω λογαριασμό.');
      }
      return;
    }

    navigate('/app');
  };

  const handleBack = () => {
    if (step === 1) {
      return;
    }

    setStep((current) => (current - 1) as RegisterStep);
    setError(null);
    setSuccess(null);
  };

  const handleResendCode = async () => {
    if (!contact.trim()) {
      return;
    }

    setIsSubmitting(true);
    setError(null);
    setSuccess(null);

    const result = await startRegistration(contact);
    setIsSubmitting(false);

    if (!result.ok) {
      setError(result.message ?? 'Δεν μπόρεσα να στείλω ξανά τον κωδικό.');
      return;
    }

    setPreviewCode(result.previewCode ?? null);
    setPreviewMessage(result.previewMessage ?? null);
    setSuccess('Στάλθηκε νέος κωδικός επιβεβαίωσης.');
  };

  return (
    <div className="auth-shell">
      <div className="login-page auth-card auth-card-wide auth-card-polished">
        <span className="landing-kicker">ΔΗΜΙΟΥΡΓΙΑ ΛΟΓΑΡΙΑΣΜΟΥ</span>
        <h1>Φτιάξε τον λογαριασμό σου</h1>
        <p className="auth-intro-text">
          Πρώτα επιβεβαιώνεις email ή κινητό με κωδικό, μετά βάζεις κωδικό πρόσβασης και τα στοιχεία σου.
          Έτσι ο λογαριασμός σου μένει ασφαλής και καθαρός σαν κανονική πλατφόρμα.
        </p>

        <div className="auth-steps">
          {[1, 2, 3, 4, 5].map((item) => (
            <span key={item} className={`auth-step-chip ${item === step ? 'active' : ''}`}>
              {item}
            </span>
          ))}
        </div>

        {step === 1 ? (
          <div className="auth-step-panel auth-section-card">
            <strong>ΒΗΜΑ 1</strong>
            <h2>Βάλε email ή κινητό</h2>
            <input
              type="text"
              placeholder="π.χ. example@email.com ή 69XXXXXXXX"
              value={contact}
              onChange={(event) => setContact(event.target.value)}
            />
            <p className="auth-helper-text valid">
              Με αυτό θα στέλνεται ο κωδικός επιβεβαίωσης και με αυτό θα συνδέεσαι.
            </p>
          </div>
        ) : null}

        {step === 2 ? (
          <div className="auth-step-panel auth-section-card">
            <strong>ΒΗΜΑ 2</strong>
            <h2>Επιβεβαίωσε τον κωδικό</h2>
            <input
              type="text"
              inputMode="numeric"
              placeholder="Γράψε τον 6ψήφιο κωδικό"
              value={verificationCode}
              onChange={(event) => setVerificationCode(event.target.value)}
            />
            <div className="auth-actions auth-actions-single-left">
              <button type="button" className="landing-secondary-button auth-inline-button" onClick={handleResendCode}>
                Στείλε ξανά κωδικό
              </button>
            </div>
          </div>
        ) : null}

        {step === 3 ? (
          <div className="auth-step-panel auth-section-card">
            <strong>ΒΗΜΑ 3</strong>
            <h2>Διάλεξε κωδικό</h2>

            <input
              type={showPassword ? 'text' : 'password'}
              placeholder="Τουλάχιστον 12 χαρακτήρες"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />

            <input
              type={showPassword ? 'text' : 'password'}
              placeholder="Επιβεβαίωσε τον κωδικό"
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
            />

            <label className="auth-checkbox-row">
              <input type="checkbox" checked={showPassword} onChange={(event) => setShowPassword(event.target.checked)} />
              <span>Να μπορώ να δω τον κωδικό</span>
            </label>

            <div className="auth-validation-list">
              <p className={`auth-helper-text ${hasMinimumLength ? 'valid' : 'invalid'}`}>
                {hasMinimumLength ? 'Ο κωδικός έχει σωστό ελάχιστο μήκος.' : `Ο κωδικός έχει τώρα ${passwordLength} χαρακτήρες.`}
              </p>
              <p className={`auth-helper-text ${confirmHasMinimumLength ? 'valid' : 'invalid'}`}>
                {confirmHasMinimumLength
                  ? 'Η επιβεβαίωση έχει επίσης αρκετούς χαρακτήρες.'
                  : `Η επιβεβαίωση έχει τώρα ${confirmPasswordLength} χαρακτήρες.`}
              </p>
              <p className={`auth-helper-text ${passwordsMatch ? 'valid' : 'invalid'}`}>
                {passwordsMatch ? 'Οι δύο κωδικοί ταιριάζουν ακριβώς.' : 'Οι δύο κωδικοί πρέπει να είναι ίδιοι.'}
              </p>
            </div>
          </div>
        ) : null}

        {step === 4 ? (
          <div className="auth-step-panel auth-section-card">
            <strong>ΒΗΜΑ 4</strong>
            <h2>Γράψε το ονοματεπώνυμό σου</h2>
            <input type="text" placeholder="Ονοματεπώνυμο" value={fullName} onChange={(event) => setFullName(event.target.value)} />
          </div>
        ) : null}

        {step === 5 ? (
          <div className="auth-step-panel auth-section-card">
            <strong>ΒΗΜΑ 5</strong>
            <h2>Διάλεξε username</h2>
            <input type="text" placeholder="π.χ. nikos_panhel" value={username} onChange={(event) => setUsername(event.target.value)} />
          </div>
        ) : null}

        {previewCode ? (
          <div className="auth-preview-code">
            <strong>Κωδικός local/dev:</strong> <span>{previewCode}</span>
            {previewMessage ? <p>{previewMessage}</p> : null}
          </div>
        ) : null}

        {error ? <p className="auth-error">{error}</p> : null}
        {success ? <p className="auth-success">{success}</p> : null}

        <div className="auth-actions">
          <button className="landing-secondary-button auth-inline-button" onClick={handleBack} type="button" disabled={step === 1 || isSubmitting}>
            Πίσω
          </button>
          <button className="landing-primary-button auth-inline-button" onClick={handleNext} type="button" disabled={!isStepValid || isSubmitting}>
            {isSubmitting ? 'Περίμενε...' : step === 5 ? 'Δημιουργία λογαριασμού' : 'Συνέχεια'}
          </button>
        </div>

        <p className="auth-bottom-link">
          Έχεις ήδη λογαριασμό; <a href="/login">Σύνδεση εδώ</a>
        </p>
      </div>
    </div>
  );
}
