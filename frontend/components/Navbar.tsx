"use client"

import { useState, useEffect, useRef, useMemo } from "react"
import Link from "next/link"
import {
    Menu, Search, X, Home, Package, Mail, Loader2,
    Sparkles, Zap, Star, ShoppingBag, ChevronRight,
    ArrowRight, Flame, Coffee, Gem, Crown, Scale, Download,
} from "lucide-react"
import { useRouter, usePathname } from "next/navigation"
import ProfileDropdown from "./ProfileDropdown"
import CartDropdown from "./CartDropdown"

const API = process.env.NEXT_PUBLIC_API_URL?.replace(/\/+$/, "") || "http://localhost:5000"

const MENU_ITEMS = [
    { href: "/", label: "خانه", icon: Home },
    { href: "/letters", label: "پاکت نامه", icon: Mail },
    { href: "/products", label: "محصولات", icon: ShoppingBag },
    { href: "/rules", label: "قوانین ما", icon: Scale },
    { href: "/about-us", label: "درباره ما", icon: Coffee },
]

const PARTICLE_ICONS = [Sparkles, Zap, Star, Flame, Crown, Gem]

export default function Navbar() {
    const router = useRouter()
    const pathname = usePathname()

    const [searchFocused, setSearchFocused] = useState(false)
    const [openMobileMenu, setOpenMobileMenu] = useState(false)
    const [scrolled, setScrolled] = useState(false)
    const [search, setSearch] = useState("")
    const [results, setResults] = useState<{ products: any[], letters: any[] } | null>(null)
    const [loading, setLoading] = useState(false)
    const [showResults, setShowResults] = useState(false)

    const searchContainerRef = useRef<HTMLDivElement>(null)
    const topRowRef = useRef<HTMLDivElement>(null)
    const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

    const particles = useMemo(() =>
        Array.from({ length: 5 }).map((_, i) => ({
            id: i,
            icon: PARTICLE_ICONS[i % PARTICLE_ICONS.length],
            top: 20 + Math.random() * 60,
            left: 10 + Math.random() * 80,
            delay: i * 0.7,
            duration: 4 + Math.random() * 3,
        })),
        [])

    useEffect(() => {
        const onAuth = () => router.refresh()
        window.addEventListener("auth-change", onAuth)
        return () => window.removeEventListener("auth-change", onAuth)
    }, [router])

    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 15)
        window.addEventListener("scroll", onScroll, { passive: true })
        return () => window.removeEventListener("scroll", onScroll)
    }, [])

    useEffect(() => {
        const onClick = (e: MouseEvent) => {
            if (searchContainerRef.current && !searchContainerRef.current.contains(e.target as Node)) {
                setShowResults(false)
                setSearchFocused(false)
            }
        }
        document.addEventListener("mousedown", onClick)
        return () => document.removeEventListener("mousedown", onClick)
    }, [])

    useEffect(() => {
        if (debounceTimer.current) clearTimeout(debounceTimer.current)
        if (search.trim().length > 2) {
            setLoading(true)
            debounceTimer.current = setTimeout(async () => {
                try {
                    const res = await fetch(`${API}/api/search/global-search?query=${encodeURIComponent(search)}`)
                    if (!res.ok) throw new Error("Search failed")
                    const data = await res.json()
                    setResults(data)
                    setShowResults(true)
                } catch {
                    setResults(null)
                } finally {
                    setLoading(false)
                }
            }, 400)
        } else {
            setResults(null)
            setShowResults(false)
            setLoading(false)
        }
        return () => { if (debounceTimer.current) clearTimeout(debounceTimer.current) }
    }, [search])

    const handleSearchSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        if (!search.trim()) return
        router.push(`/letters?search=${encodeURIComponent(search)}`)
        setShowResults(false)
        setSearchFocused(false)
    }

    const clearSearch = () => {
        setSearch("")
        setResults(null)
        setShowResults(false)
    }

    const isActive = (href: string) => {
        if (href === "/") return pathname === "/"
        return pathname.startsWith(href)
    }

    const hasResults = (results?.products?.length || 0) > 0 || (results?.letters?.length || 0) > 0
    const showNoResults = showResults && search.length > 2 && !loading && !hasResults

    return (
        <>
            <div
                className={`fixed inset-0 z-40 bg-gradient-to-b from-[#020617]/80 via-[#020617]/60 to-transparent backdrop-blur-lg transition-all duration-700 ease-in-out ${
                    searchFocused ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
                }`}
                onClick={() => { setSearchFocused(false); setShowResults(false) }}
            />

            <header
                className={`sticky top-0 z-50 transition-all duration-500 ${
                    scrolled
                        ? "bg-[#030712]/85 backdrop-blur-2xl shadow-[0_15px_50px_-20px_rgba(27,108,255,0.25)] border-b border-blue-500/10"
                        : "bg-[#030712]/50 backdrop-blur-xl border-b border-transparent"
                }`}
            >
                <div className="max-w-[1400px] mx-auto px-6 md:px-10 py-4 relative">
                    
                    {/* ============ MOBILE ============ */}
                    <div className="flex items-center md:hidden justify-between w-full">
                        <button onClick={() => setOpenMobileMenu(true)} className="p-2.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-gray-300 active:scale-95">
                            <Menu size={20} strokeWidth={1.5} />
                        </button>
                        <Link href="/" className="relative">
                            <span className="text-xl font-black tracking-tight">
                                <span className="bg-gradient-to-r from-blue-500 via-blue-600 to-cyan-600 bg-clip-text text-transparent">Blu</span>
                                <span className="bg-gradient-to-r from-cyan-500 to-blue-500 bg-clip-text text-transparent">Ziperld</span>
                            </span>
                        </Link>
                        <div className="flex items-center gap-1">
                            <CartDropdown />
                            <ProfileDropdown />
                        </div>
                    </div>

                    {/* ============ DESKTOP ============ */}
                    <div className="hidden md:block">
                        <div ref={topRowRef} className="flex items-center w-full">
                            <div className="flex-1 flex justify-start">
                                <Link href="/" className="relative group shrink-0">
                                    <div className="absolute -inset-4 bg-blue-500/10 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                                    <div className="relative flex items-center gap-2.5">
                                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center shadow-lg shadow-blue-500/20 group-hover:shadow-blue-500/40 group-hover:scale-105 transition-all duration-300">
                                            <Mail size={17} className="text-white" strokeWidth={2} />
                                        </div>
                                        <span className="text-xl font-black tracking-tight">
                                            <span className="bg-gradient-to-r from-blue-500 via-blue-600 to-cyan-600 bg-clip-text text-transparent">Blu</span>
                                            <span className="bg-gradient-to-r from-cyan-500 to-blue-500 bg-clip-text text-transparent">Ziperld</span>
                                        </span>
                                    </div>
                                </Link>
                            </div>

                            <nav className="flex items-center justify-center gap-3 px-4">
                                {MENU_ITEMS.map((item) => {
                                    const Icon = item.icon
                                    const active = isActive(item.href)
                                    return (
                                        <Link key={item.href} href={item.href}
                                            className={`relative group px-5 py-2.5 rounded-xl transition-all duration-300 ${active ? "text-white" : "text-gray-400 hover:text-white"}`}>
                                            {active && <div className="absolute inset-0 rounded-xl bg-blue-500/10 border border-blue-500/15" />}
                                            <div className="absolute inset-0 rounded-xl bg-white/[0.03] opacity-0 group-hover:opacity-100 transition-opacity duration-300 border border-transparent group-hover:border-white/[0.04]" />
                                            {active && <div className="absolute -top-0.5 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-blue-400 shadow-[0_0_8px_rgba(96,165,250,0.8)]" />}
                                            <span className="relative flex items-center gap-2.5 text-[15px] font-medium">
                                                <Icon size={17} strokeWidth={active ? 2 : 1.5} className={active ? "text-blue-400" : "group-hover:text-blue-400 transition-colors"} />
                                                {item.label}
                                            </span>
                                        </Link>
                                    )
                                })}
                            </nav>

                            <div className="flex-1 flex justify-end gap-3">
                                <CartDropdown />
                                <ProfileDropdown />
                            </div>
                        </div>

                        {/* ============ DESKTOP SEARCH ============ */}
                        <div ref={searchContainerRef} className="relative mt-3 mx-auto" style={{ maxWidth: "100%" }}>
                            <div className="flex items-center w-full">
                                <div className="flex-1 hidden md:block" />
                                <div className="w-full md:flex md:justify-center" style={{ minWidth: "500px", maxWidth: "700px" }}>
                                    <form onSubmit={handleSearchSubmit} className="relative w-full">
                                        <div className="relative flex items-center">
                                            <Search className={`absolute left-5 top-1/2 -translate-y-1/2 transition-all duration-300 ${searchFocused ? "text-blue-400" : "text-gray-500"}`} size={18} strokeWidth={1.5} />
                                            <input
                                                value={search}
                                                onChange={(e) => setSearch(e.target.value)}
                                                onFocus={() => { setSearchFocused(true); if (search.length > 2) setShowResults(true) }}
                                                type="text" placeholder="جستجو در محصولات و پاکت نامه‌ها..."
                                                className="w-full pl-12 pr-12 py-3 rounded-2xl text-sm bg-white/[0.04] text-white placeholder:text-gray-600 border border-white/[0.06] focus:border-blue-500/30 focus:bg-white/[0.06] outline-none transition-all duration-300"
                                            />
                                            {loading && <Loader2 className="absolute right-12 top-1/2 -translate-y-1/2 text-blue-400 animate-spin" size={16} />}
                                            {search && (
                                                <button type="button" onClick={clearSearch} className="absolute right-4 top-1/2 -translate-y-1/2 p-1.5 rounded-lg hover:bg-white/[0.06] text-gray-500 hover:text-white transition-all">
                                                    <X size={16} strokeWidth={1.5} />
                                                </button>
                                            )}
                                        </div>
                                    </form>
                                </div>
                                <div className="flex-1 hidden md:block" />
                            </div>

                            {/* Results */}
                            {hasResults && showResults && (
                                <div className="absolute top-full mt-2 left-0 right-0 max-w-[700px] mx-auto bg-[#060b1a]/98 border border-white/[0.08] rounded-2xl shadow-2xl backdrop-blur-3xl overflow-hidden z-[100] animate-fade-in">
                                    {results!.products.length > 0 && (
                                        <div className="p-4">
                                            <p className="text-[11px] text-blue-400/60 font-bold px-2 mb-2 flex items-center gap-2"><ShoppingBag size={12} /> محصولات</p>
                                            {results!.products.slice(0, 3).map((p) => (
                                                <Link key={p._id} href={`/products/${p._id}`} onClick={() => { setShowResults(false); setSearchFocused(false); clearSearch() }} className="flex items-center gap-3 p-3 hover:bg-white/[0.04] rounded-xl transition-all group">
                                                    <img src={p.images?.[0] || "/no-img.png"} className="w-12 h-12 rounded-lg object-cover border border-white/[0.06]" alt="" />
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-sm text-gray-200 truncate">{p.title}</p>
                                                        <p className="text-xs text-blue-400/80 mt-0.5">{p.price?.toLocaleString()} تومان</p>
                                                    </div>
                                                    <ChevronRight size={14} className="text-gray-600 group-hover:text-blue-400 shrink-0" />
                                                </Link>
                                            ))}
                                        </div>
                                    )}
                                    {results!.products.length > 0 && results!.letters.length > 0 && <div className="mx-4 h-px bg-white/[0.04]" />}
                                    {results!.letters.length > 0 && (
                                        <div className="p-4">
                                            <p className="text-[11px] text-violet-400/60 font-bold px-2 mb-2 flex items-center gap-2"><Mail size={12} /> پاکت نامه‌ها</p>
                                            {results!.letters.slice(0, 3).map((l) => (
                                                <Link key={l._id} href={`/letters/${l.slug || l._id}`} onClick={() => { setShowResults(false); setSearchFocused(false); clearSearch() }} className="flex items-center gap-3 p-3 hover:bg-white/[0.04] rounded-xl transition-all group">
                                                    <div className="w-12 h-12 rounded-lg bg-violet-500/15 flex items-center justify-center"><Mail size={18} className="text-violet-400" /></div>
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-sm text-gray-200 truncate">{l.title}</p>
                                                        <p className="text-[10px] text-gray-500 mt-0.5">{l.category}</p>
                                                    </div>
                                                    <ChevronRight size={14} className="text-gray-600 group-hover:text-violet-400 shrink-0" />
                                                </Link>
                                            ))}
                                        </div>
                                    )}
                                    <button onClick={handleSearchSubmit} className="w-full p-3.5 bg-white/[0.03] hover:bg-white/[0.06] text-sm text-gray-300 hover:text-white transition-all flex items-center justify-center gap-2 border-t border-white/[0.04]">
                                        مشاهده همه نتایج <ArrowRight size={14} />
                                    </button>
                                </div>
                            )}

                            {showNoResults && (
                                <div className="absolute top-full mt-2 left-0 right-0 max-w-[700px] mx-auto bg-[#060b1a]/98 p-8 text-center rounded-2xl border border-white/[0.06] shadow-2xl backdrop-blur-3xl z-[100] animate-fade-in">
                                    <Search size={32} className="mx-auto text-gray-700 mb-3" strokeWidth={1} />
                                    <p className="text-sm text-gray-500">نتیجه‌ای یافت نشد</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* ============ MOBILE SEARCH ============ */}
                    <div className="md:hidden relative w-full mt-3">
                        <form onSubmit={handleSearchSubmit} className="relative">
                            <div className="relative flex items-center">
                                <Search className={`absolute left-4 top-1/2 -translate-y-1/2 transition-all duration-300 ${searchFocused ? "text-blue-400" : "text-gray-500"}`} size={16} strokeWidth={1.5} />
                                <input
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    onFocus={() => { setSearchFocused(true); if (search.length > 2) setShowResults(true) }}
                                    type="text" placeholder="جستجو کنید..."
                                    className="w-full pl-11 pr-10 py-2.5 rounded-2xl text-sm bg-white/[0.04] text-white placeholder:text-gray-600 border border-white/[0.06] focus:border-blue-500/30 focus:bg-white/[0.06] outline-none transition-all duration-300"
                                />
                                {loading && <Loader2 className="absolute right-9 top-1/2 -translate-y-1/2 text-blue-400 animate-spin" size={14} />}
                                {search && (
                                    <button type="button" onClick={clearSearch} className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 rounded-lg hover:bg-white/[0.06] text-gray-500 hover:text-white transition-all">
                                        <X size={14} strokeWidth={1.5} />
                                    </button>
                                )}
                            </div>
                        </form>

                        {/* Mobile Results */}
                        {hasResults && showResults && (
                            <div className="absolute top-full mt-2 w-full bg-[#060b1a]/98 border border-white/[0.08] rounded-2xl shadow-2xl backdrop-blur-3xl overflow-hidden z-[100] animate-fade-in">
                                {results!.products.length > 0 && (
                                    <div className="p-3">
                                        <p className="text-[10px] text-blue-400/60 font-bold px-2 mb-2 flex items-center gap-2"><ShoppingBag size={11} /> محصولات</p>
                                        {results!.products.slice(0, 3).map((p) => (
                                            <Link key={p._id} href={`/products/${p._id}`} onClick={() => { setShowResults(false); setSearchFocused(false); clearSearch() }} className="flex items-center gap-3 p-2.5 hover:bg-white/[0.04] rounded-xl transition-all group">
                                                <img src={p.images?.[0] || "/no-img.png"} className="w-10 h-10 rounded-lg object-cover border border-white/[0.06]" alt="" />
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm text-gray-200 truncate">{p.title}</p>
                                                    <p className="text-xs text-blue-400/80 mt-0.5">{p.price?.toLocaleString()} تومان</p>
                                                </div>
                                                <ChevronRight size={14} className="text-gray-600 group-hover:text-blue-400 shrink-0" />
                                            </Link>
                                        ))}
                                    </div>
                                )}
                                {results!.products.length > 0 && results!.letters.length > 0 && <div className="mx-4 h-px bg-white/[0.04]" />}
                                {results!.letters.length > 0 && (
                                    <div className="p-3">
                                        <p className="text-[10px] text-violet-400/60 font-bold px-2 mb-2 flex items-center gap-2"><Mail size={11} /> پاکت نامه‌ها</p>
                                        {results!.letters.slice(0, 3).map((l) => (
                                            <Link key={l._id} href={`/letters/${l.slug || l._id}`} onClick={() => { setShowResults(false); setSearchFocused(false); clearSearch() }} className="flex items-center gap-3 p-2.5 hover:bg-white/[0.04] rounded-xl transition-all group">
                                                <div className="w-10 h-10 rounded-lg bg-violet-500/15 flex items-center justify-center"><Mail size={16} className="text-violet-400" /></div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm text-gray-200 truncate">{l.title}</p>
                                                    <p className="text-[10px] text-gray-500 mt-0.5">{l.category}</p>
                                                </div>
                                                <ChevronRight size={14} className="text-gray-600 group-hover:text-violet-400 shrink-0" />
                                            </Link>
                                        ))}
                                    </div>
                                )}
                                <button onClick={handleSearchSubmit} className="w-full p-3 bg-white/[0.03] hover:bg-white/[0.06] text-sm text-gray-300 hover:text-white transition-all flex items-center justify-center gap-2 border-t border-white/[0.04]">
                                    مشاهده همه نتایج <ArrowRight size={14} />
                                </button>
                            </div>
                        )}

                        {showNoResults && (
                            <div className="absolute top-full mt-2 w-full bg-[#060b1a]/98 p-6 text-center rounded-2xl border border-white/[0.06] shadow-2xl backdrop-blur-3xl z-[100] animate-fade-in">
                                <Search size={28} className="mx-auto text-gray-700 mb-2" strokeWidth={1} />
                                <p className="text-sm text-gray-500">نتیجه‌ای یافت نشد</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Floating particles */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
                    {particles.map((p) => {
                        const ParticleIcon = p.icon
                        return (
                            <div key={p.id} className="absolute animate-float-particle" style={{ top: `${p.top}%`, left: `${p.left}%`, animationDelay: `${p.delay}s`, animationDuration: `${p.duration}s` }}>
                                <ParticleIcon size={10} className="text-blue-400/20" />
                            </div>
                        )
                    })}
                </div>
            </header>

            {/* Mobile Menu */}
            <div className={`fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] transition-all duration-300 ${openMobileMenu ? "opacity-100 visible" : "opacity-0 invisible"}`} onClick={() => setOpenMobileMenu(false)} />
            <aside className={`fixed right-0 top-0 h-full w-72 bg-[#050912]/98 border-l border-white/[0.05] shadow-2xl z-[70] transition-transform duration-300 ease-out ${openMobileMenu ? "translate-x-0" : "translate-x-full"}`}>
                <div className="flex flex-col h-full">
                    <div className="flex items-center justify-between p-5 border-b border-white/[0.04]">
                        <span className="text-white font-bold text-base">منو</span>
                        <button onClick={() => setOpenMobileMenu(false)} className="p-2 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] text-gray-400 hover:text-white transition-all"><X size={17} strokeWidth={1.5} /></button>
                    </div>
                    <nav className="flex-1 p-3 space-y-0.5">
                        {MENU_ITEMS.map((item) => {
                            const Icon = item.icon
                            const active = isActive(item.href)
                            return (
                                <Link key={item.href} href={item.href} onClick={() => setOpenMobileMenu(false)} className={`flex items-center gap-3 px-4 py-3.5 rounded-2xl transition-all duration-200 ${active ? "bg-blue-500/10 text-white border border-blue-500/15" : "text-gray-400 hover:text-white hover:bg-white/[0.03]"}`}>
                                    <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${active ? "bg-blue-500/20" : "bg-white/[0.03]"}`}><Icon size={18} strokeWidth={active ? 2 : 1.5} className={active ? "text-blue-400" : ""} /></div>
                                    <span className="font-medium text-sm">{item.label}</span>
                                </Link>
                            )
                        })}
                        {/* 🆕 Download App in Mobile Menu */}
                        <Link href="/app" onClick={() => setOpenMobileMenu(false)} className="flex items-center gap-3 px-4 py-3.5 rounded-2xl transition-all duration-200 text-gray-400 hover:text-white hover:bg-white/[0.03]">
                            <div className="w-9 h-9 rounded-lg flex items-center justify-center bg-white/[0.03]">
                                <Download size={18} strokeWidth={1.5} className="text-emerald-400" />
                            </div>
                            <span className="font-medium text-sm">دانلود اپلیکیشن</span>
                            <span className="mr-auto w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                        </Link>
                    </nav>
                    <div className="p-4 border-t border-white/[0.04] text-center text-[10px] text-gray-600">BluZiperld © 2026</div>
                </div>
            </aside>

            <style jsx>{`
                @keyframes float-particle {
                    0%, 100% { transform: translateY(0) scale(1); opacity: 0; }
                    15% { opacity: 1; }
                    85% { opacity: 1; }
                    100% { transform: translateY(-25px) scale(0.6); opacity: 0; }
                }
                .animate-float-particle { animation: float-particle 5s ease-in-out infinite; }
                @keyframes fade-in {
                    from { opacity: 0; transform: translateY(-8px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .animate-fade-in { animation: fade-in 0.25s ease-out; }
            `}</style>
        </>
    )
}