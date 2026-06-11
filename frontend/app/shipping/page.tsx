"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import {
  Truck, ShoppingCart, CreditCard, CheckCircle2,
  ChevronRight, ChevronLeft, MapPin, Phone, User,
  Mail, Hash, AlertCircle, Loader2, Smile
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

/* ==================== HELPERS ==================== */
const isValidToken = (token: string) => {
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    if (!payload) return false;
    if (payload.exp) {
      const now = Date.now() / 1000;
      if (payload.exp < now) return false;
    }
    return true;
  } catch { return false; }
};

const toEnglishDigits = (str: string) => str.replace(/[۰-۹]/g, d => "۰۱۲۳۴۵۶۷۸۹".indexOf(d).toString());
const phoneRegex = /^[0۰][9۹][0-9۰-۹]{9}$/;
const postalCodeRegex = /^[0-9۰-۹]{10}$/;

const shippingMethods = [
  { id: "post", title: "پست", description: "تحویل ۳ تا ۵ روز کاری - اقتصادی و قابل پیگیری", active: true, price: 147000 },
  { id: "tipax", title: "تیپاکس", description: "به زودی راه‌اندازی می‌شود، منتظر باشید!", active: false, price: null },
  { id: "chapar", title: "چاپار", description: "ارسال فوق سریع برون‌شهری", active: true, price: 227000 },
  { id: "snapp", title: "اسنپ‌باکس", description: "فعلاً خوابه! بیدارش نکردیم هنوز", active: false, price: null },
] as const;

type ShippingMethodId = (typeof shippingMethods)[number]["id"];

