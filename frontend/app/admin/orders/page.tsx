"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Banknote,
  BadgeDollarSign,
  ClipboardList,
  Eye,
  Loader2,
  MapPin,
  Package,
  PackageCheck,
  PackageSearch,
  FileText,
  Phone,
  StickyNote,
  RefreshCcw,
  Search,
  ShieldAlert,
  SlidersHorizontal,
  User2,
  X,
} from "lucide-react";

/* =========================
   Types
========================= */

type OrderStatus =
  | "PENDING_PAYMENT"
  | "PAID"
  | "PROCESSING"
  | "AWAITING_ADMIN_REVIEW"
  | "SHIPPED"
  | "DELIVERED"
  | "CANCELLED"
  | "FAILED";

interface OrderItem {
  productId?: string;
  title: string;
  price: number;
  quantity: number;
  image?: string;
  slug?: string;
}

interface OrderAddress {
  fullName: string;
  phone: string;
  province?: string;
  city?: string;
  address?: string;
  postalCode?: string;
}

interface Order {
  _id: string;
  trackingCode?: string;
  user?: string;
  cart: OrderItem[];
  shipping: OrderAddress;
  subtotal: number;
  shippingCost: number;
  total: number;
  status: OrderStatus;
  paymentMethod?: string;
  paymentStatus?: string;
  createdAt: string;
  updatedAt: string;
}

/* =========================
   Config / Helpers
========================= */

const BASE_URL =
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") || "http://localhost:5000";

const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  PENDING_PAYMENT: "در انتظار پرداخت",
  PAID: "پرداخت شده",
  PROCESSING: "در حال پردازش",
  AWAITING_ADMIN_REVIEW: "در انتظار بررسی ادمین",
  SHIPPED: "ارسال شده",
  DELIVERED: "تحویل شده",
  CANCELLED: "لغو شده",
  FAILED: "ناموفق",
};

const ORDER_STATUS_OPTIONS = Object.entries(ORDER_STATUS_LABELS).map(
  ([value, label]) => ({
    value: value as OrderStatus,
    label,
  })
);

function getToken() {
  if (typeof window === "undefined") return "";
  return (
    localStorage.getItem("token") ||
    localStorage.getItem("accessToken") ||
    ""
  );
}

class ApiError extends Error {
  status: number;
  data?: unknown;
  constructor(message: string, status: number, data?: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.data = data;
  }
}

