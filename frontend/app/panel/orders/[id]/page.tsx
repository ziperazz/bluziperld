"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  Clock, MapPin, Copy, Check, Package, Truck, CreditCard,
  ChevronRight, Home, ShoppingBag, User, Phone,
  Calendar, Hash, AlertCircle, ArrowRight, Search
} from "lucide-react";

/* ================= TYPES ================= */
type CartItem = {
  productId: string;
  productType: string;
  title?: string;
  image?: string;
  price: number;
  quantity: number;
  letterText?: string | null;
  writingType?: string;
};

type Order = {
  _id: string;
  trackingCode: string;
  postTrackingCode?: string | null;  // 🆕 کد رهگیری پست
  status: string;
  cart: CartItem[];
  shipping: {
    fullName: string;
    phone: string;
    address: string;
    postalCode: string;
    city: string;
    province?: string;
    shippingMethod?: string;
  };
  subtotal: number;
  shippingCost: number;
  total: number;
  createdAt: string;
};

/* ================= CONSTANTS ================= */
const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

// رنگ‌های محدود: آبی تیره + آبی + سبز + قرمز
const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string; border: string; icon: any }> = {
  PENDING_PAYMENT: { label: "در انتظار پرداخت", color: "text-blue-400", bg: "bg-blue-500/10", border: "border-blue-500/20", icon: CreditCard },
  PAID: { label: "پرداخت شده", color: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/20", icon: Check },
  PROCESSING: { label: "در حال پردازش", color: "text-blue-400", bg: "bg-blue-500/10", border: "border-blue-500/20", icon: Package },
  AWAITING_ADMIN_REVIEW: { label: "در انتظار بررسی", color: "text-blue-300", bg: "bg-blue-500/10", border: "border-blue-500/20", icon: Clock },
  SHIPPED: { label: "ارسال شده", color: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/20", icon: Truck },
  DELIVERED: { label: "تحویل شده", color: "text-emerald-300", bg: "bg-emerald-500/10", border: "border-emerald-500/20", icon: Check },
  CANCELLED: { label: "لغو شده", color: "text-red-400", bg: "bg-red-500/10", border: "border-red-500/20", icon: AlertCircle },
  FAILED: { label: "ناموفق", color: "text-red-400", bg: "bg-red-500/10", border: "border-red-500/20", icon: AlertCircle },
};

const formatPrice = (v: number) => new Intl.NumberFormat("fa-IR").format(v) + " تومان";
const formatDate = (d: string) => new Intl.DateTimeFormat("fa-IR", { year: "numeric", month: "long", day: "numeric" }).format(new Date(d));
const getImageUrl = (path?: string) => {
  if (!path) return "/placeholder.png";
  if (path.startsWith("http")) return path;
  return `${API}/${path.replace(/^\/+/, "")}`;
};

// استایل‌های ثابت
const glassBg = { background: "rgba(10,15,28,0.6)", backdropFilter: "blur(40px) saturate(180%)", WebkitBackdropFilter: "blur(40px) saturate(180%)" };
const glassBorder = "border-[#1a2540]";
const cardBg = "bg-[#0a0f1c]/50";

export default function OrderDetailsPage() {
  const { id } = useParams();
  const router = useRouter();

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const fetchOrder = useCallback(async () => {
    try {
      const token = localStorage.getItem("accessToken");
      if (!token) { router.push("/auth"); return; }
      const res = await fetch(`${API}/api/orders/${id}`, { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      if (data.success) setOrder(data.order);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, [id, router]);

  useEffect(() => { fetchOrder(); }, [fetchOrder]);

  const copyToClipboard = async (text: string, key: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(null), 2000);
  };

  if (!mounted || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-blue-500/10 flex items-center justify-center">
            <Package size={24} className="text-blue-400 animate-pulse" />
          </div>
          <p className="text-sm text-gray-500">در حال بارگذاری...</p>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center">
          <div className="w-16 h-16 rounded-2xl bg-red-500/10 flex items-center justify-center mx-auto mb-4">
            <AlertCircle size={28} className="text-red-400" />
          </div>
          <p className="text-red-400 text-sm font-medium">سفارش یافت نشد</p>
          <Link href="/panel/orders" className="inline-block mt-4 text-blue-400 text-sm hover:text-blue-300">بازگشت به سفارش‌ها</Link>
        </div>
      </div>
    );
  }

  const statusConfig = STATUS_CONFIG[order.status] || STATUS_CONFIG.PENDING_PAYMENT;
  const StatusIcon = statusConfig.icon;

  return (
    <main className="min-h-screen pb-20 px-4 py-6 md:py-8">
      <div className="max-w-3xl mx-auto space-y-5 md:space-y-6">

        {/* BREADCRUMB */}
        <nav className="flex items-center gap-2 text-[10px] md:text-xs text-gray-500">
          <Link href="/" className="hover:text-blue-400 transition-colors flex items-center gap-1"><Home size={11} /> خانه</Link>
          <ChevronRight size={10} />
          <Link href="/panel/orders" className="hover:text-blue-400 transition-colors flex items-center gap-1"><ShoppingBag size={11} /> سفارش‌ها</Link>
          <ChevronRight size={10} />
          <span className="text-gray-400 truncate max-w-[150px]">{order.trackingCode}</span>
        </nav>

        {/* STATUS CARD */}
        <div className={`relative p-5 md:p-6 rounded-2xl md:rounded-3xl border ${glassBorder} overflow-hidden`} style={glassBg}>
          <div className={`absolute top-0 right-0 w-[200px] h-[200px] ${statusConfig.bg} rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2`} />
          <div className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className={`w-12 h-12 md:w-14 md:h-14 rounded-2xl ${statusConfig.bg} ${statusConfig.border} border flex items-center justify-center`}>
                <StatusIcon size={24} className={statusConfig.color} strokeWidth={1.5} />
              </div>
              <div>
                <p className="text-[10px] md:text-xs text-gray-500 mb-0.5">وضعیت سفارش</p>
                <p className={`text-lg md:text-xl font-black ${statusConfig.color}`}>{statusConfig.label}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-[10px] md:text-xs text-gray-500">
              <Calendar size={13} className="text-gray-600" />
              <span>{formatDate(order.createdAt)}</span>
            </div>
          </div>

          {/* کد پیگیری سفارش */}
          <div className={`relative mt-5 flex items-center justify-between ${cardBg} border ${glassBorder} rounded-xl px-4 py-3`}>
            <div className="flex items-center gap-2 min-w-0">
              <Hash size={14} className="text-gray-500 shrink-0" />
              <p className="font-mono text-xs md:text-sm text-blue-400 tracking-wider truncate">{order.trackingCode}</p>
            </div>
            <button onClick={() => copyToClipboard(order.trackingCode, "tracking")}
              className="flex items-center gap-1.5 text-[10px] md:text-xs text-gray-500 hover:text-white transition-all shrink-0 ml-2">
              {copied === "tracking" ? <><Check size={14} className="text-emerald-400" /> کپی شد</> : <><Copy size={14} /> کپی</>}
            </button>
          </div>

          {/* 🆕 کد رهگیری ارسال پست/چاپار */}
          {order.postTrackingCode && (
            <div className="relative mt-3 flex items-center justify-between bg-emerald-500/5 border border-emerald-500/20 rounded-xl px-4 py-3">
              <div className="flex items-center gap-2 min-w-0">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center shrink-0">
                  <Truck size={14} className="text-emerald-400" />
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] text-gray-500 mb-0.5">کد رهگیری ارسال پست / چاپار</p>
                  <p className="font-mono text-xs md:text-sm text-emerald-400 tracking-wider truncate">{order.postTrackingCode}</p>
                </div>
              </div>
              <button onClick={() => copyToClipboard(order.postTrackingCode || "", "postTracking")}
                className="flex items-center gap-1.5 text-[10px] md:text-xs text-emerald-400/70 hover:text-emerald-300 transition-all shrink-0 ml-2">
                {copied === "postTracking" ? <><Check size={14} className="text-emerald-400" /> کپی شد</> : <><Copy size={14} /> کپی</>}
              </button>
            </div>
          )}

          {/* اگه کد رهگیری نداره ولی وضعیت ارسال شده است */}
          {!order.postTrackingCode && (order.status === "SHIPPED" || order.status === "PROCESSING") && (
            <div className="relative mt-3 flex items-center gap-3 bg-yellow-500/5 border border-yellow-500/20 rounded-xl px-4 py-3">
              <div className="w-8 h-8 rounded-lg bg-yellow-500/10 flex items-center justify-center shrink-0">
                <Truck size={14} className="text-yellow-400" />
              </div>
              <p className="text-[10px] md:text-xs text-yellow-400/80">
                کد رهگیری پست به‌زودی ثبت می‌شود. لطفاً پیگیر باشید.
              </p>
            </div>
          )}
        </div>

        {/* PRODUCTS */}
        <div className="space-y-3 md:space-y-4">
          <div className="flex items-center gap-2 text-xs md:text-sm text-gray-400">
            <Package size={15} className="text-blue-400" /> <span>محصولات سفارش</span>
          </div>

          {order.cart.map((item, i) => (
            <div key={i} className={`flex gap-3 md:gap-4 p-4 rounded-2xl border ${glassBorder} ${cardBg} hover:bg-[#0a0f1c]/80 transition-all`}>
              <img src={getImageUrl(item.image)} alt={item.title || "محصول"}
                className="w-16 h-16 md:w-20 md:h-20 rounded-xl object-cover border border-[#1a2540] shrink-0"
                onError={(e) => { (e.currentTarget as HTMLImageElement).src = "/placeholder.png" }} />
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <p className="text-sm md:text-base font-bold text-white truncate">{item.title || "محصول"}</p>
                  <span className="text-xs md:text-sm text-blue-400 font-bold whitespace-nowrap">{formatPrice(item.price * item.quantity)}</span>
                </div>
                <div className="flex items-center gap-3 mt-1.5">
                  <span className="text-[10px] md:text-xs text-gray-500">تعداد: {item.quantity}</span>
                  {item.writingType && (
                    <span className="text-[9px] md:text-[10px] px-2 py-0.5 rounded-lg bg-blue-500/10 text-blue-400">
                      {item.writingType === "HAND" ? "دست‌نویس" : "چاپ"}
                    </span>
                  )}
                </div>
                {item.productType === "letter" && item.letterText && (
                  <div className="mt-3 relative">
                    <button onClick={() => copyToClipboard(item.letterText || "", `letter-${i}`)}
                      className="absolute top-2 right-2 z-10 flex items-center gap-1 text-[10px] px-2 py-1 rounded-lg bg-white/10 hover:bg-white/20 transition text-white/70">
                      {copied === `letter-${i}` ? <Check size={11} /> : <Copy size={11} />}
                      {copied === `letter-${i}` ? "کپی شد" : "کپی"}
                    </button>
                    <div className="max-h-32 w-full overflow-y-auto bg-black/50 border border-[#1a2540] rounded-lg p-3 pt-8 text-[10px] md:text-xs leading-6 text-white/70 whitespace-pre-wrap break-words">
                      {item.letterText}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* ADDRESS */}
        <div className={`p-5 md:p-6 rounded-2xl md:rounded-3xl border ${glassBorder} ${cardBg} space-y-3`}>
          <div className="flex items-center gap-2 text-xs md:text-sm text-gray-400">
            <MapPin size={15} className="text-blue-400" /> <span>آدرس ارسال</span>
          </div>
          <div className="space-y-2 text-xs md:text-sm text-gray-300">
            <div className="flex items-center gap-2"><User size={13} className="text-gray-500 shrink-0" /><span>{order.shipping.fullName}</span></div>
            <div className="flex items-center gap-2"><Phone size={13} className="text-gray-500 shrink-0" /><span dir="ltr">{order.shipping.phone}</span></div>
            <div className="flex items-start gap-2"><MapPin size={13} className="text-gray-500 shrink-0 mt-0.5" /><span>{order.shipping.province && `${order.shipping.province}، `}{order.shipping.city} — {order.shipping.address}</span></div>
            <div className="flex items-center gap-2"><Hash size={13} className="text-gray-500 shrink-0" /><span>کد پستی: {order.shipping.postalCode}</span></div>
          </div>
        </div>

        {/* PAYMENT */}
        <div className={`p-5 md:p-6 rounded-2xl md:rounded-3xl border ${glassBorder} ${cardBg} space-y-3`}>
          <div className="flex items-center gap-2 text-xs md:text-sm text-gray-400 mb-2">
            <CreditCard size={15} className="text-blue-400" /> <span>جزئیات پرداخت</span>
          </div>
          <div className="flex justify-between text-xs md:text-sm"><span className="text-gray-500">جمع کالاها</span><span className="text-gray-300">{formatPrice(order.subtotal)}</span></div>
          <div className="flex justify-between text-xs md:text-sm"><span className="text-gray-500">هزینه ارسال</span><span className="text-gray-300">{formatPrice(order.shippingCost)}</span></div>
          <div className="border-t border-[#1a2540] pt-3 flex justify-between items-center">
            <span className="text-sm md:text-base font-bold text-white">مبلغ نهایی</span>
            <span className="text-xl md:text-2xl font-black text-emerald-400">{formatPrice(order.total)}</span>
          </div>
        </div>

        {/* BACK */}
        <Link href="/panel/orders"
          className={`flex items-center justify-center gap-2 w-full py-3 rounded-2xl ${cardBg} border ${glassBorder} text-sm text-gray-400 hover:text-white hover:bg-[#0a0f1c]/80 transition-all`}>
          <ArrowRight size={15} className="rotate-180" /> بازگشت به لیست سفارش‌ها
        </Link>

      </div>
    </main>
  );
}