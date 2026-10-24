import { useState, useEffect } from "react"
import { useNavigate, Link } from "react-router-dom"
import { getCart } from "../utils/cartStore"
import { PostRequest } from "../config/http"
import {
  validateLuhn,
  detectCardBrand,
  formatCardNumber,
  formatExpiry,
  validateExpiry,
  validateCVV,
} from "../utils/luhn"
import {
  CheckCircle2,
  ArrowLeft,
  ShieldCheck,
  CreditCard,
  Banknote,
  Truck,
  Printer,
  Package,
  Clock,
  ExternalLink,
  Tag,
  Check,
  X,
} from "lucide-react"

export default function Checkout() {
  const navigate = useNavigate()
  const [cart, setCart] = useState([])
  const [submitting, setSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState("")
  const [completedOrder, setCompletedOrder] = useState(null)

  const [formData, setFormData] = useState({
    name: localStorage.getItem("name") || "",
    email: localStorage.getItem("email") || "",
    phone: "",
    address: "",
    city: "",
    zip: "",
    country: "United States",
  })

  const [paymentMethod, setPaymentMethod] = useState("card") // 'card' or 'cod'

  const [cardData, setCardData] = useState({
    cardNumber: "",
    expiry: "",
    cvv: "",
  })

  const [cardBrand, setCardBrand] = useState("Card")
  const [cardErrors, setCardErrors] = useState({})

  // Coupon State
  const [couponCodeInput, setCouponCodeInput] = useState("")
  const [appliedCoupon, setAppliedCoupon] = useState(null)
  const [couponError, setCouponError] = useState("")
  const [validatingCoupon, setValidatingCoupon] = useState(false)

  useEffect(() => {
    const items = getCart()
    setCart(items)
  }, [])

  const subtotal = cart.reduce(
    (sum, item) => sum + (Number(item.price) || 0) * (item.quantity || 1),
    0
  )
  const discountAmount = appliedCoupon ? appliedCoupon.discountAmount : 0
  const discountedSubtotal = Math.max(0, subtotal - discountAmount)
  const shipping = discountedSubtotal > 150 ? 0 : discountedSubtotal > 0 ? 15 : 0
  const tax = 0
  const total = discountedSubtotal + shipping + tax

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    setErrorMessage("")
  }

  const handleCardNumberChange = (raw) => {
    const formatted = formatCardNumber(raw)
    const brand = detectCardBrand(formatted)
    setCardBrand(brand)
    setCardData((prev) => ({ ...prev, cardNumber: formatted }))

    const sanitized = formatted.replace(/\D/g, "")
    if (sanitized.length >= 13) {
      if (!validateLuhn(sanitized)) {
        setCardErrors((prev) => ({
          ...prev,
          cardNumber: "Credit card number failed mathematical checksum (Luhn algorithm).",
        }))
      } else {
        setCardErrors((prev) => {
          const next = { ...prev }
          delete next.cardNumber
          return next
        })
      }
    } else {
      setCardErrors((prev) => {
        const next = { ...prev }
        delete next.cardNumber
        return next
      })
    }
  }

  const handleExpiryChange = (raw) => {
    const formatted = formatExpiry(raw)
    setCardData((prev) => ({ ...prev, expiry: formatted }))

    if (formatted.length === 5) {
      if (!validateExpiry(formatted)) {
        setCardErrors((prev) => ({
          ...prev,
          expiry: "Card is expired or invalid expiry month/year.",
        }))
      } else {
        setCardErrors((prev) => {
          const next = { ...prev }
          delete next.expiry
          return next
        })
      }
    } else {
      setCardErrors((prev) => {
        const next = { ...prev }
        delete next.expiry
        return next
      })
    }
  }

  const handleCvvChange = (raw) => {
    const digits = raw.replace(/\D/g, "").slice(0, 4)
    setCardData((prev) => ({ ...prev, cvv: digits }))

    if (digits.length >= 3) {
      if (!validateCVV(digits, cardBrand)) {
        setCardErrors((prev) => ({
          ...prev,
          cvv: "Invalid security code (3 digits, or 4 for American Express).",
        }))
      } else {
        setCardErrors((prev) => {
          const next = { ...prev }
          delete next.cvv
          return next
        })
      }
    } else {
      setCardErrors((prev) => {
        const next = { ...prev }
        delete next.cvv
        return next
      })
    }
  }

  const handleApplyCoupon = async (e) => {
    e.preventDefault()
    setCouponError("")
    if (!couponCodeInput.trim()) return

    try {
      setValidatingCoupon(true)
      const res = await PostRequest("coupons/validate", {
        code: couponCodeInput.trim().toUpperCase(),
        subtotal,
        email: formData.email,
        userId: localStorage.getItem("id") || null,
      })
      setAppliedCoupon(res.data)
      setCouponError("")
    } catch (err) {
      setAppliedCoupon(null)
      setCouponError(err.response?.data?.message || "Invalid or ineligible discount coupon.")
    } finally {
      setValidatingCoupon(false)
    }
  }

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null)
    setCouponCodeInput("")
    setCouponError("")
  }

  const validateForm = () => {
    if (!formData.name.trim()) return "Patron full name is required."
    if (!formData.email.trim()) return "Patron email address is required."
    if (!formData.address.trim()) return "Street delivery address is required."
    if (!formData.city.trim()) return "Delivery city is required."
    if (!formData.zip.trim()) return "Postal / ZIP code is required."

    if (paymentMethod === "card") {
      const sanitizedNum = cardData.cardNumber.replace(/\D/g, "")
      if (!sanitizedNum || sanitizedNum.length < 13) {
        return "Please input a complete credit card number."
      }
      if (!validateLuhn(sanitizedNum)) {
        return "Card number is invalid (Luhn algorithm checksum failed)."
      }
      if (!validateExpiry(cardData.expiry)) {
        return "Please input a valid, unexpired card date (MM/YY)."
      }
      if (!validateCVV(cardData.cvv, cardBrand)) {
        return "Please input a valid 3 or 4 digit card security code."
      }
    }

    return null
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setErrorMessage("")

    if (cart.length === 0) {
      setErrorMessage("Your commission bag contains no pieces.")
      return
    }

    const validationErr = validateForm()
    if (validationErr) {
      setErrorMessage(validationErr)
      return
    }

    try {
      setSubmitting(true)

      const payload = {
        customer: {
          name: formData.name.trim(),
          email: formData.email.trim(),
          phone: formData.phone.trim(),
          address: formData.address.trim(),
          city: formData.city.trim(),
          zip: formData.zip.trim(),
          country: formData.country.trim(),
        },
        items: cart.map((item) => ({
          productId: item._id,
          title: item.title || item.name,
          price: Number(item.price),
          quantity: item.quantity || 1,
          size: item.size || "Standard",
          color: item.color || "Default",
          image: item.image || "",
        })),
        paymentMethod,
        cardNumber: paymentMethod === "card" ? cardData.cardNumber : undefined,
        expiry: paymentMethod === "card" ? cardData.expiry : undefined,
        cvv: paymentMethod === "card" ? cardData.cvv : undefined,
        couponCode: appliedCoupon ? appliedCoupon.code : "",
        discountAmount: discountAmount,
        userId: localStorage.getItem("id") || localStorage.getItem("userId") || undefined,
      }

      let res
      try {
        res = await PostRequest("orders", payload)
      } catch (postErr) {
        if (postErr.response?.status === 404) {
          try {
            res = await PostRequest("order/create", payload)
          } catch (retryErr) {
            res = await PostRequest("order", payload)
          }
        } else {
          throw postErr
        }
      }

      const order = res.data

      // Clear bag upon recorded commission
      localStorage.removeItem("cart")
      window.dispatchEvent(new Event("cart-updated"))
      setCompletedOrder(order)
      window.scrollTo({ top: 0, left: 0, behavior: "smooth" })
    } catch (err) {
      console.error("Commission submission error:", err)
      const serverMsg =
        err.response?.data?.message ||
        err.response?.data?.error ||
        (err.response?.status === 404
          ? "Unable to reach atelier order service (404). Please ensure your backend server is running on http://localhost:8000."
          : err.message)
      setErrorMessage(
        serverMsg || "Failed to finalize commission order with the atelier."
      )
    } finally {
      setSubmitting(false)
    }
  }

  const handlePrint = () => {
    window.print()
  }

  // ==========================================
  // INVOICE & BILLING DOCUMENT VIEW
  // ==========================================
  if (completedOrder) {
    const formattedDate = new Date(completedOrder.createdAt || Date.now()).toLocaleDateString(
      "en-US",
      {
        year: "numeric",
        month: "long",
        day: "numeric",
      }
    )

    const estDeliveryDate = new Date(Date.now() + 4 * 24 * 60 * 60 * 1000).toLocaleDateString(
      "en-US",
      {
        year: "numeric",
        month: "long",
        day: "numeric",
      }
    )

    return (
      <div className="min-h-screen bg-[#FAF8F5] text-[#1A1816] py-12 px-4 sm:px-6 lg:px-8 font-sans">
        {/* Screen Controls */}
        <div className="max-w-4xl mx-auto mb-6 flex flex-wrap items-center justify-between gap-4 no-print">
          <Link
            to="/shop"
            className="text-xs font-semibold uppercase tracking-[0.2em] text-[#8E877E] hover:text-[#1A1816] flex items-center gap-2 no-underline"
          >
            <ArrowLeft size={14} /> Return to Storefront
          </Link>

          <div className="flex items-center gap-3">
            <Link
              to="/account"
              className="bg-[#FAF8F5] border border-[#1A1816] text-[#1A1816] hover:bg-[#E5DFD5] px-4 py-2.5 text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-colors cursor-pointer"
            >
              <Truck size={14} /> My Orders & Tracking
            </Link>
            <button
              onClick={handlePrint}
              className="bg-[#1A1816] text-[#FAF8F5] hover:bg-[#C5A059] hover:text-[#1A1816] px-5 py-2.5 text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-colors cursor-pointer shadow-sm"
            >
              <Printer size={15} /> Print / Save Invoice (PDF)
            </button>
          </div>
        </div>

        {/* Printable Official Invoice Card */}
        <div className="max-w-4xl mx-auto bg-white border border-[#E5DFD5] shadow-lg p-8 sm:p-12 printable-invoice">
          {/* Invoice Header */}
          <div className="border-b-2 border-[#1A1816] pb-8 mb-8">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <span className="font-serif font-bold text-2xl tracking-[0.25em] text-[#1A1816] flex items-center gap-2">
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
                </span>
                <p className="text-[10px] uppercase tracking-[0.25em] text-[#C5A059] font-bold mt-1">
                  Maison of Fine Tailoring & Leathercraft
                </p>
                <p className="text-[11px] text-[#8E877E] mt-1 font-sans">
                  Savile Row & Florence Atelier ❖ VAT Reg: GB-84920412
                </p>
              </div>

              <div className="text-left sm:text-right">
                <span className="inline-block bg-[#1A1816] text-[#FAF8F5] px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em] mb-2">
                  Official Bill of Sale & Invoice
                </span>
                <p className="font-serif text-sm font-bold text-[#1A1816]">
                  Invoice #: {completedOrder.orderNumber.replace("ORD", "INV")}
                </p>
                <p className="text-xs text-[#8E877E]">Date of Record: {formattedDate}</p>
              </div>
            </div>
          </div>

          {/* Key Reference Bar: Order # & Tracking # */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-[#F2EFE9] border border-[#E5DFD5] p-5 mb-8">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#8E877E] block">
                Atelier Order Reference
              </span>
              <p className="font-serif text-xl font-bold tracking-wider text-[#1A1816] mt-0.5">
                {completedOrder.orderNumber}
              </p>
              <p className="text-[11px] text-[#6A645D] mt-1">
                Status: <span className="font-bold text-[#1A1816]">{completedOrder.orderStatus}</span>
              </p>
            </div>

            <div>
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#8E877E] block">
                Official Tracking Number
              </span>
              <p className="font-mono text-base font-bold tracking-wider text-[#78281F] mt-0.5">
                {completedOrder.trackingNumber || "Assigned Upon Courier Dispatch"}
              </p>
              <p className="text-[11px] text-[#6A645D] mt-1">
                Carrier: <span className="font-semibold text-[#1A1816]">Royal Sartorial Dispatch (Express)</span>
              </p>
            </div>
          </div>

          {/* Dispatch & Delivery Timeline Indicator */}
          <div className="mb-8 border border-[#E5DFD5] p-4 bg-[#FAF8F5]">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center text-xs gap-2 mb-3">
              <span className="font-bold uppercase tracking-wider text-[#1A1816] flex items-center gap-1.5">
                <Truck size={14} className="text-[#C5A059]" /> Courier Status: Registered & In Preparation
              </span>
              <span className="text-[#8E877E] text-[11px]">
                Estimated Delivery Arrival: <strong>{estDeliveryDate}</strong>
              </span>
            </div>
            {/* Visual Tracking Progress Bar */}
            <div className="w-full bg-[#E5DFD5] h-2 rounded-full overflow-hidden">
              <div className="bg-[#1A1816] h-full w-2/5"></div>
            </div>
            <div className="flex justify-between text-[10px] text-[#8E877E] uppercase tracking-wider font-semibold mt-2">
              <span>Commission Recorded</span>
              <span className="text-[#1A1816] font-bold">Atelier Preparation</span>
              <span>In Transit</span>
              <span>Delivered</span>
            </div>
          </div>

          {/* Patron Addresses & Payment Info */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 text-xs">
            <div>
              <h5 className="font-serif font-bold uppercase tracking-wider text-xs border-b border-[#E5DFD5] pb-1.5 mb-2 text-[#1A1816]">
                Patron & Bill To
              </h5>
              <p className="font-bold text-[#1A1816]">{completedOrder.customer.name}</p>
              <p className="text-[#6A645D]">{completedOrder.customer.email}</p>
              {completedOrder.customer.phone && (
                <p className="text-[#6A645D]">Tel: {completedOrder.customer.phone}</p>
              )}
            </div>

            <div>
              <h5 className="font-serif font-bold uppercase tracking-wider text-xs border-b border-[#E5DFD5] pb-1.5 mb-2 text-[#1A1816]">
                Dispatch Address
              </h5>
              <p className="text-[#6A645D]">{completedOrder.customer.address}</p>
              <p className="text-[#6A645D]">
                {completedOrder.customer.city}, {completedOrder.customer.zip}
              </p>
              <p className="text-[#6A645D] font-medium">{completedOrder.customer.country}</p>
            </div>

            <div>
              <h5 className="font-serif font-bold uppercase tracking-wider text-xs border-b border-[#E5DFD5] pb-1.5 mb-2 text-[#1A1816]">
                Settlement & Method
              </h5>
              <p className="font-bold text-[#1A1816]">
                {completedOrder.paymentMethod === "cod"
                  ? "Cash on Delivery (COD)"
                  : `${completedOrder.cardDetails?.cardBrand || "Credit Card"} (ending in ${
                      completedOrder.cardDetails?.lastFourDigits || "••••"
                    })`}
              </p>
              <p
                className={`mt-1 font-semibold ${
                  completedOrder.paymentStatus === "Paid"
                    ? "text-[#1C352D]"
                    : "text-[#78281F]"
                }`}
              >
                ● {completedOrder.paymentStatus}
              </p>
              {completedOrder.paymentMethod === "cod" && (
                <p className="text-[10px] text-[#8E877E] mt-1 leading-tight">
                  Amount due in cash upon handover by the dispatch courier.
                </p>
              )}
            </div>
          </div>

          {/* Itemized Line Items Table */}
          <div className="mb-8">
            <h5 className="font-serif font-bold uppercase tracking-wider text-xs mb-3 text-[#1A1816]">
              Commissioned Articles & Garments
            </h5>
            <div className="overflow-x-auto border border-[#E5DFD5]">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-[#FAF8F5] border-b border-[#E5DFD5] text-[10px] uppercase font-bold text-[#8E877E] tracking-wider">
                    <th className="p-3">Article Description</th>
                    <th className="p-3">Specification</th>
                    <th className="p-3 text-right">Unit Price</th>
                    <th className="p-3 text-center">Qty</th>
                    <th className="p-3 text-right">Line Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E5DFD5]">
                  {completedOrder.items.map((item, idx) => (
                    <tr key={idx} className="hover:bg-[#FAF8F5]/50">
                      <td className="p-3">
                        <div className="flex items-center gap-3">
                          {item.image && (
                            <img
                              src={item.image}
                              alt={item.title}
                              className="w-10 h-12 object-cover border border-[#E5DFD5] shrink-0"
                            />
                          )}
                          <div>
                            <span className="font-serif font-bold text-sm text-[#1A1816] block">
                              {item.title}
                            </span>
                            <span className="text-[10px] text-[#8E877E] uppercase tracking-wider">
                              Hand-Crafted
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="p-3 text-[#6A645D]">
                        <span className="block font-medium">Size: {item.size}</span>
                        <span className="block">Color: {item.color}</span>
                      </td>
                      <td className="p-3 text-right font-serif text-[#1A1816]">
                        ${Number(item.price).toFixed(2)}
                      </td>
                      <td className="p-3 text-center font-bold">{item.quantity}</td>
                      <td className="p-3 text-right font-serif font-bold text-[#1A1816]">
                        ${(Number(item.price) * Number(item.quantity)).toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Financial Totals Breakdown */}
          <div className="flex flex-col sm:flex-row justify-between items-start gap-8 border-t border-[#E5DFD5] pt-6 mb-8">
            <div className="max-w-xs text-xs text-[#8E877E] space-y-2">
              <p className="font-serif font-bold uppercase tracking-wider text-[#1A1816]">
                Atelier Guarantee & Care
              </p>
              <p className="text-[11px] leading-relaxed">
                All leather goods include Goodyear-welted cobblery warranty and pure virgin wools have passed sartorial quality inspection.
              </p>
              <p className="text-[11px] leading-relaxed">
                For returns or alterations, contact concierge within 14 days of delivery.
              </p>
            </div>

            <div className="w-full sm:w-64 space-y-2 text-xs">
              <div className="flex justify-between text-[#6A645D]">
                <span>Articles Subtotal:</span>
                <span className="font-serif">${completedOrder.subtotal.toFixed(2)}</span>
              </div>
              {completedOrder.discountAmount > 0 && (
                <div className="flex justify-between text-[#78281F] font-semibold">
                  <span>Promotional Privilege ({completedOrder.couponCode}):</span>
                  <span className="font-serif">-${completedOrder.discountAmount.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between text-[#6A645D]">
                <span>Courier Dispatch:</span>
                <span className="font-serif">
                  {completedOrder.shippingFee === 0 ? "Complimentary" : `$${completedOrder.shippingFee.toFixed(2)}`}
                </span>
              </div>
              <div className="flex justify-between text-[#6A645D]">
                <span>Estimated VAT / Duties:</span>
                <span className="font-serif">$0.00 (Included)</span>
              </div>
              <div className="border-t-2 border-[#1A1816] pt-2 flex justify-between font-serif font-bold text-base text-[#1A1816]">
                <span>Total Amount:</span>
                <span className="text-lg">${completedOrder.totalAmount.toFixed(2)}</span>
              </div>
              <div className="text-[10px] text-right text-[#8E877E] uppercase tracking-wider">
                Currency: United States Dollars (USD)
              </div>
            </div>
          </div>

          {/* Official Sign-Off & Seal */}
          <div className="border-t border-[#E5DFD5] pt-6 flex flex-col sm:flex-row justify-between items-center text-center sm:text-left gap-4 text-[10px] uppercase tracking-[0.2em] text-[#8E877E]">
            <div>
              <p className="font-serif italic text-xs text-[#1A1816] tracking-normal mb-1">
                "Substance before trend, craftsmanship before haste."
              </p>
              <p>© {new Date().getFullYear()} ECOMSTORE SARTORIAL PURVEYORS</p>
            </div>
            <div className="border border-[#C5A059] px-4 py-2 font-serif font-bold text-[#C5A059] tracking-[0.3em]">
              VERIFIED ATELIER DISPATCH
            </div>
          </div>
        </div>
      </div>
    )
  }

  // ==========================================
  // CHECKOUT FORM VIEW
  // ==========================================
  return (
    <div className="min-h-screen bg-[#FAF8F5] text-[#1A1816] py-14 font-sans">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Breadcrumb */}
        <div className="mb-10 flex flex-wrap items-center justify-between border-b border-[#E5DFD5] pb-6 gap-4">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#8E877E] block mb-1">
              Atelier Settlement
            </span>
            <h1 className="font-serif text-3xl sm:text-4xl font-bold tracking-tight text-[#1A1816]">
              Finalize Commission
            </h1>
          </div>
          <Link
            to="/cart"
            className="text-xs font-semibold uppercase tracking-[0.2em] text-[#8E877E] hover:text-[#1A1816] flex items-center gap-2 no-underline"
          >
            <ArrowLeft size={14} /> Back to Bag
          </Link>
        </div>

        {cart.length === 0 ? (
          <div className="text-center py-20 bg-[#F2EFE9] border border-[#E5DFD5] p-8 max-w-lg mx-auto">
            <p className="font-serif text-2xl font-bold uppercase tracking-wider mb-3 text-[#1A1816]">
              Your wardrobe bag is empty
            </p>
            <p className="text-xs text-[#8E877E] uppercase tracking-wider mb-6">
              Please select garments or accessories from our collections before proceeding to checkout.
            </p>
            <Link
              to="/shop"
              className="inline-block bg-[#1A1816] text-[#FAF8F5] px-8 py-3 text-xs font-semibold uppercase tracking-wider no-underline"
            >
              Explore Collection
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
              {/* Left Column: Delivery & Payment Details */}
              <div className="lg:col-span-7 space-y-8">
                {/* Error Banner */}
                {errorMessage && (
                  <div className="p-4 bg-[#78281F]/10 border border-[#78281F] text-[#78281F] text-xs font-medium">
                    {errorMessage}
                  </div>
                )}

                {/* 1. Patron & Correspondence */}
                <div className="bg-white border border-[#E5DFD5] p-6 sm:p-8">
                  <h3 className="font-serif text-lg font-bold uppercase tracking-wider mb-5 pb-3 border-b border-[#E5DFD5] text-[#1A1816]">
                    1. Patron Correspondence
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-bold uppercase tracking-wider">
                    <div className="sm:col-span-2 space-y-1.5">
                      <label className="text-[#8E877E]">Full Name *</label>
                      <input
                        type="text"
                        required
                        value={formData.name}
                        onChange={(e) => handleInputChange("name", e.target.value)}
                        placeholder="LORD / MR. / MS. SWADESH NEPAL"
                        className="w-full bg-[#FAF8F5] border border-[#E5DFD5] p-3 focus:outline-none focus:border-[#1A1816] font-normal text-xs text-[#1A1816]"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[#8E877E]">Email Address *</label>
                      <input
                        type="email"
                        required
                        value={formData.email}
                        onChange={(e) => handleInputChange("email", e.target.value)}
                        placeholder="CORRESPONDENCE@HOUSE.COM"
                        className="w-full bg-[#FAF8F5] border border-[#E5DFD5] p-3 focus:outline-none focus:border-[#1A1816] font-normal text-xs text-[#1A1816]"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[#8E877E]">Contact Telephone</label>
                      <input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => handleInputChange("phone", e.target.value)}
                        placeholder="+1 (555) 019-2834"
                        className="w-full bg-[#FAF8F5] border border-[#E5DFD5] p-3 focus:outline-none focus:border-[#1A1816] font-normal text-xs text-[#1A1816]"
                      />
                    </div>
                  </div>
                </div>

                {/* 2. Dispatch Address */}
                <div className="bg-white border border-[#E5DFD5] p-6 sm:p-8">
                  <h3 className="font-serif text-lg font-bold uppercase tracking-wider mb-5 pb-3 border-b border-[#E5DFD5] text-[#1A1816]">
                    2. Courier Dispatch Address
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-bold uppercase tracking-wider">
                    <div className="sm:col-span-2 space-y-1.5">
                      <label className="text-[#8E877E]">Street Address *</label>
                      <input
                        type="text"
                        required
                        value={formData.address}
                        onChange={(e) => handleInputChange("address", e.target.value)}
                        placeholder="740 PARK AVENUE, APT 12B"
                        className="w-full bg-[#FAF8F5] border border-[#E5DFD5] p-3 focus:outline-none focus:border-[#1A1816] font-normal text-xs text-[#1A1816]"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[#8E877E]">City *</label>
                      <input
                        type="text"
                        required
                        value={formData.city}
                        onChange={(e) => handleInputChange("city", e.target.value)}
                        placeholder="NEW YORK"
                        className="w-full bg-[#FAF8F5] border border-[#E5DFD5] p-3 focus:outline-none focus:border-[#1A1816] font-normal text-xs text-[#1A1816]"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[#8E877E]">Postal / ZIP Code *</label>
                      <input
                        type="text"
                        required
                        value={formData.zip}
                        onChange={(e) => handleInputChange("zip", e.target.value)}
                        placeholder="10021"
                        className="w-full bg-[#FAF8F5] border border-[#E5DFD5] p-3 focus:outline-none focus:border-[#1A1816] font-normal text-xs text-[#1A1816]"
                      />
                    </div>

                    <div className="sm:col-span-2 space-y-1.5">
                      <label className="text-[#8E877E]">Country / Territory</label>
                      <input
                        type="text"
                        value={formData.country}
                        onChange={(e) => handleInputChange("country", e.target.value)}
                        placeholder="United States"
                        className="w-full bg-[#FAF8F5] border border-[#E5DFD5] p-3 focus:outline-none focus:border-[#1A1816] font-normal text-xs text-[#1A1816]"
                      />
                    </div>
                  </div>
                </div>

                {/* 3. Settlement / Payment Method Selection */}
                <div className="bg-white border border-[#E5DFD5] p-6 sm:p-8">
                  <h3 className="font-serif text-lg font-bold uppercase tracking-wider mb-5 pb-3 border-b border-[#E5DFD5] text-[#1A1816]">
                    3. Payment & Settlement
                  </h3>

                  {/* Payment Method Selector Cards */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                    {/* Option 1: Credit / Debit Card */}
                    <button
                      type="button"
                      onClick={() => setPaymentMethod("card")}
                      className={`p-4 border text-left flex flex-col justify-between transition-all cursor-pointer ${
                        paymentMethod === "card"
                          ? "border-[#1A1816] bg-[#FAF8F5] ring-1 ring-[#1A1816]"
                          : "border-[#E5DFD5] hover:border-[#8E877E] bg-white"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-3">
                        <CreditCard
                          size={22}
                          className={paymentMethod === "card" ? "text-[#1A1816]" : "text-[#8E877E]"}
                        />
                        <span
                          className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${
                            paymentMethod === "card"
                              ? "border-[#1A1816] bg-[#1A1816]"
                              : "border-[#8E877E]"
                          }`}
                        >
                          {paymentMethod === "card" && (
                            <span className="w-1.5 h-1.5 bg-white rounded-full"></span>
                          )}
                        </span>
                      </div>
                      <div>
                        <span className="font-serif font-bold text-sm text-[#1A1816] block">
                          Credit / Debit Card
                        </span>
                        <span className="text-[10px] text-[#8E877E] uppercase tracking-wider block mt-0.5">
                          Visa, Mastercard, Amex, Discover
                        </span>
                      </div>
                    </button>

                    {/* Option 2: Cash on Delivery (COD) */}
                    <button
                      type="button"
                      onClick={() => setPaymentMethod("cod")}
                      className={`p-4 border text-left flex flex-col justify-between transition-all cursor-pointer ${
                        paymentMethod === "cod"
                          ? "border-[#1A1816] bg-[#FAF8F5] ring-1 ring-[#1A1816]"
                          : "border-[#E5DFD5] hover:border-[#8E877E] bg-white"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-3">
                        <Banknote
                          size={22}
                          className={paymentMethod === "cod" ? "text-[#C5A059]" : "text-[#8E877E]"}
                        />
                        <span
                          className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${
                            paymentMethod === "cod"
                              ? "border-[#1A1816] bg-[#1A1816]"
                              : "border-[#8E877E]"
                          }`}
                        >
                          {paymentMethod === "cod" && (
                            <span className="w-1.5 h-1.5 bg-white rounded-full"></span>
                          )}
                        </span>
                      </div>
                      <div>
                        <span className="font-serif font-bold text-sm text-[#1A1816] block">
                          Cash on Delivery (COD)
                        </span>
                        <span className="text-[10px] text-[#8E877E] uppercase tracking-wider block mt-0.5">
                          Pay cash upon courier arrival
                        </span>
                      </div>
                    </button>
                  </div>

                  {/* Cash on Delivery Notice */}
                  {paymentMethod === "cod" ? (
                    <div className="p-4 bg-[#F2EFE9] border border-[#E5DFD5] text-xs text-[#6A645D] leading-relaxed">
                      <p className="font-serif font-bold uppercase tracking-wider text-[#1A1816] mb-1">
                        Handover Settlement Policy
                      </p>
                      <p>
                        Your commission will be crafted, packaged in our archival boxes, and dispatched. The total sum of <strong>${total.toFixed(2)}</strong> will be collected in cash by our courier driver upon delivery.
                      </p>
                    </div>
                  ) : (
                    /* Card Input Fields with Real-Time Luhn Algorithm Validation */
                    <div className="space-y-4 pt-2">
                      <div className="space-y-1.5 text-xs font-bold uppercase tracking-wider">
                        <div className="flex justify-between items-center">
                          <label className="text-[#8E877E]">Card Number *</label>
                          <span className="text-[10px] font-bold text-[#C5A059] uppercase tracking-wider">
                            Brand: {cardBrand}
                          </span>
                        </div>
                        <div className="relative">
                          <input
                            type="text"
                            required={paymentMethod === "card"}
                            value={cardData.cardNumber}
                            onChange={(e) => handleCardNumberChange(e.target.value)}
                            maxLength={23}
                            placeholder="4532  0123  4567  8910"
                            className={`w-full bg-[#FAF8F5] border p-3 font-mono text-sm tracking-wider focus:outline-none ${
                              cardErrors.cardNumber
                                ? "border-[#78281F] text-[#78281F]"
                                : "border-[#E5DFD5] text-[#1A1816] focus:border-[#1A1816]"
                            }`}
                          />
                        </div>
                        {cardErrors.cardNumber && (
                          <p className="text-[11px] text-[#78281F] font-normal lowercase tracking-normal">
                            {cardErrors.cardNumber}
                          </p>
                        )}
                      </div>

                      <div className="grid grid-cols-2 gap-4 text-xs font-bold uppercase tracking-wider">
                        <div className="space-y-1.5">
                          <label className="text-[#8E877E]">Expiration Date *</label>
                          <input
                            type="text"
                            required={paymentMethod === "card"}
                            value={cardData.expiry}
                            onChange={(e) => handleExpiryChange(e.target.value)}
                            maxLength={5}
                            placeholder="MM/YY"
                            className={`w-full bg-[#FAF8F5] border p-3 font-mono text-sm focus:outline-none ${
                              cardErrors.expiry
                                ? "border-[#78281F] text-[#78281F]"
                                : "border-[#E5DFD5] text-[#1A1816] focus:border-[#1A1816]"
                            }`}
                          />
                          {cardErrors.expiry && (
                            <p className="text-[11px] text-[#78281F] font-normal lowercase tracking-normal">
                              {cardErrors.expiry}
                            </p>
                          )}
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-[#8E877E]">Security Code (CVV) *</label>
                          <input
                            type="password"
                            required={paymentMethod === "card"}
                            value={cardData.cvv}
                            onChange={(e) => handleCvvChange(e.target.value)}
                            maxLength={4}
                            placeholder="123"
                            className={`w-full bg-[#FAF8F5] border p-3 font-mono text-sm focus:outline-none ${
                              cardErrors.cvv
                                ? "border-[#78281F] text-[#78281F]"
                                : "border-[#E5DFD5] text-[#1A1816] focus:border-[#1A1816]"
                            }`}
                          />
                          {cardErrors.cvv && (
                            <p className="text-[11px] text-[#78281F] font-normal lowercase tracking-normal">
                              {cardErrors.cvv}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Right Column: Order Summary, Coupon Redemption & Place Commission */}
              <div className="lg:col-span-5 bg-white border border-[#E5DFD5] p-6 sm:p-8 space-y-6 sticky top-24">
                <h3 className="font-serif text-lg font-bold uppercase tracking-wider border-b border-[#E5DFD5] pb-3 text-[#1A1816]">
                  Commission Summary
                </h3>

                {/* Items Mini List */}
                <div className="divide-y divide-[#E5DFD5] max-h-64 overflow-y-auto pr-1">
                  {cart.map((item, idx) => (
                    <div key={idx} className="py-3 flex items-center gap-3">
                      <img
                        src={item.image || "https://images.unsplash.com/photo-1544441893-675973e31985?w=800"}
                        alt={item.title}
                        className="w-12 h-14 object-cover border border-[#E5DFD5] shrink-0"
                      />
                      <div className="flex-1 overflow-hidden">
                        <span className="font-serif font-bold text-xs text-[#1A1816] truncate block">
                          {item.title}
                        </span>
                        <span className="text-[10px] text-[#8E877E] uppercase tracking-wider block">
                          Size: {item.size} ❖ {item.color}
                        </span>
                        <span className="text-[10px] text-[#8E877E] block">
                          Qty: {item.quantity} × ${Number(item.price).toFixed(2)}
                        </span>
                      </div>
                      <span className="font-serif font-bold text-xs text-[#1A1816]">
                        ${(Number(item.price) * (item.quantity || 1)).toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Promotional Coupon Application */}
                <div className="border-t border-[#E5DFD5] pt-4">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#8E877E] block mb-2">
                    Privilege Promotional Coupon
                  </span>

                  {appliedCoupon ? (
                    <div className="flex items-center justify-between p-3 bg-[#1C352D]/10 border border-[#1C352D] text-xs">
                      <div>
                        <span className="font-mono font-bold text-[#1C352D] block">
                          {appliedCoupon.code}
                        </span>
                        <span className="text-[10px] text-[#1C352D]">
                          {appliedCoupon.discountType === "percentage"
                            ? `${appliedCoupon.discountValue}% applied`
                            : `$${appliedCoupon.discountValue} credit applied`}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={handleRemoveCoupon}
                        className="text-[#78281F] hover:text-black font-bold text-xs cursor-pointer"
                        title="Remove Coupon"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  ) : (
                    <div>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          placeholder="PROMO CODE (E.G. HERITAGE20)"
                          value={couponCodeInput}
                          onChange={(e) => setCouponCodeInput(e.target.value.toUpperCase())}
                          className="flex-1 bg-[#FAF8F5] border border-[#E5DFD5] px-3 py-2 text-xs font-mono uppercase tracking-wider focus:outline-none focus:border-[#1A1816] text-[#1A1816]"
                        />
                        <button
                          type="button"
                          onClick={handleApplyCoupon}
                          disabled={validatingCoupon || !couponCodeInput.trim()}
                          className="bg-[#1A1816] text-[#FAF8F5] px-4 py-2 text-xs font-bold uppercase tracking-wider hover:bg-[#C5A059] hover:text-[#1A1816] transition-colors disabled:opacity-50 cursor-pointer shrink-0"
                        >
                          {validatingCoupon ? "..." : "Apply"}
                        </button>
                      </div>
                      {couponError && (
                        <p className="text-[11px] text-[#78281F] font-medium mt-1.5 lowercase">
                          {couponError}
                        </p>
                      )}
                    </div>
                  )}
                </div>

                {/* Cost Breakdown */}
                <div className="border-t border-[#E5DFD5] pt-4 space-y-2 text-xs">
                  <div className="flex justify-between text-[#6A645D]">
                    <span>Subtotal</span>
                    <span className="font-serif font-medium">${subtotal.toFixed(2)}</span>
                  </div>

                  {discountAmount > 0 && (
                    <div className="flex justify-between text-[#78281F] font-semibold">
                      <span>Privilege Discount ({appliedCoupon?.code})</span>
                      <span className="font-serif">-${discountAmount.toFixed(2)}</span>
                    </div>
                  )}

                  <div className="flex justify-between text-[#6A645D]">
                    <span>Private Courier Delivery</span>
                    <span className="font-serif font-medium">
                      {shipping === 0 ? "Complimentary" : `$${shipping.toFixed(2)}`}
                    </span>
                  </div>

                  <div className="flex justify-between text-[#6A645D]">
                    <span>Taxes & Import Duty</span>
                    <span className="font-serif font-medium">$0.00 (Included)</span>
                  </div>

                  <div className="border-t border-[#E5DFD5] pt-3 flex justify-between font-serif font-bold text-base text-[#1A1816]">
                    <span>Total Amount</span>
                    <span className="text-xl">${total.toFixed(2)}</span>
                  </div>
                </div>

                {/* Submit Action */}
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full bg-[#1A1816] text-[#FAF8F5] py-4 text-xs font-bold uppercase tracking-[0.2em] hover:bg-[#C5A059] hover:text-[#1A1816] transition-all duration-300 disabled:opacity-50 cursor-pointer shadow-sm"
                >
                  {submitting
                    ? "Recording Commission..."
                    : paymentMethod === "cod"
                    ? "Confirm Order (Cash on Delivery)"
                    : `Authorize & Pay $${total.toFixed(2)}`}
                </button>

                <div className="pt-2 text-center text-[10px] text-[#8E877E] flex items-center justify-center gap-1.5 uppercase tracking-wider">
                  <ShieldCheck size={14} className="text-[#C5A059]" />
                  <span>256-Bit Encrypted Atelier Transaction</span>
                </div>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
