"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation" // اضافه شد برای هدایت کاربر
import {
  Plus,
  MessageCircle,
  AlertCircle,
  Clock3,
  CheckCircle2,
  Sparkles,
  RefreshCcw,
  Inbox,
  ArrowUpRight,
} from "lucide-react"

// استفاده از متغیر محیطی برای آدرس API
const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

type TicketStatus = "OPEN" | "WAITING_ADMIN" | "WAITING_USER" | "CLOSED"
type TicketPriority = "LOW" | "MEDIUM" | "HIGH"

interface Ticket {
  _id: string
  subject: string
  status: TicketStatus
  priority: TicketPriority
  updatedAt: string
  createdAt: string
}

export default function UserSupportPage() {
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    loadTickets(true)
  }, [])

  async function loadTickets(isInitial = false) {
    try {
      if (isInitial) setLoading(true)
      else setRefreshing(true)

      setError(null)

      // هماهنگی با نام توکن در سایر بخش‌ها
      const token = typeof window !== "undefined" ? localStorage.getItem("accessToken") : null

      if (!token) {
        setError("ابتدا وارد حساب کاربری خود شوید.")
        setLoading(false)
        return
      }

      const res = await fetch(`${API}/api/tickets/me`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        credentials: "include", // مهم برای ارسال کوکی‌های امن
        cache: "no-store",
      })

      // اگر کاربر لاگین نبود یا توکن نامعتبر بود
      if (res.status === 401) {
        localStorage.removeItem("accessToken");
        router.push("/auth");
        return;
      }

      const data = await res.json()

      if (!res.ok || !data.success) {
        throw new Error(data.message || "خطا در دریافت تیکت‌ها")
      }

      setTickets(Array.isArray(data.tickets) ? data.tickets : [])
    } catch (err: any) {
      setError(err.message || "خطای ناشناخته رخ داد")
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  // محاسبات آمار
  const stats = useMemo(() => ({
    total: tickets.length,
    open: tickets.filter((t) => t.status === "OPEN").length,
    waitingAdmin: tickets.filter((t) => t.status === "WAITING_ADMIN").length,
    waitingUser: tickets.filter((t) => t.status === "WAITING_USER").length,
    closed: tickets.filter((t) => t.status === "CLOSED").length,
    high: tickets.filter((t) => t.priority === "HIGH").length,
  }), [tickets])

  // مرتب‌سازی
  const orderedTickets = useMemo(
    () => [...tickets].sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()),
    [tickets]
  )

  return (
    <div className="relative pb-20">
      {/* Background Ornaments */}
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute right-0 top-0 h-64 w-64 rounded-full bg-blue-500/10 blur-3xl" />
        <div className="absolute left-0 top-40 h-72 w-72 rounded-full bg-cyan-500/10 blur-3xl" />
      </div>

      <div className="space-y-6 md:space-y-8">
        {/* Hero Section */}
        <section className="relative overflow-hidden rounded-3xl border border-white/10 bg-[linear-gradient(180deg,rgba(15,23,42,0.92),rgba(2,6,23,0.96))] p-4 sm:p-6 lg:p-8 shadow-2xl">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(59,130,246,0.15),transparent_30%)]" />
          <div className="relative flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-2xl">
              <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-blue-400/20 bg-blue-500/10 px-3 py-1 text-xs text-blue-200">
                <Sparkles size={14} />
                مرکز پشتیبانی حرفه‌ای
              </div>
              <h1 className="text-xl sm:text-3xl font-black text-white">تیکت‌های پشتیبانی</h1>
              <p className="mt-3 text-sm text-slate-300 leading-relaxed">
                وضعیت درخواست‌های خود را پیگیری کنید یا برای دریافت راهنمایی، تیکت جدید ثبت کنید.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <Link
                href="/support/new"
                className="inline-flex justify-center items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-blue-500 transition shadow-lg shadow-blue-900/20"
              >
                <Plus size={18} />
                ثبت تیکت جدید
              </Link>
              <button
                onClick={() => loadTickets(false)}
                disabled={refreshing}
                className="inline-flex justify-center items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-slate-200 hover:bg-white/10 transition disabled:opacity-50"
              >
                <RefreshCcw size={16} className={refreshing ? "animate-spin" : ""} />
                بروزرسانی
              </button>
            </div>
          </div>
        </section>

        {/* Stats Grid */}
        <section className="grid gap-4 grid-cols-2 md:grid-cols-4">
          <StatCard title="کل تیکت‌ها" value={stats.total} icon={<MessageCircle size={18} />} color="indigo" />
          <StatCard title="در حال بررسی" value={stats.open} icon={<AlertCircle size={18} />} color="emerald" />
          <StatCard title="منتظر پاسخ" value={stats.waitingAdmin} icon={<Clock3 size={18} />} color="blue" />
          <StatCard title="بسته شده" value={stats.closed} icon={<CheckCircle2 size={18} />} color="gray" />
        </section>

        {/* Error Display */}
        {error && (
          <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-200 flex items-center gap-3">
            <AlertCircle size={18} />
            {error}
          </div>
        )}

        {/* Tickets List */}
        <section>
          {/* Desktop Table */}
          <div className="hidden md:block overflow-hidden rounded-2xl border border-white/10 bg-[#020617]/80 backdrop-blur-md">
            <table className="min-w-full divide-y divide-white/5">
              <thead className="bg-white/5">
                <tr className="text-right text-xs font-medium text-gray-400 uppercase tracking-wider">
                  <th className="px-6 py-4">موضوع و تاریخ</th>
                  <th className="px-6 py-4">اولویت</th>
                  <th className="px-6 py-4">وضعیت</th>
                  <th className="px-6 py-4">آخرین بروزرسانی</th>
                  <th className="px-6 py-4"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {loading ? <TableSkeletonRows /> : orderedTickets.length === 0 ? (
                  <tr><td colSpan={5} className="py-20"><EmptyState /></td></tr>
                ) : (
                  orderedTickets.map((t) => (
                    <tr key={t._id} className="hover:bg-white/5 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="text-sm font-semibold text-white">{t.subject}</div>
                        <div className="text-[11px] text-gray-500 mt-1">
                          {new Date(t.createdAt).toLocaleDateString("fa-IR")}
                        </div>
                      </td>
                      <td className="px-6 py-4"><PriorityBadge priority={t.priority} /></td>
                      <td className="px-6 py-4"><StatusBadge status={t.status} /></td>
                      <td className="px-6 py-4 text-xs text-gray-400">
                        {new Date(t.updatedAt).toLocaleTimeString("fa-IR", { hour: '2-digit', minute: '2-digit' })}
                      </td>
                      <td className="px-6 py-4 text-left">
                        <Link href={`/support/${t._id}`} className="text-blue-400 hover:text-blue-300 flex items-center justify-end gap-1 text-xs">
                          چت با پشتیبان <ArrowUpRight size={14} />
                        </Link>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Mobile Cards */}
          <div className="md:hidden space-y-4">
            {loading ? <CardSkeletonList /> : orderedTickets.length === 0 ? (
              <div className="p-10 border border-dashed border-white/10 rounded-3xl"><EmptyState /></div>
            ) : (
              orderedTickets.map((t) => (
                <Link
                  key={t._id}
                  href={`/support/${t._id}`}
                  className="block p-4 rounded-2xl border border-white/10 bg-[#020617]/60 active:scale-[0.98] transition"
                >
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="text-sm font-bold text-white">{t.subject}</h3>
                    <StatusBadge status={t.status} />
                  </div>
                  <div className="flex justify-between items-end">
                    <div className="space-y-1">
                       <PriorityBadge priority={t.priority} />
                       <p className="text-[10px] text-gray-500">بروزرسانی: {new Date(t.updatedAt).toLocaleDateString("fa-IR")}</p>
                    </div>
                    <span className="text-blue-400 text-xs flex items-center gap-1">گفتگو <ArrowUpRight size={14} /></span>
                  </div>
                </Link>
              ))
            )}
          </div>
        </section>
      </div>
    </div>
  )
}

/* --- Sub-Components (بدون تغییر منطقی، فقط بهینه‌سازی بصری اندک) --- */

function StatCard({ title, value, icon, color }: any) {
  const colors: any = {
    indigo: "text-indigo-400 bg-indigo-400/10",
    emerald: "text-emerald-400 bg-emerald-400/10",
    blue: "text-blue-400 bg-blue-400/10",
    gray: "text-slate-400 bg-slate-400/10",
  }
  return (
    <div className="p-4 rounded-2xl border border-white/10 bg-white/[0.02] relative overflow-hidden">
      <div className={`absolute -right-2 -top-2 opacity-10`}>{icon}</div>
      <p className="text-[11px] text-gray-400 mb-1">{title}</p>
      <div className="flex items-center justify-between">
        <span className="text-2xl font-bold text-white">{value}</span>
        <div className={`p-2 rounded-lg ${colors[color]}`}>{icon}</div>
      </div>
    </div>
  )
}

function StatusBadge({ status }: { status: TicketStatus }) {
  const map: any = {
    OPEN: { label: "باز", class: "text-emerald-400 bg-emerald-400/10 border-emerald-400/20" },
    WAITING_ADMIN: { label: "در انتظار پاسخ", class: "text-blue-400 bg-blue-400/10 border-blue-400/20" },
    WAITING_USER: { label: "پاسخ داده شده", class: "text-amber-400 bg-amber-400/10 border-amber-400/20" },
    CLOSED: { label: "بسته شده", class: "text-slate-400 bg-slate-400/10 border-slate-400/20" },
  }
  return (
    <span className={`px-2 py-1 rounded-full text-[10px] border ${map[status].class}`}>
      {map[status].label}
    </span>
  )
}

function PriorityBadge({ priority }: { priority: TicketPriority }) {
  const map: any = {
    HIGH: { label: "فوری", class: "text-red-400" },
    MEDIUM: { label: "متوسط", class: "text-amber-400" },
    LOW: { label: "معمولی", class: "text-emerald-400" },
  }
  return (
    <span className={`text-[10px] flex items-center gap-1 ${map[priority].class}`}>
      <span className="h-1 w-1 rounded-full bg-current" />
      {map[priority].label}
    </span>
  )
}

function TableSkeletonRows() {
    return <>{[1, 2, 3].map(i => (
        <tr key={i} className="animate-pulse">
            <td className="p-6"><div className="h-4 w-32 bg-white/10 rounded" /></td>
            <td className="p-6"><div className="h-4 w-12 bg-white/10 rounded" /></td>
            <td className="p-6"><div className="h-6 w-20 bg-white/10 rounded-full" /></td>
            <td className="p-6"><div className="h-4 w-24 bg-white/10 rounded" /></td>
            <td className="p-6"><div className="h-4 w-10 bg-white/10 rounded" /></td>
        </tr>
    ))}</>
}

function CardSkeletonList() {
    return <>{[1, 2].map(i => (
        <div key={i} className="p-4 rounded-2xl bg-white/5 animate-pulse h-24" />
    ))}</>
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center gap-4 text-center">
      <div className="p-4 bg-white/5 rounded-full"><Inbox className="text-gray-500" size={32} /></div>
      <div>
        <p className="text-white font-semibold">تیکتی یافت نشد</p>
        <p className="text-xs text-gray-500 mt-1">تاکنون درخواستی ثبت نکرده‌اید.</p>
      </div>
      <Link href="/support/new" className="text-blue-400 text-sm font-bold">ایجاد اولین تیکت</Link>
    </div>
  )
}
