// Central API base URL configuration
// Local: defaults to http://localhost:8000
// Production (Vercel): configure VITE_API_URL or VITE_BACKEND_URL in Vercel environment settings
export const API_BASE_URL = (
  import.meta.env.VITE_API_URL ||
  import.meta.env.VITE_BACKEND_URL ||
  "http://localhost:8000"
).replace(/\/+$/, "")

export const APIURL = API_BASE_URL
export default API_BASE_URL
