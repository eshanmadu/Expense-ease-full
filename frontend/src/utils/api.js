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

console.log('Environment Debug:', {
  viteEnv: viteEnv ? Object.keys(viteEnv) : 'undefined',
  webpackEnv: webpackEnv ? Object.keys(webpackEnv).filter(k => k.includes('API')) : 'undefined',
  API_BASE_URL
});

export async function apiFetch(path, options = {}) {
  // Use relative path for Vite proxy, or full URL if API_BASE_URL is set
  const url = path.startsWith('http') ? path : (API_BASE_URL ? `${API_BASE_URL}${path}` : path);
  const defaultHeaders = { 'Content-Type': 'application/json' };
  const headers = { ...defaultHeaders, ...(options.headers || {}) };
  
  console.log('API Fetch:', { url, options, headers, API_BASE_URL });
  
  try {
    const res = await fetch(url, { ...options, headers });
    console.log('API Response:', { 
      status: res.status, 
      statusText: res.statusText, 
      url,
      contentType: res.headers.get('content-type')
    });
    
    // Check if response is ok
    if (!res.ok) {
      const errorText = await res.text();
      console.error('API Error Response:', errorText);
      throw new Error(`HTTP ${res.status}: ${res.statusText}`);
    }
    
    return res;
  } catch (error) {
    console.error('API Fetch Error:', { error, url });
    throw error;
  }
}

export function getApiBaseUrl() {
  return API_BASE_URL;
}


