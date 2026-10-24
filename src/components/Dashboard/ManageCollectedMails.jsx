import { useState, useEffect, useMemo } from "react"
import { GetRequest, DeleteRequest } from "../../config/http"
import { Mail, Search, Trash2, RefreshCw } from "lucide-react"

export default function ManageCollectedMails() {
  const [mails, setMails] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")

  const fetchMails = async () => {
    try {
      setLoading(true)
      const res = await GetRequest("collected-mails")
      setMails(res.data?.data || [])
    } catch (err) {
      console.error("Failed to fetch collected mails:", err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchMails()
  }, [])

  const handleDelete = async (id) => {
    if (!window.confirm("Remove this email?")) return
    try {
      await DeleteRequest(`collected-mails/${id}`)
      setMails((prev) => prev.filter((m) => m._id !== id))
    } catch (err) {
      console.error("Failed to delete email:", err)
    }
  }

  const filteredMails = useMemo(() => {
    if (!searchQuery.trim()) return mails
    const q = searchQuery.toLowerCase()
    return mails.filter((m) => m.email?.toLowerCase().includes(q))
  }, [mails, searchQuery])

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between pb-5 border-b border-[#E6E2DE]">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-serif font-bold text-[#1A1816]">
            Collected Emails
          </h1>
          <span className="bg-[#1A1816] text-[#FAF8F5] text-xs font-bold px-2.5 py-0.5 rounded-full">
            {mails.length}
          </span>
        </div>

        <button
          onClick={fetchMails}
          disabled={loading}
          className="p-2 border border-[#D5D0C9] bg-white hover:bg-[#F3EFEA] text-[#1A1816] transition-colors rounded cursor-pointer"
          title="Refresh"
        >
          <RefreshCw size={15} className={loading ? "animate-spin" : ""} />
        </button>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search
          size={15}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9C948A]"
        />
        <input
          type="text"
          placeholder="Search emails..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-9 pr-3 py-2 text-xs border border-[#D5D0C9] bg-white rounded focus:border-[#C5A059] focus:outline-none"
        />
      </div>

      {/* Simple Email Table */}
      <div className="bg-white border border-[#E6E2DE] shadow-xs overflow-hidden">
        {loading ? (
          <div className="py-12 text-center text-xs text-[#6A645D]">
            <RefreshCw size={20} className="animate-spin mx-auto mb-2 text-[#C5A059]" />
            Loading emails...
          </div>
        ) : filteredMails.length === 0 ? (
          <div className="py-12 text-center text-xs text-[#6A645D]">
            <Mail size={24} className="mx-auto text-[#D5D0C9] mb-2" />
            <p>No emails collected yet.</p>
          </div>
        ) : (
          <table className="w-full text-left text-xs">
            <thead className="bg-[#FAF8F5] border-b border-[#E6E2DE] text-[#6A645D] uppercase tracking-wider font-semibold">
              <tr>
                <th className="py-3 px-4 w-12 text-center">#</th>
                <th className="py-3 px-4">Email</th>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4 w-16 text-right"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E6E2DE]">
              {filteredMails.map((m, idx) => (
                <tr key={m._id || idx} className="hover:bg-[#FAF8F5] transition-colors">
                  <td className="py-3 px-4 text-center text-[#9C948A] font-mono">
                    {idx + 1}
                  </td>
                  <td className="py-3 px-4 font-medium text-[#1A1816]">
                    {m.email}
                  </td>
                  <td className="py-3 px-4 text-[#6A645D]">
                    {m.createdAt ? new Date(m.createdAt).toLocaleDateString() : "—"}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <button
                      onClick={() => handleDelete(m._id)}
                      className="p-1 hover:text-red-600 text-[#9C948A] transition-colors cursor-pointer"
                      title="Delete"
                    >
                      <Trash2 size={14} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
