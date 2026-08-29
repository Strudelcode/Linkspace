import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

const getBase = () => {
  // 1. Explicit BASE_PATH env (from actions/configure-pages or custom env)
  if (process.env.BASE_PATH !== undefined && process.env.BASE_PATH !== '') {
    let b = process.env.BASE_PATH.trim();
    if (!b.startsWith('/')) b = '/' + b;
    if (!b.endsWith('/')) b = b + '/';
    return b;
  }
  // 2. VITE_BASE_PATH
  if (process.env.VITE_BASE_PATH) {
    let b = process.env.VITE_BASE_PATH.trim();
    if (!b.startsWith('/')) b = '/' + b;
    if (!b.endsWith('/')) b = b + '/';
    return b;
  }
  // 3. GitHub Actions fallback
  if (process.env.GITHUB_ACTIONS === 'true' && process.env.GITHUB_REPOSITORY) {
    const repo = process.env.GITHUB_REPOSITORY.split('/')[1];
    if (repo && !repo.endsWith('.github.io')) {
      return `/${repo}/`;
    }
  }
  // 4. Default for Netlify / local dev
  return './';
};

export default defineConfig({
  plugins: [react()],
  base: getBase(),
  server: {
    host: '0.0.0.0',
    port: 3000,
  },
});

