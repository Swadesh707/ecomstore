import { useEffect, useState } from "react"
import { useParams, Link, useNavigate } from "react-router-dom"
import { ArrowLeft, Heart, ShoppingBag, Truck, RefreshCw, Check, Award, ShieldCheck } from "lucide-react"
import { GetRequest } from "../../config/http"
import { addToCart, toggleWishlist, getWishlist } from "../../utils/cartStore"
import TiltCard from "../common/TiltCard"

export default function ProductDetails() {
  const { id } = useParams()
  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const [selectedSize, setSelectedSize] = useState("40R")
  const [selectedColor, setSelectedColor] = useState("Espresso")
  const [quantity, setQuantity] = useState(1)
  const [isWishlisted, setIsWishlisted] = useState(false)
  const [toastMessage, setToastMessage] = useState("")

  const navigate = useNavigate()

  const sizes = ["38R", "40R", "42R", "44R", "46R"]
  const colors = [
    { name: "Espresso", hex: "#2E1C14" },
    { name: "Camel", hex: "#C19A6B" },
    { name: "Navy", hex: "#1B2838" },
    { name: "Ivory", hex: "#F5F2EB" },
    { name: "Forest", hex: "#1C352D" },
  ]

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true)
        const response = await GetRequest(`products/${id}`)
        setProduct(response.data)

        const wishlist = getWishlist()
        setIsWishlisted(wishlist.some((item) => item._id === id))
      } catch (err) {
        console.error(err)
        setError("Product not found")
      } finally {
        setLoading(false)
      }
    }

    if (id) {
      fetchProduct()
    }
  }, [id])

  const handleAddToCart = () => {
    if (!product) return
    addToCart(product, quantity, selectedSize, selectedColor)
    showToast(`Acquired ${quantity}x ${product.title} to your bag.`)
  }

  const handleToggleWishlist = async () => {
    if (!product) return
    const added = await toggleWishlist(product)
    setIsWishlisted(added)
    showToast(added ? "Saved to your private archive." : "Removed from archive.")
  }

  const showToast = (msg) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(""), 2500)
  }

  if (loading) {
    return (
      <div className="min-h-[70vh] flex justify-center items-center font-sans bg-[#FAF8F5]">
        <div className="text-center">
          <div className="w-10 h-10 border-2 border-[#1A1816] border-t-[#C5A059] rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-xs font-serif uppercase tracking-[0.2em] text-[#8E877E]">
            Consulting Archive...
          </p>
        </div>
      </div>
    )
  }

  if (error || !product) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-24 text-center font-sans bg-[#FAF8F5]">
        <p className="font-serif text-2xl font-bold uppercase tracking-wider mb-6 text-[#1A1816]">
          Piece Not Located in Archive
        </p>
        <Link
          to="/shop"
          className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] bg-[#1A1816] text-[#FAF8F5] px-8 py-3.5 hover:bg-[#C5A059] hover:text-[#1A1816] transition-colors"
        >
          <ArrowLeft size={14} /> Back to Catalog
        </Link>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-[#1A1816] py-14 font-sans">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Navigation Breadcrumb */}
        <Link
          to="/shop"
          className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-[#8E877E] hover:text-[#1A1816] mb-10 transition-colors"
        >
          <ArrowLeft size={14} />
          Return to Sartorial Collection
        </Link>

        {/* Product Display Container */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-16 items-start">
          {/* Left: Product Image with 3D Tilt */}
          <TiltCard className="w-full">
            <div className="aspect-[3/4] bg-[#F2EFE9] border border-[#E5DFD5] overflow-hidden relative shadow-lg">
              <img
                src={product.image || "https://images.unsplash.com/photo-1544441893-675973e31985?w=800"}
                alt={product.title}
                onError={(e) => {
                  e.currentTarget.onerror = null
                  e.currentTarget.src = "https://images.unsplash.com/photo-1544441893-675973e31985?w=800"
                }}
                className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
              />
              <div className="absolute top-4 left-4 bg-[#1A1816] text-[#FAF8F5] px-3.5 py-1 text-[9px] font-bold uppercase tracking-[0.2em]">
                {product.category || "Bespoke"}
              </div>
            </div>
          </TiltCard>

          {/* Right: Garment Attributes & Ordering */}
          <div className="flex flex-col space-y-7">
            <div>
              <div className="flex items-center gap-2.5 mb-2.5">
                <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-[#8E877E]">
                  {product.category || "Tailoring"}
                </span>
                <span className="text-[#8E877E]">•</span>
                <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-[#C5A059]">
                  Bespoke Handcrafted
                </span>
              </div>

              <h1 className="font-serif text-3xl sm:text-4xl font-bold text-[#1A1816] tracking-tight mb-3">
                {product.title}
              </h1>

              <p className="font-serif text-3xl font-bold text-[#1A1816]">
                ${Number(product.price).toFixed(2)}
              </p>
            </div>

            {/* Size Selector */}
            <div className="border-t border-[#E5DFD5] pt-6">
              <div className="flex justify-between items-center mb-3">
                <span className="text-xs font-semibold uppercase tracking-[0.18em] text-[#1A1816]">
                  Select Sizing
                </span>
                <span className="text-[10px] uppercase tracking-widest text-[#8E877E]">
                  Classic Fit Guarantee
                </span>
              </div>
              <div className="grid grid-cols-5 gap-2">
                {sizes.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setSelectedSize(s)}
                    className={`py-3 text-xs font-serif font-bold border transition-colors cursor-pointer ${
                      selectedSize === s
                        ? "bg-[#1A1816] text-[#FAF8F5] border-[#1A1816]"
                        : "border-[#E5DFD5] text-[#1A1816] hover:border-[#1A1816] bg-[#F2EFE9]"
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            {/* Color Shade Swatches */}
            <div>
              <span className="text-xs font-semibold uppercase tracking-[0.18em] text-[#1A1816] block mb-3">
                Fabric Shade: {selectedColor}
              </span>
              <div className="flex gap-3">
                {colors.map((c) => (
                  <button
                    key={c.name}
                    type="button"
                    onClick={() => setSelectedColor(c.name)}
                    className={`w-9 h-9 rounded-full border-2 transition-transform cursor-pointer ${
                      selectedColor === c.name
                        ? "scale-110 border-[#C5A059] ring-2 ring-[#C5A059]/40"
                        : "border-transparent hover:scale-105"
                    }`}
                    style={{ backgroundColor: c.hex }}
                    aria-label={c.name}
                    title={c.name}
                  />
                ))}
              </div>
            </div>

            {/* In-page notification */}
            {toastMessage && (
              <div className="p-3 bg-[#F2EFE9] border border-[#1A1816] text-[#1A1816] text-xs font-normal flex items-center gap-2">
                <Check size={14} className="text-[#1A1816]" />
                <span>{toastMessage}</span>
              </div>
            )}

            {/* Stepper & Actions */}
            <div className="space-y-4 pt-2">
              <div className="flex items-center gap-4">
                <div className="flex items-center border border-[#E5DFD5] bg-[#F2EFE9]">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-10 h-12 font-serif font-bold text-base hover:bg-[#E5DFD5] transition-colors cursor-pointer"
                  >
                    −
                  </button>
                  <span className="w-12 text-center font-serif font-bold text-sm">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="w-10 h-12 font-serif font-bold text-base hover:bg-[#E5DFD5] transition-colors cursor-pointer"
                  >
                    +
                  </button>
                </div>

                <button
                  onClick={handleAddToCart}
                  className="flex-1 bg-[#1A1816] text-[#FAF8F5] h-12 font-semibold uppercase tracking-[0.2em] text-xs hover:bg-[#C5A059] hover:text-[#1A1816] transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-md"
                >
                  <ShoppingBag size={15} />
                  Add To Wardrobe
                </button>

                <button
                  onClick={handleToggleWishlist}
                  className={`h-12 w-12 border flex items-center justify-center transition-colors cursor-pointer ${
                    isWishlisted
                      ? "border-[#78281F] text-[#78281F] bg-[#78281F]/5"
                      : "border-[#E5DFD5] text-[#1A1816] hover:border-[#1A1816] bg-[#F2EFE9]"
                  }`}
                  title="Save in Private Archive"
                >
                  <Heart size={18} fill={isWishlisted ? "currentColor" : "none"} />
                </button>
              </div>

              <button
                onClick={() => {
                  handleAddToCart()
                  navigate("/checkout")
                }}
                className="w-full bg-[#C5A059] text-[#1A1816] py-3.5 font-bold uppercase tracking-[0.2em] text-xs hover:bg-[#C5A059]/90 transition-colors cursor-pointer"
              >
                Proceed To Commission
              </button>
            </div>

            {/* Description / Sartorial Notes */}
            <div className="border-t border-[#E5DFD5] pt-6 space-y-3">
              <h3 className="text-xs font-semibold uppercase tracking-[0.2em] text-[#1A1816]">
                Sartorial Notes & Craftsmanship
              </h3>
              <p className="text-sm text-[#6A645D] leading-relaxed font-normal">
                {product.description ||
                  "Hand-stitched by master artisans using time-honored European tailoring practices. Crafted from unblended natural fibers for a fluid drape, sublime tactile sensation, and multigenerational longevity."}
              </p>
            </div>

            {/* Heritage Guarantees */}
            <div className="border-t border-[#E5DFD5] pt-6 grid grid-cols-3 gap-4 text-center">
              <div className="flex flex-col items-center">
                <Truck size={18} className="text-[#8E877E] mb-1.5" />
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#1A1816]">Private Courier</span>
                <span className="text-[9px] text-[#8E877E]">Orders over $150</span>
              </div>
              <div className="flex flex-col items-center">
                <RefreshCw size={18} className="text-[#8E877E] mb-1.5" />
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#1A1816]">Complimentary</span>
                <span className="text-[9px] text-[#8E877E]">30-Day Returns</span>
              </div>
              <div className="flex flex-col items-center">
                <Award size={18} className="text-[#C5A059] mb-1.5" />
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#1A1816]">Authentic</span>
                <span className="text-[9px] text-[#8E877E]">Ancestral Mills</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
