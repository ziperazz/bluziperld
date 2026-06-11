"use client"

import { useEffect, useState } from "react"
import CommentCard from "./components/CommentCard"
import SearchBar from "./components/SearchBar"
import Filters from "./components/Filters"

export default function AdminCommentsPage() {
  const [comments, setComments] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [filter, setFilter] = useState("pending")
  const [token, setToken] = useState<string | null>(null)

  const api =
    process.env.NEXT_PUBLIC_API_URL?.replace(/\/+$/, "") ||
    "http://localhost:5000"

  // گرفتن توکن بعد از mount
  useEffect(() => {
    if (typeof window === "undefined") return
    const t = localStorage.getItem("accessToken")
    setToken(t)
  }, [])

  // ---- دریافت کامنت‌ها ----
  async function fetchComments() {
    try {
      setLoading(true)

      if (!token) {
        setComments([])
        setLoading(false)
        return
      }

      const res = await fetch(`${api}/api/comments/admin/pending`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (res.status === 401 || res.status === 403) {
        console.error("unauthorized")
        setComments([])
        setLoading(false)
        return
      }

      const data = await res.json()

      // جلوگیری از خطاهای احتمالی
      setComments(Array.isArray(data) ? data : [])
    } catch (err) {
      console.error("fetch comments error:", err)
      setComments([])
    }

    setLoading(false)
  }

  // وقتی توکن load شد → کامنت‌ها را بگیر
  useEffect(() => {
    if (token === null) return
    fetchComments()
  }, [token])

  // ---- فیلتر کردن ----
  const filtered = comments.filter((c: any) => {
    const text = (c.content || "").toLowerCase()
    const username = (c.user?.name || "").toLowerCase()

    const matchSearch =
      text.includes(search.toLowerCase()) ||
      username.includes(search.toLowerCase())

    if (filter === "pending") return matchSearch && !c.approved
    if (filter === "approved") return matchSearch && c.approved

    return matchSearch
  })

  return (
    <div className="p-8 space-y-8">
      <h1 className="text-2xl font-bold">مدیریت کامنت‌ها</h1>

      <SearchBar value={search} onChange={setSearch} />
      <Filters value={filter} onChange={setFilter} />

      {loading && (
        <div className="text-sm text-gray-400">در حال بارگذاری...</div>
      )}

      {!loading && filtered.length === 0 && (
        <div className="text-sm text-gray-500">کامنتی پیدا نشد</div>
      )}

      <div className="grid gap-4">
        {filtered.map((comment: any) => (
          <CommentCard
            key={comment._id}
            comment={comment}
            refresh={fetchComments}
          />
        ))}
      </div>
    </div>
  )
}
