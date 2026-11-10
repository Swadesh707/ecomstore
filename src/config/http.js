import axios from "axios"
import { API_URL } from "./constant"

const cleanUrl = (url) => {
  const base = String(API_URL || "").replace(/\/+$/, "")
  return `${base}/${String(url || "").replace(/^\/+/, "")}`
}

export const getImageUrl = (img) => {
  if (!img) return ""
  if (img.startsWith("http://") || img.startsWith("https://") || img.startsWith("data:")) {
    return img
  }
  const base = String(API_URL || "").replace(/\/+$/, "")
  return `${base}/${String(img).replace(/^\/+/, "")}`
}

const getAuthHeaders = () => {
  const token = localStorage.getItem("token")
  if (token && token !== "null" && token !== "undefined") {
    return { Authorization: `Bearer ${token}` }
  }
  return {}
}

const requestCache = new Map()
const inFlightRequests = new Map()
const CACHE_TTL_MS = 5 * 60 * 1000

export function GetRequest(url, options = {}) {
  const { bypassCache = false } = options
  const targetUrl = cleanUrl(url)
  const cacheKey = targetUrl

  const now = Date.now()
  if (!bypassCache && requestCache.has(cacheKey)) {
    const entry = requestCache.get(cacheKey)
    if (now - entry.timestamp < CACHE_TTL_MS) {
      return Promise.resolve(entry.data)
    }
    requestCache.delete(cacheKey)
  }

  if (inFlightRequests.has(cacheKey)) {
    return inFlightRequests.get(cacheKey)
  }

  const reqPromise = axios
    .get(targetUrl, {
      headers: getAuthHeaders(),
    })
    .then((response) => {
      requestCache.set(cacheKey, {
        timestamp: Date.now(),
        data: response,
      })
      inFlightRequests.delete(cacheKey)
      return response
    })
    .catch((error) => {
      inFlightRequests.delete(cacheKey)
      throw error
    })

  inFlightRequests.set(cacheKey, reqPromise)
  return reqPromise
}

export function prefetchGet(url) {
  return GetRequest(url).catch(() => {})
}

export function clearApiCache(urlPattern) {
  if (!urlPattern) {
    requestCache.clear()
    return
  }
  for (const key of requestCache.keys()) {
    if (key.includes(urlPattern)) {
      requestCache.delete(key)
    }
  }
}

export function PostRequest(url, body) {
  clearApiCache()
  return axios.post(cleanUrl(url), body, {
    headers: getAuthHeaders(),
  })
}

export function PutRequest(url, body) {
  clearApiCache()
  return axios.put(cleanUrl(url), body, {
    headers: getAuthHeaders(),
  })
}

export function DeleteRequest(url) {
  clearApiCache()
  return axios.delete(cleanUrl(url), {
    headers: getAuthHeaders(),
  })
}

export function UploadRequest(url, formData) {
  clearApiCache()
  return axios.post(cleanUrl(url), formData, {
    headers: {
      ...getAuthHeaders(),
      "Content-Type": "multipart/form-data",
    },
  })
}
