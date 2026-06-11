"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import {
  MessageSquare,
  Search,
  AlertCircle,
  Clock3,
  CheckCircle2,
  ShieldAlert,
} from "lucide-react"

const api =
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/+$/, "") ||
  "http://localhost:5000"


type TicketStatus = "OPEN" | "WAITING_ADMIN" | "WAITING_USER" | "CLOSED"
type TicketPriority = "LOW" | "MEDIUM" | "HIGH"

interface Ticket {
  _id: string
  subject: string
  status: TicketStatus
  priority: TicketPriority
  updatedAt: string
  user: {
    name: string
    email: string
  }
}

export default function AdminSupportPage() {
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")

  useEffect(() => {
    loadTickets()
  }, [])

  async function loadTickets() {
    try {
      setLoading(true)

   const token = localStorage.getItem("accessToken")


      const res = await fetch(`${api}/api/tickets/admin/all`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        cache: "no-store",
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.message || "خطا در دریافت تیکت‌ها")
      }

      if (data.success) {
        setTickets(data.tickets || [])
      }
    } catch (err: any) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const filtered = useMemo(() => {
    return tickets.filter(
      (t) =>
        t.subject.toLowerCase().includes(search.toLowerCase()) ||
        t.user?.name?.toLowerCase().includes(search.toLowerCase()) ||
        t.user?.email?.toLowerCase().includes(search.toLowerCase())
    )
  }, [tickets, search])

  const stats = {
    open: tickets.filter((t) => t.status === "OPEN").length,
    waitingAdmin: tickets.filter((t) => t.status === "WAITING_ADMIN").length,
    waitingUser: tickets.filter((t) => t.status === "WAITING_USER").length,
    closed: tickets.filter((t) => t.status === "CLOSED").length,
  }

  if (loading) {
    return <div className="text-gray-400 p-10">در حال بارگذاری...</div>
  }

  return (
    <div className="space-y-8">

      <div>
        <h1 className="text-2xl font-bold text-white">پشتیبانی</h1>
        <p className="text-sm text-gray-400 mt-1">
          مدیریت تیکت‌های کاربران
        </p>
      </div>

      <div className="grid md:grid-cols-4 gap-6">
        <StatCard title="باز" value={stats.open} icon={<AlertCircle size={18}/>}/>
        <StatCard title="منتظر ادمین" value={stats.waitingAdmin} icon={<ShieldAlert size={18}/>}/>
        <StatCard title="منتظر کاربر" value={stats.waitingUser} icon={<Clock3 size={18}/>}/>
        <StatCard title="بسته شده" value={stats.closed} icon={<CheckCircle2 size={18}/>}/>
      </div>

      <div className="flex items-center bg-white/5 border border-white/10 rounded-lg px-3 py-2 max-w-md">
        <Search size={16} className="text-gray-400 mr-2"/>
        <input
          value={search}
          onChange={(e)=>setSearch(e.target.value)}
          placeholder="جستجوی تیکت..."
          className="bg-transparent flex-1 text-sm text-white placeholder-gray-500 focus:outline-none"
        />
      </div>

      <div className="rounded-xl border border-white/10 bg-[#0f172a] overflow-hidden">
        <table className="min-w-full divide-y divide-white/10 text-sm">
          <thead>
            <tr className="text-gray-400 text-xs">
              <th className="px-5 py-3 text-left">موضوع</th>
              <th className="px-5 py-3 text-left">کاربر</th>
              <th className="px-5 py-3 text-left">وضعیت</th>
              <th className="px-5 py-3 text-left">اولویت</th>
              <th className="px-5 py-3 text-left">آخرین بروزرسانی</th>
              <th className="px-5 py-3 text-left"></th>
            </tr>
          </thead>

          <tbody className="divide-y divide-white/10">
            {filtered.map((t)=>(
              <tr key={t._id} className="hover:bg-white/5 transition">

                <td className="px-5 py-3 text-white">
                  {t.subject}
                </td>

                <td className="px-5 py-3 text-gray-300">
                  {t.user?.name}
                  <p className="text-xs text-gray-500">{t.user?.email}</p>
                </td>

                <td className="px-5 py-3">
                  <StatusBadge status={t.status}/>
                </td>

                <td className="px-5 py-3">
                  <PriorityBadge priority={t.priority}/>
                </td>

                <td className="px-5 py-3 text-gray-400">
                  {new Date(t.updatedAt).toLocaleDateString("fa-IR")}
                </td>

                <td className="px-5 py-3">
                  <Link
                    href={`/admin/support/${t._id}`}
                    className="text-blue-400 text-xs hover:text-blue-300"
                  >
                    مشاهده
                  </Link>
                </td>

              </tr>
            ))}
          </tbody>

        </table>

      </div>

    </div>
  )
}

function StatCard({title,value,icon}:{title:string,value:number,icon:any}){
  return(
    <div className="rounded-xl border border-white/10 bg-[#0f172a] p-4 flex items-center justify-between">
      <div>
        <p className="text-xs text-gray-400">{title}</p>
        <p className="text-xl font-bold text-white mt-1">{value}</p>
      </div>
      <div className="text-gray-400">
        {icon}
      </div>
    </div>
  )
}

function StatusBadge({status}:{status:TicketStatus}){

  const map={
    OPEN:"text-emerald-400 bg-emerald-500/20",
    WAITING_ADMIN:"text-blue-400 bg-blue-500/20",
    WAITING_USER:"text-yellow-400 bg-yellow-500/20",
    CLOSED:"text-gray-400 bg-gray-500/20",
  }

  const label={
    OPEN:"باز",
    WAITING_ADMIN:"منتظر ادمین",
    WAITING_USER:"منتظر کاربر",
    CLOSED:"بسته"
  }

  return(
    <span className={`px-2 py-1 text-xs rounded ${map[status]}`}>
      {label[status]}
    </span>
  )
}

function PriorityBadge({priority}:{priority:TicketPriority}){

  const map={
    HIGH:"text-red-400 bg-red-500/20",
    MEDIUM:"text-yellow-400 bg-yellow-500/20",
    LOW:"text-emerald-400 bg-emerald-500/20"
  }

  const label={
    HIGH:"زیاد",
    MEDIUM:"متوسط",
    LOW:"کم"
  }

  return(
    <span className={`px-2 py-1 text-xs rounded ${map[priority]}`}>
      {label[priority]}
    </span>
  )
}
