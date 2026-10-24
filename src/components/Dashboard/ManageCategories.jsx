import { useState, useEffect } from "react"
import { GetRequest, PostRequest, PutRequest, DeleteRequest } from "../../config/http"
import {
  Search,
  Plus,
  Edit3,
  Trash2,
  X,
  FolderKanban,
  Users,
  Layers,
  ShieldCheck,
  CheckCircle,
  AlertCircle,
} from "lucide-react"

export default function ManageCategories() {
  const [activeTab, setActiveTab] = useState("product") // 'product' | 'user'

  // Product Categories State
  const [productCategories, setProductCategories] = useState([])
  // User Categories State
  const [userCategories, setUserCategories] = useState([])

  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")

  // Form State for Create & Update
  const [formOpen, setFormOpen] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [currentId, setCurrentId] = useState(null)

  // Form Fields
  const [title, setTitle] = useState("")
  const [roleKey, setRoleKey] = useState("user")
  const [description, setDescription] = useState("")
  const [status, setStatus] = useState(true)

  const [submitting, setSubmitting] = useState(false)
  const [feedback, setFeedback] = useState({ type: "", message: "" })
  const [formError, setFormError] = useState("")
  const [confirmDelete, setConfirmDelete] = useState(null)

  const showFeedback = (type, message) => {
    setFeedback({ type, message })
    setTimeout(() => setFeedback({ type: "", message: "" }), 4000)
  }

  const loadAllData = async () => {
    try {
      setLoading(true)
      const [prodRes, userCatRes] = await Promise.all([
        GetRequest("category/getAll").catch(() => ({ data: [] })),
        GetRequest("user-category").catch(() => ({ data: [] })),
      ])
      setProductCategories(prodRes.data || [])
      setUserCategories(userCatRes.data || [])
    } catch (err) {
      console.error("Failed to load categories:", err)
      showFeedback("error", "Failed to retrieve categories from database.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadAllData()
  }, [])

  // Open Create Form
  const handleOpenCreate = () => {
    setIsEditing(false)
    setCurrentId(null)
    setTitle("")
    setRoleKey(activeTab === "user" ? "salesperson" : "user")
    setDescription("")
    setStatus(true)
    setFormError("")
    setFormOpen(true)
  }

  // Open Edit Form
  const handleOpenEdit = (category) => {
    setIsEditing(true)
    setCurrentId(category._id)
    setTitle(category.title || category.name || "")
    setRoleKey(category.roleKey || category.name || "user")
    setDescription(category.description || "")
    setStatus(category.status ?? true)
    setFormError("")
    setFormOpen(true)
  }

  // Close Form Modal
  const handleCloseForm = () => {
    setFormOpen(false)
    setIsEditing(false)
    setCurrentId(null)
    setFormError("")
  }

  // Submit Handler
  const handleSubmit = async (e) => {
    e.preventDefault()
    setFormError("")

    if (!title.trim()) {
      setFormError("Category title is required.")
      return
    }

    try {
      setSubmitting(true)

      if (activeTab === "product") {
        const payload = {
          title: title.trim(),
          description: description.trim(),
          status: Boolean(status),
        }

        if (isEditing) {
          const res = await PutRequest(`category/${currentId}`, payload)
          setProductCategories((prev) =>
            prev.map((c) => (c._id === currentId ? res.data : c))
          )
          showFeedback("success", `Updated product category "${payload.title}" successfully.`)
        } else {
          const res = await PostRequest("category/create", payload)
          setProductCategories((prev) => [res.data, ...prev])
          showFeedback("success", `Created new product category "${payload.title}".`)
        }
      } else {
        // User Category Tab
        const cleanRoleKey = roleKey.toLowerCase().trim() || title.toLowerCase().trim().replace(/\s+/g, "-")
        const payload = {
          name: cleanRoleKey,
          title: title.trim(),
          roleKey: cleanRoleKey,
          description: description.trim(),
          status: Boolean(status),
        }

        if (isEditing) {
          const res = await PutRequest(`user-category/${currentId}`, payload)
          setUserCategories((prev) =>
            prev.map((c) => (c._id === currentId ? res.data : c))
          )
          showFeedback("success", `Updated user category "${payload.title}" in database.`)
        } else {
          const res = await PostRequest("user-category/create", payload)
          setUserCategories((prev) => [res.data, ...prev])
          showFeedback("success", `Created new user category "${payload.title}" in database.`)
        }
      }

      handleCloseForm()
    } catch (err) {
      console.error(err)
      setFormError(
        err.response?.data?.message || (isEditing ? "Failed to update category." : "Failed to create category.")
      )
    } finally {
      setSubmitting(false)
    }
  }

  // Delete Handling
  const handleDelete = (category) => {
    setConfirmDelete(category)
  }

  const executeDelete = async (id, catTitle) => {
    try {
      if (activeTab === "product") {
        await DeleteRequest(`category/${id}`)
        setProductCategories((prev) => prev.filter((c) => c._id !== id))
        showFeedback("success", `Deleted product category "${catTitle}".`)
      } else {
        await DeleteRequest(`user-category/${id}`)
        setUserCategories((prev) => prev.filter((c) => c._id !== id))
        showFeedback("success", `Deleted user category "${catTitle}" from database.`)
      }
    } catch (err) {
      console.error(err)
      showFeedback("error", err.response?.data?.message || "Failed to delete category.")
    } finally {
      setConfirmDelete(null)
    }
  }

  const activeCategories = activeTab === "product" ? productCategories : userCategories

  const filteredCategories = activeCategories.filter((c) => {
    const q = searchQuery.toLowerCase()
    return (
      c.title?.toLowerCase().includes(q) ||
      c.name?.toLowerCase().includes(q) ||
      c.roleKey?.toLowerCase().includes(q) ||
      c.description?.toLowerCase().includes(q)
    )
  })

  return (
    <div className="max-w-6xl mx-auto space-y-8 font-sans">
      {/* Header Bar */}
      <div className="flex items-center justify-between border-b border-[#E5DFD5] pb-4">
        <h1 className="font-serif text-2xl font-bold uppercase tracking-tight text-[#1A1816]">
          Categories
        </h1>

        {/* Primary Action Button */}
        <button
          onClick={handleOpenCreate}
          className="bg-[#1A1816] text-[#FAF8F5] px-4 py-2 text-xs font-bold uppercase tracking-wider hover:bg-[#C5A059] hover:text-[#1A1816] transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs rounded-none"
        >
          <Plus size={14} />
          <span>
            {activeTab === "product" ? "Create Product Category" : "Create User Category"}
          </span>
        </button>
      </div>

      {/* Tab Switcher: Product Categories vs User Categories */}
      <div className="flex items-center gap-2 border-b border-[#E5DFD5] pb-1">
        <button
          onClick={() => {
            setActiveTab("product")
            setSearchQuery("")
          }}
          className={`px-4 py-2.5 text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-colors cursor-pointer border-b-2 ${
            activeTab === "product"
              ? "border-[#1A1816] text-[#1A1816] bg-[#F2EFE9]"
              : "border-transparent text-[#8E877E] hover:text-[#1A1816]"
          }`}
        >
          <Layers size={14} />
          <span>Product Categories ({productCategories.length})</span>
        </button>

        <button
          onClick={() => {
            setActiveTab("user")
            setSearchQuery("")
          }}
          className={`px-4 py-2.5 text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-colors cursor-pointer border-b-2 ${
            activeTab === "user"
              ? "border-[#1A1816] text-[#1A1816] bg-[#F2EFE9]"
              : "border-transparent text-[#8E877E] hover:text-[#1A1816]"
          }`}
        >
          <Users size={14} />
          <span>User Categories ({userCategories.length})</span>
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
            Are you sure you want to permanently delete category{" "}
            <strong>{confirmDelete.title || confirmDelete.name}</strong> from MongoDB?
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() =>
                executeDelete(confirmDelete._id, confirmDelete.title || confirmDelete.name)
              }
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
      <div className="bg-[#F2EFE9] border border-[#E5DFD5] p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8E877E]" />
          <input
            type="text"
            placeholder={
              activeTab === "product"
                ? "Search product categories..."
                : "Search user categories (Admin, Salesperson, Logistics, User)..."
            }
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#FAF8F5] border border-[#E5DFD5] pl-10 pr-4 py-2.5 text-xs font-semibold focus:outline-none focus:border-[#1A1816] text-[#1A1816] placeholder:text-[#8E877E]"
          />
        </div>

        <span className="text-[11px] font-bold uppercase tracking-wider text-[#8E877E]">
          {filteredCategories.length} of {activeCategories.length}{" "}
          {activeTab === "product" ? "Product Categories" : "User Categories"}
        </span>
      </div>

      {/* Categories Table */}
      {loading ? (
        <div className="py-24 text-center">
          <div className="w-8 h-8 border-2 border-[#1A1816] border-t-[#C5A059] rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-xs uppercase tracking-[0.2em] text-[#8E877E]">
            Loading MongoDB categories...
          </p>
        </div>
      ) : filteredCategories.length === 0 ? (
        <div className="py-16 text-center bg-[#F2EFE9] border border-[#E5DFD5] p-8">
          <FolderKanban size={32} className="mx-auto text-[#8E877E] mb-3" />
          <h3 className="font-serif text-lg font-bold uppercase tracking-wider text-[#1A1816] mb-1">
            No Categories Found
          </h3>
          <p className="text-xs text-[#6A645D] mb-5">
            {searchQuery
              ? "No categories match your search term."
              : "No categories recorded in database yet. Click 'Create' above to add one."}
          </p>
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="bg-[#1A1816] text-[#FAF8F5] px-4 py-2 text-xs font-bold uppercase tracking-wider cursor-pointer"
            >
              Clear Search
            </button>
          )}
        </div>
      ) : (
        <div className="bg-[#FAF8F5] border border-[#E5DFD5] overflow-x-auto shadow-xs">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#F2EFE9] border-b border-[#E5DFD5] text-[10px] font-bold uppercase tracking-[0.2em] text-[#8E877E]">
                <th className="py-3.5 px-4">
                  {activeTab === "product" ? "Department Name" : "User Category"}
                </th>
                {activeTab === "user" && <th className="py-3.5 px-4">Role Key</th>}
                <th className="py-3.5 px-4">Description & Scope</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5DFD5] text-xs">
              {filteredCategories.map((c) => (
                <tr key={c._id} className="hover:bg-[#F2EFE9]/50 transition-colors">
                  <td className="py-3.5 px-4 font-serif font-bold text-sm text-[#1A1816]">
                    <div className="flex items-center gap-2">
                      {activeTab === "user" && (
                        <span className="w-2 h-2 rounded-full bg-[#C5A059]" />
                      )}
                      <span>{c.title || c.name}</span>
                    </div>
                  </td>

                  {activeTab === "user" && (
                    <td className="py-3.5 px-4 font-mono text-[11px] font-semibold text-[#8B6E33]">
                      <span className="px-2 py-0.5 bg-[#C5A059]/15 border border-[#C5A059]/30 uppercase tracking-wider text-[10px]">
                        {c.roleKey || c.name}
                      </span>
                    </td>
                  )}

                  <td className="py-3.5 px-4 text-xs text-[#6A645D] max-w-md">
                    {c.description || "No specific brief recorded."}
                  </td>

                  <td className="py-3.5 px-4">
                    <span
                      className={`inline-block px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider ${
                        c.status !== false
                          ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                          : "bg-gray-100 text-gray-600 border border-gray-300"
                      }`}
                    >
                      {c.status !== false ? "Active" : "Archived"}
                    </span>
                  </td>

                  <td className="py-3.5 px-4 text-right">
                    <div className="inline-flex items-center gap-1.5">
                      <button
                        onClick={() => handleOpenEdit(c)}
                        className="p-2 bg-[#FAF8F5] border border-[#E5DFD5] hover:border-[#1A1816] hover:bg-[#1A1816] hover:text-[#FAF8F5] text-[#1A1816] transition-colors cursor-pointer"
                        title="Update Category"
                      >
                        <Edit3 size={13} />
                      </button>

                      <button
                        onClick={() => handleDelete(c)}
                        className="p-2 bg-[#FAF8F5] border border-[#E5DFD5] hover:border-[#78281F] hover:bg-[#78281F] hover:text-[#FAF8F5] text-[#78281F] transition-colors cursor-pointer"
                        title="Delete Category"
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
          <div className="bg-[#FAF8F5] border border-[#1A1816] w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl p-6 sm:p-8 relative font-sans">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-4 mb-6 border-b border-[#E5DFD5]">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-[#C5A059] block mb-1">
                  {activeTab === "product" ? "Product Catalog Taxonomy" : "User Category in MongoDB"}
                </span>
                <h2 className="font-serif text-2xl font-bold uppercase tracking-tight text-[#1A1816]">
                  {isEditing
                    ? `Update ${activeTab === "product" ? "Product Category" : "User Category"}`
                    : `Create ${activeTab === "product" ? "Product Category" : "User Category"}`}
                </h2>
              </div>

              <button
                onClick={handleCloseForm}
                className="p-1.5 border border-[#E5DFD5] hover:border-[#1A1816] text-[#1A1816] transition-colors cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            {/* In-Modal Form Error Banner */}
            {formError && (
              <div className="p-3 mb-4 bg-red-50 border border-red-200 text-red-800 text-xs font-normal">
                {formError}
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4 text-xs font-semibold uppercase tracking-wider">
              <div>
                <label className="block mb-1 text-[#1A1816]">
                  {activeTab === "product" ? "Category Name *" : "User Category Title *"}
                </label>
                <input
                  type="text"
                  required
                  placeholder={
                    activeTab === "product"
                      ? "e.g. Tailoring & Outerwear, Leather Shoes"
                      : "e.g. Admin, Salesperson, Logistics, User"
                  }
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-[#F2EFE9] border border-[#E5DFD5] px-3.5 py-2.5 text-xs font-semibold focus:outline-none focus:border-[#1A1816] text-[#1A1816]"
                />
              </div>

              {activeTab === "user" && (
                <div>
                  <label className="block mb-1 text-[#1A1816]">Role Key</label>
                  <select
                    value={roleKey}
                    onChange={(e) => setRoleKey(e.target.value)}
                    className="w-full bg-[#F2EFE9] border border-[#E5DFD5] px-3.5 py-2.5 text-xs font-semibold focus:outline-none focus:border-[#1A1816] text-[#1A1816]"
                  >
                    <option value="admin">admin (Full Governance)</option>
                    <option value="salesperson">salesperson (Invoices & Billing)</option>
                    <option value="logistics">logistics (Courier & Dispatch)</option>
                    <option value="user">user (Patron Client)</option>
                  </select>
                </div>
              )}

              <div>
                <label className="block mb-1 text-[#1A1816]">Description & Operational Scope</label>
                <textarea
                  rows={3}
                  placeholder={
                    activeTab === "product"
                      ? "Brief description of items in this department..."
                      : "Operational permissions and interface scope for this user category..."
                  }
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-[#F2EFE9] border border-[#E5DFD5] px-3.5 py-2.5 text-xs font-semibold focus:outline-none focus:border-[#1A1816] text-[#1A1816] resize-none"
                />
              </div>

              <div>
                <label className="flex items-center gap-2.5 cursor-pointer pt-1">
                  <input
                    type="checkbox"
                    checked={status}
                    onChange={(e) => setStatus(e.target.checked)}
                    className="w-4 h-4 accent-[#1A1816]"
                  />
                  <span className="text-[#1A1816]">
                    {activeTab === "product" ? "Active in store navigation" : "Active user category"}
                  </span>
                </label>
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
                    ? "Update Category"
                    : "Create Category"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
