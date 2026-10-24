import { useState, useEffect } from "react"
import { GetRequest } from "../../config/http"
import {
  TrendingUp,
  DollarSign,
  Truck,
  Package,
  Heart,
  PieChart as PieIcon,
  BarChart3,
  ShieldAlert,
  Percent,
} from "lucide-react"

export default function AdminAnalytics() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [hoveredSlice, setHoveredSlice] = useState(null)
  const [hoveredBar, setHoveredBar] = useState(null)

  const loadAnalytics = async () => {
    try {
      setLoading(true)
      const res = await GetRequest("orders/analytics/summary")
      setData(res.data)
    } catch (err) {
      console.error("Failed to load analytics summary:", err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadAnalytics()
  }, [])

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col justify-center items-center">
        <div className="w-10 h-10 border-2 border-[#1A1816] border-t-[#C5A059] rounded-full animate-spin mb-3"></div>
        <p className="text-xs uppercase tracking-[0.2em] text-[#8E877E] font-serif">
          Loading analytics...
        </p>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="p-8 text-center bg-white border border-[#E5DFD5]">
        <p className="font-serif text-lg text-[#1A1816]">No financial records available yet.</p>
      </div>
    )
  }

  // Pre-calculate Donut Pie Chart Slices
  const pieColors = ["#1A1816", "#C5A059", "#78281F", "#1C352D", "#6A645D", "#8E877E"]
  const categories = data.categoryBreakdown || []
  const totalCatRevenue = categories.reduce((sum, c) => sum + c.revenue, 0) || 1

  const pieSlices = categories.reduce(
    (acc, cat, idx) => {
      const fraction = cat.revenue / totalCatRevenue
      const angle = fraction * 360
      const startAngle = acc.currentAngle
      const color = pieColors[idx % pieColors.length]
      acc.slices.push({
        ...cat,
        fraction,
        startAngle,
        angle,
        color,
      })
      acc.currentAngle += angle
      return acc
    },
    { currentAngle: 0, slices: [] }
  ).slices

  // Helper to draw SVG Donut path
  const createDonutSlice = (slice, radius = 80, innerRadius = 50, cx = 100, cy = 100) => {
    const startRad = (slice.startAngle - 90) * (Math.PI / 180)
    const endRad = (slice.startAngle + slice.angle - 90) * (Math.PI / 180)

    const x1 = cx + radius * Math.cos(startRad)
    const y1 = cy + radius * Math.sin(startRad)
    const x2 = cx + radius * Math.cos(endRad)
    const y2 = cy + radius * Math.sin(endRad)

    const x3 = cx + innerRadius * Math.cos(endRad)
    const y3 = cy + innerRadius * Math.sin(endRad)
    const x4 = cx + innerRadius * Math.cos(startRad)
    const y4 = cy + innerRadius * Math.sin(startRad)

    const largeArc = slice.angle > 180 ? 1 : 0

    return `M ${x1} ${y1} A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2} L ${x3} ${y3} A ${innerRadius} ${innerRadius} 0 ${largeArc} 0 ${x4} ${y4} Z`
  }

  // Bar Graph Max Scale
  const monthlyTrend = data.monthlyTrend || []
  const maxRevenueInTrend = Math.max(...monthlyTrend.map((t) => t.revenue), 500)

  return (
    <div className="space-y-8 font-sans">
      {/* Header */}
      <div className="border-b border-[#E5DFD5] pb-4 flex justify-between items-center">
        <h1 className="font-serif text-2xl font-bold uppercase tracking-tight text-[#1A1816]">
          Analytics
        </h1>
      </div>

      {/* Financial Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Card 1: Revenue */}
        <div className="bg-white border border-[#E5DFD5] p-5 shadow-xs">
          <div className="flex items-center justify-between mb-3 text-[#8E877E]">
            <span className="text-[10px] font-bold uppercase tracking-[0.2em]">Gross Revenue</span>
            <div className="w-8 h-8 rounded-full bg-[#FAF8F5] border border-[#E5DFD5] flex items-center justify-center text-[#1A1816]">
              <DollarSign size={16} />
            </div>
          </div>
          <p className="font-serif text-3xl font-bold text-[#1A1816]">
            ${data.totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </p>

        </div>

        {/* Card 2: Net Profit & Margin */}
        <div className="bg-white border border-[#E5DFD5] p-5 shadow-xs">
          <div className="flex items-center justify-between mb-3 text-[#8E877E]">
            <span className="text-[10px] font-bold uppercase tracking-[0.2em]">Net Profit</span>
            <div className="w-8 h-8 rounded-full bg-[#FAF8F5] border border-[#E5DFD5] flex items-center justify-center text-[#C5A059]">
              <Percent size={16} />
            </div>
          </div>
          <p className="font-serif text-3xl font-bold text-[#1A1816]">
            ${data.netProfit.toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </p>

        </div>

        {/* Card 3: Logistics & Courier Costs */}
        <div className="bg-white border border-[#E5DFD5] p-5 shadow-xs">
          <div className="flex items-center justify-between mb-3 text-[#8E877E]">
            <span className="text-[10px] font-bold uppercase tracking-[0.2em]">Logistics & Courier</span>
            <div className="w-8 h-8 rounded-full bg-[#FAF8F5] border border-[#E5DFD5] flex items-center justify-center text-[#78281F]">
              <Truck size={16} />
            </div>
          </div>
          <p className="font-serif text-3xl font-bold text-[#1A1816]">
            ${data.totalLogisticsCost.toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </p>

        </div>

        {/* Card 4: Product Manufacturing (COGS) */}
        <div className="bg-white border border-[#E5DFD5] p-5 shadow-xs">
          <div className="flex items-center justify-between mb-3 text-[#8E877E]">
            <span className="text-[10px] font-bold uppercase tracking-[0.2em]">Product Cost</span>
            <div className="w-8 h-8 rounded-full bg-[#FAF8F5] border border-[#E5DFD5] flex items-center justify-center text-[#1A1816]">
              <Package size={16} />
            </div>
          </div>
          <p className="font-serif text-3xl font-bold text-[#1A1816]">
            ${data.totalProductCost.toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </p>

        </div>
      </div>

      {/* Visual Charts Row: Revenue Bar/Line Graph & Category Pie Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: Interactive Revenue Performance Graph */}
        <div className="lg:col-span-7 bg-white border border-[#E5DFD5] p-6 sm:p-8">
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-[#E5DFD5]">
            <div>
              <h3 className="font-serif text-lg font-bold uppercase tracking-wider text-[#1A1816]">
                Revenue & Sales Trajectory
              </h3>
            </div>
            <BarChart3 size={18} className="text-[#C5A059]" />
          </div>

          {/* SVG Bar / Trend Chart */}
          <div className="h-64 w-full flex items-end gap-3 sm:gap-6 pt-6 pb-2 px-2 border-b border-l border-[#E5DFD5]">
            {monthlyTrend.map((entry, idx) => {
              const heightPercent = Math.max(
                12,
                Math.round((entry.revenue / maxRevenueInTrend) * 100)
              )
              const isHovered = hoveredBar === idx
              return (
                <div
                  key={idx}
                  className="flex-1 flex flex-col items-center h-full justify-end group relative cursor-pointer"
                  onMouseEnter={() => setHoveredBar(idx)}
                  onMouseLeave={() => setHoveredBar(null)}
                >
                  {/* Tooltip */}
                  {isHovered && (
                    <div className="absolute -top-12 z-20 bg-[#1A1816] text-[#FAF8F5] text-[10px] py-1 px-2.5 rounded shadow-lg whitespace-nowrap">
                      <span className="font-bold">${entry.revenue.toFixed(2)}</span> ({entry.orders} orders)
                    </div>
                  )}

                  {/* Bar */}
                  <div
                    style={{ height: `${heightPercent}%` }}
                    className={`w-full max-w-[42px] transition-all duration-300 ${
                      isHovered ? "bg-[#C5A059]" : "bg-[#1A1816]"
                    }`}
                  ></div>

                  {/* Label */}
                  <span className="text-[9px] uppercase tracking-wider font-semibold text-[#8E877E] mt-2 block">
                    {entry.date}
                  </span>
                </div>
              )
            })}
          </div>


        </div>

        {/* Right: Category Sales Distribution (Donut / Pie Chart) */}
        <div className="lg:col-span-5 bg-white border border-[#E5DFD5] p-6 sm:p-8 flex flex-col">
          <div className="flex items-center justify-between mb-4 pb-4 border-b border-[#E5DFD5]">
            <div>
              <h3 className="font-serif text-lg font-bold uppercase tracking-wider text-[#1A1816]">
                Trending Categories
              </h3>
            </div>
            <PieIcon size={18} className="text-[#C5A059]" />
          </div>

          {/* Donut SVG Chart */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 my-auto py-2">
            <div className="relative w-44 h-44 shrink-0">
              <svg viewBox="0 0 200 200" className="w-full h-full transform -rotate-90">
                {pieSlices.length === 0 ? (
                  <circle cx="100" cy="100" r="70" fill="none" stroke="#E5DFD5" strokeWidth="25" />
                ) : (
                  pieSlices.map((slice, idx) => (
                    <path
                      key={idx}
                      d={createDonutSlice(slice, 85, 52)}
                      fill={slice.color}
                      className="transition-all duration-200 hover:opacity-85 cursor-pointer"
                      onMouseEnter={() => setHoveredSlice(slice)}
                      onMouseLeave={() => setHoveredSlice(null)}
                    />
                  ))
                )}
              </svg>

              <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
                <span className="text-[9px] uppercase tracking-wider font-bold text-[#8E877E]">Catalog</span>
                <span className="font-serif text-lg font-bold text-[#1A1816]">
                  {hoveredSlice ? `${hoveredSlice.share}%` : "100%"}
                </span>
              </div>
            </div>

            {/* Legend */}
            <div className="space-y-2 text-xs flex-1">
              {pieSlices.map((slice, idx) => (
                <div
                  key={idx}
                  className={`flex items-center justify-between p-1.5 transition-colors cursor-pointer ${
                    hoveredSlice?.category === slice.category ? "bg-[#FAF8F5] font-bold" : ""
                  }`}
                  onMouseEnter={() => setHoveredSlice(slice)}
                  onMouseLeave={() => setHoveredSlice(null)}
                >
                  <div className="flex items-center gap-2 truncate pr-2">
                    <span className="w-2.5 h-2.5 shrink-0" style={{ backgroundColor: slice.color }}></span>
                    <span className="truncate text-[11px] text-[#1A1816]">{slice.category}</span>
                  </div>
                  <span className="font-serif font-bold text-xs text-[#1A1816]">${slice.revenue.toFixed(0)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Demand & Popularity Leaderboards */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Top Ordered Garments (What People Have Ordered) */}
        <div className="lg:col-span-6 bg-white border border-[#E5DFD5] p-6 sm:p-8">
          <div className="flex items-center justify-between mb-5 pb-3 border-b border-[#E5DFD5]">
            <div>
              <h3 className="font-serif text-base font-bold uppercase tracking-wider text-[#1A1816] flex items-center gap-2">
                <TrendingUp size={16} className="text-[#C5A059]" /> Trending in Orders
              </h3>
            </div>
          </div>

          <div className="divide-y divide-[#E5DFD5]">
            {data.trendingProducts && data.trendingProducts.length > 0 ? (
              data.trendingProducts.map((prod, idx) => (
                <div key={idx} className="py-3 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 truncate">
                    <span className="font-serif font-bold text-sm text-[#8E877E] w-5">#{idx + 1}</span>
                    {prod.image && (
                      <img
                        src={prod.image}
                        alt={prod.title}
                        className="w-10 h-12 object-cover border border-[#E5DFD5] shrink-0"
                      />
                    )}
                    <div className="truncate">
                      <span className="font-serif font-bold text-xs text-[#1A1816] truncate block">
                        {prod.title}
                      </span>
                      <span className="text-[10px] text-[#8E877E] uppercase tracking-wider block">
                        Units sold: <strong className="text-[#1A1816]">{prod.quantity}</strong>
                      </span>
                    </div>
                  </div>
                  <span className="font-serif font-bold text-sm text-[#1A1816] shrink-0">
                    ${prod.revenue.toFixed(2)}
                  </span>
                </div>
              ))
            ) : (
              <p className="text-xs text-[#8E877E] py-4">No order items recorded yet.</p>
            )}
          </div>
        </div>

        {/* Wishlist Demand (What is in User Wishlists) */}
        <div className="lg:col-span-6 bg-white border border-[#E5DFD5] p-6 sm:p-8">
          <div className="flex items-center justify-between mb-5 pb-3 border-b border-[#E5DFD5]">
            <div>
              <h3 className="font-serif text-base font-bold uppercase tracking-wider text-[#1A1816] flex items-center gap-2">
                <Heart size={16} className="text-[#78281F]" /> Trending in Wishlists
              </h3>
            </div>
          </div>

          <div className="divide-y divide-[#E5DFD5]">
            {data.trendingWishlist && data.trendingWishlist.length > 0 ? (
              data.trendingWishlist.map((item, idx) => (
                <div key={idx} className="py-3 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 truncate">
                    <span className="font-serif font-bold text-sm text-[#8E877E] w-5">#{idx + 1}</span>
                    {item.image && (
                      <img
                        src={item.image}
                        alt={item.title}
                        className="w-10 h-12 object-cover border border-[#E5DFD5] shrink-0"
                      />
                    )}
                    <div className="truncate">
                      <span className="font-serif font-bold text-xs text-[#1A1816] truncate block">
                        {item.title}
                      </span>
                      <span className="text-[10px] text-[#8E877E] uppercase tracking-wider block">
                        {item.category} — Saved by {item.wishlistCount} users
                      </span>
                    </div>
                  </div>
                  <span className="font-serif font-bold text-sm text-[#1A1816] shrink-0">
                    ${Number(item.price).toFixed(2)}
                  </span>
                </div>
              ))
            ) : (
              <p className="text-xs text-[#8E877E] py-4">No items in wishlists yet.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
