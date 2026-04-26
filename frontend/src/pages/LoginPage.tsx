import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.tsx';

export default function LoginPage() {
  const navigate = useNavigate();
  const { loginUser, requestPasswordReset, resetPassword } = useAuth();

  const [contact, setContact] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [showRecovery, setShowRecovery] = useState(false);
  const [recoveryCodeSent, setRecoveryCodeSent] = useState(false);
  const [recoveryCode, setRecoveryCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [previewCode, setPreviewCode] = useState<string | null>(null);
  const [previewMessage, setPreviewMessage] = useState<string | null>(null);

  const canSubmit = contact.trim().length > 0 && password.trim().length > 0;
  const canRequestRecovery = contact.trim().length > 0;
  const canResetPassword =
    recoveryCode.trim().length > 0 &&
    newPassword.length >= 12 &&
    confirmNewPassword.length >= 12 &&
    newPassword === confirmNewPassword;

  const passwordHelper = useMemo(() => {
    if (!showRecovery) {
      return null;
    }

    if (!newPassword && !confirmNewPassword) {
      return 'Ο νέος κωδικός πρέπει να έχει τουλάχιστον 12 χαρακτήρες.';
    }

    if (newPassword.length < 12 || confirmNewPassword.length < 12) {
      return 'Γράψε τον νέο κωδικό και την επιβεβαίωση με τουλάχιστον 12 χαρακτήρες.';
    }

    if (newPassword !== confirmNewPassword) {
      return 'Η επιβεβαίωση πρέπει να ταιριάζει ακριβώς με τον νέο κωδικό.';
    }

    return 'Ο νέος κωδικός είναι έτοιμος για αλλαγή.';
  }, [confirmNewPassword, newPassword, showRecovery]);

  const handleLogin = async () => {
    if (!canSubmit) {
      return;
    }

    setIsSubmitting(true);
    setError(null);
    setSuccess(null);

    const result = await loginUser({ contact, password });
    setIsSubmitting(false);

    if (!result.ok) {
      setError(result.message ?? 'Δεν μπόρεσα να σε συνδέσω.');
      return;
    }

    navigate('/app');
  };

  const handleSendRecoveryCode = async () => {
    if (!canRequestRecovery) {
      return;
    }

    setIsSubmitting(true);
    setError(null);
    setSuccess(null);

    const result = await requestPasswordReset(contact);
    setIsSubmitting(false);

    if (!result.ok) {
      setError(result.message ?? 'Δεν μπόρεσα να στείλω κωδικό ανάκτησης.');
      return;
    }

    setRecoveryCodeSent(true);
    setPreviewCode(result.previewCode ?? null);
    setPreviewMessage(result.previewMessage ?? null);
    setSuccess(result.message ?? 'Στάλθηκε κωδικός ανάκτησης.');
  };

  const handleResetPassword = async () => {
    if (!canResetPassword) {
      return;
    }

    setIsSubmitting(true);
    setError(null);
    setSuccess(null);

    const result = await resetPassword({
      contact,
      code: recoveryCode,
      newPassword,
    });
    setIsSubmitting(false);

    if (!result.ok) {
      setError(result.message ?? 'Δεν μπόρεσα να αλλάξω τον κωδικό.');
      return;
    }

    setSuccess('Ο κωδικός άλλαξε και μπήκες αυτόματα στον λογαριασμό σου.');
    navigate('/app');
  };

  return (
    <div className="auth-shell">
      <div className="login-page auth-card auth-card-wide auth-card-polished">
        <span className="landing-kicker">ΣΥΝΔΕΣΗ</span>
        <h1>Μπες στο ψηφιακό φροντιστήριο</h1>
        <p className="auth-intro-text">
          Χρησιμοποίησε το email ή το κινητό που δήλωσες στον λογαριασμό σου. Αν ξέχασες τον κωδικό, μπορείς να τον
          ανακτήσεις με κωδικό επιβεβαίωσης.
        </p>

        <div className="auth-section-card">
          <label className="auth-label">Email ή κινητό</label>
          <input
            type="text"
            placeholder="π.χ. example@email.com ή 69XXXXXXXX"
            value={contact}
            onChange={(event) => setContact(event.target.value)}
          />

          {!showRecovery ? (
            <>
              <label className="auth-label">Κωδικός</label>
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Γράψε τον κωδικό σου"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
              />

              <label className="auth-checkbox-row">
                <input type="checkbox" checked={showPassword} onChange={(event) => setShowPassword(event.target.checked)} />
                <span>Να μπορώ να δω τον κωδικό</span>
              </label>

              <div className="auth-actions auth-actions-stacked-mobile">
                <button type="button" className="landing-secondary-button auth-inline-button" onClick={() => setShowRecovery(true)}>
                  Ξέχασα τον κωδικό
                </button>
                <button type="button" className="landing-primary-button auth-inline-button" disabled={!canSubmit || isSubmitting} onClick={handleLogin}>
                  {isSubmitting ? 'Σύνδεση...' : 'Σύνδεση'}
                </button>
              </div>
            </>
          ) : (
            <div className="auth-recovery-flow">
              <div className="auth-recovery-header">
                <strong>Ανάκτηση κωδικού</strong>
                <button type="button" className="landing-secondary-button auth-inline-button" onClick={() => setShowRecovery(false)}>
                  Επιστροφή στη σύνδεση
                </button>
              </div>

              {!recoveryCodeSent ? (
                <button
                  type="button"
                  className="landing-primary-button auth-inline-button auth-full-width"
                  disabled={!canRequestRecovery || isSubmitting}
                  onClick={handleSendRecoveryCode}
                >
                  {isSubmitting ? 'Στέλνω κωδικό...' : 'Στείλε κωδικό ανάκτησης'}
                </button>
              ) : (
                <>
                  <label className="auth-label">Κωδικός επιβεβαίωσης</label>
                  <input
                    type="text"
                    inputMode="numeric"
                    placeholder="Γράψε τον 6ψήφιο κωδικό"
                    value={recoveryCode}
                    onChange={(event) => setRecoveryCode(event.target.value)}
                  />

                  <label className="auth-label">Νέος κωδικός</label>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Τουλάχιστον 12 χαρακτήρες"
                    value={newPassword}
                    onChange={(event) => setNewPassword(event.target.value)}
                  />

                  <label className="auth-label">Επιβεβαίωση νέου κωδικού</label>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Ξαναγράψε τον νέο κωδικό"
                    value={confirmNewPassword}
                    onChange={(event) => setConfirmNewPassword(event.target.value)}
                  />

                  <label className="auth-checkbox-row">
                    <input type="checkbox" checked={showPassword} onChange={(event) => setShowPassword(event.target.checked)} />
                    <span>Να μπορώ να δω τον νέο κωδικό</span>
                  </label>

                  {passwordHelper ? <p className="auth-helper-text valid">{passwordHelper}</p> : null}

                  <div className="auth-actions auth-actions-stacked-mobile">
                    <button type="button" className="landing-secondary-button auth-inline-button" onClick={handleSendRecoveryCode}>
                      Στείλε ξανά κωδικό
                    </button>
                    <button
                      type="button"
                      className="landing-primary-button auth-inline-button"
                      disabled={!canResetPassword || isSubmitting}
                      onClick={handleResetPassword}
                    >
                      {isSubmitting ? 'Αλλαγή...' : 'Αλλαγή κωδικού'}
                    </button>
                  </div>
                </>
              )}
            </div>
          )}
        </div>

        {previewCode ? (
          <div className="auth-preview-code">
            <strong>Κωδικός local/dev:</strong> <span>{previewCode}</span>
            {previewMessage ? <p>{previewMessage}</p> : null}
          </div>
        ) : null}

        {error ? <p className="auth-error">{error}</p> : null}
        {success ? <p className="auth-success">{success}</p> : null}

        <p className="auth-bottom-link">
          Δεν έχεις λογαριασμό; <a href="/register">Δημιούργησε έναν εδώ</a>
        </p>
      </div>
    </div>
  );
}
