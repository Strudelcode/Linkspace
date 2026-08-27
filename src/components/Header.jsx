import React, { useState } from 'react';
import { ExternalLink, Save, LogOut, Check, Loader2, Sparkles, User, AlertCircle, MessageSquare, QrCode } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Logo } from './Logo';
import { DISCORD_SUPPORT_URL } from '../constants';
import { QrCodeModal } from './QrCodeModal';

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
  const [showQrModal, setShowQrModal] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const publicUrl = profile.username ? `/${profile.username}` : null;

  const handleConfirmLogout = () => {
    setShowLogoutConfirm(false);
    onLogout();
  };

  return (
    <header className="header" id="app-header">
      <div className="header-left">
        <Link to="/" className="logo-brand" id="header-logo-link">
          <Logo size={26} />
          <span className="logo-text">Linkspace</span>
        </Link>
        {profile.username && (
          <span className="username-pill">
            @{profile.username}
          </span>
        )}
      </div>

      <div className="header-right">
        {/* Discord Support Server Link */}
        <a
          href={DISCORD_SUPPORT_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="btn-discord-header"
          id="btn-header-discord"
          title="Hilfe & Feedback im Discord Server"
        >
          <MessageSquare size={14} className="text-indigo-400" />
          <span className="hidden-mobile">Discord Support</span>
        </a>

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

        {publicUrl && (
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={() => setShowQrModal(true)}
            title="QR-Code anzeigen"
            id="btn-header-qr"
          >
            <QrCode size={14} />
            <span className="hidden-mobile">QR-Code</span>
          </button>
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
              onClick={() => setShowLogoutConfirm(true)}
              title="Abmelden"
              aria-label="Abmelden"
            >
              <LogOut size={16} />
            </button>
          </div>
        )}
      </div>

      {/* Logout Confirmation Modal */}
      {showLogoutConfirm && (
        <div className="modal-backdrop" onClick={() => setShowLogoutConfirm(false)}>
          <div className="modal-content" style={{ maxWidth: '400px' }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 style={{ fontSize: '16px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <LogOut size={18} className="text-amber-400" />
                <span>Wirklich abmelden?</span>
              </h3>
            </div>
            <div style={{ padding: '20px 22px' }}>
              <p style={{ color: 'var(--text-secondary)', fontSize: '13.5px', lineHeight: '1.5' }}>
                Möchtest du dich wirklich von deinem Account abmelden? Ungespeicherte Änderungen gehen dabei verloren.
              </p>
            </div>
            <div className="modal-footer" style={{ justifyContent: 'flex-end', gap: '10px' }}>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => setShowLogoutConfirm(false)}
              >
                Abbrechen
              </button>
              <button
                type="button"
                className="btn btn-danger btn-sm"
                style={{ background: '#ef4444', borderColor: '#ef4444', color: '#ffffff' }}
                onClick={handleConfirmLogout}
              >
                Ja, abmelden
              </button>
            </div>
          </div>
        </div>
      )}

      {showQrModal && profile.username && (
        <QrCodeModal
          username={profile.username}
          displayName={profile.displayName}
          avatarUrl={profile.avatarUrl}
          onClose={() => setShowQrModal(false)}
        />
      )}
    </header>
  );
}
