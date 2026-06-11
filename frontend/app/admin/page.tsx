"use client"

import { useEffect, useState } from "react"
import {
  ArrowUpRight,
  Package,
  ShoppingCart,
  Users,
  DollarSign,
} from "lucide-react"

import SalesChart from "./components/SalesChart"
import ActivityFeed from "./components/ActivityFeed"

const api =
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/+$/, "") ||
  "http://localhost:5000"


const toFaNumber = (num: number | string) => {
  if (num === undefined || num === null) return "۰"
  return Number(num).toLocaleString("fa-IR")
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<any>(null)
  const [orders, setOrders] = useState<any[]>([])
  const [products, setProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
       const token = localStorage.getItem("accessToken")


        const headers = {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        }

        const statsRes = await fetch(
  `${api}/api/dashboard/stats`,
  { headers }
)


        const statsData = await statsRes.json()

        if (statsData?.success) {
          setStats(statsData.stats)
        }

        const ordersRes = await fetch(
  `${api}/api/orders?limit=4`,
  { headers }
)


        const ordersData = await ordersRes.json()

        if (ordersData?.success) {
          setOrders(ordersData.orders || [])
        }

        const productsRes = await fetch(
  `${api}/api/dashboard/products/top`,
  { headers }
)


        const productsData = await productsRes.json()

        if (productsData?.success) {
          setProducts(productsData.products || [])
        }
      } catch (error) {
        console.error("Dashboard fetch error:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchDashboardData()
  }, [])

  if (loading) {
    return (
      <div className="text-gray-400 text-sm">
        در حال بارگذاری داشبورد...
      </div>
    )
  }

  const statCards = [
    {
      title: "درآمد امروز",
      value: toFaNumber(Number(stats?.todayRevenue || 0)),
      change: `${stats?.revenueChange > 0 ? "+" : ""}${stats?.revenueChange || 0}%`,
      icon: DollarSign,
      color: "from-emerald-500/20 to-emerald-500/5",
    },
    {
      title: "سفارشات",
      value: toFaNumber(Number(stats?.totalOrders || 0)),
      change: `${stats?.ordersChange > 0 ? "+" : ""}${stats?.ordersChange || 0}%`,
      icon: ShoppingCart,
      color: "from-blue-500/20 to-blue-500/5",
    },
    {
      title: "کاربران",
      value: toFaNumber(Number(stats?.totalUsers || 0)),
      change: `${stats?.usersChange > 0 ? "+" : ""}${stats?.usersChange || 0}%`,
      icon: Users,
      color: "from-violet-500/20 to-violet-500/5",
    },
    {
      title: "محصولات",
      value: toFaNumber(Number(stats?.totalProducts || 0)),
      change: `${stats?.productsChange > 0 ? "+" : ""}${stats?.productsChange || 0}%`,
      icon: Package,
      color: "from-orange-500/20 to-orange-500/5",
    },
  ]

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white">داشبورد</h1>
        <p className="text-sm text-gray-400 mt-1">
          نمای کلی از عملکرد فروشگاه
        </p>
      </div>

      {/* stat cards */}
      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
        {statCards.map((stat) => {
          const Icon = stat.icon

          return (
            <div
              key={stat.title}
              className="group relative overflow-hidden rounded-xl border border-white/10 bg-gradient-to-b p-5 backdrop-blur transition hover:scale-[1.02] hover:border-white/20"
            >
              <div
                className={`absolute inset-0 bg-gradient-to-br ${stat.color}`}
              />

              <div className="relative flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">{stat.title}</p>

                  <p className="text-xl font-semibold text-white mt-1">
                    {stat.value}
                  </p>

                  <p className="text-xs text-emerald-400 mt-2 flex items-center gap-1">
                    {stat.change}
                    <ArrowUpRight size={14} />
                  </p>
                </div>

                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/5 text-white">
                  <Icon size={18} />
                </div>
              </div>
            </div>
          )
        })}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <SalesChart />
        </div>

        <ActivityFeed />
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* recent orders */}
        <div className="rounded-xl border border-white/10 bg-[#0f172a] p-6">
          <h2 className="text-white font-semibold mb-4">
            سفارشات اخیر
          </h2>

          <div className="space-y-3">
            {orders.map((order) => {
              const isSuccess = [
                "PAID",
                "SUCCESS",
                "DELIVERED",
                "COMPLETED",
                "SHIPPED",
              ].includes(order.status)

              return (
                <div
                  key={order._id}
                  className="flex items-center justify-between rounded-lg bg-white/5 px-4 py-3 hover:bg-white/10 transition"
                >
                  <div>
                    <p className="text-sm text-white">
                      {order.user?.name || order.user?.mobile || "کاربر"}
                    </p>

                    <p className="text-xs text-gray-400">
                      {order.trackingCode}
                    </p>
                  </div>

                  <div className="text-sm text-white">
                    {toFaNumber(order.total)}
                  </div>

                  <div>
                    {isSuccess ? (
                      <span className="text-xs px-2 py-1 rounded bg-emerald-500/20 text-emerald-400">
                        پرداخت شده
                      </span>
                    ) : (
                      <span className="text-xs px-2 py-1 rounded bg-yellow-500/20 text-yellow-400">
                        در حال بررسی
                      </span>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* top products */}
        <div className="rounded-xl border border-white/10 bg-[#0f172a] p-6">
          <h2 className="text-white font-semibold mb-4">
            محصولات پرفروش
          </h2>

          <div className="space-y-4">
            {products.map((p) => (
              <div
                key={p._id}
                className="flex items-center justify-between"
              >
                <div>
                  <p className="text-sm text-white">{p.title}</p>

                  <p className="text-xs text-gray-400">
                    {toFaNumber(p.purchaseCount)} فروش
                  </p>
                </div>

                <div className="text-sm text-gray-300">
                  {toFaNumber(p.price)}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
