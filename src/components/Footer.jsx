import { useState } from "react"
import { Link } from "react-router-dom"
import { ArrowRight, CheckCircle2, Loader2 } from "lucide-react"
import { PostRequest } from "../config/http"

export default function Footer() {
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)
  const [subscribed, setSubscribed] = useState(false)
  const [feedbackMessage, setFeedbackMessage] = useState("")
  const [errorMessage, setErrorMessage] = useState("")

  const handleSubscribe = async (e) => {
    e.preventDefault()
    const cleanMail = email.trim().toLowerCase()
    if (!cleanMail) return

    try {
      setLoading(true)
      setErrorMessage("")
      const res = await PostRequest("collected-mails", { email: cleanMail })
      setSubscribed(true)
      setFeedbackMessage(res?.data?.message || "Thank you! You’re on the list.")
      setEmail("")
    } catch (err) {
      setErrorMessage(
        err?.response?.data?.message || "Could not save email. Please try again."
      )
    } finally {
      setLoading(false)
    }
  }

  const scrollToTop = () => {
    window.scrollTo({ top: 0, left: 0, behavior: "smooth" })
    document.documentElement.scrollTop = 0
    document.body.scrollTop = 0
  }

  return (
    <footer className="bg-[#141312] text-[#FAF8F5] pt-16 pb-12 border-t border-[#262422] mt-auto font-sans">
      <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-12">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 lg:gap-12 pb-14 border-b border-[#262422]">
          {/* Brand Info */}
          <div className="md:col-span-4 space-y-4">
            <Link
              to="/"
              onClick={scrollToTop}
              className="font-serif font-bold text-xl tracking-[0.2em] flex items-center gap-2.5 text-[#FAF8F5] no-underline cursor-pointer"
            >
              <svg
                width="20"
                height="20"
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
            <p className="text-xs sm:text-sm text-[#9C948A] leading-relaxed max-w-sm">
              Timeless clothing made with premium natural fabrics, classic silhouettes, and honest pricing.
            </p>
            <p className="text-xs text-[#6A645D]">
              Questions? Email us at <span className="text-[#C5A059]">support@ecomstore.com</span>
            </p>
          </div>

          {/* Shop Column */}
          <div className="md:col-span-2 sm:col-span-6">
            <h5 className="text-xs font-bold uppercase tracking-wider text-[#FAF8F5] mb-4">
              Shop
            </h5>
            <ul className="space-y-2.5 text-xs text-[#9C948A] list-none p-0 m-0">
              <li>
                <Link to="/shop" onClick={scrollToTop} className="hover:text-white transition-colors no-underline">
                  All Products
                </Link>
              </li>
              <li>
                <Link to="/shop?category=Tailoring+%26+Outerwear" onClick={scrollToTop} className="hover:text-white transition-colors no-underline">
                  Jackets & Coats
                </Link>
              </li>
              <li>
                <Link to="/shop?category=Knitwear+%26+Shirts" onClick={scrollToTop} className="hover:text-white transition-colors no-underline">
                  Knitwear & Shirts
                </Link>
              </li>
              <li>
                <Link to="/shop?category=Leather+Shoes" onClick={scrollToTop} className="hover:text-white transition-colors no-underline">
                  Footwear
                </Link>
              </li>
              <li>
                <Link to="/sale" onClick={scrollToTop} className="text-[#C5A059] hover:text-white transition-colors no-underline font-semibold">
                  Sale Items
                </Link>
              </li>
            </ul>
          </div>

          {/* About & Support Column */}
          <div className="md:col-span-2 sm:col-span-6">
            <h5 className="text-xs font-bold uppercase tracking-wider text-[#FAF8F5] mb-4">
              Company
            </h5>
            <ul className="space-y-2.5 text-xs text-[#9C948A] list-none p-0 m-0">
              <li>
                <Link to="/about" onClick={scrollToTop} className="hover:text-white transition-colors no-underline">
                  About Us
                </Link>
              </li>
              <li>
                <Link to="/account" onClick={scrollToTop} className="hover:text-white transition-colors no-underline">
                  My Orders
                </Link>
              </li>
              <li>
                <Link to="/account?tab=track" onClick={scrollToTop} className="hover:text-white transition-colors no-underline">
                  Track an Order
                </Link>
              </li>
              <li>
                <Link to="/account?tab=returns" onClick={scrollToTop} className="hover:text-white transition-colors no-underline">
                  Returns & Exchanges
                </Link>
              </li>
            </ul>
          </div>

          {/* Newsletter Column */}
          <div className="md:col-span-4">
            <h5 className="text-xs font-bold uppercase tracking-wider text-[#FAF8F5] mb-4">
              Stay in Touch
            </h5>
            <p className="text-xs text-[#9C948A] leading-relaxed mb-4">
              Subscribe for new product drops, seasonal releases, and private discounts.
            </p>

            {subscribed ? (
              <div className="flex items-center gap-2 p-3 bg-[#C5A059]/10 border border-[#C5A059]/30 text-xs text-[#C5A059] rounded">
                <CheckCircle2 size={16} />
                <span>{feedbackMessage || "Thank you! You’re on the list."}</span>
              </div>
            ) : (
              <form onSubmit={handleSubscribe} className="space-y-2">
                <div className="flex gap-2">
                  <input
                    type="email"
                    required
                    disabled={loading}
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="flex-1 bg-[#1F1D1B] border border-[#33302C] focus:border-[#C5A059] focus:outline-none px-3.5 py-2.5 text-xs text-white placeholder:text-[#6A645D] rounded disabled:opacity-50"
                  />
                  <button
                    type="submit"
                    disabled={loading}
                    className="bg-[#C5A059] hover:bg-[#d8b368] text-[#141312] px-4 py-2.5 text-xs font-bold uppercase tracking-wider transition-colors rounded cursor-pointer shrink-0 inline-flex items-center gap-1.5 disabled:opacity-50"
                  >
                    {loading ? (
                      <Loader2 size={13} className="animate-spin" />
                    ) : (
                      <>
                        <span>Join</span>
                        <ArrowRight size={13} />
                      </>
                    )}
                  </button>
                </div>
                {errorMessage && (
                  <p className="text-[11px] text-red-400 m-0">{errorMessage}</p>
                )}
              </form>
            )}
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col sm:flex-row justify-between items-center text-xs text-[#6A645D] gap-4">
          <p>© {new Date().getFullYear()} Ecomstore. All rights reserved.</p>
          <div className="flex gap-6 text-xs">
            <Link to="/about" onClick={scrollToTop} className="hover:text-[#9C948A] transition-colors no-underline">
              Terms of Service
            </Link>
            <Link to="/about" onClick={scrollToTop} className="hover:text-[#9C948A] transition-colors no-underline">
              Privacy Policy
            </Link>
            <Link to="/about" onClick={scrollToTop} className="hover:text-[#9C948A] transition-colors no-underline">
              Shipping & Returns
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
