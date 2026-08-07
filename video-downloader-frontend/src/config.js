// Central API configuration.
// - In local dev, Vite proxies /api -> http://localhost:8000 (see vite.config.js),
//   so we can use a relative URL and avoid CORS entirely.
// - In production, set VITE_API_URL to the deployed backend origin (e.g.
//   https://api.yoursite.com) OR leave it empty to serve from the same origin
//   (when the backend also serves the built frontend).
const API_URL = import.meta.env.VITE_API_URL || ''

export default API_URL
