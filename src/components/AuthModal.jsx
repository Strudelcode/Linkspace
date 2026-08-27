import React, { useState } from 'react';
import { loginWithEmail, registerWithEmail, loginWithGoogle } from '../firebase';
import { Loader2, AlertCircle, Sparkles, CheckCircle2, Lock, Mail, User } from 'lucide-react';
import { Logo } from './Logo';

export function AuthModal({ onAuthSuccess }) {
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isRegister) {
        if (password.length < 6) {
          throw new Error('Das Passwort muss mindestens 6 Zeichen lang sein.');
        }
        await registerWithEmail(email, password, name);
      } else {
        await loginWithEmail(email, password);
      }
      if (onAuthSuccess) onAuthSuccess();
    } catch (err) {
      setError(err.message || 'Authentifizierungsfehler aufgetreten.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError('');
    setLoading(true);
    try {
      await loginWithGoogle();
      if (onAuthSuccess) onAuthSuccess();
    } catch (err) {
      setError(err.message || 'Google Login fehlgeschlagen.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-fullscreen" id="auth-fullscreen-container">
      <div className="auth-card" id="auth-card-main">
        <div className="auth-header">
          <div className="auth-logo-badge">
            <Logo size={42} />
          </div>
          <h2>{isRegister ? 'Account erstellen' : 'Willkommen bei Linkspace'}</h2>
          <p className="auth-sub">
            {isRegister
              ? 'Erstelle deine persönliche Link-in-Bio Seite in wenigen Sekunden.'
              : 'Melde dich an, um dein Profil und deine Links zu verwalten.'}
          </p>
        </div>

        <button
          type="button"
          className="btn-google"
          id="btn-google-auth"
          onClick={handleGoogleLogin}
          disabled={loading}
        >
          <svg className="google-icon" viewBox="0 0 24 24" width="18" height="18">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
            />
          </svg>
          <span>Mit Google fortfahren</span>
        </button>

        <div className="auth-separator">
          <span>oder mit E-Mail</span>
        </div>

        {error && (
          <div className="auth-error-banner" id="auth-error-alert">
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="auth-form" id="auth-form-credentials">
          {isRegister && (
            <div className="form-group">
              <label htmlFor="reg-name">Name</label>
              <div className="input-with-icon">
                <User size={16} className="input-icon" />
                <input
                  id="reg-name"
                  type="text"
                  placeholder="z.B. Alex Schmidt"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={loading}
                />
              </div>
            </div>
          )}

          <div className="form-group">
            <label htmlFor="auth-email">E-Mail-Adresse</label>
            <div className="input-with-icon">
              <Mail size={16} className="input-icon" />
              <input
                id="auth-email"
                type="email"
                required
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="auth-password">Passwort</label>
            <div className="input-with-icon">
              <Lock size={16} className="input-icon" />
              <input
                id="auth-password"
                type="password"
                required
                minLength={6}
                placeholder="Mindestens 6 Zeichen"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
              />
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-full"
            id="btn-auth-submit"
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 size={16} className="spin" />
                <span>Bitte warten …</span>
              </>
            ) : isRegister ? (
              'Kostenlos registrieren'
            ) : (
              'Anmelden'
            )}
          </button>
        </form>

        <div className="auth-footer">
          <button
            type="button"
            className="btn-link"
            id="btn-toggle-auth-mode"
            onClick={() => {
              setIsRegister(!isRegister);
              setError('');
            }}
          >
            {isRegister
              ? 'Bereits einen Account? Hier anmelden'
              : 'Noch kein Account? Kostenlos registrieren'}
          </button>
        </div>
      </div>
    </div>
  );
}
