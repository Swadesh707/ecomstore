import { useState, useEffect } from "react"
import { GetRequest, PutRequest, DeleteRequest } from "../../config/http"
import { Search, X } from "lucide-react"

export default function UpdateCategory() {
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")

  const [editingCategory, setEditingCategory] = useState(null)
  const [editTitle, setEditTitle] = useState("")
  const [editDescription, setEditDescription] = useState("")
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState("")
  const [confirmDelete, setConfirmDelete] = useState(null)

  const fetchCategories = async () => {
    try {
      setLoading(true)
      const res = await GetRequest("category/getAll")
      setCategories(res.data)
    } catch (err) {
      console.error(err)
      setMessage("Failed to load categories.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCategories()
  }, [])

  const handleOpenEdit = (category) => {
    setEditingCategory(category)
    setEditTitle(category.title || "")
    setEditDescription(category.description || "")
    setMessage("")
  }

  const handleUpdateCategory = async (e) => {
    e.preventDefault()
    setMessage("")
    if (!editTitle.trim()) {
      setMessage("Category name is required.")
      return
    }

    try {
      setSaving(true)
      const res = await PutRequest(`category/${editingCategory._id}`, {
        title: editTitle.trim(),
        description: editDescription.trim(),
      })

      setCategories((prev) =>
        prev.map((c) => (c._id === editingCategory._id ? res.data : c))
      )

      setMessage("Category updated successfully!")
      setEditingCategory(null)
    } catch (err) {
      console.error(err)
      setMessage(err.response?.data?.message || "Failed to update category.")
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = (category) => {
    setConfirmDelete(category)
  }

  const executeDelete = async (id) => {
    try {
      await DeleteRequest(`category/${id}`)
      setCategories((prev) => prev.filter((c) => c._id !== id))
      setMessage("Category deleted successfully!")
    } catch (err) {
      console.error(err)
      setMessage("Failed to delete category.")
    } finally {
      setConfirmDelete(null)
    }
  }

  const filteredCategories = categories.filter((c) =>
    c.title?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="max-w-4xl bg-card border-2 border-border p-8 font-sans shadow-xl">
      <div className="mb-6 pb-4 border-b border-border">
        <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground block mb-1">
          Taxonomy Structure
        </span>
        <h2 className="text-2xl font-black text-foreground tracking-tight uppercase">
          Category Directory
        </h2>
      </div>

      {message && (
        <div className="mb-6 p-3 bg-[#F2EFE9] border border-[#1A1816] text-[#1A1816] text-xs font-normal">
          {message}
        </div>
      )}

      {confirmDelete && (
        <div className="mb-6 p-3.5 bg-[#F2EFE9] border border-[#1A1816] text-[#1A1816] text-xs font-normal flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <span>Are you sure you want to delete category <strong>{confirmDelete.title}</strong>?</span>
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

      <div className="mb-6 max-w-sm relative">
        <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <input
          type="text"
          placeholder="Filter categories..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-background border-2 border-border pl-10 pr-4 py-2.5 text-xs font-semibold focus:outline-none focus:border-foreground text-foreground uppercase tracking-wider"
        />
      </div>

      <div className="border-2 border-border overflow-x-auto bg-background">
        <table className="w-full text-left text-xs uppercase tracking-wider">
          <thead className="bg-card border-b-2 border-border text-foreground font-black">
            <tr>
              <th className="py-3 px-4">Title</th>
              <th className="py-3 px-4">Description</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border text-foreground font-semibold">
            {loading ? (
              <tr>
                <td colSpan={3} className="py-12 text-center text-muted-foreground">
                  Loading categories...
                </td>
              </tr>
            ) : filteredCategories.length === 0 ? (
              <tr>
                <td colSpan={3} className="py-12 text-center text-muted-foreground">
                  No categories found.
                </td>
              </tr>
            ) : (
              filteredCategories.map((c) => (
                <tr key={c._id} className="hover:bg-card/50 transition-colors">
                  <td className="py-3 px-4 font-black text-foreground">{c.title}</td>
                  <td className="py-3 px-4 text-muted-foreground">{c.description || "-"}</td>
                  <td className="py-3 px-4 text-right space-x-2">
                    <button
                      onClick={() => handleOpenEdit(c)}
                      className="border-2 border-border px-3 py-1.5 hover:border-foreground hover:bg-foreground hover:text-background transition-colors text-[11px] font-black cursor-pointer"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(c)}
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

      {editingCategory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-card w-full max-w-md border-2 border-foreground p-8 shadow-2xl">
            <div className="flex justify-between items-center mb-6 pb-3 border-b-2 border-border">
              <h3 className="font-black text-lg text-foreground uppercase tracking-tight">
                Edit Category
              </h3>
              <button
                onClick={() => setEditingCategory(null)}
                className="text-muted-foreground hover:text-foreground cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleUpdateCategory} className="space-y-4 text-xs font-bold uppercase tracking-wider">
              <div>
                <label className="block mb-1.5 text-foreground">Category Name *</label>
                <input
                  type="text"
                  required
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="w-full bg-background border-2 border-border px-4 py-3 text-xs font-semibold focus:outline-none focus:border-foreground text-foreground"
                />
              </div>

              <div>
                <label className="block mb-1.5 text-foreground">Description</label>
                <textarea
                  rows={3}
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  className="w-full bg-background border-2 border-border px-4 py-3 text-xs font-semibold focus:outline-none focus:border-foreground text-foreground resize-none"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-border">
                <button
                  type="button"
                  onClick={() => setEditingCategory(null)}
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
