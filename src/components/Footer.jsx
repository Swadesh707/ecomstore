import { useState } from "react"
import { Link } from "react-router-dom"

export default function Footer() {
  const [subscribed, setSubscribed] = useState(false)
  return (
    <footer className="bg-[#1A1816] text-[#FAF8F5] pt-20 pb-12 border-t border-[#C5A059]/40 mt-auto font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 mb-16">
          {/* Maison Brand Info */}
          <div className="md:col-span-4">
            <Link
              to="/"
              onClick={() => {
                window.scrollTo({ top: 0, left: 0, behavior: "smooth" })
                document.documentElement.scrollTop = 0
                document.body.scrollTop = 0
              }}
              className="font-serif font-bold text-2xl tracking-[0.2em] flex items-center gap-2.5 mb-4 text-[#FAF8F5] no-underline cursor-pointer"
            >
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
            </Link>
            <p className="text-xs uppercase tracking-[0.25em] text-[#C5A059] font-bold mb-4">
              Purveyors of Fine Tailoring & Leathercraft
            </p>
            <p className="text-[#8E877E] text-xs leading-relaxed max-w-sm font-normal">
              Dedicated to the preservation of European bespoke sartorial standards, Goodyear-welted cobblery, full-grain bridle leather belts, and timeless wardrobe investments.
            </p>
          </div>

          {/* Sartorial Catalog */}
          <div className="md:col-span-3">
            <h5 className="font-serif font-bold tracking-[0.2em] uppercase text-xs mb-6 text-[#C5A059]">
              The Wardrobe
            </h5>
            <ul className="space-y-3.5 font-medium text-xs tracking-wider uppercase text-[#8E877E] list-none p-0">
              <li>
                <Link to="/shop?category=Tailoring+%26+Outerwear" className="hover:text-[#FAF8F5] transition-colors no-underline">
                  Tailoring & Outerwear
                </Link>
              </li>
              <li>
                <Link to="/shop?category=Knitwear+%26+Shirts" className="hover:text-[#FAF8F5] transition-colors no-underline">
                  Knitwear & Oxford Shirts
                </Link>
              </li>
              <li>
                <Link to="/shop?category=Leather+Shoes" className="hover:text-[#FAF8F5] transition-colors no-underline">
                  Goodyear Leather Shoes
                </Link>
              </li>
              <li>
                <Link to="/shop?category=Belts+%26+Leather+Goods" className="hover:text-[#FAF8F5] transition-colors no-underline">
                  Belts & Leather Goods
                </Link>
              </li>
              <li>
                <Link to="/shop?category=Fine+Accessories" className="hover:text-[#FAF8F5] transition-colors no-underline">
                  Horology & Accessories
                </Link>
              </li>
              <li>
                <Link to="/sale" className="text-[#C5A059] hover:text-white transition-colors no-underline font-bold">
                  ❖ Seasonal Archive Sale
                </Link>
              </li>
            </ul>
          </div>

          {/* The Maison */}
          <div className="md:col-span-2">
            <h5 className="font-serif font-bold tracking-[0.2em] uppercase text-xs mb-6 text-[#C5A059]">
              The House
            </h5>
            <ul className="space-y-3.5 font-medium text-xs tracking-wider uppercase text-[#8E877E] list-none p-0">
              <li><Link to="/about" className="hover:text-[#FAF8F5] transition-colors no-underline">About The Maison</Link></li>
              <li><Link to="/account" className="hover:text-[#FAF8F5] transition-colors no-underline">My Purchases & Orders</Link></li>
              <li><Link to="/account?tab=track" className="hover:text-[#FAF8F5] transition-colors no-underline">Track Consignment</Link></li>
              <li><Link to="/account?tab=returns" className="hover:text-[#FAF8F5] transition-colors no-underline">Returns & Exchanges</Link></li>
            </ul>
          </div>

          {/* Private Gazette / Newsletter */}
          <div className="md:col-span-3">
            <h5 className="font-serif font-bold tracking-[0.2em] uppercase text-xs mb-6 text-[#C5A059]">
              Private Gazette
            </h5>
            <p className="text-[#8E877E] text-xs mb-4 leading-relaxed font-normal">
              Receive private dispatches regarding seasonal cloth arrivals, limited leather batches, and trunk show appointments.
            </p>
            {subscribed ? (
              <p className="text-xs text-[#FAF8F5] pt-1">
                You are subscribed to the private gazette.
              </p>
            ) : (
              <form
                onSubmit={(e) => {
                  e.preventDefault()
                  setSubscribed(true)
                }}
                className="flex border-b border-[#C5A059] pb-2"
              >
                <input
                  type="email"
                  required
                  placeholder="YOUR CORRESPONDENCE EMAIL"
                  className="bg-transparent w-full focus:outline-none text-[11px] font-semibold placeholder:text-[#8E877E] uppercase tracking-wider text-[#FAF8F5]"
                />
                <button
                  type="submit"
                  className="text-xs font-serif uppercase tracking-[0.2em] text-[#C5A059] hover:text-white transition-colors cursor-pointer pl-2 font-bold"
                >
                  Inscribe
                </button>
              </form>
            )}
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-[#C5A059]/20 pt-8 flex flex-col md:flex-row justify-between items-center text-[10px] font-semibold uppercase tracking-[0.2em] text-[#8E877E] gap-4">
          <p>&copy; {new Date().getFullYear()} ECOMSTORE HERITAGE & SARTORIAL PURVEYORS. ALL RIGHTS RESERVED.</p>
          <div className="flex space-x-6">
            <a href="#" className="hover:text-[#FAF8F5] transition-colors no-underline">Bespoke Terms</a>
            <a href="#" className="hover:text-[#FAF8F5] transition-colors no-underline">Privacy Dispatches</a>
            <a href="#" className="hover:text-[#FAF8F5] transition-colors no-underline">Provenance</a>
          </div>
        </div>
      </div>
    </footer>
  )
}
