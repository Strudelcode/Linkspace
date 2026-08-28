import React, { useState } from 'react';
import { X, ShieldCheck, Sparkles, Loader2, AlertCircle, Lock, Mail, User } from 'lucide-react';
import { loginWithGoogle, loginWithGithub, registerWithEmail, loginWithEmail } from '../firebase';

export function SaveGuestModal({ profile, onAuthenticatedAndSave, onClose }) {
  const [isRegister, setIsRegister] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState(profile?.displayName || '');
  const [loading, setLoading] = useState(false);
  const [loadingProvider, setLoadingProvider] = useState(null);
  const [error, setError] = useState('');

  const handleOAuthAuth = async (providerName, loginFn) => {
    setError('');
    setLoading(true);
    setLoadingProvider(providerName);
    try {
      const user = await loginFn();
      if (user) {
        await onAuthenticatedAndSave(user);
        onClose();
      }
    } catch (err) {
      setError(err.message || `${providerName} Anmeldung fehlgeschlagen.`);
    } finally {
      setLoading(false);
      setLoadingProvider(null);
    }
  };

  const handleEmailAuth = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      let user;
      if (isRegister) {
        user = await registerWithEmail(email, password, displayName || profile?.displayName);
      } else {
        user = await loginWithEmail(email, password);
      }

      if (user) {
        await onAuthenticatedAndSave(user);
        onClose();
      }
    } catch (err) {
      setError(err.message || 'Authentifizierungsfehler aufgetreten.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-backdrop" id="save-guest-modal-overlay" onClick={onClose}>
      <div
        className="save-guest-modal-card"
        id="save-guest-modal-card"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="save-guest-header">
          <div className="flex items-center gap-3">
            <div className="save-guest-header-badge">
              <ShieldCheck size={22} />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-100 m-0">Profil dauerhaft sichern</h3>
              <p className="text-xs text-slate-400 m-0 mt-0.5">
                Kostenlos anmelden, um deine Seite weltweit zu veröffentlichen
              </p>
            </div>
          </div>
          <button
            type="button"
            className="btn btn-ghost btn-icon p-1.5"
            onClick={onClose}
            title="Schließen"
            aria-label="Schließen"
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="save-guest-body">
          {/* Info Banner */}
          <div className="save-guest-banner">
            <div className="save-guest-banner-title">
              <Sparkles size={15} />
              <span>Dein aktueller Entwurf bleibt zu 100% erhalten!</span>
            </div>
            <p className="save-guest-banner-text">
              Alle bisher angelegten Links, Texte und Designs werden direkt in dein persönliches Konto übertragen.
            </p>
          </div>

          {/* Social OAuth Buttons */}
          <div className="save-guest-sso-grid">
            <button
              type="button"
              className="save-guest-btn-google"
              onClick={() => handleOAuthAuth('Google', loginWithGoogle)}
              disabled={loading}
            >
              {loadingProvider === 'Google' ? (
                <Loader2 size={18} className="spin text-slate-700" />
              ) : (
                <svg width="18" height="18" viewBox="0 0 18 18">
                  <path
                    fill="#4285F4"
                    d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.616z"
                  />
                  <path
                    fill="#34A853"
                    d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332C2.438 15.983 5.482 18 9 18z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M3.964 10.707c-.18-.54-.282-1.117-.282-1.707s.102-1.167.282-1.707V4.961H.957C.347 6.175 0 7.55 0 9s.347 2.825.957 4.039l3.007-2.332z"
                  />
                  <path
                    fill="#EA4335"
                    d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0 5.482 0 2.438 2.017.957 4.961L3.964 7.293C4.672 5.166 6.656 3.58 9 3.58z"
                  />
                </svg>
              )}
              <span>1-Klick mit Google sichern</span>
            </button>

            <button
              type="button"
              className="save-guest-btn-github"
              onClick={() => handleOAuthAuth('GitHub', loginWithGithub)}
              disabled={loading}
            >
              {loadingProvider === 'GitHub' ? (
                <Loader2 size={18} className="spin text-slate-200" />
              ) : (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
                </svg>
              )}
              <span>Mit GitHub sichern</span>
            </button>
          </div>

          <div className="save-guest-divider">
            <span>oder mit E-Mail</span>
          </div>

          {error && (
            <div className="auth-error-banner py-2.5">
              <div className="flex items-start gap-2">
                <AlertCircle size={15} className="text-red-400 shrink-0 mt-0.5" />
                <span className="text-xs leading-snug">{error}</span>
              </div>
            </div>
          )}

          <form onSubmit={handleEmailAuth} className="save-guest-form">
            {isRegister && (
              <div className="save-guest-input-group">
                <label className="save-guest-label">Name</label>
                <div className="save-guest-input-wrapper">
                  <User size={15} className="save-guest-input-icon" />
                  <input
                    type="text"
                    className="save-guest-input"
                    placeholder="Dein Name"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                  />
                </div>
              </div>
            )}

            <div className="save-guest-input-group">
              <label className="save-guest-label">E-Mail-Adresse</label>
              <div className="save-guest-input-wrapper">
                <Mail size={15} className="save-guest-input-icon" />
                <input
                  type="email"
                  className="save-guest-input"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="save-guest-input-group">
              <label className="save-guest-label">Passwort</label>
              <div className="save-guest-input-wrapper">
                <Lock size={15} className="save-guest-input-icon" />
                <input
                  type="password"
                  className="save-guest-input"
                  placeholder={isRegister ? 'Mindestens 6 Zeichen' : '••••••••'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                />
              </div>
            </div>

            <button
              type="submit"
              className="save-guest-submit-btn"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 size={16} className="spin" />
                  <span>Wird synchronisiert …</span>
                </>
              ) : isRegister ? (
                'Konto erstellen & Profil sichern'
              ) : (
                'Anmelden & Profil synchronisieren'
              )}
            </button>

            <button
              type="button"
              className="save-guest-toggle"
              onClick={() => {
                setError('');
                setIsRegister(!isRegister);
              }}
            >
              {isRegister
                ? 'Bereits registriert? Hier anmelden'
                : 'Neu hier? Kostenlos registrieren'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

