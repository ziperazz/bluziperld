"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ShoppingBag, ChevronRight, Clock, Package, Truck,
  CheckCircle2, XCircle, AlertCircle, Loader2,
  Calendar, CreditCard, ArrowRight, Eye,
  BadgeDollarSign, Home, Sparkles
} from "lucide-react";

/* ============================
   Types
=============================*/
type OrderStatus =
  | "PENDING_PAYMENT"
  | "PAID"
  | "PROCESSING"
  | "AWAITING_ADMIN_REVIEW"
  | "SHIPPED"
  | "DELIVERED"
  | "CANCELLED"
  | "FAILED";

type Order = {
  _id: string;
  trackingCode: string;
  total: number;
  status: OrderStatus;
  createdAt: string;
};

/* ============================
   Status Config - رنگ‌های محدود
=============================*/
const STATUS_CONFIG: Record<OrderStatus, {
  label: string;
  color: string;
  bg: string;
  border: string;
  icon: any;
  stepIndex: number;
}> = {
  PENDING_PAYMENT: { label: "در انتظار پرداخت", color: "text-blue-400", bg: "bg-blue-500/10", border: "border-blue-500/20", icon: CreditCard, stepIndex: 0 },
  PAID: { label: "پرداخت شده", color: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/20", icon: CheckCircle2, stepIndex: 1 },
  AWAITING_ADMIN_REVIEW: { label: "در انتظار بررسی", color: "text-blue-300", bg: "bg-blue-500/10", border: "border-blue-500/20", icon: Eye, stepIndex: 1 },
  PROCESSING: { label: "در حال پردازش", color: "text-blue-400", bg: "bg-blue-500/10", border: "border-blue-500/20", icon: Package, stepIndex: 2 },
  SHIPPED: { label: "ارسال شده", color: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/20", icon: Truck, stepIndex: 3 },
  DELIVERED: { label: "تحویل شده", color: "text-emerald-300", bg: "bg-emerald-500/10", border: "border-emerald-500/20", icon: CheckCircle2, stepIndex: 4 },
  CANCELLED: { label: "لغو شده", color: "text-red-400", bg: "bg-red-500/10", border: "border-red-500/20", icon: XCircle, stepIndex: -1 },
  FAILED: { label: "ناموفق", color: "text-red-400", bg: "bg-red-500/10", border: "border-red-500/20", icon: AlertCircle, stepIndex: -1 },
};

const PROGRESS_STEPS = [
  { label: "پرداخت", icon: CreditCard },
  { label: "بررسی", icon: Eye },
  { label: "پردازش", icon: Package },
  { label: "ارسال", icon: Truck },
  { label: "تحویل", icon: CheckCircle2 },
];

const formatPrice = (v: number) => new Intl.NumberFormat("fa-IR").format(v) + " تومان";
const formatDate = (d: string) => new Intl.DateTimeFormat("fa-IR", { year: "numeric", month: "long", day: "numeric" }).format(new Date(d));

// رنگ‌های ثابت
const glassBg = { background: "rgba(10,15,28,0.4)", backdropFilter: "blur(20px) saturate(180%)", WebkitBackdropFilter: "blur(20px) saturate(180%)" };
const glassBorder = "border-[#1a2540]";
const accentBlue = "text-blue-400";
const accentGreen = "text-emerald-400";
const accentRed = "text-red-400";
const btnGradient = "from-blue-600 to-blue-500";
const btnHover = "hover:from-blue-500 hover:to-blue-400";

export default function UserOrdersPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [mounted, setMounted] = useState(false);

  const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    const getOrders = async () => {
      try {
        const accessToken = localStorage.getItem("accessToken");
        if (!accessToken) { router.push("/auth"); return; }

        const response = await fetch(`${API}/api/orders/my`, {
          method: "GET", credentials: "include",
          headers: { Authorization: `Bearer ${accessToken}` },
        });

        if (response.status === 401) { router.push("/auth"); return; }

        const data = await response.json();
        if (data.success && Array.isArray(data.orders)) {
          setOrders(data.orders);
        } else {
          setError(true);
        }
      } catch (err) {
        console.error("Error loading orders:", err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    getOrders();
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 size={28} className="text-blue-400 animate-spin" />
          <p className="text-sm text-gray-500">در حال بارگیری سفارش‌ها...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-4 text-center">
        <div className="w-16 h-16 rounded-2xl bg-red-500/10 flex items-center justify-center mb-4">
          <AlertCircle size={28} className="text-red-400" />
        </div>
        <p className="text-gray-400 text-sm font-medium">خطایی در دریافت سفارش‌ها رخ داد</p>
        <Link href="/" className={`mt-4 px-6 py-2.5 rounded-xl bg-[#0a0f1c] border ${glassBorder} text-gray-400 hover:text-white hover:bg-[#0a0f1c]/80 text-sm transition-all`}>
          بازگشت به صفحه اصلی
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen px-4 py-8 md:py-12">
      <div className="max-w-3xl mx-auto">

        {/* BREADCRUMB */}
        <nav className={`flex items-center gap-2 text-[10px] md:text-xs text-gray-500 mb-6 transition-all duration-700 ${mounted ? "opacity-100" : "opacity-0"}`}>
          <Link href="/" className="hover:text-blue-400 transition-colors flex items-center gap-1">
            <Home size={11} /> خانه
          </Link>
          <ChevronRight size={10} />
          <span className="text-gray-400">سفارش‌های من</span>
        </nav>

        {/* HEADER */}
        <div className={`flex items-center justify-between mb-8 transition-all duration-700 delay-200 ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}>
          <div>
            <h1 className="text-2xl md:text-3xl font-black text-white">سفارش‌های من</h1>
            <p className="text-xs md:text-sm text-gray-500 mt-1">
              {orders.length > 0 ? `${orders.length} سفارش ثبت شده` : "هنوز سفارشی ثبت نکرده‌اید"}
            </p>
          </div>

          <Link href="/letters"
            className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-gradient-to-r ${btnGradient} ${btnHover} text-white text-xs md:text-sm font-bold transition-all duration-300 hover:scale-[1.03] active:scale-95 shadow-lg shadow-blue-500/20`}>
            <Sparkles size={14} /> سفارش جدید <ArrowRight size={14} />
          </Link>
        </div>

        {/* ORDERS */}
        {orders.length === 0 ? (
          <div className={`text-center py-16 transition-all duration-700 delay-300 ${mounted ? "opacity-100" : "opacity-0"}`}>
            <div className="w-20 h-20 rounded-3xl bg-blue-500/10 flex items-center justify-center mx-auto mb-4">
              <ShoppingBag size={32} className="text-blue-400" strokeWidth={1.5} />
            </div>
            <p className="text-gray-400 font-medium">هنوز سفارشی ثبت نکرده‌اید</p>
            <p className="text-gray-600 text-xs mt-1">از طریق بخش پاکت نامه یا محصولات می‌توانید سفارش دهید</p>
            <Link href="/letters"
              className={`inline-flex items-center gap-2 mt-6 px-6 py-3 rounded-xl bg-gradient-to-r ${btnGradient} ${btnHover} text-white text-sm font-bold transition-all shadow-lg shadow-blue-500/20`}>
              شروع سفارش <ArrowRight size={16} />
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order, idx) => (
              <OrderCard key={order._id} order={order} index={idx} mounted={mounted} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/* ============================
   Order Card
=============================*/
function OrderCard({ order, index, mounted }: { order: Order; index: number; mounted: boolean }) {
  const config = STATUS_CONFIG[order.status] || STATUS_CONFIG.PENDING_PAYMENT;
  const StatusIcon = config.icon;
  const currentStep = config.stepIndex;

  return (
    <div
      className={`p-5 md:p-6 rounded-2xl md:rounded-3xl border ${glassBorder} transition-all duration-500 hover:border-blue-500/20 hover:bg-white/[0.02] ${
        mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
      }`}
      style={{ ...glassBg, transitionDelay: `${index * 80}ms` }}>
      
      {/* Top Row */}
      <div className="flex items-start justify-between gap-3 mb-4">
        <div className="flex items-center gap-3 min-w-0">
          <div className={`w-10 h-10 md:w-11 md:h-11 rounded-2xl ${config.bg} ${config.border} border flex items-center justify-center shrink-0`}>
            <StatusIcon size={20} className={config.color} strokeWidth={1.5} />
          </div>
          <div className="min-w-0">
            <p className="text-sm md:text-base font-bold text-white truncate">{order.trackingCode}</p>
            <div className="flex items-center gap-2 mt-0.5">
              <Calendar size={11} className="text-gray-600" />
              <span className="text-[10px] md:text-xs text-gray-500">{formatDate(order.createdAt)}</span>
            </div>
          </div>
        </div>

        <span className={`shrink-0 px-2.5 py-1 rounded-xl text-[10px] md:text-xs font-bold ${config.bg} ${config.color} ${config.border} border`}>
          {config.label}
        </span>
      </div>

      {/* Price */}
      <div className="flex items-center gap-2 mb-4 text-sm">
        <BadgeDollarSign size={15} className="text-blue-400" />
        <span className="text-white font-bold">{formatPrice(order.total)}</span>
      </div>

      {/* Progress Bar */}
      {currentStep >= 0 && (
        <div className="flex items-center gap-1.5 mb-4">
          {PROGRESS_STEPS.map((step, idx) => {
            const StepIcon = step.icon;
            const isDone = idx < currentStep;
            const isCurrent = idx === currentStep;

            return (
              <div key={idx} className="flex-1 flex flex-col items-center gap-1">
                <div className={`w-7 h-7 md:w-8 md:h-8 rounded-lg flex items-center justify-center transition-all duration-500 ${
                  isDone ? "bg-emerald-500/20 text-emerald-400" : isCurrent ? "bg-blue-500/20 text-blue-400 scale-110" : "bg-[#0a0f1c] text-gray-600"
                }`}>
                  <StepIcon size={12} className="md:w-3.5 md:h-3.5" />
                </div>
                <div className={`h-1 rounded-full w-full transition-all duration-500 ${
                  isDone ? "bg-emerald-500/50" : isCurrent ? "bg-blue-500/50" : "bg-[#1a2540]"
                }`} />
                <span className={`text-[8px] md:text-[9px] whitespace-nowrap transition-colors duration-500 ${
                  isDone ? "text-emerald-400" : isCurrent ? "text-blue-400" : "text-gray-600"
                }`}>
                  {step.label}
                </span>
              </div>
            );
          })}
        </div>
      )}

      {/* View Details */}
      <Link href={`/panel/orders/${order._id}`}
        className={`flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-[#0a0f1c] border ${glassBorder} text-xs md:text-sm text-gray-400 hover:text-white hover:bg-[#0a0f1c]/80 hover:border-blue-500/20 transition-all group`}>
        <Eye size={14} className="group-hover:text-blue-400 transition-colors" />
        مشاهده جزئیات
        <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
      </Link>
    </div>
  );
}