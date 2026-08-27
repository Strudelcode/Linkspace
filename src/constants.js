export const DISCORD_SUPPORT_URL = 'https://discord.gg/QW85EaXTgB';

export const STANDARD_ICONS = [
  { id: 'youtube', name: 'YouTube', category: 'social' },
  { id: 'instagram', name: 'Instagram', category: 'social' },
  { id: 'tiktok', name: 'TikTok', category: 'social' },
  { id: 'spotify', name: 'Spotify', category: 'media' },
  { id: 'discord', name: 'Discord', category: 'social' },
  { id: 'github', name: 'GitHub', category: 'developer' },
  { id: 'twitter', name: 'X / Twitter', category: 'social' },
  { id: 'twitch', name: 'Twitch', category: 'media' },
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

export const SOCIAL_PRESETS = [
  { id: 'discord', label: 'Discord', placeholder: 'https://discord.gg/dein-server', icon: 'discord' },
  { id: 'instagram', label: 'Instagram', placeholder: 'https://instagram.com/deinname', icon: 'instagram' },
  { id: 'youtube', label: 'YouTube', placeholder: 'https://youtube.com/@deinkanal', icon: 'youtube' },
  { id: 'tiktok', label: 'TikTok', placeholder: 'https://tiktok.com/@deinname', icon: 'tiktok' },
  { id: 'github', label: 'GitHub', placeholder: 'https://github.com/deinname', icon: 'github' },
  { id: 'twitter', label: 'X / Twitter', placeholder: 'https://x.com/deinname', icon: 'twitter' },
  { id: 'spotify', label: 'Spotify', placeholder: 'https://open.spotify.com/...', icon: 'spotify' },
  { id: 'mail', label: 'E-Mail', placeholder: 'mailto:hallo@example.com', icon: 'mail' }
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
  { id: '1', title: 'Discord Community & Support', url: 'https://discord.gg/QW85EaXTgB', active: true, iconType: 'standard', icon: 'discord' },
  { id: '2', title: 'Meine Webseite', url: 'https://strudelcode.com', active: true, iconType: 'standard', icon: 'globe' },
  { id: '3', title: 'GitHub Profil', url: 'https://github.com/Strudelcode', active: true, iconType: 'standard', icon: 'github' },
  { id: '4', title: 'Instagram', url: 'https://instagram.com', active: true, iconType: 'standard', icon: 'instagram' }
];

export const THEME_PRESETS = [
  {
    id: 'midnight',
    name: 'Midnight Dark',
    desc: 'Edles tiefes Schwarz mit subtilen Kontrasten',
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
      buttonStyle: 'solid',
      buttonShadow: 'subtle',
      buttonHover: 'scale',
      radius: 12,
      font: 'Inter'
    }
  },
  {
    id: 'clean_light',
    name: 'Clean Light',
    desc: 'Minimalistisch, hell & elegant',
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
      buttonStyle: 'solid',
      buttonShadow: 'subtle',
      buttonHover: 'lift',
      radius: 12,
      font: 'Plus Jakarta Sans'
    }
  },
  {
    id: 'cyber_emerald',
    name: 'Cyber Emerald',
    desc: 'Dunkelgrüner Matrix- & Neon-Stil',
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
      buttonStyle: 'solid',
      buttonShadow: 'glow',
      buttonHover: 'glow',
      radius: 16,
      font: 'Plus Jakarta Sans'
    }
  },
  {
    id: 'obsidian_indigo',
    name: 'Obsidian Indigo',
    desc: 'Tiefblau & Violett Gradient',
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
      buttonStyle: 'solid',
      buttonShadow: 'medium',
      buttonHover: 'lift',
      radius: 24,
      font: 'Outfit'
    }
  },
  {
    id: 'sunset_warmth',
    name: 'Sunset Warmth',
    desc: 'Warme Abendrot- & Bernsteintöne',
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
      buttonStyle: 'solid',
      buttonShadow: 'medium',
      buttonHover: 'scale',
      radius: 14,
      font: 'Poppins'
    }
  },
  {
    id: 'editorial_serif',
    name: 'Editorial Serif',
    desc: 'Klassische Buch- & Magazin-Ästhetik',
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
      buttonStyle: 'solid',
      buttonShadow: 'subtle',
      buttonHover: 'scale',
      radius: 8,
      font: 'Playfair Display'
    }
  },
  {
    id: 'glassmorphism_dark',
    name: 'Frosted Glass',
    desc: 'Transluzente Milchglas-Buttons',
    styling: {
      backgroundType: 'gradient',
      background: '#0c101d',
      gradientStart: '#0c101d',
      gradientEnd: '#1a2238',
      gradientAngle: 150,
      backgroundImage: '',
      backgroundBlur: 0,
      backgroundOverlay: 25,
      button: 'rgba(255, 255, 255, 0.12)',
      buttonText: '#ffffff',
      buttonBorder: 'rgba(255, 255, 255, 0.22)',
      buttonStyle: 'glass',
      buttonShadow: 'subtle',
      buttonHover: 'lift',
      radius: 16,
      font: 'Syne'
    }
  },
  {
    id: 'monochrome_terminal',
    name: 'Space Mono',
    desc: 'Matrix Hacker & Cyberpunk',
    styling: {
      backgroundType: 'color',
      background: '#000000',
      gradientStart: '#000000',
      gradientEnd: '#111111',
      gradientAngle: 180,
      backgroundImage: '',
      backgroundBlur: 0,
      backgroundOverlay: 30,
      button: '#121212',
      buttonText: '#22c55e',
      buttonBorder: '#22c55e',
      buttonStyle: 'outline',
      buttonShadow: 'none',
      buttonHover: 'scale',
      radius: 4,
      font: 'Space Mono'
    }
  }
];