/* ==================== COMPONENT ==================== */
export default function ShippingPage() {
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (!token || !isValidToken(token)) {
      localStorage.removeItem("accessToken");
      router.push("/auth");
    }
  }, [router]);

  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [province, setProvince] = useState("");
  const [city, setCity] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [method, setMethod] = useState<ShippingMethodId>("post");
  const [customerNote, setCustomerNote] = useState("");
  const [shippingPrice, setShippingPrice] = useState<number>(10000);
  const [touched, setTouched] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSummary, setShowSummary] = useState(false);
  const [mounted, setMounted] = useState(false);

  const noteRef = useRef<HTMLTextAreaElement | null>(null);
  const maxNoteChars = 750;

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!noteRef.current) return;
    noteRef.current.style.height = "auto";
    noteRef.current.style.height = noteRef.current.scrollHeight + "px";
  }, [customerNote]);

  useEffect(() => {
    const selected = shippingMethods.find(m => m.id === method);
    setShippingPrice(selected?.price ?? 0);
  }, [method]);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("shippingInfo");
      if (saved) {
        const info = JSON.parse(saved);
        setFullName(info.fullName || "");
        setPhone(info.phone || "");
        setAddress(info.address || "");
        setProvince(info.province || "");
        setCity(info.city || "");
        setPostalCode(info.postalCode || "");
        if (info.shippingMethod === "post" || info.shippingMethod === "chapar") setMethod(info.shippingMethod);
        setCustomerNote(info.note || "");
      }
    } catch {}
  }, []);

  const errors = useMemo(() => {
    const e: Record<string, string> = {};
    if (!fullName.trim()) e.fullName = "بدون اسم که نمی‌شه! کی رو صدا بزنیم دم در؟";
    if (!phone.trim()) e.phone = "شماره تماس رو که دیگه بلدی! وارد کن.";
    else if (!phoneRegex.test(phone)) e.phone = "این شماره موبایل که مال مریخه! یه شماره واقعی بده.";
    if (!address.trim()) e.address = "آدرس رو نمی‌نویسی، نامه رو بفرستیم ماه؟";
    if (!province.trim()) e.province = "استان رو بگو بدونیم کجای این مملکتی!";
    if (!city.trim()) e.city = "شهرت رو که یادت نرفته؟ وارد کن.";
    if (!postalCode.trim()) e.postalCode = "کد پستی ۱۰ رقمی رو بزن، پستچی گم نشه!";
    else if (!postalCodeRegex.test(postalCode)) e.postalCode = "کد پستی باید ۱۰ رقم باشه، نه ۹ تا، نه ۱۱ تا!";
    return e;
  }, [fullName, phone, address, province, city, postalCode]);

  const isValid = Object.keys(errors).length === 0;

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTouched(true);
    if (!isValid) {
      setSubmitError("یه نگاه به فرم بنداز، چندتا جا رو جا انداختی!");
      return;
    }

    const payload = {
      fullName,
      phone: toEnglishDigits(phone),
      address,
      province,
      city,
      postalCode: toEnglishDigits(postalCode),
      shippingMethod: method,
      shippingPrice,
      note: customerNote,
    };

    try {
      setIsSubmitting(true);
      localStorage.setItem("shippingInfo", JSON.stringify(payload));
      router.push("/payment");
    } catch {
      setSubmitError("ذخیره نشد! یه بار دیگه بزن، شاید این دفعه طالع‌مان بهتر بود.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedMethod = shippingMethods.find(m => m.id === method);
  const shortNote = customerNote.length > 30 ? customerNote.slice(0, 30) + "..." : customerNote;

  const SummaryContent = () => (
    <div className="space-y-3">
      <h3 className="text-sm font-bold text-white border-b border-[#1a2540] pb-3 flex items-center gap-2">
        <CheckCircle2 size={16} className="text-emerald-400" />
        چک اجمالی
      </h3>
      <div className="space-y-2.5">
        <SummaryRow icon={<User size={12} />} label="گیرنده" value={fullName || "—"} />
        <SummaryRow icon={<Phone size={12} />} label="تماس" value={phone || "—"} />
        <SummaryRow icon={<MapPin size={12} />} label="آدرس" value={address ? `${province}، ${city}` : "—"} />
        <SummaryRow icon={<Hash size={12} />} label="کد پستی" value={postalCode || "—"} />
        <SummaryRow icon={<Truck size={12} />} label="ارسال" value={selectedMethod?.title || "—"} />
        <SummaryRow icon={<ShoppingCart size={12} />} label="هزینه ارسال" value={shippingPrice ? `${shippingPrice.toLocaleString()} تومان` : "رایگان"} />
        {customerNote && <SummaryRow icon={<Mail size={12} />} label="یادداشت" value={shortNote} />}
      </div>
    </div>
  );

  // آبی تیره
  const glassBg = { background: "rgba(10,15,28,0.55)", backdropFilter: "blur(20px) saturate(180%)", WebkitBackdropFilter: "blur(20px) saturate(180%)" };
  const glassBorder = "border-[#1a2540]";

  return (
    <div className={`min-h-screen px-4 md:px-8 py-8 md:py-10 transition-all duration-700 ${mounted ? "opacity-100" : "opacity-0"}`}>
      <div className="max-w-5xl mx-auto">

        {/* STEPS */}
        <div className="flex items-center justify-center mb-10 gap-2 md:gap-3">
          <StepItem icon={<ShoppingCart size={16} />} label="سبد خرید" done />
          <StepLine />
          <StepItem icon={<Truck size={16} />} label="اطلاعات ارسال" active />
          <StepLine />
          <StepItem icon={<CreditCard size={16} />} label="پرداخت" />
          <StepLine />
          <StepItem icon={<CheckCircle2 size={16} />} label="پایان" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* FORM */}
          <form onSubmit={onSubmit} className="lg:col-span-2 space-y-6">
            
            {/* Receiver Info */}
            <div className={`p-5 md:p-6 rounded-2xl border ${glassBorder}`} style={glassBg}>
              <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
                <User size={15} className="text-blue-400" /> اطلاعات گیرنده
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <InputField label="نام و نام خانوادگی" value={fullName} onChange={setFullName} placeholder="علی رضایی" error={touched ? errors.fullName : undefined} />
                <InputField label="شماره تماس" value={phone} onChange={setPhone} placeholder="۰۹۱۲۳۴۵۶۷۸۹" error={touched ? errors.phone : undefined} dir="ltr" />
              </div>
              <div className="mt-4">
                <InputField label="آدرس کامل" value={address} onChange={setAddress} placeholder="خیابان، پلاک، واحد..." error={touched ? errors.address : undefined} />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                <InputField label="استان" value={province} onChange={setProvince} placeholder="تهران" error={touched ? errors.province : undefined} />
                <InputField label="شهر" value={city} onChange={setCity} placeholder="تهران" error={touched ? errors.city : undefined} />
                <InputField label="کد پستی" value={postalCode} onChange={setPostalCode} placeholder="۱۰ رقمی" error={touched ? errors.postalCode : undefined} />
              </div>
            </div>

            {/* Shipping Method */}
            <div className={`p-5 md:p-6 rounded-2xl border ${glassBorder}`} style={glassBg}>
              <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
                <Truck size={15} className="text-blue-400" /> روش ارسال
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {shippingMethods.map((m) => (
                  <button key={m.id} type="button" disabled={!m.active}
                    onClick={() => m.active && setMethod(m.id)}
                    className={`text-right p-4 rounded-2xl border transition-all duration-300 ${
                      m.id === method
                        ? "border-blue-500/30 bg-blue-500/5 shadow-lg shadow-blue-500/5"
                        : `border-[#1a2540] bg-[#0a0f1c]/50 hover:bg-[#0a0f1c]/80 hover:border-[#253050]`
                    } ${!m.active ? "opacity-30 grayscale cursor-not-allowed" : ""}`}>
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-sm text-white">{m.title}</span>
                      {m.active && (
                        <div className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${m.id === method ? "bg-blue-400 shadow-[0_0_8px_rgba(37,99,235,0.6)]" : "bg-[#1a2540]"}`} />
                      )}
                    </div>
                    <p className="text-[11px] text-gray-400 mt-1.5 leading-5">{m.description}</p>
                    {m.price && <p className="text-[10px] text-blue-400/70 mt-1">{m.price.toLocaleString()} تومان</p>}
                  </button>
                ))}
              </div>
            </div>

            {/* Note */}
            <div className={`p-5 md:p-6 rounded-2xl border ${glassBorder}`} style={glassBg}>
              <label className="text-sm font-bold text-white mb-3 flex items-center gap-2">
                <Mail size={15} className="text-blue-400" /> توضیحات (اختیاری)
              </label>
              <textarea ref={noteRef} value={customerNote} maxLength={maxNoteChars}
                onChange={(e) => setCustomerNote(e.target.value)}
                className="w-full px-4 py-3 text-sm rounded-xl bg-[#0a0f1c]/80 border border-[#1a2540] text-white placeholder:text-gray-600 focus:border-blue-500/30 outline-none transition-all resize-none max-h-[140px] leading-6"
                placeholder="اگه حرفی هست که پستچی باید بدونه..." />
              <div className="flex items-center justify-between mt-2">
                <div className="flex-1 h-1.5 rounded-full bg-[#1a2540] overflow-hidden mr-3">
                  <div className="h-full bg-gradient-to-r from-blue-500 to-blue-400 rounded-full transition-all duration-300"
                    style={{ width: `${(customerNote.length / maxNoteChars) * 100}%` }} />
                </div>
                <span className="text-[10px] text-gray-500">{customerNote.length}/{maxNoteChars}</span>
              </div>
            </div>

            {/* Error */}
            {submitError && (
              <div className="flex items-start gap-2.5 p-4 rounded-2xl bg-red-500/5 border border-red-500/20 text-red-400 text-xs leading-6">
                <AlertCircle size={15} className="shrink-0 mt-0.5" />
                <span>{submitError}</span>
              </div>
            )}

            {/* MOBILE SUMMARY */}
            <div className={`lg:hidden p-5 rounded-2xl border ${glassBorder}`} style={glassBg}>
              <button type="button" onClick={() => setShowSummary(!showSummary)}
                className="w-full flex items-center justify-between text-sm font-bold text-white">
                <span className="flex items-center gap-2">
                  <CheckCircle2 size={16} className="text-emerald-400" /> چک اجمالی
                </span>
                <ChevronLeft size={16} className={`text-gray-400 transition-transform duration-300 ${showSummary ? "-rotate-90" : ""}`} />
              </button>
              {showSummary && <div className="mt-4 pt-4 border-t border-[#1a2540]"><SummaryContent /></div>}
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button type="submit" disabled={isSubmitting}
                className="w-full sm:w-auto flex-1 flex items-center justify-center gap-2 py-3.5 rounded-xl bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white font-bold text-sm transition-all duration-300 hover:scale-[1.02] active:scale-95 shadow-lg shadow-blue-500/20 disabled:opacity-60">
                {isSubmitting ? <Loader2 size={18} className="animate-spin" /> : <CreditCard size={18} />}
                {isSubmitting ? "در حال ذخیره..." : "ادامه تا پرداخت"}
              </button>
              <Link href="/cart"
                className="w-full sm:w-auto flex items-center justify-center gap-2 py-3.5 px-6 rounded-xl border border-[#1a2540] bg-[#0a0f1c]/50 text-gray-400 hover:text-white hover:bg-[#0a0f1c]/80 text-sm font-medium transition-all">
                <ChevronRight size={16} className="rotate-180" /> بازگشت به سبد خرید
              </Link>
            </div>
          </form>

          {/* DESKTOP SUMMARY */}
          <aside className="hidden lg:block lg:col-span-1">
            <div className="sticky top-24 p-5 rounded-2xl border border-[#1a2540]" style={{ background: "rgba(10,15,28,0.7)", backdropFilter: "blur(30px)", WebkitBackdropFilter: "blur(30px)" }}>
              <SummaryContent />
            </div>
          </aside>

        </div>
      </div>
    </div>
  );
}

