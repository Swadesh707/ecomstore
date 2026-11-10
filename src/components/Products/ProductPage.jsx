import { useState, useEffect, useMemo } from "react"
import { useSearchParams } from "react-router-dom"
import ProductCard from "./ProductCard"
import ProductSkeleton from "./ProductSkeleton"
import { GetRequest, prefetchGet } from "../../config/http"
import { Search, ArrowUpDown } from "lucide-react"

export default function ProductPage({ defaultCategory, isSalePage }) {
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([
    "All",
    "Tailoring & Outerwear",
    "Knitwear & Shirts",
    "Leather Shoes",
    "Belts & Leather Goods",
    "Fine Accessories",
  ])
  const [sortBy, setSortBy] = useState("default")
  const [loading, setLoading] = useState(true)
  const [searchParams, setSearchParams] = useSearchParams()

  const isSale = Boolean(isSalePage || searchParams.get("sale") === "true")
  const currentCategory = searchParams.get("category") || defaultCategory || "All"
  const currentSearch = searchParams.get("search") || ""

  useEffect(() => {
    const fetchCats = async () => {
      try {
        const [catRes, prodRes] = await Promise.all([
          GetRequest("category/getAll").catch(() => ({ data: [] })),
          GetRequest("products").catch(() => ({ data: [] })),
        ])

        const dbCats = catRes.data.map((c) => c.title)
        const prodCats = prodRes.data.map((p) => p.category).filter(Boolean)
        const defaults = [
          "All",
          "Tailoring & Outerwear",
          "Knitwear & Shirts",
          "Leather Shoes",
          "Belts & Leather Goods",
          "Fine Accessories",
        ]
        const merged = ["All", ...new Set([...defaults.slice(1), ...dbCats, ...prodCats])]
        setCategories(merged)
      } catch (err) {
        console.error("Error loading categories:", err)
      }
    }
    fetchCats()
  }, [])

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true)
        const params = new URLSearchParams()

        if (currentCategory && currentCategory !== "All") {
          params.append("category", currentCategory)
        }
        if (currentSearch) {
          params.append("search", currentSearch)
        }

        const query = params.toString() ? `?${params.toString()}` : ""
        const res = await GetRequest(`products${query}`)
        setProducts(res.data)
      } catch (err) {
        console.error("Error fetching products:", err)
      } finally {
        setLoading(false)
      }
    }

    fetchProducts()
  }, [currentCategory, currentSearch])

  const handleCategoryHover = (cat) => {
    const params = new URLSearchParams()
    if (cat && cat !== "All") {
      params.append("category", cat)
    }
    if (currentSearch) {
      params.append("search", currentSearch)
    }
    const query = params.toString() ? `?${params.toString()}` : ""
    prefetchGet(`products${query}`)
  }

  const handleSortHover = () => {

    prefetchGet("products")
  }

  const sortedProducts = useMemo(() => {
    if (!products || products.length === 0) return []
    const list = [...products]
    if (sortBy === "price-low") {
      return list.sort((a, b) => (Number(a.price) || 0) - (Number(b.price) || 0))
    }
    if (sortBy === "price-high") {
      return list.sort((a, b) => (Number(b.price) || 0) - (Number(a.price) || 0))
    }
    if (sortBy === "name") {
      return list.sort((a, b) => (a.title || "").localeCompare(b.title || ""))
    }
    return list
  }, [products, sortBy])

  const handleCategorySelect = (cat) => {
    const newParams = new URLSearchParams(searchParams)
    if (cat === "All") {
      newParams.delete("category")
    } else {
      newParams.set("category", cat)
    }
    setSearchParams(newParams)
  }

  const handleSearchChange = (val) => {
    const newParams = new URLSearchParams(searchParams)
    if (val) {
      newParams.set("search", val)
    } else {
      newParams.delete("search")
    }
    setSearchParams(newParams)
  }

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-[#1A1816] py-12 font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-10 border-b border-[#E5DFD5] pb-6">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#C5A059] block mb-1.5">
            {isSale ? "Special Offers" : "Collection"}
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-[#1A1816] mb-2">
            {isSale
              ? "SALE"
              : currentCategory === "All"
              ? "ALL PRODUCTS"
              : currentCategory.toUpperCase()}
          </h1>
          <p className="text-xs sm:text-sm text-[#6A645D] font-normal max-w-xl">
            {isSale
              ? "Browse discounted items and seasonal deals."
              : "Quality clothing, footwear, and accessories made to last."}
          </p>
        </div>
        <div className="mb-10 space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="relative w-full sm:max-w-xs">
              <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8E877E]" />
              <input
                type="text"
                placeholder="Search products..."
                value={currentSearch}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="w-full bg-[#F2EFE9] border border-[#E5DFD5] pl-10 pr-4 py-2.5 text-xs font-semibold focus:outline-none focus:border-[#1A1816] transition-colors text-[#1A1816] placeholder:text-[#8E877E]"
              />
            </div>
            <div
              className="flex items-center gap-2 self-start sm:self-auto"
              onMouseEnter={handleSortHover}
            >
              <ArrowUpDown size={14} className="text-[#8E877E]" />
              <span className="text-[11px] uppercase tracking-wider font-bold text-[#8E877E]">Sort:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-[#F2EFE9] border border-[#E5DFD5] py-2 px-3 text-xs font-semibold text-[#1A1816] focus:outline-none focus:border-[#1A1816] cursor-pointer"
              >
                <option value="default">Default</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="name">Alphabetical</option>
              </select>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => {
              const isSelected =
                (currentCategory === "All" && cat === "All") ||
                currentCategory === cat

              return (
                <button
                  key={cat}
                  onClick={() => handleCategorySelect(cat)}
                  onMouseEnter={() => handleCategoryHover(cat)}
                  className={`px-4 py-2 text-xs font-semibold uppercase tracking-wider transition-colors cursor-pointer rounded-none ${
                    isSelected
                      ? "bg-[#1A1816] text-[#FAF8F5] border border-[#1A1816]"
                      : "bg-[#F2EFE9] border border-[#E5DFD5] text-[#1A1816] hover:border-[#1A1816]"
                  }`}
                >
                  {cat === "All" ? "All Products" : cat}
                </button>
              )
            })}
          </div>
        </div>
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <ProductSkeleton key={i} />
            ))}
          </div>
        ) : sortedProducts.length === 0 ? (
          <div className="text-center py-16 bg-[#F2EFE9] border border-[#E5DFD5] p-8">
            <p className="font-serif text-xl font-bold uppercase tracking-wider mb-2 text-[#1A1816]">
              No products found
            </p>
            <p className="text-xs text-[#8E877E] uppercase tracking-wider mb-5">
              Please adjust your category filter or search term.
            </p>
            <button
              onClick={() => setSearchParams({})}
              className="bg-[#1A1816] text-[#FAF8F5] px-6 py-2.5 text-xs font-semibold uppercase tracking-wider hover:bg-[#C5A059] hover:text-[#1A1816] transition-colors cursor-pointer"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <>
            <div className="mb-4 text-xs font-semibold uppercase tracking-wider text-[#8E877E]">
              {sortedProducts.length} {sortedProducts.length === 1 ? "Product" : "Products"} Available
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {sortedProducts.map((product) => (
                <ProductCard item={product} key={product._id} isSale={isSale} />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
