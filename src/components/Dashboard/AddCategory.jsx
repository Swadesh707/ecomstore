import { useState } from "react"
import { PostRequest } from "../../config/http"

export default function AddCategory({ onCategoryAdded }) {
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState("")
  const [error, setError] = useState("")

  const handleCreateCategory = async (e) => {
    e.preventDefault()
    setSuccess("")
    setError("")
    if (!title.trim()) {
      setError("Category name is required.")
      return
    }

    try {
      setSubmitting(true)
      await PostRequest("category/create", {
        title: title.trim(),
        description: description.trim(),
        status: true,
      })

      setSuccess("Category created successfully in archive!")
      setTitle("")
      setDescription("")
      if (onCategoryAdded) onCategoryAdded()
    } catch (err) {
      console.error(err)
      setError(err.response?.data?.message || "Failed to create category.")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="max-w-2xl bg-card border-2 border-border p-8 shadow-xl font-sans">
      <div className="mb-6 pb-4 border-b border-border">
        <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground block mb-1">
          Taxonomy Addition
        </span>
        <h2 className="text-2xl font-black text-foreground tracking-tight uppercase">
          Add Category
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

      <form onSubmit={handleCreateCategory} className="space-y-5 text-xs font-bold uppercase tracking-wider">
        <div>
          <label className="block mb-1.5 text-foreground">Category Name *</label>
          <input
            type="text"
            required
            placeholder="e.g. Outerwear, Leather, Knitwear"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full bg-background border-2 border-border px-4 py-3 text-xs font-semibold focus:outline-none focus:border-foreground text-foreground"
          />
        </div>

        <div>
          <label className="block mb-1.5 text-foreground">Description (Optional)</label>
          <textarea
            rows={3}
            placeholder="Category brief and archival details..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full bg-background border-2 border-border px-4 py-3 text-xs font-semibold focus:outline-none focus:border-foreground text-foreground resize-none"
          />
        </div>

        <div className="pt-2">
          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-foreground text-background py-4 font-black uppercase tracking-widest text-xs hover:bg-primary hover:text-primary-foreground transition-colors disabled:opacity-50 cursor-pointer shadow-lg"
          >
            {submitting ? "Saving..." : "Add Category to Store"}
          </button>
        </div>
      </form>
    </div>
  )
}
