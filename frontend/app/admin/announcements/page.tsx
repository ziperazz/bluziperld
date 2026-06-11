"use client";

import { useState, useEffect } from "react";
import { Plus, Trash2, Edit, Eye, EyeOff } from "lucide-react";

type Announcement = {
    _id: string;
    text: string;
    isActive: boolean;
    backgroundColor: string;
    textColor: string;
    link: string;
};

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export default function AdminAnnouncementsPage() {
    const [announcements, setAnnouncements] = useState<Announcement[]>([]);
    const [loading, setLoading] = useState(true);
    const [form, setForm] = useState({
        text: "",
        backgroundColor: "#0f172a",
        textColor: "#ffffff",
        link: "",
        isActive: true,
    });
    const [editingId, setEditingId] = useState<string | null>(null);
    const [token, setToken] = useState("");

    useEffect(() => {
        setToken(localStorage.getItem("accessToken") || "");
        fetchAnnouncements();
    }, []);

    const fetchAnnouncements = async () => {
        try {
            const t = localStorage.getItem("accessToken") || "";
            const res = await fetch(`${API}/api/announcements`, {
                headers: { Authorization: `Bearer ${t}` },
            });
            const data = await res.json();
            if (data.success) setAnnouncements(data.announcements);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const t = localStorage.getItem("accessToken") || "";

        const url = editingId
            ? `${API}/api/announcements/${editingId}`
            : `${API}/api/announcements`;

        const method = editingId ? "PUT" : "POST";

        await fetch(url, {
            method,
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${t}`,
            },
            body: JSON.stringify(form),
        });

        setForm({ text: "", backgroundColor: "#0f172a", textColor: "#ffffff", link: "", isActive: true });
        setEditingId(null);
        fetchAnnouncements();
    };

    const handleDelete = async (id: string) => {
        if (!confirm("مطمئنی؟")) return;
        const t = localStorage.getItem("accessToken") || "";
        await fetch(`${API}/api/announcements/${id}`, {
            method: "DELETE",
            headers: { Authorization: `Bearer ${t}` },
        });
        fetchAnnouncements();
    };

    const handleEdit = (a: Announcement) => {
        setForm({
            text: a.text,
            backgroundColor: a.backgroundColor,
            textColor: a.textColor,
            link: a.link,
            isActive: a.isActive,
        });
        setEditingId(a._id);
    };

    if (loading) return <div className="p-10 text-center text-white">در حال بارگذاری...</div>;

    return (
        <div className="p-6 text-right" dir="rtl">
            <h1 className="text-2xl font-bold text-white mb-6">مدیریت اعلان‌ها</h1>

            {/* فرم */}
            <form onSubmit={handleSubmit} className="mb-8 bg-white/5 p-6 rounded-2xl border border-white/10 space-y-4">
                <div>
                    <label className="text-white text-sm block mb-2">متن اعلان</label>
                    <input
                        type="text"
                        value={form.text}
                        onChange={(e) => setForm({ ...form, text: e.target.value })}
                        className="w-full p-3 rounded-xl bg-white/10 text-white border border-white/10"
                        placeholder="مثلاً: 🚚 ارسال رایگان برای سفارش‌های بالای ۵۰۰ هزار تومان"
                        required
                    />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="text-white text-sm block mb-2">رنگ پس‌زمینه</label>
                        <input
                            type="color"
                            value={form.backgroundColor}
                            onChange={(e) => setForm({ ...form, backgroundColor: e.target.value })}
                            className="w-full h-10 rounded-xl"
                        />
                    </div>
                    <div>
                        <label className="text-white text-sm block mb-2">رنگ متن</label>
                        <input
                            type="color"
                            value={form.textColor}
                            onChange={(e) => setForm({ ...form, textColor: e.target.value })}
                            className="w-full h-10 rounded-xl"
                        />
                    </div>
                </div>

                <div>
                    <label className="text-white text-sm block mb-2">لینک (اختیاری)</label>
                    <input
                        type="text"
                        value={form.link}
                        onChange={(e) => setForm({ ...form, link: e.target.value })}
                        className="w-full p-3 rounded-xl bg-white/10 text-white border border-white/10"
                        placeholder="مثلاً: /offers"
                    />
                </div>

                <div className="flex items-center gap-2">
                    <input
                        type="checkbox"
                        checked={form.isActive}
                        onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
                        className="w-5 h-5"
                    />
                    <label className="text-white text-sm">فعال باشد</label>
                </div>

                <button
                    type="submit"
                    className="bg-blue-600 text-white px-6 py-3 rounded-xl flex items-center gap-2 hover:bg-blue-700 transition"
                >
                    <Plus size={18} />
                    {editingId ? "بروزرسانی اعلان" : "افزودن اعلان"}
                </button>
            </form>

            {/* لیست اعلان‌ها */}
            <div className="space-y-3">
                {announcements.map((a) => (
                    <div
                        key={a._id}
                        className="flex items-center justify-between p-4 rounded-xl border border-white/10 bg-white/5"
                        style={{ borderRight: `4px solid ${a.backgroundColor}` }}
                    >
                        <div className="flex items-center gap-3">
                            {a.isActive ? (
                                <Eye size={18} className="text-green-400" />
                            ) : (
                                <EyeOff size={18} className="text-red-400" />
                            )}
                            <span className="text-white">{a.text}</span>
                        </div>

                        <div className="flex items-center gap-2">
                            <button onClick={() => handleEdit(a)} className="p-2 text-blue-400 hover:bg-white/10 rounded-lg">
                                <Edit size={18} />
                            </button>
                            <button onClick={() => handleDelete(a._id)} className="p-2 text-red-400 hover:bg-white/10 rounded-lg">
                                <Trash2 size={18} />
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}