import { useState, useEffect, useMemo } from "react"
import { GetRequest, PostRequest, PutRequest, DeleteRequest } from "../../config/http"
import {
  Search,
  UserPlus,
  Trash2,
  X,
} from "lucide-react"

export default function ManageStaff() {
  const [users, setUsers] = useState([])
  const [userCategories, setUserCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [roleFilter, setRoleFilter] = useState("All")
  const [updatingId, setUpdatingId] = useState(null)
  const [feedback, setFeedback] = useState({ type: "", message: "" })
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [creating, setCreating] = useState(false)

  const currentEmail = localStorage.getItem("email") || ""

  const [newUser, setNewUser] = useState({
    fullName: "",
    email: "",
    password: "",
    role: "salesperson",
    phone: "",
  })

  // Load User Categories from MongoDB
  const loadUserCategories = async () => {
    try {
      const res = await GetRequest("user-category")
      if (Array.isArray(res.data) && res.data.length > 0) {
        setUserCategories(res.data)
      }
    } catch (err) {
      console.error("Failed to load user categories from database:", err)
    }
  }

  // GET request to fetch users from MongoDB
  const loadUsers = async () => {
    try {
      setLoading(true)
      const res = await GetRequest("user/all")
      setUsers(res.data || [])
    } catch (err) {
      console.error("Failed to load users:", err)
      showFeedback("error", "Failed to retrieve user accounts from database.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadUserCategories()
    loadUsers()
  }, [])

  // Reactive Instant Filtration
  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      // 1. Role Filter
      if (roleFilter && roleFilter.toLowerCase() !== "all") {
        const target = roleFilter.toLowerCase().trim()
        const uRole = (u.role || "").toLowerCase().trim()
        const uCat = (u.userCategory || "").toLowerCase().trim()

        if (target === "admin") {
          const match = uRole === "admin" || uCat.includes("admin")
          if (!match) return false
        } else if (target === "salesperson") {
          const match = uRole === "salesperson" || uCat.includes("sales")
          if (!match) return false
        } else if (target === "logistics") {
          const match = uRole === "logistics" || uCat.includes("logistics")
          if (!match) return false
        } else if (target === "user") {
          const isAdmin = uRole === "admin" || uCat.includes("admin")
          const isStaff = uRole === "salesperson" || uRole === "logistics" || uCat.includes("sales") || uCat.includes("logistics")
          if (isAdmin || isStaff) return false
          const match = uRole === "user" || uRole === "consumer" || uCat === "user" || (!uRole && !uCat)
          if (!match) return false
        } else {
          if (uRole !== target && !uCat.includes(target)) return false
        }
      }

      // 2. Search Filter
      if (searchQuery && searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim()
        const matches =
          u.fullName?.toLowerCase().includes(q) ||
          u.email?.toLowerCase().includes(q) ||
          u.role?.toLowerCase().includes(q) ||
          u.userCategory?.toLowerCase().includes(q)
        if (!matches) return false
      }

      return true
    })
  }, [users, roleFilter, searchQuery])

  const showFeedback = (type, message) => {
    setFeedback({ type, message })
    setTimeout(() => setFeedback({ type: "", message: "" }), 4000)
  }

  const handleRoleChange = async (userId, newRole) => {
    try {
      setUpdatingId(userId)
      const res = await PutRequest(`user/${userId}/role`, { role: newRole })
      setUsers((prev) => prev.map((u) => (u._id === userId ? { ...u, role: res.data.role, userCategory: res.data.userCategory } : u)))

      const currentUserId = localStorage.getItem("id") || localStorage.getItem("userId")
      if (currentUserId === userId) {
        localStorage.setItem("role", newRole)
      }

      showFeedback("success", `User category updated to ${newRole}.`)
    } catch (err) {
      console.error("Failed to update user role:", err)
      showFeedback("error", err.response?.data?.message || "Failed to update user.")
    } finally {
      setUpdatingId(null)
    }
  }

  const handleStatusChange = async (userId, currentStatus) => {
    try {
      setUpdatingId(userId)
      const newStatus = currentStatus === "Active" ? "Suspended" : "Active"
      const res = await PutRequest(`user/${userId}/role`, { status: newStatus })
      setUsers((prev) => prev.map((u) => (u._id === userId ? { ...u, status: res.data.status } : u)))
      showFeedback("success", `Account status changed to ${newStatus}.`)
    } catch (err) {
      console.error("Failed to update status:", err)
      showFeedback("error", "Failed to update account status.")
    } finally {
      setUpdatingId(null)
    }
  }

  const handleDeleteUser = async (userId, email) => {
    if (!window.confirm(`Permanently remove account for ${email}?`)) return
    try {
      setUpdatingId(userId)
      await DeleteRequest(`user/${userId}`)
      setUsers((prev) => prev.filter((u) => u._id !== userId))
      showFeedback("success", `Account for ${email} has been removed.`)
    } catch (err) {
      console.error("Failed to delete user:", err)
      showFeedback("error", "Failed to delete user account.")
    } finally {
      setUpdatingId(null)
    }
  }

  const handleCreateStaff = async (e) => {
    e.preventDefault()
    if (!newUser.fullName.trim() || !newUser.email.trim() || !newUser.password.trim()) {
      showFeedback("error", "Full name, email, and password are required.")
      return
    }

    try {
      setCreating(true)
      const res = await PostRequest("user/create-staff", newUser)
      showFeedback("success", res.data?.message || "Account successfully created.")
      setIsModalOpen(false)
      setNewUser({
        fullName: "",
        email: "",
        password: "",
        role: "salesperson",
        phone: "",
      })
      loadUsers()
    } catch (err) {
      console.error("Failed to create user account:", err)
      showFeedback("error", err.response?.data?.message || "Failed to provision new account.")
    } finally {
      setCreating(false)
    }
  }

  const categoriesFromDB = userCategories.length > 0 ? userCategories : [
    { name: "admin", title: "Admin" },
    { name: "salesperson", title: "Salesperson" },
    { name: "logistics", title: "Logistics" },
    { name: "user", title: "User" },
  ]

  return (
    <div className="space-y-6 font-sans">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[#E5DFD5] pb-4">
        <h1 className="font-serif text-2xl font-bold uppercase tracking-tight text-[#1A1816]">
          Team
        </h1>

        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-[#1A1816] text-[#FAF8F5] hover:bg-[#C5A059] hover:text-[#1A1816] px-4 py-2 text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer shadow-xs flex items-center gap-1.5"
          title="Register New User"
        >
          <UserPlus size={14} />
          <span>Add Member</span>
        </button>
      </div>

      {/* Feedback Toast */}
      {feedback.message && (
        <div
          className={`p-4 border text-xs font-semibold uppercase tracking-wider ${
            feedback.type === "error"
              ? "bg-[#78281F]/10 border-[#78281F] text-[#78281F]"
              : "bg-[#1C352D]/10 border-[#1C352D] text-[#1C352D]"
          }`}
        >
          {feedback.message}
        </div>
      )}

      {/* Search & Filter Toolbar */}
      <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8E877E]" />
          <input
            type="text"
            placeholder="FILTER BY NAME OR EMAIL..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-[#E5DFD5] text-xs uppercase tracking-wider placeholder:text-[#8E877E] text-[#1A1816] focus:outline-none focus:border-[#1A1816]"
          />
        </div>

        {/* Dynamic Category Filters from Database */}
        <div className="flex flex-wrap items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider">
          <button
            onClick={() => setRoleFilter("All")}
            className={`px-3 py-2 border transition-colors cursor-pointer ${
              roleFilter.toLowerCase() === "all"
                ? "bg-[#1A1816] text-[#FAF8F5] border-[#1A1816]"
                : "bg-white text-[#8E877E] border-[#E5DFD5] hover:border-[#1A1816] hover:text-[#1A1816]"
            }`}
          >
            All ({users.length})
          </button>
          {categoriesFromDB.map((r) => {
            const count = users.filter((u) => {
              const uRole = (u.role || "").toLowerCase().trim()
              const uCat = (u.userCategory || "").toLowerCase().trim()
              const target = r.name.toLowerCase().trim()
              if (target === "admin") return uRole === "admin" || uCat.includes("admin")
              if (target === "salesperson") return uRole === "salesperson" || uCat.includes("sales")
              if (target === "logistics") return uRole === "logistics" || uCat.includes("logistics")
              if (target === "user") {
                const isAdmin = uRole === "admin" || uCat.includes("admin")
                const isStaff = uRole === "salesperson" || uRole === "logistics" || uCat.includes("sales") || uCat.includes("logistics")
                return !isAdmin && !isStaff
              }
              return uRole === target || uCat.includes(target)
            }).length

            return (
              <button
                key={r.name}
                onClick={() => setRoleFilter(r.name)}
                className={`px-3 py-2 border transition-colors cursor-pointer ${
                  roleFilter.toLowerCase() === r.name.toLowerCase()
                    ? "bg-[#1A1816] text-[#FAF8F5] border-[#1A1816]"
                    : "bg-white text-[#8E877E] border-[#E5DFD5] hover:border-[#1A1816] hover:text-[#1A1816]"
                }`}
              >
                {r.title} ({count})
              </button>
            )
          })}
        </div>
      </div>

      {/* Users Directory Table */}
      <div className="bg-white border border-[#E5DFD5] overflow-hidden shadow-xs">
        {loading ? (
          <div className="p-16 text-center">
            <div className="w-8 h-8 border-2 border-[#1A1816] border-t-[#C5A059] rounded-full animate-spin mx-auto mb-3"></div>
            <p className="text-xs font-serif uppercase tracking-wider text-[#8E877E]">
              Consulting User Database...
            </p>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="p-16 text-center text-xs uppercase tracking-wider text-[#8E877E]">
            No user accounts found matching your query.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-[#FAF8F5] border-b border-[#E5DFD5] text-[10px] uppercase font-bold text-[#8E877E] tracking-wider">
                  <th className="p-4">Account Profile</th>
                  <th className="p-4">Correspondence Email</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">User Category</th>
                  <th className="p-4">Change Category</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5DFD5]">
                {filteredUsers.map((user) => {
                  const isUpdating = updatingId === user._id
                  const isCurrentUser = currentEmail && user.email?.toLowerCase() === currentEmail.toLowerCase()
                  return (
                    <tr
                      key={user._id}
                      className={`hover:bg-[#FAF8F5]/60 transition-colors ${
                        isCurrentUser ? "bg-[#FAF8F5]/40" : ""
                      }`}
                    >
                      {/* Name & Avatar */}
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-9 h-9 flex items-center justify-center font-serif font-bold text-sm ${
                            user.role === "admin"
                              ? "bg-[#1A1816] text-[#C5A059] border border-[#C5A059]"
                              : "bg-[#1A1816] text-[#FAF8F5]"
                          }`}>
                            {user.role === "admin" ? "♔" : user.fullName?.charAt(0).toUpperCase() || "P"}
                          </div>
                          <div>
                            <div className="flex items-center gap-1.5">
                              <span className="font-serif font-bold text-sm text-[#1A1816]">
                                {user.fullName || "Patron Member"}
                              </span>
                              {isCurrentUser && (
                                <span className="bg-[#C5A059]/20 text-[#C5A059] border border-[#C5A059]/40 text-[9px] font-bold px-1.5 py-0.2 uppercase">
                                  You
                                </span>
                              )}
                            </div>
                            <span className="text-[10px] text-[#8E877E] uppercase tracking-wider block">
                              ID: {user._id ? user._id.slice(-6) : "N/A"}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Email */}
                      <td className="p-4 font-mono text-xs text-[#6A645D]">
                        {user.email}
                      </td>

                      {/* Status */}
                      <td className="p-4">
                        <button
                          onClick={() => handleStatusChange(user._id, user.status || "Active")}
                          disabled={isUpdating}
                          className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 border cursor-pointer ${
                            user.status === "Suspended"
                              ? "bg-[#78281F]/10 border-[#78281F] text-[#78281F]"
                              : "bg-[#1C352D]/10 border-[#1C352D] text-[#1C352D]"
                          }`}
                        >
                          {user.status || "Active"}
                        </button>
                      </td>

                      {/* Category Badge */}
                      <td className="p-4">
                        <span
                          className={`inline-block text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 ${
                            user.role === "admin" || (user.userCategory && user.userCategory.toLowerCase().includes("admin"))
                              ? "bg-[#1A1816] text-[#C5A059] border border-[#C5A059]"
                              : user.role === "logistics"
                              ? "bg-[#78281F] text-[#FAF8F5]"
                              : user.role === "salesperson"
                              ? "bg-[#1C352D] text-[#FAF8F5]"
                              : "bg-[#FAF8F5] border border-[#E5DFD5] text-[#8E877E]"
                          }`}
                        >
                          {user.role === "admin" || (user.userCategory && user.userCategory.toLowerCase().includes("admin"))
                            ? "Admin"
                            : user.userCategory || (user.role === "salesperson" ? "Salesperson" : user.role === "logistics" ? "Logistics" : "User")}
                        </span>
                      </td>

                      {/* Category Selector Dropdown from MongoDB */}
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <select
                            value={user.role}
                            disabled={isUpdating}
                            onChange={(e) => handleRoleChange(user._id, e.target.value)}
                            className="bg-[#FAF8F5] border border-[#E5DFD5] text-xs font-bold uppercase tracking-wider py-1.5 px-3 text-[#1A1816] focus:outline-none focus:border-[#1A1816] cursor-pointer capitalize"
                          >
                            {categoriesFromDB.map((cat) => (
                              <option key={cat._id || cat.name} value={cat.name || cat.roleKey}>
                                {cat.title || cat.name}
                              </option>
                            ))}
                          </select>
                          {isUpdating && (
                            <span className="text-[10px] text-[#8E877E] uppercase animate-pulse">
                              ...
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="p-4 text-right">
                        <button
                          onClick={() => handleDeleteUser(user._id, user.email)}
                          disabled={isUpdating}
                          className="text-[#8E877E] hover:text-[#78281F] p-1.5 transition-colors cursor-pointer"
                          title="Delete Account"
                        >
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal: Register New User */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="bg-[#FAF8F5] border border-[#E5DFD5] max-w-lg w-full p-6 sm:p-8 relative shadow-2xl">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 text-[#8E877E] hover:text-[#1A1816] cursor-pointer"
            >
              <X size={20} />
            </button>

            <h2 className="font-serif text-2xl font-bold uppercase tracking-tight text-[#1A1816] mb-4">
              Register User Account
            </h2>

            <form onSubmit={handleCreateStaff} className="space-y-4">
              <div>
                <label className="block text-[10px] uppercase font-bold text-[#8E877E] tracking-wider mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="Full name"
                  value={newUser.fullName}
                  onChange={(e) => setNewUser({ ...newUser, fullName: e.target.value })}
                  className="w-full p-2.5 bg-white border border-[#E5DFD5] text-xs uppercase tracking-wider text-[#1A1816] focus:outline-none focus:border-[#1A1816]"
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase font-bold text-[#8E877E] tracking-wider mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  placeholder="name@domain.com"
                  value={newUser.email}
                  onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                  className="w-full p-2.5 bg-white border border-[#E5DFD5] text-xs text-[#1A1816] focus:outline-none focus:border-[#1A1816]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] uppercase font-bold text-[#8E877E] tracking-wider mb-1">
                    Password
                  </label>
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={newUser.password}
                    onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                    className="w-full p-2.5 bg-white border border-[#E5DFD5] text-xs text-[#1A1816] focus:outline-none focus:border-[#1A1816]"
                  />
                </div>

                <div>
                  <label className="block text-[10px] uppercase font-bold text-[#8E877E] tracking-wider mb-1">
                    User Category
                  </label>
                  <select
                    value={newUser.role}
                    onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                    className="w-full p-2.5 bg-white border border-[#E5DFD5] text-xs font-bold uppercase tracking-wider text-[#1A1816] focus:outline-none focus:border-[#1A1816] cursor-pointer capitalize"
                  >
                    {categoriesFromDB.map((cat) => (
                      <option key={cat._id || cat.name} value={cat.name || cat.roleKey}>
                        {cat.title || cat.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[10px] uppercase font-bold text-[#8E877E] tracking-wider mb-1">
                  Telephone (Optional)
                </label>
                <input
                  type="text"
                  placeholder="+1 555 019 2831"
                  value={newUser.phone}
                  onChange={(e) => setNewUser({ ...newUser, phone: e.target.value })}
                  className="w-full p-2.5 bg-white border border-[#E5DFD5] text-xs text-[#1A1816] focus:outline-none focus:border-[#1A1816]"
                />
              </div>

              <div className="pt-4 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 border border-[#E5DFD5] text-xs uppercase font-bold tracking-wider text-[#8E877E] hover:text-[#1A1816] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="px-5 py-2.5 bg-[#1A1816] text-[#FAF8F5] hover:bg-[#C5A059] hover:text-[#1A1816] text-xs uppercase font-bold tracking-wider transition-colors cursor-pointer"
                >
                  {creating ? "Saving..." : "Save User"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
