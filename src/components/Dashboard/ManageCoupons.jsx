import { useState, useEffect } from "react"
import { GetRequest, PostRequest, PutRequest, DeleteRequest } from "../../config/http"
import {
  Tag,
  Plus,
  Trash2,
  CheckCircle,
  XCircle,
  Clock,
  Users,
  Search,
  X,
  Percent,
  DollarSign,
  Calendar,
} from "lucide-react"

export default function ManageCoupons() {
  const [coupons, setCoupons] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [feedback, setFeedback] = useState({ type: "", message: "" })

  // Modal State
  const [modalOpen, setModalOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [formError, setFormError] = useState("")

  // Form Fields
  const [code, setCode] = useState("")
  const [description, setDescription] = useState("")
  const [discountType, setDiscountType] = useState("percentage")
  const [discountValue, setDiscountValue] = useState(20)
  const [minOrderAmount, setMinOrderAmount] = useState(100)
  const [maxUses, setMaxUses] = useState(100)
  const [limitPerUser, setLimitPerUser] = useState(1)
  const [expiryDate, setExpiryDate] = useState("")
  const [isActive, setIsActive] = useState(true)

  const loadCoupons = async () => {
    try {
      setLoading(true)
      const res = await GetRequest("coupons")
      setCoupons(res.data || [])
    } catch (err) {
      console.error("Failed to load coupons:", err)
      showFeedback("error", "Failed to retrieve coupons from database.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadCoupons()
  }, [])

  const showFeedback = (type, message) => {
    setFeedback({ type, message })
    setTimeout(() => setFeedback({ type: "", message: "" }), 3500)
  }

  const handleOpenCreate = () => {
    setCode("")
    setDescription("")
    setDiscountType("percentage")
    setDiscountValue(20)
    setMinOrderAmount(100)
    setMaxUses(100)
    setLimitPerUser(1)
    setExpiryDate("")
    setIsActive(true)
    setFormError("")
    setModalOpen(true)
  }

  const handleToggleActive = async (coupon) => {
    try {
      const res = await PutRequest(`coupons/${coupon._id}`, { isActive: !coupon.isActive })
      setCoupons((prev) => prev.map((c) => (c._id === coupon._id ? res.data : c)))
      showFeedback("success", `Coupon ${coupon.code} status updated.`)
    } catch (err) {
      console.error("Failed to toggle coupon:", err)
      showFeedback("error", "Failed to update coupon status.")
    }
  }

  const handleDeleteCoupon = async (id, couponCode) => {
    if (!window.confirm(`Are you certain you wish to delete coupon "${couponCode}"?`)) return

    try {
      await DeleteRequest(`coupons/${id}`)
      setCoupons((prev) => prev.filter((c) => c._id !== id))
      showFeedback("success", `Coupon "${couponCode}" deleted.`)
    } catch (err) {
      console.error("Failed to delete coupon:", err)
      showFeedback("error", "Failed to delete coupon.")
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setFormError("")

    if (!code.trim()) {
      setFormError("Coupon code is required.")
      return
    }

    if (!discountValue || Number(discountValue) <= 0) {
      setFormError("Please enter a valid discount value.")
      return
    }

    try {
      setSubmitting(true)
      const payload = {
        code: code.trim().toUpperCase(),
        description: description.trim(),
        discountType,
        discountValue: Number(discountValue),
        minOrderAmount: Number(minOrderAmount) || 0,
        maxUses: maxUses ? Number(maxUses) : null,
        limitPerUser: limitPerUser ? Number(limitPerUser) : null,
        expiryDate: expiryDate ? new Date(expiryDate) : null,
        isActive,
      }

      const res = await PostRequest("coupons", payload)
      setCoupons((prev) => [res.data, ...prev])
      setModalOpen(false)
      showFeedback("success", `Discount coupon "${res.data.code}" created successfully.`)
    } catch (err) {
      console.error("Failed to create coupon:", err)
      setFormError(err.response?.data?.message || "Failed to create coupon.")
    } finally {
      setSubmitting(false)
    }
  }

  const filteredCoupons = coupons.filter((c) => {
    if (!searchQuery.trim()) return true
    const q = searchQuery.toLowerCase()
    return c.code?.toLowerCase().includes(q) || c.description?.toLowerCase().includes(q)
  })

  return (
    <div className="space-y-8 font-sans">
      {/* Header */}
      <div className="border-b border-[#E5DFD5] pb-4 flex justify-between items-center">
        <h1 className="font-serif text-2xl font-bold uppercase tracking-tight text-[#1A1816]">
          Coupons
        </h1>

        <button
          onClick={handleOpenCreate}
          className="bg-[#1A1816] text-[#FAF8F5] hover:bg-[#C5A059] hover:text-[#1A1816] px-4 py-2 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
        >
          <Plus size={14} /> <span>Create Coupon</span>
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

      {/* Search Toolbar */}
      <div className="flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8E877E]" />
          <input
            type="text"
            placeholder="SEARCH COUPON CODE OR DESCRIPTION..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-[#E5DFD5] text-xs uppercase tracking-wider placeholder:text-[#8E877E] text-[#1A1816] focus:outline-none focus:border-[#1A1816]"
          />
        </div>

        <span className="text-xs font-semibold text-[#8E877E] uppercase tracking-wider">
          {coupons.length} Coupons Configured
        </span>
      </div>

      {/* Coupons Table */}
      <div className="bg-white border border-[#E5DFD5] overflow-hidden shadow-xs">
        {loading ? (
          <div className="p-16 text-center">
            <div className="w-8 h-8 border-2 border-[#1A1816] border-t-[#C5A059] rounded-full animate-spin mx-auto mb-3"></div>
            <p className="text-xs font-serif uppercase tracking-wider text-[#8E877E]">
              Consulting Privilege Vault...
            </p>
          </div>
        ) : filteredCoupons.length === 0 ? (
          <div className="p-16 text-center text-xs uppercase tracking-wider text-[#8E877E]">
            No discount coupons found. Click "Create Discount Coupon" above to add one.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-[#FAF8F5] border-b border-[#E5DFD5] text-[10px] uppercase font-bold text-[#8E877E] tracking-wider">
                  <th className="p-4">Coupon Code & Description</th>
                  <th className="p-4">Privilege Value</th>
                  <th className="p-4">Min. Spend</th>
                  <th className="p-4">Usage Consumption</th>
                  <th className="p-4">Per-Account Limit</th>
                  <th className="p-4">Expiry Date</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5DFD5]">
                {filteredCoupons.map((coupon) => {
                  const isExpired =
                    coupon.expiryDate && new Date(coupon.expiryDate) < new Date()
                  const isMaxedOut =
                    coupon.maxUses !== null && coupon.usedCount >= coupon.maxUses

                  return (
                    <tr key={coupon._id} className="hover:bg-[#FAF8F5]/60 transition-colors">
                      {/* Code */}
                      <td className="p-4">
                        <span className="font-mono font-bold text-sm tracking-wider text-[#1A1816] bg-[#FAF8F5] px-2 py-0.5 border border-[#E5DFD5] inline-block">
                          {coupon.code}
                        </span>
                        {coupon.description && (
                          <span className="text-[#8E877E] block text-[11px] mt-1 max-w-xs truncate">
                            {coupon.description}
                          </span>
                        )}
                      </td>

                      {/* Value */}
                      <td className="p-4">
                        <span className="font-serif font-bold text-base text-[#1A1816]">
                          {coupon.discountType === "percentage"
                            ? `${coupon.discountValue}% OFF`
                            : `$${coupon.discountValue.toFixed(2)} OFF`}
                        </span>
                      </td>

                      {/* Min Spend */}
                      <td className="p-4">
                        <span className="text-[#6A645D] font-medium">
                          {coupon.minOrderAmount > 0 ? `$${coupon.minOrderAmount.toFixed(2)}` : "No Min."}
                        </span>
                      </td>

                      {/* Usage Limits */}
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-[#1A1816]">{coupon.usedCount}</span>
                          <span className="text-[#8E877E]">/</span>
                          <span className="text-[#8E877E]">
                            {coupon.maxUses !== null ? `${coupon.maxUses} uses` : "Unlimited"}
                          </span>
                        </div>
                        {isMaxedOut && (
                          <span className="text-[9px] text-[#78281F] font-bold uppercase block mt-0.5">
                            Limit Exhausted
                          </span>
                        )}
                      </td>

                      {/* Limit Per User */}
                      <td className="p-4">
                        <span className="text-[#6A645D]">
                          {coupon.limitPerUser !== null
                            ? `${coupon.limitPerUser} use per patron`
                            : "Unlimited"}
                        </span>
                      </td>

                      {/* Expiry */}
                      <td className="p-4">
                        {coupon.expiryDate ? (
                          <span className={isExpired ? "text-[#78281F] font-bold" : "text-[#6A645D]"}>
                            {new Date(coupon.expiryDate).toLocaleDateString()}
                            {isExpired && " (Expired)"}
                          </span>
                        ) : (
                          <span className="text-[#8E877E]">Perpetual</span>
                        )}
                      </td>

                      {/* Status */}
                      <td className="p-4">
                        <button
                          onClick={() => handleToggleActive(coupon)}
                          className={`text-[9px] font-bold uppercase px-2.5 py-1 transition-colors cursor-pointer ${
                            coupon.isActive && !isExpired && !isMaxedOut
                              ? "bg-[#1C352D]/10 text-[#1C352D] border border-[#1C352D]/30"
                              : "bg-[#78281F]/10 text-[#78281F] border border-[#78281F]/30"
                          }`}
                        >
                          {coupon.isActive && !isExpired && !isMaxedOut ? "Active" : "Disabled"}
                        </button>
                      </td>

                      {/* Delete Action */}
                      <td className="p-4 text-center">
                        <button
                          onClick={() => handleDeleteCoupon(coupon._id, coupon.code)}
                          className="p-1.5 text-[#8E877E] hover:text-[#78281F] transition-colors cursor-pointer"
                          title="Delete Coupon"
                        >
                          <Trash2 size={16} />
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

      {/* Create Coupon Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white border border-[#E5DFD5] max-w-xl w-full max-h-[90vh] overflow-y-auto p-6 sm:p-8 shadow-2xl space-y-6">
            <div className="flex justify-between items-start border-b border-[#E5DFD5] pb-4">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-[#C5A059] block mb-0.5">
                  Privilege Configuration
                </span>
                <h2 className="font-serif text-2xl font-bold text-[#1A1816]">
                  Create Promotional Coupon
                </h2>
              </div>
              <button
                onClick={() => setModalOpen(false)}
                className="p-1.5 text-[#8E877E] hover:text-[#1A1816] cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            {formError && (
              <div className="p-3 bg-[#78281F]/10 border border-[#78281F] text-[#78281F] text-xs">
                {formError}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4 text-xs font-bold uppercase tracking-wider">
              {/* Code */}
              <div className="space-y-1.5">
                <label className="text-[#8E877E]">Promotional Code *</label>
                <input
                  type="text"
                  required
                  placeholder="E.G. HERITAGE20, BESPOKE50"
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  className="w-full bg-[#FAF8F5] border border-[#E5DFD5] p-3 font-mono text-sm tracking-wider focus:outline-none focus:border-[#1A1816] text-[#1A1816]"
                />
              </div>

              {/* Description */}
              <div className="space-y-1.5">
                <label className="text-[#8E877E]">Description (Optional)</label>
                <input
                  type="text"
                  placeholder="E.G. 20% DISCOUNT FOR PRIVATE CLUB PATRONS"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-[#FAF8F5] border border-[#E5DFD5] p-3 text-xs font-normal focus:outline-none focus:border-[#1A1816] text-[#1A1816]"
                />
              </div>

              {/* Type & Value */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[#8E877E]">Discount Type</label>
                  <select
                    value={discountType}
                    onChange={(e) => setDiscountType(e.target.value)}
                    className="w-full bg-[#FAF8F5] border border-[#E5DFD5] p-3 text-xs focus:outline-none focus:border-[#1A1816] text-[#1A1816] cursor-pointer"
                  >
                    <option value="percentage">Percentage (%) Off</option>
                    <option value="fixed">Fixed Amount ($) Off</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[#8E877E]">
                    {discountType === "percentage" ? "Percentage Value (%) *" : "Fixed Dollar Value ($) *"}
                  </label>
                  <input
                    type="number"
                    min="1"
                    max={discountType === "percentage" ? 100 : 10000}
                    required
                    value={discountValue}
                    onChange={(e) => setDiscountValue(e.target.value)}
                    className="w-full bg-[#FAF8F5] border border-[#E5DFD5] p-3 font-mono text-xs focus:outline-none focus:border-[#1A1816] text-[#1A1816]"
                  />
                </div>
              </div>

              {/* Min Spend */}
              <div className="space-y-1.5">
                <label className="text-[#8E877E]">Minimum Order Qualifying Subtotal ($)</label>
                <input
                  type="number"
                  min="0"
                  value={minOrderAmount}
                  onChange={(e) => setMinOrderAmount(e.target.value)}
                  placeholder="0 (No minimum)"
                  className="w-full bg-[#FAF8F5] border border-[#E5DFD5] p-3 font-mono text-xs focus:outline-none focus:border-[#1A1816] text-[#1A1816]"
                />
              </div>

              {/* Usage Limits */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[#8E877E]">Global Total Uses Limit</label>
                  <input
                    type="number"
                    min="1"
                    value={maxUses}
                    onChange={(e) => setMaxUses(e.target.value)}
                    placeholder="E.G. 100 OR 1 USE"
                    className="w-full bg-[#FAF8F5] border border-[#E5DFD5] p-3 font-mono text-xs focus:outline-none focus:border-[#1A1816] text-[#1A1816]"
                  />
                  <p className="text-[10px] text-[#8E877E] font-normal lowercase tracking-normal">
                    Leave blank for unlimited storewide redemptions.
                  </p>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[#8E877E]">Limit Per Patron Account</label>
                  <input
                    type="number"
                    min="1"
                    value={limitPerUser}
                    onChange={(e) => setLimitPerUser(e.target.value)}
                    placeholder="E.G. 1 USE PER USER"
                    className="w-full bg-[#FAF8F5] border border-[#E5DFD5] p-3 font-mono text-xs focus:outline-none focus:border-[#1A1816] text-[#1A1816]"
                  />
                  <p className="text-[10px] text-[#8E877E] font-normal lowercase tracking-normal">
                    Prevents multiple redemptions by the same account.
                  </p>
                </div>
              </div>

              {/* Expiry Date */}
              <div className="space-y-1.5">
                <label className="text-[#8E877E]">Expiration Date (Optional)</label>
                <input
                  type="date"
                  value={expiryDate}
                  onChange={(e) => setExpiryDate(e.target.value)}
                  className="w-full bg-[#FAF8F5] border border-[#E5DFD5] p-3 text-xs focus:outline-none focus:border-[#1A1816] text-[#1A1816]"
                />
              </div>

              {/* Submit Buttons */}
              <div className="border-t border-[#E5DFD5] pt-4 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-5 py-2.5 border border-[#E5DFD5] text-xs font-bold uppercase tracking-wider text-[#1A1816] hover:bg-[#FAF8F5] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-2.5 bg-[#1A1816] text-[#FAF8F5] hover:bg-[#C5A059] hover:text-[#1A1816] text-xs font-bold uppercase tracking-wider transition-colors disabled:opacity-50 cursor-pointer"
                >
                  {submitting ? "Inscribing Coupon..." : "Publish Coupon"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
