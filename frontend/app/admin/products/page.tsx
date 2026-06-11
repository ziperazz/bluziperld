"use client";

import React, { useEffect, useState } from "react";
import {
  Trash2, Edit, Plus, Search, Eye, Package,
  ImageIcon, Tag, Hash, TrendingUp
} from "lucide-react";
import ModalProductForm from "./ModalProductForm";

interface Product {
  _id: string;
  title: string;
  price: number;
  discount?: number;
  priceAfterDiscount?: number;
  instock: number;
  category: string;
  images?: string[];
  visits?: number;
  purchaseCount?: number;
  description?: string;
  ratingAverage?: number;
  rating?: number;
  specs?: Record<string, any>;
}

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  useEffect(() => { fetchProducts(); }, []);

  const fetchProducts = async () => {
    try {
      const res = await fetch(`${API}/api/products`);
      const data = await res.json();
      setProducts(data);
    } catch (error) {
      console.error("خطا در دریافت محصولات:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("آیا از حذف این محصول مطمئن هستید؟")) return;
    try {
      const res = await fetch(`${API}/api/products/${id}`, { method: "DELETE" });
      if (res.ok) setProducts((prev) => prev.filter((p) => p._id !== id));
    } catch (error) {
      alert("خطا در حذف");
    }
  };

  const handleSave = async (data: any) => {
    try {
      const formData = new FormData();
      formData.append("title", data.title);
      formData.append("price", String(data.price));
      formData.append("discount", String(data.discount || 0));
      formData.append("instock", String(data.instock));
      formData.append("category", data.category);
      formData.append("description", data.description || "");
      formData.append("purchaseCount", String(data.purchaseCount || 0));
      formData.append("ratingAverage", String(data.ratingAverage || 0));
      formData.append("rating", String(data.rating || 0));
      formData.append("visits", String(data.visits || 0));

      if (data.specs) formData.append("specs", JSON.stringify(data.specs));
      if (data.imageFiles && data.imageFiles.length > 0) {
        data.imageFiles.forEach((file: File) => formData.append("images", file));
      }
      if (data.images && data.images.length > 0) {
        formData.append("existingImages", JSON.stringify(data.images));
      }

      let url = `${API}/api/products`;
      let method = "POST";
      if (editingProduct) {
        url = `${API}/api/products/${editingProduct._id}`;
        method = "PUT";
      }

      const res = await fetch(url, { method, body: formData });
      if (res.ok) {
        setIsModalOpen(false);
        setEditingProduct(null);
        fetchProducts();
      } else {
        const errorText = await res.text();
        alert(`خطا در ذخیره‌سازی: ${errorText || res.statusText}`);
      }
    } catch (err) {
      alert("خطا در اتصال به سرور");
    }
  };

  const filteredProducts = products.filter((p) =>
    p.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-4 md:p-6 space-y-6" dir="rtl">

      {/* ===== HEADER ===== */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-white flex items-center gap-2">
            <Package size={28} className="text-blue-400" />
            محصولات
          </h1>
          <p className="text-gray-500 text-xs md:text-sm mt-1">{products.length} محصول</p>
        </div>

        <button
          onClick={() => { setEditingProduct(null); setIsModalOpen(true); }}
          className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl
            bg-gradient-to-r from-blue-600 to-blue-500 text-white font-bold text-sm
            hover:from-blue-500 hover:to-blue-400 transition-all shadow-lg shadow-blue-500/20
            active:scale-95"
        >
          <Plus size={18} />
          محصول جدید
        </button>
      </div>

      {/* ===== SEARCH ===== */}
      <div className="relative">
        <Search size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500" />
        <input
          type="text"
          placeholder="جستجو در محصولات..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full bg-[#0a0f1c] border border-[#1a2540] rounded-xl py-2.5 pr-10 pl-4
            text-sm text-white placeholder:text-gray-600 focus:border-blue-500/50 outline-none transition-all"
        />
      </div>

      {/* ===== PRODUCTS GRID ===== */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-40 rounded-2xl bg-white/[0.02] animate-pulse" />
          ))}
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="text-center py-16">
          <Package size={40} className="text-gray-600 mx-auto mb-3" />
          <p className="text-gray-500 text-sm">محصولی یافت نشد</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredProducts.map((product) => (
            <div
              key={product._id}
              className="group relative p-4 rounded-2xl bg-[#0a0f1c]/60 border border-[#1a2540]
                hover:border-blue-500/20 hover:bg-[#0a0f1c]/80 transition-all duration-300"
            >
              {/* Actions - Top Left */}
              <div className="absolute top-3 left-3 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => { setEditingProduct(product); setIsModalOpen(true); }}
                  className="p-1.5 rounded-lg bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 transition"
                >
                  <Edit size={14} />
                </button>
                <button
                  onClick={() => handleDelete(product._id)}
                  className="p-1.5 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition"
                >
                  <Trash2 size={14} />
                </button>
              </div>

              {/* Content */}
              <div className="flex gap-4">
                {/* Image */}
                <div className="w-20 h-20 rounded-xl bg-[#050d27] border border-[#1a2540] overflow-hidden shrink-0 flex items-center justify-center">
                  {product.images?.[0] ? (
                    <img src={product.images[0]} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <ImageIcon size={24} className="text-gray-600" />
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-bold text-white truncate">{product.title}</h3>
                  
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs text-gray-500 flex items-center gap-1">
                      <Tag size={11} /> {product.category}
                    </span>
                  </div>

                  {/* Price */}
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-sm font-bold text-blue-400">
                      {(product.priceAfterDiscount ?? product.price).toLocaleString()} تومان
                    </span>
                    {product.discount ? (
                      <span className="text-[10px] text-gray-600 line-through">
                        {product.price.toLocaleString()}
                      </span>
                    ) : null}
                  </div>

                  {/* Stats */}
                  <div className="flex items-center gap-3 mt-3 text-[10px] text-gray-600">
                    <span className={`flex items-center gap-1 ${product.instock > 0 ? "text-emerald-400" : "text-red-400"}`}>
                      <Package size={11} /> {product.instock} عدد
                    </span>
                    <span className="flex items-center gap-1">
                      <TrendingUp size={11} /> {product.purchaseCount ?? 0} فروش
                    </span>
                    <span className="flex items-center gap-1">
                      <Eye size={11} /> {product.visits ?? 0} بازدید
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      <ModalProductForm
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        editData={editingProduct}
        onSave={handleSave}
      />
    </div>
  );
}