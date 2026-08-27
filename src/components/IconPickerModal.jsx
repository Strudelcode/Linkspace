import React, { useState, useRef } from 'react';
import {
  X,
  Upload,
  Search,
  User,
  Image as ImageIcon,
  Check,
  Trash2,
  Loader2,
  Sparkles,
  Link2
} from 'lucide-react';
import { STANDARD_ICONS } from '../constants';
import { LinkIcon } from './LinkIcon';
import { uploadLinkIcon } from '../firebase';

export function IconPickerModal({
  isOpen,
  onClose,
  link,
  onSelectIcon,
  userAvatarUrl,
  userDisplayName,
  uid
}) {
  const [activeTab, setActiveTab] = useState('standard'); // 'standard' | 'avatar' | 'custom'
  const [searchQuery, setSearchQuery] = useState('');
  const [customUrlInput, setCustomUrlInput] = useState(link?.customIconUrl || '');
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const fileInputRef = useRef(null);

  if (!isOpen || !link) return null;

  const currentIconType = link.iconType || 'standard';
  const currentIcon = link.icon;

  const filteredIcons = STANDARD_ICONS.filter((item) =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setUploadError('');

    try {
      const url = await uploadLinkIcon(file, uid || 'anonymous', link.id);
      onSelectIcon({
        iconType: 'custom',
        customIconUrl: url,
        icon: null
      });
      onClose();
    } catch (err) {
      setUploadError(err.message || 'Fehler beim Hochladen.');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleApplyCustomUrl = () => {
    if (!customUrlInput.trim()) return;
    onSelectIcon({
      iconType: 'custom',
      customIconUrl: customUrlInput.trim(),
      icon: null
    });
    onClose();
  };

  const handleSelectStandard = (iconId) => {
    onSelectIcon({
      iconType: 'standard',
      icon: iconId,
      customIconUrl: null
    });
    onClose();
  };

  const handleSelectAvatar = () => {
    onSelectIcon({
      iconType: 'avatar',
      icon: null,
      customIconUrl: null
    });
    onClose();
  };

  const handleRemoveIcon = () => {
    onSelectIcon({
      iconType: 'standard',
      icon: 'none',
      customIconUrl: null
    });
    onClose();
  };

  return (
    <div className="modal-backdrop" onClick={onClose} id="icon-picker-modal-backdrop">
      <div
        className="modal-content icon-picker-dialog"
        onClick={(e) => e.stopPropagation()}
        id="icon-picker-dialog"
      >
        <div className="modal-header">
          <div className="modal-title-group">
            <Sparkles size={18} className="text-primary" />
            <div>
              <h4>Icon für "{link.title || 'Link'}" wählen</h4>
              <span className="text-muted text-xs">Wähle ein Standard-Icon, dein Profilbild oder ein eigenes Bild</span>
            </div>
          </div>
          <button type="button" className="btn-modal-close" onClick={onClose} aria-label="Schließen">
            <X size={16} />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="icon-picker-tabs">
          <button
            type="button"
            className={`icon-tab-btn ${activeTab === 'standard' ? 'active' : ''}`}
            onClick={() => setActiveTab('standard')}
          >
            <Sparkles size={14} />
            <span>Standard-Icons</span>
          </button>
          <button
            type="button"
            className={`icon-tab-btn ${activeTab === 'avatar' ? 'active' : ''}`}
            onClick={() => setActiveTab('avatar')}
          >
            <User size={14} />
            <span>Profilbild</span>
          </button>
          <button
            type="button"
            className={`icon-tab-btn ${activeTab === 'custom' ? 'active' : ''}`}
            onClick={() => setActiveTab('custom')}
          >
            <Upload size={14} />
            <span>Eigenes Icon</span>
          </button>
        </div>

        <div className="icon-picker-body">
          {/* Tab 1: Standard Icons */}
          {activeTab === 'standard' && (
            <div className="tab-standard-icons">
              <div className="icon-search-bar">
                <Search size={14} className="search-icon" />
                <input
                  type="text"
                  placeholder="Icons durchsuchen (z.B. YouTube, Instagram, GitHub, Shop) …"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="icon-search-input"
                  autoFocus
                />
              </div>

              <div className="icons-catalog-grid">
                {filteredIcons.map((item) => {
                  const isSelected = currentIconType === 'standard' && currentIcon === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      className={`icon-choice-tile ${isSelected ? 'is-selected' : ''}`}
                      onClick={() => handleSelectStandard(item.id)}
                      title={item.name}
                    >
                      <div className="icon-choice-symbol">
                        <LinkIcon link={{ iconType: 'standard', icon: item.id }} size={22} />
                      </div>
                      <span className="icon-choice-label">{item.name}</span>
                      {isSelected && (
                        <div className="icon-choice-badge">
                          <Check size={10} />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Tab 2: Avatar Icon */}
          {activeTab === 'avatar' && (
            <div className="tab-avatar-choice">
              <div className="avatar-choice-card">
                <div className="avatar-choice-preview">
                  {userAvatarUrl ? (
                    <img src={userAvatarUrl} alt={userDisplayName || 'Avatar'} className="avatar-choice-img" />
                  ) : (
                    <div className="avatar-choice-fallback">
                      {(userDisplayName || 'L').slice(0, 1).toUpperCase()}
                    </div>
                  )}
                </div>
                <div className="avatar-choice-info">
                  <h5>Dein Profilbild verwenden</h5>
                  <p className="text-muted text-xs">
                    Zeigt dein aktuelles Profilbild als Miniatur-Icon direkt auf dem Link-Button an. Ideal für persönliche Kanäle oder Empfehlungen.
                  </p>
                </div>
                <button
                  type="button"
                  className={`btn ${currentIconType === 'avatar' ? 'btn-success' : 'btn-primary'} btn-sm`}
                  onClick={handleSelectAvatar}
                >
                  {currentIconType === 'avatar' ? (
                    <>
                      <Check size={14} />
                      <span>Ausgewählt</span>
                    </>
                  ) : (
                    <span>Als Link-Icon festlegen</span>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Tab 3: Custom Upload / URL */}
          {activeTab === 'custom' && (
            <div className="tab-custom-choice">
              <div className="custom-upload-box">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  accept="image/png, image/jpeg, image/webp, image/svg+xml, image/gif"
                  style={{ display: 'none' }}
                  id="link-icon-file-input"
                />

                <div className="upload-dropzone-view" onClick={() => fileInputRef.current?.click()}>
                  {uploading ? (
                    <div className="center-loader-mini">
                      <Loader2 size={24} className="spin text-primary" />
                      <span className="text-xs text-muted mt-2">Wird hochgeladen …</span>
                    </div>
                  ) : (
                    <>
                      <div className="upload-icon-circle">
                        <Upload size={20} />
                      </div>
                      <span className="upload-title">Eigenes Bild oder Logo hochladen</span>
                      <span className="text-muted text-xs">PNG, JPG, SVG oder WEBP (max. 5 MB)</span>
                    </>
                  )}
                </div>

                {uploadError && <p className="form-error-msg">{uploadError}</p>}
              </div>

              <div className="section-divider-modal">
                <span>Oder Bild-URL einfügen</span>
              </div>

              <div className="custom-url-row">
                <input
                  type="text"
                  className="form-input"
                  placeholder="https://.../mein-icon.png"
                  value={customUrlInput}
                  onChange={(e) => setCustomUrlInput(e.target.value)}
                />
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={handleApplyCustomUrl}
                  disabled={!customUrlInput.trim()}
                >
                  Übernehmen
                </button>
              </div>

              {link.iconType === 'custom' && link.customIconUrl && (
                <div className="current-custom-preview">
                  <span className="text-muted text-xs">Aktuelles Bild:</span>
                  <img src={link.customIconUrl} alt="Vorschau" className="preview-custom-thumb" />
                </div>
              )}
            </div>
          )}
        </div>

        <div className="modal-footer">
          <button
            type="button"
            className="btn btn-ghost btn-sm text-danger"
            onClick={handleRemoveIcon}
            title="Kein Icon für diesen Link anzeigen"
          >
            <Trash2 size={14} />
            <span>Icon entfernen</span>
          </button>
          <button type="button" className="btn btn-secondary btn-sm" onClick={onClose}>
            Schließen
          </button>
        </div>
      </div>
    </div>
  );
}
