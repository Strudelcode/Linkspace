export const STANDARD_ICONS = [
  { id: 'youtube', name: 'YouTube', category: 'social' },
  { id: 'instagram', name: 'Instagram', category: 'social' },
  { id: 'tiktok', name: 'TikTok', category: 'social' },
  { id: 'spotify', name: 'Spotify', category: 'media' },
  { id: 'github', name: 'GitHub', category: 'developer' },
  { id: 'twitter', name: 'X / Twitter', category: 'social' },
  { id: 'twitch', name: 'Twitch', category: 'media' },
  { id: 'discord', name: 'Discord', category: 'social' },
  { id: 'linkedin', name: 'LinkedIn', category: 'business' },
  { id: 'facebook', name: 'Facebook', category: 'social' },
  { id: 'telegram', name: 'Telegram', category: 'social' },
  { id: 'patreon', name: 'Patreon', category: 'business' },
  { id: 'globe', name: 'Webseite', category: 'general' },
  { id: 'mail', name: 'E-Mail', category: 'contact' },
  { id: 'shopping-bag', name: 'Shop / Merch', category: 'business' },
  { id: 'headphones', name: 'Podcast', category: 'media' },
  { id: 'book-open', name: 'Blog / Artikel', category: 'media' },
  { id: 'sparkles', name: 'Highlights', category: 'general' },
  { id: 'heart', name: 'Support / Spende', category: 'general' },
  { id: 'coffee', name: 'Buy me a Coffee', category: 'business' },
  { id: 'camera', name: 'Portfolio / Fotos', category: 'media' },
  { id: 'code', name: 'Projekte / Dev', category: 'developer' }
];

export const PRESET_BACKGROUND_IMAGES = [
  {
    id: 'abstract_dark_silk',
    name: 'Dark Silk Waves',
    url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80',
    thumb: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=300&q=70'
  },
  {
    id: 'cyber_neon_mesh',
    name: 'Cyber Mesh Glow',
    url: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=1200&q=80',
    thumb: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=300&q=70'
  },
  {
    id: 'deep_space_nebula',
    name: 'Deep Cosmos',
    url: 'https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?auto=format&fit=crop&w=1200&q=80',
    thumb: 'https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?auto=format&fit=crop&w=300&q=70'
  },
  {
    id: 'misty_mountains',
    name: 'Moody Alpine',
    url: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=1200&q=80',
    thumb: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=300&q=70'
  },
  {
    id: 'minimal_architecture',
    name: 'Minimal Geometry',
    url: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80',
    thumb: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=300&q=70'
  },
  {
    id: 'aurora_borealis',
    name: 'Emerald Aurora',
    url: 'https://images.unsplash.com/photo-1531366936337-7c912a4589a7?auto=format&fit=crop&w=1200&q=80',
    thumb: 'https://images.unsplash.com/photo-1531366936337-7c912a4589a7?auto=format&fit=crop&w=300&q=70'
  }
];

export const DEFAULT_LINKS = [
  { id: '1', title: 'Meine Webseite', url: 'https://strudelcode.com', active: true, iconType: 'standard', icon: 'globe' },
  { id: '2', title: 'GitHub Profil', url: 'https://github.com/Strudelcode', active: true, iconType: 'standard', icon: 'github' },
  { id: '3', title: 'Instagram', url: 'https://instagram.com', active: true, iconType: 'standard', icon: 'instagram' },
  { id: '4', title: 'YouTube Kanal', url: 'https://youtube.com', active: true, iconType: 'standard', icon: 'youtube' }
];

