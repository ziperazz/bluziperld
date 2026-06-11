"use client";

import { useState, useEffect } from "react";
import { Sparkles, Loader2, X, PenTool, Clock, AlertCircle, Send, Copy, Check, RefreshCw, Heart, Gift, User, Users, FileText, HelpCircle } from "lucide-react";
import Link from "next/link";

const API = process.env.NEXT_PUBLIC_API_URL || "";

const QUICK_PROMPTS = [
    { icon: Heart, label: "نامه عاشقانه", prompt: "میخوام یه نامه عاشقانه بنویسم. بگم چقدر دوستش دارم و از بودنش خوشحالم.", color: "text-rose-400", bg: "bg-rose-500/10", border: "border-rose-500/20" },
    { icon: Gift, label: "تبریک تولد", prompt: "میخوام یه نامه تبریک تولد بنویسم. پر از انرژی و شادی باشه.", color: "text-amber-400", bg: "bg-amber-500/10", border: "border-amber-500/20" },
    { icon: Heart, label: "دلتنگی", prompt: "دلم براش تنگ شده. میخوام یه نامه احساسی و غمگین بنویسم.", color: "text-blue-400", bg: "bg-blue-500/10", border: "border-blue-500/20" },
    { icon: FileText, label: "قدردانی", prompt: "میخوام ازش تشکر کنم. یه نامه قدردانی صمیمی میخوام.", color: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/20" },
];

const TONE_OPTIONS = [
    { value: "casual", label: "خودمونی", desc: "راحت و بی‌تکلف" },
    { value: "friendly", label: "دوستانه", desc: "گرم و صمیمی" },
    { value: "formal", label: "رسمی", desc: "محترمانه" },
    { value: "emotional", label: "احساسی", desc: "پر از عاطفه" },
];

export default function AiWritingHelper({ onResult }: { onResult: (text: string) => void; category?: string }) {
    const [showModal, setShowModal] = useState(false);
    const [prompt, setPrompt] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [remaining, setRemaining] = useState(0);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [generatedText, setGeneratedText] = useState("");
    const [step, setStep] = useState<"input" | "result" | "login">("input");
    const [copied, setCopied] = useState(false);
    const [recipientName, setRecipientName] = useState("");
    const [senderName, setSenderName] = useState("");
    const [tone, setTone] = useState("friendly");
    const [showGuide, setShowGuide] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem("accessToken");
        setIsLoggedIn(!!token);
        if (token) {
            fetch(`${API}/api/ai-chat`, {
                headers: { Authorization: `Bearer ${token}` },
            })
                .then(res => res.json())
                .then(data => {
                    if (data.success) setRemaining(data.remainingRequests);
                })
                .catch(() => {});
        }
    }, [showModal]);

    const buildFullPrompt = () => {
        let fullPrompt = prompt;
        if (recipientName) fullPrompt += `\nگیرنده: ${recipientName}`;
        if (senderName) fullPrompt += `\nفرستنده: ${senderName}`;
        if (tone) fullPrompt += `\nلحن: ${TONE_OPTIONS.find(t => t.value === tone)?.label || tone}`;
        return fullPrompt;
    };

    const handleQuickPrompt = (quickPrompt: string) => {
        setPrompt(quickPrompt);
        setShowGuide(false);
    };

    const handleGenerate = async () => {
        const finalPrompt = buildFullPrompt();
        
        // چک لاگین
        const token = localStorage.getItem("accessToken");
        if (!token) {
            setStep("login");
            return;
        }

        if (!finalPrompt.trim()) {
            setError("لطفاً توضیح بده چی میخوای بنویسی");
            return;
        }

        if (finalPrompt.trim().length < 15) {
            setError("یه کم بیشتر توضیح بده.");
            return;
        }

        setLoading(true);
        setError("");

        try {
            const res = await fetch(`${API}/api/ai-chat/send`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ message: finalPrompt }),
            });

            const data = await res.json();

            if (data.success) {
                setGeneratedText(data.message);
                setRemaining(data.remainingRequests);
                setStep("result");
            } else {
                setError(data.message);
                if (data.remainingRequests !== undefined) setRemaining(data.remainingRequests);
            }
        } catch (e) {
            setError("خطا در ارتباط با سرور");
        } finally {
            setLoading(false);
        }
    };

    const handleUseText = () => {
        onResult(generatedText);
        setShowModal(false);
        resetForm();
    };

    const handleCopy = () => {
        navigator.clipboard.writeText(generatedText);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleRetry = () => {
        setStep("input");
        setGeneratedText("");
        setError("");
    };

    const resetForm = () => {
        setPrompt("");
        setGeneratedText("");
        setStep("input");
        setRecipientName("");
        setSenderName("");
        setTone("friendly");
        setError("");
        setShowGuide(true);
    };

    // 🆕 دکمه همیشه نمایش داده بشه
    return (
        <>
            <button
                type="button"
                onClick={() => { setShowModal(true); resetForm(); }}
                disabled={isLoggedIn && remaining <= 0}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#1e3a5f] to-[#0f3460] border border-[#1a4a7a] text-blue-300 text-xs font-bold hover:from-[#1a4a7a] hover:to-[#0f3460] hover:text-white transition-all shadow-lg shadow-blue-500/10 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
                title={isLoggedIn && remaining <= 0 ? "سقف روزانه تموم شده" : "کمک گرفتن از بلو"}
            >
                <Sparkles size={14} />
                {isLoggedIn && remaining <= 0 ? "سقف روزانه تموم شد" : "کمک از بلو"}
                {isLoggedIn && remaining > 0 && <span className="text-[10px] opacity-60">({remaining}/۵)</span>}
            </button>

            {showModal && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[9999] p-4 animate-fadeIn" onClick={() => setShowModal(false)}>
                    <div className="bg-[#0a101f] border border-[#1a2540] rounded-3xl w-full max-w-2xl shadow-2xl shadow-black/50 overflow-hidden animate-scaleIn" onClick={(e) => e.stopPropagation()}>
                        
                        {/* Header */}
                        <div className="flex items-center justify-between p-5 border-b border-[#1a2540] bg-[#050d1a]">
                            <div className="flex items-center gap-3">
                                <div className="flex items-center gap-0.5 w-10 h-10 rounded-2xl bg-blue-500/10 border border-blue-500/20 justify-center shadow-lg shadow-blue-500/5">
                                    <PenTool size={15} className="text-blue-400" />
                                    <span className="text-[9px] font-bold text-blue-300">/</span>
                                    <Sparkles size={12} className="text-purple-400" />
                                </div>
                                <div>
                                    <h3 className="text-white font-black text-base">بلو، دستیار نامه‌نگاری</h3>
                                    <div className="flex items-center gap-2 mt-0.5">
                                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                                        <span className="text-[10px] text-gray-500">BluZiperld AI</span>
                                        {isLoggedIn && <><span className="text-[10px] text-gray-700">|</span><span className="text-[10px] text-gray-500 flex items-center gap-1"><Clock size={10} /> {remaining} از ۵</span></>}
                                    </div>
                                </div>
                            </div>
                            <button onClick={() => setShowModal(false)} className="p-2 rounded-xl hover:bg-white/5 text-gray-500 hover:text-white transition">
                                <X size={18} />
                            </button>
                        </div>

                        {/* Body */}
                        <div className="p-5 max-h-[60vh] overflow-y-auto fancy-scroll">
                            {/* 🆕 صفحه ورود */}
                            {step === "login" && (
                                <div className="flex flex-col items-center justify-center py-12 space-y-6 text-center">
                                    <div className="w-20 h-20 rounded-3xl bg-blue-500/5 border border-blue-500/10 flex items-center justify-center">
                                        <User size={36} className="text-gray-500" />
                                    </div>
                                    <div>
                                        <p className="text-white font-black text-base mb-2">وارد حساب کاربری بشو</p>
                                        <p className="text-gray-400 text-sm leading-6">برای استفاده از بلو و نوشتن نامه باید وارد حساب کاربری بشی.</p>
                                    </div>
                                    <Link
                                        href="/auth"
                                        className="w-full py-3 rounded-xl bg-gradient-to-r from-blue-600 to-blue-500 text-white font-bold text-sm hover:from-blue-500 hover:to-blue-400 transition-all shadow-lg shadow-blue-500/20 text-center"
                                    >
                                        ورود / ثبت‌نام
                                    </Link>
                                    <button onClick={() => setStep("input")} className="text-gray-500 text-xs hover:text-gray-300">
                                        برگشت
                                    </button>
                                </div>
                            )}

                            {/* صفحه نتیجه */}
                            {step === "result" && (
                                <div className="space-y-4">
                                    <div className="flex items-center gap-2 text-xs text-emerald-400 font-bold">
                                        <Sparkles size={14} />
                                        نامه با موفقیت نوشته شد
                                    </div>
                                    
                                    <div className="p-5 rounded-2xl bg-[#050d1a] border border-emerald-500/20 max-h-[350px] overflow-y-auto shadow-inner">
                                        <div className="text-sm text-gray-200 leading-8 whitespace-pre-wrap">
                                            {generatedText}
                                        </div>
                                    </div>

                                    <div className="flex gap-2">
                                        <button onClick={handleUseText} className="flex-[2] flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-500 text-white text-sm font-bold hover:from-emerald-500 hover:to-emerald-400 transition-all shadow-lg shadow-emerald-500/20 active:scale-[0.98]">
                                            <Send size={15} /> درج در نامه
                                        </button>
                                        <button onClick={handleCopy} className={`px-4 py-3 rounded-xl border text-sm transition-all ${copied ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-400" : "border-[#1a2540] bg-[#050d1a] text-gray-400 hover:text-white hover:border-gray-600"}`}>
                                            {copied ? <Check size={16} /> : <Copy size={16} />}
                                        </button>
                                        <button onClick={handleRetry} className="px-4 py-3 rounded-xl border border-[#1a2540] bg-[#050d1a] text-gray-400 text-sm hover:text-white hover:bg-white/[0.02] transition-all flex items-center gap-1.5">
                                            <RefreshCw size={15} /> <span className="hidden sm:inline">دوباره</span>
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* فرم اصلی */}
                            {step === "input" && (
                                <div className="space-y-5">
                                    {/* Quick Prompts */}
                                    <div className="space-y-2">
                                        <div className="flex items-center justify-between">
                                            <label className="text-xs font-bold text-gray-500">پیشنهادهای سریع</label>
                                            <button onClick={() => setShowGuide(!showGuide)} className="text-[10px] text-gray-600 hover:text-gray-400 flex items-center gap-1">
                                                <HelpCircle size={11} /> راهنما
                                            </button>
                                        </div>
                                        <div className="grid grid-cols-2 gap-2">
                                            {QUICK_PROMPTS.map((qp, i) => {
                                                const Icon = qp.icon;
                                                return (
                                                    <button key={i} type="button" onClick={() => handleQuickPrompt(qp.prompt)}
                                                        className={`flex items-center gap-2 p-2.5 rounded-xl border text-xs font-medium transition-all text-right ${qp.bg} ${qp.border} ${qp.color} hover:scale-[1.02] active:scale-[0.98]`}>
                                                        <Icon size={14} /> <span className="truncate">{qp.label}</span>
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>

                                    {/* Guide */}
                                    {showGuide && (
                                        <div className="p-4 rounded-2xl bg-blue-500/5 border border-blue-500/10 space-y-3 animate-fadeIn">
                                            <p className="text-xs font-bold text-blue-400 flex items-center gap-1.5">
                                                <HelpCircle size={13} /> چطور یه درخواست کامل بدم؟
                                            </p>
                                            <div className="grid grid-cols-2 gap-2 text-[11px] text-gray-400">
                                                <div className="flex items-start gap-1.5"><span className="text-blue-400 mt-0.5">۱</span><span>برای <span className="text-blue-300 font-medium">کیه؟</span></span></div>
                                                <div className="flex items-start gap-1.5"><span className="text-blue-400 mt-0.5">۲</span><span>چه <span className="text-blue-300 font-medium">مناسبتی؟</span></span></div>
                                                <div className="flex items-start gap-1.5"><span className="text-blue-400 mt-0.5">۳</span><span>چه <span className="text-blue-300 font-medium">لحنی؟</span></span></div>
                                                <div className="flex items-start gap-1.5"><span className="text-blue-400 mt-0.5">۴</span><span>چه <span className="text-blue-300 font-medium">حسی؟</span></span></div>
                                            </div>
                                            <p className="text-[10px] text-gray-600 bg-[#050d1a] p-2.5 rounded-xl leading-5 border border-[#1a2540]">
                                                ✍️ مثال: "میخوام یه نامه عاشقانه برای همسرم سارا بنویسم. لحن خودمونی. بگم چقدر دوستش دارم. اسم من علی هست."
                                            </p>
                                        </div>
                                    )}

                                    {/* Tone */}
                                    <div>
                                        <label className="text-xs font-bold text-gray-500 mb-2 block">لحن نامه</label>
                                        <div className="grid grid-cols-4 gap-2">
                                            {TONE_OPTIONS.map(t => (
                                                <button key={t.value} type="button" onClick={() => setTone(t.value)}
                                                    className={`p-2 rounded-xl text-[11px] font-medium transition-all ${tone === t.value ? "bg-blue-600/20 border border-blue-500/30 text-white" : "bg-[#050d1a] border border-[#1a2540] text-gray-400 hover:border-gray-600"}`}>
                                                    <div>{t.label}</div><div className="text-[9px] text-gray-600 mt-0.5">{t.desc}</div>
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Names */}
                                    <div className="grid grid-cols-2 gap-3">
                                        <div>
                                            <label className="text-[10px] font-bold text-gray-500 mb-1.5 flex items-center gap-1"><User size={10} /> گیرنده</label>
                                            <input type="text" value={recipientName} onChange={(e) => setRecipientName(e.target.value)} placeholder="مثلاً: سارا"
                                                className="w-full bg-[#050d1a] border border-[#1a2540] rounded-xl px-3 py-2.5 text-white text-xs placeholder:text-gray-700 focus:border-blue-500/50 outline-none transition-all" />
                                        </div>
                                        <div>
                                            <label className="text-[10px] font-bold text-gray-500 mb-1.5 flex items-center gap-1"><Users size={10} /> فرستنده</label>
                                            <input type="text" value={senderName} onChange={(e) => setSenderName(e.target.value)} placeholder="مثلاً: علی"
                                                className="w-full bg-[#050d1a] border border-[#1a2540] rounded-xl px-3 py-2.5 text-white text-xs placeholder:text-gray-700 focus:border-blue-500/50 outline-none transition-all" />
                                        </div>
                                    </div>

                                    {/* Input */}
                                    <div>
                                        <label className="text-xs font-bold text-gray-500 mb-2 flex items-center gap-1"><FileText size={11} /> توضیح بده چی میخوای</label>
                                        <textarea value={prompt} onChange={(e) => setPrompt(e.target.value)} rows={4}
                                            placeholder="همه چی رو یه جا اینجا بنویس..."
                                            className="w-full bg-[#050d1a] border border-[#1a2540] rounded-xl px-4 py-3 text-white text-sm placeholder:text-gray-700 focus:border-blue-500/50 outline-none resize-none transition-all" autoFocus />
                                        <div className="flex items-center justify-between mt-2">
                                            <span className={`text-[10px] ${prompt.length < 15 ? "text-yellow-500" : "text-emerald-400"}`}>
                                                {prompt.length < 15 ? "حداقل ۱۵ کاراکتر" : `${prompt.length} کاراکتر`}
                                            </span>
                                            {isLoggedIn && <span className="text-[10px] text-gray-600">{remaining}/۵ درخواست</span>}
                                        </div>
                                    </div>

                                    {error && (
                                        <div className="flex items-center gap-2 p-3 rounded-xl bg-red-500/5 border border-red-500/10 text-red-400 text-xs">
                                            <AlertCircle size={13} /> {error}
                                        </div>
                                    )}

                                    <button type="button" onClick={handleGenerate}
                                        disabled={loading || !prompt.trim() || (isLoggedIn && remaining <= 0)}
                                        className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-gradient-to-r from-blue-600 to-blue-500 text-white font-bold text-sm hover:from-blue-500 hover:to-blue-400 transition-all disabled:opacity-40 shadow-lg shadow-blue-500/20 active:scale-[0.98]">
                                        {loading ? <><Loader2 size={16} className="animate-spin" /> بلو داره مینویسه...</> :
                                         isLoggedIn && remaining <= 0 ? "سقف روزانه تموم شد" :
                                         <><Sparkles size={16} /> بلو، برام بنویس!</>}
                                    </button>

                                    {isLoggedIn && <p className="text-center text-[10px] text-gray-700">با هر کلیک، یک درخواست از ۵ درخواست روزانه کم میشه.</p>}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            <style jsx>{`
                @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
                @keyframes scaleIn { from { opacity: 0; transform: scale(0.95) translateY(10px); } to { opacity: 1; transform: scale(1) translateY(0); } }
                .animate-fadeIn { animation: fadeIn 0.2s ease-out forwards; }
                .animate-scaleIn { animation: scaleIn 0.3s ease-out forwards; }
                .fancy-scroll::-webkit-scrollbar { width: 4px; }
                .fancy-scroll::-webkit-scrollbar-track { background: transparent; }
                .fancy-scroll::-webkit-scrollbar-thumb { background: #1a2540; border-radius: 20px; }
            `}</style>
        </>
    );
}