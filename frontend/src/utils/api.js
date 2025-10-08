// Resolve API base URL for both Vite and CRA/webpack builds
// - Vite: import.meta.env.VITE_API_URL
// - CRA: process.env.REACT_APP_API_URL or process.env.VITE_API_URL (if configured)
const viteEnv = (typeof import.meta !== 'undefined' && import.meta && import.meta.env) ? import.meta.env : undefined;
const webpackEnv = (typeof process !== 'undefined' && process && process.env) ? process.env : undefined;

const API_BASE_URL = (
  (viteEnv && viteEnv.VITE_API_URL) ||
  (webpackEnv && (webpackEnv.REACT_APP_API_URL || webpackEnv.VITE_API_URL)) ||
  ''
);

export async function apiFetch(path, options = {}) {
  const url = path.startsWith('http') ? path : `${API_BASE_URL}${path}`;
  const defaultHeaders = { 'Content-Type': 'application/json' };
  const headers = { ...defaultHeaders, ...(options.headers || {}) };
  const res = await fetch(url, { ...options, headers });
  return res;
}

export function getApiBaseUrl() {
  return API_BASE_URL;
}


