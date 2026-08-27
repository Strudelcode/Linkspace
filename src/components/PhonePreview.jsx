import React, { useState } from 'react';
import { ExternalLink, Copy, Check, Share2, Sparkles } from 'lucide-react';
import { FONT_OPTIONS } from '../constants';

export function PhonePreview({ profile }) {
  const [copied, setCopied] = useState(false);

  const styling = profile.styling || {};
  const links = (profile.links || []).filter((l) => l.active !== false);

  // Derive font family
  const selectedFont = FONT_OPTIONS.find((f) => f.id === styling.font) || FONT_OPTIONS[0];

  // Derive background style
  let bgStyle = {};
  if (styling.backgroundType === 'gradient') {
    bgStyle = {
      background: `linear-gradient(${styling.gradientAngle || 180}deg, ${
        styling.gradientStart || '#090a0f'
      }, ${styling.gradientEnd || '#1e1b4b'})`
    };
  } else if (styling.backgroundType === 'image' && styling.backgroundImage) {
    bgStyle = {
      backgroundImage: `url(${styling.backgroundImage})`,
      backgroundSize: 'cover',
      backgroundPosition: 'center'
    };
  } else {
    bgStyle = {
      backgroundColor: styling.background || '#090a0f'
    };
  }

  // Derive button style
  const btnStyle = {
    backgroundColor: styling.button || '#ffffff',
    color: styling.buttonText || '#000000',
    borderRadius: `${styling.radius ?? 12}px`,
    fontFamily: selectedFont.family
  };

  const handleCopyLink = (e) => {
    e.stopPropagation();
    if (!profile.username) return;
    const url = `${window.location.origin}/${profile.username}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="preview-container" id="phone-preview-wrapper">
      <div className="preview-top-bar">
        <span className="preview-badge">LIVE VORSCHAU</span>
        {profile.username && (
          <button
            type="button"
            className="btn-copy-link"
            onClick={handleCopyLink}
            title="Link kopieren"
          >
            {copied ? <Check size={12} /> : <Copy size={12} />}
            <span>{copied ? 'Kopiert!' : `linkspace.dev/${profile.username}`}</span>
          </button>
        )}
      </div>

      <div className="phone-device" id="phone-mockup-frame">
        {/* Hardware details */}
        <div className="phone-speaker" />
        <div className="phone-camera-notch" />

        {/* Screen content */}
        <div
          className="phone-screen"
          style={{
            ...bgStyle,
            fontFamily: selectedFont.family
          }}
        >
          {/* Overlay to ensure text readability if background image */}
          {styling.backgroundType === 'image' && styling.backgroundImage && (
            <div className="phone-bg-overlay" />
          )}

          <div className="phone-content-scrollable">
            {/* Avatar */}
            <div className="profile-header-view">
              <div className="profile-avatar-view">
                {profile.avatarUrl ? (
                  <img
                    src={profile.avatarUrl}
                    alt={profile.displayName || 'Avatar'}
                    className="avatar-image-view"
                  />
                ) : (
                  <div className="avatar-fallback-view">
                    {(profile.displayName || 'L').slice(0, 1).toUpperCase()}
                  </div>
                )}
              </div>

              <h1 className="profile-name-view">
                {profile.displayName || 'Dein Name'}
              </h1>

              {profile.username && (
                <p className="profile-handle-view">@{profile.username}</p>
              )}

              {profile.bio && (
                <p className="profile-bio-view">{profile.bio}</p>
              )}
            </div>

            {/* Links */}
            <div className="profile-links-view">
              {links.length === 0 ? (
                <div className="preview-empty-links">
                  <span>Keine sichtbaren Links</span>
                </div>
              ) : (
                links.map((link) => (
                  <a
                    key={link.id}
                    href={link.url || '#'}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="profile-link-btn"
                    style={btnStyle}
                    onClick={(e) => {
                      if (!link.url || link.url === 'https://') e.preventDefault();
                    }}
                  >
                    <span className="link-title-text">{link.title || 'Unbenannter Link'}</span>
                    <ExternalLink size={14} className="link-arrow-icon" />
                  </a>
                ))
              )}
            </div>

            {/* Footer Branding */}
            <div className="phone-footer-branding">
              <span className="brand-pill-mini">
                <span className="brand-dot" /> Linkspace
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
