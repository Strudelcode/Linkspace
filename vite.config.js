import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

const getBase = () => {
  // 1. Explicit env override (e.g. actions/configure-pages)
  if (process.env.BASE_PATH) return process.env.BASE_PATH;
  if (process.env.VITE_BASE_PATH) return process.env.VITE_BASE_PATH;
  
  // 2. GitHub Actions Pages build with repository name
  if (process.env.GITHUB_ACTIONS === 'true' && process.env.GITHUB_REPOSITORY) {
    const repo = process.env.GITHUB_REPOSITORY.split('/')[1];
    return `/${repo}/`;
  }
  
  // 3. Default root for Netlify, Vercel, and local dev
  return '/';
};

export default defineConfig({
  plugins: [react()],
  base: getBase(),
  server: {
    host: '0.0.0.0',
    port: 3000,
  },
});

