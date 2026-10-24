import { useState, useEffect } from "react"
import { GetRequest, PutRequest, DeleteRequest } from "../../config/http"
import { Search, Edit3, Trash2, X } from "lucide-react"

export default function UpdateProduct() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("All")

  const [editingProduct, setEditingProduct] = useState(null)
  const [editTitle, setEditTitle] = useState("")
  const [editPrice, setEditPrice] = useState("")
  const [editCategory, setEditCategory] = useState("")
  const [editStock, setEditStock] = useState(10)
  const [editImage, setEditImage] = useState("")
  const [editDescription, setEditDescription] = useState("")
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState("")
  const [confirmDelete, setConfirmDelete] = useState(null)

  const fetchProducts = async () => {
    try {
      setLoading(true)
      const res = await GetRequest("products")
      setProducts(res.data)
    } catch (err) {
      console.error("Failed to fetch products:", err)
      setMessage("Failed to load products.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchProducts()
  }, [])

  const handleOpenEdit = (product) => {
    setEditingProduct(product)
    setEditTitle(product.title)
    setEditPrice(product.price)
    setEditCategory(product.category || "General")
    setEditStock(product.stock ?? 10)
    setEditImage(product.image || "")
    setEditDescription(product.description || "")
    setMessage("")
  }

  const handleUpdateProduct = async (e) => {
    e.preventDefault()
    setMessage("")
    if (!editTitle.trim() || editPrice === "") {
      setMessage("Title and price are required.")
      return
    }

    try {
      setSaving(true)
      const body = {
        title: editTitle.trim(),
        price: Number(editPrice),
        category: editCategory.trim() || "General",
        stock: Number(editStock) || 0,
        image: editImage.trim(),
        description: editDescription.trim(),
      }

      const res = await PutRequest(`products/${editingProduct._id}`, body)

      setProducts((prev) =>
        prev.map((p) => (p._id === editingProduct._id ? res.data : p))
      )

      setMessage("Product updated successfully!")
      setEditingProduct(null)
    } catch (err) {
      console.error(err)
      setMessage(err.response?.data?.message || "Failed to update product")
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = (product) => {
    setConfirmDelete(product)
  }

  const executeDelete = async (id) => {
    try {
      await DeleteRequest(`products/${id}`)
      setProducts(products.filter((p) => p._id !== id))
      setMessage("Product deleted from archive!")
    } catch (err) {
      console.error(err)
      setMessage(err.response?.data?.message || "Failed to delete product")
    } finally {
      setConfirmDelete(null)
    }
  }

  const categories = [
    "All",
    ...new Set(products.map((p) => p.category).filter(Boolean)),
  ]

  const filteredProducts = products.filter((p) => {
    const matchesSearch = p.title?.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory =
      selectedCategory === "All" || p.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  return (
    <div className="max-w-5xl bg-card border-2 border-border p-8 font-sans shadow-xl">
      <div className="mb-6 pb-4 border-b border-border">
        <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground block mb-1">
          Catalog Operations
        </span>
        <h2 className="text-2xl font-black text-foreground tracking-tight uppercase">
          Inventory & Edit
        </h2>
      </div>

      {message && (
        <div className="mb-6 p-3 bg-[#F2EFE9] border border-[#1A1816] text-[#1A1816] text-xs font-normal">
          {message}
        </div>
      )}

      {confirmDelete && (
        <div className="mb-6 p-3.5 bg-[#F2EFE9] border border-[#1A1816] text-[#1A1816] text-xs font-normal flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <span>Are you sure you want to permanently delete <strong>{confirmDelete.title}</strong>?</span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => executeDelete(confirmDelete._id)}
              className="px-3.5 py-1.5 bg-[#1A1816] text-[#FAF8F5] text-xs font-normal cursor-pointer"
            >
              Confirm Delete
            </button>
            <button
              onClick={() => setConfirmDelete(null)}
              className="px-3.5 py-1.5 bg-[#FAF8F5] border border-[#E5DFD5] text-[#1A1816] text-xs font-normal cursor-pointer"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search archive pieces..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-background border-2 border-border pl-10 pr-4 py-2.5 text-xs font-semibold focus:outline-none focus:border-foreground text-foreground uppercase tracking-wider"
          />
        </div>
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="bg-background border-2 border-border px-4 py-2.5 text-xs font-semibold focus:outline-none focus:border-foreground text-foreground uppercase tracking-wider cursor-pointer"
        >
          {categories.map((c, i) => (
            <option key={i} value={c}>
              {c === "All" ? "All Categories" : c}
            </option>
          ))}
        </select>
      </div>

      {/* Table */}
      <div className="border-2 border-border overflow-x-auto bg-background">
        <table className="w-full text-left text-xs uppercase tracking-wider">
          <thead className="bg-card border-b-2 border-border text-foreground font-black">
            <tr>
              <th className="py-3 px-4">Item</th>
              <th className="py-3 px-4">Category</th>
              <th className="py-3 px-4">Price</th>
              <th className="py-3 px-4">Stock</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border text-foreground font-semibold">
            {loading ? (
              <tr>
                <td colSpan={5} className="py-12 text-center text-muted-foreground">
                  Loading catalog inventory...
                </td>
              </tr>
            ) : filteredProducts.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-12 text-center text-muted-foreground">
                  No matching archive pieces found.
                </td>
              </tr>
            ) : (
              filteredProducts.map((p) => (
                <tr key={p._id} className="hover:bg-card/50 transition-colors">
                  <td className="py-3 px-4 font-bold text-foreground">
                    <div className="flex items-center gap-3">
                      <img
                        src={p.image || "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800"}
                        alt={p.title}
                        className="w-9 h-11 object-cover border border-border shrink-0"
                      />
                      <span className="line-clamp-1">{p.title}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-muted-foreground">{p.category || "General"}</td>
                  <td className="py-3 px-4 font-black">${Number(p.price).toFixed(2)}</td>
                  <td className="py-3 px-4">{p.stock ?? 10}</td>
                  <td className="py-3 px-4 text-right space-x-2">
                    <button
                      onClick={() => handleOpenEdit(p)}
                      className="border-2 border-border px-3 py-1.5 hover:border-foreground hover:bg-foreground hover:text-background transition-colors text-[11px] font-black cursor-pointer"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(p)}
                      className="border-2 border-border px-3 py-1.5 hover:border-accent hover:bg-accent hover:text-white transition-colors text-[11px] font-black cursor-pointer text-accent"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Edit Modal */}
      {editingProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-card w-full max-w-lg border-2 border-foreground p-8 shadow-2xl">
            <div className="flex justify-between items-center mb-6 pb-3 border-b-2 border-border">
              <h3 className="font-black text-lg text-foreground uppercase tracking-tight">
                Edit Product
              </h3>
              <button
                onClick={() => setEditingProduct(null)}
                className="text-muted-foreground hover:text-foreground cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleUpdateProduct} className="space-y-4 text-xs font-bold uppercase tracking-wider">
              <div>
                <label className="block mb-1 text-foreground">Title *</label>
                <input
                  type="text"
                  required
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="w-full bg-background border-2 border-border px-3 py-2 text-xs font-semibold focus:outline-none focus:border-foreground text-foreground"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block mb-1 text-foreground">Price ($) *</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={editPrice}
                    onChange={(e) => setEditPrice(e.target.value)}
                    className="w-full bg-background border-2 border-border px-3 py-2 text-xs font-semibold focus:outline-none focus:border-foreground text-foreground"
                  />
                </div>
                <div>
                  <label className="block mb-1 text-foreground">Stock</label>
                  <input
                    type="number"
                    value={editStock}
                    onChange={(e) => setEditStock(e.target.value)}
                    className="w-full bg-background border-2 border-border px-3 py-2 text-xs font-semibold focus:outline-none focus:border-foreground text-foreground"
                  />
                </div>
              </div>

              <div>
                <label className="block mb-1 text-foreground">Category</label>
                <input
                  type="text"
                  value={editCategory}
                  onChange={(e) => setEditCategory(e.target.value)}
                  className="w-full bg-background border-2 border-border px-3 py-2 text-xs font-semibold focus:outline-none focus:border-foreground text-foreground"
                />
              </div>

              <div>
                <label className="block mb-1 text-foreground">Image URL</label>
                <input
                  type="text"
                  value={editImage}
                  onChange={(e) => setEditImage(e.target.value)}
                  className="w-full bg-background border-2 border-border px-3 py-2 text-xs font-semibold focus:outline-none focus:border-foreground text-foreground"
                />
              </div>

              <div>
                <label className="block mb-1 text-foreground">Description</label>
                <textarea
                  rows={3}
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  className="w-full bg-background border-2 border-border px-3 py-2 text-xs font-semibold focus:outline-none focus:border-foreground text-foreground resize-none"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-border">
                <button
                  type="button"
                  onClick={() => setEditingProduct(null)}
                  className="px-4 py-2 border-2 border-border text-foreground hover:border-foreground font-black text-xs uppercase"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-2 bg-foreground text-background font-black text-xs uppercase hover:bg-primary hover:text-primary-foreground disabled:opacity-50 cursor-pointer"
                >
                  {saving ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
