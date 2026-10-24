import { Link, NavLink, Outlet } from "react-router-dom"
import {
  Layers,
  FolderKanban,
  BarChart3,
  Truck,
  Tag,
  Users,
  Store,
} from "lucide-react"

export default function AdminLayout() {
  const handleReturnToStore = () => {
    window.scrollTo({ top: 0, left: 0, behavior: "smooth" })
    document.documentElement.scrollTop = 0
    document.body.scrollTop = 0
  }

  return (
    <div className="min-h-screen bg-[#FAF8F5] flex flex-col md:flex-row text-[#1A1816] font-sans">
      {/* Sleek Admin Sidebar */}
      <aside className="w-full md:w-64 bg-[#1A1816] text-[#FAF8F5] border-r border-[#2C2825] flex flex-col shrink-0">
        {/* Header with Brand & Return to Store Shortcut */}
        <div className="p-6 border-b border-[#2C2825] flex items-center justify-between">
          <Link
            to="/"
            onClick={handleReturnToStore}
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
        </div>

        {/* Prominent Return to Store Action Button */}
        <div className="p-3 border-b border-[#2C2825]">
          <Link
            to="/"
            onClick={handleReturnToStore}
            className="w-full bg-[#2C2825] hover:bg-[#C5A059] hover:text-[#1A1816] text-[#FAF8F5] py-2 px-3 flex items-center justify-center gap-2 text-xs font-bold uppercase tracking-wider transition-colors no-underline shadow-xs"
          >
            <Store size={14} /> Return to Store
          </Link>
        </div>

        {/* Navigation Section */}
        <nav className="p-3 space-y-1 flex-1 text-xs font-semibold uppercase tracking-wider overflow-y-auto">
          {/* 1. Analytics */}
          <NavLink
            to="/admin/analytics"
            className={({ isActive }) =>
              `w-full text-left px-3.5 py-2.5 transition-colors flex items-center gap-3 no-underline ${
                isActive
                  ? "bg-[#C5A059] text-[#1A1816] font-bold"
                  : "text-[#FAF8F5]/80 hover:bg-[#FAF8F5]/10 hover:text-[#FAF8F5]"
              }`
            }
          >
            <BarChart3 size={16} />
            <span className="font-bold">Analytics</span>
          </NavLink>

          {/* 2. Orders */}
          <NavLink
            to="/admin/orders"
            className={({ isActive }) =>
              `w-full text-left px-3.5 py-2.5 transition-colors flex items-center gap-3 no-underline ${
                isActive
                  ? "bg-[#C5A059] text-[#1A1816] font-bold"
                  : "text-[#FAF8F5]/80 hover:bg-[#FAF8F5]/10 hover:text-[#FAF8F5]"
              }`
            }
          >
            <Truck size={16} />
            <span className="font-bold">Orders</span>
          </NavLink>

          {/* 3. Products */}
          <NavLink
            to="/admin/products"
            className={({ isActive }) =>
              `w-full text-left px-3.5 py-2.5 transition-colors flex items-center gap-3 no-underline ${
                isActive
                  ? "bg-[#C5A059] text-[#1A1816] font-bold"
                  : "text-[#FAF8F5]/80 hover:bg-[#FAF8F5]/10 hover:text-[#FAF8F5]"
              }`
            }
          >
            <Layers size={16} />
            <span className="font-bold">Products</span>
          </NavLink>

          {/* 4. Categories */}
          <NavLink
            to="/admin/categories"
            className={({ isActive }) =>
              `w-full text-left px-3.5 py-2.5 transition-colors flex items-center gap-3 no-underline ${
                isActive
                  ? "bg-[#C5A059] text-[#1A1816] font-bold"
                  : "text-[#FAF8F5]/80 hover:bg-[#FAF8F5]/10 hover:text-[#FAF8F5]"
              }`
            }
          >
            <FolderKanban size={16} />
            <span className="font-bold">Categories</span>
          </NavLink>

          {/* 5. Coupons */}
          <NavLink
            to="/admin/coupons"
            className={({ isActive }) =>
              `w-full text-left px-3.5 py-2.5 transition-colors flex items-center gap-3 no-underline ${
                isActive
                  ? "bg-[#C5A059] text-[#1A1816] font-bold"
                  : "text-[#FAF8F5]/80 hover:bg-[#FAF8F5]/10 hover:text-[#FAF8F5]"
              }`
            }
          >
            <Tag size={16} />
            <span className="font-bold">Coupons</span>
          </NavLink>

          {/* 6. Team */}
          <NavLink
            to="/admin/team"
            className={({ isActive }) =>
              `w-full text-left px-3.5 py-2.5 transition-colors flex items-center gap-3 no-underline ${
                isActive
                  ? "bg-[#C5A059] text-[#1A1816] font-bold"
                  : "text-[#FAF8F5]/80 hover:bg-[#FAF8F5]/10 hover:text-[#FAF8F5]"
              }`
            }
          >
            <Users size={16} />
            <span className="font-bold">Team</span>
          </NavLink>
        </nav>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto p-6 md:p-10 bg-[#FAF8F5]">
        <Outlet />
      </main>
    </div>
  )
}
