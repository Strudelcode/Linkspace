import React, { useState } from 'react';
import {
  loginWithEmail,
  registerWithEmail,
  loginWithGoogle,
  loginWithGithub,
  loginAsGuest
} from '../firebase';
import { Loader2, AlertCircle, Sparkles, CheckCircle2, Lock, Mail, User, ArrowRight, MessageSquare } from 'lucide-react';
import { Logo } from './Logo';
import { DISCORD_SUPPORT_URL } from '../constants';

export function AuthModal({ onAuthSuccess }) {
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingProvider, setLoadingProvider] = useState(null);
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

  const handleOAuthLogin = async (providerName, loginFn) => {
    setError('');
    setLoading(true);
    setLoadingProvider(providerName);
    try {
      await loginFn();
      if (onAuthSuccess) onAuthSuccess();
    } catch (err) {
      setError(err.message || `${providerName} Login fehlgeschlagen.`);
    } finally {
      setLoading(false);
      setLoadingProvider(null);
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
        {/* Rounded Harmonious App Logo Badge */}
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

        {/* OAuth SSO Buttons Container */}
        <div className="auth-sso-group">
          {/* Google SSO Button */}
          <button
            type="button"
            className="btn-google"
            id="btn-google-auth"
            onClick={() => handleOAuthLogin('Google', loginWithGoogle)}
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
            <span>Mit Google fortfahren</span>
          </button>

          {/* GitHub SSO Button */}
          <button
            type="button"
            className="btn-github"
            id="btn-github-auth"
            onClick={() => handleOAuthLogin('GitHub', loginWithGithub)}
            disabled={loading}
          >
            {loadingProvider === 'GitHub' ? (
              <Loader2 size={18} className="spin text-slate-200" />
            ) : (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
              </svg>
            )}
            <span>Mit GitHub fortfahren</span>
          </button>
        </div>

        <div className="auth-separator">
          <span>oder mit E-Mail</span>
        </div>

        {error && (
          <div className="auth-error-banner" id="auth-error-alert">
            <div className="flex items-start gap-2.5">
              <AlertCircle size={16} className="text-red-400 shrink-0 mt-0.5" />
              <div className="flex-1 text-left">
                <span className="block font-medium leading-snug">{error}</span>
                <div className="flex items-center gap-2 mt-2">
                  <button
                    type="button"
                    onClick={handleGuestLogin}
                    className="auth-error-fallback-link"
                  >
                    <Sparkles size={12} className="text-amber-400" />
                    <span>Als Gast ohne Registrierung starten</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="auth-form" id="auth-form-email">
          {isRegister && (
            <div className="form-group">
              <label className="form-label" htmlFor="auth-display-name">
                Dein Name oder Künstlername
              </label>
              <div className="input-with-icon">
                <User size={16} className="input-icon text-muted" />
                <input
                  id="auth-display-name"
                  type="text"
                  className="form-input"
                  placeholder="z. B. Max Mustermann"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  required={isRegister}
                  autoComplete="name"
                />
              </div>
            </div>
          )}

          <div className="form-group">
            <label className="form-label" htmlFor="auth-email-input">
              E-Mail-Adresse
            </label>
            <div className="input-with-icon">
              <Mail size={16} className="input-icon text-muted" />
              <input
                id="auth-email-input"
                type="email"
                className="form-input"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="auth-password-input">
              Passwort
            </label>
            <div className="input-with-icon">
              <Lock size={16} className="input-icon text-muted" />
              <input
                id="auth-password-input"
                type="password"
                className="form-input"
                placeholder={isRegister ? 'Mindestens 6 Zeichen' : '••••••••'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                autoComplete={isRegister ? 'new-password' : 'current-password'}
              />
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-full py-2.5 mt-2"
            id="btn-submit-auth"
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

          <button
            type="button"
            className="auth-toggle-btn"
            id="btn-toggle-auth-mode"
            onClick={() => {
              setError('');
              setIsRegister(!isRegister);
            }}
          >
            {isRegister
              ? 'Bereits einen Account? Hier anmelden'
              : 'Noch kein Account? Kostenlos registrieren'}
          </button>

          {/* High-Contrast Beautiful Guest Login Card */}
          <div className="auth-guest-section" id="auth-guest-box">
            <div className="auth-guest-divider">
              <span>Keine Lust auf Registrierung?</span>
            </div>
            <button
              type="button"
              className="btn-guest-card"
              id="btn-guest-login-card"
              onClick={handleGuestLogin}
            >
              <div className="guest-card-left">
                <div className="guest-icon-badge">
                  <Sparkles size={16} className="text-amber-400" />
                </div>
                <div className="guest-card-text">
                  <span className="guest-card-title">Ohne Anmeldung als Gast ausprobieren</span>
                  <span className="guest-card-sub">Sofort loslegen, alle Links & Designs frei testen</span>
                </div>
              </div>
              <ArrowRight size={16} className="guest-card-arrow" />
            </button>
          </div>

          {/* Discord Community Footer Link */}
          <div className="auth-discord-link-box">
            <a
              href={DISCORD_SUPPORT_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="auth-discord-link"
              id="auth-footer-discord-link"
            >
              <MessageSquare size={13} className="text-indigo-400" />
              <span>Fragen oder Support? Tritt unserer Discord-Community bei</span>
            </a>
          </div>
        </form>
      </div>
    </div>
  );
}