async function apiClient<T>(
  endpoint: string,
  options: RequestInit & { body?: unknown; token?: string } = {}
): Promise<T> {
  const { body, headers, token, ...rest } = options;
  const authToken = token || getToken();
  const response = await fetch(`${BASE_URL}${endpoint}`, {
    ...rest,
    headers: {
      "Content-Type": "application/json",
      ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
      ...(headers || {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw new ApiError(
      data?.message || "خطا در ارتباط با سرور",
      response.status,
      data
    );
  }

  return data as T;
}

// ✅ اصلاح‌شده با ساختار کنترلرت
async function apiGetOrders() {
  const res = await apiClient<{ success: boolean; orders?: Order[]; message?: string }>(
    "/api/orders",
    { token: getToken() }
  );
  if (!res.success) throw new Error(res.message || "دریافت سفارشات ناموفق بود");
  return res.orders || [];
}

// ✅ سازگار با کنترلر updateOrderStatus
async function apiUpdateOrderStatus(id: string, status: OrderStatus) {
  const res = await apiClient<{
    success: boolean;
    order?: Order;
    message?: string;
  }>(`/api/orders/${id}/status`, {
    method: "PATCH",
    body: { status },
  });
  if (!res.success) throw new Error(res.message || "بروزرسانی وضعیت ناموفق بود");
  return res.order;
}

/* =========================
   View Helpers (بدون تغییر UX)
========================= */

function formatPrice(value: number) {
  return new Intl.NumberFormat("fa-IR").format(value) + " تومان";
}

function formatNumber(value: number) {
  return new Intl.NumberFormat("fa-IR").format(value);
}

function formatDate(date: string | Date) {
  return new Intl.DateTimeFormat("fa-IR", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(date));
}

function normalizeText(value: string) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/ي/g, "ی")
    .replace(/ك/g, "ک");
}

function statusBadgeClass(status: OrderStatus) {
  const map: Record<OrderStatus, string> = {
    PENDING_PAYMENT:
      "bg-amber-500/15 text-amber-300 border-amber-400/20 shadow-[0_0_20px_rgba(245,158,11,0.12)]",
    PAID:
      "bg-emerald-500/15 text-emerald-300 border-emerald-400/20 shadow-[0_0_20px_rgba(16,185,129,0.12)]",
    PROCESSING:
      "bg-sky-500/15 text-sky-300 border-sky-400/20 shadow-[0_0_20px_rgba(14,165,233,0.12)]",
    AWAITING_ADMIN_REVIEW:
      "bg-violet-500/15 text-violet-300 border-violet-400/20 shadow-[0_0_20px_rgba(139,92,246,0.12)]",
    SHIPPED:
      "bg-cyan-500/15 text-cyan-300 border-cyan-400/20 shadow-[0_0_20px_rgba(34,211,238,0.12)]",
    DELIVERED:
      "bg-green-500/15 text-green-300 border-green-400/20 shadow-[0_0_20px_rgba(34,197,94,0.12)]",
    CANCELLED:
      "bg-rose-500/15 text-rose-300 border-rose-400/20 shadow-[0_0_20px_rgba(244,63,94,0.12)]",
    FAILED:
      "bg-red-500/15 text-red-300 border-red-400/20 shadow-[0_0_20px_rgba(239,68,68,0.12)]",
  };
  return map[status];
}

/* =========================
   Page logic (همان ساختار قبلی)
========================= */

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<"ALL" | OrderStatus>("ALL");
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  async function fetchOrders() {
    try {
      setLoading(true);
      setError("");
      const data = await apiGetOrders();
      setOrders(Array.isArray(data) ? data : []);
    } catch (err: any) {
      setError(err.message || "خطا در دریافت سفارشات");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchOrders();
  }, []);

  useEffect(() => {
    if (!message) return;
    const timeout = setTimeout(() => setMessage(""), 2500);
    return () => clearTimeout(timeout);
  }, [message]);

  const filteredOrders = useMemo(() => {
    const s = normalizeText(search);
    return orders.filter((o) => {
      const matchesStatus = status === "ALL" ? true : o.status === status;
      const text = normalizeText(
        [o.trackingCode, o.shipping?.fullName, o.shipping?.phone]
          .filter(Boolean)
          .join(" ")
      );
      const matchesSearch = s ? text.includes(s) : true;
      return matchesStatus && matchesSearch;
    });
  }, [orders, search, status]);

  const stats = useMemo(() => {
    const totalOrders = orders.length;
    const totalRevenue = orders.reduce((sum, o) => sum + (o.total || 0), 0);
    const reviewCount = orders.filter(
      (o) => o.status === "AWAITING_ADMIN_REVIEW"
    ).length;
    const deliveredCount = orders.filter((o) => o.status === "DELIVERED").length;
    return { totalOrders, totalRevenue, reviewCount, deliveredCount };
  }, [orders]);

  async function handleChangeStatus(id: string, nextStatus: OrderStatus) {
    const previous = [...orders];
    setUpdatingId(id);
    setOrders((all) =>
      all.map((o) => (o._id === id ? { ...o, status: nextStatus } : o))
    );

    try {
      await apiUpdateOrderStatus(id, nextStatus);
      setMessage("وضعیت با موفقیت بروزرسانی شد");
      await fetchOrders(); // سینک کامل با دیتابیس
    } catch (err: any) {
      setOrders(previous);
      setMessage(err.message || "بروزرسانی ناموفق بود");
    } finally {
      setUpdatingId(null);
    }
  }


  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,rgba(34,211,238,0.08),transparent_25%),linear-gradient(180deg,#0a0f1f_0%,#0b1020_40%,#070b16_100%)] text-white">
      <div className="mx-auto w-full max-w-[1600px] px-4 py-6 md:px-6 lg:px-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
            مدیریت سفارشات
          </h1>
          <p className="mt-2 text-sm text-white/55">
            مشاهده، فیلتر، بررسی و بروزرسانی وضعیت سفارش‌های کاربران
          </p>
        </div>

        {message ? (
          <div className="mb-5 rounded-2xl border border-cyan-400/20 bg-cyan-500/10 px-4 py-3 text-sm text-cyan-100 backdrop-blur-xl">
            {message}
          </div>
        ) : null}

        {loading ? (
          <OrdersSkeleton />
        ) : error ? (
          <div className="rounded-[28px] border border-rose-400/20 bg-rose-500/10 p-6 text-rose-100 backdrop-blur-xl">
            <p className="text-lg font-semibold">خطا در دریافت سفارشات</p>
            <p className="mt-2 text-sm text-rose-100/80">{error}</p>
            <button
              onClick={fetchOrders}
              className="mt-4 inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/10 px-4 py-2 text-sm transition hover:bg-white/15"
            >
              <RefreshCcw className="h-4 w-4" />
              تلاش مجدد
            </button>
          </div>
        ) : (
          <>
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              <StatCard
                title="کل سفارشات"
                value={formatNumber(stats.totalOrders)}
                icon={<ClipboardList className="h-5 w-5" />}
                hint="تعداد کل سفارش‌های ثبت شده"
                glow="from-sky-500/20 to-blue-500/5"
              />
              <StatCard
                title="درآمد کل"
                value={formatPrice(stats.totalRevenue)}
                icon={<Banknote className="h-5 w-5" />}
                hint="مجموع مبلغ همه سفارش‌ها"
                glow="from-emerald-500/20 to-lime-500/5"
              />
              <StatCard
                title="در انتظار بررسی"
                value={formatNumber(stats.reviewCount)}
                icon={<ShieldAlert className="h-5 w-5" />}
                hint="سفارش‌های نیازمند بررسی ادمین"
                glow="from-violet-500/20 to-fuchsia-500/5"
              />
              <StatCard
                title="تحویل شده"
                value={formatNumber(stats.deliveredCount)}
                icon={<PackageCheck className="h-5 w-5" />}
                hint="سفارش‌های تکمیل‌شده"
                glow="from-cyan-500/20 to-teal-500/5"
              />
            </div>

            <div className="mt-6 rounded-[28px] border border-white/10 bg-white/[0.05] p-4 backdrop-blur-2xl shadow-[0_10px_30px_rgba(0,0,0,0.25)]">
              <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
                <div className="relative flex-1">
                  <Search className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-white/35" />
                  <input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="جستجو با شماره سفارش، نام مشتری، تلفن، کد رهگیری..."
                    className="h-12 w-full rounded-2xl border border-white/10 bg-black/20 pr-11 pl-4 text-sm text-white outline-none placeholder:text-white/30 transition focus:border-cyan-400/40 focus:bg-white/[0.06]"
                  />
                </div>

                <div className="relative min-w-[220px]">
                  <SlidersHorizontal className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-white/35" />
                  <select
                    value={status}
                    onChange={(e) =>
                      setStatus(e.target.value as "ALL" | OrderStatus)
                    }
                    className="h-12 w-full rounded-2xl border border-white/10 bg-black/20 pr-11 pl-4 text-sm text-white outline-none transition focus:border-cyan-400/40 focus:bg-white/[0.06]"
                  >
                    <option value="ALL" className="bg-zinc-900">
                      همه وضعیت‌ها
                    </option>
                    {ORDER_STATUS_OPTIONS.map((item) => (
                      <option
                        key={item.value}
                        value={item.value}
                        className="bg-zinc-900"
                      >
                        {item.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {!filteredOrders.length ? (
              <div className="mt-6 flex min-h-[320px] flex-col items-center justify-center rounded-[28px] border border-dashed border-white/10 bg-white/[0.03] px-6 text-center backdrop-blur-xl">
                <div className="mb-5 flex h-20 w-20 items-center justify-center rounded-full border border-white/10 bg-white/5 text-cyan-300 shadow-[0_0_40px_rgba(34,211,238,0.12)]">
                  <PackageSearch className="h-10 w-10" />
                </div>
                <h3 className="text-xl font-semibold text-white">
                  سفارشی پیدا نشد
                </h3>
                <p className="mt-2 max-w-md text-sm leading-7 text-white/55">
                  در حال حاضر هیچ سفارشی مطابق فیلتر یا جستجوی شما وجود ندارد.
                </p>
              </div>
            ) : (
              <div className="mt-6 overflow-hidden rounded-[30px] border border-white/10 bg-white/[0.04] backdrop-blur-2xl shadow-[0_10px_30px_rgba(0,0,0,0.25)]">
                <div className="overflow-x-auto">
                  <table className="min-w-full text-right">
                    <thead className="sticky top-0 z-10 bg-[#0b1020]/90 backdrop-blur-xl">
                      <tr className="border-b border-white/10 text-xs text-white/45">
                        <th className="px-6 py-4 font-medium">شماره سفارش</th>
                        <th className="px-6 py-4 font-medium">مشتری</th>
                        <th className="px-6 py-4 font-medium">تلفن</th>
                        <th className="px-6 py-4 font-medium">تاریخ</th>
                        <th className="px-6 py-4 font-medium">مبلغ</th>
                        <th className="px-6 py-4 font-medium">وضعیت</th>
                        <th className="px-6 py-4 font-medium">تغییر وضعیت</th>
                        <th className="px-6 py-4 font-medium">عملیات</th>
                      </tr>
                    </thead>

                    <tbody>
                      {filteredOrders.map((order) => {
                        const isUpdating = updatingId === order._id;

                        return (
                          <tr
                            key={order._id}
                            className="border-b border-white/5 transition hover:bg-white/[0.045]"
                          >
                            <td className="px-6 py-5">
                              <div className="space-y-1">
                                <p className="text-sm font-semibold text-white">
                                  {order.orderId}
                                </p>
                                <p className="text-xs text-white/40">
                                  {order.trackingCode || "بدون کد رهگیری"}
                                </p>
                              </div>
                            </td>

                            <td className="px-6 py-5 text-sm text-white/85">
                              {order.shipping?.fullName || "-"}
                            </td>

                            <td className="px-6 py-5 text-sm text-white/65">
                              {order.shipping?.phone || "-"}
                            </td>

                            <td className="px-6 py-5 text-sm text-white/65">
                              {formatDate(order.createdAt)}
                            </td>

                            <td className="px-6 py-5 text-sm font-medium text-cyan-200">
                              {formatPrice(order.total)}
                            </td>

                            <td className="px-6 py-5">
                              <span
                                className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-medium backdrop-blur-xl ${statusBadgeClass(
                                  order.status
                                )}`}
                              >
                                <span className="h-2 w-2 rounded-full bg-current opacity-80" />
                                {ORDER_STATUS_LABELS[order.status]}
                              </span>
                            </td>

                            <td className="px-6 py-5">
                              <div className="flex items-center gap-3">
                                <div className="relative">
                                  <select
                                    value={order.status}
                                    onChange={(e) =>
                                      handleChangeStatus(
                                        order._id,
                                        e.target.value as OrderStatus
                                      )
                                    }
                                    disabled={isUpdating}
                                    className="h-11 min-w-[190px] rounded-2xl border border-white/10 bg-white/5 px-4 pl-10 text-sm text-white outline-none backdrop-blur-xl transition hover:bg-white/[0.07] focus:border-cyan-400/40 focus:bg-white/[0.09] disabled:cursor-not-allowed disabled:opacity-60"
                                  >
                                    {ORDER_STATUS_OPTIONS.map((item) => (
                                      <option
                                        key={item.value}
                                        value={item.value}
                                        className="bg-zinc-900"
                                      >
                                        {item.label}
                                      </option>
                                    ))}
                                  </select>

                                  {isUpdating ? (
                                    <Loader2 className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-cyan-300" />
                                  ) : null}
                                </div>
                              </div>
                            </td>

                            <td className="px-6 py-5">
                              <button
                                onClick={() => setSelectedOrder(order)}
                                className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/85 backdrop-blur-xl transition hover:border-cyan-400/30 hover:bg-cyan-400/10 hover:text-cyan-200"
                              >
                                <Eye className="h-4 w-4" />
                                مشاهده جزئیات
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      <OrderDrawer
        order={selectedOrder}
        open={!!selectedOrder}
        onClose={() => setSelectedOrder(null)}
      />
    </main>
  );
}

/* =========================
   Local UI Components
========================= */

function StatCard({
  title,
  value,
  icon,
  hint,
  glow = "from-cyan-500/20 to-blue-500/5",
}: {
  title: string;
  value: string;
  icon: React.ReactNode;
  hint?: string;
  glow?: string;
}) {
  return (
    <div className="group relative overflow-hidden rounded-[28px] border border-white/10 bg-white/5 p-5 backdrop-blur-2xl shadow-[0_10px_30px_rgba(0,0,0,0.25)]">
      <div
        className={`absolute inset-0 bg-gradient-to-br opacity-80 transition duration-500 group-hover:opacity-100 ${glow}`}
      />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.14),transparent_35%)]" />
      <div className="relative z-10 flex items-start justify-between gap-4">
        <div>
          <p className="text-sm text-white/60">{title}</p>
          <h3 className="mt-3 text-2xl font-bold tracking-tight text-white">
            {value}
          </h3>
          {hint ? <p className="mt-2 text-xs text-white/50">{hint}</p> : null}
        </div>
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-black/20 text-white shadow-inner shadow-white/5">
          {icon}
        </div>
      </div>
    </div>
  );
}

function OrdersSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="h-32 rounded-[28px] border border-white/10 bg-white/[0.04]"
          />
        ))}
      </div>

      <div className="h-20 rounded-[28px] border border-white/10 bg-white/[0.04]" />
      <div className="h-[420px] rounded-[30px] border border-white/10 bg-white/[0.04]" />
    </div>
  );
}

function OrderDrawer({
  order,
  open,
  onClose,
}: {
  order: Order | null;
  open: boolean;
  onClose: () => void;
}) {
  return (
    <>
      <div
        onClick={onClose}
        className={`fixed inset-0 z-40 bg-black/60 backdrop-blur-sm transition ${
          open ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"
        }`}
      />

      <aside
        className={`fixed left-0 top-0 z-50 h-full w-full max-w-2xl transform border-r border-white/10 bg-[#0b1020]/90 backdrop-blur-2xl transition duration-300 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-full flex-col">
          <div className="flex items-center justify-between border-b border-white/10 px-6 py-5">
            <div>
              <h2 className="text-xl font-bold text-white">جزئیات سفارش</h2>
              <p className="mt-1 text-sm text-white/50">
                مشاهده اطلاعات کامل سفارش
              </p>
            </div>
            <button
              onClick={onClose}
              className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-white/80 transition hover:bg-white/10"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {!order ? null : (
            <div className="flex-1 space-y-6 overflow-y-auto px-6 py-6">
              <section className="rounded-[24px] border border-white/10 bg-white/[0.04] p-5">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-xs text-white/45">شماره سفارش</p>
                    <h3 className="mt-2 text-lg font-semibold text-white">
                      {order.orderId}
                    </h3>
                  </div>

                  <span
                    className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-medium backdrop-blur-xl ${statusBadgeClass(
                      order.status
                    )}`}
                  >
                    <span className="h-2 w-2 rounded-full bg-current opacity-80" />
                    {ORDER_STATUS_LABELS[order.status]}
                  </span>
                </div>

                <div className="mt-5 grid gap-4 sm:grid-cols-2">
                  <InfoCard
                    icon={<Package className="h-4 w-4" />}
                    label="کد رهگیری"
                    value={order.trackingCode || "ثبت نشده"}
                  />
                  <InfoCard
                    icon={<BadgeDollarSign className="h-4 w-4" />}
                    label="مبلغ نهایی"
                    value={formatPrice(order.total)}
                  />
                  <InfoCard
                    icon={<User2 className="h-4 w-4" />}
                    label="نام گیرنده"
                    value={order.shipping?.fullName || "-"}
                  />
                  <InfoCard
                    icon={<Phone className="h-4 w-4" />}
                    label="تلفن"
                    value={order.shipping?.phone || "-"}
                  />
                  
                  <InfoCard
  icon={<MapPin className="h-4 w-4" />}
  label="کد پستی"
  value={order.shipping?.postalCode || "ثبت نشده"}
/>

                  <InfoCard
                    icon={<MapPin className="h-4 w-4" />}
                    label="تاریخ ثبت"
                    value={formatDate(order.createdAt)}
                  />
                  <InfoCard
    icon={<FileText className="h-4 w-4" />}
    label="متن نامه"
    value={
      <div className="relative">
        {/* دکمه کپی */}
        <button
          onClick={() =>
            navigator.clipboard.writeText(order.cart?.[0]?.letterText || "")
          }
          className="absolute left-0 top-0 text-xs px-2 py-1 rounded-md bg-white/10 hover:bg-white/20 transition"
        >
          کپی
        </button>

        {/* متن نامه */}
        <div className="max-h-32 overflow-y-auto whitespace-pre-wrap text-sm text-white/90 pr-1 pt-7 scrollbar-thin">
          {order.cart?.[0]?.letterText || "متنی ثبت نشده"}
        </div>
      </div>
    }
  />
                 <InfoCard
  icon={<StickyNote className="h-4 w-4" />}
  label="توضیحات سفارش"
  value={
    <div className="relative">
      {/* دکمه کپی */}
      <button
        onClick={() =>
          navigator.clipboard.writeText(order?.shipping?.note || "")
        }
        className="absolute left-0 top-0 text-xs px-2 py-1 rounded-md bg-white/10 hover:bg-white/20 transition"
      >
        کپی
      </button>

      {/* متن توضیحات */}
      <div className="max-h-32 overflow-y-auto whitespace-pre-wrap text-sm text-white/90 pr-1 pt-7 scrollbar-thin">
        {order?.shipping?.note || "توضیحی ثبت نشده"}
      </div>
    </div>
  }
/>



                  <InfoCard
                    icon={<MapPin className="h-4 w-4" />}
                    label="آدرس"
                    value={
                      [
                        order.shipping?.province,
                        order.shipping?.city,
                        order.shipping?.address,
                      ]
                        .filter(Boolean)
                        .join(" - ") || "ثبت نشده"
                    }
                  />
                </div>
              </section>

              <section className="rounded-[24px] border border-white/10 bg-white/[0.04] p-5">
                <h4 className="text-base font-semibold text-white">
                  آیتم‌های سفارش
                </h4>
                <div className="mt-4 space-y-3">
                  {order.cart?.length ? (
                    order.cart.map((item, index) => (
                      <div
                        key={`${item.title}-${index}`}
                        className="flex items-center justify-between gap-4 rounded-2xl border border-white/10 bg-black/20 px-4 py-4"
                      >
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium text-white">
                            {item.title}
                          </p>
                          <p className="mt-1 text-xs text-white/45">
                            تعداد: {formatNumber(item.quantity)}
                          </p>
                        </div>
                        <div className="text-sm font-medium text-cyan-200">
                          {formatPrice(item.price * item.quantity)}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="rounded-2xl border border-white/10 bg-black/20 px-4 py-4 text-sm text-white/55">
                      آیتمی برای این سفارش ثبت نشده است.
                    </div>
                  )}
                </div>
              </section>

              <section className="rounded-[24px] border border-white/10 bg-white/[0.04] p-5">
                <h4 className="text-base font-semibold text-white">
                  خلاصه پرداخت
                </h4>
                <div className="mt-4 space-y-3 text-sm">
                  <DrawerRow label="جمع جزء" value={formatPrice(order.subtotal)} />
                  <DrawerRow
                    label="هزینه ارسال"
                    value={formatPrice(order.shippingCost)}
                  />
                  <DrawerRow
                    label="مبلغ نهایی"
                    value={formatPrice(order.total)}
                    strong
                  />
                </div>
              </section>
            </div>
          )}
        </div>
      </aside>
    </>
  );
}

function InfoCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
      <div className="flex items-center gap-2 text-white/45">
        {icon}
        <span className="text-xs">{label}</span>
      </div>
     <div className="mt-3 text-sm leading-7 text-white">{value}</div>
    </div>
  );
}

function DrawerRow({
  label,
  value,
  strong,
}: {
  label: string;
  value: string;
  strong?: boolean;
}) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-white/55">{label}</span>
      <span className={strong ? "font-bold text-white" : "text-white"}>
        {value}
      </span>
    </div>
  );
}
