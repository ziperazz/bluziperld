"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

export default function Sidebar() {

  const pathname = usePathname()

  const menu = [
    { name: "داشبورد", href: "/admin" },
    { name: "محصولات", href: "/admin/products" },
    { name: "پاکت‌نامه‌ها", href: "/admin/letters" }, // 🆕 اضافه شد
    { name: "سفارشات", href: "/admin/orders" },
    { name: " کامنت ها", href: "/admin/comments" },
    { name: "کاربران", href: "/admin/users" },
    { name: " کد رهگیری", href: "/admin/tracking" },
    { name: "پشتیبانی", href: "/admin/support" },
        { name: " کد تخفیف", href: "/admin/discounts" },
    { name: "مدیریت اعلان ها", href: "/admin/announcements" },
    { name: "🔍 سئو", href: "/admin/seo" },
  ]

  return (
    <div className="h-full flex flex-col p-5 border-r border-slate-800 bg-slate-900/40 text-gray-200 backdrop-blur-md">
      {/* Logo / Title */}
      <div className="text-xl font-bold mb-10 text-center text-white">
        Admin Panel
      </div>

      {/* Menu */}
      <nav className="flex flex-col gap-1">
        {menu.map((item) => {
          const active = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`px-4 py-2 rounded-lg transition-all ${
                active
                  ? "bg-blue-600 text-white shadow-md shadow-blue-500/30"
                  : "hover:bg-slate-800 hover:text-white"
              }`}
            >
              {item.name}
            </Link>
          )
        })}
      </nav>
    </div>
  )
}
