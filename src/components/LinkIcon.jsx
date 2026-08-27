import React from 'react';
import {
  Youtube,
  Instagram,
  Github,
  Twitter,
  Twitch,
  Linkedin,
  Facebook,
  Mail,
  Globe,
  ShoppingBag,
  Headphones,
  BookOpen,
  Sparkles,
  Heart,
  Coffee,
  Camera,
  Code,
  Send,
  Star,
  User,
  ExternalLink
} from 'lucide-react';

/**
 * Auto-detect matching icon based on entered URL
 */
export function detectIconFromUrl(url = '') {
  const norm = url.trim().toLowerCase();
  if (!norm) return null;

  if (norm.includes('youtube.com') || norm.includes('youtu.be')) return 'youtube';
  if (norm.includes('instagram.com')) return 'instagram';
  if (norm.includes('tiktok.com')) return 'tiktok';
  if (norm.includes('spotify.com') || norm.includes('open.spotify.com')) return 'spotify';
  if (norm.includes('github.com')) return 'github';
  if (norm.includes('twitter.com') || norm.includes('x.com')) return 'twitter';
  if (norm.includes('twitch.tv')) return 'twitch';
  if (norm.includes('discord.gg') || norm.includes('discord.com')) return 'discord';
  if (norm.includes('linkedin.com')) return 'linkedin';
  if (norm.includes('facebook.com') || norm.includes('fb.com')) return 'facebook';
  if (norm.includes('t.me') || norm.includes('telegram.me')) return 'telegram';
  if (norm.includes('patreon.com')) return 'patreon';
  if (norm.includes('buymeacoffee.com') || norm.includes('ko-fi.com')) return 'coffee';
  if (norm.startsWith('mailto:')) return 'mail';
  if (norm.includes('shop') || norm.includes('store') || norm.includes('merch') || norm.includes('etsy.com') || norm.includes('gumroad.com')) return 'shopping-bag';
  if (norm.includes('medium.com') || norm.includes('substack.com') || norm.includes('blog')) return 'book-open';
  if (norm.includes('podcast') || norm.includes('apple.com/podcast') || norm.includes('anchor.fm')) return 'headphones';

  return 'globe';
}

/**
 * Render custom SVG icons for specific platforms (TikTok, Spotify, Discord, X)
 */
function PlatformSvg({ type, size = 18 }) {
  if (type === 'tiktok') {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
        <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.24 1.07-.14 1.61.24 1.14 1.18 2.07 2.3 2.34 1.05.27 2.21-.01 2.99-.77.58-.55.91-1.33.94-2.13.04-4.83.02-9.67.03-14.51h-.03z" />
      </svg>
    );
  }

  if (type === 'spotify') {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.5 17.3c-.2.3-.6.4-.9.2-2.5-1.5-5.6-1.8-9.3-1-.4.1-.7-.2-.8-.5-.1-.4.2-.7.5-.8 4.1-.9 7.6-.6 10.3 1.1.4.2.5.6.2 1zm1.5-3.3c-.3.4-.8.5-1.2.3-3-1.8-7.5-2.3-11-1.2-.4.1-.9-.1-1-.5-.1-.4.1-.9.5-1 4-1.2 9-.6 12.4 1.4.4.3.5.8.3 1.2zm.1-3.4C15.5 8.4 9.6 8.2 6.2 9.2c-.5.2-1.1-.1-1.3-.6-.2-.5.1-1.1.6-1.3 4-1.2 10.5-1 14.6 1.4.5.3.6.9.3 1.4-.2.4-.8.6-1.3.3z" />
      </svg>
    );
  }

  if (type === 'discord') {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
        <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994.021-.041.001-.09-.041-.106a13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.929 1.793 8.18 1.793 12.061 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.894.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.028zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
      </svg>
    );
  }

  return null;
}

/**
 * Universal Link Icon Renderer
 */
export function LinkIcon({
  link,
  userAvatarUrl = '',
  userDisplayName = '',
  size = 18,
  className = ''
}) {
  if (!link) return null;

  // 1. User Avatar option
  if (link.iconType === 'avatar') {
    if (userAvatarUrl) {
      return (
        <img
          src={userAvatarUrl}
          alt="Avatar icon"
          className={`link-icon-avatar-img ${className}`}
          style={{ width: size + 4, height: size + 4, borderRadius: '50%', objectFit: 'cover' }}
        />
      );
    }
    return (
      <div
        className={`link-icon-avatar-fallback ${className}`}
        style={{
          width: size + 4,
          height: size + 4,
          borderRadius: '50%',
          display: 'grid',
          placeItems: 'center',
          fontSize: Math.max(10, size - 6),
          fontWeight: 'bold',
          background: 'rgba(0,0,0,0.15)',
          color: 'inherit'
        }}
      >
        {(userDisplayName || 'L').slice(0, 1).toUpperCase()}
      </div>
    );
  }

  // 2. Custom Uploaded Icon / Image
  if (link.iconType === 'custom' && link.customIconUrl) {
    return (
      <img
        src={link.customIconUrl}
        alt={link.title || 'Link icon'}
        className={`link-icon-custom-img ${className}`}
        style={{
          width: size + 4,
          height: size + 4,
          borderRadius: '6px',
          objectFit: 'cover'
        }}
      />
    );
  }

  // 3. Explicit or Auto Standard Icon
  const iconKey = link.icon || detectIconFromUrl(link.url) || 'globe';

  // Custom SVGs
  if (['tiktok', 'spotify', 'discord'].includes(iconKey)) {
    return (
      <span className={`link-icon-symbol ${className}`} style={{ display: 'inline-flex', alignItems: 'center' }}>
        <PlatformSvg type={iconKey} size={size} />
      </span>
    );
  }

  // Lucide Icons mapping
  const iconProps = { size, className: `link-icon-lucide ${className}` };

  switch (iconKey) {
    case 'youtube':
      return <Youtube {...iconProps} />;
    case 'instagram':
      return <Instagram {...iconProps} />;
    case 'github':
      return <Github {...iconProps} />;
    case 'twitter':
      return <Twitter {...iconProps} />;
    case 'twitch':
      return <Twitch {...iconProps} />;
    case 'linkedin':
      return <Linkedin {...iconProps} />;
    case 'facebook':
      return <Facebook {...iconProps} />;
    case 'mail':
      return <Mail {...iconProps} />;
    case 'shopping-bag':
      return <ShoppingBag {...iconProps} />;
    case 'headphones':
      return <Headphones {...iconProps} />;
    case 'book-open':
      return <BookOpen {...iconProps} />;
    case 'sparkles':
      return <Sparkles {...iconProps} />;
    case 'heart':
      return <Heart {...iconProps} />;
    case 'coffee':
      return <Coffee {...iconProps} />;
    case 'camera':
      return <Camera {...iconProps} />;
    case 'code':
      return <Code {...iconProps} />;
    case 'telegram':
      return <Send {...iconProps} />;
    case 'patreon':
      return <Star {...iconProps} />;
    case 'globe':
    default:
      return <Globe {...iconProps} />;
  }
}
