"use client"

import { useState, useEffect, useCallback, useMemo } from "react"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { LogOut, Clock, LayoutDashboard, Zap } from "lucide-react"

interface HeaderProps {
  username?: string
  onLogout?: () => void
}

export default function Header({ username, onLogout }: HeaderProps) {
  const [currentTime, setCurrentTime] = useState<Date>(new Date())
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const [isTimeVisible, setIsTimeVisible] = useState(true)
  const router = useRouter()

  // بروزرسانی زمان با مموایز برای عملکرد بهتر
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  // فرمت زمان فارسی با بهینه‌سازی
  const formattedTime = useMemo(() => {
    return currentTime.toLocaleTimeString("fa-IR", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    })
  }, [currentTime])

  // مدیریت خروج با حالت بارگذاری
  const handleLogout = useCallback(async () => {
    try {
      setIsLoggingOut(true)
      
      // تأخیر کوچک برای انیمیشن خروج
      await new Promise((resolve) => setTimeout(resolve, 300))
      
      // فراخوانی تابع خروج سفارشی یا رفتار پیش‌فرض
      if (onLogout) {
        await onLogout()
      } else {
        // پاک‌سازی توکن‌های احراز هویت
        localStorage.removeItem("auth-token")
        sessionStorage.clear()
        router.push("/")
      }
    } catch (error) {
      console.error("خطا در خروج:", error)
      setIsLoggingOut(false)
    }
  }, [onLogout, router])

  // تغییر وضعیت نمایش ساعت
  const toggleTimeVisibility = useCallback(() => {
    setIsTimeVisible((prev) => !prev)
  }, [])

  return (
    <motion.header
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ type: "spring", stiffness: 100, damping: 20 }}
      className="relative flex items-center justify-between h-16 px-6 lg:px-8 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white shadow-2xl select-none backdrop-blur-sm"
      dir="rtl"
    >
      {/* افکت شیشه‌ای */}
      <div className="absolute inset-0 bg-white/5 backdrop-blur-md" />

      {/* بخش راست: لوگو و عنوان */}
      <motion.div
        whileHover={{ scale: 1.02 }}
        className="relative flex items-center gap-3"
      >
        <LayoutDashboard className="w-5 h-5 text-blue-400" strokeWidth={2} />
        <div className="hidden sm:block">
          <h2 className="text-lg font-semibold tracking-tight bg-gradient-to-r from-blue-400 to-cyan-300 bg-clip-text text-transparent">
            پنل مدیریت
          </h2>
          {username && (
            <p className="text-xs text-slate-400 -mt-1">خوش آمدید، {username}</p>
          )}
        </div>
      </motion.div>

      {/* بخش وسط: پیام برند */}
      <div className="relative flex-grow text-center hidden md:block">
        <motion.div
          initial={{ scale: 0.9 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 200 }}
        >
          <h1 className="inline-flex items-center gap-2 text-xl lg:text-2xl font-extrabold tracking-tight">
            <Zap className="w-6 h-6 text-yellow-400 animate-pulse" />
            <span className="bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
              بزن بریم که کارها رو انجام بدیم
            </span>
            <motion.span
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ repeat: Infinity, duration: 2 }}
              className="text-2xl"
            >
              🚀
            </motion.span>
          </h1>
        </motion.div>
      </div>

      {/* بخش چپ: ساعت و دکمه خروج */}
      <div className="relative flex items-center gap-4 lg:gap-6">
        {/* ساعت زنده با قابلیت مخفی‌سازی */}
        <motion.button
          onClick={toggleTimeVisibility}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 transition-colors border border-white/20"
          aria-label="نمایش یا مخفی کردن ساعت"
        >
          <Clock className="w-4 h-4 text-slate-300" />
          <AnimatePresence mode="wait">
            {isTimeVisible && (
              <motion.span
                initial={{ width: 0, opacity: 0 }}
                animate={{ width: "auto", opacity: 1 }}
                exit={{ width: 0, opacity: 0 }}
                className="tabular-nums text-sm font-mono tracking-wider overflow-hidden whitespace-nowrap"
              >
                {formattedTime}
              </motion.span>
            )}
          </AnimatePresence>
        </motion.button>

        {/* دکمه خروج */}
        <motion.button
          onClick={handleLogout}
          disabled={isLoggingOut}
          whileHover={{ scale: 1.05, boxShadow: "0 0 20px rgba(239, 68, 68, 0.4)" }}
          whileTap={{ scale: 0.95 }}
          className={`
            relative flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm
            transition-all duration-300
            ${isLoggingOut
              ? "bg-red-800 cursor-not-allowed"
              : "bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-400"
            }
            shadow-lg hover:shadow-red-500/25
          `}
          aria-label="خروج از پنل مدیریت"
        >
          {isLoggingOut ? (
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
              className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full"
            />
          ) : (
            <LogOut className="w-4 h-4" />
          )}
          <span className="hidden sm:inline">
            {isLoggingOut ? "در حال خروج..." : "خروج"}
          </span>
        </motion.button>
      </div>
    </motion.header>
  )
}