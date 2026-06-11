"use client"

import { useEffect, useRef, useState, useCallback } from "react"
import {
  Send, Loader2, Wifi, WifiOff, Check, CheckCheck,
  Clock, User, Shield, X, ChevronDown, AlertCircle
} from "lucide-react"

const api = process.env.NEXT_PUBLIC_API_URL?.replace(/\/+$/, "") || "http://localhost:5000"

type Sender = "user" | "admin"

interface Message {
  _id?: string
  sender: Sender
  message: string
  createdAt: string
  seen?: boolean
}

interface Props {
  ticketId: string
  status: string
  token: string
  role: Sender
  adminOnline?: boolean
  refreshInterval?: number
}

export default function TicketChatUltra({
  ticketId,
  status,
  token,
  role,
  adminOnline = false,
  refreshInterval = 3000,
}: Props) {
  const [isClient, setIsClient] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [text, setText] = useState("")
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [connectionOK, setConnectionOK] = useState(true)
  const [isTyping, setIsTyping] = useState(false)
  const [showScrollBtn, setShowScrollBtn] = useState(false)

  const bottomRef = useRef<HTMLDivElement | null>(null)
  const chatContainerRef = useRef<HTMLDivElement | null>(null)
  const textareaRef = useRef<HTMLTextAreaElement | null>(null)

  useEffect(() => setIsClient(true), [])

  const fetchMessages = useCallback(async () => {
    try {
      const res = await fetch(`${api}/api/tickets/${ticketId}`, {
        headers: { Authorization: `Bearer ${token}` },
        cache: "no-store",
      })
      const data = await res.json()
      if (data.success) {
        setMessages(data.ticket.messages)
        setConnectionOK(true)
      } else {
        setConnectionOK(false)
      }
    } catch {
      setConnectionOK(false)
    } finally {
      setLoading(false)
    }
  }, [ticketId, token])

  useEffect(() => {
    let isMounted = true
    fetchMessages().then(() => {
      if (isMounted) scrollToBottom()
    })
    const interval = setInterval(fetchMessages, refreshInterval)
    return () => {
      isMounted = false
      clearInterval(interval)
    }
  }, [fetchMessages, refreshInterval])

  const scrollToBottom = useCallback(() => {
    setTimeout(() => {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" })
    }, 100)
  }, [])

  useEffect(() => {
    const container = chatContainerRef.current
    if (!container) return
    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = container
      setShowScrollBtn(scrollHeight - scrollTop - clientHeight > 200)
    }
    container.addEventListener("scroll", handleScroll, { passive: true })
    return () => container.removeEventListener("scroll", handleScroll)
  }, [])

  const sendMessage = useCallback(async () => {
    if (!text.trim() || sending) return
    setSending(true)
    try {
      const res = await fetch(`${api}/api/tickets/${ticketId}/messages`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message: text.trim() }),
      })
      const data = await res.json()
      if (data.success) {
        setMessages(data.ticket.messages)
        setText("")
        scrollToBottom()
        if (textareaRef.current) {
          textareaRef.current.style.height = "auto"
        }
      }
    } catch {
      // silent
    } finally {
      setSending(false)
    }
  }, [text, sending, ticketId, token, scrollToBottom])

  const handleTextareaChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setText(e.target.value)
    const el = e.target
    el.style.height = "auto"
    el.style.height = Math.min(el.scrollHeight, 150) + "px"
  }, [])

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }, [sendMessage])

  if (!isClient) {
    return (
      <div className="h-full flex items-center justify-center bg-[#030712]">
        <Loader2 size={24} className="text-blue-400 animate-spin" />
      </div>
    )
  }

  const isClosed = status === "CLOSED"

  return (
    <div className="h-full flex flex-col bg-[#030712] relative overflow-hidden">
      {/* HEADER */}
      <div className="shrink-0 px-4 py-3 border-b border-white/[0.04] flex items-center justify-between bg-[#050912]/80 backdrop-blur-xl">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-blue-500/20 to-cyan-500/20 flex items-center justify-center border border-blue-500/10">
              <Shield size={18} className="text-blue-400" />
            </div>
            <div className={`absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 border-[#050912] ${adminOnline ? "bg-green-400" : "bg-gray-500"}`} />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">پشتیبانی BluZiperld</h3>
            <div className="flex items-center gap-1.5 mt-0.5">
              {adminOnline ? (
                <>
                  <Wifi size={10} className="text-green-400" />
                  <span className="text-[10px] text-green-400 font-medium">آنلاین</span>
                </>
              ) : (
                <>
                  <Clock size={10} className="text-gray-500" />
                  <span className="text-[10px] text-gray-500">پاسخگویی ۹ صبح تا ۹ شب</span>
                </>
              )}
            </div>
          </div>
        </div>
        <div className={`px-3 py-1.5 rounded-xl text-[10px] font-bold ${isClosed ? "bg-red-500/10 text-red-400 border border-red-500/20" : "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"}`}>
          {isClosed ? "بسته شده" : "فعال"}
        </div>
      </div>

      {/* MESSAGES */}
      <div ref={chatContainerRef} className="flex-1 overflow-y-auto px-4 py-6 space-y-4">
        {/* Date */}
        <div className="flex items-center justify-center">
          <div className="px-4 py-1 rounded-full bg-white/[0.03] border border-white/[0.04] text-[10px] text-gray-600">
            {new Date().toLocaleDateString("fa-IR", { month: "long", day: "numeric" })}
          </div>
        </div>

        {loading && (
          <div className="flex items-center justify-center py-8">
            <Loader2 size={20} className="text-blue-400 animate-spin" />
          </div>
        )}

        {!loading && messages.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-16 h-16 rounded-2xl bg-blue-500/10 flex items-center justify-center mb-4">
              <Send size={24} className="text-blue-400" strokeWidth={1.5} />
            </div>
            <p className="text-sm text-gray-400 font-medium">گفتگو را شروع کنید</p>
            <p className="text-[11px] text-gray-600 mt-1">پیام خود را بنویسید و ارسال کنید</p>
          </div>
        )}

        {messages.map((msg, i) => {
          const mine = msg.sender === role
          const showAvatar = i === 0 || messages[i - 1]?.sender !== msg.sender
          const time = msg.createdAt
            ? new Date(msg.createdAt).toLocaleTimeString("fa-IR", { hour: "2-digit", minute: "2-digit" })
            : ""

          return (
            <div key={msg._id || i} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
              <div className={`flex items-end gap-2 max-w-[85%] ${mine ? "flex-row-reverse" : "flex-row"}`}>
                {!mine && showAvatar && (
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-500/20 to-cyan-500/20 flex items-center justify-center shrink-0 mb-1">
                    <Shield size={14} className="text-blue-400" />
                  </div>
                )}
                {mine && showAvatar && (
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-violet-500/20 to-purple-500/20 flex items-center justify-center shrink-0 mb-1">
                    <User size={14} className="text-violet-400" />
                  </div>
                )}
                {!showAvatar && <div className="w-8 shrink-0" />}

                <div className={`px-4 py-2.5 rounded-2xl text-sm leading-7 ${
                  mine
                    ? "bg-gradient-to-br from-blue-600 to-blue-500 text-white rounded-br-md"
                    : "bg-white/[0.04] text-gray-200 border border-white/[0.04] rounded-bl-md"
                }`}>
                  <p className="whitespace-pre-wrap break-words">{msg.message}</p>
                  <div className={`flex items-center gap-1.5 mt-1.5 ${mine ? "justify-end" : "justify-start"}`}>
                    <span className="text-[10px] opacity-50">{time}</span>
                    {mine && (msg.seen ? <CheckCheck size={12} className="text-blue-200 opacity-70" /> : <Check size={12} className="text-white opacity-50" />)}
                  </div>
                </div>
              </div>
            </div>
          )
        })}

        {isTyping && (
          <div className="flex justify-start">
            <div className="flex items-end gap-2">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-500/20 to-cyan-500/20 flex items-center justify-center">
                <Shield size={14} className="text-blue-400" />
              </div>
              <div className="px-4 py-3 rounded-2xl rounded-bl-md bg-white/[0.04] border border-white/[0.04]">
                <div className="flex gap-1">
                  {[0, 1, 2].map(i => (
                    <div key={i} className="w-2 h-2 rounded-full bg-blue-400 animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Scroll to Bottom */}
      {showScrollBtn && (
        <button onClick={scrollToBottom} className="absolute bottom-24 left-4 w-10 h-10 rounded-xl bg-white/[0.06] backdrop-blur-xl border border-white/[0.08] flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/[0.1] transition-all z-10 shadow-lg">
          <ChevronDown size={18} strokeWidth={2} />
        </button>
      )}

      {/* Connection Warning */}
      {!connectionOK && (
        <div className="shrink-0 px-4 py-2 bg-amber-500/10 border-t border-amber-500/20 flex items-center justify-center gap-2">
          <AlertCircle size={12} className="text-amber-400" />
          <span className="text-[10px] text-amber-400">تلاش برای اتصال مجدد...</span>
        </div>
      )}

      {/* Input */}
      {!isClosed && (
        <div className="shrink-0 p-4 border-t border-white/[0.04] bg-[#050912]/50 backdrop-blur-xl">
          <div className="flex items-end gap-3">
            <div className="flex-1 relative">
              <textarea
                ref={textareaRef}
                value={text}
                onChange={handleTextareaChange}
                onKeyDown={handleKeyDown}
                placeholder="پیام خود را بنویسید..."
                rows={1}
                className="w-full bg-white/[0.03] border border-white/[0.06] rounded-2xl px-4 py-3 pr-12 text-sm text-white placeholder:text-gray-600 focus:border-blue-500/30 focus:bg-white/[0.05] outline-none transition-all resize-none max-h-[150px] leading-6"
              />
              <span className="absolute bottom-3 right-4 text-[9px] text-gray-600 select-none">{text.length}</span>
            </div>
            <button onClick={sendMessage} disabled={!text.trim() || sending}
              className={`shrink-0 w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-300 ${text.trim() && !sending ? "bg-gradient-to-br from-blue-600 to-cyan-600 text-white shadow-lg shadow-blue-500/30 hover:scale-105 active:scale-95" : "bg-white/[0.04] text-gray-600 cursor-not-allowed"}`}>
              {sending ? <Loader2 size={20} className="animate-spin" /> : <Send size={18} strokeWidth={2} />}
            </button>
          </div>
          <p className="text-[9px] text-gray-600 text-center mt-2">Enter برای ارسال • Shift + Enter برای خط جدید</p>
        </div>
      )}

      {/* Closed Banner */}
      {isClosed && (
        <div className="shrink-0 p-6 text-center border-t border-white/[0.04] bg-[#050912]/50">
          <div className="w-12 h-12 rounded-2xl bg-red-500/10 flex items-center justify-center mx-auto mb-3">
            <X size={20} className="text-red-400" />
          </div>
          <p className="text-sm text-gray-400 font-medium">این تیکت بسته شده است</p>
          <p className="text-[11px] text-gray-600 mt-1">امکان ارسال پیام جدید وجود ندارد</p>
        </div>
      )}
    </div>
  )
}