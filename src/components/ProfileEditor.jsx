import React, { useState, useEffect, useRef } from 'react';
import { User, AtSign, FileText, Upload, Image as ImageIcon, CheckCircle2, XCircle, Loader2, Trash2 } from 'lucide-react';
import { uploadAvatar, checkUsernameAvailability, validateUsername } from '../firebase';

export function ProfileEditor({ profile, setProfile, uid, initialUsername }) {
  const [avatarLoading, setAvatarLoading] = useState(false);
  const [avatarError, setAvatarError] = useState('');
  const [usernameStatus, setUsernameStatus] = useState({ checking: false, available: true, message: '' });
  const fileInputRef = useRef(null);

  // Debounced username check
  useEffect(() => {
    const raw = (profile.username || '').trim().toLowerCase();
    if (!raw) {
      setUsernameStatus({ checking: false, available: false, message: 'Benutzername ist erforderlich.' });
      return;
    }

    const validation = validateUsername(raw);
    if (!validation.valid) {
      setUsernameStatus({ checking: false, available: false, message: validation.message });
      return;
    }

    if (raw === initialUsername) {
      setUsernameStatus({ checking: false, available: true, message: 'Dein aktueller Benutzername.' });
      return;
    }

    setUsernameStatus({ checking: true, available: false, message: 'Prüfe Verfügbarkeit …' });
    const timer = setTimeout(async () => {
      const res = await checkUsernameAvailability(raw, uid);
      if (res.available) {
        setUsernameStatus({ checking: false, available: true, message: 'Benutzername ist verfügbar!' });
      } else {
        setUsernameStatus({ checking: false, available: false, message: res.reason });
      }
    }, 450);

    return () => clearTimeout(timer);
  }, [profile.username, initialUsername, uid]);

  const handleAvatarFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setAvatarError('');
    setAvatarLoading(true);

    try {
      const downloadUrl = await uploadAvatar(file, uid);
      setProfile((prev) => ({
        ...prev,
        avatarUrl: downloadUrl
      }));
    } catch (err) {
      setAvatarError(err.message || 'Fehler beim Hochladen des Profilbilds.');
    } finally {
      setAvatarLoading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleRemoveAvatar = () => {
    setProfile((prev) => ({
      ...prev,
      avatarUrl: ''
    }));
  };

  const handleUsernameChange = (val) => {
    // Automatically sanitize and enforce lowercase
    const cleaned = val.toLowerCase().replace(/[^a-z0-9_.-]/g, '');
    setProfile((prev) => ({
      ...prev,
      username: cleaned
    }));
  };

  return (
    <div className="panel" id="panel-profile-editor">
      <div className="panel-header">
        <div className="panel-title-group">
          <User size={18} className="panel-icon" />
          <h3>Profil</h3>
        </div>
      </div>

      <div className="panel-body">
        {/* Avatar Upload */}
        <div className="form-group avatar-upload-section">
          <label>Profilbild</label>
          <div className="avatar-row">
            <div className="avatar-preview-box">
              {profile.avatarUrl ? (
                <img
                  src={profile.avatarUrl}
                  alt={profile.displayName || 'Avatar'}
                  className="avatar-img"
                />
              ) : (
                <div className="avatar-placeholder">
                  {(profile.displayName || 'L').slice(0, 1).toUpperCase()}
                </div>
              )}
              {avatarLoading && (
                <div className="avatar-loading-overlay">
                  <Loader2 size={20} className="spin" />
                </div>
              )}
            </div>

            <div className="avatar-actions">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleAvatarFileChange}
                accept="image/png, image/jpeg, image/webp, image/gif"
                style={{ display: 'none' }}
                id="avatar-file-input"
              />
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                id="btn-upload-avatar"
                onClick={() => fileInputRef.current?.click()}
                disabled={avatarLoading}
              >
                <Upload size={14} />
                <span>{profile.avatarUrl ? 'Bild ändern' : 'Bild hochladen'}</span>
              </button>

              {profile.avatarUrl && (
                <button
                  type="button"
                  className="btn btn-ghost btn-sm text-danger"
                  id="btn-remove-avatar"
                  onClick={handleRemoveAvatar}
                  disabled={avatarLoading}
                  title="Bild entfernen"
                >
                  <Trash2 size={14} />
                  <span>Entfernen</span>
                </button>
              )}
              <span className="text-muted text-xs">
                JPG, PNG oder WEBP (max. 5 MB).
              </span>
            </div>
          </div>
          {avatarError && <p className="form-error-msg">{avatarError}</p>}
        </div>

        {/* Display Name */}
        <div className="form-group">
          <label htmlFor="input-display-name">Anzeigename</label>
          <input
            id="input-display-name"
            type="text"
            className="form-input"
            placeholder="z.B. Dein Name oder Brand"
            value={profile.displayName}
            maxLength={60}
            onChange={(e) =>
              setProfile((prev) => ({ ...prev, displayName: e.target.value }))
            }
          />
        </div>

        {/* Username */}
        <div className="form-group">
          <div className="label-with-hint">
            <label htmlFor="input-username">Benutzername (URL)</label>
            <span className="text-muted text-xs">linkspace.dev/{profile.username || 'username'}</span>
          </div>
          <div className="username-input-wrapper">
            <span className="username-prefix">/</span>
            <input
              id="input-username"
              type="text"
              className="form-input username-field"
              placeholder="deinname"
              value={profile.username}
              maxLength={30}
              onChange={(e) => handleUsernameChange(e.target.value)}
            />
            <div className="username-indicator">
              {usernameStatus.checking ? (
                <Loader2 size={16} className="spin text-muted" />
              ) : usernameStatus.available ? (
                <CheckCircle2 size={16} className="text-success" />
              ) : (
                <XCircle size={16} className="text-danger" />
              )}
            </div>
          </div>
          <p
            className={`form-hint ${
              usernameStatus.available ? 'text-success' : 'text-danger'
            }`}
          >
            {usernameStatus.message}
          </p>
        </div>

        {/* Bio */}
        <div className="form-group">
          <div className="label-with-hint">
            <label htmlFor="input-bio">Biografie</label>
            <span className="text-muted text-xs">
              {(profile.bio || '').length}/160
            </span>
          </div>
          <textarea
            id="input-bio"
            className="form-textarea"
            placeholder="Erzähle kurz, wer du bist und was du machst …"
            value={profile.bio}
            maxLength={160}
            rows={3}
            onChange={(e) =>
              setProfile((prev) => ({ ...prev, bio: e.target.value }))
            }
          />
        </div>
      </div>
    </div>
  );
}
