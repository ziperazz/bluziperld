"use client"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import { User, LogOut, ChevronDown, Loader2 } from "lucide-react"
import { useRouter, usePathname } from "next/navigation"

interface IUser {
  _id: string
  mobile: string
  role: string
}

const API = process.env.NEXT_PUBLIC_API_URL

export default function ProfileDropdown() {
  const [open, setOpen] = useState(false)
  const [user, setUser] = useState<IUser | null>(null)
  const [loading, setLoading] = useState(true)

  const dropdownRef = useRef<HTMLDivElement>(null)
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    const token = localStorage.getItem("accessToken")

    if (!token) {
      setLoading(false)
      return
    }

    const fetchUser = async () => {
      try {
        const res = await fetch(`${API}/api/auth/me`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          credentials: "include",
        })

        if (!res.ok) {
          localStorage.removeItem("accessToken")
          setUser(null)
          setLoading(false)
          return
        }

        const data = await res.json()

        if (data?.user) {
          setUser(data.user)
        }

      } catch (error) {
        console.error("fetch user error:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchUser()
  }, [pathname])

  useEffect(() => {
    const close = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }

    document.addEventListener("mousedown", close)
    return () => document.removeEventListener("mousedown", close)
  }, [])

  const handleLogout = async () => {
    try {
      await fetch(`${API}/api/auth/logout`, {
        method: "POST",
        credentials: "include",
      })
    } catch (e) {
      console.error(e)
    }

    localStorage.removeItem("accessToken")
    setUser(null)

    router.push("/")
    router.refresh()
  }

  if (!loading && !user) {
    return (
      <Link
        href="/auth"
        className="flex items-center gap-1 text-gray-200 hover:text-white transition"
      >
        <User size={18} />
        ورود
      </Link>
    )
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1 cursor-pointer hover:opacity-80 transition"
      >
        <User size={20} className="text-gray-200" />
        <ChevronDown
          size={14}
          className={`text-gray-400 transition-transform ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>

      {open && (
        <div
          className="absolute top-full left-0 mt-3 w-52 rounded-2xl p-3 z-[999]"
          style={{
            background: "rgba(15,16,22,0.7)",
            backdropFilter: "blur(30px)",
            border: "1px solid rgba(255,255,255,0.08)",
            boxShadow: "0 10px 30px rgba(0,0,0,0.5)",
          }}
        >
          <div
            className="px-3 py-2 rounded-xl mb-3"
            style={{
              background: "rgba(255,255,255,0.03)",
              border: "1px solid rgba(255,255,255,0.05)",
            }}
          >
            {loading ? (
              <div className="flex items-center gap-2 text-gray-400 text-[11px]">
                <Loader2 size={12} className="animate-spin" />
                درحال بارگذاری...
              </div>
            ) : user ? (
              <>
                <p className="text-gray-100 text-xs font-semibold">حساب کاربری</p>
                <p className="text-gray-400 text-[11px] font-mono">
                  ID: {user._id.slice(-8)}
                </p>
                <p className="text-gray-400 text-[11px]">{user.mobile}</p>
              </>
            ) : (
              <p className="text-red-400 text-[11px]">خطا در دریافت کاربر</p>
            )}
          </div>

          <div className="flex flex-col text-[13px] text-gray-200">
            {user?.role === "admin" && (
              <Link
                href="/admin"
                className="px-3 py-2 rounded-lg hover:bg-white/5 transition text-blue-400"
                onClick={() => setOpen(false)}
              >
                پنل مدیریت
              </Link>
            )}

            <Link
              href="/panel/orders"
              className="px-3 py-2 rounded-lg hover:bg-white/5 transition"
              onClick={() => setOpen(false)}
            >
              سفارش‌ها
            </Link>

            <Link
              href="/support"
              className="px-3 py-2 rounded-lg hover:bg-white/5 transition"
              onClick={() => setOpen(false)}
            >
              تیکت‌ها
            </Link>

            <button
              onClick={handleLogout}
              className="px-3 py-2 rounded-lg text-red-400 flex items-center gap-2 hover:bg-red-500/10 transition mt-1 w-full text-right"
            >
              <LogOut size={14} />
              خروج
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
