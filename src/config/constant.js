// Central API base URL configuration
// Exactly driven by API_URL
export const API_BASE_URL = (
  import.meta.env.API_URL ||
  (typeof process !== "undefined" && process.env && process.env.API_URL) ||
  import.meta.env.VITE_API_URL ||
  "http://localhost:8000"
).replace(/\/+$/, "")

export const APIURL = API_BASE_URL
export default API_BASE_URL
