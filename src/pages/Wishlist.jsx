import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { getWishlist, addToCart, toggleWishlist, syncUserWishlistWithDB } from "../utils/cartStore"

export default function Wishlist() {
  const [wishlist, setWishlist] = useState([])

  const sync = () => {
    setWishlist(getWishlist())
  }

  useEffect(() => {
    sync()
    syncUserWishlistWithDB()
    window.addEventListener("wishlist-updated", sync)
    return () => window.removeEventListener("wishlist-updated", sync)
  }, [])

  const removeFromWishlist = async (product) => {
    await toggleWishlist(product)
  }

  const handleMoveToCart = async (product) => {
    addToCart(product, 1, "40R", "Espresso")
    await toggleWishlist(product)
  }

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-[#1A1816] py-14 font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-10 border-b border-[#E5DFD5] pb-6">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#8E877E] block mb-1">
            Wishlist
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl font-bold tracking-tight text-[#1A1816] mb-2">
            Your Wishlist
          </h1>
          <p className="text-xs text-[#6A645D] uppercase tracking-wider">
            Items you have saved to purchase later.
          </p>
        </div>

        {wishlist.length === 0 ? (
          <div className="text-center py-16 bg-[#F2EFE9] border border-[#E5DFD5] p-8 max-w-xl mx-auto">
            <p className="font-serif text-xl font-bold uppercase tracking-wider mb-2 text-[#1A1816]">
              Your wishlist is empty
            </p>
            <p className="text-xs text-[#8E877E] uppercase tracking-wider mb-6">
              Browse our shop and tap the heart icon on any product to save it here.
            </p>
            <Link
              to="/shop"
              className="inline-block bg-[#1A1816] text-[#FAF8F5] px-6 py-2.5 font-semibold uppercase tracking-wider text-xs no-underline"
            >
              Browse Products
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {wishlist.map((product) => (
              <div key={product._id} className="bg-white border border-[#E5DFD5] overflow-hidden flex flex-col group hover:shadow-md transition-shadow">
                <Link to={`/products/${product._id}`} className="relative aspect-[3/4] bg-[#F2EFE9] overflow-hidden block">
                  <img
                    src={product.image || "https://images.unsplash.com/photo-1544441893-675973e31985?w=800"}
                    alt={product.title || product.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </Link>

                <div className="p-4 flex flex-col flex-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#8E877E] mb-1">
                    {product.category || "Apparel"}
                  </span>
                  <Link
                    to={`/products/${product._id}`}
                    className="font-serif font-bold text-sm text-[#1A1816] hover:text-[#C5A059] line-clamp-1 mb-2 no-underline"
                  >
                    {product.title || product.name}
                  </Link>
                  <p className="font-serif font-bold text-base text-[#1A1816] mb-3">
                    ${Number(product.price).toFixed(2)}
                  </p>

                  <div className="mt-auto pt-2 flex gap-2">
                    <button
                      onClick={() => handleMoveToCart(product)}
                      className="flex-1 bg-[#1A1816] text-[#FAF8F5] py-2 text-xs font-semibold uppercase tracking-wider hover:bg-[#C5A059] hover:text-[#1A1816] transition-colors cursor-pointer"
                    >
                      Add to Cart
                    </button>
                    <button
                      onClick={() => removeFromWishlist(product)}
                      className="px-3 py-2 border border-[#E5DFD5] text-xs font-bold uppercase hover:border-[#78281F] hover:text-[#78281F] transition-colors cursor-pointer"
                      title="Remove"
                    >
                      ✕
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
