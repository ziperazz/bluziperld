"use client"

import { Check, X, Star } from "lucide-react"
import { useState } from "react"

export default function CommentCard({ comment, refresh }) {
  const [loading, setLoading] = useState(false)

  const api =
    process.env.NEXT_PUBLIC_API_URL?.replace(/\/+$/, "") ||
    "http://localhost:5000"

  /* ---------- تایید ---------- */
  async function approve() {
    try {
      if (loading) return

      setLoading(true)

      const token = localStorage.getItem("accessToken")

      const res = await fetch(
        `${api}/api/comments/admin/${comment._id}/approve`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )

      if (res.ok) {
        refresh()
      }
    } catch (err) {
      console.error("approve error:", err)
    }

    setLoading(false)
  }

  /* ---------- حذف ---------- */
  async function reject() {
    try {
      if (loading) return

      setLoading(true)

      const token = localStorage.getItem("accessToken")

      const res = await fetch(
        `${api}/api/comments/admin/${comment._id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )

      if (res.ok) {
        refresh()
      }
    } catch (err) {
      console.error("reject error:", err)
    }

    setLoading(false)
  }

  return (
    <div className="bg-[#0f172a] border border-[#1f2937] rounded-xl p-5 space-y-4">

      {/* بالا */}
      <div className="flex justify-between items-start gap-4">

        <div className="space-y-2">

          {/* نام کاربر */}
          <div className="font-medium text-white">
            {comment?.user?.name || "کاربر"}
          </div>

          {/* تاریخ */}
          <div className="text-xs text-gray-400">
            {comment?.createdAt
              ? new Date(comment.createdAt).toLocaleString("fa-IR")
              : ""}
          </div>

          {/* نوع کامنت + عنوان */}
          <div className="text-sm text-cyan-400">

            {comment?.targetType === "Product"
              ? "محصول"
              : "نامه"}

            {" : "}

            {comment?.targetId?.title || "نامشخص"}

          </div>

          {/* امتیاز */}
          {comment?.rating && (
            <div className="flex items-center gap-1 text-yellow-400">
              {Array.from({ length: comment.rating }).map((_, i) => (
                <Star
                  key={i}
                  size={14}
                  fill="currentColor"
                />
              ))}
            </div>
          )}

        </div>

        {/* وضعیت */}
        {!comment.approved && (
          <div className="text-sm bg-yellow-500/20 text-yellow-400 px-3 py-1 rounded-lg h-fit">
            در انتظار تایید
          </div>
        )}

        {comment.approved && (
          <div className="text-sm bg-green-500/20 text-green-400 px-3 py-1 rounded-lg h-fit">
            تایید شده
          </div>
        )}

      </div>

      {/* متن کامنت */}
      <div className="text-sm leading-7 text-gray-300 border-t border-[#1f2937] pt-4">
        {comment?.content || ""}
      </div>

      {/* دکمه‌ها */}
      {!comment.approved && (
        <div className="flex gap-3 pt-2">

          <button
            onClick={approve}
            disabled={loading}
            className="flex items-center gap-2 bg-green-600 px-4 py-2 rounded-lg text-sm hover:bg-green-700 transition disabled:opacity-50"
          >
            <Check size={16} />
            تایید
          </button>

          <button
            onClick={reject}
            disabled={loading}
            className="flex items-center gap-2 bg-red-600 px-4 py-2 rounded-lg text-sm hover:bg-red-700 transition disabled:opacity-50"
          >
            <X size={16} />
            رد
          </button>

        </div>
      )}

    </div>
  )
}
