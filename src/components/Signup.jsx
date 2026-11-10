import { useState, useEffect } from "react"
import { useNavigate, useLocation, Link } from "react-router-dom"
import { PostRequest } from "../config/http"
import { ArrowLeft, ShieldCheck, KeyRound, CheckCircle2 } from "lucide-react"
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
  const [successMessage, setSuccessMessage] = useState("")

  const [forgotStep, setForgotStep] = useState("none")
  const [otp, setOtp] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [resendTimer, setResendTimer] = useState(0)

  useEffect(() => {
    let interval
    if (resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer((prev) => prev - 1)
      }, 1000)
    }
    return () => clearInterval(interval)
  }, [resendTimer])

  const redirectUserByRole = (userRole) => {
    const searchParams = new URLSearchParams(location.search)
    const redirectParam = searchParams.get("redirect")

    if (redirectParam) {
      navigate(redirectParam, { replace: true })
      return
    }

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
    setSuccessMessage("")
    setForgotStep("none")
    const search = location.search || ""
    if (mode === "signup" && location.pathname !== "/signup") {
      navigate(`/signup${search}`, { replace: true })
    } else if (mode === "login" && location.pathname !== "/login") {
      navigate(`/login${search}`, { replace: true })
    }
  }

  const handleForgotRequest = async (e) => {
    e.preventDefault()
    setErrorMessage("")
    setSuccessMessage("")
    if (!email.trim()) {
      setErrorMessage("Please enter your email address.")
      return
    }
    setLoading(true)
    try {
      const res = await PostRequest("user/forgot-password", { email: email.trim() })
      setSuccessMessage(res.data.message || "Code sent. Check your inbox.")
      setForgotStep("reset")
      setResendTimer(60)
    } catch (err) {
      setErrorMessage(err.response?.data?.message || "Failed to send code.")
    } finally {
      setLoading(false)
    }
  }

  const handleResendOtp = async () => {
    if (resendTimer > 0) return
    setErrorMessage("")
    setSuccessMessage("")
    setLoading(true)
    try {
      const res = await PostRequest("user/forgot-password", { email: email.trim() })
      setSuccessMessage(res.data.message || "New code sent.")
      setResendTimer(60)
    } catch (err) {
      setErrorMessage(err.response?.data?.message || "Failed to resend code.")
    } finally {
      setLoading(false)
    }
  }

  const handleResetPassword = async (e) => {
    e.preventDefault()
    setErrorMessage("")
    setSuccessMessage("")
    if (!otp.trim() || !newPassword.trim()) {
      setErrorMessage("Please complete all fields.")
      return
    }
    setLoading(true)
    try {
      await PostRequest("user/reset-password", {
        email: email.trim(),
        otp: otp.trim(),
        newPassword: newPassword.trim(),
      })
      setForgotStep("none")
      setAuthType("login")
      setOtp("")
      setNewPassword("")
      setSuccessMessage("Password reset. Please sign in.")
    } catch (err) {
      setErrorMessage(err.response?.data?.message || "Failed to reset password.")
    } finally {
      setLoading(false)
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

        {forgotStep !== "none" ? (
            <>
              <div className="text-center mb-8">
                <div className="flex justify-center mb-3">
                  {forgotStep === "request" ? (
                    <KeyRound size={28} className="text-[#C5A059]" />
                  ) : (
                    <ShieldCheck size={28} className="text-[#C5A059]" />
                  )}
                </div>
                <h1 className="font-serif text-2xl sm:text-3xl font-bold tracking-tight uppercase text-[#1A1816]">
                  {forgotStep === "request" ? "RESET PASSWORD" : "VERIFY CODE"}
                </h1>
                <p className="text-[10px] text-[#8E877E] mt-1.5 uppercase tracking-wider font-semibold">
                  {forgotStep === "request"
                    ? "Enter your email to receive a one-time code"
                    : `A 6-digit code was sent to ${email}`}
                </p>
              </div>
              {errorMessage && (
                <div className="mb-6 p-3 bg-red-50 border border-red-300 text-red-800 text-xs font-normal">
                  {errorMessage}
                </div>
              )}
              {successMessage && (
                <div className="mb-6 p-3 bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs font-normal flex items-center gap-2">
                  <CheckCircle2 size={14} className="shrink-0" />
                  {successMessage}
                </div>
              )}
              {forgotStep === "request" && (
                <form onSubmit={handleForgotRequest} className="space-y-4 text-xs font-semibold uppercase tracking-wider">
                  <div>
                    <label className="block mb-1.5 text-[#1A1816]">Email Address *</label>
                    <input
                      type="email"
                      required
                      placeholder="name@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-[#FAF8F5] border border-[#E5DFD5] px-4 py-3 text-xs focus:outline-none focus:border-[#1A1816] text-[#1A1816]"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-[#1A1816] text-[#FAF8F5] py-4 font-bold uppercase tracking-wider text-xs hover:bg-[#C5A059] hover:text-[#1A1816] transition-colors mt-6 disabled:opacity-50 cursor-pointer shadow-md"
                  >
                    {loading ? "SENDING..." : "SEND CODE"}
                  </button>
                </form>
              )}
              {forgotStep === "reset" && (
                <form onSubmit={handleResetPassword} className="space-y-4 text-xs font-semibold uppercase tracking-wider">
                  <div>
                    <label className="block mb-1.5 text-[#1A1816]">One-Time Code *</label>
                    <input
                      type="text"
                      required
                      maxLength={6}
                      placeholder="e.g. 482913"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                      className="w-full bg-[#FAF8F5] border border-[#E5DFD5] px-4 py-3 text-xs focus:outline-none focus:border-[#1A1816] text-[#1A1816] tracking-[0.4em]"
                    />
                  </div>
                  <div>
                    <label className="block mb-1.5 text-[#1A1816]">New Password *</label>
                    <input
                      type="password"
                      required
                      placeholder="••••••••"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full bg-[#FAF8F5] border border-[#E5DFD5] px-4 py-3 text-xs focus:outline-none focus:border-[#1A1816] text-[#1A1816]"
                    />
                  </div>
                  <div className="text-right">
                    <button
                      type="button"
                      onClick={handleResendOtp}
                      disabled={resendTimer > 0 || loading}
                      className={`text-[11px] uppercase tracking-wider font-bold cursor-pointer transition-colors ${
                        resendTimer > 0
                          ? "text-[#8E877E] cursor-not-allowed"
                          : "text-[#C5A059] hover:underline"
                      }`}
                    >
                      {resendTimer > 0 ? `Resend code in ${resendTimer}s` : "Resend Code"}
                    </button>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-[#1A1816] text-[#FAF8F5] py-4 font-bold uppercase tracking-wider text-xs hover:bg-[#C5A059] hover:text-[#1A1816] transition-colors mt-6 disabled:opacity-50 cursor-pointer shadow-md"
                  >
                    {loading ? "RESETTING..." : "RESET PASSWORD"}
                  </button>
                </form>
              )}
              <div className="mt-6 pt-6 border-t border-[#E5DFD5] text-center">
                <button
                  type="button"
                  onClick={() => {
                    setForgotStep("none")
                    setOtp("")
                    setNewPassword("")
                    setErrorMessage("")
                    setSuccessMessage("")
                  }}
                  className="inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.2em] text-[#8E877E] hover:text-[#1A1816] cursor-pointer"
                >
                  <ArrowLeft size={13} /> Back to Sign In
                </button>
              </div>
            </>
          ) : (
            <>
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
                  {authType === "login" ? "SIGN IN" : "CREATE ACCOUNT"}
                </h1>
                <p className="text-[10px] text-[#8E877E] mt-1.5 uppercase tracking-wider font-semibold">
                  {authType === "login"
                    ? "Enter your email and password to sign in"
                    : "Register an account to track your orders"}
                </p>
              </div>
              {errorMessage && (
                <div className="mb-6 p-3 bg-red-50 border border-red-300 text-red-800 text-xs font-normal">
                  {errorMessage}
                </div>
              )}
              {successMessage && (
                <div className="mb-6 p-3 bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs font-normal flex items-center gap-2">
                  <CheckCircle2 size={14} className="shrink-0" />
                  {successMessage}
                </div>
              )}
              <form onSubmit={handleSubmit} className="space-y-4 text-xs font-semibold uppercase tracking-wider">
                {authType === "signup" && (
                  <div>
                    <label className="block mb-1.5 text-[#1A1816]">Full Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. John Doe"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full bg-[#FAF8F5] border border-[#E5DFD5] px-4 py-3 text-xs focus:outline-none focus:border-[#1A1816] text-[#1A1816]"
                    />
                  </div>
                )}

                <div>
                  <label className="block mb-1.5 text-[#1A1816]">Email Address *</label>
                  <input
                    type="email"
                    required
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-[#FAF8F5] border border-[#E5DFD5] px-4 py-3 text-xs focus:outline-none focus:border-[#1A1816] text-[#1A1816]"
                  />
                </div>

                <div>
                  <label className="block mb-1.5 text-[#1A1816]">Password *</label>
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-[#FAF8F5] border border-[#E5DFD5] px-4 py-3 text-xs focus:outline-none focus:border-[#1A1816] text-[#1A1816]"
                  />
                </div>
                {authType === "login" && (
                  <div className="text-right">
                    <button
                      type="button"
                      onClick={() => {
                        setForgotStep("request")
                        setErrorMessage("")
                        setSuccessMessage("")
                      }}
                      className="text-[11px] text-[#C5A059] hover:underline uppercase tracking-wider font-bold cursor-pointer"
                    >
                      Forgot your password?
                    </button>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-[#1A1816] text-[#FAF8F5] py-4 font-bold uppercase tracking-wider text-xs hover:bg-[#C5A059] hover:text-[#1A1816] transition-colors mt-6 disabled:opacity-50 cursor-pointer shadow-md"
                >
                  {loading
                    ? authType === "login" ? "SIGNING IN..." : "CREATING..."
                    : authType === "login"
                    ? "SIGN IN"
                    : "CREATE ACCOUNT"}
                </button>
              </form>
              <div className="mt-6 pt-6 border-t border-[#E5DFD5] text-center">
                <button
                  type="button"
                  onClick={() => handleModeChange(authType === "login" ? "signup" : "login")}
                  className="text-xs font-semibold uppercase tracking-wider text-[#8E877E] hover:text-[#1A1816] underline cursor-pointer"
                >
                  {authType === "login"
                    ? "Don't have an account? Sign up"
                    : "Already have an account? Sign in"}
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
            </>
          )}

        </div>
      </div>
    </div>
  )
}
