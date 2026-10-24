import { useState } from "react"
import { Link } from "react-router-dom"
import { Heart, ShoppingBag, Check } from "lucide-react"
import { addToCart, toggleWishlist, getWishlist } from "../../utils/cartStore"
import TiltCard from "../common/TiltCard"

export default function ProductCard({ item, isSale, enableTilt = true }) {
  const [isWishlisted, setIsWishlisted] = useState(() => {
    const list = getWishlist()
    return list.some((p) => p._id === item._id)
  })
  const [added, setAdded] = useState(false)

  const isItemOnSale = isSale || item.isSale || false
  const originalPrice = isItemOnSale ? (item.originalPrice || Math.round(item.price * 1.25)) : null

  const handleAddToCart = (e) => {
    e.preventDefault()
    e.stopPropagation()
    addToCart(item, 1, "40R", "Espresso")
    setAdded(true)
    setTimeout(() => setAdded(false), 2000)
  }

  const handleToggleWishlist = async (e) => {
    e.preventDefault()
    e.stopPropagation()
    const active = await toggleWishlist(item)
    setIsWishlisted(active)
  }

  const cardContent = (
    <div className="bg-white border border-[#E5DFD5] rounded-none overflow-hidden flex flex-col group hover:shadow-xl hover:border-[#1A1816] transition-all duration-300 h-full">
      {/* Product Image Frame */}
      <Link to={`/products/${item._id}`} className="relative aspect-[3/4] bg-[#F2EFE9] overflow-hidden block">
        <img
          src={item.image || "https://images.unsplash.com/photo-1544441893-675973e31985?w=800"}
          alt={item.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          onError={(e) => {
            e.currentTarget.onerror = null
            e.currentTarget.src = "https://images.unsplash.com/photo-1544441893-675973e31985?w=800"
          }}
        />

        {/* Sale Badge */}
        {isItemOnSale && (
          <span className="absolute top-2.5 left-2.5 bg-[#78281F] text-[#FAF8F5] text-[9px] font-bold uppercase tracking-wider px-2 py-0.5">
            Archive Privilege
          </span>
        )}

        {/* Wishlist Button in Top-Right Corner */}
        <button
          onClick={handleToggleWishlist}
          className="absolute top-2.5 right-2.5 p-2 bg-white/90 hover:bg-white text-[#1A1816] rounded-full shadow-xs transition-colors cursor-pointer"
          title={isWishlisted ? "Remove from saved" : "Save for later"}
        >
          <Heart
            size={15}
            className={isWishlisted ? "text-[#78281F] fill-[#78281F]" : "text-[#1A1816]"}
          />
        </button>
      </Link>

      {/* Product Info */}
      <div className="p-4 flex flex-col flex-1">
        <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#8E877E] mb-1">
          {item.category || "Tailoring"}
        </span>

        <Link
          to={`/products/${item._id}`}
          className="font-serif font-bold text-sm text-[#1A1816] hover:text-[#C5A059] line-clamp-1 mb-2 no-underline"
        >
          {item.title}
        </Link>

        {/* Price & Add to Cart Action */}
        <div className="mt-auto pt-3 border-t border-[#E5DFD5] flex items-center justify-between">
          <div className="flex items-baseline gap-2">
            <span className={`font-serif font-bold text-base ${isItemOnSale ? "text-[#78281F]" : "text-[#1A1816]"}`}>
              ${Number(item.price).toFixed(2)}
            </span>
            {originalPrice && (
              <span className="text-[11px] text-[#8E877E] line-through font-normal">
                ${Number(originalPrice).toFixed(2)}
              </span>
            )}
          </div>

          <button
            onClick={handleAddToCart}
            className={`px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider transition-colors flex items-center gap-1.5 cursor-pointer ${
              added
                ? "bg-[#C5A059] text-white"
                : "bg-[#1A1816] text-[#FAF8F5] hover:bg-[#C5A059] hover:text-[#1A1816]"
            }`}
          >
            {added ? (
              <>
                <Check size={13} />
                <span>Added</span>
              </>
            ) : (
              <>
                <ShoppingBag size={13} />
                <span>Add</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )

  if (!enableTilt) {
    return cardContent
  }

  return (
    <TiltCard className="h-full">
      {cardContent}
    </TiltCard>
  )
}