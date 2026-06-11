"use client";

import { useEffect, useState } from "react";
import {
  Plus, Trash2, Tag, Percent, DollarSign, Calendar,
  Hash, FileText, Coins, Repeat, Clock, X, Save, AlertCircle
} from "lucide-react";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export default function AdminDiscountsPage() {
  const [discounts, setDiscounts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formError, setFormError] = useState("");
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    code: "",
    type: "percent",
    value: "",
    minOrderAmount: "",
    maxUses: "",
    expiresAt: "",
    description: ""
  });

  const fetchDiscounts = async () => {
    try {
      const token = localStorage.getItem("accessToken");
      const res = await fetch(`${API}/api/discounts`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      setDiscounts(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchDiscounts(); }, []);

  const resetForm = () => {
    setForm({ code: "", type: "percent", value: "", minOrderAmount: "", maxUses: "", expiresAt: "", description: "" });
    setFormError("");
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");

    // اعتبارسنجی
    if (!form.code.trim()) {
      setFormError("کد تخفیف را وارد کنید");
      return;
    }
    if (!form.value || Number(form.value) <= 0) {
      setFormError("مقدار تخفیف باید بیشتر از صفر باشد");
      return;
    }
    if (form.type === "percent" && Number(form.value) > 100) {
      setFormError("درصد تخفیف نمی‌تواند بیشتر از ۱۰۰ باشد");
      return;
    }

    setSaving(true);
    try {
      const token = localStorage.getItem("accessToken");
      const res = await fetch(`${API}/api/discounts`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          code: form.code.trim().toUpperCase(),
          type: form.type,
          value: Number(form.value),
          minOrderAmount: Number(form.minOrderAmount) || 0,
          maxUses: Number(form.maxUses) || 0,
          expiresAt: form.expiresAt || null,
          description: form.description.trim()
        })
      });

      const data = await res.json();

      if (!res.ok) {
        setFormError(data.message || "خطا در ذخیره");
        return;
      }

      setShowForm(false);
      resetForm();
      fetchDiscounts();
    } catch (e) {
      setFormError("خطا در ارتباط با سرور");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("آیا از حذف این کد تخفیف مطمئن هستید؟")) return;
    try {
      const token = localStorage.getItem("accessToken");
      await fetch(`${API}/api/discounts/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchDiscounts();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="p-4 md:p-6 space-y-6" dir="rtl">

      {/* HEADER */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-white flex items-center gap-2">
            <Tag size={28} className="text-blue-400" />
            کدهای تخفیف
          </h1>
          <p className="text-gray-500 text-xs md:text-sm mt-1">
            {discounts.length} کد تخفیف فعال
          </p>
        </div>

        <button
          onClick={() => { setShowForm(!showForm); resetForm(); }}
          className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl
            bg-gradient-to-r from-blue-600 to-blue-500 text-white font-bold text-sm
            hover:from-blue-500 hover:to-blue-400 transition-all shadow-lg shadow-blue-500/20 active:scale-95"
        >
          {showForm ? <X size={18} /> : <Plus size={18} />}
          {showForm ? "انصراف" : "کد تخفیف جدید"}
        </button>
      </div>

      {/* FORM */}
      {showForm && (
        <form onSubmit={handleCreate} className="p-6 rounded-2xl bg-[#0a0f1c] border border-[#1a2540] space-y-4 animate-fade-in-up">
          <h2 className="text-base font-bold text-white flex items-center gap-2 mb-4">
            <Plus size={18} className="text-blue-400" />
            ساخت کد تخفیف جدید
          </h2>

          {/* Row 1: کد + نوع */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InputField
              label="کد تخفیف"
              placeholder="مثلاً: WELCOME20"
              value={form.code}
              onChange={(v) => setForm({ ...form, code: v.toUpperCase() })}
              icon={<Hash size={14} />}
              hint="کاربر این کد را وارد می‌کند"
            />
            <SelectField
              label="نوع تخفیف"
              value={form.type}
              onChange={(v) => setForm({ ...form, type: v })}
              icon={<Tag size={14} />}
              options={[
                { value: "percent", label: "درصدی (%)" },
                { value: "fixed", label: "مبلغ ثابت (تومان)" }
              ]}
            />
          </div>

          {/* Row 2: مقدار + حداقل سفارش */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InputField
              label={form.type === "percent" ? "درصد تخفیف" : "مبلغ تخفیف (تومان)"}
              type="number"
              placeholder={form.type === "percent" ? "مثلاً: ۲۰" : "مثلاً: ۵۰۰۰۰"}
              value={form.value}
              onChange={(v) => setForm({ ...form, value: v })}
              icon={form.type === "percent" ? <Percent size={14} /> : <DollarSign size={14} />}
            />
            <InputField
              label="حداقل مبلغ سفارش (تومان)"
              type="number"
              placeholder="اختیاری - مثلاً: ۲۰۰۰۰۰"
              value={form.minOrderAmount}
              onChange={(v) => setForm({ ...form, minOrderAmount: v })}
              icon={<Coins size={14} />}
              hint="۰ یعنی بدون محدودیت"
            />
          </div>

          {/* Row 3: حداکثر استفاده + تاریخ انقضا */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InputField
              label="حداکثر تعداد استفاده"
              type="number"
              placeholder="۰ = نامحدود"
              value={form.maxUses}
              onChange={(v) => setForm({ ...form, maxUses: v })}
              icon={<Repeat size={14} />}
              hint="بعد از این تعداد، کد غیرفعال می‌شود"
            />
            <InputField
              label="تاریخ انقضا"
              type="datetime-local"
              value={form.expiresAt}
              onChange={(v) => setForm({ ...form, expiresAt: v })}
              icon={<Clock size={14} />}
              hint="خالی = بدون انقضا"
            />
          </div>

          {/* توضیحات */}
          <InputField
            label="توضیحات (اختیاری)"
            placeholder="مثلاً: تخفیف ویژه جشنواره نوروز"
            value={form.description}
            onChange={(v) => setForm({ ...form, description: v })}
            icon={<FileText size={14} />}
          />

          {/* خطا */}
          {formError && (
            <div className="flex items-center gap-2 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs">
              <AlertCircle size={14} /> {formError}
            </div>
          )}

          {/* دکمه ذخیره */}
          <button
            type="submit"
            disabled={saving}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-500 text-white font-bold text-sm hover:from-emerald-500 hover:to-emerald-400 transition-all disabled:opacity-50"
          >
            {saving ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <Save size={16} />
            )}
            {saving ? "در حال ذخیره..." : "ذخیره کد تخفیف"}
          </button>
        </form>
      )}

      {/* LIST */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-36 rounded-2xl bg-white/[0.02] animate-pulse" />
          ))}
        </div>
      ) : discounts.length === 0 ? (
        <div className="text-center py-16">
          <Tag size={40} className="text-gray-600 mx-auto mb-3" />
          <p className="text-gray-500 text-sm">هیچ کد تخفیفی ساخته نشده</p>
          <p className="text-gray-600 text-xs mt-1">از دکمه بالا اولین کد رو بساز</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {discounts.map((d) => (
            <DiscountCard key={d._id} discount={d} onDelete={handleDelete} />
          ))}
        </div>
      )}
    </div>
  );
}

/* ==================== COMPONENTS ==================== */

function InputField({ label, placeholder, value, onChange, type = "text", icon, hint }: any) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-medium text-gray-400 flex items-center gap-1.5">
        {icon} {label}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full bg-[#050d27] border border-[#1a2540] rounded-lg px-3 py-2.5 text-sm text-white placeholder:text-gray-600 focus:border-blue-500/50 outline-none transition-all"
      />
      {hint && <p className="text-[10px] text-gray-600">{hint}</p>}
    </div>
  );
}

function SelectField({ label, value, onChange, icon, options }: any) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-medium text-gray-400 flex items-center gap-1.5">
        {icon} {label}
      </label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-[#050d27] border border-[#1a2540] rounded-lg px-3 py-2.5 text-sm text-white focus:border-blue-500/50 outline-none transition-all"
      >
        {options.map((opt: any) => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
    </div>
  );
}

function DiscountCard({ discount, onDelete }: any) {
  const isExpired = discount.expiresAt && new Date(discount.expiresAt) < new Date();
  const isMaxedOut = discount.maxUses > 0 && discount.usedCount >= discount.maxUses;

  return (
    <div className={`relative p-5 rounded-2xl border transition-all duration-300 group ${
      isExpired || isMaxedOut || !discount.isActive
        ? "bg-[#0a0f1c]/40 border-[#1a2540]/50 opacity-60"
        : "bg-[#0a0f1c]/60 border-[#1a2540] hover:border-blue-500/20 hover:bg-[#0a0f1c]/80"
    }`}>
      {/* Delete button */}
      <button
        onClick={() => onDelete(discount._id)}
        className="absolute top-3 left-3 p-1.5 rounded-lg bg-red-500/10 text-red-400 opacity-0 group-hover:opacity-100 hover:bg-red-500/20 transition-all"
      >
        <Trash2 size={14} />
      </button>

      {/* Status badge */}
      <div className="absolute top-3 right-3">
        {isExpired ? (
          <span className="text-[10px] px-2 py-0.5 rounded-lg bg-red-500/10 text-red-400">منقضی</span>
        ) : isMaxedOut ? (
          <span className="text-[10px] px-2 py-0.5 rounded-lg bg-yellow-500/10 text-yellow-400">تکمیل</span>
        ) : discount.isActive ? (
          <span className="text-[10px] px-2 py-0.5 rounded-lg bg-emerald-500/10 text-emerald-400">فعال</span>
        ) : (
          <span className="text-[10px] px-2 py-0.5 rounded-lg bg-red-500/10 text-red-400">غیرفعال</span>
        )}
      </div>

      {/* Icon + Title */}
      <div className="flex items-center gap-3 mb-4 mt-2">
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
          discount.type === "percent"
            ? "bg-blue-500/10"
            : "bg-emerald-500/10"
        }`}>
          {discount.type === "percent" ? (
            <Percent size={22} className="text-blue-400" />
          ) : (
            <DollarSign size={22} className="text-emerald-400" />
          )}
        </div>
        <div>
          <p className="text-xl font-black text-white">{discount.code}</p>
          <p className="text-xs font-bold text-blue-400">
            {discount.type === "percent"
              ? `${discount.value}٪ تخفیف`
              : `${discount.value.toLocaleString()} تومان تخفیف`}
          </p>
        </div>
      </div>

      {/* Details */}
      <div className="space-y-1.5 text-[11px]">
        <div className="flex justify-between text-gray-500">
          <span>استفاده شده</span>
          <span className="text-white font-medium">
            {discount.usedCount} <span className="text-gray-600">/ {discount.maxUses || "∞"}</span>
          </span>
        </div>

        {discount.minOrderAmount > 0 && (
          <div className="flex justify-between text-gray-500">
            <span>حداقل سفارش</span>
            <span className="text-white">{discount.minOrderAmount.toLocaleString()} تومان</span>
          </div>
        )}

        {discount.expiresAt && (
          <div className="flex justify-between text-gray-500">
            <span>انقضا</span>
            <span className={`${isExpired ? "text-red-400" : "text-white"}`}>
              {new Date(discount.expiresAt).toLocaleDateString("fa-IR")}
            </span>
          </div>
        )}

        {discount.description && (
          <div className="pt-2 border-t border-[#1a2540] text-gray-500 text-[10px] leading-relaxed">
            {discount.description}
          </div>
        )}
      </div>
    </div>
  );
}