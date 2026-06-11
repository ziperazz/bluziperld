"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { ShoppingCart, Trash2, Plus, Minus, X } from "lucide-react"
import Link from "next/link"

export default function CartDropdown() {
  const [open, setOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const [cart, setCart] = useState<any[]>([])

  const loadCart = useCallback(() => {
    const saved = JSON.parse(localStorage.getItem("cart") || "[]")
    setCart(saved)
  }, [])

  useEffect(() => { loadCart() }, [loadCart])

  useEffect(() => {
    const handler = () => loadCart()
    window.addEventListener("cart-updated", handler)
    return () => window.removeEventListener("cart-updated", handler)
  }, [loadCart])

  const closeDropdown = useCallback(() => setOpen(false), [])

  const changeQty = (productId: string, delta: number) => {
    const updated = cart.map(i =>
      i.productId === productId ? { ...i, quantity: Math.max(1, i.quantity + delta) } : i
    )
    setCart(updated)
    localStorage.setItem("cart", JSON.stringify(updated))
    window.dispatchEvent(new Event("cart-updated"))
  }

  const removeItem = (productId: string) => {
    const updated = cart.filter(i => i.productId !== productId)
    setCart(updated)
    localStorage.setItem("cart", JSON.stringify(updated))
    window.dispatchEvent(new Event("cart-updated"))
  }

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) closeDropdown()
    }
    document.addEventListener("mousedown", handleClick)
    return () => document.removeEventListener("mousedown", handleClick)
  }, [closeDropdown])

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => { if (e.key === "Escape") closeDropdown() }
    document.addEventListener("keydown", handleEsc)
    return () => document.removeEventListener("keydown", handleEsc)
  }, [closeDropdown])

  const totalQty = cart.reduce((a, b) => a + b.quantity, 0)
  const totalPrice = cart.reduce((a, b) => a + b.quantity * b.price, 0)

  return (
    <div className="relative" ref={containerRef}>
      {/* Trigger Button */}
      <button
        onClick={() => setOpen(o => !o)}
        className="relative flex items-center cursor-pointer hover:opacity-80 transition"
        aria-label="سبد خرید"
      >
        <ShoppingCart size={21} className="text-gray-200" />
        {totalQty > 0 && (
          <span
            className="absolute -top-1 -right-2 text-[10px] px-1.5 py-[1px] rounded-full text-white font-bold"
            style={{
              background: "linear-gradient(135deg,#2563eb,#3b82f6)",
              boxShadow: "0 0 6px rgba(37,99,235,0.45)",
              minWidth: "18px",
              textAlign: "center",
            }}
          >
            {totalQty > 99 ? "99+" : totalQty}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {open && (
        <>
          <div className="fixed inset-0 z-40 md:hidden" onClick={closeDropdown} />

          <div
            className="absolute top-full left-0 mt-2 w-72 sm:w-80 max-h-[420px] flex flex-col rounded-2xl p-4 shadow-2xl z-50 animate-fade-in"
            style={{
              background: "rgba(10,12,18,0.95)",
              backdropFilter: "blur(40px) saturate(180%)",
              WebkitBackdropFilter: "blur(40px) saturate(180%)",
              border: "1px solid rgba(255,255,255,0.08)",
              boxShadow: "0 20px 60px -10px rgba(0,0,0,0.8), 0 0 0 1px rgba(255,255,255,0.03) inset",
            }}
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-3">
              <p className="text-white text-xs font-bold">
                سبد خرید
                {totalQty > 0 && <span className="text-gray-500 font-normal mr-1">({totalQty})</span>}
              </p>
              <button onClick={closeDropdown} className="p-1 rounded-lg hover:bg-white/[0.06] text-gray-500 hover:text-white transition-all">
                <X size={14} strokeWidth={1.5} />
              </button>
            </div>

            {/* Items */}
            <div className="flex-1 overflow-y-auto pr-1 space-y-3 custom-scrollbar">
              {cart.length === 0 && (
                <div className="text-center py-8">
                  <ShoppingCart size={32} className="mx-auto text-gray-700 mb-2" />
                  <p className="text-gray-500 text-sm">سبد خرید خالی است</p>
                  <p className="text-gray-600 text-[10px] mt-1">نامه ات رو بنویس و اضافه کن جیگر</p>
                </div>
              )}

              {cart.map(item => (
                <div
                  key={`${item.productId}-${item.writingType || "product"}-${item.letterText?.slice(0, 10) || ""}`}
                  className="flex items-center gap-3 pb-3 border-b border-white/[0.04] last:border-0 last:pb-0"
                >
                  <Link
                    href={item.productType === "letter" ? `/letters/${item.productId}` : `/products/${item.productId}`}
                    onClick={closeDropdown}
                    className="shrink-0"
                  >
                    <img
                      src={item.image || "/placeholder.png"}
                      className="w-12 h-12 rounded-xl object-cover border border-white/[0.06] hover:border-blue-500/30 transition-all"
                      alt={item.title}
                      onError={(e) => { (e.currentTarget as HTMLImageElement).src = "/placeholder.png" }}
                    />
                  </Link>

                  <div className="flex-1 min-w-0">
                    <Link
                      href={item.productType === "letter" ? `/letters/${item.productId}` : `/products/${item.productId}`}
                      onClick={closeDropdown}
                      className="text-white text-xs font-medium hover:text-blue-400 transition-colors line-clamp-1 block"
                    >
                      {item.title}
                    </Link>

                    {item.productType === "letter" && item.letterText && (
                      <p className="text-[10px] text-gray-500 mt-0.5 truncate">متن: {item.letterText.slice(0, 20)}...</p>
                    )}

                    {item.writingType && (
                      <span className="text-[9px] text-blue-400/60 mt-0.5 block">
                        {item.writingType === "HAND" ? "دست‌نویس" : "چاپ"}
                      </span>
                    )}

                    <div className="flex items-center gap-2 mt-1.5">
                      <button onClick={() => changeQty(item.productId, -1)} className="w-6 h-6 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] flex items-center justify-center text-gray-400 hover:text-white transition-all">
                        <Minus size={11} strokeWidth={2} />
                      </button>
                      <span className="text-white text-xs font-bold min-w-[16px] text-center">{item.quantity}</span>
                      <button onClick={() => changeQty(item.productId, +1)} className="w-6 h-6 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] flex items-center justify-center text-gray-400 hover:text-white transition-all">
                        <Plus size={11} strokeWidth={2} />
                      </button>
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-1.5 shrink-0">
                    <span className="text-blue-400 text-xs font-bold whitespace-nowrap">
                      {(item.quantity * item.price).toLocaleString()}
                      <span className="text-[9px] text-gray-500 font-normal mr-0.5">ت</span>
                    </span>
                    <button onClick={() => removeItem(item.productId)} className="p-1 rounded-lg hover:bg-red-500/10 text-gray-500 hover:text-red-400 transition-all">
                      <Trash2 size={13} strokeWidth={1.5} />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Footer */}
            {cart.length > 0 && (
              <div className="pt-3 mt-3 border-t border-white/[0.06]">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs text-gray-400">جمع کل</span>
                  <span className="text-sm font-black text-white">
                    {totalPrice.toLocaleString()}
                    <span className="text-[10px] text-gray-500 font-normal mr-1">تومان</span>
                  </span>
                </div>

                <Link
                  href="/cart"
                  onClick={closeDropdown}
                  className="w-full py-2.5 rounded-xl text-xs font-bold text-white text-center flex items-center justify-center gap-2 transition-all hover:scale-[1.02] active:scale-95"
                  style={{
                    background: "linear-gradient(135deg,#2563eb,#3b82f6)",
                    boxShadow: "0 4px 15px rgba(37,99,235,0.3)",
                  }}
                >
                  <ShoppingCart size={14} />
                  مشاهده سبد خرید
                </Link>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}