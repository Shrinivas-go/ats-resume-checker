/**
 * Backend API base URL (no trailing slash).
 * Set VITE_API_URL on Vercel to your Render service URL, e.g. https://ats-backend-xxxx.onrender.com
 */
const raw = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export const API_URL = raw.replace(/\/+$/, '');

export function apiPath(path) {
  const normalized = path.startsWith('/') ? path : `/${path}`;
  return `${API_URL}${normalized}`;
}

/**
 * User-facing hint when API calls fail with 404
 */
export function getApi404Message(responseData) {
  const body =
    typeof responseData === 'string'
      ? responseData
      : responseData?.message || '';

  if (body.includes('Application not found')) {
    return 'Backend still points to Railway (shut down). Set VITE_API_URL on Vercel to your Render URL and redeploy.';
  }

  if (body.includes('Route not found')) {
    return 'Backend route not found. Check that the latest backend is deployed on Render.';
  }

  return `API returned 404. Set VITE_API_URL to your Render backend (not Vercel). Current base: ${API_URL}`;
}
