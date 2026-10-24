import { useState, useEffect, useRef } from "react"
import { Link, useNavigate } from "react-router-dom"
import ProductCard from "../Products/ProductCard"
import { GetRequest } from "../../config/http"
import { ArrowRight, ChevronLeft, ChevronRight, Eye } from "lucide-react"
import TiltCard from "../common/TiltCard"

export default function HomePage() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeLookIndex, setActiveLookIndex] = useState(0)
  const trackRef = useRef(null)
  const cardRefs = useRef([])
  const navigate = useNavigate()

  // Curated editorial looks showing people wearing different products
  const editorialLooks = [
    {
      id: "look-1",
      title: "Bespoke Double-Breasted Cashmere Overcoat",
      category: "Outerwear",
      price: "$1,850.00",
      description: "100% Mongolian virgin cashmere tailored with handcrafted peak lapels.",
      image: "https://images.unsplash.com/photo-1544441893-675973e31985?w=1400&auto=format&fit=crop&q=80",
      searchKey: "cashmere overcoat",
    },
    {
      id: "look-2",
      title: "Hand-Tailored Tweed Houndstooth Blazer",
      category: "Tailoring",
      price: "$1,250.00",
      description: "Traditional Scottish wool woven for structured poise and effortless warmth.",
      image: "https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=1400&auto=format&fit=crop&q=80",
      searchKey: "houndstooth blazer",
    },
    {
      id: "look-3",
      title: "Chunky 6-Ply Pure Merino Cable-Knit Crewneck",
      category: "Knitwear",
      price: "$420.00",
      description: "Spun from 19.5-micron virgin merino wool for rich texture and softness.",
      image: "https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=1400&auto=format&fit=crop&q=80",
      searchKey: "cable-knit",
    },
    {
      id: "look-4",
      title: "Sea Island Cotton Spread-Collar Dress Shirt",
      category: "Shirting",
      price: "$280.00",
      description: "Silky 140/2 double-twisted long-staple cotton with mother-of-pearl buttons.",
      image: "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=1400&auto=format&fit=crop&q=80",
      searchKey: "dress shirt",
    },
  ]

  useEffect(() => {
    const fetchDBData = async () => {
      try {
        setLoading(true)
        const res = await GetRequest("products")
        setProducts(res.data || [])
      } catch (err) {
        console.error("Error fetching products from database:", err)
      } finally {
        setLoading(false)
      }
    }

    fetchDBData()
  }, [])

  // Smoothly center the active card in the scroll track
  useEffect(() => {
    const card = cardRefs.current[activeLookIndex]
    const track = trackRef.current
    if (card && track) {
      const trackWidth = track.offsetWidth
      const cardWidth = card.offsetWidth
      const cardLeft = card.offsetLeft
      const targetScroll = cardLeft - (trackWidth - cardWidth) / 2
      track.scrollTo({ left: targetScroll, behavior: "smooth" })
    }
  }, [activeLookIndex])

  const prevLook = () => {
    setActiveLookIndex((prev) => (prev === 0 ? editorialLooks.length - 1 : prev - 1))
  }

  const nextLook = () => {
    setActiveLookIndex((prev) => (prev === editorialLooks.length - 1 ? 0 : prev + 1))
  }

  // Find corresponding DB product for a look
  const getProductForLook = (look) => {
    const matched = products.find((p) =>
      p.title?.toLowerCase().includes(look.searchKey.toLowerCase())
    )
    return matched || products[0]
  }

  const heroPiece = products[0]

  return (
    <div className="bg-[#FAF8F5] text-[#1A1816]">
      {/* Hero Section */}
      <section className="relative overflow-hidden border-b border-[#E5DFD5] bg-[#FAF8F5]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid md:grid-cols-12 gap-12 items-center py-16 lg:py-24">
          {/* Hero Left Copy */}
          <div className="md:col-span-7 space-y-7">
            <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-[#1A1816] leading-[1.1]">
              Sartorial Elegance. <br />
              <span className="italic font-normal text-[#C5A059]">Quiet Luxury.</span>
            </h1>

            <p className="text-sm sm:text-base text-[#6A645D] max-w-lg leading-relaxed font-normal">
              Hand-tailored cashmere overcoats, Tuscan leather loafers, full-grain belts, and timeless wardrobe essentials made to last.
            </p>

            <div className="flex flex-wrap gap-4 pt-2">
              <button
                onClick={() => navigate("/shop")}
                className="bg-[#1A1816] text-[#FAF8F5] px-8 py-3.5 text-xs font-semibold uppercase tracking-wider hover:bg-[#C5A059] hover:text-[#1A1816] transition-all duration-300 cursor-pointer shadow-sm"
              >
                View Collection
              </button>
              <button
                onClick={() => navigate("/shop?category=Leather+Shoes")}
                className="border border-[#1A1816] text-[#1A1816] px-7 py-3.5 text-xs font-semibold uppercase tracking-wider hover:bg-[#1A1816] hover:text-[#FAF8F5] transition-colors cursor-pointer"
              >
                Footwear
              </button>
            </div>

            {/* Heritage Micro Stats */}
            <div className="pt-6 border-t border-[#E5DFD5] grid grid-cols-3 gap-6 max-w-md">
              <div>
                <p className="font-serif text-xl font-bold text-[#1A1816]">100%</p>
                <p className="text-[10px] uppercase tracking-wider text-[#8E877E] font-semibold">Virgin Cashmere</p>
              </div>
              <div>
                <p className="font-serif text-xl font-bold text-[#1A1816]">Tuscan</p>
                <p className="text-[10px] uppercase tracking-wider text-[#8E877E] font-semibold">Full-Grain Leather</p>
              </div>
              <div>
                <p className="font-serif text-xl font-bold text-[#1A1816]">Goodyear</p>
                <p className="text-[10px] uppercase tracking-wider text-[#8E877E] font-semibold">Welted Soles</p>
              </div>
            </div>
          </div>

          {/* Hero Right Showcase */}
          <div className="md:col-span-5 relative w-full h-[400px] sm:h-[480px]">
            {heroPiece ? (
              <TiltCard className="w-full h-full">
                <Link
                  to={`/products/${heroPiece._id}`}
                  className="block relative w-full h-full border border-[#E5DFD5] shadow-lg overflow-hidden bg-[#F2EFE9] group no-underline"
                >
                  <img
                    src={heroPiece.image || "https://images.unsplash.com/photo-1544441893-675973e31985?w=800"}
                    alt={heroPiece.title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#1A1816]/80 via-transparent to-transparent"></div>

                  <div className="absolute bottom-6 left-6 right-6 text-[#FAF8F5]">
                    <span className="text-[9px] font-bold uppercase tracking-wider text-[#C5A059] block mb-1">
                      {heroPiece.category || "FEATURED"}
                    </span>
                    <h3 className="font-serif text-xl font-bold tracking-wide">
                      {heroPiece.title}
                    </h3>
                    <p className="text-sm font-serif font-bold text-[#C5A059] mt-1">
                      ${Number(heroPiece.price).toFixed(2)}
                    </p>
                  </div>
                </Link>
              </TiltCard>
            ) : (
              <div className="w-full h-full bg-[#F2EFE9] flex items-center justify-center border border-[#E5DFD5]">
                <p className="text-xs uppercase tracking-wider text-[#8E877E]">Collection</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Marquee Banner */}
      <div className="bg-[#1A1816] text-[#FAF8F5] py-3 overflow-hidden border-y border-[#C5A059]/40 relative flex whitespace-nowrap select-none">
        <div className="animate-marquee flex gap-10 font-serif tracking-[0.2em] uppercase text-xs">
          <span className="text-[#C5A059]">❖ BESPOKE TAILORING</span>
          <span>GOODYEAR-WELTED LEATHER LOAFERS</span>
          <span className="text-[#C5A059]">❖ FULL-GRAIN LEATHER ACCESSORIES</span>
          <span>6-PLY PURE MERINO SWEATERS</span>
          <span className="text-[#C5A059]">❖ CRAFTED WITH CARE</span>
          <span>SEA ISLAND COTTON SHIRTS</span>
          <span className="text-[#C5A059]">❖ BESPOKE TAILORING</span>
          <span>GOODYEAR-WELTED LEATHER LOAFERS</span>
        </div>
      </div>

      {/* ======================================================== */}
      {/* APPLE-STYLE FEATURE SCROLLER: PEOPLE WEARING THE PRODUCTS */}
      {/* ======================================================== */}
      <section className="py-20 bg-[#F2EFE9] border-b border-[#E5DFD5] overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-[#8E877E] block mb-1">
                Featured Looks
              </span>
              <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#1A1816] tracking-tight">
                Styles in Real Life
              </h2>
              <p className="text-xs text-[#6A645D] mt-1 max-w-md">
                Click any look to view details. Scroll or swipe through each piece worn in everyday life.
              </p>
            </div>

            {/* Next / Previous Controls */}
            <div className="flex items-center gap-2">
              <button
                onClick={prevLook}
                aria-label="Previous Look"
                className="w-10 h-10 rounded-full border border-[#1A1816]/30 bg-[#FAF8F5] flex items-center justify-center hover:bg-[#1A1816] hover:text-[#FAF8F5] transition-colors cursor-pointer shadow-sm"
              >
                <ChevronLeft size={18} />
              </button>
              <button
                onClick={nextLook}
                aria-label="Next Look"
                className="w-10 h-10 rounded-full border border-[#1A1816]/30 bg-[#FAF8F5] flex items-center justify-center hover:bg-[#1A1816] hover:text-[#FAF8F5] transition-colors cursor-pointer shadow-sm"
              >
                <ChevronRight size={18} />
              </button>
            </div>
          </div>
        </div>

        {/* The Carousel Track */}
        <div
          ref={trackRef}
          className="flex gap-4 sm:gap-6 overflow-x-auto py-4 px-4 sm:px-[12vw] scroll-smooth"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {editorialLooks.map((look, idx) => {
            const isActive = idx === activeLookIndex
            const matchedProduct = getProductForLook(look)
            const targetUrl = matchedProduct?._id ? `/products/${matchedProduct._id}` : "/shop"

            return (
              <div
                key={look.id}
                ref={(el) => (cardRefs.current[idx] = el)}
                onClick={() => setActiveLookIndex(idx)}
                className={`shrink-0 w-[82vw] sm:w-[520px] md:w-[640px] aspect-[16/10] sm:aspect-[16/9] relative rounded-2xl overflow-hidden cursor-pointer transition-all duration-700 select-none ${
                  isActive
                    ? "opacity-100 scale-100 filter-none shadow-2xl ring-2 ring-[#C5A059]/70 z-20"
                    : "opacity-45 scale-[0.93] blur-[3.5px] hover:opacity-75 hover:blur-[1px] shadow-md z-10"
                }`}
              >
                {/* Background Photo of Person Wearing the Product */}
                <img
                  src={look.image}
                  alt={look.title}
                  className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
                />

                {/* Shading Gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#1A1816]/95 via-[#1A1816]/30 to-transparent"></div>

                {/* Badge (Top-Left) */}
                <div className="absolute top-4 left-4 sm:top-6 sm:left-6">
                  <span className="bg-[#1A1816]/90 backdrop-blur-md text-[#C5A059] px-3.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-full border border-[#C5A059]/30 shadow">
                    {look.category}
                  </span>
                </div>

                {/* Product Info & CTA on Active Card */}
                <div
                  className={`absolute bottom-4 left-4 right-4 sm:bottom-6 sm:left-6 sm:right-6 text-[#FAF8F5] transition-all duration-500 ${
                    isActive ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3 pointer-events-none"
                  }`}
                >
                  <p className="text-[11px] uppercase tracking-wider text-[#C5A059] font-bold mb-1">
                    Featured Look • {look.price}
                  </p>
                  <h3 className="font-serif text-xl sm:text-2xl lg:text-3xl font-bold tracking-tight mb-1 text-white leading-snug">
                    {look.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-[#FAF8F5]/85 line-clamp-2 max-w-xl mb-4 font-normal">
                    {look.description}
                  </p>

                  <div className="flex items-center gap-3">
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        navigate(targetUrl)
                      }}
                      className="bg-[#C5A059] text-[#1A1816] px-5 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider hover:bg-[#FAF8F5] transition-colors flex items-center gap-2 cursor-pointer shadow-md"
                    >
                      <Eye size={14} /> View Product
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        navigate("/shop")
                      }}
                      className="text-xs font-semibold uppercase tracking-wider text-[#FAF8F5]/90 hover:text-white underline cursor-pointer px-2"
                    >
                      Explore All
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* Carousel Pill Indicators */}
        <div className="flex justify-center items-center gap-2.5 mt-6">
          {editorialLooks.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setActiveLookIndex(idx)}
              aria-label={`Go to slide ${idx + 1}`}
              className={`h-2 transition-all duration-300 rounded-full cursor-pointer ${
                idx === activeLookIndex
                  ? "w-8 bg-[#1A1816]"
                  : "w-2 bg-[#1A1816]/30 hover:bg-[#1A1816]/60"
              }`}
            />
          ))}
        </div>
      </section>

      {/* ======================================================== */}
      {/* FEATURED PRODUCTS: EXACTLY A SINGLE ROW OF FOUR PRODUCTS */}
      {/* ======================================================== */}
      <section className="py-20 bg-[#FAF8F5]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-10 gap-4 border-b border-[#E5DFD5] pb-5">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#8E877E] block mb-1">
                Featured Selection
              </span>
              <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#1A1816] tracking-tight">
                Featured Products
              </h2>
            </div>
            <Link
              to="/shop"
              className="text-xs font-semibold uppercase tracking-wider text-[#1A1816] hover:text-[#C5A059] transition-colors flex items-center gap-1.5 no-underline"
            >
              View All Products <ArrowRight size={13} />
            </Link>
          </div>

          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="text-center">
                <div className="w-8 h-8 border-2 border-[#1A1816] border-t-[#C5A059] rounded-full animate-spin mx-auto mb-3"></div>
                <p className="text-xs uppercase tracking-wider text-[#8E877E]">
                  Loading products...
                </p>
              </div>
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-16 bg-[#F2EFE9] border border-[#E5DFD5] p-8">
              <p className="font-serif text-lg font-bold uppercase tracking-wider mb-3">No products available</p>
              <button
                onClick={() => navigate("/shop")}
                className="bg-[#1A1816] text-[#FAF8F5] px-6 py-2.5 font-semibold uppercase text-xs tracking-wider cursor-pointer"
              >
                Go to Shop
              </button>
            </div>
          ) : (
            /* Single row of four products */
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {products.slice(0, 4).map((product) => (
                <ProductCard item={product} key={product._id} />
              ))}
            </div>
          )}

          <div className="mt-14 text-center">
            <button
              onClick={() => navigate("/shop")}
              className="border border-[#1A1816] text-[#1A1816] px-10 py-3.5 font-semibold uppercase tracking-wider text-xs hover:bg-[#1A1816] hover:text-[#FAF8F5] transition-colors cursor-pointer"
            >
              View All Products
            </button>
          </div>
        </div>
      </section>
    </div>
  )
}
