import { useState, useEffect } from "react"
import { Link, useNavigate } from "react-router-dom"
import ProductCard from "../Products/ProductCard"
import { GetRequest } from "../../config/http"
import { ArrowRight } from "lucide-react"
import TiltCard from "../common/TiltCard"

export default function HomePage() {
  const [products, setProducts] = useState([])
  const [leatherHighlights, setLeatherHighlights] = useState([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  // Everything fetched 100% dynamically from MongoDB
  useEffect(() => {
    const fetchDBData = async () => {
      try {
        setLoading(true)
        const [allRes, leatherRes] = await Promise.all([
          GetRequest("products"),
          GetRequest("products?category=Leather+Shoes").catch(() => ({ data: [] })),
        ])

        const allItems = allRes.data || []
        setProducts(allItems)

        // Select leather shoes & leather goods from the DB
        let highlights = (leatherRes.data || []).slice(0, 2)
        if (highlights.length < 2) {
          highlights = allItems
            .filter(
              (p) =>
                p.category === "Leather Shoes" ||
                p.category === "Belts & Leather Goods"
            )
            .slice(0, 2)
        }
        if (highlights.length < 2) {
          highlights = allItems.slice(0, 2)
        }
        setLeatherHighlights(highlights)
      } catch (err) {
        console.error("Error fetching products from database:", err)
      } finally {
        setLoading(false)
      }
    }

    fetchDBData()
  }, [])

  // Featured flagship piece from DB for the hero section
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
              Hand-tailored cashmere overcoats, Goodyear-welted Tuscan leather loafers, full-grain saddle belts, and heirloom pieces crafted for generations.
            </p>

            <div className="flex flex-wrap gap-4 pt-2">
              <button
                onClick={() => navigate("/shop")}
                className="bg-[#1A1816] text-[#FAF8F5] px-8 py-3.5 text-xs font-semibold uppercase tracking-[0.18em] hover:bg-[#C5A059] hover:text-[#1A1816] transition-all duration-300 cursor-pointer shadow-sm"
              >
                View The Collection
              </button>
              <button
                onClick={() => navigate("/shop?category=Leather+Shoes")}
                className="border border-[#1A1816] text-[#1A1816] px-7 py-3.5 text-xs font-semibold uppercase tracking-[0.18em] hover:bg-[#1A1816] hover:text-[#FAF8F5] transition-colors cursor-pointer"
              >
                Leather Footwear
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

          {/* Hero Right Showcase (Powered by DB Hero Product with 3D Tilt) */}
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
                    <span className="text-[9px] font-bold uppercase tracking-[0.25em] text-[#C5A059] block mb-1">
                      {heroPiece.category || "FLAGSHIP DROP"}
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
                <p className="text-xs uppercase tracking-widest text-[#8E877E]">Atelier Collection</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Marquee Banner */}
      <div className="bg-[#1A1816] text-[#FAF8F5] py-3 overflow-hidden border-y border-[#C5A059]/40 relative flex whitespace-nowrap select-none">
        <div className="animate-marquee flex gap-10 font-serif tracking-[0.2em] uppercase text-xs">
          <span className="text-[#C5A059]">❖ BESPOKE SAVILE ROW TAILORING</span>
          <span>GOODYEAR-WELTED ITALIAN LEATHER LOAFERS</span>
          <span className="text-[#C5A059]">❖ FULL-GRAIN BRIDLE LEATHER BELTS</span>
          <span>6-PLY MERINO CABLE-KNIT SWEATERS</span>
          <span className="text-[#C5A059]">❖ HANDMADE IN FLORENCE & NORTHAMPTON</span>
          <span>SEA ISLAND COTTON OXFORD SHIRTS</span>
          <span className="text-[#C5A059]">❖ BESPOKE SAVILE ROW TAILORING</span>
          <span>GOODYEAR-WELTED ITALIAN LEATHER LOAFERS</span>
        </div>
      </div>

      {/* Leather & Footwear Highlight (100% Powered by DB items) */}
      {leatherHighlights.length > 0 && (
        <section className="py-20 bg-[#F2EFE9] border-b border-[#E5DFD5]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10 gap-4">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-[#8E877E] block mb-1">
                  Artisan Cobblery & Leatherwork
                </span>
                <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#1A1816] tracking-tight">
                  The Leather Masterworks
                </h2>
              </div>

              <Link
                to="/shop?category=Leather+Shoes"
                className="text-xs font-semibold uppercase tracking-[0.18em] border-b border-[#1A1816] pb-1 text-[#1A1816] hover:text-[#C5A059] hover:border-[#C5A059] transition-colors flex items-center gap-1.5 no-underline"
              >
                Explore Footwear <ArrowRight size={13} />
              </Link>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              {leatherHighlights.map((item) => (
                <TiltCard key={item._id} className="w-full h-full">
                  <Link
                    to={`/products/${item._id}`}
                    className="relative aspect-[16/10] bg-[#FAF8F5] overflow-hidden border border-[#E5DFD5] shadow-sm group cursor-pointer block no-underline h-full"
                  >
                    <img
                      src={item.image}
                      alt={item.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute top-4 left-4 bg-[#1A1816] text-[#FAF8F5] px-3 py-1 text-[9px] font-bold uppercase tracking-[0.2em]">
                      {item.category}
                    </div>

                    <div className="absolute inset-0 bg-gradient-to-t from-[#1A1816]/90 via-[#1A1816]/20 to-transparent flex flex-col justify-end p-6">
                      <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#C5A059] mb-1">
                        Bespoke Masterwork
                      </span>
                      <h3 className="font-serif text-xl sm:text-2xl font-bold text-white mb-1.5">
                        {item.title}
                      </h3>
                      <div className="flex items-center gap-3">
                        <span className="text-[#C5A059] font-serif text-xl font-bold">
                          ${Number(item.price).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </Link>
                </TiltCard>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* The Wardrobe Essentials (100% Powered by DB items via ProductCard) */}
      <section className="py-20 bg-[#FAF8F5]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-12 gap-4 border-b border-[#E5DFD5] pb-5">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-[#8E877E] block mb-1">
                Bespoke Selection
              </span>
              <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#1A1816] tracking-tight">
                The Sartorial Wardrobe
              </h2>
            </div>
            <Link
              to="/shop"
              className="text-xs font-semibold uppercase tracking-[0.18em] text-[#1A1816] hover:text-[#C5A059] transition-colors flex items-center gap-1.5 no-underline"
            >
              Browse Complete Catalog <ArrowRight size={13} />
            </Link>
          </div>

          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="text-center">
                <div className="w-8 h-8 border-2 border-[#1A1816] border-t-[#C5A059] rounded-full animate-spin mx-auto mb-3"></div>
                <p className="text-xs uppercase tracking-[0.2em] text-[#8E877E]">
                  Curating Pieces from Archive DB...
                </p>
              </div>
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-16 bg-[#F2EFE9] border border-[#E5DFD5] p-8">
              <p className="font-serif text-lg font-bold uppercase tracking-wider mb-3">No pieces on display</p>
              <button
                onClick={() => navigate("/shop")}
                className="bg-[#1A1816] text-[#FAF8F5] px-6 py-2.5 font-semibold uppercase text-xs tracking-wider cursor-pointer"
              >
                Go to Catalog
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {products.map((product) => (
                <ProductCard item={product} key={product._id} />
              ))}
            </div>
          )}

          <div className="mt-14 text-center">
            <button
              onClick={() => navigate("/shop")}
              className="border border-[#1A1816] text-[#1A1816] px-10 py-3.5 font-semibold uppercase tracking-[0.2em] text-xs hover:bg-[#1A1816] hover:text-[#FAF8F5] transition-colors cursor-pointer"
            >
              Explore Full Wardrobe
            </button>
          </div>
        </div>
      </section>
    </div>
  )
}
