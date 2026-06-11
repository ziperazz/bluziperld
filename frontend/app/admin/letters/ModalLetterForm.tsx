"use client";

import React, { useEffect, useState } from "react";
import {
  X, Upload, Plus, Trash2, Save, Image as ImageIcon,
  Tag, DollarSign, Package, Activity, Star, Eye,
  ShoppingCart, Printer, PenTool, Search, AlertTriangle
} from "lucide-react";
import SeoFields from "../components/SeoFields";

interface Spec {
  label: string;
  value: string;
}

interface LetterFormData {
  title: string;
  description: string;
  category: string;
  price: number;
  discount: number;
  instock: number;
  images: string[];
  imageFiles: File[];
  specs: Spec[];
  isActive: boolean;
  printingExtraPrice: number;
  handwritingExtraPrice: number;
  visits: number;
  purchaseCount: number;
  ratingAverage: number;
  rating: number;
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  editData: LetterFormData | null;
  onSave: (data: LetterFormData) => void;
}

const defaultLetter: LetterFormData = {
  title: "",
  description: "",
  category: "",
  price: 0,
  discount: 0,
  instock: 0,
  images: [],
  imageFiles: [],
  specs: [],
  isActive: true,
  printingExtraPrice: 0,
  handwritingExtraPrice: 0,
  visits: 0,
  purchaseCount: 0,
  ratingAverage: 0,
  rating: 0,
};