/* ==================== SUB COMPONENTS ==================== */
function InputField({ label, value, onChange, placeholder, error, dir }: {
  label: string; value: string; onChange: (v: string) => void; placeholder: string; error?: string; dir?: string;
}) {
  return (
    <div className="space-y-1.5">
      <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">{label}</label>
      <input value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} dir={dir}
        className={`w-full px-4 py-2.5 text-sm rounded-xl bg-[#0a0f1c]/80 border text-white placeholder:text-gray-600 outline-none transition-all duration-300 ${
          error ? "border-red-500/30 focus:border-red-500/50" : "border-[#1a2540] focus:border-blue-500/30"
        }`} />
      {error && (
        <p className="text-red-400 text-[10px] flex items-center gap-1">
          <Smile size={10} className="shrink-0" /> {error}
        </p>
      )}
    </div>
  );
}

function SummaryRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-2">
      <div className="flex items-center gap-1.5 text-gray-500 min-w-0">
        <span className="shrink-0">{icon}</span>
        <span className="text-[10px] truncate">{label}</span>
      </div>
      <span className="text-[11px] text-gray-300 font-medium text-right shrink-0 max-w-[60%] truncate">{value}</span>
    </div>
  );
}

function StepItem({ icon, label, active, done }: { icon: React.ReactNode; label: string; active?: boolean; done?: boolean }) {
  return (
    <div className="flex flex-col items-center gap-1.5">
      <div className={`w-9 h-9 md:w-10 md:h-10 rounded-xl flex items-center justify-center transition-all duration-300 ${
        active ? "bg-blue-600 text-white shadow-[0_0_14px_rgba(37,99,235,0.45)]" :
        done ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30" :
        "bg-[#0a0f1c] text-gray-600 border border-[#1a2540]"
      }`}>
        {icon}
      </div>
      <span className={`text-[10px] md:text-[11px] whitespace-nowrap ${
        active ? "text-white font-bold" : done ? "text-emerald-400" : "text-gray-600"
      }`}>{label}</span>
    </div>
  );
}

function StepLine() {
  return <div className="w-6 md:w-10 h-[2px] bg-[#1a2540] mb-5 rounded-full" />;
}