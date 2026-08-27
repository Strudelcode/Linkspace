import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getPublicProfileByUsername } from '../firebase';
import { FONT_OPTIONS, DISCORD_SUPPORT_URL } from '../constants';
import { ExternalLink, Sparkles, Share2, Check, AlertCircle, Home, QrCode, MessageSquare } from 'lucide-react';
import { LinkIcon } from '../components/LinkIcon';
import { Logo } from '../components/Logo';
import { applyCustomFont, getFontFamilyString, computeButtonStyle } from '../utils/fontLoader';
import { QrCodeModal } from '../components/QrCodeModal';

export function PublicProfile() {
  const { username } = useParams();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showQrModal, setShowQrModal] = useState(false);

  useEffect(() => {
    let isMounted = true;

    async function loadData() {
      if (!username) {
        setNotFound(true);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const data = await getPublicProfileByUsername(username);

        if (!isMounted) return;

        if (!data) {
          setNotFound(true);
        } else {
          setProfile(data);
          setNotFound(false);

          if (data.styling?.customFont) {
            applyCustomFont(data.styling.customFont);
          }

          // Dynamic SEO meta tags and page title
          const pageTitle = `${data.displayName || username} (@${data.username}) – Linkspace`;
          document.title = pageTitle;

          // Update description meta tag
          let metaDesc = document.querySelector('meta[name="description"]');
          if (!metaDesc) {
            metaDesc = document.createElement('meta');
            metaDesc.name = 'description';
            document.head.appendChild(metaDesc);
          }
          metaDesc.content = data.bio || `Alle wichtigen Links und Profile von ${data.displayName || username} auf Linkspace.`;
        }
      } catch (err) {
        console.error("Error loading public profile:", err);
        if (isMounted) setNotFound(true);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadData();

    return () => {
      isMounted = false;
      document.title = 'Linkspace – Minimalist Link-in-Bio';
    };
  }, [username]);

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: profile?.displayName || username,
        text: profile?.bio || '',
        url: window.location.href,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (loading) {
    return (
      <div className="public-loading-screen" id="public-profile-loader">
        <div className="loading-spinner-box">
          <div className="pulse-circle" />
          <span>Profil wird geladen …</span>
        </div>
      </div>
    );
  }

  if (notFound || !profile) {
    return (
      <div className="public-404-screen" id="public-profile-404">
        <div className="public-404-card">
          <div className="brand-badge-404">404</div>
          <h1>Profil nicht gefunden</h1>
          <p>
            Der Benutzer <strong>@{username}</strong> existiert noch nicht oder hat sein Profil noch nicht freigeschaltet.
          </p>
          <div className="public-404-actions">
            <Link to="/" className="btn btn-primary">
              <Home size={15} />
              <span>Eigenes Profil erstellen</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const styling = profile.styling || {};
  const activeLinks = (profile.links || []).filter((l) => l.active !== false);
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

  const overlayOpacity = (styling.backgroundOverlay ?? 35) / 100;
  const blurAmount = styling.backgroundBlur ?? 0;

  return (
    <div
      className="public-page-wrapper"
      id="public-profile-view"
      style={{
        ...bgStyle,
        fontFamily: activeFontFamily
      }}
    >
      {/* Background image layer with blur and scale */}
      {styling.backgroundType === 'image' && styling.backgroundImage && (
        <div
          className="public-bg-image-layer"
          style={{
            backgroundImage: `url(${styling.backgroundImage})`,
            filter: blurAmount > 0 ? `blur(${blurAmount}px)` : 'none',
            transform: blurAmount > 0 ? 'scale(1.06)' : 'none'
          }}
        />
      )}

      {/* Dark overlay for contrast */}
      {styling.backgroundType === 'image' && styling.backgroundImage && (
        <div
          className="public-bg-overlay"
          style={{
            backgroundColor: `rgba(0, 0, 0, ${overlayOpacity})`
          }}
        />
      )}

      {/* Top share bar */}
      <div className="public-top-nav">
        <button
          type="button"
          className="btn-share-public mr-2"
          onClick={() => setShowQrModal(true)}
          title="QR-Code anzeigen"
        >
          <QrCode size={13} />
          <span>QR</span>
        </button>

        <button
          type="button"
          className="btn-share-public"
          onClick={handleShare}
          title="Profil teilen oder Link kopieren"
        >
          {copied ? <Check size={14} className="text-emerald-400" /> : <Share2 size={14} />}
          <span>{copied ? 'Kopiert!' : 'Teilen'}</span>
        </button>
      </div>

      <div className="public-profile-container" id="public-profile-content">
        {/* Avatar, Display Name, Bio */}
        <div className="public-profile-header">
          <div className="public-avatar-wrapper">
            {profile.avatarUrl ? (
              <img
                src={profile.avatarUrl}
                alt={profile.displayName || username}
                className="public-avatar-img"
              />
            ) : (
              <div className="public-avatar-initials">
                {(profile.displayName || username || 'L').slice(0, 1).toUpperCase()}
              </div>
            )}
          </div>

          <h1 className="public-profile-name" style={{ fontFamily: activeFontFamily }}>
            {profile.displayName || username}
          </h1>

          <p className="public-profile-handle">@{profile.username}</p>

          {profile.bio && (
            <p className="public-profile-bio">{profile.bio}</p>
          )}
        </div>

        {/* Links List */}
        <div className="public-links-list">
          {activeLinks.length === 0 ? (
            <div className="public-empty-notice">
              <span>Noch keine Links hinterlegt.</span>
            </div>
          ) : (
            activeLinks.map((link) => {
              const showIcon = link.icon !== 'none';
              return (
                <a
                  key={link.id}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`public-link-btn ${showIcon ? 'has-icon' : ''} ${hoverClass}`}
                  style={computedBtnStyle}
                >
                  {showIcon && (
                    <div className="public-btn-icon-leading">
                      <LinkIcon
                        link={link}
                        userAvatarUrl={profile.avatarUrl}
                        userDisplayName={profile.displayName}
                        size={20}
                      />
                    </div>
                  )}
                  <span className="public-btn-label">{link.title}</span>
                  <div className="public-btn-icon-trailing">
                    <ExternalLink size={16} />
                  </div>
                </a>
              );
            })
          )}
        </div>

        {/* Public Footer */}
        <footer className="public-footer">
          <Link to="/" className="public-footer-brand">
            <Logo size={18} />
            <span>Erstelle dein eigenes <strong>Linkspace</strong></span>
          </Link>

          <a
            href={DISCORD_SUPPORT_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="public-discord-support-link"
            title="Discord Support Community"
          >
            <MessageSquare size={13} className="text-indigo-400" />
            <span>Discord Community & Support</span>
          </a>
        </footer>
      </div>

      {showQrModal && (
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
