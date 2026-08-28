/**
 * URL and Routing Helper for Linkspace
 * Handles local dev, custom domains, and GitHub Pages repository subpaths (e.g. /Linkspacee).
 */

export function getAppBasename() {
  if (typeof window === 'undefined') return '';
  const { hostname, pathname } = window.location;
  // If hosted on GitHub Pages (e.g. strudelcode.github.io/Linkspacee/)
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
