import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { GetRequest, PostRequest } from "../config/http"
import {
  FileText,
  Printer,
  Search,
  Plus,
  RefreshCw,
  CreditCard,
  Banknote,
  ArrowLeft,
  X,
  UserCheck,
} from "lucide-react"

export default function SalespersonDashboard() {
  const [orders, setOrders] = useState([])
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedInvoiceOrder, setSelectedInvoiceOrder] = useState(null)
  const [isCustomBillModalOpen, setIsCustomBillModalOpen] = useState(false)

  const salespersonName = localStorage.getItem("name") || "Salesperson"

  // In-Store Sales Billing Form State
  const [customBill, setCustomBill] = useState({
    soldBy: salespersonName,
    customerName: "",
    customerEmail: "",
    productId: "",
    itemTitle: "",
    quantity: 1,
    unitPrice: 0,
    paymentMethod: "card",
    discountPercentage: 0,
  })

  const loadDashboardData = async () => {
    try {
      setLoading(true)
      const [ordersRes, prodsRes] = await Promise.all([
        GetRequest("orders/all").catch(() => ({ data: [] })),
        GetRequest("products").catch(() => ({ data: [] })),
      ])
      setOrders(ordersRes.data || [])
      setProducts(prodsRes.data || [])
    } catch (err) {
      console.error("Failed to load dashboard data for salesperson:", err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadDashboardData()
  }, [])

  const handleOpenCreateBill = () => {
    const currentSalesperson = localStorage.getItem("name") || "Salesperson"
    const firstProduct = products && products.length > 0 ? products[0] : null

    setCustomBill({
      soldBy: currentSalesperson,
      customerName: "",
      customerEmail: "",
      productId: firstProduct ? firstProduct._id : "",
      itemTitle: firstProduct ? firstProduct.title : "",
      quantity: 1,
      unitPrice: firstProduct ? Number(firstProduct.price || 0) : 0,
      paymentMethod: "card",
      discountPercentage: 0,
    })
    setIsCustomBillModalOpen(true)
  }

  const handleItemSelect = (selectedId) => {
    const selected = products.find((p) => String(p._id) === String(selectedId))
    if (selected) {
      setCustomBill((prev) => ({
        ...prev,
        productId: selected._id,
        itemTitle: selected.title,
        unitPrice: Number(selected.price || 0),
      }))
    } else {
      setCustomBill((prev) => ({
        ...prev,
        productId: "",
        itemTitle: "",
        unitPrice: 0,
      }))
    }
  }

  const handlePrint = () => {
    window.print()
  }

  const [submittingBill, setSubmittingBill] = useState(false)
  const [billError, setBillError] = useState("")

  const handleCreateCustomBill = async (e) => {
    e.preventDefault()
    setSubmittingBill(true)
    setBillError("")

    const subtotal = Number(customBill.unitPrice) * Number(customBill.quantity)
    const discountPercent = Math.max(0, Math.min(100, Number(customBill.discountPercentage) || 0))
    const discountAmount = (subtotal * discountPercent) / 100
    const totalAmount = Math.max(0, subtotal - discountAmount)

    const selectedProd = products.find((p) => String(p._id) === String(customBill.productId))
    const itemImage = selectedProd?.image || (selectedProd?.images && selectedProd.images[0]) || ""

    const payload = {
      soldBy: customBill.soldBy || salespersonName,
      customerName: customBill.customerName,
      customerEmail: customBill.customerEmail,
      productId: customBill.productId || null,
      itemTitle: customBill.itemTitle || (selectedProd ? selectedProd.title : "Custom Item"),
      unitPrice: Number(customBill.unitPrice),
      quantity: Number(customBill.quantity),
      discountPercentage: discountPercent,
      discountAmount,
      totalAmount,
      paymentMethod: customBill.paymentMethod,
      image: itemImage,
    }

    try {
      const res = await PostRequest("orders/in-store-bill", payload)
      const savedBill = res.data
      setOrders((prev) => [savedBill, ...prev])
      setSelectedInvoiceOrder(savedBill)
      setProducts((prev) =>
        prev.map((p) =>
          String(p._id) === String(customBill.productId)
            ? { ...p, stock: Math.max(0, (Number(p.stock) || 10) - Number(customBill.quantity || 1)) }
            : p
        )
      )
      setIsCustomBillModalOpen(false)
      loadDashboardData()
    } catch (err) {
      console.error("Failed to save bill in database, saving locally:", err)
      const timestamp = Date.now().toString().slice(-4)
      const random = Math.floor(1000 + Math.random() * 9000)
      const localBill = {
        _id: `custom_${Date.now()}`,
        orderNumber: `BILL-${new Date().getFullYear()}-${timestamp}${random}`,
        invoiceNumber: `INV-${new Date().getFullYear()}-${timestamp}${random}`,
        soldBy: customBill.soldBy || salespersonName,
        trackingNumber: "",
        createdAt: new Date().toISOString(),
        customer: {
          name: customBill.customerName,
          email: customBill.customerEmail,
          address: "In-Store Purchase",
          city: "Atelier Boutique",
          country: "In-Store",
        },
        items: [
          {
            productId: customBill.productId || null,
            title: customBill.itemTitle || (selectedProd ? selectedProd.title : "Custom Item"),
            price: Number(customBill.unitPrice),
            quantity: Number(customBill.quantity),
            size: "Standard",
            color: "Classic",
            image: itemImage,
          },
        ],
        subtotal,
        discountAmount,
        discountPercentage: discountPercent,
        shippingFee: 0,
        totalAmount,
        paymentMethod: customBill.paymentMethod,
        paymentStatus: "Paid",
        orderStatus: "Delivered",
      }
      setOrders((prev) => [localBill, ...prev])
      setSelectedInvoiceOrder(localBill)
      setIsCustomBillModalOpen(false)
    } finally {
      setSubmittingBill(false)
    }
  }

  const filteredOrders = orders.filter((o) => {
    if (!searchQuery.trim()) return true
    const q = searchQuery.toLowerCase()
    return (
      o.orderNumber?.toLowerCase().includes(q) ||
      o.customer?.name?.toLowerCase().includes(q) ||
      o.customer?.email?.toLowerCase().includes(q) ||
      (o.soldBy && o.soldBy.toLowerCase().includes(q))
    )
  })

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-[#1A1816] font-sans p-6 sm:p-10">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Top Header */}
        <div className="border-b border-[#E5DFD5] pb-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center gap-4">
            <Link
              to="/"
              className="text-xs uppercase font-bold text-[#8E877E] hover:text-[#1A1816] flex items-center gap-1.5 no-underline"
            >
              <ArrowLeft size={14} /> Storefront
            </Link>
            <span className="text-[#E5DFD5]">|</span>
            <h1 className="font-serif text-2xl font-bold uppercase tracking-tight text-[#1A1816]">
              Sales Bills
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleOpenCreateBill}
              className="bg-[#1A1816] text-[#FAF8F5] hover:bg-[#C5A059] hover:text-[#1A1816] px-3.5 py-1.5 text-xs font-bold uppercase tracking-wider transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <Plus size={14} />
              <span>Create Bill</span>
            </button>

            <button
              onClick={loadDashboardData}
              className="border border-[#E5DFD5] hover:border-[#1A1816] px-2.5 py-1 text-xs font-semibold text-[#1A1816] hover:bg-[#FAF8F5] transition-colors cursor-pointer flex items-center gap-1.5"
              title="Refresh"
            >
              <RefreshCw size={11} className={loading ? "animate-spin" : ""} />
              <span>Refresh</span>
            </button>
          </div>
        </div>

        {/* Search Toolbar */}
        <div className="relative max-w-md">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8E877E]" />
          <input
            type="text"
            placeholder="Search bill #, customer, or salesperson..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-white border border-[#E5DFD5] text-xs uppercase tracking-wider placeholder:text-[#8E877E] text-[#1A1816] focus:outline-none focus:border-[#1A1816]"
          />
        </div>

        {/* Sales Bills Registry Table */}
        <div className="bg-white border border-[#E5DFD5] overflow-hidden shadow-xs">
          {loading ? (
            <div className="p-16 text-center">
              <div className="w-8 h-8 border-2 border-[#1A1816] border-t-[#C5A059] rounded-full animate-spin mx-auto mb-3"></div>
              <p className="text-xs uppercase tracking-wider text-[#8E877E]">
                Loading Sales Bills...
              </p>
            </div>
          ) : filteredOrders.length === 0 ? (
            <div className="p-16 text-center text-xs uppercase tracking-wider text-[#8E877E]">
              No sales bills found.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-[#FAF8F5] border-b border-[#E5DFD5] text-[10px] uppercase font-bold text-[#8E877E] tracking-wider">
                    <th className="p-4">Bill #</th>
                    <th className="p-4">Customer</th>
                    <th className="p-4">Sold By</th>
                    <th className="p-4">Items Sold</th>
                    <th className="p-4">Settlement</th>
                    <th className="p-4 text-right">Total</th>
                    <th className="p-4 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E5DFD5]">
                  {filteredOrders.map((order) => {
                    const seller = order.soldBy || (order._id?.startsWith("custom_") ? salespersonName : "In-Store Staff")
                    const isCOD = order.paymentMethod === "cod"

                    return (
                      <tr key={order._id} className="hover:bg-[#FAF8F5]/60 transition-colors">
                        <td className="p-4 font-mono font-bold text-sm text-[#1A1816]">
                          {order.orderNumber}
                          <span className="block text-[10px] text-[#8E877E] font-sans font-normal mt-0.5">
                            {new Date(order.createdAt).toLocaleDateString()}
                          </span>
                        </td>

                        <td className="p-4">
                          <span className="font-bold text-[#1A1816] block">{order.customer?.name}</span>
                          <span className="text-[#8E877E] text-[11px] block">{order.customer?.email}</span>
                        </td>

                        <td className="p-4">
                          <div className="flex items-center gap-1.5 text-xs font-semibold text-[#1A1816]">
                            <UserCheck size={13} className="text-[#C5A059]" />
                            <span>{seller}</span>
                          </div>
                        </td>

                        <td className="p-4">
                          <div className="space-y-0.5 max-w-xs">
                            {order.items?.map((item, idx) => (
                              <div key={idx} className="text-xs font-medium text-[#1A1816]">
                                {item.title || item.name}{" "}
                                <span className="text-[#8E877E] text-[10px]">&times; {item.quantity || 1}</span>
                              </div>
                            ))}
                          </div>
                        </td>

                        <td className="p-4">
                          <div className="flex items-center gap-1 text-[#1A1816] font-semibold text-[11px]">
                            {isCOD ? <Banknote size={13} className="text-[#C5A059]" /> : <CreditCard size={13} />}
                            <span>{isCOD ? "Cash" : "Card"}</span>
                          </div>
                          <span className="inline-block text-[9px] uppercase font-bold text-emerald-800 bg-emerald-50 px-1.5 py-0.2 mt-0.5 border border-emerald-200">
                            {order.paymentStatus || "Paid"}
                          </span>
                        </td>

                        <td className="p-4 text-right font-serif font-bold text-sm text-[#1A1816]">
                          ${Number(order.totalAmount || 0).toFixed(2)}
                        </td>

                        <td className="p-4 text-center">
                          <button
                            onClick={() => setSelectedInvoiceOrder({ ...order, soldBy: seller })}
                            className="bg-[#1A1816] hover:bg-[#C5A059] text-white hover:text-[#1A1816] px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider transition-colors inline-flex items-center gap-1.5 cursor-pointer shadow-xs"
                          >
                            <FileText size={13} />
                            <span>View Bill</span>
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

        {/* Printable In-Store Bill Modal */}
        {selectedInvoiceOrder && (
          <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
            <div className="bg-white border border-[#E5DFD5] max-w-2xl w-full max-h-[92vh] overflow-y-auto p-6 sm:p-10 shadow-2xl relative">
              <button
                onClick={() => setSelectedInvoiceOrder(null)}
                className="absolute top-5 right-5 text-[#8E877E] hover:text-[#1A1816] cursor-pointer print:hidden"
              >
                <X size={20} />
              </button>

              {/* Printable Invoice Header */}
              <div className="border-b-2 border-[#1A1816] pb-6 flex justify-between items-start">
                <div>
                  <div className="font-serif font-bold text-2xl tracking-[0.2em] flex items-center gap-2 mb-1 text-[#1A1816]">
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
                  </div>
                  <p className="text-[10px] uppercase font-bold tracking-[0.2em] text-[#C5A059]">
                    Official In-Store Sales Receipt
                  </p>
                </div>

                <div className="text-right text-xs">
                  <p className="font-mono font-bold text-base text-[#1A1816]">
                    {selectedInvoiceOrder.orderNumber}
                  </p>
                  <p className="text-[#8E877E]">
                    {new Date(selectedInvoiceOrder.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>

              {/* Bill Details: Customer and Sold By */}
              <div className="grid grid-cols-2 gap-6 my-6 text-xs bg-[#FAF8F5] p-4 border border-[#E5DFD5]">
                <div>
                  <span className="text-[10px] uppercase font-bold text-[#8E877E] block mb-1">
                    Customer
                  </span>
                  <p className="font-bold text-[#1A1816]">{selectedInvoiceOrder.customer?.name}</p>
                  <p className="text-[#8E877E]">{selectedInvoiceOrder.customer?.email}</p>
                </div>

                <div className="border-l border-[#E5DFD5] pl-4">
                  <span className="text-[10px] uppercase font-bold text-[#C5A059] block mb-1">
                    Sold By (Salesperson)
                  </span>
                  <p className="font-bold text-[#1A1816] text-sm">
                    {selectedInvoiceOrder.soldBy || salespersonName}
                  </p>
                  <p className="text-[#8E877E] text-[10px]">In-Store Counter Presentation</p>
                </div>
              </div>

              {/* Items List */}
              <table className="w-full text-xs text-left mb-6 border-collapse">
                <thead>
                  <tr className="border-b border-[#E5DFD5] text-[#8E877E] uppercase text-[10px] font-bold">
                    <th className="py-2">Item Description</th>
                    <th className="py-2 text-center">Qty</th>
                    <th className="py-2 text-right">Price</th>
                    <th className="py-2 text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E5DFD5]">
                  {selectedInvoiceOrder.items?.map((item, idx) => (
                    <tr key={idx} className="py-2">
                      <td className="py-2.5 font-medium text-[#1A1816]">{item.title || item.name}</td>
                      <td className="py-2.5 text-center text-[#8E877E]">{item.quantity}</td>
                      <td className="py-2.5 text-right font-mono">${Number(item.price).toFixed(2)}</td>
                      <td className="py-2.5 text-right font-mono font-bold text-[#1A1816]">
                        ${(Number(item.price) * Number(item.quantity)).toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Totals */}
              <div className="border-t border-[#1A1816] pt-4 space-y-1.5 text-xs text-right">
                <div className="flex justify-between text-[#8E877E]">
                  <span>Subtotal:</span>
                  <span className="font-mono">
                    ${(Number(selectedInvoiceOrder.subtotal) || Number(selectedInvoiceOrder.totalAmount)).toFixed(2)}
                  </span>
                </div>
                {selectedInvoiceOrder.discountAmount > 0 && (
                  <div className="flex justify-between text-[#78281F]">
                    <span>Discount:</span>
                    <span className="font-mono">-${Number(selectedInvoiceOrder.discountAmount).toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between text-base font-bold text-[#1A1816] pt-2 border-t border-[#E5DFD5]">
                  <span>Total Settled:</span>
                  <span className="font-mono font-bold">
                    ${Number(selectedInvoiceOrder.totalAmount || 0).toFixed(2)}
                  </span>
                </div>
                <div className="text-[11px] text-[#8E877E] pt-1">
                  Payment: {selectedInvoiceOrder.paymentMethod === "cod" ? "Cash" : "Card"} ({selectedInvoiceOrder.paymentStatus || "Paid"})
                </div>
              </div>

              {/* Printable Modal Actions */}
              <div className="mt-8 pt-4 border-t border-[#E5DFD5] flex justify-end gap-3 print:hidden">
                <button
                  onClick={() => setSelectedInvoiceOrder(null)}
                  className="px-4 py-2 border border-[#E5DFD5] text-xs uppercase font-bold tracking-wider text-[#8E877E] hover:text-[#1A1816] cursor-pointer"
                >
                  Close
                </button>
                <button
                  onClick={handlePrint}
                  className="px-5 py-2 bg-[#1A1816] text-[#FAF8F5] hover:bg-[#C5A059] hover:text-[#1A1816] text-xs uppercase font-bold tracking-wider transition-colors flex items-center gap-2 cursor-pointer shadow-xs"
                >
                  <Printer size={15} />
                  Print Receipt / Bill
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal: Create In-Store Bill */}
        {isCustomBillModalOpen && (
          <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
            <div className="bg-white border border-[#E5DFD5] max-w-lg w-full p-6 sm:p-8 relative shadow-2xl">
              <button
                onClick={() => setIsCustomBillModalOpen(false)}
                className="absolute top-4 right-4 text-[#8E877E] hover:text-[#1A1816] cursor-pointer"
              >
                <X size={20} />
              </button>

              <h2 className="font-serif text-2xl font-bold uppercase tracking-tight text-[#1A1816] mb-4">
                Generate In-Store Bill
              </h2>

              <form onSubmit={handleCreateCustomBill} className="space-y-4 text-xs font-semibold uppercase tracking-wider">
                <div>
                  <label className="block mb-1 text-[#8E877E]">Sold By (Salesperson)</label>
                  <input
                    type="text"
                    required
                    readOnly
                    value={customBill.soldBy || salespersonName}
                    className="w-full p-2.5 bg-[#FAF8F5] border border-[#E5DFD5] text-xs font-semibold text-[#1A1816] focus:outline-none cursor-default"
                  />
                </div>

                <div>
                  <label className="block mb-1 text-[#8E877E]">Customer Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Johnathan Smith"
                    value={customBill.customerName}
                    onChange={(e) => setCustomBill({ ...customBill, customerName: e.target.value })}
                    className="w-full p-2.5 bg-white border border-[#E5DFD5] text-xs text-[#1A1816] focus:outline-none focus:border-[#C5A059]"
                  />
                </div>

                <div>
                  <label className="block mb-1 text-[#8E877E]">Customer Email</label>
                  <input
                    type="email"
                    required
                    placeholder="client@domain.com"
                    value={customBill.customerEmail}
                    onChange={(e) => setCustomBill({ ...customBill, customerEmail: e.target.value })}
                    className="w-full p-2.5 bg-white border border-[#E5DFD5] text-xs text-[#1A1816] focus:outline-none focus:border-[#C5A059]"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-[#8E877E]">Item Sold</label>
                    <span className="text-[10px] text-[#8E877E]">
                      {products.length > 0 ? `${products.length} Items in Inventory` : "Loading items..."}
                    </span>
                  </div>
                  {products.length > 0 ? (
                    <select
                      required
                      value={customBill.productId}
                      onChange={(e) => handleItemSelect(e.target.value)}
                      className="w-full p-2.5 bg-white border border-[#E5DFD5] text-xs text-[#1A1816] focus:outline-none focus:border-[#C5A059]"
                    >
                      <option value="">-- Select an Item --</option>
                      {products.map((p) => (
                        <option key={p._id} value={p._id}>
                          {p.title} (${Number(p.price || 0).toFixed(2)}) — Stock: {p.stock !== undefined ? p.stock : 10}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type="text"
                      required
                      placeholder="Enter item title"
                      value={customBill.itemTitle}
                      onChange={(e) => setCustomBill({ ...customBill, itemTitle: e.target.value })}
                      className="w-full p-2.5 bg-white border border-[#E5DFD5] text-xs text-[#1A1816] focus:outline-none focus:border-[#C5A059]"
                    />
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block mb-1 text-[#8E877E]">Unit Price ($)</label>
                    <input
                      type="number"
                      required
                      min="0"
                      step="0.01"
                      value={customBill.unitPrice}
                      onChange={(e) => setCustomBill({ ...customBill, unitPrice: e.target.value })}
                      className="w-full p-2.5 bg-[#FAF8F5] border border-[#E5DFD5] text-xs font-semibold text-[#1A1816] focus:outline-none focus:border-[#C5A059]"
                    />
                  </div>
                  <div>
                    <label className="block mb-1 text-[#8E877E]">Quantity</label>
                    <input
                      type="number"
                      required
                      min="1"
                      value={customBill.quantity}
                      onChange={(e) => setCustomBill({ ...customBill, quantity: e.target.value })}
                      className="w-full p-2.5 bg-white border border-[#E5DFD5] text-xs text-[#1A1816] focus:outline-none focus:border-[#C5A059]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block mb-1 text-[#8E877E]">Payment Method</label>
                    <select
                      value={customBill.paymentMethod}
                      onChange={(e) => setCustomBill({ ...customBill, paymentMethod: e.target.value })}
                      className="w-full p-2.5 bg-white border border-[#E5DFD5] text-xs text-[#1A1816] focus:outline-none focus:border-[#1A1816]"
                    >
                      <option value="card">Card Payment</option>
                      <option value="cod">Cash at Counter</option>
                    </select>
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-[#8E877E]">Discount (%)</label>
                      {Number(customBill.discountPercentage || 0) > 0 && (
                        <span className="text-[10px] text-[#C5A059] font-bold">
                          -${(
                            ((Number(customBill.unitPrice || 0) * Number(customBill.quantity || 1)) *
                              Number(customBill.discountPercentage || 0)) /
                            100
                          ).toFixed(2)}
                        </span>
                      )}
                    </div>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      step="1"
                      placeholder="0"
                      value={customBill.discountPercentage}
                      onChange={(e) =>
                        setCustomBill({
                          ...customBill,
                          discountPercentage:
                            e.target.value === ""
                              ? ""
                              : Math.max(0, Math.min(100, Number(e.target.value))),
                        })
                      }
                      className="w-full p-2.5 bg-white border border-[#E5DFD5] text-xs text-[#1A1816] focus:outline-none focus:border-[#C5A059]"
                    />
                  </div>
                </div>

                {/* Live Bill Summary */}
                <div className="p-3 bg-[#FAF8F5] border border-[#E5DFD5] text-xs space-y-1">
                  <div className="flex justify-between text-[#8E877E]">
                    <span>Subtotal:</span>
                    <span className="font-mono text-[#1A1816]">
                      ${(Number(customBill.unitPrice || 0) * Number(customBill.quantity || 1)).toFixed(2)}
                    </span>
                  </div>
                  {Number(customBill.discountPercentage || 0) > 0 && (
                    <div className="flex justify-between text-[#C5A059]">
                      <span>Discount ({customBill.discountPercentage}%):</span>
                      <span className="font-mono">
                        -${(
                          ((Number(customBill.unitPrice || 0) * Number(customBill.quantity || 1)) *
                            Number(customBill.discountPercentage || 0)) /
                          100
                        ).toFixed(2)}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between font-bold text-[#1A1816] pt-1.5 border-t border-[#E5DFD5]">
                    <span>Total Settled:</span>
                    <span className="font-mono text-sm text-[#1A1816]">
                      ${Math.max(
                        0,
                        (Number(customBill.unitPrice || 0) * Number(customBill.quantity || 1)) -
                          (((Number(customBill.unitPrice || 0) * Number(customBill.quantity || 1)) *
                            Number(customBill.discountPercentage || 0)) /
                            100)
                      ).toFixed(2)}
                    </span>
                  </div>
                </div>

                <div className="pt-4 flex justify-end gap-3 border-t border-[#E5DFD5]">
                  <button
                    type="button"
                    onClick={() => setIsCustomBillModalOpen(false)}
                    className="px-4 py-2 border border-[#E5DFD5] text-xs text-[#8E877E] hover:text-[#1A1816] cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2 bg-[#1A1816] text-[#FAF8F5] hover:bg-[#C5A059] hover:text-[#1A1816] text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer shadow-xs"
                  >
                    Generate Bill
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
