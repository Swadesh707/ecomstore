import { useState, useEffect } from "react"
import { GetRequest, PutRequest } from "../../config/http"
import {
  CreditCard,
  Banknote,
  Search,
  RotateCcw,
  RefreshCw,
  Package,
} from "lucide-react"

export default function ManageOrders() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("All")
  const [updatingId, setUpdatingId] = useState(null)
  const [feedback, setFeedback] = useState({ type: "", message: "" })

  const showFeedback = (type, message) => {
    setFeedback({ type, message })
    setTimeout(() => setFeedback({ type: "", message: "" }), 3500)
  }

  const loadOrders = async () => {
    try {
      setLoading(true)
      const res = await GetRequest("orders/all")
      setOrders(res.data || [])
    } catch (err) {
      console.error("Failed to load orders:", err)
      showFeedback("error", "Failed to retrieve orders from database.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadOrders()
  }, [])

  const handleUpdateStatus = async (orderId, newStatus) => {
    try {
      setUpdatingId(orderId)
      const res = await PutRequest(`orders/${orderId}/status`, { orderStatus: newStatus })
      setOrders((prev) => prev.map((o) => (o._id === orderId ? res.data : o)))
      showFeedback("success", `Order updated to ${newStatus}.`)
    } catch (err) {
      console.error("Failed to update status:", err)
      showFeedback("error", "Failed to update order status.")
    } finally {
      setUpdatingId(null)
    }
  }

  // Filtered Orders
  const filteredOrders = orders.filter((order) => {
    if (statusFilter === "Returns") {
      if (!order.isReturnRequested) return false
    } else if (statusFilter !== "All" && order.orderStatus !== statusFilter) {
      return false
    }

    if (!searchQuery.trim()) return true
    const query = searchQuery.toLowerCase()
    return (
      order.orderNumber?.toLowerCase().includes(query) ||
      order.trackingNumber?.toLowerCase().includes(query) ||
      order.customer?.name?.toLowerCase().includes(query) ||
      order.customer?.email?.toLowerCase().includes(query)
    )
  })

  const returnOrdersCount = orders.filter((o) => o.isReturnRequested).length

  return (
    <div className="space-y-8 font-sans">
      {/* Header */}
      <div className="border-b border-[#E5DFD5] pb-4 flex justify-between items-center">
        <h1 className="font-serif text-2xl font-bold uppercase tracking-tight text-[#1A1816]">
          Orders
        </h1>

        <button
          onClick={loadOrders}
          className="border border-[#E5DFD5] hover:border-[#1A1816] px-2.5 py-1 text-xs font-semibold text-[#1A1816] hover:bg-[#FAF8F5] transition-colors cursor-pointer flex items-center gap-1.5"
          title="Refresh"
        >
          <RefreshCw size={11} className={loading ? "animate-spin" : ""} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Feedback Toast */}
      {feedback.message && (
        <div
          className={`p-4 border text-xs font-semibold uppercase tracking-wider ${
            feedback.type === "error"
              ? "bg-[#78281F]/10 border-[#78281F] text-[#78281F]"
              : "bg-[#1C352D]/10 border-[#1C352D] text-[#1C352D]"
          }`}
        >
          {feedback.message}
        </div>
      )}

      {/* Filters & Search Toolbar */}
      <div className="space-y-3">
        <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between">
          <div className="relative flex-1 max-w-md">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8E877E]" />
            <input
              type="text"
              placeholder="SEARCH ORDER #, TRACKING #, PATRON NAME OR EMAIL..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-[#E5DFD5] text-xs uppercase tracking-wider placeholder:text-[#8E877E] text-[#1A1816] focus:outline-none focus:border-[#1A1816]"
            />
          </div>

          {/* Status Filter Tabs */}
          <div className="flex flex-wrap items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider">
            {["All", "Processing", "Dispatched", "In Transit", "Delivered", "Cancelled", "Returns"].map(
              (status) => {
                const isSelected = statusFilter === status
                const isReturns = status === "Returns"
                return (
                  <button
                    key={status}
                    onClick={() => setStatusFilter(status)}
                    className={`px-3 py-2 border transition-colors cursor-pointer flex items-center gap-1.5 ${
                      isSelected
                        ? isReturns
                          ? "bg-[#78281F] text-[#FAF8F5] border-[#78281F]"
                          : "bg-[#1A1816] text-[#FAF8F5] border-[#1A1816]"
                        : "bg-white text-[#8E877E] border-[#E5DFD5] hover:border-[#1A1816] hover:text-[#1A1816]"
                    }`}
                  >
                    {isReturns && <RotateCcw size={12} />}
                    <span>{status}</span>
                    {isReturns && returnOrdersCount > 0 && (
                      <span className="bg-white/20 text-white text-[9px] px-1 py-0.2">
                        {returnOrdersCount}
                      </span>
                    )}
                  </button>
                )
              }
            )}
          </div>
        </div>
      </div>

      {/* Orders Ledger Table */}
      <div className="border border-[#E5DFD5] bg-white">
        <div className="p-4 bg-[#FAF8F5] border-b border-[#E5DFD5] flex justify-between items-center text-xs">
          <span className="font-serif font-bold uppercase tracking-wider text-[#1A1816]">
            Order Registry ({filteredOrders.length} records)
          </span>
          <p className="text-xs font-serif uppercase tracking-wider text-[#8E877E]">
            Status: {statusFilter}
          </p>
        </div>

        {loading ? (
          <div className="p-16 text-center text-xs uppercase tracking-wider text-[#8E877E]">
            <div className="w-8 h-8 border-2 border-[#1A1816] border-t-[#C5A059] rounded-full animate-spin mx-auto mb-3"></div>
            Loading Order Registry...
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="p-16 text-center text-xs uppercase tracking-wider text-[#8E877E]">
            <Package size={36} className="mx-auto text-[#C5A059]/60 mb-2" />
            <p className="font-serif text-sm font-bold text-[#1A1816]">No Orders Found</p>
            <p className="text-[11px] mt-1">No orders match the current search or status filter.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-[#FAF8F5] border-b border-[#E5DFD5] text-[10px] uppercase font-bold text-[#8E877E] tracking-wider">
                  <th className="p-4">Order & Tracking</th>
                  <th className="p-4">Patron & Destination</th>
                  <th className="p-4">Items</th>
                  <th className="p-4">Settlement</th>
                  <th className="p-4">Fulfillment Status</th>
                  <th className="p-4 text-right">Total Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5DFD5]">
                {filteredOrders.map((order) => {
                  const isUpdating = updatingId === order._id
                  const isCOD = order.paymentMethod === "cod"

                  return (
                    <tr key={order._id} className="hover:bg-[#FAF8F5]/60 transition-colors">
                      {/* Order & Tracking # */}
                      <td className="p-4">
                        <span className="font-serif font-bold text-sm text-[#1A1816] block">
                          {order.orderNumber}
                        </span>
                        <span className="font-mono text-[11px] text-[#78281F] block mt-0.5 font-bold">
                          {order.trackingNumber || "No tracking assigned"}
                        </span>
                        <span className="text-[10px] text-[#8E877E] block mt-0.5">
                          {new Date(order.createdAt).toLocaleDateString()}
                        </span>
                      </td>

                      {/* Patron Info */}
                      <td className="p-4">
                        <span className="font-bold text-[#1A1816] block">{order.customer?.name}</span>
                        <span className="text-[#8E877E] block text-[11px]">{order.customer?.email}</span>
                        <span className="text-[#8E877E] block text-[10px] truncate max-w-[180px]">
                          {order.customer?.city}, {order.customer?.country || "US"}
                        </span>
                      </td>

                      {/* Line Items: Name and Quantity (NO PHOTO) */}
                      <td className="p-4">
                        <div className="space-y-1.5 max-w-xs">
                          {order.items?.map((item, idx) => (
                            <div key={idx} className="text-xs">
                              <span className="font-semibold text-[#1A1816] block">
                                {item.title || item.name}
                              </span>
                              <span className="text-[10px] text-[#8E877E]">
                                Qty: {item.quantity || 1}
                                {item.size && item.size !== "Standard" ? ` • Size: ${item.size}` : ""}
                                {item.color && item.color !== "Default" ? ` • ${item.color}` : ""}
                              </span>
                            </div>
                          ))}
                        </div>
                      </td>

                      {/* Settlement */}
                      <td className="p-4">
                        <div className="flex items-center gap-1 text-[#1A1816] font-semibold text-[11px]">
                          {isCOD ? <Banknote size={14} className="text-[#C5A059]" /> : <CreditCard size={14} />}
                          <span>{isCOD ? "Cash on Delivery" : "Card Payment"}</span>
                        </div>
                        <span
                          className={`inline-block text-[9px] uppercase font-bold tracking-wider px-2 py-0.5 mt-1 border ${
                            order.paymentStatus === "Paid"
                              ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                              : order.paymentStatus === "Refunded"
                              ? "bg-purple-50 text-purple-800 border-purple-200"
                              : "bg-amber-50 text-amber-800 border-amber-200"
                          }`}
                        >
                          ● {order.paymentStatus}
                        </span>
                        {order.isReturnRequested && (
                          <span className="block text-[9px] text-[#78281F] font-bold mt-1">
                            Return: {order.returnStatus || "Requested"}
                          </span>
                        )}
                      </td>

                      {/* Fulfillment Status Selector */}
                      <td className="p-4">
                        <select
                          value={order.orderStatus}
                          disabled={isUpdating}
                          onChange={(e) => handleUpdateStatus(order._id, e.target.value)}
                          className="bg-[#FAF8F5] border border-[#E5DFD5] text-[11px] font-bold uppercase tracking-wider py-1.5 px-2.5 text-[#1A1816] focus:outline-none focus:border-[#1A1816] cursor-pointer"
                        >
                          <option value="Processing">Processing</option>
                          <option value="Dispatched">Dispatched</option>
                          <option value="In Transit">In Transit</option>
                          <option value="Delivered">Delivered</option>
                          <option value="Cancelled">Cancelled</option>
                        </select>
                      </td>

                      {/* Total Amount */}
                      <td className="p-4 text-right">
                        <span className="font-serif font-bold text-base text-[#1A1816] block">
                          ${order.totalAmount?.toFixed(2)}
                        </span>
                        {order.discountAmount > 0 && (
                          <span className="text-[10px] text-[#78281F] font-semibold block">
                            -${order.discountAmount.toFixed(2)} coupon
                          </span>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
