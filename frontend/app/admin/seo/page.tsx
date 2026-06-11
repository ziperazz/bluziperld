"use client";

import { useEffect, useState } from "react";
import { Search, Check, AlertTriangle, X, RefreshCw } from "lucide-react";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export default function AdminSEOPage() {
    const [products, setProducts] = useState<any[]>([]);
    const [letters, setLetters] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState("all"); // all, good, warning, bad

    const fetchData = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem("accessToken");
            const [pRes, lRes] = await Promise.all([
                fetch(`${API}/api/products`, { headers: { Authorization: `Bearer ${token}` } }),
                fetch(`${API}/api/letters`, { headers: { Authorization: `Bearer ${token}` } }),
            ]);
            const pData = await pRes.json();
            const lData = await lRes.json();
            setProducts(Array.isArray(pData) ? pData : []);
            setLetters(Array.isArray(lData) ? lData : []);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchData(); }, []);

    const getSEOStatus = (item: any) => {
        const hasTitle = item.metaTags?.title?.length > 0;
        const hasDesc = item.metaTags?.description?.length > 0;
        const hasKeywords = item.metaTags?.keywords?.length > 0;
        const score = [hasTitle, hasDesc, hasKeywords].filter(Boolean).length;

        if (score === 3) return { status: "good", label: "کامل", color: "text-emerald-400", bg: "bg-emerald-500/10" };
        if (score >= 1) return { status: "warning", label: "ناقص", color: "text-yellow-400", bg: "bg-yellow-500/10" };
        return { status: "bad", label: "خالی", color: "text-red-400", bg: "bg-red-500/10" };
    };

    const allItems = [...products.map(p => ({ ...p, type: "product" })), ...letters.map(l => ({ ...l, type: "letter" }))];

    const filteredItems = filter === "all" 
        ? allItems 
        : allItems.filter(i => getSEOStatus(i).status === filter);

    const stats = {
        total: allItems.length,
        good: allItems.filter(i => getSEOStatus(i).status === "good").length,
        warning: allItems.filter(i => getSEOStatus(i).status === "warning").length,
        bad: allItems.filter(i => getSEOStatus(i).status === "bad").length,
    };

    if (loading) {
        return (
            <div className="p-6 flex items-center justify-center">
                <RefreshCw size={24} className="text-blue-400 animate-spin" />
            </div>
        );
    }

    return (
        <div className="p-4 md:p-6 space-y-6" dir="rtl">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-black text-white flex items-center gap-2">
                        <Search size={28} className="text-yellow-400" />
                        وضعیت سئو
                    </h1>
                    <p className="text-gray-500 text-xs mt-1">{stats.total} آیتم | {stats.good} کامل | {stats.warning} ناقص | {stats.bad} خالی</p>
                </div>
                <button onClick={fetchData} className="p-2 rounded-xl hover:bg-white/5 text-gray-400 hover:text-white transition">
                    <RefreshCw size={18} />
                </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-3">
                <div className="p-4 rounded-2xl bg-emerald-500/5 border border-emerald-500/10 text-center">
                    <p className="text-2xl font-black text-emerald-400">{stats.good}</p>
                    <p className="text-[10px] text-gray-500 mt-1">کامل ✅</p>
                </div>
                <div className="p-4 rounded-2xl bg-yellow-500/5 border border-yellow-500/10 text-center">
                    <p className="text-2xl font-black text-yellow-400">{stats.warning}</p>
                    <p className="text-[10px] text-gray-500 mt-1">ناقص ⚠️</p>
                </div>
                <div className="p-4 rounded-2xl bg-red-500/5 border border-red-500/10 text-center">
                    <p className="text-2xl font-black text-red-400">{stats.bad}</p>
                    <p className="text-[10px] text-gray-500 mt-1">خالی ❌</p>
                </div>
            </div>

            {/* Filter */}
            <div className="flex gap-2">
                {[
                    { value: "all", label: "همه" },
                    { value: "good", label: "کامل" },
                    { value: "warning", label: "ناقص" },
                    { value: "bad", label: "خالی" },
                ].map(f => (
                    <button
                        key={f.value}
                        onClick={() => setFilter(f.value)}
                        className={`px-4 py-2 rounded-xl text-xs font-medium transition-all ${
                            filter === f.value
                                ? "bg-blue-600 text-white"
                                : "bg-[#0a0f1c] text-gray-400 border border-[#1a2540] hover:text-white"
                        }`}
                    >
                        {f.label}
                    </button>
                ))}
            </div>

            {/* List */}
            <div className="space-y-2">
                {filteredItems.map((item: any) => {
                    const seo = getSEOStatus(item);
                    return (
                        <div key={item._id} className="flex items-center justify-between p-3 rounded-xl bg-[#0a0f1c]/60 border border-[#1a2540]">
                            <div className="flex items-center gap-3 min-w-0">
                                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${seo.bg}`}>
                                    {seo.status === "good" ? <Check size={14} className={seo.color} /> :
                                     seo.status === "warning" ? <AlertTriangle size={14} className={seo.color} /> :
                                     <X size={14} className={seo.color} />}
                                </div>
                                <div className="min-w-0">
                                    <p className="text-sm text-white truncate">{item.title}</p>
                                    <div className="flex items-center gap-2 text-[10px] text-gray-600">
                                        <span>{item.type === "product" ? "محصول" : "پاکت نامه"}</span>
                                        <span>|</span>
                                        <span>{item.metaTags?.title?.length || 0} کاراکتر عنوان</span>
                                    </div>
                                </div>
                            </div>
                            <span className={`text-[10px] px-2 py-1 rounded-lg ${seo.bg} ${seo.color}`}>
                                {seo.label}
                            </span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}