import { useState, useEffect } from "react"
import { GetRequest, PostRequest, PutRequest, DeleteRequest, UploadRequest } from "../../config/http"
import {
  Search,
  Plus,
  Edit3,
  Trash2,
  X,
  Package,
  CheckCircle,
  AlertCircle,
  ArrowUpDown,
  Upload,
  Image as ImageIcon,
} from "lucide-react"

export default function ManageProducts() {
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("All")

  // Modal / Form state for Create & Update
  const [formOpen, setFormOpen] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [currentId, setCurrentId] = useState(null)

  // Form Fields
  const [title, setTitle] = useState("")
  const [price, setPrice] = useState("")
  const [category, setCategory] = useState("")
  const [stock, setStock] = useState(15)
  const [image, setImage] = useState("")
  const [description, setDescription] = useState("")
  const [uploadingImage, setUploadingImage] = useState(false)
  const [imageMode, setImageMode] = useState("device")

  const [submitting, setSubmitting] = useState(false)
  const [feedback, setFeedback] = useState({ type: "", message: "" })
  const [confirmDelete, setConfirmDelete] = useState(null)
  const [formError, setFormError] = useState("")

  const handleDeviceImageUpload = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    const previewUrl = URL.createObjectURL(file)
    setImage(previewUrl)

    try {
      setUploadingImage(true)
      const formData = new FormData()
      formData.append("image", file)

      const res = await UploadRequest("upload", formData)
      if (res.data?.url) {
        setImage(res.data.url)
      }
    } catch (err) {
      console.error("Device upload fallback to base64:", err)
      const reader = new FileReader()
      reader.onloadend = () => {
        if (reader.result) {
          setImage(reader.result)
        }
      }
      reader.readAsDataURL(file)
    } finally {
      setUploadingImage(false)
    }
  }

  const loadData = async () => {
    try {
      setLoading(true)
      const [prodRes, catRes] = await Promise.all([
        GetRequest("products").catch(() => ({ data: [] })),
        GetRequest("category/getAll").catch(() => ({ data: [] })),
      ])

      setProducts(prodRes.data || [])
      const dbCats = (catRes.data || []).map((c) => c.title)
      const existingProductCats = (prodRes.data || []).map((p) => p.category).filter(Boolean)
      const mergedCats = [...new Set([...dbCats, ...existingProductCats])]
      setCategories(mergedCats)
      if (mergedCats.length > 0 && !category) {
        setCategory(mergedCats[0])
      }
    } catch (err) {
      console.error("Failed to load products or categories:", err)
      showFeedback("error", "Failed to retrieve catalog data from database.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const showFeedback = (type, message) => {
    setFeedback({ type, message })
    setTimeout(() => setFeedback({ type: "", message: "" }), 4000)
  }

  // Open Create Mode
  const handleOpenCreate = () => {
    setIsEditing(false)
    setCurrentId(null)
    setFormError("")
    setTitle("")
    setPrice("")
    setCategory(categories[0] || "Tailoring & Outerwear")
    setStock(15)
    setImage("")
    setDescription("")
    setFormOpen(true)
  }

  // Open Edit Mode
  const handleOpenEdit = (product) => {
    setIsEditing(true)
    setCurrentId(product._id)
    setFormError("")
    setTitle(product.title || "")
    setPrice(product.price ?? "")
    setCategory(product.category || (categories[0] || "General"))
    setStock(product.stock ?? 10)
    setImage(product.image || "")
    setDescription(product.description || "")
    setFormOpen(true)
  }

  // Close Form Modal
  const handleCloseForm = () => {
    setFormOpen(false)
    setIsEditing(false)
    setCurrentId(null)
    setFormError("")
  }

  // Handle Submit (Unified for both Create and Update)
  const handleSubmit = async (e) => {
    e.preventDefault()
    setFormError("")

    if (!title.trim() || price === "") {
      setFormError("Title and price are required.")
      return
    }

    try {
      setSubmitting(true)
      const payload = {
        title: title.trim(),
        price: Number(price),
        category: category || "General",
        stock: Number(stock) || 0,
        image: image.trim() || "https://images.unsplash.com/photo-1544441893-675973e31985?w=800",
        description: description.trim(),
      }

      if (isEditing) {
        // UPDATE existing product
        const res = await PutRequest(`products/${currentId}`, payload)
        setProducts((prev) =>
          prev.map((item) => (item._id === currentId ? res.data : item))
        )
        showFeedback("success", `Updated "${payload.title}" successfully.`)
      } else {
        // CREATE new product
        const res = await PostRequest("products", payload)
        setProducts((prev) => [res.data, ...prev])
        showFeedback("success", `Created "${payload.title}" in archive catalog.`)
      }

      handleCloseForm()
    } catch (err) {
      console.error(err)
      setFormError(
        err.response?.data?.message || (isEditing ? "Failed to update product." : "Failed to create product.")
      )
    } finally {
      setSubmitting(false)
    }
  }

  // In-Page Delete Handling (no window.confirm)
  const handleDelete = (product) => {
    setConfirmDelete(product)
  }

  const executeDelete = async (id, productTitle) => {
    try {
      await DeleteRequest(`products/${id}`)
      setProducts((prev) => prev.filter((p) => p._id !== id))
      showFeedback("success", `Removed "${productTitle}" from catalog.`)
    } catch (err) {
      console.error(err)
      showFeedback("error", err.response?.data?.message || "Failed to delete product.")
    } finally {
      setConfirmDelete(null)
    }
  }

  // Filtered list
  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      p.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.description?.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory =
      selectedCategory === "All" || p.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  return (
    <div className="max-w-7xl mx-auto space-y-8 font-sans">
      {/* Header Bar */}
      <div className="flex items-center justify-between border-b border-[#E5DFD5] pb-4">
        <h1 className="font-serif text-2xl font-bold uppercase tracking-tight text-[#1A1816]">
          Products
        </h1>

        {/* Primary Action Button */}
        <button
          onClick={handleOpenCreate}
          className="bg-[#1A1816] text-[#FAF8F5] px-4 py-2 text-xs font-bold uppercase tracking-wider hover:bg-[#C5A059] hover:text-[#1A1816] transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs rounded-none"
        >
          <Plus size={14} />
          <span>Create Product</span>
        </button>
      </div>

      {/* Global In-Page Feedback Banner */}
      {feedback.message && (
        <div
          className={`p-3 border text-xs font-normal flex items-center justify-between ${
            feedback.type === "success"
              ? "bg-[#F2EFE9] border-[#1A1816] text-[#1A1816]"
              : "bg-red-50 border-red-300 text-red-800"
          }`}
        >
          <span>{feedback.message}</span>
          <button
            onClick={() => setFeedback({ type: "", message: "" })}
            className="text-xs text-[#6A645D] hover:text-[#1A1816] cursor-pointer ml-3"
          >
            ✕
          </button>
        </div>
      )}

      {/* In-Page Confirmation for Deletion */}
      {confirmDelete && (
        <div className="p-3.5 bg-[#F2EFE9] border border-[#1A1816] text-[#1A1816] text-xs font-normal flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <span>
            Are you sure you want to permanently delete <strong>{confirmDelete.title}</strong> from the store?
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => executeDelete(confirmDelete._id, confirmDelete.title)}
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
      <div className="bg-[#F2EFE9] border border-[#E5DFD5] p-4 flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Search */}
        <div className="relative w-full md:w-80">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8E877E]" />
          <input
            type="text"
            placeholder="Search products by title..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#FAF8F5] border border-[#E5DFD5] pl-10 pr-4 py-2.5 text-xs font-semibold focus:outline-none focus:border-[#1A1816] text-[#1A1816] placeholder:text-[#8E877E]"
          />
        </div>

        {/* Category Filter & Counter */}
        <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-end">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="bg-[#FAF8F5] border border-[#E5DFD5] px-3.5 py-2.5 text-xs font-semibold text-[#1A1816] focus:outline-none focus:border-[#1A1816] uppercase tracking-wider cursor-pointer"
          >
            <option value="All">All Categories</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>

          <span className="text-[11px] font-bold uppercase tracking-wider text-[#8E877E] whitespace-nowrap">
            {filteredProducts.length} of {products.length} Pieces
          </span>
        </div>
      </div>

      {/* Products Table */}
      {loading ? (
        <div className="py-24 text-center">
          <div className="w-8 h-8 border-2 border-[#1A1816] border-t-[#C5A059] rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-xs uppercase tracking-[0.2em] text-[#8E877E]">Loading inventory...</p>
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="py-16 text-center bg-[#F2EFE9] border border-[#E5DFD5] p-8">
          <Package size={32} className="mx-auto text-[#8E877E] mb-3" />
          <h3 className="font-serif text-lg font-bold uppercase tracking-wider text-[#1A1816] mb-1">
            No Products Found
          </h3>
          <p className="text-xs text-[#6A645D] mb-5">
            {searchQuery || selectedCategory !== "All"
              ? "No items match your search filter criteria."
              : "Catalog is currently empty. Click 'Create New Product' above to add items."}
          </p>
          {(searchQuery || selectedCategory !== "All") && (
            <button
              onClick={() => {
                setSearchQuery("")
                setSelectedCategory("All")
              }}
              className="bg-[#1A1816] text-[#FAF8F5] px-4 py-2 text-xs font-bold uppercase tracking-wider cursor-pointer"
            >
              Reset Filters
            </button>
          )}
        </div>
      ) : (
        <div className="bg-[#FAF8F5] border border-[#E5DFD5] overflow-x-auto shadow-xs">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#F2EFE9] border-b border-[#E5DFD5] text-[10px] font-bold uppercase tracking-[0.2em] text-[#8E877E]">
                <th className="py-3.5 px-4">Item</th>
                <th className="py-3.5 px-4">Category</th>
                <th className="py-3.5 px-4">Price</th>
                <th className="py-3.5 px-4">Stock</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5DFD5] text-xs">
              {filteredProducts.map((item) => (
                <tr key={item._id} className="hover:bg-[#F2EFE9]/50 transition-colors">
                  {/* Item Image + Title */}
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-14 bg-[#F2EFE9] border border-[#E5DFD5] overflow-hidden shrink-0">
                        <img
                          src={item.image || "https://images.unsplash.com/photo-1544441893-675973e31985?w=800"}
                          alt={item.title}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.currentTarget.onerror = null
                            e.currentTarget.src = "https://images.unsplash.com/photo-1544441893-675973e31985?w=800"
                          }}
                        />
                      </div>
                      <div>
                        <span className="font-serif font-bold text-sm text-[#1A1816] block line-clamp-1">
                          {item.title}
                        </span>
                        <span className="text-[10px] text-[#8E877E] line-clamp-1 max-w-xs font-normal">
                          {item.description || "No archival notes provided"}
                        </span>
                      </div>
                    </div>
                  </td>

                  {/* Category */}
                  <td className="py-3.5 px-4">
                    <span className="inline-block bg-[#F2EFE9] border border-[#E5DFD5] text-[#1A1816] px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider">
                      {item.category || "General"}
                    </span>
                  </td>

                  {/* Price */}
                  <td className="py-3.5 px-4 font-serif font-bold text-sm text-[#1A1816]">
                    ${Number(item.price).toFixed(2)}
                  </td>

                  {/* Stock */}
                  <td className="py-3.5 px-4">
                    <span
                      className={`text-[10px] font-bold uppercase tracking-wider ${
                        Number(item.stock) > 0 ? "text-[#1A1816]" : "text-[#78281F]"
                      }`}
                    >
                      {Number(item.stock) > 0 ? `${item.stock} in stock` : "Sold Out"}
                    </span>
                  </td>

                  {/* Actions: Edit & Delete right in this same view */}
                  <td className="py-3.5 px-4 text-right">
                    <div className="inline-flex items-center gap-1.5">
                      <button
                        onClick={() => handleOpenEdit(item)}
                        className="p-2 bg-[#FAF8F5] border border-[#E5DFD5] hover:border-[#1A1816] hover:bg-[#1A1816] hover:text-[#FAF8F5] text-[#1A1816] transition-colors cursor-pointer"
                        title="Update Product"
                      >
                        <Edit3 size={13} />
                      </button>

                      <button
                        onClick={() => handleDelete(item)}
                        className="p-2 bg-[#FAF8F5] border border-[#E5DFD5] hover:border-[#78281F] hover:bg-[#78281F] hover:text-[#FAF8F5] text-[#78281F] transition-colors cursor-pointer"
                        title="Delete Product"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* UNIFIED MODAL FOR CREATE & UPDATE */}
      {formOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-[#FAF8F5] border border-[#1A1816] w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl p-6 sm:p-8 relative font-sans">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-4 mb-6 border-b border-[#E5DFD5]">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-[#C5A059] block mb-1">
                  {isEditing ? "Modify Existing Piece" : "Catalog Insertion"}
                </span>
                <h2 className="font-serif text-2xl font-bold uppercase tracking-tight text-[#1A1816]">
                  {isEditing ? "Update Product" : "Create Product"}
                </h2>
              </div>

              <button
                onClick={handleCloseForm}
                className="p-1.5 border border-[#E5DFD5] hover:border-[#1A1816] text-[#1A1816] transition-colors cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            {/* In-Modal Form Error Display */}
            {formError && (
              <div className="p-3 bg-red-50 border border-red-300 text-red-800 text-xs font-normal mb-4">
                {formError}
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4 text-xs font-semibold uppercase tracking-wider">
              {/* Title */}
              <div>
                <label className="block mb-1 text-[#1A1816]">Product Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Bespoke Double-Breasted Cashmere Overcoat"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-[#F2EFE9] border border-[#E5DFD5] px-3.5 py-2.5 text-xs font-semibold focus:outline-none focus:border-[#1A1816] text-[#1A1816]"
                />
              </div>

              {/* Price & Stock */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block mb-1 text-[#1A1816]">Price (USD $) *</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    placeholder="850.00"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    className="w-full bg-[#F2EFE9] border border-[#E5DFD5] px-3.5 py-2.5 text-xs font-semibold focus:outline-none focus:border-[#1A1816] text-[#1A1816]"
                  />
                </div>

                <div>
                  <label className="block mb-1 text-[#1A1816]">Inventory Stock</label>
                  <input
                    type="number"
                    min="0"
                    placeholder="15"
                    value={stock}
                    onChange={(e) => setStock(e.target.value)}
                    className="w-full bg-[#F2EFE9] border border-[#E5DFD5] px-3.5 py-2.5 text-xs font-semibold focus:outline-none focus:border-[#1A1816] text-[#1A1816]"
                  />
                </div>
              </div>

              {/* Category */}
              <div>
                <label className="block mb-1 text-[#1A1816]">Wardrobe Category *</label>
                <div className="flex gap-2">
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full bg-[#F2EFE9] border border-[#E5DFD5] px-3.5 py-2.5 text-xs font-semibold focus:outline-none focus:border-[#1A1816] text-[#1A1816] uppercase"
                  >
                    {categories.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Product Image Section (From Device or Web URL) */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-[#1A1816]">Product Image</label>
                  <div className="flex items-center gap-2 text-[10px] font-normal normal-case">
                    <button
                      type="button"
                      onClick={() => setImageMode("device")}
                      className={`px-2 py-0.5 border cursor-pointer ${
                        imageMode === "device"
                          ? "bg-[#1A1816] text-[#FAF8F5] border-[#1A1816]"
                          : "bg-[#FAF8F5] text-[#6A645D] border-[#E5DFD5]"
                      }`}
                    >
                      From Device
                    </button>
                    <button
                      type="button"
                      onClick={() => setImageMode("url")}
                      className={`px-2 py-0.5 border cursor-pointer ${
                        imageMode === "url"
                          ? "bg-[#1A1816] text-[#FAF8F5] border-[#1A1816]"
                          : "bg-[#FAF8F5] text-[#6A645D] border-[#E5DFD5]"
                      }`}
                    >
                      Web URL
                    </button>
                  </div>
                </div>

                {imageMode === "device" ? (
                  <label className="border-2 border-dashed border-[#E5DFD5] hover:border-[#1A1816] bg-[#F2EFE9] p-4 flex flex-col items-center justify-center cursor-pointer transition-colors text-center block">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleDeviceImageUpload}
                      className="hidden"
                    />
                    <Upload size={18} className="text-[#8E877E] mb-1.5" />
                    <span className="text-xs font-semibold text-[#1A1816]">
                      {uploadingImage ? "Uploading from device..." : "Choose image from device"}
                    </span>
                    <span className="text-[10px] text-[#8E877E] normal-case mt-0.5">
                      PNG, JPG, WEBP, GIF up to 10MB
                    </span>
                  </label>
                ) : (
                  <input
                    type="url"
                    placeholder="https://images.unsplash.com/photo-..."
                    value={image}
                    onChange={(e) => setImage(e.target.value)}
                    className="w-full bg-[#F2EFE9] border border-[#E5DFD5] px-3.5 py-2.5 text-xs font-semibold focus:outline-none focus:border-[#1A1816] text-[#1A1816]"
                  />
                )}

                {/* Live Image Preview */}
                {image && (
                  <div className="p-2.5 bg-[#F2EFE9] border border-[#E5DFD5] flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 overflow-hidden">
                      <img
                        src={image}
                        alt="Product preview"
                        className="w-12 h-14 object-cover border border-[#E5DFD5] bg-[#FAF8F5] shrink-0"
                      />
                      <div className="text-[11px] normal-case text-[#6A645D] truncate">
                        <span className="font-semibold text-[#1A1816] block">Selected Image Preview</span>
                        <span className="truncate block max-w-xs text-[10px] text-[#8E877E]">
                          {image.startsWith("data:") ? "Local Device File" : image}
                        </span>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setImage("")}
                      className="text-xs text-[#78281F] hover:underline cursor-pointer shrink-0 normal-case"
                    >
                      Remove
                    </button>
                  </div>
                )}
              </div>

              {/* Description */}
              <div>
                <label className="block mb-1 text-[#1A1816]">Archival Description</label>
                <textarea
                  rows={3}
                  placeholder="Bespoke cut, fabric lineage, and hand-tailored details..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-[#F2EFE9] border border-[#E5DFD5] px-3.5 py-2.5 text-xs font-semibold focus:outline-none focus:border-[#1A1816] text-[#1A1816] resize-none"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#E5DFD5]">
                <button
                  type="button"
                  onClick={handleCloseForm}
                  className="px-5 py-2.5 border border-[#E5DFD5] hover:border-[#1A1816] text-[#1A1816] text-xs font-bold uppercase tracking-wider cursor-pointer"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={submitting}
                  className="bg-[#1A1816] text-[#FAF8F5] px-6 py-2.5 text-xs font-bold uppercase tracking-wider hover:bg-[#C5A059] hover:text-[#1A1816] transition-colors disabled:opacity-50 cursor-pointer shadow-xs"
                >
                  {submitting
                    ? "Saving..."
                    : isEditing
                    ? "Update Product in Catalog"
                    : "Create Product"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