export const THEME_PRESETS = [
  {
    id: 'midnight',
    name: 'Midnight Dark',
    styling: {
      backgroundType: 'color',
      background: '#090a0f',
      gradientStart: '#090a0f',
      gradientEnd: '#171923',
      gradientAngle: 180,
      backgroundImage: '',
      backgroundBlur: 0,
      backgroundOverlay: 35,
      button: '#181b24',
      buttonText: '#f8fafc',
      buttonBorder: '#272d3d',
      radius: 12,
      font: 'Inter'
    }
  },
  {
    id: 'clean_light',
    name: 'Clean Light',
    styling: {
      backgroundType: 'color',
      background: '#f8fafc',
      gradientStart: '#ffffff',
      gradientEnd: '#f1f5f9',
      gradientAngle: 180,
      backgroundImage: '',
      backgroundBlur: 0,
      backgroundOverlay: 10,
      button: '#ffffff',
      buttonText: '#0f172a',
      buttonBorder: '#e2e8f0',
      radius: 12,
      font: 'Inter'
    }
  },
  {
    id: 'cyber_emerald',
    name: 'Cyber Emerald',
    styling: {
      backgroundType: 'gradient',
      background: '#051814',
      gradientStart: '#051814',
      gradientEnd: '#0a2d24',
      gradientAngle: 135,
      backgroundImage: '',
      backgroundBlur: 0,
      backgroundOverlay: 30,
      button: '#10b981',
      buttonText: '#022c22',
      buttonBorder: '#34d399',
      radius: 16,
      font: 'Plus Jakarta Sans'
    }
  },
  {
    id: 'obsidian_indigo',
    name: 'Obsidian Indigo',
    styling: {
      backgroundType: 'gradient',
      background: '#0a0d1a',
      gradientStart: '#0a0d1a',
      gradientEnd: '#1e1b4b',
      gradientAngle: 145,
      backgroundImage: '',
      backgroundBlur: 0,
      backgroundOverlay: 30,
      button: '#6366f1',
      buttonText: '#ffffff',
      buttonBorder: '#818cf8',
      radius: 24,
      font: 'Outfit'
    }
  },
  {
    id: 'sunset_warmth',
    name: 'Sunset Warmth',
    styling: {
      backgroundType: 'gradient',
      background: '#1c1110',
      gradientStart: '#2d1512',
      gradientEnd: '#431407',
      gradientAngle: 160,
      backgroundImage: '',
      backgroundBlur: 0,
      backgroundOverlay: 30,
      button: '#f97316',
      buttonText: '#ffffff',
      buttonBorder: '#fb923c',
      radius: 14,
      font: 'Plus Jakarta Sans'
    }
  },
  {
    id: 'editorial_serif',
    name: 'Editorial Serif',
    styling: {
      backgroundType: 'color',
      background: '#0e0e11',
      gradientStart: '#0e0e11',
      gradientEnd: '#1c1b22',
      gradientAngle: 180,
      backgroundImage: '',
      backgroundBlur: 0,
      backgroundOverlay: 30,
      button: '#f4efe6',
      buttonText: '#18171d',
      buttonBorder: '#dcd3c4',
      radius: 8,
      font: 'Playfair Display'
    }
  },
  {
    id: 'monochrome_terminal',
    name: 'Space Mono',
    styling: {
      backgroundType: 'color',
      background: '#000000',
      gradientStart: '#000000',
      gradientEnd: '#111111',
      gradientAngle: 180,
      backgroundImage: '',
      backgroundBlur: 0,
      backgroundOverlay: 30,
      button: '#1a1a1a',
      buttonText: '#22c55e',
      buttonBorder: '#22c55e',
      radius: 4,
      font: 'Space Mono'
    }
  }
];

export const FONT_OPTIONS = [
  { id: 'Inter', name: 'Inter (Modern Sans)', family: "'Inter', sans-serif" },
  { id: 'Plus Jakarta Sans', name: 'Plus Jakarta Sans (Crisp UI)', family: "'Plus Jakarta Sans', sans-serif" },
  { id: 'Outfit', name: 'Outfit (Friendly Geometric)', family: "'Outfit', sans-serif" },
  { id: 'Playfair Display', name: 'Playfair Display (Editorial Serif)', family: "'Playfair Display', serif" },
  { id: 'Space Mono', name: 'Space Mono (Developer Terminal)', family: "'Space Mono', monospace" },
  { id: 'system-ui', name: 'System Default', family: "system-ui, -apple-system, sans-serif" }
];

export const RADIUS_OPTIONS = [
  { label: 'Eckig', value: 0 },
  { label: 'Subtil (8px)', value: 8 },
  { label: 'Medium (14px)', value: 14 },
  { label: 'Rund (22px)', value: 22 },
  { label: 'Pille', value: 9999 }
];

export const DEFAULT_PROFILE = {
  displayName: 'Dein Name',
  username: '',
  bio: 'Creator · Developer · Tech Enthusiast',
  avatarUrl: '',
  links: DEFAULT_LINKS,
  styling: THEME_PRESETS[0].styling
};
