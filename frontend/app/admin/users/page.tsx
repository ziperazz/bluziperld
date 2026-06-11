"use client"

import React, { useEffect, useState } from "react"
import { Search, Trash2, ChevronDown, ChevronUp } from "lucide-react"
import { useRouter } from "next/navigation"

type Order = {
  trackingCode: string
  total?: number
  status?: string
  createdAt?: string
}


type User = {
  _id: string
  name?: string
  mobile: string
  orders?: Order[]
}

const API =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"

export default function AdminUsers() {
  const router = useRouter()
  const [users, setUsers] = useState<User[]>([])
  const [search, setSearch] = useState("")
  const [loading, setLoading] = useState(false)
  const [openUser, setOpenUser] = useState<string | null>(null)

  const fetchUsers = async (query = "") => {
    try {
      setLoading(true)

      const accessToken = localStorage.getItem("accessToken")

      if (!accessToken) {
        router.push("/auth")
        return
      }

      const res = await fetch(
        `${API}/api/admin/users?search=${encodeURIComponent(query)}`,
        {
          credentials: "include",
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      )

      if (res.status === 401) {
        router.push("/auth")
        return
      }

      const data = await res.json()

      if (!data.success) {
        setUsers([])
        return
      }

      const usersWithOrders = await Promise.all(
        data.users.map(async (user: User) => {
          try {
            const resOrders = await fetch(
              `${API}/api/admin/users/${user._id}/orders`,
              {
                credentials: "include",
                headers: {
                  Authorization: `Bearer ${accessToken}`,
                },
              }
            )

            if (resOrders.status === 401) {
              router.push("/auth")
              return { ...user, orders: [] }
            }

            const ordersData = await resOrders.json()

            return {
              ...user,
              orders: ordersData.orders || [],
            }
          } catch {
            return {
              ...user,
              orders: [],
            }
          }
        })
      )

      setUsers(usersWithOrders)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchUsers(search)
    }, 400)

    return () => clearTimeout(timer)
  }, [search])

  const deleteUser = async (id: string) => {
    if (!confirm("آیا از حذف این کاربر مطمئن هستید؟")) return

    const accessToken = localStorage.getItem("accessToken")

    if (!accessToken) {
      router.push("/auth")
      return
    }

    const res = await fetch(`${API}/api/admin/users/${id}`, {
      method: "DELETE",
      credentials: "include",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    })

    if (res.status === 401) {
      router.push("/auth")
      return
    }

    const data = await res.json()

    if (data.success) {
      setUsers((prev) => prev.filter((u) => u._id !== id))
    }
  }

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold text-white">مدیریت کاربران</h1>

      <div className="relative max-w-sm">
        <Search size={16} className="absolute left-3 top-3 text-gray-400" />
        <input
          type="text"
          placeholder="جستجوی نام یا شماره..."
          className="w-full bg-[#0f172a] border border-white/10 rounded-lg pl-9 pr-3 py-2 text-sm text-white outline-none"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="rounded-xl border border-white/10 bg-[#0f172a] overflow-hidden">
        <table className="w-full text-sm text-gray-300">
          <thead className="border-b border-white/10 text-gray-400">
            <tr>
              <th className="p-4 text-right">نام</th>
              <th className="p-4 text-right">موبایل</th>
              <th className="p-4 text-right">تعداد سفارش</th>
              <th className="p-4 text-right">شناسه کاربر</th>
              <th className="p-4 text-right">عملیات</th>
            </tr>
          </thead>

          <tbody>
            {loading && (
              <tr>
                <td colSpan={5} className="p-6 text-center text-gray-400">
                  در حال بارگذاری...
                </td>
              </tr>
            )}

            {!loading && users.length === 0 && (
              <tr>
                <td colSpan={5} className="p-6 text-center text-gray-500">
                  کاربری پیدا نشد
                </td>
              </tr>
            )}

            {!loading &&
              users.map((user) => (
                <React.Fragment key={user._id}>
                  <tr className="border-b border-white/5 hover:bg-white/5">
                    <td className="p-4">{user.name || "بدون نام"}</td>
                    <td className="p-4">{user.mobile}</td>

                    <td className="p-4">
                      <button
                        onClick={() =>
                          setOpenUser(openUser === user._id ? null : user._id)
                        }
                        className="flex items-center gap-2 text-blue-400 hover:text-blue-300"
                        aria-expanded={openUser === user._id}
                        aria-controls={`orders-${user._id}`}
                      >
                        {user.orders?.length || 0}
                        {openUser === user._id ? (
                          <ChevronUp size={16} />
                        ) : (
                          <ChevronDown size={16} />
                        )}
                      </button>
                    </td>

                    <td className="p-4 text-xs text-gray-500">{user._id}</td>

                    <td className="p-4">
                      <button
                        onClick={() => deleteUser(user._id)}
                        className="flex items-center gap-1 text-red-400 hover:text-red-300"
                      >
                        <Trash2 size={16} />
                        حذف
                      </button>
                    </td>
                  </tr>

                  {openUser === user._id && (
                    <tr id={`orders-${user._id}`} className="bg-black/20">
                      <td colSpan={5} className="p-4">
                        <div className="flex flex-wrap gap-2">
                          {user.orders && user.orders.length > 0 ? (
                            user.orders.map((order, idx) => (
                              <span
                                key={`${order.trackingCode}-${idx}`}
                                className="px-3 py-1 text-xs bg-purple-500/20 text-purple-300 rounded-md border border-purple-500/30"
                              >
                                {order.trackingCode || "بدون شماره رهگیری"}
                              </span>
                            ))
                          ) : (
                            <span className="text-gray-500 text-sm">
                              این کاربر سفارشی ندارد
                            </span>
                          )}
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
