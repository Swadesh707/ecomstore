import { useState, useEffect } from "react"
import { useNavigate, useLocation, Link } from "react-router-dom"
import { PostRequest } from "../config/http"
import { ArrowLeft, ShieldCheck } from "lucide-react"
import { syncUserWishlistWithDB } from "../utils/cartStore"

export default function Signup({ initialMode }) {
  const navigate = useNavigate()
  const location = useLocation()

  const [authType, setAuthType] = useState(() => {
    if (initialMode) return initialMode
    return location.pathname.includes("signup") ? "signup" : "login"
  })

  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState("")

  const redirectUserByRole = (userRole) => {
    const normalized = (userRole || "user").toLowerCase()
    if (normalized === "admin" || normalized.includes("admin")) {
      navigate("/admin/analytics", { replace: true })
    } else if (normalized === "salesperson") {
      navigate("/salesperson", { replace: true })
    } else if (normalized === "logistics") {
      navigate("/logistics", { replace: true })
    } else {
      navigate("/", { replace: true })
    }
  }

  useEffect(() => {
    const token = localStorage.getItem("token")
    const savedRole = localStorage.getItem("role")
    if (token) {
      redirectUserByRole(savedRole)
    }
  }, [navigate])

  useEffect(() => {
    if (location.pathname.includes("signup")) {
      setAuthType("signup")
    } else if (location.pathname.includes("login")) {
      setAuthType("login")
    }
    setErrorMessage("")
  }, [location.pathname])

  const handleModeChange = (mode) => {
    setAuthType(mode)
    setErrorMessage("")
    if (mode === "signup" && location.pathname !== "/signup") {
      navigate("/signup", { replace: true })
    } else if (mode === "login" && location.pathname !== "/login") {
      navigate("/login", { replace: true })
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setErrorMessage("")

    if (!email.trim() || !password.trim() || (authType === "signup" && !name.trim())) {
      setErrorMessage("Please complete all required fields.")
      return
    }

    try {
      setLoading(true)

      if (authType === "signup") {
        const body = {
          fullName: name.trim(),
          email: email.trim(),
          password: password.trim(),
        }

        const res = await PostRequest("user/create", body)
        const data = res.data

        const resolvedRole = data.role || "user"
        localStorage.setItem("token", data.token)
        localStorage.setItem("role", resolvedRole)
        localStorage.setItem("name", data.fullName || name)
        localStorage.setItem("email", data.email || email)
        localStorage.setItem("id", data.id || "")
        localStorage.setItem("userId", data.id || "")
        window.dispatchEvent(new Event("storage"))
        await syncUserWishlistWithDB()

        redirectUserByRole(resolvedRole)
      } else {
        const body = {
          email: email.trim(),
          password: password.trim(),
        }

        const res = await PostRequest("user/login", body)
        const data = res.data

        const resolvedRole = data.role || "user"
        localStorage.setItem("token", data.token)
        localStorage.setItem("role", resolvedRole)
        localStorage.setItem("name", data.fullName || "")
        localStorage.setItem("email", data.email || "")
        localStorage.setItem("id", data.id || "")
        localStorage.setItem("userId", data.id || "")
        window.dispatchEvent(new Event("storage"))
        await syncUserWishlistWithDB()

        redirectUserByRole(resolvedRole)
      }
    } catch (err) {
      console.error(err)
      setErrorMessage(
        err.response?.data?.message || "Credentials could not be verified by the house."
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#FAF8F5] flex items-center justify-center py-16 px-4 font-sans text-[#1A1816]">
      <div className="max-w-md w-full">
        <div className="bg-[#F2EFE9] border border-[#E5DFD5] p-8 sm:p-10 shadow-xl relative">
          {/* Header */}
          <div className="text-center mb-8">
            <Link
              to="/"
              onClick={() => {
                window.scrollTo({ top: 0, left: 0, behavior: "smooth" })
                document.documentElement.scrollTop = 0
                document.body.scrollTop = 0
              }}
              className="inline-flex items-center gap-2.5 font-serif font-bold text-2xl tracking-[0.25em] mb-3 text-[#1A1816] no-underline cursor-pointer"
            >
              <svg
                width="22"
                height="22"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="text-[#C5A059] shrink-0"
              >
                <path
                  d="M12 2L2 9L12 22L22 9L12 2Z"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinejoin="round"
                />
                <path
                  d="M2 9H22M12 2L7 9L12 22L17 9L12 2Z"
                  stroke="currentColor"
                  strokeWidth="1.2"
                  strokeLinejoin="round"
                />
              </svg>
              <span>ECOMSTORE</span>
            </Link>
            <h1 className="font-serif text-2xl sm:text-3xl font-bold tracking-tight uppercase text-[#1A1816]">
              {authType === "login" ? "CLIENT ACCESS" : "CLIENT ENROLLMENT"}
            </h1>
            <p className="text-[10px] text-[#8E877E] mt-1.5 uppercase tracking-[0.25em] font-semibold">
              {authType === "login"
                ? "Enter your credentials to access your private salon"
                : "Register for bespoke invitations and order records"}
            </p>
          </div>

          {/* Error Banner */}
          {errorMessage && (
            <div className="mb-6 p-3 bg-red-50 border border-red-300 text-red-800 text-xs font-normal">
              {errorMessage}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4 text-xs font-semibold uppercase tracking-wider">
            {authType === "signup" && (
              <div>
                <label className="block mb-1.5 text-[#1A1816]">Full Title & Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Lord Edward Sterling"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-[#FAF8F5] border border-[#E5DFD5] px-4 py-3 text-xs focus:outline-none focus:border-[#1A1816] text-[#1A1816]"
                />
              </div>
            )}

            <div>
              <label className="block mb-1.5 text-[#1A1816]">Correspondence Email *</label>
              <input
                type="email"
                required
                placeholder="client@estate.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-[#FAF8F5] border border-[#E5DFD5] px-4 py-3 text-xs focus:outline-none focus:border-[#1A1816] text-[#1A1816]"
              />
            </div>

            <div>
              <label className="block mb-1.5 text-[#1A1816]">Private Passphrase *</label>
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-[#FAF8F5] border border-[#E5DFD5] px-4 py-3 text-xs focus:outline-none focus:border-[#1A1816] text-[#1A1816]"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#1A1816] text-[#FAF8F5] py-4 font-bold uppercase tracking-[0.2em] text-xs hover:bg-[#C5A059] hover:text-[#1A1816] transition-colors mt-6 disabled:opacity-50 cursor-pointer shadow-md"
            >
              {loading
                ? "AUTHENTICATING..."
                : authType === "login"
                ? "SIGN IN TO SALON"
                : "INSCRIBE IN ARCHIVE"}
            </button>
          </form>

          {/* Toggle between Sign in & Sign up */}
          <div className="mt-6 pt-6 border-t border-[#E5DFD5] text-center">
            <button
              type="button"
              onClick={() => handleModeChange(authType === "login" ? "signup" : "login")}
              className="text-xs font-semibold uppercase tracking-[0.18em] text-[#8E877E] hover:text-[#1A1816] underline cursor-pointer"
            >
              {authType === "login"
                ? "Not yet inscribed? Request enrollment"
                : "Already enrolled? Return to sign in"}
            </button>
          </div>

          <div className="mt-4 text-center">
            <Link
              to="/"
              className="inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.2em] text-[#8E877E] hover:text-[#1A1816] no-underline"
            >
              <ArrowLeft size={13} /> Return to Store
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
