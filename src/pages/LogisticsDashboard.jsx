import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { GetRequest, PutRequest } from "../config/http"
import {
  Truck,
  Package,
  MapPin,
  CheckCircle,
  Clock,
  Search,
  ArrowLeft,
  RefreshCw,
  Send,
  AlertTriangle,
  RotateCcw,
  Calendar,
  ExternalLink,
  DollarSign,
  X,
  FileCheck,
} from "lucide-react"

export default function LogisticsDashboard() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all") // all, Processing, Dispatched, In Transit, Delivered, Returns
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false)
  const [feedback, setFeedback] = useState({ type: "", message: "" })

  // Update Consignment Form State
  const [updateForm, setUpdateForm] = useState({
    orderStatus: "Processing",
    trackingNumber: "",
    carrier: "Royal Sartorial Express",
    estimatedDeliveryDate: "",
    logisticsCostEstimated: 14.5,
  })
  const [updating, setUpdating] = useState(false)

  const showFeedback = (type, message) => {
    setFeedback({ type, message })
    setTimeout(() => setFeedback({ type: "", message: "" }), 4000)
  }

  const loadOrders = async () => {
    try {
      setLoading(true)
      const res = await GetRequest("orders/all")
      setOrders(res.data || [])
    } catch (err) {
      console.error("Failed to load logistics consignments:", err)
      showFeedback("error", "Failed to retrieve logistics shipments.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadOrders()
  }, [])

  const handleOpenUpdate = (order) => {
    setSelectedOrder(order)
    setUpdateForm({
      orderStatus: order.orderStatus || "Processing",
      trackingNumber: order.trackingNumber || "",
      carrier: order.carrier || "Royal Sartorial Express",
      estimatedDeliveryDate: order.estimatedDeliveryDate
        ? new Date(order.estimatedDeliveryDate).toISOString().split("T")[0]
        : "",
      logisticsCostEstimated: 14.5,
    })
    setIsUpdateModalOpen(true)
  }

  const handleQuickStatusChange = async (orderId, newStatus) => {
    try {
      await PutRequest(`orders/${orderId}/status`, { orderStatus: newStatus })
      showFeedback("success", `Shipment status updated to ${newStatus}.`)
      loadOrders()
    } catch (err) {
      console.error("Status update error:", err)
      showFeedback("error", "Failed to change consignment status.")
    }
  }

  const handleSubmitUpdate = async (e) => {
    e.preventDefault()
    if (!selectedOrder) return

    try {
      setUpdating(true)
      const payload = {
        orderStatus: updateForm.orderStatus,
        trackingNumber: updateForm.trackingNumber.trim(),
        carrier: updateForm.carrier.trim(),
        estimatedDeliveryDate: updateForm.estimatedDeliveryDate || null,
        logisticsCostEstimated: Number(updateForm.logisticsCostEstimated) || 0,
      }

      await PutRequest(`orders/${selectedOrder._id}/status`, payload)
      showFeedback("success", `Consignment ${selectedOrder.orderNumber} successfully updated.`)
      setIsUpdateModalOpen(false)
      loadOrders()
    } catch (err) {
      console.error("Failed to update dispatch details:", err)
      showFeedback("error", "Error saving dispatch and tracking updates.")
    } finally {
      setUpdating(false)
    }
  }

  // Filtered consignments
  const filteredOrders = orders.filter((order) => {
    // Search query matches
    const q = searchQuery.toLowerCase()
    const matchesSearch =
      !q ||
      order.orderNumber?.toLowerCase().includes(q) ||
      order.trackingNumber?.toLowerCase().includes(q) ||
      order.customer?.name?.toLowerCase().includes(q) ||
      order.customer?.city?.toLowerCase().includes(q) ||
      order.customer?.zip?.toLowerCase().includes(q) ||
      order.customer?.address?.toLowerCase().includes(q)

    // Status tab filter
    let matchesStatus = true
    if (statusFilter === "Returns") {
      matchesStatus = Boolean(order.isReturnRequested)
    } else if (statusFilter !== "all") {
      matchesStatus = order.orderStatus === statusFilter
    }

    return matchesSearch && matchesStatus
  })

  const returnsCount = orders.filter((o) => o.isReturnRequested).length

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-[#1A1816] font-sans antialiased pb-20">
      {/* Top Bar */}
      <header className="bg-[#1A1816] text-[#FAF8F5] py-4 px-6 sm:px-10 border-b border-[#2D2A26] sticky top-0 z-30 shadow-md">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link
              to="/"
              className="flex items-center gap-1.5 text-xs uppercase tracking-wider text-[#C5A059] hover:text-[#E5DFD5] transition-colors font-semibold"
            >
              <ArrowLeft size={15} />
              <span>Store</span>
            </Link>
            <span className="text-[#4D4A46]">|</span>
            <div className="flex items-center gap-2">
              <Truck size={18} className="text-[#C5A059]" />
              <span className="font-serif font-bold text-base tracking-[0.15em] uppercase">
                Logistics & Courier
              </span>
            </div>
          </div>

          <button
            onClick={loadOrders}
            disabled={loading}
            className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold uppercase tracking-wider bg-[#2D2A26] hover:bg-[#3D3A36] text-[#FAF8F5] transition-colors border border-[#4D4A46] cursor-pointer"
            title="Refresh"
          >
            <RefreshCw size={11} className={loading ? "animate-spin" : ""} />
            <span>Refresh</span>
          </button>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-6 sm:px-10 pt-8">
        {/* Feedback Alert */}
        {feedback.message && (
          <div
            className={`mb-6 p-4 text-xs font-semibold uppercase tracking-wider flex items-center justify-between border ${
              feedback.type === "success"
                ? "bg-[#C5A059]/10 border-[#C5A059] text-[#1A1816]"
                : "bg-red-50 border-red-300 text-red-800"
            }`}
          >
            <span>{feedback.message}</span>
            <button onClick={() => setFeedback({ type: "", message: "" })}>
              <X size={14} />
            </button>
          </div>
        )}

        {/* Section Title */}
        <section className="mb-6 border-b border-[#E5DFD5] pb-4">
          <h1 className="font-serif text-2xl font-bold uppercase tracking-tight text-[#1A1816]">
            Consignments
          </h1>
        </section>

        {/* Filters and Search Bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          {/* Status Tabs */}
          <div className="flex flex-wrap gap-1 border-b border-[#E5DFD5] pb-2 md:pb-0 md:border-b-0">
            {[
              { key: "all", label: "All Consignments" },
              { key: "Processing", label: "Processing" },
              { key: "Dispatched", label: "Dispatched" },
              { key: "In Transit", label: "In Transit" },
              { key: "Delivered", label: "Delivered" },
              { key: "Returns", label: `Returns (${returnsCount})` },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setStatusFilter(tab.key)}
                className={`px-3 py-1.5 text-xs font-semibold uppercase tracking-wider transition-colors cursor-pointer border ${
                  statusFilter === tab.key
                    ? "bg-[#1A1816] text-[#FAF8F5] border-[#1A1816]"
                    : "bg-[#F2EFE9] text-[#8E877E] border-[#E5DFD5] hover:text-[#1A1816] hover:border-[#1A1816]"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Search Input */}
          <div className="relative w-full md:w-80">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8E877E]" />
            <input
              type="text"
              placeholder="Search order #, tracking, client, city..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs bg-[#F2EFE9] border border-[#E5DFD5] focus:outline-none focus:border-[#1A1816] text-[#1A1816] tracking-wide"
            />
          </div>
        </div>

        {/* Consignment Table */}
        <div className="bg-[#FAF8F5] border border-[#E5DFD5] overflow-hidden shadow-sm">
          {loading ? (
            <div className="py-20 text-center">
              <RefreshCw size={24} className="animate-spin text-[#C5A059] mx-auto mb-3" />
              <p className="text-xs uppercase tracking-widest text-[#8E877E] font-semibold">
                Loading Consignment Ledger...
              </p>
            </div>
          ) : filteredOrders.length === 0 ? (
            <div className="py-20 text-center text-[#8E877E]">
              <Package size={32} className="mx-auto mb-3 text-[#C5A059]/60" />
              <p className="font-serif text-lg text-[#1A1816] mb-1">No Shipments Found</p>
              <p className="text-xs uppercase tracking-wider">
                {searchQuery || statusFilter !== "all"
                  ? "Adjust search keywords or status filter"
                  : "No store orders recorded yet"}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-[#F2EFE9] border-b border-[#E5DFD5] text-[#8E877E] uppercase tracking-wider text-[10px] font-bold">
                    <th className="py-3 px-4">Consignment / Order</th>
                    <th className="py-3 px-4">Client Destination</th>
                    <th className="py-3 px-4">Carrier & Tracking</th>
                    <th className="py-3 px-4">Fulfillment Status</th>
                    <th className="py-3 px-4">Reverse Logistics</th>
                    <th className="py-3 px-4 text-right">Dispatch Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E5DFD5]">
                  {filteredOrders.map((order) => {
                    const isReturn = Boolean(order.isReturnRequested)
                    const tracking = order.trackingNumber || "Unassigned"
                    const carrier = order.carrier || "Royal Sartorial Express"

                    return (
                      <tr key={order._id} className="hover:bg-[#F2EFE9]/60 transition-colors">
                        {/* Order & Date */}
                        <td className="py-3 px-4 align-top">
                          <div className="font-bold font-mono text-[#1A1816]">
                            {order.orderNumber}
                          </div>
                          <div className="text-[11px] text-[#8E877E] mt-0.5">
                            {new Date(order.createdAt).toLocaleDateString()}
                          </div>
                          <div className="text-[10px] text-[#8E877E] mt-1 font-semibold uppercase">
                            {order.items?.length || 0} parcel articles
                          </div>
                        </td>

                        {/* Customer & Destination */}
                        <td className="py-3 px-4 align-top">
                          <div className="font-semibold text-[#1A1816]">
                            {order.customer?.name}
                          </div>
                          <div className="flex items-center gap-1 text-[11px] text-[#8E877E] mt-0.5">
                            <MapPin size={11} className="text-[#C5A059] shrink-0" />
                            <span>
                              {order.customer?.city}, {order.customer?.zip}
                            </span>
                          </div>
                          <div className="text-[10px] text-[#8E877E] mt-0.5 truncate max-w-xs">
                            {order.customer?.address}
                          </div>
                        </td>

                        {/* Tracking Code */}
                        <td className="py-3 px-4 align-top">
                          <div className="font-mono text-[11px] font-semibold text-[#1A1816] flex items-center gap-1.5">
                            <span>{tracking}</span>
                          </div>
                          <div className="text-[10px] uppercase tracking-wider text-[#8E877E] mt-0.5">
                            {carrier}
                          </div>
                        </td>

                        {/* Order Logistics Status */}
                        <td className="py-3 px-4 align-top">
                          <span
                            className={`inline-block px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider border ${
                              order.orderStatus === "Delivered"
                                ? "bg-emerald-50 text-emerald-800 border-emerald-300"
                                : order.orderStatus === "In Transit"
                                ? "bg-blue-50 text-blue-800 border-blue-300"
                                : order.orderStatus === "Dispatched"
                                ? "bg-amber-50 text-amber-800 border-amber-300"
                                : "bg-stone-100 text-stone-700 border-stone-300"
                            }`}
                          >
                            {order.orderStatus}
                          </span>
                        </td>

                        {/* Returns column */}
                        <td className="py-3 px-4 align-top">
                          {isReturn ? (
                            <div className="flex flex-col gap-1">
                              <span className="inline-block px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider bg-rose-50 text-rose-800 border border-rose-200">
                                {order.returnStatus || "Return Requested"}
                              </span>
                              {order.returnReason && (
                                <span className="text-[10px] text-[#8E877E] max-w-[140px] truncate">
                                  {order.returnReason}
                                </span>
                              )}
                            </div>
                          ) : (
                            <span className="text-[10px] text-[#8E877E] uppercase">None</span>
                          )}
                        </td>

                        {/* Actions */}
                        <td className="py-3 px-4 align-top text-right space-x-1.5">
                          {/* Quick transition shortcuts */}
                          {order.orderStatus === "Processing" && (
                            <button
                              onClick={() => handleQuickStatusChange(order._id, "Dispatched")}
                              className="px-2.5 py-1 bg-[#1A1816] text-[#FAF8F5] text-[10px] font-bold uppercase tracking-wider hover:bg-[#C5A059] hover:text-[#1A1816] transition-colors"
                              title="Mark Dispatched"
                            >
                              Dispatch
                            </button>
                          )}

                          {order.orderStatus === "Dispatched" && (
                            <button
                              onClick={() => handleQuickStatusChange(order._id, "In Transit")}
                              className="px-2.5 py-1 bg-blue-700 text-white text-[10px] font-bold uppercase tracking-wider hover:bg-blue-800 transition-colors"
                              title="Set In Transit"
                            >
                              In Transit
                            </button>
                          )}

                          {order.orderStatus === "In Transit" && (
                            <button
                              onClick={() => handleQuickStatusChange(order._id, "Delivered")}
                              className="px-2.5 py-1 bg-emerald-700 text-white text-[10px] font-bold uppercase tracking-wider hover:bg-emerald-800 transition-colors"
                              title="Confirm Delivery"
                            >
                              Delivered
                            </button>
                          )}

                          {/* Full Consignment Modal button */}
                          <button
                            onClick={() => handleOpenUpdate(order)}
                            className="px-2.5 py-1 border border-[#E5DFD5] hover:border-[#1A1816] bg-[#F2EFE9] text-[#1A1816] text-[10px] font-bold uppercase tracking-wider transition-colors"
                          >
                            Edit
                          </button>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>

      {/* Edit Consignment Modal */}
      {isUpdateModalOpen && selectedOrder && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#FAF8F5] border border-[#E5DFD5] shadow-2xl max-w-lg w-full p-6 text-[#1A1816]">
            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b border-[#E5DFD5] mb-4">
              <div>
                <p className="text-[10px] uppercase font-bold tracking-[0.2em] text-[#C5A059]">
                  Courier Consignment Docket
                </p>
                <h2 className="font-serif text-xl font-bold uppercase tracking-tight text-[#1A1816]">
                  {selectedOrder.orderNumber}
                </h2>
              </div>
              <button
                onClick={() => setIsUpdateModalOpen(false)}
                className="text-[#8E877E] hover:text-[#1A1816]"
              >
                <X size={20} />
              </button>
            </div>

            {/* Recipient summary */}
            <div className="p-3 bg-[#F2EFE9] border border-[#E5DFD5] mb-4 text-xs space-y-1">
              <div className="font-semibold text-[#1A1816]">
                Client: {selectedOrder.customer?.name}
              </div>
              <div className="text-[#8E877E]">
                Address: {selectedOrder.customer?.address}, {selectedOrder.customer?.city},{" "}
                {selectedOrder.customer?.zip}
              </div>
              <div className="text-[10px] text-[#8E877E] pt-1">
                Articles: {selectedOrder.items?.map((i) => `${i.title} (${i.quantity}x)`).join(", ")}
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmitUpdate} className="space-y-4 text-xs">
              <div>
                <label className="block mb-1 font-bold uppercase tracking-wider text-[#1A1816]">
                  Fulfillment Status
                </label>
                <select
                  value={updateForm.orderStatus}
                  onChange={(e) =>
                    setUpdateForm((prev) => ({ ...prev, orderStatus: e.target.value }))
                  }
                  className="w-full bg-[#FAF8F5] border border-[#E5DFD5] p-2.5 text-xs focus:outline-none focus:border-[#1A1816]"
                >
                  <option value="Processing">Processing (Packaging at Atelier)</option>
                  <option value="Dispatched">Dispatched (Handed to Carrier)</option>
                  <option value="In Transit">In Transit (Out for Delivery)</option>
                  <option value="Delivered">Delivered (Fulfillment Complete)</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </div>

              <div>
                <label className="block mb-1 font-bold uppercase tracking-wider text-[#1A1816]">
                  Tracking Number
                </label>
                <input
                  type="text"
                  value={updateForm.trackingNumber}
                  onChange={(e) =>
                    setUpdateForm((prev) => ({ ...prev, trackingNumber: e.target.value }))
                  }
                  placeholder="Enter courier tracking code (e.g. TRK-...)"
                  className="w-full bg-[#FAF8F5] border border-[#E5DFD5] p-2.5 font-mono text-xs focus:outline-none focus:border-[#1A1816]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block mb-1 font-bold uppercase tracking-wider text-[#1A1816]">
                    Designated Carrier
                  </label>
                  <input
                    type="text"
                    value={updateForm.carrier}
                    onChange={(e) =>
                      setUpdateForm((prev) => ({ ...prev, carrier: e.target.value }))
                    }
                    placeholder="e.g. Royal Sartorial Express"
                    className="w-full bg-[#FAF8F5] border border-[#E5DFD5] p-2.5 text-xs focus:outline-none focus:border-[#1A1816]"
                  />
                </div>

                <div>
                  <label className="block mb-1 font-bold uppercase tracking-wider text-[#1A1816]">
                    Estimated Freight ($)
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    value={updateForm.logisticsCostEstimated}
                    onChange={(e) =>
                      setUpdateForm((prev) => ({
                        ...prev,
                        logisticsCostEstimated: e.target.value,
                      }))
                    }
                    className="w-full bg-[#FAF8F5] border border-[#E5DFD5] p-2.5 text-xs focus:outline-none focus:border-[#1A1816]"
                  />
                </div>
              </div>

              <div>
                <label className="block mb-1 font-bold uppercase tracking-wider text-[#1A1816]">
                  Estimated Delivery Date
                </label>
                <input
                  type="date"
                  value={updateForm.estimatedDeliveryDate}
                  onChange={(e) =>
                    setUpdateForm((prev) => ({
                      ...prev,
                      estimatedDeliveryDate: e.target.value,
                    }))
                  }
                  className="w-full bg-[#FAF8F5] border border-[#E5DFD5] p-2.5 text-xs focus:outline-none focus:border-[#1A1816]"
                />
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex items-center justify-end gap-3 border-t border-[#E5DFD5]">
                <button
                  type="button"
                  onClick={() => setIsUpdateModalOpen(false)}
                  className="px-4 py-2 border border-[#E5DFD5] hover:border-[#1A1816] text-[#8E877E] hover:text-[#1A1816] text-xs uppercase font-bold tracking-wider"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={updating}
                  className="px-5 py-2 bg-[#1A1816] hover:bg-[#C5A059] text-[#FAF8F5] hover:text-[#1A1816] text-xs uppercase font-bold tracking-wider transition-colors"
                >
                  {updating ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
