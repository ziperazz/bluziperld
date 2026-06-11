"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  ShoppingCart, Truck, CreditCard, CheckCircle2, ChevronRight, Loader2,
  ShieldCheck, AlertCircle, Wallet, ArrowRight
} from "lucide-react";

function SectionTitle({ title }: { title: string }) {
  return (
    <div className="flex items-center justify-between">
      <h3 className="text-sm font-semibold text-white">{title}</h3>
      <span className="text-[11px] text-gray-500">—</span>
    </div>
  );
}

function Row({ label, value, children }: any) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-gray-400 text-xs">{label}</span>
      {children ? children : <span className="text-gray-200 text-xs font-medium">{value}</span>}
    </div>
  );
}

function StepItem({ icon, label, active = false }: any) {
  return (
    <div className="flex flex-col items-center gap-1.5">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition ${
        active 
          ? "bg-blue-600 text-white shadow-[0_0_14px_rgba(37,99,235,0.45)]" 
          : "bg-[#0a0f1c] text-gray-500 border border-[#1a2540]"
      }`}>
        {icon}
      </div>
      <span className={`text-[10px] md:text-[11px] whitespace-nowrap ${active ? "text-white font-medium" : "text-gray-500"}`}>{label}</span>
    </div>
  );
}

function StepLine() {
  return <div className="w-6 md:w-10 h-[2px] bg-[#1a2540] mb-5" />;
}

const gateways = [
  { id: "zarinpal", name: "زرین پال", active: true, description: "پرداخت امن و سریع با شاپرک", icon: ShieldCheck },
  { id: "mellat", name: "بانک ملت", active: false, description: "به زودی... صبر پیشه‌ی پیروزیست!", icon: Wallet },
  { id: "saman", name: "بانک سامان", active: false, description: "در حال مذاکره با مدیرعامل", icon: Wallet },
];

export default function PaymentPage() {
  const pathname = usePathname();
  const router = useRouter();

  const [selectedGateway, setSelectedGateway] = useState("zarinpal");
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState({ subtotal: 0, shipping: 0, discount: 0 });
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    try {
      const cartRaw = localStorage.getItem("cart") || "[]";
      const cart = JSON.parse(cartRaw);
      const subtotal = cart.reduce((total: number, item: any) => {
        const price = item.priceAfterDiscount ?? item.price ?? 0;
        const quantity = item.quantity ?? 1;
        return total + price * quantity;
      }, 0);

      let shipping = 0;
      const shippingInfoRaw = localStorage.getItem("shippingInfo");
      if (shippingInfoRaw) {
        const shippingInfo = JSON.parse(shippingInfoRaw);
        if (shippingInfo && typeof shippingInfo.shippingPrice === "number") {
          shipping = shippingInfo.shippingPrice;
        }
      }

      setSummary({ subtotal, shipping, discount: 0 });
    } catch (err) {
      console.error("خطا توی خوندن سبد خرید:", err);
      setSummary({ subtotal: 0, shipping: 0, discount: 0 });
    }
  }, [pathname]);

  const total = summary.subtotal + summary.shipping - summary.discount;

  const handlePayment = async () => {
    setError(null);

    if (total <= 0) {
      setError("مبلغ سفارش معتبر نیست! انگار سبد خریدت خالیه یا یه جای کار میلنگه.");
      return;
    }

    try {
      setLoading(true);
      const API = process.env.NEXT_PUBLIC_API_URL || "https://api.bluziperld.ir";
      const token = localStorage.getItem("accessToken");

      if (!token) {
        setError("ببخشید، انگار از حسابت خارج شدی! یه بار دیگه لاگین کن.");
        setLoading(false);
        return;
      }

      const cart = JSON.parse(localStorage.getItem("cart") || "[]");
      const shippingInfo = JSON.parse(localStorage.getItem("shippingInfo") || "{}");

      if (!cart.length) {
        setError("سبد خریدت خالیه داداش! اول یه چیزی انتخاب کن بعد بیا پرداخت.");
        setLoading(false);
        return;
      }

      const res = await fetch(`${API}/api/payment/request`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          amount: total,
          mobile: shippingInfo?.phone || "09120000000",
          email: "info@bluziperld.ir",
          cart: cart,
          shipping: shippingInfo,
          subtotal: summary.subtotal,
          shippingCost: summary.shipping,
          total: total,
        }),
      });

      const data = await res.json();

      if (data.success && data.url) {
        window.location.href = data.url;
      } else {
        setError(data.message || "درگاه پرداخت یه کم گیج شده، دوباره امتحان کن!");
        setLoading(false);
      }
    } catch (error) {
      console.error("Payment Error:", error);
      setError("اینترنتت یا سرور ما قطعه! یه چند لحظه صبر کن و دوباره بزن.");
      setLoading(false);
    }
  };

  // رنگ‌های آبی تیره
  const glassBg = { background: "rgba(10,15,28,0.55)", backdropFilter: "blur(20px) saturate(180%)", WebkitBackdropFilter: "blur(20px) saturate(180%)" }
  const glassBgSolid = { background: "rgba(10,15,28,0.75)", backdropFilter: "blur(30px)", WebkitBackdropFilter: "blur(30px)" }
  const glassBorder = "border-[#1a2540]"

  return (
    <div className="min-h-screen px-4 md:px-8 py-8 md:py-10">
      <div className="max-w-5xl mx-auto">

        <div className="flex items-center justify-center mb-10 gap-2 md:gap-3">
          <StepItem icon={<ShoppingCart size={16} />} label="سبد خرید" />
          <StepLine />
          <StepItem icon={<Truck size={16} />} label="اطلاعات ارسال" />
          <StepLine />
          <StepItem icon={<CreditCard size={16} />} label="پرداخت" active />
          <StepLine />
          <StepItem icon={<CheckCircle2 size={16} />} label="پایان" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">

          {/* MOBILE SUMMARY */}
          <div className="lg:hidden">
            <div className={`p-5 rounded-2xl border ${glassBorder}`} style={glassBgSolid}>
              <h3 className="text-base font-bold mb-4 text-white border-b border-[#1a2540] pb-3">خلاصه صورتحساب</h3>
              <div className="space-y-3 text-sm">
                <Row label="جمع محصولات" value={`${summary.subtotal.toLocaleString()} تومان`} />
                <Row label="هزینه ارسال" value={`${summary.shipping.toLocaleString()} تومان`} />
                <Row label="تخفیف" value={`-${summary.discount.toLocaleString()} تومان`} />
                <div className="border-t border-[#1a2540] pt-3">
                  <Row label="مبلغ نهایی">
                    <span className="text-blue-400 font-bold text-sm">{total.toLocaleString()} تومان</span>
                  </Row>
                </div>
              </div>
            </div>
          </div>

          {/* PAYMENT SECTION */}
          <div className="lg:col-span-2 space-y-5">
            <SectionTitle title="انتخاب درگاه پرداخت" />
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {gateways.map((g) => {
                const selected = g.id === selectedGateway;
                const disabled = !g.active;
                const Icon = g.icon;

                return (
                  <button key={g.id} onClick={() => !disabled && setSelectedGateway(g.id)} disabled={disabled}
                    className={`flex flex-col p-4 rounded-2xl border transition-all duration-300 text-right ${
                      selected && !disabled
                        ? "border-blue-500/30 bg-blue-500/5 shadow-[0_0_20px_rgba(37,99,235,0.1)]"
                        : `border-[#1a2540] bg-[#0a0f1c]/50 hover:bg-[#0a0f1c]/80 hover:border-[#253050]`
                    } ${disabled ? "opacity-40 grayscale cursor-not-allowed" : "cursor-pointer"}`}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-bold text-sm text-white flex items-center gap-2">
                        <Icon size={15} className={selected ? "text-blue-400" : "text-gray-500"} />
                        {g.name}
                      </span>
                      {!disabled && (
                        <div className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
                          selected ? "bg-blue-400 shadow-[0_0_10px_rgba(37,99,235,0.6)]" : "bg-[#1a2540]"
                        }`} />
                      )}
                    </div>
                    <p className="text-[11px] text-gray-500 leading-5">{g.description}</p>
                  </button>
                );
              })}
            </div>

            <div className={`p-4 rounded-2xl border ${glassBorder} bg-[#0a0f1c]/50`}>
              <p className="text-xs text-gray-500 leading-6 flex items-start gap-2">
                <ShieldCheck size={14} className="text-blue-400 shrink-0 mt-0.5" />
                پرداخت از طریق درگاه امن زرین‌پال انجام می‌شود. 
                اطلاعات کارت شما مستقیماً به بانک ارسال می‌شود و ما هیچ دخالتی توی فرآیند پرداخت نداریم. 
                پس خیالت راحت باشد!
              </p>
            </div>

            {error && (
              <div className="flex items-start gap-2.5 p-4 rounded-2xl bg-red-500/5 border border-red-500/20 text-red-400 text-xs leading-6">
                <AlertCircle size={15} className="shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button disabled={loading} onClick={handlePayment}
                className="w-full sm:w-auto flex-1 flex items-center justify-center gap-2 py-3.5 rounded-xl bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white font-bold text-sm transition-all duration-300 hover:scale-[1.02] active:scale-95 shadow-lg shadow-blue-500/20 disabled:opacity-60 disabled:cursor-not-allowed">
                {loading ? (
                  <><Loader2 size={18} className="animate-spin" /> در حال اتصال به درگاه...</>
                ) : (
                  <>پرداخت و ادامه <ArrowRight size={17} /></>
                )}
              </button>
              <Link href="/shipping"
                className={`w-full sm:w-auto flex items-center justify-center gap-2 py-3.5 px-5 rounded-xl border ${glassBorder} bg-[#0a0f1c]/50 text-gray-400 hover:text-white hover:bg-[#0a0f1c]/80 text-sm font-medium transition-all`}>
                ← بازگشت به اطلاعات ارسال
              </Link>
            </div>
          </div>

          {/* DESKTOP SUMMARY */}
          <aside className="hidden lg:block lg:col-span-1">
            <div className={`sticky top-24 p-5 rounded-2xl border ${glassBorder}`} style={glassBgSolid}>
              <h3 className="text-base font-bold mb-4 text-white border-b border-[#1a2540] pb-3">خلاصه صورتحساب</h3>
              <div className="space-y-3 text-sm">
                <Row label="جمع محصولات" value={`${summary.subtotal.toLocaleString()} تومان`} />
                <Row label="هزینه ارسال" value={`${summary.shipping.toLocaleString()} تومان`} />
                <Row label="تخفیف" value={`-${summary.discount.toLocaleString()} تومان`} />
                <div className="border-t border-[#1a2540] pt-3">
                  <Row label="مبلغ نهایی">
                    <span className="text-blue-400 font-bold text-sm">{total.toLocaleString()} تومان</span>
                  </Row>
                </div>
              </div>
            </div>
          </aside>

        </div>
      </div>
    </div>
  );
}