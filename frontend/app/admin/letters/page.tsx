"use client";

import React, { useEffect, useState } from "react";
import {
  Trash2, Edit, Plus, Search, Printer, PenTool,
  Eye, Package, ShoppingBag, ImageIcon, Tag
} from "lucide-react";
import ModalLetterForm from "./ModalLetterForm";

interface Letter {
  _id: string;
  title: string;
  price: number;
  description?: string;
  category: string;
  discount?: number;
  priceAfterDiscount?: number;
  instock: number;
  images?: string[];
  isActive?: boolean;
  printingExtraPrice?: number;
  handwritingExtraPrice?: number;
  visits?: number;
  purchaseCount?: number;
  ratingAverage?: number;
  rating?: number;
  specs?: any[];
}

const API_BASE = `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/api/letters`;

export default function AdminLettersPage() {
  const [letters, setLetters] = useState<Letter[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingLetter, setEditingLetter] = useState<Letter | null>(null);

  useEffect(() => { fetchLetters(); }, []);

  const fetchLetters = async () => {
    try {
      setLoading(true);
      const res = await fetch(API_BASE);
      if (!res.ok) throw new Error("خطا در دریافت");
      const data = await res.json();
      setLetters(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("خطا در دریافت:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("آیا از حذف این پاکت‌نامه مطمئن هستید؟")) return;
    try {
      const res = await fetch(`${API_BASE}/${id}`, { method: "DELETE" });
      if (res.ok) setLetters((prev) => prev.filter((item) => item._id !== id));
    } catch (error) {
      alert("خطا در حذف");
    }
  };

  const handleSaveLetter = async (data: any) => {
    try {
      const formData = new FormData();

      const fields = [
        "title", "description", "category", "price", "discount", "instock",
        "isActive", "printingExtraPrice", "handwritingExtraPrice",
        "visits", "purchaseCount", "ratingAverage", "rating",
      ];

      fields.forEach((key) => {
        const value = data?.[key];
        if (value !== undefined && value !== null && value !== "") {
          formData.append(key, String(value));
        }
      });

      if (data?.specs) formData.append("specs", JSON.stringify(data.specs));

      if (Array.isArray(data?.images)) {
        data.images.forEach((img: string) => {
          if (typeof img === "string" && img.trim()) {
            formData.append("existingImages", img.trim());
          }
        });
      }

      if (Array.isArray(data?.imageFiles)) {
        data.imageFiles.forEach((file: File) => {
          if (file instanceof File) formData.append("images", file);
        });
      }

      const isEditMode = !!editingLetter?._id;
      const url = isEditMode ? `${API_BASE}/${editingLetter._id}` : API_BASE;
      const method = isEditMode ? "PUT" : "POST";

      const res = await fetch(url, { method, body: formData });

      if (!res.ok) {
        const msg = await res.text();
        alert(`خطا در ذخیره: ${msg}`);
        return;
      }

      setModalOpen(false);
      setEditingLetter(null);
      await fetchLetters();
    } catch (err) {
      alert("خطا در اتصال به سرور");
    }
  };

  const filteredLetters = letters.filter((letter) =>
    letter.title?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-4 md:p-6 space-y-6" dir="rtl">

      {/* ===== HEADER ===== */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-white flex items-center gap-2">
            <Package size={28} className="text-blue-400" />
            پاکت‌نامه‌ها
          </h1>
          <p className="text-gray-500 text-xs md:text-sm mt-1">{letters.length} پاکت‌نامه</p>
        </div>

        <button
          onClick={() => { setEditingLetter(null); setModalOpen(true); }}
          className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl
            bg-gradient-to-r from-blue-600 to-blue-500 text-white font-bold text-sm
            hover:from-blue-500 hover:to-blue-400 transition-all shadow-lg shadow-blue-500/20
            active:scale-95"
        >
          <Plus size={18} />
          پاکت‌نامه جدید
        </button>
      </div>

      {/* ===== SEARCH ===== */}
      <div className="relative">
        <Search size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500" />
        <input
          type="text"
          placeholder="جستجو در پاکت‌نامه‌ها..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full bg-[#0a0f1c] border border-[#1a2540] rounded-xl py-2.5 pr-10 pl-4
            text-sm text-white placeholder:text-gray-600 focus:border-blue-500/50 outline-none transition-all"
        />
      </div>

      {/* ===== LETTERS GRID ===== */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-44 rounded-2xl bg-white/[0.02] animate-pulse" />
          ))}
        </div>
      ) : filteredLetters.length === 0 ? (
        <div className="text-center py-16">
          <Package size={40} className="text-gray-600 mx-auto mb-3" />
          <p className="text-gray-500 text-sm">پاکت‌نامه‌ای یافت نشد</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredLetters.map((letter) => (
            <div
              key={letter._id}
              className="group relative p-4 rounded-2xl bg-[#0a0f1c]/60 border border-[#1a2540]
                hover:border-blue-500/20 hover:bg-[#0a0f1c]/80 transition-all duration-300"
            >
              {/* Actions - Top Left */}
              <div className="absolute top-3 left-3 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => { setEditingLetter(letter); setModalOpen(true); }}
                  className="p-1.5 rounded-lg bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 transition"
                >
                  <Edit size={14} />
                </button>
                <button
                  onClick={() => handleDelete(letter._id)}
                  className="p-1.5 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition"
                >
                  <Trash2 size={14} />
                </button>
              </div>

              {/* Active/Inactive Badge */}
              <div className={`absolute top-3 right-3 text-[10px] px-2 py-0.5 rounded-lg font-medium
                ${letter.isActive ? "bg-emerald-500/10 text-emerald-400" : "bg-red-500/10 text-red-400"}`}>
                {letter.isActive ? "فعال" : "غیرفعال"}
              </div>

              {/* Content */}
              <div className="flex gap-4 mt-4">
                {/* Image */}
                <div className="w-20 h-20 rounded-xl bg-[#050d27] border border-[#1a2540] overflow-hidden shrink-0 flex items-center justify-center">
                  {letter.images?.[0] ? (
                    <img src={letter.images[0]} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <ImageIcon size={24} className="text-gray-600" />
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-bold text-white truncate">{letter.title}</h3>
                  
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs text-gray-500 flex items-center gap-1">
                      <Tag size={11} /> {letter.category}
                    </span>
                  </div>

                  {/* Price */}
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-sm font-bold text-blue-400">
                      {(letter.priceAfterDiscount ?? letter.price).toLocaleString()} تومان
                    </span>
                    {letter.discount ? (
                      <span className="text-[10px] text-gray-600 line-through">
                        {letter.price.toLocaleString()}
                      </span>
                    ) : null}
                  </div>

                  {/* Extra Services */}
                  <div className="flex items-center gap-3 mt-2 text-[10px]">
                    <span className="flex items-center gap-1 text-orange-400">
                      <Printer size={11} /> {(letter.printingExtraPrice ?? 0).toLocaleString()}
                    </span>
                    <span className="flex items-center gap-1 text-purple-400">
                      <PenTool size={11} /> {(letter.handwritingExtraPrice ?? 0).toLocaleString()}
                    </span>
                  </div>

                  {/* Stats */}
                  <div className="flex items-center gap-3 mt-2 text-[10px] text-gray-600">
                    <span className={`flex items-center gap-1 ${letter.instock > 0 ? "text-emerald-400" : "text-red-400"}`}>
                      <Package size={11} /> {letter.instock} عدد
                    </span>
                    <span className="flex items-center gap-1">
                      <ShoppingBag size={11} /> {letter.purchaseCount ?? 0} فروش
                    </span>
                    <span className="flex items-center gap-1">
                      <Eye size={11} /> {letter.visits ?? 0} بازدید
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      <ModalLetterForm
        isOpen={modalOpen}
        onClose={() => { setModalOpen(false); setEditingLetter(null); }}
        editData={editingLetter}
        onSave={handleSaveLetter}
      />
    </div>
  );
}