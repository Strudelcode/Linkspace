import React, { useState } from 'react';
import { loginWithEmail, registerWithEmail, loginWithGoogle, loginAsGuest } from '../firebase';
import { Loader2, AlertCircle, Sparkles, CheckCircle2, Lock, Mail, User, ArrowRight, MessageSquare } from 'lucide-react';
import { Logo } from './Logo';
import { DISCORD_SUPPORT_URL } from '../constants';

export function AuthModal({ onAuthSuccess }) {
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isRegister) {
        await registerWithEmail(email, password, displayName);
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

  const handleGuestLogin = () => {
    setError('');
    loginAsGuest('Mein Linkspace', 'creator');
    if (onAuthSuccess) onAuthSuccess();
  };

  return (
    <div className="auth-fullscreen" id="auth-fullscreen-container">
      <div className="auth-card" id="auth-card-main">
        {/* Rounded Harmonious App Logo Badge (Screenshot 1 Fix) */}
        <div className="auth-header text-center">
          <div className="auth-logo-badge" id="auth-brand-logo-badge">
            <Logo size={46} className="auth-logo-img rounded-xl" />
          </div>
          <h2>{isRegister ? 'Account erstellen' : 'Willkommen bei Linkspace'}</h2>
          <p className="auth-sub">
            {isRegister
              ? 'Erstelle deine persönliche Link-in-Bio Seite in Sekunden.'
              : 'Melde dich an, um dein Profil und deine Links zu verwalten.'}
          </p>
        </div>

        {/* Google SSO */}
        <button
          type="button"
          className="btn-google"
          id="btn-google-auth"
          onClick={handleGoogleLogin}
          disabled={loading}
        >
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
          <span>Mit Google fortfahren</span>
        </button>

        <div className="auth-separator">
          <span>oder mit E-Mail</span>
        </div>

        {error && (
          <div className="auth-error-banner" id="auth-error-alert">
            <div className="flex items-start gap-2.5">
              <AlertCircle size={16} className="text-red-400 shrink-0 mt-0.5" />
              <div className="flex-1">
                <span className="block font-medium">{error}</span>
                <button
                  type="button"
                  onClick={handleGuestLogin}
                  className="auth-error-fallback-link mt-1.5"
                >
                  <Sparkles size={12} className="text-amber-400" />
                  <span>Direkt als Gast starten & alle Features nutzen</span>
                </button>
              </div>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="auth-form" id="auth-form-credentials">
          {isRegister && (
            <div className="form-group">
              <label>Dein Name</label>
              <div className="input-with-icon">
                <User size={16} className="input-icon" />
                <input
                  type="text"
                  placeholder="z.B. Alex Schmidt"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  required={isRegister}
                />
              </div>
            </div>
          )}

          <div className="form-group">
            <label>E-Mail-Adresse</label>
            <div className="input-with-icon">
              <Mail size={16} className="input-icon" />
              <input
                type="email"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label>Passwort</label>
            <div className="input-with-icon">
              <Lock size={16} className="input-icon" />
              <input
                type="password"
                placeholder="Mindestens 6 Zeichen"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
              />
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-auth-submit"
            id="btn-submit-auth"
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 size={16} className="spin" />
                <span>Bitte warten …</span>
              </>
            ) : (
              <span>{isRegister ? 'Kostenlos registrieren' : 'Anmelden'}</span>
            )}
          </button>
        </form>

        <div className="auth-footer-flow">
          <button
            type="button"
            className="btn-toggle-mode"
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

          {/* High-Contrast Beautiful Guest Login Card (Screenshot 2 Fix) */}
          <div className="auth-guest-section" id="auth-guest-box">
            <div className="auth-guest-divider">
              <span>Keine Lust auf Registrierung?</span>
            </div>
            
            <button
              type="button"
              onClick={handleGuestLogin}
              className="btn-guest-card"
              id="btn-guest-mode"
            >
              <div className="guest-card-left">
                <div className="guest-icon-pill">
                  <Sparkles size={14} className="text-amber-300" />
                </div>
                <div className="guest-card-texts">
                  <span className="guest-card-title">Ohne Anmeldung als Gast ausprobieren</span>
                  <span className="guest-card-desc">Sofort loslegen, alle Links & Designs frei testen</span>
                </div>
              </div>
              <ArrowRight size={16} className="guest-arrow" />
            </button>
          </div>

          {/* Discord Community Support Link */}
          <div className="auth-support-link-box">
            <a
              href={DISCORD_SUPPORT_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="auth-discord-link"
              title="Discord Support Community"
            >
              <MessageSquare size={13} className="text-indigo-400" />
              <span>Fragen oder Support? Tritt unserer Discord-Community bei</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
