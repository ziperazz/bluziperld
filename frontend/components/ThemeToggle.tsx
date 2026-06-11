"use client"

import { Sun, Moon } from "lucide-react"
import { useTheme } from "./ThemeProvider"

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme()

  return (
    <button
      onClick={toggleTheme}
      className="relative w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-500 hover:scale-110 active:scale-90 bg-gray-200 dark:bg-white/[0.04] border border-gray-300 dark:border-white/[0.06] text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-300 dark:hover:bg-white/[0.08]"
      aria-label={theme === "dark" ? "حالت روشن" : "حالت تاریک"}
    >
      <div className="relative w-5 h-5">
        <Sun size={20} className={`absolute inset-0 text-amber-500 transition-all duration-500 ${theme === "dark" ? "opacity-100 rotate-0 scale-100" : "opacity-0 rotate-90 scale-0"}`} />
        <Moon size={20} className={`absolute inset-0 text-blue-500 transition-all duration-500 ${theme === "light" ? "opacity-100 rotate-0 scale-100" : "opacity-0 -rotate-90 scale-0"}`} />
      </div>
    </button>
  )
}