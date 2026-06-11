"use client"

import { useEffect, useRef, useState, useCallback } from "react"
import Link from "next/link"
import {
  Send, Loader2, Lock, Unlock, Check, CheckCheck,
  Clock, User, Shield, X, ChevronDown, AlertCircle,
  ChevronRight, Home, HeadphonesIcon, MessageCircle,
  ArrowRight
} from "lucide-react"

const API = process.env.NEXT_PUBLIC_API_URL?.replace(/\/+$/, "") || "http://localhost:5000"

interface Message {
  _id: string
  senderRole: "USER" | "ADMIN"
  text: string
  createdAt: string
  seen?: boolean
}

interface Ticket {
  _id: string
  subject: string
  status: string
  messages: Message[]
  createdAt: string
}

export default function AdminSupportTicketPage({ params }: { params: { id: string } }) {
  const { id } = params

  const [ticket, setTicket] = useState<Ticket | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState("")
  const [sending, setSending] = useState(false)
  const [showScrollBtn, setShowScrollBtn] = useState(false)
  const [token, setToken] = useState<string | null>(null)
  const [mounted, setMounted] = useState(false)

  const chatRef = useRef<HTMLDivElement>(null)
  const bottomRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const prevLengthRef = useRef(0)
  const isFirstLoadRef = useRef(true)
  const shouldScrollRef = useRef(false)

  useEffect(() => {
    setMounted(true)
    setToken(localStorage.getItem("accessToken"))
  }, [])

  // Scroll handler
  useEffect(() => {
    const container = chatRef.current
    if (!container) return
    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = container
      setShowScrollBtn(scrollHeight - scrollTop - clientHeight > 200)
    }
    container.addEventListener("scroll", handleScroll, { passive: true })
    return () => container.removeEventListener("scroll", handleScroll)
  }, [])

  // Smart auto-scroll
  useEffect(() => {
    if (!chatRef.current || !ticket) return
    const el = chatRef.current
    const currentLength = ticket.messages.length

    if (isFirstLoadRef.current) {
      prevLengthRef.current = currentLength
      isFirstLoadRef.current = false
      setTimeout(() => { el.scrollTop = el.scrollHeight }, 100)
      return
    }

    if (currentLength > prevLengthRef.current) {
      const distFromBottom = el.scrollHeight - el.scrollTop - el.clientHeight
      if (shouldScrollRef.current || distFromBottom < 120) {
        el.scrollTop = el.scrollHeight
      }
    }

    shouldScrollRef.current = false
    prevLengthRef.current = currentLength
  }, [ticket?.messages])

  // Load ticket
  useEffect(() => {
    if (token === null) return
    if (!token) {
      setError("ابتدا وارد پنل ادمین شوید.")
      setLoading(false)
      return
    }

    const load = async () => {
      try {
        const res = await fetch(`${API}/api/tickets/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        const data = await res.json()
        if (data.success) {
          setTicket(data.ticket)
        } else {
          setError("تیکت پیدا نشد")
        }
      } catch {
        setError("خطا در ارتباط با سرور")
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [id, token])

  // Polling
  useEffect(() => {
    if (!token) return
    const interval = setInterval(async () => {
      try {
        const res = await fetch(`${API}/api/tickets/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        const data = await res.json()
        if (data.success) setTicket(data.ticket)
      } catch {}
    }, 3000)
    return () => clearInterval(interval)
  }, [id, token])

  // Send message
  const sendMessage = useCallback(async () => {
    if (!message.trim() || !token) return
    shouldScrollRef.current = true
    setSending(true)
    try {
      const res = await fetch(`${API}/api/tickets/${id}/messages`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ text: message.trim() }),
      })
      const data = await res.json()
      if (data.success) {
        setTicket(data.ticket)
        setMessage("")
        if (textareaRef.current) textareaRef.current.style.height = "auto"
      }
    } finally {
      setSending(false)
    }
  }, [message, token, id])

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }, [sendMessage])

  const scrollToBottom = useCallback(() => {
    chatRef.current?.scrollTo({ top: chatRef.current.scrollHeight, behavior: "smooth" })
  }, [])

  // Toggle status
  const toggleStatus = async () => {
    if (!ticket || !token) return
    const newStatus = ticket.status === "CLOSED" ? "OPEN" : "CLOSED"
    try {
      const res = await fetch(`${API}/api/tickets/admin/${id}/status`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: newStatus }),
      })
      const data = await res.json()
      if (data.success) {
        setTicket({ ...ticket, status: newStatus })
      }
    } catch {}
  }

  if (!mounted || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 size={28} className="text-blue-400 animate-spin" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center">
          <div className="w-16 h-16 rounded-2xl bg-red-500/10 flex items-center justify-center mx-auto mb-4">
            <AlertCircle size={28} className="text-red-400" />
          </div>
          <p className="text-red-400 text-sm font-medium">{error}</p>
          <Link href="/admin/support" className="inline-block mt-4 text-blue-400 text-sm hover:text-blue-300">
            بازگشت به تیکت‌ها
          </Link>
        </div>
      </div>
    )
  }

  if (!ticket) return null

  const isClosed = ticket.status === "CLOSED"

  return (
    <div className="min-h-screen px-4 py-6 md:py-8">
      <div className="max-w-5xl mx-auto h-[85vh] md:h-[80vh] flex flex-col">
        
        {/* ============ BREADCRUMB ============ */}
        <nav className="flex items-center gap-2 text-[10px] md:text-xs text-gray-500 mb-4 shrink-0">
          <Link href="/admin" className="hover:text-blue-400 transition-colors flex items-center gap-1">
            <Home size={11} /> پنل ادمین
          </Link>
          <ChevronRight size={10} />
          <Link href="/admin/support" className="hover:text-blue-400 transition-colors flex items-center gap-1">
            <HeadphonesIcon size={11} /> تیکت‌ها
          </Link>
          <ChevronRight size={10} />
          <span className="text-gray-400 truncate max-w-[150px]">{ticket.subject}</span>
        </nav>

        {/* ============ CHAT BOX ============ */}
        <div
          className="flex-1 flex flex-col rounded-2xl md:rounded-3xl border border-white/[0.06] overflow-hidden shadow-2xl"
          style={{
            background: "rgba(5, 10, 25, 0.8)",
            backdropFilter: "blur(40px) saturate(180%)",
            WebkitBackdropFilter: "blur(40px) saturate(180%)",
          }}
        >
          {/* ============ HEADER ============ */}
          <div className="shrink-0 px-4 md:px-5 py-3 border-b border-white/[0.04] flex items-center justify-between bg-[#050912]/80 backdrop-blur-xl gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-9 h-9 md:w-10 md:h-10 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20 flex items-center justify-center border border-emerald-500/10 shrink-0">
                <Shield size={16} className="text-emerald-400" />
              </div>
              <div className="min-w-0">
                <h3 className="text-sm font-bold text-white truncate">{ticket.subject}</h3>
                <p className="text-[9px] md:text-[10px] text-gray-500 mt-0.5">
                  {ticket.messages.length} پیام
                </p>
              </div>
            </div>

            {/* Toggle Status Button */}
            <button
              onClick={toggleStatus}
              className={`shrink-0 flex items-center gap-1.5 px-3 py-1.5 md:px-4 md:py-2 rounded-xl text-[10px] md:text-xs font-bold transition-all duration-300 hover:scale-105 active:scale-95 ${
                isClosed
                  ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20"
                  : "bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20"
              }`}
            >
              {isClosed ? (
                <>
                  <Unlock size={12} className="md:w-3.5 md:h-3.5" />
                  <span>باز کردن تیکت</span>
                </>
              ) : (
                <>
                  <Lock size={12} className="md:w-3.5 md:h-3.5" />
                  <span>بستن تیکت</span>
                </>
              )}
            </button>
          </div>

          {/* ============ MESSAGES ============ */}
          <div ref={chatRef} className="flex-1 overflow-y-auto px-3 md:px-5 py-4 md:py-5 space-y-3 md:space-y-4">
            {/* Date */}
            <div className="flex items-center justify-center">
              <div className="px-3 py-1 rounded-full bg-white/[0.02] border border-white/[0.03] text-[9px] md:text-[10px] text-gray-600">
                {new Date(ticket.createdAt).toLocaleDateString("fa-IR", { month: "long", day: "numeric" })}
              </div>
            </div>

            {ticket.messages.length === 0 && (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 flex items-center justify-center mb-3">
                  <MessageCircle size={22} className="text-emerald-400" strokeWidth={1.5} />
                </div>
                <p className="text-sm text-gray-400 font-medium">منتظر اولین پیام کاربر باشید</p>
              </div>
            )}

            {ticket.messages.map((msg, i) => {
              const mine = msg.senderRole === "ADMIN"
              const showAvatar = i === 0 || ticket.messages[i - 1]?.senderRole !== msg.senderRole
              const time = msg.createdAt
                ? new Date(msg.createdAt).toLocaleTimeString("fa-IR", { hour: "2-digit", minute: "2-digit" })
                : ""

              return (
                <div key={msg._id} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
                  <div className={`flex items-end gap-2 max-w-[88%] md:max-w-[80%] ${mine ? "flex-row-reverse" : "flex-row"}`}>
                    {showAvatar && (
                      <div className={`w-7 h-7 md:w-8 md:h-8 rounded-xl flex items-center justify-center shrink-0 mb-1 ${
                        mine
                          ? "bg-gradient-to-br from-emerald-500/20 to-teal-500/20"
                          : "bg-gradient-to-br from-blue-500/20 to-cyan-500/20"
                      }`}>
                        {mine ? (
                          <Shield size={12} className="text-emerald-400" />
                        ) : (
                          <User size={12} className="text-blue-400" />
                        )}
                      </div>
                    )}
                    {!showAvatar && <div className="w-7 md:w-8 shrink-0" />}

                    <div className={`px-3 md:px-4 py-2 md:py-2.5 rounded-2xl text-xs md:text-sm leading-6 md:leading-7 ${
                      mine
                        ? "bg-gradient-to-br from-emerald-600 to-teal-600 text-white rounded-br-md"
                        : "bg-white/[0.04] text-gray-200 border border-white/[0.04] rounded-bl-md"
                    }`}>
                      <p className="whitespace-pre-wrap break-words">{msg.text}</p>
                      <div className={`flex items-center gap-1.5 mt-1.5 ${mine ? "justify-end" : "justify-start"}`}>
                        <span className="text-[9px] md:text-[10px] opacity-50">{time}</span>
                        {mine && (msg.seen ? <CheckCheck size={10} className="text-emerald-200 opacity-70" /> : <Check size={10} className="text-white opacity-50" />)}
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}

            <div ref={bottomRef} />
          </div>

          {/* ============ SCROLL BTN ============ */}
          {showScrollBtn && (
            <button onClick={scrollToBottom}
              className="absolute bottom-20 md:bottom-24 left-4 w-9 h-9 rounded-xl bg-white/[0.06] backdrop-blur-xl border border-white/[0.08] flex items-center justify-center text-gray-400 hover:text-white transition-all z-10 shadow-lg"
            >
              <ChevronDown size={16} strokeWidth={2} />
            </button>
          )}

          {/* ============ INPUT ============ */}
          {!isClosed && (
            <div className="shrink-0 p-3 md:p-4 border-t border-white/[0.04] bg-[#050912]/50 backdrop-blur-xl">
              <div className="flex items-end gap-2 md:gap-3">
                <div className="flex-1 relative">
                  <textarea
                    ref={textareaRef}
                    value={message}
                    onChange={(e) => {
                      setMessage(e.target.value)
                      const el = e.target
                      el.style.height = "auto"
                      el.style.height = Math.min(el.scrollHeight, 120) + "px"
                    }}
                    onKeyDown={handleKeyDown}
                    placeholder="پاسخ خود را بنویسید..."
                    rows={1}
                    className="w-full bg-white/[0.03] border border-white/[0.06] rounded-2xl px-3 md:px-4 py-2.5 md:py-3 pr-10 text-xs md:text-sm text-white placeholder:text-gray-600 focus:border-emerald-500/30 focus:bg-white/[0.05] outline-none transition-all resize-none max-h-[120px] leading-6"
                  />
                </div>
                <button
                  onClick={sendMessage}
                  disabled={!message.trim() || sending}
                  className={`shrink-0 w-10 h-10 md:w-11 md:h-11 rounded-2xl flex items-center justify-center transition-all duration-300 ${
                    message.trim() && !sending
                      ? "bg-gradient-to-br from-emerald-600 to-teal-600 text-white shadow-lg shadow-emerald-500/30 hover:scale-105 active:scale-95"
                      : "bg-white/[0.04] text-gray-600 cursor-not-allowed"
                  }`}
                >
                  {sending ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} strokeWidth={2} />}
                </button>
              </div>
              <p className="text-[8px] md:text-[9px] text-gray-600 text-center mt-2">
                Enter برای ارسال • Shift + Enter برای خط جدید
              </p>
            </div>
          )}

          {/* ============ CLOSED ============ */}
          {isClosed && (
            <div className="shrink-0 p-6 text-center border-t border-white/[0.04] bg-[#050912]/50">
              <div className="w-10 h-10 rounded-2xl bg-red-500/10 flex items-center justify-center mx-auto mb-3">
                <Lock size={18} className="text-red-400" />
              </div>
              <p className="text-sm text-gray-400 font-medium">این تیکت بسته شده است</p>
              <p className="text-[11px] text-gray-600 mt-1">برای ارسال پیام جدید، تیکت را باز کنید</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}