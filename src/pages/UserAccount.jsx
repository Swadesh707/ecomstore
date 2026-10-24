import { useState, useEffect } from "react"
import { Link, useSearchParams } from "react-router-dom"
import { GetRequest, PostRequest } from "../config/http"
import {
  Package,
  Truck,
  RotateCcw,
  CheckCircle,
  Clock,
  MapPin,
  Search,
  AlertCircle,
  X,
  ShoppingBag,
  ArrowRight,
  Send,
} from "lucide-react"

export default function UserAccount() {
  const [searchParams] = useSearchParams()

  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState(searchParams.get("tab") || "orders") // "orders", "track", "returns"
  
  // Tracking search state
  const [trackQuery, setTrackQuery] = useState(searchParams.get("track") || "")
  const [trackedOrder, setTrackedOrder] = useState(null)
  const [trackingLoading, setTrackingLoading] = useState(false)
  const [trackingError, setTrackingError] = useState("")

  // Return Modal State
  const [returnModalOpen, setReturnModalOpen] = useState(false)
  const [selectedOrderForReturn, setSelectedOrderForReturn] = useState(null)
  const [returnReason, setReturnReason] = useState("Size or fit was not suitable")
  const [returnNotes, setReturnNotes] = useState("")
  const [returnSubmitting, setReturnSubmitting] = useState(false)

  // Status feedback toast
  const [feedback, setFeedback] = useState({ type: "", message: "" })

  const token = localStorage.getItem("token")
  const userName = localStorage.getItem("name") || "User"
  const userEmail = localStorage.getItem("email") || ""

  const showToast = (type, message) => {
    setFeedback({ type, message })
    setTimeout(() => setFeedback({ type: "", message: "" }), 5000)
  }

  // Load user orders
  const loadUserOrders = async () => {
    if (!token) {
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      const res = await GetRequest("orders/user/my-orders")
      const list = Array.isArray(res.data) ? res.data : []
      setOrders(list)

      // If user had a specific order passed in search param, select it for tracking
      const trackParam = searchParams.get("track")
      if (trackParam && list.length > 0) {
        const found = list.find(
          (o) =>
            o.orderNumber?.toLowerCase() === trackParam.toLowerCase() ||
            o.trackingNumber?.toLowerCase() === trackParam.toLowerCase()
        )
        if (found) {
          setTrackedOrder(found)
        }
      }
    } catch (err) {
      console.error("Failed to load user orders:", err)
      showToast("error", "Failed to retrieve your order ledger.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadUserOrders()
  }, [token])

  // Track search action
  const handleTrackSearch = async (e) => {
    if (e) e.preventDefault()
    const query = trackQuery.trim()
    if (!query) return

    setTrackingLoading(true)
    setTrackingError("")
    setTrackedOrder(null)

    try {
      // First check local orders list if already loaded
      const localMatch = orders.find(
        (o) =>
          o.orderNumber?.toLowerCase() === query.toLowerCase() ||
          (o.trackingNumber && o.trackingNumber.toLowerCase() === query.toLowerCase())
      )

      if (localMatch) {
        setTrackedOrder(localMatch)
        setTrackingLoading(false)
        return
      }

      // Try tracking by trackingNumber endpoint
      try {
        const trackRes = await GetRequest(`orders/track/${encodeURIComponent(query)}`)
        if (trackRes.data) {
          setTrackedOrder(trackRes.data)
          setTrackingLoading(false)
          return
        }
      } catch {
        // Fallback to orderNumber endpoint
      }

      const orderRes = await GetRequest(`orders/number/${encodeURIComponent(query)}`)
      if (orderRes.data) {
        setTrackedOrder(orderRes.data)
      } else {
        setTrackingError("No consignment found matching this reference code.")
      }
    } catch {
      setTrackingError("Could not locate a shipment with that reference number.")
    } finally {
      setTrackingLoading(false)
    }
  }

  // Quick track button from orders list
  const startTrackingOrder = (order) => {
    setTrackedOrder(order)
    setTrackQuery(order.trackingNumber || order.orderNumber)
    setActiveTab("track")
    window.scrollTo({ top: 350, behavior: "smooth" })
  }

  // Cancel Order action
  const handleCancelOrder = async (order) => {
    if (!window.confirm(`Are you certain you wish to cancel Order #${order.orderNumber}?`)) {
      return
    }
    try {
      await PostRequest(`orders/${order._id}/cancel`)
      showToast("success", `Order #${order.orderNumber} successfully cancelled. Items returned to stock.`)
      loadUserOrders()
    } catch (err) {
      console.error("Cancel order error:", err)
      showToast("error", "Failed to cancel order.")
    }
  }

  // Open Return Request Modal
  const openReturnModal = (order) => {
    setSelectedOrderForReturn(order)
    setReturnReason("Size or fit was not suitable")
    setReturnNotes("")
    setReturnModalOpen(true)
  }

  // Submit Return Request
  const handleSubmitReturn = async (e) => {
    e.preventDefault()
    if (!selectedOrderForReturn) return

    try {
      setReturnSubmitting(true)
      const fullReason = returnNotes.trim()
        ? `${returnReason} - ${returnNotes.trim()}`
        : returnReason

      await PostRequest(`orders/${selectedOrderForReturn._id}/return-request`, {
        reason: fullReason,
      })

      showToast("success", `Return request initiated for Order #${selectedOrderForReturn.orderNumber}.`)
      setReturnModalOpen(false)
      setSelectedOrderForReturn(null)
      loadUserOrders()
    } catch (err) {
      console.error("Failed to submit return:", err)
      showToast("error", "Failed to lodge return request. Please try again.")
    } finally {
      setReturnSubmitting(false)
    }
  }

  // Filter returns
  const returnOrders = orders.filter((o) => o.isReturnRequested)

  // Status badge styling helper
  const renderStatusBadge = (status) => {
    switch (status) {
      case "Delivered":
        return "bg-emerald-50 text-emerald-800 border-emerald-300"
      case "In Transit":
        return "bg-sky-50 text-sky-800 border-sky-300"
      case "Dispatched":
        return "bg-amber-50 text-amber-800 border-amber-300"
      case "Processing":
        return "bg-stone-100 text-stone-800 border-stone-300"
      case "Cancelled":
        return "bg-rose-50 text-rose-800 border-rose-300"
      default:
        return "bg-stone-100 text-stone-700 border-stone-300"
    }
  }

  // Return status styling helper
  const renderReturnBadge = (returnStatus) => {
    if (returnStatus?.includes("Approved")) {
      return "bg-emerald-50 text-emerald-800 border-emerald-300"
    }
    if (returnStatus?.includes("Refunded")) {
      return "bg-purple-50 text-purple-800 border-purple-300"
    }
    if (returnStatus?.includes("Declined")) {
      return "bg-rose-50 text-rose-800 border-rose-300"
    }
    return "bg-amber-50 text-amber-800 border-amber-300"
  }

  // Stepper Stage Calculation
  const getTimelineSteps = (order) => {
    const status = order?.orderStatus || "Processing"
    const isCancelled = status === "Cancelled"

    const steps = [
      { key: "placed", title: "Order Confirmed", desc: "Patron commission logged and verified", icon: CheckCircle },
      { key: "processing", title: "Atelier Preparation", desc: "Hand-tailoring, quality review & packing", icon: Clock },
      { key: "dispatched", title: "Dispatched", desc: "Secured & handed over to carrier", icon: Send },
      { key: "transit", title: "In Transit", desc: "Out for courier delivery to destination", icon: Truck },
      { key: "delivered", title: "Delivered", desc: "Completed consignment received", icon: Package },
    ]

    let activeIndex = 0
    if (status === "Processing") activeIndex = 1
    else if (status === "Dispatched") activeIndex = 2
    else if (status === "In Transit") activeIndex = 3
    else if (status === "Delivered") activeIndex = 4

    return { steps, activeIndex, isCancelled }
  }

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-[#1A1816] font-sans pb-24 pt-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Floating feedback alert */}
        {feedback.message && (
          <div
            className={`fixed top-20 right-6 z-50 px-5 py-3 border shadow-xl flex items-center gap-3 text-xs uppercase tracking-wider font-semibold transition-all ${
              feedback.type === "success"
                ? "bg-[#1A1816] text-[#FAF8F5] border-[#C5A059]"
                : "bg-[#78281F] text-[#FAF8F5] border-rose-400"
            }`}
          >
            {feedback.type === "success" ? <CheckCircle size={16} className="text-[#C5A059]" /> : <AlertCircle size={16} />}
            <span>{feedback.message}</span>
            <button
              onClick={() => setFeedback({ type: "", message: "" })}
              className="ml-2 hover:opacity-75 cursor-pointer"
            >
              <X size={14} />
            </button>
          </div>
        )}

        {/* Hero Banner / Patron Profile */}
        <div className="border border-[#E5DFD5] bg-white p-6 sm:p-10 mb-8 shadow-xs">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-[#E5DFD5]">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-[10px] uppercase font-bold tracking-[0.25em] text-[#C5A059]">
                  Client Atelier Portal
                </span>
                <span className="text-[#8E877E]">&bull;</span>
                <span className="text-[10px] uppercase font-semibold tracking-wider text-[#8E877E]">
                  Patron Order Management
                </span>
              </div>
              <h1 className="font-serif text-3xl sm:text-4xl font-bold uppercase tracking-tight text-[#1A1816]">
                {token ? `Welcome, ${userName}` : "Consignment Ledger & Tracking"}
              </h1>
              <p className="text-xs text-[#8E877E] mt-1 max-w-xl">
                Review your wardrobe purchases, monitor live courier status, and initiate seamless returns.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              {token ? (
                <div className="bg-[#FAF8F5] border border-[#E5DFD5] px-4 py-2.5 text-right">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-[#8E877E]">
                    Account Link
                  </p>
                  <p className="font-mono text-xs font-semibold text-[#1A1816]">
                    {userEmail || "Signed In"}
                  </p>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Link
                    to="/login"
                    className="px-5 py-2.5 bg-[#1A1816] text-[#FAF8F5] hover:bg-[#C5A059] hover:text-[#1A1816] text-xs font-bold uppercase tracking-widest transition-colors"
                  >
                    Sign In
                  </Link>
                  <Link
                    to="/signup"
                    className="px-5 py-2.5 bg-[#FAF8F5] border border-[#1A1816] text-[#1A1816] hover:bg-[#E5DFD5] text-xs font-bold uppercase tracking-widest transition-colors"
                  >
                    Join Atelier
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Quick Metrics & Navigation Tabs */}
          <div className="flex flex-wrap items-center justify-between gap-4 pt-6">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setActiveTab("orders")}
                className={`px-4 py-2 text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer border ${
                  activeTab === "orders"
                    ? "bg-[#1A1816] text-[#FAF8F5] border-[#1A1816]"
                    : "bg-[#FAF8F5] text-[#8E877E] border-[#E5DFD5] hover:text-[#1A1816] hover:border-[#1A1816]"
                }`}
              >
                Purchases & Orders ({orders.length})
              </button>

              <button
                onClick={() => setActiveTab("track")}
                className={`px-4 py-2 text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer border ${
                  activeTab === "track"
                    ? "bg-[#1A1816] text-[#FAF8F5] border-[#1A1816]"
                    : "bg-[#FAF8F5] text-[#8E877E] border-[#E5DFD5] hover:text-[#1A1816] hover:border-[#1A1816]"
                }`}
              >
                Track Consignment
              </button>

              <button
                onClick={() => setActiveTab("returns")}
                className={`px-4 py-2 text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer border ${
                  activeTab === "returns"
                    ? "bg-[#1A1816] text-[#FAF8F5] border-[#1A1816]"
                    : "bg-[#FAF8F5] text-[#8E877E] border-[#E5DFD5] hover:text-[#1A1816] hover:border-[#1A1816]"
                }`}
              >
                Returns & Exchanges ({returnOrders.length})
              </button>
            </div>

            <Link
              to="/shop"
              className="text-xs uppercase tracking-wider font-bold text-[#C5A059] hover:underline flex items-center gap-1"
            >
              <span>Explore Collection</span>
              <ArrowRight size={14} />
            </Link>
          </div>
        </div>

        {/* ========================================================= */}
        {/* TAB 1: PURCHASES & ORDERS */}
        {/* ========================================================= */}
        {activeTab === "orders" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-serif text-2xl font-bold uppercase tracking-tight text-[#1A1816]">
                  Purchase History
                </h2>
                <p className="text-xs text-[#8E877E]">
                  Complete record of your ordered garments, bespoke pieces, and delivery statuses.
                </p>
              </div>
              <button
                onClick={loadUserOrders}
                className="text-xs uppercase tracking-wider font-semibold text-[#8E877E] hover:text-[#1A1816] flex items-center gap-1"
              >
                <span>Refresh Ledger</span>
              </button>
            </div>

            {!token ? (
              <div className="border border-[#E5DFD5] bg-white p-12 text-center space-y-4">
                <ShoppingBag size={40} className="mx-auto text-[#C5A059]" />
                <h3 className="font-serif text-xl font-bold uppercase text-[#1A1816]">
                  Sign In to Access Your Purchases
                </h3>
                <p className="text-xs text-[#8E877E] max-w-md mx-auto">
                  Please log in to your patron account to review your previous purchases, view tracking codes, or initiate returns.
                </p>
                <div className="pt-2">
                  <Link
                    to="/login"
                    className="inline-block px-6 py-2.5 bg-[#1A1816] text-[#FAF8F5] hover:bg-[#C5A059] hover:text-[#1A1816] text-xs font-bold uppercase tracking-widest transition-colors"
                  >
                    Log In Now
                  </Link>
                </div>
              </div>
            ) : loading ? (
              <div className="border border-[#E5DFD5] bg-white p-20 text-center">
                <div className="w-8 h-8 border-2 border-[#1A1816] border-t-[#C5A059] rounded-full animate-spin mx-auto mb-3"></div>
                <p className="text-xs uppercase tracking-widest text-[#8E877E] font-semibold">
                  Retrieving Order History...
                </p>
              </div>
            ) : orders.length === 0 ? (
              <div className="border border-[#E5DFD5] bg-white p-16 text-center space-y-4">
                <Package size={44} className="mx-auto text-[#C5A059]/80" />
                <h3 className="font-serif text-xl font-bold uppercase text-[#1A1816]">
                  No Purchases Recorded Yet
                </h3>
                <p className="text-xs text-[#8E877E] max-w-md mx-auto">
                  You have not commissioned any pieces yet. Browse our curated seasonal collection to begin.
                </p>
                <div className="pt-2">
                  <Link
                    to="/shop"
                    className="inline-block px-6 py-2.5 bg-[#1A1816] text-[#FAF8F5] hover:bg-[#C5A059] hover:text-[#1A1816] text-xs font-bold uppercase tracking-widest transition-colors"
                  >
                    Shop The Collection
                  </Link>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                {orders.map((order) => {
                  const orderDate = new Date(order.createdAt).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })

                  const isReturnRequested = Boolean(order.isReturnRequested)
                  const canRequestReturn = !isReturnRequested && order.orderStatus !== "Cancelled"
                  const canCancel = order.orderStatus === "Processing" && !isReturnRequested

                  return (
                    <div
                      key={order._id}
                      className="border border-[#E5DFD5] bg-white overflow-hidden shadow-xs hover:border-[#C5A059]/60 transition-colors"
                    >
                      {/* Order Card Header */}
                      <div className="bg-[#FAF8F5] p-5 sm:px-8 border-b border-[#E5DFD5] flex flex-wrap items-center justify-between gap-4">
                        <div className="flex flex-wrap items-center gap-4 sm:gap-8">
                          <div>
                            <span className="text-[10px] font-bold uppercase tracking-wider text-[#8E877E] block">
                              Order Reference
                            </span>
                            <span className="font-mono text-sm font-bold text-[#1A1816]">
                              {order.orderNumber}
                            </span>
                          </div>

                          <div>
                            <span className="text-[10px] font-bold uppercase tracking-wider text-[#8E877E] block">
                              Date Placed
                            </span>
                            <span className="text-xs text-[#1A1816] font-medium">{orderDate}</span>
                          </div>

                          <div>
                            <span className="text-[10px] font-bold uppercase tracking-wider text-[#8E877E] block">
                              Total Sum
                            </span>
                            <span className="font-mono text-sm font-bold text-[#1A1816]">
                              ${Number(order.totalAmount || 0).toFixed(2)}
                            </span>
                          </div>

                          <div>
                            <span className="text-[10px] font-bold uppercase tracking-wider text-[#8E877E] block">
                              Fulfillment
                            </span>
                            <span
                              className={`inline-block px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider border ${renderStatusBadge(
                                order.orderStatus
                              )}`}
                            >
                              {order.orderStatus}
                            </span>
                          </div>

                          {isReturnRequested && (
                            <div>
                              <span className="text-[10px] font-bold uppercase tracking-wider text-[#8E877E] block">
                                Return Status
                              </span>
                              <span
                                className={`inline-block px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider border ${renderReturnBadge(
                                  order.returnStatus
                                )}`}
                              >
                                {order.returnStatus || "Return Requested"}
                              </span>
                            </div>
                          )}
                        </div>

                        {/* Order Actions */}
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => startTrackingOrder(order)}
                            className="px-3.5 py-1.5 bg-[#1A1816] text-[#FAF8F5] hover:bg-[#C5A059] hover:text-[#1A1816] text-xs font-bold uppercase tracking-wider transition-colors flex items-center gap-1.5 cursor-pointer"
                          >
                            <Truck size={13} />
                            <span>Track Package</span>
                          </button>

                          {canCancel && (
                            <button
                              onClick={() => handleCancelOrder(order)}
                              className="px-3 py-1.5 bg-rose-50 border border-rose-300 hover:border-rose-600 text-xs font-bold uppercase tracking-wider text-rose-800 transition-colors flex items-center gap-1 cursor-pointer"
                              title="Cancel this order"
                            >
                              <X size={13} />
                              <span>Cancel</span>
                            </button>
                          )}

                          {canRequestReturn && (
                            <button
                              onClick={() => openReturnModal(order)}
                              className="px-3 py-1.5 bg-[#FAF8F5] border border-[#E5DFD5] hover:border-[#1A1816] text-xs font-bold uppercase tracking-wider text-[#1A1816] hover:bg-[#F2EFE9] transition-colors flex items-center gap-1 cursor-pointer"
                              title="Request Return or Exchange"
                            >
                              <RotateCcw size={13} className="text-[#8E877E]" />
                              <span>Request Return</span>
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Items Purchased List */}
                      <div className="p-5 sm:p-8 space-y-4">
                        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#C5A059]">
                          Purchased Atelier Pieces ({order.items?.length || 0})
                        </p>

                        <div className="divide-y divide-[#E5DFD5] border-t border-b border-[#E5DFD5]">
                          {order.items?.map((item, idx) => (
                            <div
                              key={idx}
                              className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                            >
                              <div className="flex items-center gap-4">
                                <img
                                  src={
                                    item.image ||
                                    "https://images.unsplash.com/photo-1544441893-675973e31985?w=800"
                                  }
                                  alt={item.title}
                                  className="w-16 h-20 object-cover border border-[#E5DFD5] bg-[#FAF8F5] shrink-0"
                                />
                                <div>
                                  <h4 className="font-serif font-bold text-sm text-[#1A1816]">
                                    {item.title}
                                  </h4>
                                  <p className="text-xs text-[#8E877E] mt-0.5">
                                    Size: <span className="text-[#1A1816] font-medium">{item.size || "Standard"}</span>
                                    {item.color && (
                                      <>
                                        {" "} &bull; Color: <span className="text-[#1A1816] font-medium">{item.color}</span>
                                      </>
                                    )}
                                  </p>
                                  <p className="text-xs text-[#8E877E] mt-0.5 font-mono">
                                    ${Number(item.price).toFixed(2)} &times; {item.quantity} Qty
                                  </p>
                                </div>
                              </div>

                              <div className="text-right">
                                <span className="font-mono text-sm font-bold text-[#1A1816]">
                                  ${(Number(item.price) * Number(item.quantity)).toFixed(2)}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>

                        {/* Order Summary & Destination Details */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2 text-xs">
                          <div className="bg-[#FAF8F5] p-4 border border-[#E5DFD5]">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-[#8E877E] block mb-2">
                              Consignment Delivery Destination
                            </span>
                            <div className="flex items-start gap-2 text-[#1A1816]">
                              <MapPin size={14} className="text-[#C5A059] shrink-0 mt-0.5" />
                              <div>
                                <p className="font-bold">{order.customer?.name}</p>
                                <p className="text-[#8E877E]">{order.customer?.address}</p>
                                <p className="text-[#8E877E]">
                                  {order.customer?.city}, {order.customer?.zip}
                                </p>
                                {order.customer?.phone && (
                                  <p className="text-[#8E877E] mt-1 font-mono">
                                    Tel: {order.customer.phone}
                                  </p>
                                )}
                              </div>
                            </div>
                          </div>

                          <div className="bg-[#FAF8F5] p-4 border border-[#E5DFD5] space-y-1.5">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-[#8E877E] block mb-2">
                              Dispatch & Logistics Overview
                            </span>
                            <div className="flex justify-between text-[#8E877E]">
                              <span>Carrier:</span>
                              <span className="font-medium text-[#1A1816]">
                                {order.carrier || "Designated Carrier Express"}
                              </span>
                            </div>
                            <div className="flex justify-between text-[#8E877E]">
                              <span>Tracking Code:</span>
                              <span className="font-mono font-medium text-[#1A1816]">
                                {order.trackingNumber || "Pending Courier Assignment"}
                              </span>
                            </div>
                            {order.estimatedDeliveryDate && (
                              <div className="flex justify-between text-[#8E877E]">
                                <span>Estimated Arrival:</span>
                                <span className="font-medium text-[#1A1816]">
                                  {new Date(order.estimatedDeliveryDate).toLocaleDateString()}
                                </span>
                              </div>
                            )}
                            <div className="flex justify-between text-[#8E877E]">
                              <span>Payment Method:</span>
                              <span className="uppercase font-semibold text-[#1A1816]">
                                {order.paymentMethod === "cod" ? "Cash On Delivery" : "Credit Card / Prepaid"} ({order.paymentStatus})
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 2: CONSIGNMENT TRACKER */}
        {/* ========================================================= */}
        {activeTab === "track" && (
          <div className="space-y-8">
            <div className="border border-[#E5DFD5] bg-white p-6 sm:p-8">
              <div className="max-w-xl mx-auto text-center space-y-3 mb-6">
                <Truck size={36} className="mx-auto text-[#C5A059]" />
                <h2 className="font-serif text-2xl font-bold uppercase tracking-tight text-[#1A1816]">
                  Live Consignment Tracking
                </h2>
                <p className="text-xs text-[#8E877E]">
                  Enter your Order Reference Number (e.g. ORD-2026-...) or Carrier Tracking Number to view current transit progress.
                </p>

                <form onSubmit={handleTrackSearch} className="flex gap-2 pt-2">
                  <div className="relative flex-1">
                    <Search
                      size={15}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8E877E]"
                    />
                    <input
                      type="text"
                      required
                      placeholder="e.g. ORD-2026-91204 or TRK-..."
                      value={trackQuery}
                      onChange={(e) => setTrackQuery(e.target.value)}
                      className="w-full pl-9 pr-3 py-2.5 text-xs bg-[#FAF8F5] border border-[#E5DFD5] focus:outline-none focus:border-[#1A1816] text-[#1A1816] font-mono tracking-wide"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={trackingLoading}
                    className="px-6 py-2.5 bg-[#1A1816] text-[#FAF8F5] hover:bg-[#C5A059] hover:text-[#1A1816] text-xs font-bold uppercase tracking-wider transition-colors disabled:opacity-50 cursor-pointer"
                  >
                    {trackingLoading ? "Locating..." : "Track"}
                  </button>
                </form>

                {trackingError && (
                  <p className="text-xs text-[#78281F] font-semibold mt-2">{trackingError}</p>
                )}
              </div>

              {/* Live Tracking Result Card */}
              {trackedOrder ? (
                <div className="border-t border-[#E5DFD5] pt-8 space-y-8">
                  {/* Overview details */}
                  <div className="bg-[#FAF8F5] border border-[#E5DFD5] p-5 sm:p-6 flex flex-wrap items-center justify-between gap-6">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[#8E877E] block">
                        Tracking Status
                      </span>
                      <h3 className="font-serif text-xl font-bold uppercase text-[#1A1816]">
                        {trackedOrder.orderStatus}
                      </h3>
                      <p className="text-xs text-[#8E877E] mt-0.5">
                        Consignment #{trackedOrder.orderNumber}
                      </p>
                    </div>

                    <div className="flex flex-wrap gap-6 text-xs">
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-[#8E877E] block">
                          Designated Carrier
                        </span>
                        <span className="font-bold text-[#1A1816]">
                          {trackedOrder.carrier || "Royal Sartorial Express"}
                        </span>
                      </div>

                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-[#8E877E] block">
                          Tracking Code
                        </span>
                        <span className="font-mono font-bold text-[#1A1816]">
                          {trackedOrder.trackingNumber || "Pending Courier Assignment"}
                        </span>
                      </div>

                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-[#8E877E] block">
                          Estimated Delivery
                        </span>
                        <span className="font-bold text-[#1A1816]">
                          {trackedOrder.estimatedDeliveryDate
                            ? new Date(trackedOrder.estimatedDeliveryDate).toLocaleDateString()
                            : "Calculating route..."}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Visual Stepper / Timeline */}
                  <div>
                    <h4 className="font-serif text-sm font-bold uppercase tracking-wider text-[#1A1816] mb-6">
                      Consignment Transit Stages
                    </h4>

                    {(() => {
                      const { steps, activeIndex, isCancelled } = getTimelineSteps(trackedOrder)

                      if (isCancelled) {
                        return (
                          <div className="p-6 bg-rose-50 border border-rose-200 text-rose-800 text-xs">
                            <p className="font-bold uppercase tracking-wider">Order Cancelled</p>
                            <p className="mt-1">
                              This commission has been cancelled. If payment was collected, a refund has been logged.
                            </p>
                          </div>
                        )
                      }

                      return (
                        <div className="relative">
                          {/* Progress connecting line */}
                          <div className="hidden md:block absolute top-6 left-8 right-8 h-0.5 bg-[#E5DFD5] -z-0">
                            <div
                              className="h-full bg-[#1A1816] transition-all duration-500"
                              style={{
                                width: `${(activeIndex / (steps.length - 1)) * 100}%`,
                              }}
                            ></div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-5 gap-6 relative z-10">
                            {steps.map((step, idx) => {
                              const isComplete = idx <= activeIndex
                              const isCurrent = idx === activeIndex
                              const StepIcon = step.icon

                              return (
                                <div key={step.key} className="flex md:flex-col items-start md:items-center text-left md:text-center gap-4 md:gap-3">
                                  <div
                                    className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 border-2 transition-all ${
                                      isComplete
                                        ? "bg-[#1A1816] text-[#FAF8F5] border-[#1A1816]"
                                        : "bg-[#FAF8F5] text-[#8E877E] border-[#E5DFD5]"
                                    } ${isCurrent ? "ring-4 ring-[#C5A059]/30" : ""}`}
                                  >
                                    <StepIcon size={20} className={isCurrent ? "text-[#C5A059]" : ""} />
                                  </div>

                                  <div>
                                    <p
                                      className={`text-xs font-bold uppercase tracking-wider ${
                                        isComplete ? "text-[#1A1816]" : "text-[#8E877E]"
                                      }`}
                                    >
                                      {step.title}
                                    </p>
                                    <p className="text-[11px] text-[#8E877E] mt-0.5 max-w-[140px] md:mx-auto">
                                      {step.desc}
                                    </p>
                                  </div>
                                </div>
                              )
                            })}
                          </div>
                        </div>
                      )
                    })()}
                  </div>

                  {/* Consignment Items Mini Summary */}
                  <div className="border border-[#E5DFD5] p-5 sm:p-6 bg-[#FAF8F5]">
                    <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#C5A059] block mb-3">
                      Enclosed Garments
                    </span>

                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                      {trackedOrder.items?.map((item, idx) => (
                        <div key={idx} className="flex items-center gap-3 bg-white p-2.5 border border-[#E5DFD5]">
                          <img
                            src={item.image || "https://images.unsplash.com/photo-1544441893-675973e31985?w=800"}
                            alt={item.title}
                            className="w-10 h-12 object-cover border border-[#E5DFD5] shrink-0"
                          />
                          <div className="overflow-hidden text-xs">
                            <p className="font-serif font-bold text-[#1A1816] truncate">{item.title}</p>
                            <p className="text-[10px] text-[#8E877E]">
                              {item.size || "Standard"} &bull; {item.quantity} Qty
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="border-t border-[#E5DFD5] pt-12 pb-6 text-center text-[#8E877E]">
                  <p className="text-xs uppercase tracking-wider">
                    Select an order from your history or enter a consignment reference above to initiate tracking.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 3: RETURNS & EXCHANGES */}
        {/* ========================================================= */}
        {activeTab === "returns" && (
          <div className="space-y-6">
            <div>
              <h2 className="font-serif text-2xl font-bold uppercase tracking-tight text-[#1A1816]">
                Returns & Reverse Logistics
              </h2>
              <p className="text-xs text-[#8E877E]">
                Track initiated return requests, inspection updates, and refund settlements.
              </p>
            </div>

            {returnOrders.length === 0 ? (
              <div className="border border-[#E5DFD5] bg-white p-16 text-center space-y-4">
                <RotateCcw size={40} className="mx-auto text-[#C5A059]/80" />
                <h3 className="font-serif text-xl font-bold uppercase text-[#1A1816]">
                  No Active Returns
                </h3>
                <p className="text-xs text-[#8E877E] max-w-md mx-auto">
                  You have not submitted any return requests. Returns can be initiated for any delivered commission from the "Purchases & Orders" tab.
                </p>
                <div className="pt-2">
                  <button
                    onClick={() => setActiveTab("orders")}
                    className="px-6 py-2.5 bg-[#1A1816] text-[#FAF8F5] hover:bg-[#C5A059] hover:text-[#1A1816] text-xs font-bold uppercase tracking-widest transition-colors cursor-pointer"
                  >
                    View My Orders
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                {returnOrders.map((order) => (
                  <div
                    key={order._id}
                    className="border border-[#E5DFD5] bg-white p-6 sm:p-8 space-y-5 shadow-xs"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-[#E5DFD5]">
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-[#8E877E] block">
                          Consignment Under Return
                        </span>
                        <h3 className="font-mono text-base font-bold text-[#1A1816]">
                          {order.orderNumber}
                        </h3>
                      </div>

                      <div className="flex items-center gap-4">
                        <div>
                          <span className="text-[10px] font-bold uppercase tracking-wider text-[#8E877E] block text-right">
                            Current Stage
                          </span>
                          <span
                            className={`inline-block px-2.5 py-1 text-xs font-bold uppercase tracking-wider border ${renderReturnBadge(
                              order.returnStatus
                            )}`}
                          >
                            {order.returnStatus || "Return Initiated"}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="bg-[#FAF8F5] p-4 border border-[#E5DFD5] text-xs space-y-2">
                      <p className="font-bold text-[#1A1816] uppercase tracking-wider text-[10px]">
                        Return Reason Provided:
                      </p>
                      <p className="text-[#1A1816] italic">
                        &ldquo;{order.returnReason || "Standard Atelier Return Initiated"}&rdquo;
                      </p>
                    </div>

                    {/* Return Summary */}
                    <div className="flex flex-wrap items-center justify-between gap-4 pt-2 text-xs bg-[#FAF8F5] border border-[#E5DFD5] p-3">
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-[#8E877E] block">
                          Return Status
                        </span>
                        <p className="font-bold text-[#1A1816] mt-0.5">
                          {order.returnStatus || "Return Requested"}
                        </p>
                      </div>

                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-[#8E877E] block">
                          Settlement
                        </span>
                        <p className="font-bold text-[#1A1816] mt-0.5">
                          {order.paymentStatus === "Refunded" ? "Refunded" : order.paymentStatus || "Pending"}
                        </p>
                      </div>

                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-[#8E877E] block">
                          Inventory Stock
                        </span>
                        <p className="font-bold text-[#1A1816] mt-0.5">
                          {order.stockRestored ? "Restocked" : "Pending Return"}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

      </div>

      {/* ========================================================= */}
      {/* RETURN REQUEST MODAL */}
      {/* ========================================================= */}
      {returnModalOpen && selectedOrderForReturn && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#1A1816]/75 backdrop-blur-xs">
          <div className="bg-white border border-[#1A1816] max-w-lg w-full p-6 sm:p-8 shadow-2xl relative font-sans">
            <button
              onClick={() => {
                setReturnModalOpen(false)
                setSelectedOrderForReturn(null)
              }}
              className="absolute top-4 right-4 text-[#8E877E] hover:text-[#1A1816] cursor-pointer"
            >
              <X size={18} />
            </button>

            <div className="flex items-center gap-2 mb-2">
              <RotateCcw size={18} className="text-[#C5A059]" />
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#C5A059]">
                Reverse Logistics Request
              </span>
            </div>

            <h3 className="font-serif text-2xl font-bold uppercase text-[#1A1816] mb-1">
              Request Order Return
            </h3>
            <p className="text-xs text-[#8E877E] mb-6">
              Lodge a return for Consignment <strong className="text-[#1A1816] font-mono">#{selectedOrderForReturn.orderNumber}</strong>. Our concierge will review and provide return shipping instructions.
            </p>

            <form onSubmit={handleSubmitReturn} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#1A1816] mb-1">
                  Reason for Return
                </label>
                <select
                  value={returnReason}
                  onChange={(e) => setReturnReason(e.target.value)}
                  className="w-full bg-[#FAF8F5] border border-[#E5DFD5] p-2.5 text-xs text-[#1A1816] focus:outline-none focus:border-[#1A1816]"
                >
                  <option value="Size or fit was not suitable">Size or fit was not suitable</option>
                  <option value="Different color or texture than expected">Different color or texture than expected</option>
                  <option value="Item arrived damaged or flawed">Item arrived damaged or flawed</option>
                  <option value="Style preference changed">Style preference changed</option>
                  <option value="Delivered later than expected">Delivered later than expected</option>
                  <option value="Other atelier inquiry">Other atelier inquiry</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#1A1816] mb-1">
                  Additional Notes (Optional)
                </label>
                <textarea
                  rows={3}
                  value={returnNotes}
                  onChange={(e) => setReturnNotes(e.target.value)}
                  placeholder="Provide any specific comments for our tailoring and quality team..."
                  className="w-full bg-[#FAF8F5] border border-[#E5DFD5] p-2.5 text-xs text-[#1A1816] focus:outline-none focus:border-[#1A1816]"
                ></textarea>
              </div>

              <div className="bg-[#FAF8F5] p-3 border border-[#E5DFD5] text-[11px] text-[#8E877E] space-y-1">
                <p className="font-semibold text-[#1A1816]">Atelier Return Policy</p>
                <p>
                  Returns are inspected upon courier return. Once authorized, refunds are issued directly to your original payment method.
                </p>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#E5DFD5]">
                <button
                  type="button"
                  onClick={() => {
                    setReturnModalOpen(false)
                    setSelectedOrderForReturn(null)
                  }}
                  className="px-4 py-2 text-xs font-bold uppercase tracking-wider text-[#8E877E] hover:text-[#1A1816] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={returnSubmitting}
                  className="px-6 py-2.5 bg-[#1A1816] text-[#FAF8F5] hover:bg-[#C5A059] hover:text-[#1A1816] text-xs font-bold uppercase tracking-widest transition-colors disabled:opacity-50 cursor-pointer"
                >
                  {returnSubmitting ? "Submitting Request..." : "Confirm Return Request"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
