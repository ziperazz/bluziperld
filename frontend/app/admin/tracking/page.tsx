"use client";

import { useEffect, useState } from "react";
import { Search, Send, Check, Truck, Hash, Package, Clock } from "lucide-react";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export default function AdminTrackingPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [updating, setUpdating] = useState<string | null>(null);
  const [trackingInputs, setTrackingInputs] = useState<Record<string, string>>({});
  const [successMsg, setSuccessMsg] = useState("");

  // لود سفارش‌های ارسال شده و در حال پردازش
  const fetchOrders = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("accessToken");
      const res = await fetch(`${API}/api/orders?status=SHIPPED,PROCESSING`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success || Array.isArray(data)) {
        setOrders(Array.isArray(data) ? data : data.orders || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchOrders(); }, []);

  const updateTracking = async (orderId: string) => {
    const code = trackingInputs[orderId]?.trim();
    if (!code) return;

    setUpdating(orderId);
    try {
      const token = localStorage.getItem("accessToken");
      const res = await fetch(`${API}/api/orders/${orderId}/tracking`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ postTrackingCode: code }),
      });
      const data = await res.json();

      if (data.success) {
        setSuccessMsg(`✅ کد رهگیری ${code} با موفقیت ثبت شد`);
        setTimeout(() => setSuccessMsg(""), 3000);
        setTrackingInputs((prev) => ({ ...prev, [orderId]: "" }));
        fetchOrders();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setUpdating(null);
    }
  };

  const filteredOrders = orders.filter((o) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      o.trackingCode?.toLowerCase().includes(q) ||
      o.shipping?.fullName?.toLowerCase().includes(q) ||
      o.shipping?.phone?.includes(q) ||
      o.postTrackingCode?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="p-4 md:p-6 max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
          <Truck size={20} className="text-blue-400" />
        </div>
        <div>
          <h1 className="text-lg md:text-xl font-black text-white">مدیریت کد رهگیری</h1>
          <p className="text-xs text-gray-500">کد رهگیری پست را برای سفارش‌های ارسال شده وارد کنید</p>
        </div>
      </div>

      {/* Success Message */}
      {successMsg && (
        <div className="flex items-center gap-2 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm">
          <Check size={16} /> {successMsg}
        </div>
      )}

      {/* Search */}
      <div className="relative">
        <Search size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500" />
        <input
          type="text"
          placeholder="جستجو با کد سفارش، نام مشتری یا کد رهگیری..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-[#0a0f1c] border border-[#1a2540] rounded-xl py-2.5 pr-10 pl-4 text-sm text-white placeholder:text-gray-600 focus:border-blue-500/50 outline-none transition-all"
        />
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex justify-center py-10">
          <Package size={24} className="text-blue-400 animate-pulse" />
        </div>
      )}

      {/* Orders List */}
      {!loading && (
        <div className="space-y-3">
          {filteredOrders.length === 0 ? (
            <div className="text-center py-10 text-gray-500 text-sm">
              <Clock size={32} className="mx-auto mb-2 text-gray-600" />
              سفارشی برای نمایش وجود ندارد
            </div>
          ) : (
            filteredOrders.map((order) => (
              <div
                key={order._id}
                className="p-4 rounded-2xl bg-[#0a0f1c]/60 border border-[#1a2540] hover:border-blue-500/20 transition-all space-y-3"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  {/* Info */}
                  <div className="space-y-1.5 flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-mono text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded-lg">
                        {order.trackingCode}
                      </span>
                      <span className="text-xs text-gray-500">
                        {order.shipping?.fullName}
                      </span>
                      <span className="text-[10px] text-gray-600" dir="ltr">
                        {order.shipping?.phone}
                      </span>
                    </div>

                    {/* کد رهگیری فعلی (اگه داره) */}
                    {order.postTrackingCode && (
                      <div className="flex items-center gap-2 text-xs">
                        <Hash size={12} className="text-emerald-400" />
                        <span className="text-emerald-400 font-mono">{order.postTrackingCode}</span>
                        <span className="text-[10px] text-gray-600">(ثبت شده)</span>
                      </div>
                    )}
                  </div>

                  {/* Input + Button */}
                  <div className="flex items-center gap-2 shrink-0">
                    <input
                      type="text"
                      placeholder="کد رهگیری پست..."
                      value={trackingInputs[order._id] || ""}
                      onChange={(e) =>
                        setTrackingInputs((prev) => ({
                          ...prev,
                          [order._id]: e.target.value,
                        }))
                      }
                      className="w-40 md:w-52 bg-[#050d27] border border-[#1a2540] rounded-lg px-3 py-2 text-xs text-white placeholder:text-gray-600 focus:border-blue-500/50 outline-none transition-all text-center font-mono"
                    />
                    <button
                      onClick={() => updateTracking(order._id)}
                      disabled={updating === order._id || !trackingInputs[order._id]?.trim()}
                      className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      {updating === order._id ? (
                        <span className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      ) : (
                        <Send size={13} />
                      )}
                      ثبت
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}