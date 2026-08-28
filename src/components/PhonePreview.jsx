import React, { useState, useEffect } from 'react';
import { ExternalLink, Copy, Check, Share2, Sparkles, QrCode } from 'lucide-react';
import { FONT_OPTIONS } from '../constants';
import { LinkIcon } from './LinkIcon';
import { Logo } from './Logo';
import { applyCustomFont, getFontFamilyString, computeButtonStyle } from '../utils/fontLoader';
import { QrCodeModal } from './QrCodeModal';

export function PhonePreview({ profile }) {
  const [copied, setCopied] = useState(false);
  const [showQrModal, setShowQrModal] = useState(false);

  const styling = profile.styling || {};
  const links = (profile.links || []).filter((l) => l.active !== false);

  // Apply custom font if available
  useEffect(() => {
    if (styling.customFont) {
      applyCustomFont(styling.customFont);
    }
  }, [styling.customFont]);

  const activeFontFamily = getFontFamilyString(styling, FONT_OPTIONS);
  const { style: computedBtnStyle, hoverClass } = computeButtonStyle(styling, FONT_OPTIONS);

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
      backgroundColor: '#090a0f'
    };
  } else {
    bgStyle = {
      backgroundColor: styling.background || '#090a0f'
    };
  }

  const handleCopyLink = (e) => {
    e.stopPropagation();
    if (!profile.username) return;
    const cleanOrigin = window.location.origin;
    const url = cleanOrigin.includes('#') ? `${cleanOrigin}/${profile.username}` : `${cleanOrigin}/#/${profile.username}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const overlayOpacity = (styling.backgroundOverlay ?? 35) / 100;
  const blurAmount = styling.backgroundBlur ?? 0;

  return (
    <div className="preview-container" id="phone-preview-wrapper">
      <div className="preview-top-bar">
        <span className="preview-badge">LIVE VORSCHAU</span>
        
        <div className="flex items-center gap-2">
          {profile.username && (
            <>
              <button
                type="button"
                className="btn-preview-tool"
                onClick={() => setShowQrModal(true)}
                title="QR-Code anzeigen"
              >
                <QrCode size={13} />
                <span>QR-Code</span>
              </button>

              <button
                type="button"
                className="btn-copy-link"
                onClick={handleCopyLink}
                title="Link kopieren"
              >
                {copied ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
                <span>{copied ? 'Kopiert!' : `@${profile.username}`}</span>
              </button>
            </>
          )}
        </div>
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
            fontFamily: activeFontFamily
          }}
        >
          {/* Background image layer with blur support */}
          {styling.backgroundType === 'image' && styling.backgroundImage && (
            <div
              className="phone-bg-image-layer"
              style={{
                backgroundImage: `url(${styling.backgroundImage})`,
                filter: blurAmount > 0 ? `blur(${blurAmount}px)` : 'none',
                transform: blurAmount > 0 ? 'scale(1.08)' : 'none'
              }}
            />
          )}

          {/* Overlay to ensure high text readability over background images */}
          {styling.backgroundType === 'image' && styling.backgroundImage && (
            <div
              className="phone-bg-overlay"
              style={{
                backgroundColor: `rgba(0, 0, 0, ${overlayOpacity})`
              }}
            />
          )}

          <div className="phone-content-scrollable">
            {/* Avatar & Info */}
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

              <h1 className="profile-name-view" style={{ fontFamily: activeFontFamily }}>
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
                links.map((link) => {
                  const showIcon = link.icon !== 'none';
                  return (
                    <a
                      key={link.id}
                      href={link.url || '#'}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`profile-link-btn ${showIcon ? 'has-icon' : ''} ${hoverClass}`}
                      style={computedBtnStyle}
                      onClick={(e) => {
                        if (!link.url || link.url === 'https://') e.preventDefault();
                      }}
                    >
                      {showIcon && (
                        <div className="btn-icon-leading">
                          <LinkIcon
                            link={link}
                            userAvatarUrl={profile.avatarUrl}
                            userDisplayName={profile.displayName}
                            size={18}
                          />
                        </div>
                      )}
                      <span className="btn-label-center">{link.title || 'Neuer Link'}</span>
                      <div className="btn-icon-trailing">
                        <ExternalLink size={14} />
                      </div>
                    </a>
                  );
                })
              )}
            </div>

            {/* Footer Brand in phone */}
            <div className="phone-footer-brand">
              <div className="footer-brand-pill">
                <Logo size={14} />
                <span>Linkspace</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {showQrModal && profile.username && (
        <QrCodeModal
          username={profile.username}
          displayName={profile.displayName}
          avatarUrl={profile.avatarUrl}
          onClose={() => setShowQrModal(false)}
        />
      )}
    </div>
  );
}
