/**
 * Custom Font Loader & Manager
 */
const INJECTED_FONTS = new Set();

export function applyCustomFont(customFont) {
  if (!customFont || !customFont.dataUrl || !customFont.family) {
    return;
  }

  const fontId = `custom-font-style-${customFont.family.replace(/[^a-zA-Z0-9_-]/g, '_')}`;
  let styleEl = document.getElementById(fontId);

  if (!styleEl) {
    styleEl = document.createElement('style');
    styleEl.id = fontId;
    document.head.appendChild(styleEl);
  }

  // Detect format from dataUrl or extension
  let format = 'woff2';
  if (customFont.dataUrl.includes('font/ttf') || customFont.dataUrl.includes('application/x-font-ttf') || customFont.name?.endsWith('.ttf')) {
    format = 'truetype';
  } else if (customFont.dataUrl.includes('font/otf') || customFont.dataUrl.includes('application/x-font-opentype') || customFont.name?.endsWith('.otf')) {
    format = 'opentype';
  } else if (customFont.dataUrl.includes('font/woff') || customFont.name?.endsWith('.woff')) {
    format = 'woff';
  }

  styleEl.textContent = `
    @font-face {
      font-family: '${customFont.family}';
      src: url('${customFont.dataUrl}') format('${format}');
      font-weight: 100 900;
      font-style: normal;
      font-display: swap;
    }
  `;

  INJECTED_FONTS.add(customFont.family);
}

export function getFontFamilyString(styling, FONT_OPTIONS) {
  if (styling?.customFont?.family) {
    return `'${styling.customFont.family}', -apple-system, sans-serif`;
  }
  const match = FONT_OPTIONS.find((f) => f.id === styling?.font);
  return match ? match.family : "'Inter', sans-serif";
}

export function computeButtonStyle(styling, FONT_OPTIONS) {
  const fontFamily = getFontFamilyString(styling, FONT_OPTIONS);
  const radius = `${styling?.radius ?? 12}px`;
  const buttonStyle = styling?.buttonStyle || 'solid';
  const shadowType = styling?.buttonShadow || 'subtle';
  const hoverType = styling?.buttonHover || 'scale';

  let backgroundColor = styling?.button || '#ffffff';
  let backgroundImage = 'none';
  let color = styling?.buttonText || '#000000';
  let border = `1px solid ${styling?.buttonBorder || styling?.button || 'transparent'}`;
  let backdropFilter = 'none';

  // Gradient buttons
  if (styling?.buttonGradientEnabled && styling?.buttonGradientStart && styling?.buttonGradientEnd) {
    backgroundImage = `linear-gradient(${styling.buttonGradientAngle || 135}deg, ${styling.buttonGradientStart}, ${styling.buttonGradientEnd})`;
    border = `1px solid ${styling.buttonBorder || styling.buttonGradientStart || 'transparent'}`;
  } else if (buttonStyle === 'outline') {
    backgroundColor = 'transparent';
    border = `1.5px solid ${styling?.button || styling?.buttonText || '#ffffff'}`;
    color = styling?.buttonText || styling?.button || '#ffffff';
  } else if (buttonStyle === 'glass') {
    backgroundColor = styling?.button || 'rgba(255, 255, 255, 0.12)';
    backdropFilter = 'blur(12px)';
    border = `1px solid ${styling?.buttonBorder || 'rgba(255, 255, 255, 0.2)'}`;
  } else if (buttonStyle === 'soft') {
    backgroundColor = styling?.button ? `${styling.button}26` : 'rgba(255, 255, 255, 0.15)';
    border = `1px solid ${styling?.button ? `${styling.button}40` : 'rgba(255, 255, 255, 0.2)'}`;
  }

  let boxShadow = 'none';
  if (shadowType === 'subtle') {
    boxShadow = '0 2px 8px -2px rgba(0, 0, 0, 0.35)';
  } else if (shadowType === 'medium') {
    boxShadow = '0 6px 20px -3px rgba(0, 0, 0, 0.5), 0 2px 6px -1px rgba(0, 0, 0, 0.3)';
  } else if (shadowType === 'glow') {
    boxShadow = `0 0 20px -2px ${styling?.button || styling?.buttonGradientStart || 'rgba(59, 130, 246, 0.6)'}`;
  } else if (shadowType === 'lift') {
    boxShadow = '0 8px 0 0 rgba(0, 0, 0, 0.4), 0 12px 24px rgba(0, 0, 0, 0.3)';
  }

  return {
    style: {
      backgroundColor: backgroundImage !== 'none' ? 'transparent' : backgroundColor,
      backgroundImage,
      color,
      border,
      borderRadius: radius,
      fontFamily,
      backdropFilter,
      WebkitBackdropFilter: backdropFilter,
      boxShadow
    },
    hoverClass: `hover-effect-${hoverType} button-style-${buttonStyle}`
  };
}
