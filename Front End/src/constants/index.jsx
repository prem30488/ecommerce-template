export const API_BASE_URL = (import.meta.env.VITE_API_BACKEND_URL || 'http://localhost:3000').replace(/\/$/, '');
export const ACCESS_TOKEN = 'accessToken';

const FRONTEND_BASE_URL = import.meta.env.VITE_FRONTEND_URL || window.location.origin;
export const OAUTH2_REDIRECT_URI = `${FRONTEND_BASE_URL}/oauth2/redirect`;