export default function ModalLetterForm({ isOpen, onClose, editData, onSave }: Props) {
  const [formData, setFormData] = useState<LetterFormData>(defaultLetter);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [activeTab, setActiveTab] = useState<"basic" | "media" | "seo" | "stats">("basic");
  const [showCloseConfirm, setShowCloseConfirm] = useState(false);

  // SEO State ها
  const [metaTitle, setMetaTitle] = useState("");
  const [metaDescription, setMetaDescription] = useState("");
  const [metaKeywords, setMetaKeywords] = useState("");

  useEffect(() => {
    if (editData) {
      setFormData({ ...editData, imageFiles: [] });
      setMetaTitle(editData.metaTags?.title || "");
      setMetaDescription(editData.metaTags?.description || "");
      setMetaKeywords(editData.metaTags?.keywords?.join(", ") || "");
    } else {
      setFormData(defaultLetter);
      setMetaTitle("");
      setMetaDescription("");
      setMetaKeywords("");
    }
    setErrors({});
    setActiveTab("basic");
    setShowCloseConfirm(false);
  }, [editData, isOpen]);

  const updateField = (field: keyof LetterFormData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const hasChanges = () => {
    return formData.title.trim() !== "" || 
           formData.description.trim() !== "" || 
           formData.price > 0 ||
           formData.imageFiles.length > 0 ||
           metaTitle.trim() !== "" ||
           metaDescription.trim() !== "";
  };

  const handleCloseAttempt = () => {
    if (hasChanges()) {
      setShowCloseConfirm(true);
    } else {
      onClose();
    }
  };

  function validate() {
    const errs: Record<string, string> = {};
    if (!formData.title.trim()) errs.title = "عنوان الزامی است";
    if (!formData.category.trim()) errs.category = "دسته‌بندی الزامی است";
    if (formData.price < 0) errs.price = "قیمت نامعتبر است";
    if (formData.discount < 0 || formData.discount > 100) errs.discount = "تخفیف بین 0 تا 100";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    if (type === "checkbox") {
      updateField(name as any, (e.target as HTMLInputElement).checked);
      return;
    }
    const numberFields = ["price", "discount", "instock", "printingExtraPrice", "handwritingExtraPrice", "visits", "purchaseCount", "ratingAverage", "rating"];
    updateField(name as any, numberFields.includes(name) ? Number(value) : value);
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    
    // اضافه کردن SEO به formData
    const dataWithSeo = {
      ...formData,
      metaTitle,
      metaDescription,
      metaKeywords,
    };
    onSave(dataWithSeo);
  };

  if (!isOpen) return null;

  const tabs = [
    { id: "basic", label: "اطلاعات پایه", icon: Tag },
    { id: "media", label: "تصاویر و مشخصات", icon: ImageIcon },
    { id: "seo", label: "سئو", icon: Search },
    { id: "stats", label: "آمار و وضعیت", icon: Activity },
  ];

  return (
    <div
      dir="rtl"
      className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-[9999] p-4"
      onClick={handleCloseAttempt}
    >
      <div
        className="bg-[#0a0f1c] border border-[#1a2540] rounded-3xl w-full max-w-3xl max-h-[90vh] overflow-hidden shadow-2xl shadow-black/50"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-[#1a2540]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
              <Package size={20} className="text-blue-400" />
            </div>
            <h2 className="text-xl font-black text-white">
              {editData ? "ویرایش پاکت‌نامه" : "افزودن پاکت‌نامه جدید"}
            </h2>
          </div>
          <button onClick={handleCloseAttempt} className="p-2 rounded-xl hover:bg-white/5 text-gray-400 hover:text-white transition">
            <X size={20} />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-[#1a2540] px-6 overflow-x-auto">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-4 py-3 text-sm font-medium transition-all border-b-2 -mb-[1px] whitespace-nowrap ${
                  activeTab === tab.id
                    ? "text-blue-400 border-blue-400"
                    : "text-gray-500 border-transparent hover:text-gray-300"
                }`}
              >
                <Icon size={15} />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Content */}
        <form onSubmit={submit} className="overflow-y-auto max-h-[calc(90vh-180px)]">
          {/* Tab: Basic Info */}
          {activeTab === "basic" && (
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input label="عنوان" name="title" value={formData.title} onChange={handleChange} error={errors.title} icon={Tag} />
                <Input label="دسته‌بندی" name="category" value={formData.category} onChange={handleChange} error={errors.category} icon={Package} />
              </div>

              <Textarea label="توضیحات" name="description" value={formData.description} onChange={handleChange} />

              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <Input label="قیمت (تومان)" name="price" type="number" value={formData.price} onChange={handleChange} error={errors.price} icon={DollarSign} />
                <Input label="تخفیف (%)" name="discount" type="number" value={formData.discount} onChange={handleChange} error={errors.discount} />
                <Input label="موجودی" name="instock" type="number" value={formData.instock} onChange={handleChange} icon={Package} />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input label="هزینه چاپ اضافه" name="printingExtraPrice" type="number" value={formData.printingExtraPrice} onChange={handleChange} icon={Printer} />
                <Input label="هزینه خطاطی دست‌نویس" name="handwritingExtraPrice" type="number" value={formData.handwritingExtraPrice} onChange={handleChange} icon={PenTool} />
              </div>
            </div>
          )}

          {/* Tab: Media & Specs */}
          {activeTab === "media" && (
            <div className="p-6 space-y-6">
              <FileImagesManager
                files={formData.imageFiles}
                onAdd={(files: File[]) => updateField("imageFiles", [...formData.imageFiles, ...files])}
                onRemove={(i: number) => updateField("imageFiles", formData.imageFiles.filter((_, x) => x !== i))}
              />

              {formData.images.length > 0 && (
                <ExistingImagesManager
                  images={formData.images}
                  onRemove={(idx: number) => updateField("images", formData.images.filter((_, i) => i !== idx))}
                />
              )}

              <SpecsManager
                specs={formData.specs}
                onAdd={() => updateField("specs", [...formData.specs, { label: "", value: "" }])}
                onChange={(i: number, field: string, val: string) => {
                  const arr = [...formData.specs];
                  arr[i] = { ...arr[i], [field]: val };
                  updateField("specs", arr);
                }}
                onRemove={(i: number) => updateField("specs", formData.specs.filter((_, x) => x !== i))}
              />
            </div>
          )}

          {/* Tab: SEO 🆕 */}
          {activeTab === "seo" && (
            <div className="p-6">
              <SeoFields
                metaTitle={metaTitle}
                metaDescription={metaDescription}
                metaKeywords={metaKeywords}
                onTitleChange={setMetaTitle}
                onDescriptionChange={setMetaDescription}
                onKeywordsChange={setMetaKeywords}
              />
            </div>
          )}

          {/* Tab: Stats */}
          {activeTab === "stats" && (
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <Input label="بازدید" name="visits" type="number" value={formData.visits} onChange={handleChange} icon={Eye} />
                <Input label="تعداد خرید" name="purchaseCount" type="number" value={formData.purchaseCount} onChange={handleChange} icon={ShoppingCart} />
                <Input label="میانگین امتیاز" name="ratingAverage" type="number" value={formData.ratingAverage} onChange={handleChange} icon={Star} />
                <Input label="امتیاز" name="rating" type="number" value={formData.rating} onChange={handleChange} icon={Star} />
              </div>

              <div className="flex items-center gap-3 p-4 rounded-xl bg-[#050d27] border border-[#1a2540]">
                <input
                  type="checkbox"
                  name="isActive"
                  id="isActive"
                  checked={formData.isActive}
                  onChange={handleChange}
                  className="w-5 h-5 rounded-lg accent-blue-500"
                />
                <label htmlFor="isActive" className="text-white font-medium cursor-pointer select-none">
                  {formData.isActive ? "🟢 پاکت‌نامه فعال است" : "🔴 پاکت‌نامه غیرفعال است"}
                </label>
              </div>
            </div>
          )}
        </form>

        {/* Footer */}
        <div className="flex justify-end gap-3 p-6 border-t border-[#1a2540]">
          <button
            type="button"
            onClick={handleCloseAttempt}
            className="px-5 py-2.5 rounded-xl border border-[#1a2540] text-gray-400 hover:text-white hover:bg-white/5 transition-all text-sm font-medium"
          >
            انصراف
          </button>
          <button
            type="submit"
            onClick={submit}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-blue-500 text-white font-bold text-sm hover:from-blue-500 hover:to-blue-400 transition-all shadow-lg shadow-blue-500/20"
          >
            <Save size={16} />
            ذخیره پاکت‌نامه
          </button>
        </div>
      </div>

      {/* 🆕 Close Confirmation Modal */}
      {showCloseConfirm && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[10000] p-4"
          onClick={() => setShowCloseConfirm(false)}>
          <div
            className="bg-[#0a0f1c] border border-[#1a2540] rounded-2xl p-6 max-w-sm w-full shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-yellow-500/10 border border-yellow-500/20 flex items-center justify-center">
                <AlertTriangle size={20} className="text-yellow-400" />
              </div>
              <div>
                <h3 className="text-white font-bold text-sm">تغییرات ذخیره نشده!</h3>
                <p className="text-gray-500 text-xs mt-0.5">اطلاعاتی که وارد کردید از بین می‌رود.</p>
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => { setShowCloseConfirm(false); onClose(); }}
                className="flex-1 py-2.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm font-medium hover:bg-red-500/20 transition"
              >
                بستن بدون ذخیره
              </button>
              <button
                onClick={() => setShowCloseConfirm(false)}
                className="flex-1 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-medium hover:bg-blue-500 transition"
              >
                ادامه ویرایش
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ==========================================
   📷 File Images Manager
   ========================================== */

function FileImagesManager({ files, onAdd, onRemove }: any) {
  return (
    <div className="space-y-3">
      <label className="text-sm font-bold text-white flex items-center gap-2">
        <Upload size={15} className="text-blue-400" /> آپلود تصاویر جدید
      </label>

      <label className="flex items-center justify-center gap-2 p-6 border-2 border-dashed border-[#1a2540] rounded-2xl cursor-pointer hover:border-blue-500/30 transition-all bg-[#050d27]/50">
        <Upload size={18} className="text-gray-500" />
        <span className="text-sm text-gray-500">کلیک کنید یا فایل‌ها را بکشید</span>
        <input
          type="file"
          multiple
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            if (!e.target.files) return;
            onAdd(Array.from(e.target.files));
          }}
        />
      </label>

      {files.length > 0 && (
        <div className="grid grid-cols-3 md:grid-cols-4 gap-2">
          {files.map((file: File, i: number) => (
            <div key={i} className="relative group rounded-xl overflow-hidden bg-[#050d27] border border-[#1a2540]">
              <img
                src={URL.createObjectURL(file)}
                alt=""
                className="w-full h-20 object-cover"
              />
              <button
                type="button"
                onClick={() => onRemove(i)}
                className="absolute top-1 right-1 p-1 rounded-lg bg-red-500/80 text-white opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <Trash2 size={12} />
              </button>
              <p className="text-[9px] text-gray-500 truncate p-1">{file.name}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ==========================================
   🖼️ Existing Images
   ========================================== */

function ExistingImagesManager({ images, onRemove }: any) {
  const apiBase = process.env.NEXT_PUBLIC_API_URL?.replace(/\/+$/, "") || "http://localhost:5000";

  const buildImageUrl = (img: string) => {
    if (/^https?:\/\//i.test(img)) return img;
    if (!img.startsWith("/uploads")) return `${apiBase}/uploads/${img}`;
    return `${apiBase}${img}`;
  };

  return (
    <div className="space-y-3">
      <label className="text-sm font-bold text-white flex items-center gap-2">
        <ImageIcon size={15} className="text-blue-400" /> تصاویر فعلی ({images.length})
      </label>

      <div className="grid grid-cols-3 md:grid-cols-4 gap-2">
        {images.map((img: string, i: number) => (
          <div key={i} className="relative group rounded-xl overflow-hidden bg-[#050d27] border border-[#1a2540]">
            <img src={buildImageUrl(img)} className="w-full h-20 object-cover" alt="" />
            <button
              type="button"
              onClick={() => onRemove(i)}
              className="absolute top-1 right-1 p-1 rounded-lg bg-red-500/80 text-white opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <Trash2 size={12} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ==========================================
   📋 Specs Manager
   ========================================== */

function SpecsManager({ specs, onAdd, onChange, onRemove }: any) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-sm font-bold text-white flex items-center gap-2">
          <Activity size={15} className="text-blue-400" /> مشخصات فنی
        </label>
        <button
          type="button"
          onClick={onAdd}
          className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-medium hover:bg-blue-500/20 transition-all"
        >
          <Plus size={13} /> افزودن
        </button>
      </div>

      {specs.length === 0 ? (
        <p className="text-xs text-gray-600 text-center py-4">هیچ مشخصه‌ای ثبت نشده</p>
      ) : (
        <div className="space-y-2">
          {specs.map((spec: Spec, i: number) => (
            <div key={i} className="flex items-center gap-2">
              <input
                value={spec.label}
                placeholder="عنوان"
                onChange={(e) => onChange(i, "label", e.target.value)}
                className="flex-1 bg-[#050d27] border border-[#1a2540] rounded-lg px-3 py-2 text-sm text-white placeholder:text-gray-600 focus:border-blue-500/50 outline-none"
              />
              <input
                value={spec.value}
                placeholder="مقدار"
                onChange={(e) => onChange(i, "value", e.target.value)}
                className="flex-1 bg-[#050d27] border border-[#1a2540] rounded-lg px-3 py-2 text-sm text-white placeholder:text-gray-600 focus:border-blue-500/50 outline-none"
              />
              <button
                type="button"
                onClick={() => onRemove(i)}
                className="p-2 rounded-lg text-red-400 hover:bg-red-500/10 transition"
              >
                <Trash2 size={14} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ==========================================
   🔤 Input & Textarea
   ========================================== */

function Input({ label, name, value, onChange, type = "text", error, icon: Icon }: any) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-medium text-gray-400">{label}</label>
      <div className="relative">
        {Icon && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-600">
            <Icon size={14} />
          </div>
        )}
        <input
          type={type}
          name={name}
          value={value}
          onChange={onChange}
          className={`w-full bg-[#050d27] border rounded-lg py-2.5 text-sm text-white placeholder:text-gray-600 focus:border-blue-500/50 outline-none transition-all ${
            Icon ? "pr-9 pl-3" : "px-3"
          } ${error ? "border-red-500/50" : "border-[#1a2540]"}`}
        />
      </div>
      {error && <p className="text-red-400 text-[11px]">{error}</p>}
    </div>
  );
}

function Textarea({ label, name, value, onChange }: any) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-medium text-gray-400">{label}</label>
      <textarea
        name={name}
        value={value}
        onChange={onChange}
        rows={4}
        className="w-full bg-[#050d27] border border-[#1a2540] rounded-lg px-3 py-2.5 text-sm text-white placeholder:text-gray-600 focus:border-blue-500/50 outline-none resize-none transition-all"
      />
    </div>
  );
}