export const FONT_OPTIONS = [
  { id: 'Inter', name: 'Inter', subtitle: 'Modern Sans-Serif', family: "'Inter', sans-serif" },
  { id: 'Plus Jakarta Sans', name: 'Plus Jakarta Sans', subtitle: 'Crisp & Modern UI', family: "'Plus Jakarta Sans', sans-serif" },
  { id: 'Outfit', name: 'Outfit', subtitle: 'Geometric & Friendly', family: "'Outfit', sans-serif" },
  { id: 'Poppins', name: 'Poppins', subtitle: 'Modern Round Sans', family: "'Poppins', sans-serif" },
  { id: 'Montserrat', name: 'Montserrat', subtitle: 'Classic Geometric', family: "'Montserrat', sans-serif" },
  { id: 'Syne', name: 'Syne', subtitle: 'Avantgarde & Bold', family: "'Syne', sans-serif" },
  { id: 'DM Sans', name: 'DM Sans', subtitle: 'Minimal & Clean', family: "'DM Sans', sans-serif" },
  { id: 'Playfair Display', name: 'Playfair Display', subtitle: 'Luxury Editorial Serif', family: "'Playfair Display', serif" },
  { id: 'Space Mono', name: 'Space Mono', subtitle: 'Developer Monospace', family: "'Space Mono', monospace" }
];

export const RADIUS_OPTIONS = [
  { label: 'Eckig', value: 0 },
  { label: 'Subtil (8px)', value: 8 },
  { label: 'Medium (14px)', value: 14 },
  { label: 'Rund (22px)', value: 22 },
  { label: 'Pille', value: 9999 }
];

export const BUTTON_STYLE_OPTIONS = [
  { id: 'solid', label: 'Gefüllt', desc: 'Standard Deckend' },
  { id: 'outline', label: 'Kontur (Outline)', desc: 'Transparenter Hintergrund mit Rahmen' },
  { id: 'glass', label: 'Glassmorphism', desc: 'Milchglas-Effekt mit Unschärfe' },
  { id: 'soft', label: 'Soft Tint', desc: 'Leicht getönter Akzent' }
];

export const BUTTON_SHADOW_OPTIONS = [
  { id: 'none', label: 'Keiner' },
  { id: 'subtle', label: 'Subtil' },
  { id: 'medium', label: 'Weich' },
  { id: 'glow', label: 'Glow Schein' },
  { id: 'lift', label: '3D Tiefe' }
];

export const BUTTON_HOVER_OPTIONS = [
  { id: 'scale', label: 'Skalieren (1.02x)' },
  { id: 'lift', label: 'Hochgleiten' },
  { id: 'glow', label: 'Glow Leuchten' },
  { id: 'none', label: 'Kein Effekt' }
];

export const QUICK_COLOR_PALETTES = [
  '#090a0f', '#181b24', '#ffffff', '#0f172a',
  '#3b82f6', '#6366f1', '#10b981', '#f59e0b',
  '#ec4899', '#f97316', '#8b5cf6', '#14b8a6'
];

export const DEFAULT_PROFILE = {
  displayName: 'Dein Name',
  username: '',
  bio: 'Creator · Developer · Tech Enthusiast',
  avatarUrl: '',
  socialLinks: [],
  links: DEFAULT_LINKS,
  styling: THEME_PRESETS[0].styling
};
