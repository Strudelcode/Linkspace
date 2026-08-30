/**
 * URL and Routing Helper for Linkspace
 * Handles local dev, custom domains, and GitHub Pages repository subpaths (e.g. /Linkspacee).
 */

export function getAppBasename() {
  // If BASE_URL was set during build (e.g. in GitHub Actions via BASE_PATH)
  const envBase = import.meta.env?.BASE_URL;
  if (envBase && envBase !== '/' && envBase !== './') {
    let clean = envBase.replace(/\/+$/, '');
    if (!clean.startsWith('/')) clean = '/' + clean;
    return clean;
  }

  if (typeof window === 'undefined') return '';
  const { hostname, pathname } = window.location;
  // If hosted on GitHub Pages (e.g. username.github.io/Linkspacee/)
  if (hostname.endsWith('github.io')) {
    const segments = pathname.split('/').filter(Boolean);
    if (segments.length > 0) {
      return `/${segments[0]}`;
    }
  }
  return '';
}

export function getAppBaseUrl() {
  if (typeof window === 'undefined') return 'https://linkspace.dev';
  const origin = window.location.origin.replace(/\/+$/, '');
  const basename = getAppBasename();
  return `${origin}${basename}`;
}

export function getPublicProfileUrl(username, customBase) {
  if (!username) return '';
  const base = customBase ? customBase.replace(/\/+$/, '') : getAppBaseUrl();
  return `${base}/${username}`;
}
