import axios from "axios"
import { APIURL } from "./constant"

const cleanUrl = (url) => `${APIURL}/${String(url || "").replace(/^\/+/, "")}`

const getAuthHeaders = () => {
  const token = localStorage.getItem("token")
  const email = localStorage.getItem("email")
  const name = localStorage.getItem("name")
  const role = localStorage.getItem("role")

  const headers = {}
  if (token && token !== "null" && token !== "undefined") {
    headers.Authorization = `Bearer ${token}`
  }
  if (email && email !== "null" && email !== "undefined") {
    headers["x-user-email"] = email
  }
  if (name && name !== "null" && name !== "undefined") {
    headers["x-user-name"] = name
  }
  if (role && role !== "null" && role !== "undefined") {
    headers["x-user-role"] = role
  }
  return headers
}

export function GetRequest(url) {
  return axios.get(cleanUrl(url), {
    headers: getAuthHeaders(),
  })
}

export function PostRequest(url, body) {
  return axios.post(cleanUrl(url), body, {
    headers: getAuthHeaders(),
  })
}

export function PutRequest(url, body) {
  return axios.put(cleanUrl(url), body, {
    headers: getAuthHeaders(),
  })
}

export function DeleteRequest(url) {
  return axios.delete(cleanUrl(url), {
    headers: getAuthHeaders(),
  })
}

export function UploadRequest(url, formData) {
  return axios.post(cleanUrl(url), formData, {
    headers: {
      ...getAuthHeaders(),
      "Content-Type": "multipart/form-data",
    },
  })
}
