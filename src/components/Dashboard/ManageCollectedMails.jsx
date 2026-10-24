import { useState, useEffect, useMemo } from "react"
import { GetRequest, PostRequest, DeleteRequest } from "../../config/http"
import {
  Mail,
  Search,
  Trash2,
  Copy,
  Check,
  Download,
  Plus,
  X,
  Code,
  RefreshCw,
  Calendar,
  AlertCircle,
  FileSpreadsheet,
} from "lucide-react"

export default function ManageCollectedMails() {
  const [mails, setMails] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [feedback, setFeedback] = useState({ type: "", message: "" })

  // Modal states
  const [showAddModal, setShowAddModal] = useState(false)
  const [newEmail, setNewEmail] = useState("")
  const [addingEmail, setAddingEmail] = useState(false)
  const [addError, setAddError] = useState("")

  const [showJsonModal, setShowJsonModal] = useState(false)
  const [copiedId, setCopiedId] = useState(null)
  const [allCopied, setAllCopied] = useState(false)

  const [deleteCandidate, setDeleteCandidate] = useState(null)
  const [deleting, setDeleting] = useState(false)

  const fetchMails = async () => {
    try {
      setLoading(true)
      const res = await GetRequest("collected-mails")
      setMails(res.data?.data || [])
    } catch (err) {
      console.error("Failed to fetch collected mails:", err)
      showFeedback("error", "Failed to retrieve collected emails.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchMails()
  }, [])

  const showFeedback = (type, message) => {
    setFeedback({ type, message })
    setTimeout(() => setFeedback({ type: "", message: "" }), 3500)
  }

  // Filtered emails based on search query
  const filteredMails = useMemo(() => {
    if (!searchQuery.trim()) return mails
    const q = searchQuery.toLowerCase()
    return mails.filter((m) => m.email?.toLowerCase().includes(q))
  }, [mails, searchQuery])

  // Single email copy
  const handleCopyEmail = (email, id) => {
    navigator.clipboard.writeText(email)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  // Copy all emails
  const handleCopyAll = () => {
    if (!mails.length) return
    const list = mails.map((m) => m.email).join(", ")
    navigator.clipboard.writeText(list)
    setAllCopied(true)
    showFeedback("success", `Copied ${mails.length} emails to clipboard.`)
    setTimeout(() => setAllCopied(false), 2500)
  }

  // Export JSON as clean [{ email: userMail }] format
  const handleExportJson = () => {
    if (!mails.length) return
    const exportData = mails.map((m) => ({ email: m.email }))
    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: "application/json",
    })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `collected_mails_${new Date().toISOString().slice(0, 10)}.json`
    a.click()
    URL.revokeObjectURL(url)
    showFeedback("success", "Exported emails as JSON.")
  }

  // Export CSV
  const handleExportCsv = () => {
    if (!mails.length) return
    const csvContent =
      "Email,Date Collected\n" +
      mails
        .map(
          (m) =>
            `"${m.email}","${m.createdAt ? new Date(m.createdAt).toISOString() : ""}"`
        )
        .join("\n")

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `collected_mails_${new Date().toISOString().slice(0, 10)}.csv`
    a.click()
    URL.revokeObjectURL(url)
    showFeedback("success", "Exported emails as CSV.")
  }

  // Add email manually
  const handleAddEmail = async (e) => {
    e.preventDefault()
    const clean = newEmail.trim().toLowerCase()
    if (!clean) return

    try {
      setAddingEmail(true)
      setAddError("")
      const res = await PostRequest("collected-mails/admin-add", { email: clean })
      if (res.data?.alreadySubscribed) {
        showFeedback("info", "This email is already in the list.")
      } else {
        showFeedback("success", "Email added successfully.")
        fetchMails()
      }
      setShowAddModal(false)
      setNewEmail("")
    } catch (err) {
      setAddError(err?.response?.data?.message || "Failed to add email.")
    } finally {
      setAddingEmail(false)
    }
  }

  // Delete email
  const handleDeleteConfirm = async () => {
    if (!deleteCandidate) return
    try {
      setDeleting(true)
      await DeleteRequest(`collected-mails/${deleteCandidate._id}`)
      setMails((prev) => prev.filter((m) => m._id !== deleteCandidate._id))
      showFeedback("success", `Removed ${deleteCandidate.email}`)
      setDeleteCandidate(null)
    } catch (err) {
      console.error("Failed to delete email:", err)
      showFeedback("error", "Failed to remove email record.")
    } finally {
      setDeleting(false)
    }
  }

  // Raw JSON representation for quick viewing
  const jsonViewData = useMemo(() => {
    return JSON.stringify(
      mails.map((m) => ({ email: m.email })),
      null,
      2
    )
  }, [mails])

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Toast Feedback */}
      {feedback.message && (
        <div
          className={`p-4 text-xs font-semibold uppercase tracking-wider flex items-center justify-between border ${
            feedback.type === "error"
              ? "bg-red-50 text-red-800 border-red-200"
              : feedback.type === "info"
              ? "bg-amber-50 text-amber-800 border-amber-200"
              : "bg-emerald-50 text-emerald-800 border-emerald-200"
          }`}
        >
          <span>{feedback.message}</span>
          <button
            onClick={() => setFeedback({ type: "", message: "" })}
            className="text-inherit hover:opacity-75 cursor-pointer ml-4"
          >
            <X size={14} />
          </button>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-[#E6E2DE]">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-serif font-bold text-[#1A1816]">
              Collected Emails
            </h1>
            <span className="bg-[#1A1816] text-[#FAF8F5] text-xs font-bold px-2.5 py-1 rounded-full">
              {mails.length}
            </span>
          </div>
          <p className="text-xs text-[#6A645D] mt-1">
            Newsletter subscribers and customer emails collected from the Stay in Touch storefront form.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center flex-wrap gap-2">
          <button
            onClick={fetchMails}
            disabled={loading}
            className="p-2 border border-[#D5D0C9] bg-white hover:bg-[#F3EFEA] text-[#1A1816] transition-colors rounded cursor-pointer"
            title="Refresh list"
          >
            <RefreshCw size={15} className={loading ? "animate-spin" : ""} />
          </button>

          <button
            onClick={handleCopyAll}
            disabled={!mails.length}
            className="px-3 py-2 border border-[#D5D0C9] bg-white hover:bg-[#F3EFEA] text-[#1A1816] text-xs font-semibold flex items-center gap-1.5 transition-colors rounded cursor-pointer disabled:opacity-40"
          >
            {allCopied ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}
            <span>Copy All</span>
          </button>

          <button
            onClick={() => setShowJsonModal(true)}
            disabled={!mails.length}
            className="px-3 py-2 border border-[#D5D0C9] bg-white hover:bg-[#F3EFEA] text-[#1A1816] text-xs font-semibold flex items-center gap-1.5 transition-colors rounded cursor-pointer disabled:opacity-40"
          >
            <Code size={14} />
            <span>View JSON</span>
          </button>

          <button
            onClick={handleExportJson}
            disabled={!mails.length}
            className="px-3 py-2 border border-[#D5D0C9] bg-white hover:bg-[#F3EFEA] text-[#1A1816] text-xs font-semibold flex items-center gap-1.5 transition-colors rounded cursor-pointer disabled:opacity-40"
          >
            <Download size={14} />
            <span>JSON</span>
          </button>

          <button
            onClick={handleExportCsv}
            disabled={!mails.length}
            className="px-3 py-2 border border-[#D5D0C9] bg-white hover:bg-[#F3EFEA] text-[#1A1816] text-xs font-semibold flex items-center gap-1.5 transition-colors rounded cursor-pointer disabled:opacity-40"
          >
            <FileSpreadsheet size={14} />
            <span>CSV</span>
          </button>

          <button
            onClick={() => {
              setNewEmail("")
              setAddError("")
              setShowAddModal(true)
            }}
            className="px-4 py-2 bg-[#1A1816] hover:bg-[#C5A059] hover:text-[#1A1816] text-[#FAF8F5] text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition-colors rounded cursor-pointer shadow-xs"
          >
            <Plus size={14} />
            <span>Add Email</span>
          </button>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white p-4 border border-[#E6E2DE] shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9C948A]"
          />
          <input
            type="text"
            placeholder="Search email address..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs border border-[#D5D0C9] rounded focus:border-[#C5A059] focus:outline-none"
          />
        </div>

        <div className="text-xs text-[#6A645D]">
          Showing <span className="font-bold text-[#1A1816]">{filteredMails.length}</span> of{" "}
          <span className="font-bold text-[#1A1816]">{mails.length}</span> collected emails
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-white border border-[#E6E2DE] shadow-xs overflow-hidden">
        {loading ? (
          <div className="py-16 text-center text-xs text-[#6A645D]">
            <RefreshCw size={24} className="animate-spin mx-auto mb-3 text-[#C5A059]" />
            Loading collected emails...
          </div>
        ) : filteredMails.length === 0 ? (
          <div className="py-16 text-center">
            <Mail size={32} className="mx-auto text-[#D5D0C9] mb-3" />
            <h3 className="text-sm font-bold text-[#1A1816] uppercase tracking-wider mb-1">
              {searchQuery ? "No matching emails found" : "No emails collected yet"}
            </h3>
            <p className="text-xs text-[#6A645D] max-w-sm mx-auto">
              {searchQuery
                ? "Try searching for a different keyword or clear the search bar."
                : "Visitors who submit their email in the 'Stay in Touch' footer form will automatically appear here in { email: userMail } format."}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#FAF8F5] border-b border-[#E6E2DE] text-[#6A645D] uppercase tracking-wider font-semibold">
                <tr>
                  <th className="py-3 px-4 w-12 text-center">#</th>
                  <th className="py-3 px-4">Email Address</th>
                  <th className="py-3 px-4">Stored JSON Structure</th>
                  <th className="py-3 px-4">Date Joined</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E6E2DE]">
                {filteredMails.map((m, idx) => {
                  const isCopied = copiedId === m._id
                  const formattedDate = m.createdAt
                    ? new Date(m.createdAt).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })
                    : "—"

                  return (
                    <tr
                      key={m._id || idx}
                      className="hover:bg-[#FAF8F5] transition-colors group"
                    >
                      <td className="py-3 px-4 text-center text-[#9C948A] font-mono">
                        {idx + 1}
                      </td>

                      <td className="py-3 px-4 font-semibold text-[#1A1816]">
                        <div className="flex items-center gap-2">
                          <Mail size={14} className="text-[#C5A059] shrink-0" />
                          <span>{m.email}</span>
                        </div>
                      </td>

                      <td className="py-3 px-4">
                        <code className="bg-[#FAF8F5] border border-[#E6E2DE] text-[#6A645D] px-2 py-1 rounded text-[11px] font-mono">
                          &#123; email: &quot;{m.email}&quot; &#125;
                        </code>
                      </td>

                      <td className="py-3 px-4 text-[#6A645D]">
                        <div className="flex items-center gap-1.5 text-[11px]">
                          <Calendar size={13} className="text-[#9C948A]" />
                          <span>{formattedDate}</span>
                        </div>
                      </td>

                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => handleCopyEmail(m.email, m._id)}
                            className="p-1.5 hover:bg-[#E6E2DE] text-[#6A645D] hover:text-[#1A1816] rounded transition-colors cursor-pointer"
                            title="Copy email"
                          >
                            {isCopied ? (
                              <Check size={14} className="text-emerald-600" />
                            ) : (
                              <Copy size={14} />
                            )}
                          </button>

                          <button
                            onClick={() => setDeleteCandidate(m)}
                            className="p-1.5 hover:bg-red-50 text-[#6A645D] hover:text-red-600 rounded transition-colors cursor-pointer"
                            title="Remove email"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add Email Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white max-w-md w-full border border-[#D5D0C9] shadow-xl p-6 relative">
            <button
              onClick={() => setShowAddModal(false)}
              className="absolute top-4 right-4 text-[#9C948A] hover:text-[#1A1816] cursor-pointer"
            >
              <X size={18} />
            </button>

            <h3 className="text-base font-bold uppercase tracking-wider text-[#1A1816] mb-1">
              Add Email to List
            </h3>
            <p className="text-xs text-[#6A645D] mb-4">
              Manually add an email to the CollectedMails database.
            </p>

            <form onSubmit={handleAddEmail} className="space-y-4">
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-[#6A645D] mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  placeholder="name@example.com"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-[#D5D0C9] rounded focus:border-[#C5A059] focus:outline-none"
                />
              </div>

              {addError && (
                <div className="p-2.5 bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
                  <AlertCircle size={14} />
                  <span>{addError}</span>
                </div>
              )}

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 border border-[#D5D0C9] text-xs font-semibold text-[#6A645D] hover:text-[#1A1816] rounded cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={addingEmail}
                  className="px-4 py-2 bg-[#1A1816] hover:bg-[#C5A059] hover:text-[#1A1816] text-[#FAF8F5] text-xs font-bold uppercase tracking-wider rounded transition-colors cursor-pointer disabled:opacity-50"
                >
                  {addingEmail ? "Saving..." : "Save Email"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* JSON Viewer Modal */}
      {showJsonModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-[#1A1816] text-[#FAF8F5] max-w-2xl w-full border border-[#2C2825] shadow-2xl p-6 relative">
            <button
              onClick={() => setShowJsonModal(false)}
              className="absolute top-4 right-4 text-[#9C948A] hover:text-white cursor-pointer"
            >
              <X size={18} />
            </button>

            <div className="flex items-center justify-between pb-3 border-b border-[#2C2825] mb-4">
              <div>
                <h3 className="text-sm font-bold uppercase tracking-wider text-[#FAF8F5]">
                  CollectedMails JSON Output
                </h3>
                <p className="text-[11px] text-[#9C948A] mt-0.5">
                  Clean &#123; email: userMail &#125; format for direct API usage or export.
                </p>
              </div>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(jsonViewData)
                  showFeedback("success", "JSON copied to clipboard.")
                }}
                className="px-3 py-1.5 bg-[#C5A059] text-[#1A1816] text-xs font-bold uppercase tracking-wider rounded flex items-center gap-1.5 hover:bg-[#d8b368] transition-colors cursor-pointer mr-6"
              >
                <Copy size={13} />
                <span>Copy JSON</span>
              </button>
            </div>

            <pre className="bg-[#141312] p-4 text-[11px] font-mono text-[#C5A059] overflow-auto max-h-96 border border-[#262422] rounded">
              {jsonViewData}
            </pre>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteCandidate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white max-w-sm w-full border border-[#D5D0C9] shadow-xl p-6 relative">
            <h3 className="text-sm font-bold uppercase tracking-wider text-red-600 mb-2">
              Remove Email?
            </h3>
            <p className="text-xs text-[#6A645D] mb-4">
              Are you sure you want to remove <strong className="text-[#1A1816]">{deleteCandidate.email}</strong> from the collected emails list?
            </p>

            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setDeleteCandidate(null)}
                className="px-4 py-2 border border-[#D5D0C9] text-xs font-semibold text-[#6A645D] hover:text-[#1A1816] rounded cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteConfirm}
                disabled={deleting}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-bold uppercase tracking-wider rounded transition-colors cursor-pointer disabled:opacity-50"
              >
                {deleting ? "Removing..." : "Confirm Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
