import React from 'react';
import { ExternalLink, Save, LogOut, Check, Loader2, Sparkles, User, AlertCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

export function Header({
  profile,
  isSaving,
  isSaved,
  saveError,
  hasUnsavedChanges,
  onSave,
  user,
  onLogout
}) {
  const publicUrl = profile.username ? `/${profile.username}` : null;

  return (
    <header className="header" id="app-header">
      <div className="header-left">
        <Link to="/" className="logo-brand">
          <div className="logo-icon">L</div>
          <span className="logo-text">Linkspace</span>
        </Link>
        {profile.username && (
          <span className="username-pill">
            @{profile.username}
          </span>
        )}
      </div>

      <div className="header-right">
        {saveError && (
          <div className="save-error-pill" title={saveError}>
            <AlertCircle size={14} />
            <span>{saveError}</span>
          </div>
        )}

        {hasUnsavedChanges && !isSaved && !isSaving && (
          <span className="unsaved-indicator">
            Ungespeicherte Änderungen
          </span>
        )}

        {publicUrl ? (
          <a
            href={publicUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-secondary btn-sm"
            id="btn-open-live-preview"
          >
            <ExternalLink size={14} />
            <span>Öffentliche Seite</span>
          </a>
        ) : (
          <span className="text-muted text-xs hidden-mobile">
            Wähle einen Benutzernamen zur Vorschau
          </span>
        )}

        <button
          className={`btn ${isSaved ? 'btn-success' : 'btn-primary'} btn-sm`}
          id="btn-save-all"
          onClick={onSave}
          disabled={isSaving}
        >
          {isSaving ? (
            <>
              <Loader2 size={14} className="spin" />
              <span>Speichern …</span>
            </>
          ) : isSaved ? (
            <>
              <Check size={14} />
              <span>Gespeichert</span>
            </>
          ) : (
            <>
              <Save size={14} />
              <span>Speichern</span>
            </>
          )}
        </button>

        {user && (
          <div className="user-menu">
            <span className="user-email hidden-mobile" title={user.email}>
              {user.displayName || user.email?.split('@')[0]}
            </span>
            <button
              className="btn-icon"
              id="btn-logout"
              onClick={onLogout}
              title="Abmelden"
              aria-label="Abmelden"
            >
              <LogOut size={16} />
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
