import { Navigate } from "react-router-dom"

export const UserRoute = ({ children }) => {
  const token = localStorage.getItem("token")
  if (!token) {
    return <Navigate to="/login" replace />
  }
  return children
}

export const AdminRoute = ({ children }) => {
  const token = localStorage.getItem("token")
  const role = (localStorage.getItem("role") || "").toLowerCase().trim()

  if (!token) {
    return <Navigate to="/login" replace />
  }

  if (role !== "admin") {
    return <Navigate to="/" replace />
  }
  return children
}

export const SalespersonRoute = ({ children }) => {
  const token = localStorage.getItem("token")
  const role = (localStorage.getItem("role") || "").toLowerCase().trim()

  if (!token) {
    return <Navigate to="/login" replace />
  }

  if (role !== "salesperson" && role !== "admin") {
    return <Navigate to="/" replace />
  }
  return children
}

export const LogisticsRoute = ({ children }) => {
  const token = localStorage.getItem("token")
  const role = (localStorage.getItem("role") || "").toLowerCase().trim()

  if (!token) {
    return <Navigate to="/login" replace />
  }

  if (role !== "logistics" && role !== "admin") {
    return <Navigate to="/" replace />
  }
  return children
}

export default UserRoute
