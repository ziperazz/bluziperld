"use client";

import { useState, useEffect, useRef } from "react";
import { Sparkles, Send, Loader2, X, Clock, AlertCircle, ArrowDown, PenTool, Copy, Check, Headphones, User } from "lucide-react";
import Link from "next/link";

const API = process.env.NEXT_PUBLIC_API_URL || "";

function CopyMessage({ text }: { text: string }) {
    const [copied, setCopied] = useState(false);
    return (
        <button
            onClick={(e) => { e.stopPropagation(); navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 2000); }}
            className="absolute bottom-2 right-2 p-1.5 rounded-lg bg-[#0a1525]/80 hover:bg-[#1a2540] text-gray-500 hover:text-white opacity-0 group-hover:opacity-100 transition-all backdrop-blur-sm"
        >
            {copied ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
        </button>
    );
}

export default function AiChatBot() {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<any[]>([]);
    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(false);
    const [remaining, setRemaining] = useState(0);
    const [error, setError] = useState("");
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [showScrollBottom, setShowScrollBottom] = useState(false);
    const [showTooltip, setShowTooltip] = useState(false);
    const [initialized, setInitialized] = useState(false);
    const [isVisible, setIsVisible] = useState(true);
    const [lastScrollY, setLastScrollY] = useState(0);
    const [showWelcome, setShowWelcome] = useState(true);
    const chatEndRef = useRef<HTMLDivElement>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const messagesContainerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const token = localStorage.getItem("accessToken");
        setIsLoggedIn(!!token);
        if (token) {
            fetch(`${API}/api/ai-chat`, { headers: { Authorization: `Bearer ${token}` } })
                .then(r => r.json())
                .then(d => { if (d.success) setRemaining(d.remainingRequests); })
                .catch(() => {})
                .finally(() => setInitialized(true));
        } else {
            setInitialized(true);
        }
        const t = setTimeout(() => setShowTooltip(true), 1500);
        const h = setTimeout(() => setShowTooltip(false), 18000);
        return () => { clearTimeout(t); clearTimeout(h); };
    }, []);

    useEffect(() => {
        const handleScroll = () => {
            const currentScrollY = window.scrollY;
            if (currentScrollY > lastScrollY && currentScrollY > 200) setIsVisible(false);
            else setIsVisible(true);
            setLastScrollY(currentScrollY);
        };
        window.addEventListener("scroll", handleScroll, { passive: true });
        return () => window.removeEventListener("scroll", handleScroll);
    }, [lastScrollY]);

    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = "hidden";
            document.body.style.touchAction = "none";
        } else {
            document.body.style.overflow = "";
            document.body.style.touchAction = "";
        }
        return () => { document.body.style.overflow = ""; document.body.style.touchAction = ""; };
    }, [isOpen]);

    const loadChat = async () => {
        const token = localStorage.getItem("accessToken");
        if (!token) return;
        try {
            const res = await fetch(`${API}/api/ai-chat`, { headers: { Authorization: `Bearer ${token}` } });
            const data = await res.json();
            if (data.success) {
                const chatMessages = data.chat.messages || [];
                if (chatMessages.length === 0) {
                    setMessages([{
                        role: "assistant",
                        content: `سلام! من "بلو" هستم، دستیار نامه‌نگاری BluZiperld.

پیام‌های تو محدود هستن (۵ تا در روز). لطفاً تمام حرف‌ها رو توی یک پیام کامل بگو.

برای بهترین نتیجه:
• نامه برای کیه؟
• چه مناسبتی؟
• چه لحنی می‌خوای؟
• اسم خودت و طرف مقابل چیه؟

مثال: "میخوام یه نامه عاشقانه برای همسرم سارا بنویسم. لحن خودمونی. اسم من علی."

📦 سوال درباره محصولات؟ از پشتیبانی بپرس.

حالا بگو، برات بنویسم!`
                    }]);
                } else {
                    setMessages(chatMessages);
                }
                setRemaining(data.remainingRequests);
            }
        } catch (e) { console.error(e); }
    };

    useEffect(() => { if (isOpen && isLoggedIn) loadChat(); }, [isOpen, isLoggedIn]);
    useEffect(() => { scrollToBottom(); }, [messages]);

    useEffect(() => {
        const c = messagesContainerRef.current;
        if (!c) return;
        const hs = () => {
            const { scrollTop, scrollHeight, clientHeight } = c;
            setShowScrollBottom(scrollHeight - scrollTop - clientHeight > 150);
        };
        c.addEventListener("scroll", hs, { passive: true });
        return () => c.removeEventListener("scroll", hs);
    }, []);

    const scrollToBottom = () => {
        messagesContainerRef.current?.scrollTo({ top: messagesContainerRef.current.scrollHeight, behavior: "smooth" });
    };

    const adjustHeight = () => {
        const ta = textareaRef.current;
        if (ta) { ta.style.height = "auto"; ta.style.height = Math.min(ta.scrollHeight, 100) + "px"; }
    };

    const handleSend = async () => {
        if (!input.trim()) return;

        const token = localStorage.getItem("accessToken");
        if (!token) {
            setMessages(prev => [...prev, { role: "user", content: input }, { role: "assistant", content: "برای استفاده از بلو باید وارد حساب کاربری بشی. از دکمه ورود/ثبت‌نام پایین صفحه استفاده کن." }]);
            setInput(""); adjustHeight(); return;
        }

        if (input.trim().length < 15) {
            setMessages(prev => [...prev, { role: "user", content: input }, { role: "assistant", content: "یه کم بیشتر توضیح بده. برای کیه؟ چه مناسبتی؟ چه لحنی؟" }]);
            setInput(""); adjustHeight(); return;
        }
        setLoading(true); setError("");
        try {
            const res = await fetch(`${API}/api/ai-chat/send`, {
                method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
                body: JSON.stringify({ message: input }),
            });
            const data = await res.json();
            if (data.success) {
                setMessages(prev => [...prev, { role: "user", content: input }, { role: "assistant", content: data.message }]);
                setRemaining(data.remainingRequests);
                setInput("");
                if (textareaRef.current) textareaRef.current.style.height = "auto";
            } else {
                setError(data.message);
                if (data.remainingRequests !== undefined) setRemaining(data.remainingRequests);
            }
        } catch (e) { setError("خطا در ارتباط با سرور"); }
        finally { setLoading(false); textareaRef.current?.focus(); }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); }
    };

    const handleOpen = () => {
        setIsOpen(true);
        setShowTooltip(false);
        setShowWelcome(true);
        if (!isLoggedIn) {
            setMessages([{
                role: "assistant",
                content: `سلام! من "بلو" هستم، دستیار نامه‌نگاری BluZiperld.

برای نوشتن نامه باید وارد حساب کاربری بشی. از دکمه زیر وارد شو یا اگه اکانت نداری ثبت‌نام کن.

بعد از ورود می‌تونی ازم بخوای برات نامه بنویسم (۵ تا در روز).`
            }]);
        } else {
            loadChat();
        }
    };

    if (!initialized) return null;

    return (
        <>
            {isOpen && <div className="fixed inset-0 bg-black/70 backdrop-blur-md z-40 animate-fadeIn" onClick={() => setIsOpen(false)} />}

            {/* دکمه شناور - سمت راست پایین - روبه‌روی پشتیبانی */}
            <div className={`fixed right-4 sm:right-6 bottom-6 z-50 transition-all duration-500 ease-out ${isVisible ? "opacity-100 translate-y-0 scale-100" : "opacity-0 translate-y-4 scale-90 pointer-events-none"}`}>
                <div className={`absolute bottom-full right-0 mb-3 transition-all duration-300 ${showTooltip ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2 pointer-events-none"}`}>
                    <div className="relative bg-gradient-to-r from-purple-600/95 to-blue-600/95 backdrop-blur-xl border border-white/20 shadow-2xl rounded-2xl px-4 py-2.5 whitespace-nowrap">
                        <p className="text-white text-xs font-bold flex items-center gap-1.5"><PenTool size={12} className="text-purple-200" />بلو، نامه‌نگار هوشمند</p>
                        <p className="text-white/70 text-[10px] mt-0.5">برای نوشتن نامه کلیک کن</p>
                        <div className="absolute -bottom-1.5 right-6 w-3 h-3 bg-blue-600/95 rotate-45 border-r border-b border-white/20" />
                    </div>
                </div>

                <button onClick={handleOpen}
                    onMouseEnter={() => setShowTooltip(false)}
                    className="group relative flex items-center justify-center w-14 h-14 rounded-2xl bg-white/[0.06] backdrop-blur-xl border border-white/[0.08] shadow-lg shadow-black/20 hover:border-purple-400/30 hover:bg-white/[0.1] transition-all duration-300 hover:scale-105 active:scale-95">
                    <div className="absolute inset-0 pointer-events-none">
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-purple-500/20 animate-ping-slow" />
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-blue-500/15 animate-ping-slower" />
                    </div>
                    {isOpen ? <X size={22} className="text-gray-300 group-hover:text-white transition-colors duration-300 relative" strokeWidth={1.5} /> : (
                        <div className="flex items-center gap-0.5 relative">
                            <PenTool size={17} className="text-gray-300 group-hover:text-white transition-colors duration-300" strokeWidth={1.5} />
                            <span className="text-[10px] font-black text-gray-400 group-hover:text-white">/</span>
                            <Sparkles size={13} className="text-gray-400 group-hover:text-white transition-colors duration-300" />
                        </div>
                    )}
                    {!isOpen && <div className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-green-400 border-2 border-[#030712] animate-pulse" />}
                </button>
            </div>

            {/* پنل چت - دقیقاً بالای دکمه */}
            {isOpen && (
                <div className="fixed right-4 sm:right-6 bottom-24 z-50 w-[calc(100vw-2rem)] sm:w-[420px] h-[550px] sm:h-[580px] max-h-[70vh] animate-fadeIn">
                    <div className="w-full h-full bg-[#0a101f]/95 backdrop-blur-2xl border border-[#1a2a40] rounded-3xl shadow-2xl shadow-black/60 flex flex-col overflow-hidden animate-scaleIn">
                        
                        {/* Header */}
                        <div className="flex items-center justify-between px-4 sm:px-5 py-3.5 border-b border-[#1a2a40]/50 bg-[#060d18]/80 backdrop-blur-xl shrink-0">
                            <div className="flex items-center gap-3">
                                <div className="flex items-center gap-0.5 w-10 h-10 rounded-2xl bg-blue-500/10 border border-blue-500/20 justify-center shadow-inner">
                                    <PenTool size={15} className="text-blue-400" /><span className="text-[9px] font-black text-blue-300">/</span><Sparkles size={11} className="text-blue-400" />
                                </div>
                                <div>
                                    <h3 className="text-white font-black text-sm">بلو</h3>
                                    <div className="flex items-center gap-2">
                                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shadow-lg shadow-emerald-500/30" />
                                        <span className="text-[11px] text-gray-400">نامه‌نگار BluZiperld</span>
                                        {isLoggedIn && <><span className="text-[11px] text-gray-700">|</span><span className="text-[11px] text-gray-400 flex items-center gap-1"><Clock size={11} />{remaining}/۵</span></>}
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center gap-1">
                                <Link href="/support" className="p-2 rounded-xl hover:bg-white/5 text-gray-500 hover:text-gray-300 transition" title="پشتیبانی"><Headphones size={17} /></Link>
                                <button onClick={() => setIsOpen(false)} className="p-2 rounded-xl hover:bg-white/5 text-gray-500 hover:text-white transition"><X size={17} /></button>
                            </div>
                        </div>

                        {/* Messages */}
                        <div ref={messagesContainerRef} className="flex-1 overflow-y-auto px-4 py-4 space-y-4 fancy-scroll overscroll-contain">
                            {messages.map((msg, i) => (
                                <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                                    <div className={`relative group max-w-[85%] p-3.5 rounded-2xl text-[13px] leading-7 ${msg.role === "user" ? "bg-gradient-to-br from-blue-600/90 to-blue-700/80 text-white rounded-br-md shadow-lg shadow-blue-500/10" : "bg-[#060d18]/80 backdrop-blur-xl text-gray-200 rounded-bl-md border border-[#1a2a40]/50"}`}>
                                        <div className="whitespace-pre-wrap break-words">{msg.content}</div>
                                        {msg.role === "assistant" && <CopyMessage text={msg.content} />}
                                    </div>
                                </div>
                            ))}
                            {loading && (
                                <div className="flex justify-start"><div className="bg-[#060d18]/80 backdrop-blur-xl border border-[#1a2a40]/50 p-3.5 rounded-2xl rounded-bl-md"><Loader2 size={16} className="text-blue-400 animate-spin" /></div></div>
                            )}
                            {error && (
                                <div className="flex items-center gap-2 p-3 rounded-xl bg-red-500/5 border border-red-500/10 text-red-400 text-xs"><AlertCircle size={13} /> {error}</div>
                            )}
                            {showScrollBottom && (
                                <button onClick={scrollToBottom} className="absolute bottom-24 left-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-[#1a2a40]/80 backdrop-blur-xl border border-[#1a3a5c]/50 text-gray-400 hover:text-white shadow-lg transition-all flex items-center justify-center z-10"><ArrowDown size={14} /></button>
                            )}
                            <div ref={chatEndRef} />
                        </div>

                        {/* Footer */}
                        <div className="px-4 py-2 text-center text-[11px] sm:text-xs text-gray-500 shrink-0 select-none border-t border-[#1a2a40]/30 bg-[#060d18]/50 backdrop-blur-xl">
                            فقط برای نامه‌نگاری | سوالات؟ <Link href="/support" className="text-blue-400 hover:text-blue-300 underline font-bold">پشتیبانی</Link>
                        </div>

                        {/* Input + Login */}
                        <div className="p-3 border-t border-[#1a2a40]/50 bg-[#060d18]/80 backdrop-blur-xl shrink-0">
                            {!isLoggedIn ? (
                                <Link href="/auth" className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-gradient-to-r from-blue-600 to-blue-500 text-white font-bold text-sm hover:from-blue-500 hover:to-blue-400 transition-all shadow-lg shadow-blue-500/20">
                                    <User size={16} /> ورود / ثبت‌نام برای استفاده از بلو
                                </Link>
                            ) : remaining <= 0 ? (
                                <div className="text-center py-2.5 text-amber-400 text-xs font-medium bg-amber-500/5 rounded-xl border border-amber-500/10">سقف ۵ پیام روزانه تموم شد. فردا بیا!</div>
                            ) : (
                                <div className="flex items-end gap-2">
                                    <textarea ref={textareaRef} value={input} onChange={(e) => { setInput(e.target.value); adjustHeight(); }} onKeyDown={handleKeyDown} placeholder="همه چی رو یه جا بگو..." rows={1}
                                        className="flex-1 bg-[#0a101f]/80 backdrop-blur-xl border border-[#1a2a40]/50 rounded-xl px-4 py-2.5 text-white text-[13px] placeholder:text-gray-600 focus:border-blue-500/40 outline-none transition-all resize-none max-h-[100px]" />
                                    <button onClick={handleSend} disabled={loading || !input.trim()}
                                        className="p-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-blue-500 text-white hover:from-blue-500 hover:to-blue-400 transition-all disabled:opacity-30 shrink-0 shadow-lg shadow-blue-500/20 active:scale-95">
                                        {loading ? <Loader2 size={17} className="animate-spin" /> : <Send size={17} />}
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
            <style jsx>{`
                @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
                @keyframes scaleIn { from { opacity: 0; transform: scale(0.95) translateY(10px); } to { opacity: 1; transform: scale(1) translateY(0); } }
                @keyframes ping-slow { 0% { transform: translate(-50%, -50%) scale(1); opacity: 0.5; } 75%, 100% { transform: translate(-50%, -50%) scale(1.8); opacity: 0; } }
                @keyframes ping-slower { 0% { transform: translate(-50%, -50%) scale(1); opacity: 0.4; } 75%, 100% { transform: translate(-50%, -50%) scale(2.2); opacity: 0; } }
                .animate-fadeIn { animation: fadeIn 0.25s ease-out forwards; }
                .animate-scaleIn { animation: scaleIn 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
                .animate-ping-slow { animation: ping-slow 2.5s cubic-bezier(0, 0, 0.2, 1) infinite; }
                .animate-ping-slower { animation: ping-slower 3.5s cubic-bezier(0, 0, 0.2, 1) infinite; }
                .fancy-scroll::-webkit-scrollbar { width: 3px; }
                .fancy-scroll::-webkit-scrollbar-track { background: transparent; }
                .fancy-scroll::-webkit-scrollbar-thumb { background: #1a2a40; border-radius: 20px; }
            `}</style>
        </>
    );
}