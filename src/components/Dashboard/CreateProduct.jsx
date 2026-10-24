import { useState, useEffect } from "react"
import { GetRequest, PostRequest } from "../../config/http"

export default function CreateProduct({ onProductCreated }) {
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState("")

  const [title, setTitle] = useState("")
  const [price, setPrice] = useState("")
  const [description, setDescription] = useState("")
  const [category, setCategory] = useState("General")
  const [image, setImage] = useState("")
  const [stock, setStock] = useState(15)

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const [prodRes, catRes] = await Promise.all([
          GetRequest("products"),
          GetRequest("category/getAll").catch(() => ({ data: [] })),
        ])
        const dbCats = catRes.data.map((c) => c.title)
        const prodCats = prodRes.data.map((p) => p.category).filter(Boolean)
        const mergedCats = [
          ...new Set([
            "General",
            ...dbCats,
            ...prodCats,
          ]),
        ]
        setCategories(mergedCats)
        if (mergedCats.length > 0 && !mergedCats.includes(category)) {
          setCategory(mergedCats[0])
        }
      } catch (err) {
        console.error(err)
      }
    }
    fetchCategories()
  }, [])

  const [error, setError] = useState("")

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSuccess("")
    setError("")

    if (!title.trim() || price === "") {
      setError("Please provide title and price.")
      return
    }

    try {
      setLoading(true)
      const body = {
        title: title.trim(),
        price: Number(price),
        description: description.trim(),
        category: category || "General",
        image: image.trim() || "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800",
        stock: Number(stock) || 10,
      }

      await PostRequest("products", body)

      setSuccess("Product created successfully in the archive!")
      setTitle("")
      setPrice("")
      setDescription("")
      setImage("")
      setStock(15)

      if (onProductCreated) onProductCreated()
    } catch (err) {
      console.error(err)
      setError(err.response?.data?.message || "Failed to create product")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl bg-card border-2 border-border p-8 shadow-xl font-sans">
      <div className="mb-6 pb-4 border-b border-border">
        <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground block mb-1">
          Catalog Addition
        </span>
        <h2 className="text-2xl font-black text-foreground tracking-tight uppercase">
          Create Product
        </h2>
      </div>

      {success && (
        <div className="mb-6 p-3 bg-[#F2EFE9] border border-[#1A1816] text-[#1A1816] text-xs font-normal">
          {success}
        </div>
      )}

      {error && (
        <div className="mb-6 p-3 bg-red-50 border border-red-300 text-red-800 text-xs font-normal">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5 text-xs font-bold uppercase tracking-wider">
        <div>
          <label className="block mb-1.5 text-foreground">Product Title *</label>
          <input
            type="text"
            required
            placeholder="e.g. Minimalist Tech Bomber"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full bg-background border-2 border-border px-4 py-3 text-xs font-semibold focus:outline-none focus:border-foreground text-foreground"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block mb-1.5 text-foreground">Price ($) *</label>
            <input
              type="number"
              step="0.01"
              required
              placeholder="120.00"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              className="w-full bg-background border-2 border-border px-4 py-3 text-xs font-semibold focus:outline-none focus:border-foreground text-foreground"
            />
          </div>

          <div>
            <label className="block mb-1.5 text-foreground">Initial Stock</label>
            <input
              type="number"
              value={stock}
              onChange={(e) => setStock(e.target.value)}
              className="w-full bg-background border-2 border-border px-4 py-3 text-xs font-semibold focus:outline-none focus:border-foreground text-foreground"
            />
          </div>
        </div>

        <div>
          <label className="block mb-1.5 text-foreground">Category</label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full bg-background border-2 border-border px-4 py-3 text-xs font-semibold focus:outline-none focus:border-foreground text-foreground"
          >
            {categories.map((c, i) => (
              <option key={i} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block mb-1.5 text-foreground">Image URL</label>
          <input
            type="text"
            placeholder="https://images.unsplash.com/..."
            value={image}
            onChange={(e) => setImage(e.target.value)}
            className="w-full bg-background border-2 border-border px-4 py-3 text-xs font-semibold focus:outline-none focus:border-foreground text-foreground"
          />
        </div>

        <div>
          <label className="block mb-1.5 text-foreground">Product Description</label>
          <textarea
            rows={3}
            placeholder="Key design details, fabric blend, fit..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full bg-background border-2 border-border px-4 py-3 text-xs font-semibold focus:outline-none focus:border-foreground text-foreground resize-none"
          />
        </div>

        <div className="pt-2">
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-foreground text-background py-4 font-black uppercase tracking-widest text-xs hover:bg-primary hover:text-primary-foreground transition-colors disabled:opacity-50 cursor-pointer shadow-lg"
          >
            {loading ? "Publishing to Archive..." : "Save Product to Store"}
          </button>
        </div>
      </form>
    </div>
  )
}