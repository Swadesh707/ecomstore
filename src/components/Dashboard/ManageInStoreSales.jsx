import { useState, useEffect, useMemo } from "react"
import { GetRequest } from "../../config/http"
import {
  Receipt,
  Search,
  RefreshCw,
  UserCheck,
  FileText,
  Printer,
  X,
  TrendingUp,
  Package,
  Users,
} from "lucide-react"

export default function ManageInStoreSales() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedBill, setSelectedBill] = useState(null)

  const loadBills = async () => {
    try {
      setLoading(true)
      const res = await GetRequest("orders/all")
      const allOrders = res.data || []
      // Filter for in-store sales bills
      const inStoreOnly = allOrders.filter(
        (o) =>
          o.orderNumber?.startsWith("BILL-") ||
          (o.soldBy && o.soldBy.trim() !== "") ||
          o.customer?.address === "In-Store Purchase"
      )
      setOrders(inStoreOnly)
    } catch (err) {
      console.error("Failed to load in-store sales bills:", err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadBills()
  }, [])

  // Filtered by search query (without customer name)
  const filteredBills = useMemo(() => {
    if (!searchQuery.trim()) return orders
    const q = searchQuery.toLowerCase()
    return orders.filter((o) => {
      const matchBillNo = o.orderNumber?.toLowerCase().includes(q)
      const matchInvoiceNo = o.invoiceNumber?.toLowerCase().includes(q)
      const matchSeller = o.soldBy?.toLowerCase().includes(q)
      const matchItems = o.items?.some((it) =>
        it.title?.toLowerCase().includes(q)
      )
      return matchBillNo || matchInvoiceNo || matchSeller || matchItems
    })
  }, [orders, searchQuery])

  // Summary Metrics
  const metrics = useMemo(() => {
    const totalRevenue = orders.reduce(
      (sum, o) => sum + (Number(o.totalAmount) || 0),
      0
    )
    const staffSet = new Set(
      orders.map((o) => o.soldBy).filter((name) => Boolean(name))
    )
    const totalItemsCount = orders.reduce((sum, o) => {
      const orderItems = o.items || []
      return (
        sum +
        orderItems.reduce((iSum, it) => iSum + (Number(it.quantity) || 1), 0)
      )
    }, 0)

    return {
      revenue: totalRevenue,
      billsCount: orders.length,
      staffCount: staffSet.size || 1,
      itemsSold: totalItemsCount,
    }
  }, [orders])

  const handlePrint = () => {
    window.print()
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-[#E6E2DE]">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-serif font-bold text-[#1A1816]">
              In-Store Sales
            </h1>
            <span className="bg-[#1A1816] text-[#FAF8F5] text-xs font-bold px-2.5 py-0.5 rounded-full">
              {orders.length}
            </span>
          </div>
          <p className="text-xs text-[#6A645D] mt-1">
            Registry of counter sales and custom bills authorized by sales staff.
          </p>
        </div>

        <button
          onClick={loadBills}
          disabled={loading}
          className="p-2 border border-[#D5D0C9] bg-white hover:bg-[#F3EFEA] text-[#1A1816] transition-colors rounded cursor-pointer self-start sm:self-auto"
          title="Refresh Sales"
        >
          <RefreshCw size={15} className={loading ? "animate-spin" : ""} />
        </button>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 bg-white border border-[#E6E2DE] shadow-xs">
          <div className="flex items-center justify-between text-[#8E877E] mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider">
              In-Store Revenue
            </span>
            <TrendingUp size={16} className="text-[#C5A059]" />
          </div>
          <p className="text-xl font-serif font-bold text-[#1A1816]">
            ${metrics.revenue.toFixed(2)}
          </p>
        </div>

        <div className="p-4 bg-white border border-[#E6E2DE] shadow-xs">
          <div className="flex items-center justify-between text-[#8E877E] mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider">
              Total Bills
            </span>
            <Receipt size={16} className="text-[#C5A059]" />
          </div>
          <p className="text-xl font-serif font-bold text-[#1A1816]">
            {metrics.billsCount}
          </p>
        </div>

        <div className="p-4 bg-white border border-[#E6E2DE] shadow-xs">
          <div className="flex items-center justify-between text-[#8E877E] mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider">
              Authorized Staff
            </span>
            <Users size={16} className="text-[#C5A059]" />
          </div>
          <p className="text-xl font-serif font-bold text-[#1A1816]">
            {metrics.staffCount} Salesperson{metrics.staffCount > 1 ? "s" : ""}
          </p>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white p-4 border border-[#E6E2DE] shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9C948A]"
          />
          <input
            type="text"
            placeholder="Search bill #, salesperson, or item..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs border border-[#D5D0C9] rounded focus:border-[#C5A059] focus:outline-none"
          />
        </div>

        <div className="text-xs text-[#6A645D]">
          Showing <span className="font-bold text-[#1A1816]">{filteredBills.length}</span> of{" "}
          <span className="font-bold text-[#1A1816]">{orders.length}</span> sales bills
        </div>
      </div>

      {/* Sales Registry Table */}
      <div className="bg-white border border-[#E6E2DE] shadow-xs overflow-hidden">
        {loading ? (
          <div className="py-16 text-center text-xs text-[#6A645D]">
            <RefreshCw size={24} className="animate-spin mx-auto mb-3 text-[#C5A059]" />
            Loading in-store sales bills...
          </div>
        ) : filteredBills.length === 0 ? (
          <div className="py-16 text-center text-xs text-[#6A645D]">
            <Receipt size={32} className="mx-auto text-[#D5D0C9] mb-3" />
            <h3 className="text-sm font-bold text-[#1A1816] uppercase tracking-wider mb-1">
              No in-store bills found
            </h3>
            <p className="max-w-xs mx-auto">
              Counter sales created on the Salesperson Dashboard will be listed here.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#FAF8F5] border-b border-[#E6E2DE] text-[#6A645D] uppercase tracking-wider font-semibold">
                <tr>
                  <th className="py-3.5 px-4">Bill #</th>
                  <th className="py-3.5 px-4">Authorized By</th>
                  <th className="py-3.5 px-4">Items Sold</th>
                  <th className="py-3.5 px-4 text-center">Discount</th>
                  <th className="py-3.5 px-4 text-right">Total</th>
                  <th className="py-3.5 px-4 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E6E2DE]">
                {filteredBills.map((bill) => {
                  const authorizingSalesperson =
                    bill.soldBy || "In-Store Salesperson"
                  const discountVal = Number(bill.discountAmount || 0)

                  return (
                    <tr
                      key={bill._id}
                      className="hover:bg-[#FAF8F5] transition-colors"
                    >
                      {/* Bill # and Date */}
                      <td className="py-3.5 px-4 font-mono font-bold text-[#1A1816]">
                        {bill.orderNumber}
                        <span className="block font-sans font-normal text-[10px] text-[#9C948A] mt-0.5">
                          {bill.createdAt
                            ? new Date(bill.createdAt).toLocaleDateString(
                                "en-US",
                                {
                                  year: "numeric",
                                  month: "short",
                                  day: "numeric",
                                  hour: "2-digit",
                                  minute: "2-digit",
                                }
                              )
                            : "—"}
                        </span>
                      </td>

                      {/* Authorized By (Salesperson) */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-1.5 font-semibold text-[#1A1816]">
                          <UserCheck size={14} className="text-[#C5A059] shrink-0" />
                          <span>{authorizingSalesperson}</span>
                        </div>
                      </td>

                      {/* Items Sold */}
                      <td className="py-3.5 px-4">
                        <div className="space-y-1 max-w-sm">
                          {bill.items?.map((item, idx) => (
                            <div
                              key={idx}
                              className="text-xs font-medium text-[#1A1816] flex items-center justify-between gap-3"
                            >
                              <span className="truncate">
                                {item.title || item.name || "Tailored Piece"}
                              </span>
                              <span className="text-[#6A645D] text-[11px] shrink-0 font-mono">
                                {item.quantity || 1} &times; ${Number(item.price || 0).toFixed(2)}
                              </span>
                            </div>
                          ))}
                        </div>
                      </td>

                      {/* Discount */}
                      <td className="py-3.5 px-4 text-center">
                        {discountVal > 0 ? (
                          <span className="text-[#78281F] font-mono font-semibold">
                            -${discountVal.toFixed(2)}
                          </span>
                        ) : (
                          <span className="text-[#9C948A]">—</span>
                        )}
                      </td>

                      {/* Total */}
                      <td className="py-3.5 px-4 text-right font-serif font-bold text-sm text-[#1A1816]">
                        ${Number(bill.totalAmount || 0).toFixed(2)}
                      </td>

                      {/* Action */}
                      <td className="py-3.5 px-4 text-center">
                        <button
                          onClick={() => setSelectedBill(bill)}
                          className="bg-[#1A1816] hover:bg-[#C5A059] text-white hover:text-[#1A1816] px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider transition-colors inline-flex items-center gap-1.5 cursor-pointer shadow-xs rounded-none"
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

      {/* Modal: View Printable Bill (Without Customer Name) */}
      {selectedBill && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white border border-[#E5DFD5] max-w-2xl w-full max-h-[92vh] overflow-y-auto p-6 sm:p-10 shadow-2xl relative font-sans">
            <button
              onClick={() => setSelectedBill(null)}
              className="absolute top-5 right-5 text-[#8E877E] hover:text-[#1A1816] cursor-pointer print:hidden"
            >
              <X size={20} />
            </button>

            {/* Header */}
            <div className="border-b border-[#E5DFD5] pb-6 mb-6">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="font-serif text-2xl font-bold tracking-widest text-[#1A1816] uppercase">
                    Ecomstore
                  </h2>
                  <p className="text-[10px] uppercase tracking-widest text-[#8E877E] mt-0.5">
                    Official In-Store Sales Bill
                  </p>
                </div>
                <div className="text-right">
                  <span className="font-mono text-sm font-bold text-[#1A1816] block">
                    {selectedBill.orderNumber}
                  </span>
                  <span className="text-xs text-[#8E877E] block">
                    {selectedBill.createdAt
                      ? new Date(selectedBill.createdAt).toLocaleDateString()
                      : ""}
                  </span>
                </div>
              </div>
            </div>

            {/* Sales Authorization Box */}
            <div className="bg-[#FAF8F5] border border-[#E5DFD5] p-4 mb-6 flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase font-bold text-[#C5A059] block mb-0.5">
                  Authorized By (Salesperson)
                </span>
                <p className="font-bold text-[#1A1816] text-sm flex items-center gap-1.5 m-0">
                  <UserCheck size={14} className="text-[#C5A059]" />
                  <span>{selectedBill.soldBy || "In-Store Salesperson"}</span>
                </p>
              </div>
              <div className="text-right">
                <span className="text-[10px] uppercase font-bold text-[#8E877E] block mb-0.5">
                  Location
                </span>
                <span className="text-xs text-[#1A1816] font-semibold">
                  In-Store Counter
                </span>
              </div>
            </div>

            {/* Items Table */}
            <div className="border border-[#E5DFD5] mb-6">
              <table className="w-full text-xs text-left">
                <thead className="bg-[#FAF8F5] border-b border-[#E5DFD5] text-[10px] uppercase font-bold text-[#8E877E]">
                  <tr>
                    <th className="p-3">Item Description</th>
                    <th className="p-3 text-center">Qty</th>
                    <th className="p-3 text-right">Unit Price</th>
                    <th className="p-3 text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E5DFD5]">
                  {selectedBill.items?.map((item, idx) => (
                    <tr key={idx}>
                      <td className="p-3 font-semibold text-[#1A1816]">
                        {item.title || item.name}
                      </td>
                      <td className="p-3 text-center">{item.quantity || 1}</td>
                      <td className="p-3 text-right font-mono">
                        ${Number(item.price || 0).toFixed(2)}
                      </td>
                      <td className="p-3 text-right font-mono font-bold text-[#1A1816]">
                        ${(
                          Number(item.price || 0) * Number(item.quantity || 1)
                        ).toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Calculations Box */}
            <div className="space-y-1.5 text-xs max-w-xs ml-auto border-t border-[#E5DFD5] pt-4">
              <div className="flex justify-between text-[#8E877E]">
                <span>Subtotal:</span>
                <span className="font-mono">
                  $
                  {(
                    Number(selectedBill.subtotal) ||
                    Number(selectedBill.totalAmount)
                  ).toFixed(2)}
                </span>
              </div>
              {Number(selectedBill.discountAmount || 0) > 0 && (
                <div className="flex justify-between text-[#78281F]">
                  <span>Discount:</span>
                  <span className="font-mono">
                    -${Number(selectedBill.discountAmount).toFixed(2)}
                  </span>
                </div>
              )}
              <div className="flex justify-between text-base font-bold text-[#1A1816] pt-2 border-t border-[#E5DFD5]">
                <span>Total:</span>
                <span className="font-mono font-bold">
                  ${Number(selectedBill.totalAmount || 0).toFixed(2)}
                </span>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="mt-8 pt-4 border-t border-[#E5DFD5] flex justify-end gap-3 print:hidden">
              <button
                onClick={() => setSelectedBill(null)}
                className="px-4 py-2 border border-[#E5DFD5] text-xs uppercase font-bold tracking-wider text-[#8E877E] hover:text-[#1A1816] cursor-pointer"
              >
                Close
              </button>
              <button
                onClick={handlePrint}
                className="px-5 py-2 bg-[#1A1816] text-[#FAF8F5] hover:bg-[#C5A059] hover:text-[#1A1816] text-xs uppercase font-bold tracking-wider transition-colors flex items-center gap-2 cursor-pointer shadow-xs"
              >
                <Printer size={15} />
                <span>Print Receipt</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
