import React, { useState } from 'react';
import { X, ShieldCheck, Sparkles, UserPlus, LogIn, Loader2, AlertCircle, HardDrive, Check, Lock, Mail, User } from 'lucide-react';
import { loginWithGoogle, registerWithEmail, loginWithEmail } from '../firebase';
import { Logo } from './Logo';

export function SaveGuestModal({ profile, onSaveDirectlyAsGuest, onAuthenticatedAndSave, onClose }) {
  const [mode, setMode] = useState('register'); // 'register' | 'login'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState(profile?.displayName || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleGoogleAuth = async () => {
    setError('');
    setLoading(true);
    try {
      const user = await loginWithGoogle();
      if (user) {
        await onAuthenticatedAndSave(user);
        onClose();
      }
    } catch (err) {
      setError(err.message || 'Google Anmeldung fehlgeschlagen.');
    } finally {
      setLoading(false);
    }
  };

  const handleEmailAuth = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      let user;
      if (mode === 'register') {
        user = await registerWithEmail(email, password, displayName || profile.displayName);
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

  const handleLocalGuestSave = () => {
    onSaveDirectlyAsGuest();
    onClose();
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content guest-save-modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-amber-500/10 text-amber-400 rounded-lg border border-amber-500/20">
              <ShieldCheck size={18} />
            </div>
            <div>
              <h3 className="text-base font-semibold text-slate-100">Profil dauerhaft sichern</h3>
              <p className="text-xs text-slate-400">Account erstellen, damit niemand Fremdes deine URL bearbeiten kann.</p>
            </div>
          </div>
          <button
            type="button"
            className="btn-icon"
            onClick={onClose}
            aria-label="Schließen"
          >
            <X size={18} />
          </button>
        </div>

        <div className="guest-save-modal-body">
          <div className="guest-save-callout">
            <Sparkles size={16} className="text-amber-400 shrink-0 mt-0.5" />
            <p className="text-xs text-slate-300 leading-relaxed">
              Deine aktuellen Links, Designs und der Benutzername <strong>@{profile.username || 'username'}</strong> werden automatisch 1:1 in deinen neuen Account übernommen!
            </p>
          </div>

          {/* Google SSO */}
          <button
            type="button"
            className="btn-google w-full"
            onClick={handleGoogleAuth}
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
            <span>1-Klick mit Google sichern</span>
          </button>

          <div className="auth-separator my-3">
            <span>oder mit E-Mail</span>
          </div>

          {error && (
            <div className="auth-error-banner mb-3">
              <div className="flex items-center gap-2">
                <AlertCircle size={15} className="text-red-400 shrink-0" />
                <span className="text-xs text-red-200">{error}</span>
              </div>
            </div>
          )}

          <form onSubmit={handleEmailAuth} className="space-y-3">
            {mode === 'register' && (
              <div className="form-group">
                <label className="text-xs font-medium text-slate-300">Dein Name</label>
                <div className="input-with-icon">
                  <User size={15} className="input-icon" />
                  <input
                    type="text"
                    className="form-input text-sm"
                    placeholder="Dein Name"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                  />
                </div>
              </div>
            )}

            <div className="form-group">
              <label className="text-xs font-medium text-slate-300">E-Mail</label>
              <div className="input-with-icon">
                <Mail size={15} className="input-icon" />
                <input
                  type="email"
                  className="form-input text-sm"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label className="text-xs font-medium text-slate-300">Passwort</label>
              <div className="input-with-icon">
                <Lock size={15} className="input-icon" />
                <input
                  type="password"
                  className="form-input text-sm"
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
              className="btn btn-primary w-full btn-md mt-2"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 size={15} className="spin" />
                  <span>Wird verknüpft & gespeichert …</span>
                </>
              ) : mode === 'register' ? (
                <>
                  <UserPlus size={15} />
                  <span>Kostenlos registrieren & speichern</span>
                </>
              ) : (
                <>
                  <LogIn size={15} />
                  <span>Anmelden & Profil übertragen</span>
                </>
              )}
            </button>
          </form>

          <div className="mt-3 flex items-center justify-between text-xs text-slate-400">
            <button
              type="button"
              className="hover:text-slate-200 text-xs underline"
              onClick={() => {
                setMode(mode === 'register' ? 'login' : 'register');
                setError('');
              }}
            >
              {mode === 'register' ? 'Bereits einen Account? Hier anmelden' : 'Noch kein Account? Neu registrieren'}
            </button>

            <button
              type="button"
              className="hover:text-amber-300 text-xs flex items-center gap-1 text-slate-400 transition-colors"
              onClick={handleLocalGuestSave}
              title="Speichert nur in diesem Browser"
            >
              <HardDrive size={12} />
              <span>Nur lokal speichern</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
