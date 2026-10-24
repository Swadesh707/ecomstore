import { useState, useEffect } from "react"
import { Link, useNavigate } from "react-router-dom"
import { getCart } from "../utils/cartStore"

export default function Cart() {
  const [cart, setCart] = useState([])
  const navigate = useNavigate()

  useEffect(() => {
    setCart(getCart())
  }, [])

  const updateQuantity = (id, size, color, newQuantity) => {
    if (newQuantity < 1) return
    const updated = cart.map((item) => {
      if (item._id === id && item.size === size && item.color === color) {
        return { ...item, quantity: newQuantity }
      }
      return item
    })
    setCart(updated)
    localStorage.setItem("cart", JSON.stringify(updated))
    window.dispatchEvent(new Event("cart-updated"))
  }

  const removeItem = (id, size, color) => {
    const updated = cart.filter(
      (item) => !(item._id === id && item.size === size && item.color === color)
    )
    setCart(updated)
    localStorage.setItem("cart", JSON.stringify(updated))
    window.dispatchEvent(new Event("cart-updated"))
  }

  const subtotal = cart.reduce(
    (sum, item) => sum + (Number(item.price) || 0) * (item.quantity || 1),
    0
  )
  const shipping = subtotal > 150 ? 0 : subtotal > 0 ? 15 : 0
  const total = subtotal + shipping

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-[#1A1816] py-16 font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-12 border-b border-[#E5DFD5] pb-6">
          <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#8E877E] block mb-1">
            Wardrobe Bag
          </span>
          <h1 className="font-serif text-4xl sm:text-5xl font-bold tracking-tight text-[#1A1816] mb-2">
            Selected Commissions
          </h1>
          <p className="text-xs text-[#6A645D] uppercase tracking-wider">
            Review your tailored garments, handcrafted shoes, and leather items.
          </p>
        </div>

        {cart.length === 0 ? (
          <div className="text-center py-20 bg-[#F2EFE9] border border-[#E5DFD5] p-8 max-w-xl mx-auto shadow-sm">
            <p className="font-serif text-2xl font-bold uppercase tracking-wider mb-3 text-[#1A1816]">
              Your wardrobe bag is empty
            </p>
            <p className="text-xs text-[#8E877E] uppercase tracking-widest mb-8">
              Explore our sartorial archive to select timeless investments.
            </p>
            <Link
              to="/shop"
              className="inline-block bg-[#1A1816] text-[#FAF8F5] px-8 py-3.5 font-semibold uppercase tracking-[0.2em] hover:bg-[#C5A059] hover:text-[#1A1816] transition-colors text-xs"
            >
              Browse The Collection
            </Link>
          </div>
        ) : (
          <div className="grid lg:grid-cols-3 gap-12">
            {/* Cart Items List */}
            <div className="lg:col-span-2 space-y-6">
              {cart.map((item, idx) => (
                <div
                  key={`${item._id}-${item.size}-${item.color}-${idx}`}
                  className="bg-[#F2EFE9] border border-[#E5DFD5] p-6 flex flex-col sm:flex-row gap-6"
                >
                  <div className="w-28 h-36 bg-[#FAF8F5] border border-[#E5DFD5] shrink-0 overflow-hidden">
                    <img
                      src={item.image || "https://images.unsplash.com/photo-1544441893-675973e31985?w=800"}
                      alt={item.title || item.name}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#8E877E] block mb-1">
                        {item.category || "Tailoring"}
                      </span>
                      <h3 className="font-serif font-bold text-lg text-[#1A1816] mb-1">
                        {item.title || item.name}
                      </h3>
                      <div className="flex gap-4 text-xs font-semibold text-[#8E877E] mb-2">
                        {item.size && <span>Size: <strong className="text-[#1A1816]">{item.size}</strong></span>}
                        {item.color && <span>Shade: <strong className="text-[#1A1816]">{item.color}</strong></span>}
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t border-[#E5DFD5]">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center border border-[#E5DFD5] bg-[#FAF8F5]">
                          <button
                            onClick={() => updateQuantity(item._id, item.size, item.color, item.quantity - 1)}
                            className="w-8 h-8 font-serif font-bold hover:bg-[#F2EFE9] transition-colors cursor-pointer"
                          >
                            −
                          </button>
                          <span className="w-8 text-center font-serif font-bold text-xs">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(item._id, item.size, item.color, item.quantity + 1)}
                            className="w-8 h-8 font-serif font-bold hover:bg-[#F2EFE9] transition-colors cursor-pointer"
                          >
                            +
                          </button>
                        </div>
                      </div>

                      <div className="text-right">
                        <p className="font-serif font-bold text-lg text-[#1A1816]">
                          ${((Number(item.price) || 0) * (item.quantity || 1)).toFixed(2)}
                        </p>
                        <button
                          onClick={() => removeItem(item._id, item.size, item.color)}
                          className="text-[10px] font-bold uppercase tracking-widest text-[#8E877E] hover:text-[#78281F] underline transition-colors cursor-pointer mt-1"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-[#1A1816] text-[#FAF8F5] p-8 sticky top-24 border border-[#C5A059]/40 shadow-2xl">
                <h2 className="font-serif text-2xl font-bold tracking-tight mb-6 text-[#FAF8F5]">
                  Summary of Commission
                </h2>
                <div className="space-y-4 mb-6 text-xs uppercase tracking-wider font-semibold">
                  <div className="flex justify-between text-[#FAF8F5]/80">
                    <span>Subtotal</span>
                    <span className="text-[#FAF8F5] font-serif text-base">${subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-[#FAF8F5]/80">
                    <span>Private Courier</span>
                    <span className="text-[#FAF8F5]">
                      {shipping === 0 ? "COMPLIMENTARY" : `$${shipping.toFixed(2)}`}
                    </span>
                  </div>
                  {shipping > 0 && (
                    <p className="text-[10px] text-[#C5A059] font-normal tracking-normal capitalize">
                      Add ${(150 - subtotal).toFixed(2)} more for complimentary worldwide shipping.
                    </p>
                  )}
                  <div className="border-t border-[#FAF8F5]/20 pt-4 flex justify-between text-xl font-serif font-bold text-[#FAF8F5]">
                    <span>TOTAL</span>
                    <span className="text-[#C5A059]">${total.toFixed(2)}</span>
                  </div>
                </div>

                <button
                  onClick={() => navigate("/checkout")}
                  className="w-full bg-[#C5A059] text-[#1A1816] py-4 font-bold uppercase tracking-[0.2em] text-xs hover:bg-[#C5A059]/90 transition-colors mb-4 cursor-pointer shadow-lg"
                >
                  Proceed to Commission
                </button>

                <Link
                  to="/shop"
                  className="block text-center text-xs font-semibold uppercase tracking-widest text-[#FAF8F5]/70 hover:text-[#FAF8F5] underline"
                >
                  Continue Browsing
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
