"use client";
import { useEffect, useState } from "react";
import { Sun, Moon } from "lucide-react";

export default function ThemeToggle() {
  const [dark, setDark] = useState(true);

  useEffect(() => {
    const saved = localStorage.getItem("theme");
    if (saved === "light") {
      setDark(false);
      document.documentElement.classList.remove("dark");
      document.documentElement.classList.add("light");
    }
  }, []);

  const toggle = () => {
    const next = !dark;
    setDark(next);
    localStorage.setItem("theme", next ? "dark" : "light");
    
    if (next) {
      document.documentElement.classList.add("dark");
      document.documentElement.classList.remove("light");
    } else {
      document.documentElement.classList.add("light");
      document.documentElement.classList.remove("dark");
    }
  };

  return (
    <button
      onClick={toggle}
      className="w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300
        bg-[var(--btn-glass-bg)] border border-[var(--btn-glass-border)] hover:scale-105"
      title={dark ? "حالت روز" : "حالت شب"}
    >
      {dark ? (
        <Sun size={18} className="text-yellow-400 drop-shadow-[0_0_6px_rgba(250,204,21,0.5)]" />
      ) : (
        <Moon size={18} className="text-blue-600 drop-shadow-[0_0_6px_rgba(59,130,246,0.5)]" />
      )}
    </button>
  );
}