"use client";

import { Search, FileText, Tag, Check, AlertTriangle, X, Eye, BarChart3 } from "lucide-react";

interface SeoFieldsProps {
  metaTitle: string;
  metaDescription: string;
  metaKeywords: string;
  slug?: string;
  onTitleChange: (v: string) => void;
  onDescriptionChange: (v: string) => void;
  onKeywordsChange: (v: string) => void;
}

export default function SeoFields({
  metaTitle,
  metaDescription,
  metaKeywords,
  slug,
  onTitleChange,
  onDescriptionChange,
  onKeywordsChange,
}: SeoFieldsProps) {
  
  // تحلیل SEO
  const analysis = {
    titleLength: metaTitle.length,
    titleStatus: metaTitle.length >= 30 && metaTitle.length <= 60 ? "good" : metaTitle.length > 0 ? "warning" : "bad",
    titleMsg: metaTitle.length >= 30 && metaTitle.length <= 60
      ? `✅ ${metaTitle.length} کاراکتر (عالی)`
      : metaTitle.length === 0
        ? "❌ عنوان خالی است"
        : `⚠️ ${metaTitle.length} کاراکتر (۳۰-۶۰ پیشنهاد می‌شود)`,
    
    descLength: metaDescription.length,
    descStatus: metaDescription.length >= 120 && metaDescription.length <= 160 ? "good" : metaDescription.length > 0 ? "warning" : "bad",
    descMsg: metaDescription.length >= 120 && metaDescription.length <= 160
      ? `✅ ${metaDescription.length} کاراکتر (عالی)`
      : metaDescription.length === 0
        ? "❌ توضیحات خالی است"
        : `⚠️ ${metaDescription.length} کاراکتر (۱۲۰-۱۶۰ پیشنهاد می‌شود)`,

    keywordCount: metaKeywords.split(",").filter(k => k.trim()).length,
    keywordStatus: metaKeywords.split(",").filter(k => k.trim()).length >= 3 ? "good" : metaKeywords.trim() ? "warning" : "bad",
    keywordMsg: metaKeywords.split(",").filter(k => k.trim()).length >= 3
      ? `✅ ${metaKeywords.split(",").filter(k => k.trim()).length} کلمه کلیدی`
      : metaKeywords.trim()
        ? "⚠️ حداقل ۳ کلمه کلیدی پیشنهاد می‌شود"
        : "❌ کلمه کلیدی وارد نشده",

    keywordInTitle: metaKeywords && metaTitle.includes(metaKeywords.split(",")[0]?.trim()) ? "good" : "warning",
    keywordInTitleMsg: metaKeywords && metaTitle.includes(metaKeywords.split(",")[0]?.trim())
      ? "✅ کلمه کلیدی اصلی در عنوان هست"
      : "⚠️ کلمه کلیدی اصلی در عنوان نیست",
  };

  const allItems = [
    { status: analysis.titleStatus, msg: analysis.titleMsg },
    { status: analysis.descStatus, msg: analysis.descMsg },
    { status: analysis.keywordStatus, msg: analysis.keywordMsg },
    { status: analysis.keywordInTitle, msg: analysis.keywordInTitleMsg },
  ];

  const score = allItems.filter(i => i.status === "good").length;
  const percentage = Math.round((score / allItems.length) * 100);

  const getScoreColor = () => {
    if (percentage >= 80) return "text-emerald-400";
    if (percentage >= 50) return "text-yellow-400";
    return "text-red-400";
  };

  const getScoreBg = () => {
    if (percentage >= 80) return "bg-emerald-500";
    if (percentage >= 50) return "bg-yellow-500";
    return "bg-red-500";
  };

  const StatusIcon = ({ status }: { status: string }) => {
    if (status === "good") return <Check size={12} className="text-emerald-400" />;
    if (status === "warning") return <AlertTriangle size={12} className="text-yellow-400" />;
    return <X size={12} className="text-red-400" />;
  };

  const getStatusBg = (status: string) => {
    if (status === "good") return "bg-emerald-500/5 border-emerald-500/10";
    if (status === "warning") return "bg-yellow-500/5 border-yellow-500/10";
    return "bg-red-500/5 border-red-500/10";
  };

  return (
    <div className="space-y-6">
      
      {/* 🔍 پیش‌نمایش گوگل */}
      <div className="space-y-3 p-5 rounded-2xl bg-[#0a0f1c] border border-[#1a2540]">
        <h3 className="text-xs font-bold text-gray-400 flex items-center gap-2">
          <Eye size={14} className="text-blue-400" /> پیش‌نمایش در گوگل
        </h3>
        
        {/* Mobile Preview */}
        <div className="bg-[#050d27] rounded-xl p-4 space-y-2 border border-[#1a2540]">
          <p className="text-blue-400 text-lg leading-tight font-medium line-clamp-2">
            {metaTitle || "عنوان سئو در اینجا نمایش داده می‌شود"}
          </p>
          <p className="text-emerald-500 text-[11px] truncate">
            {slug ? `https://bluziperld.ir/${slug}` : "https://bluziperld.ir/products/..."}
          </p>
          <p className="text-gray-500 text-xs leading-relaxed line-clamp-2">
            {metaDescription || "توضیحات متا در اینجا نمایش داده می‌شود. این متن زیر عنوان در نتایج گوگل نشان داده خواهد شد..."}
          </p>
        </div>
      </div>

      {/* ⚙️ فرم SEO */}
      <div className="space-y-4 p-5 rounded-2xl bg-[#0a0f1c] border border-yellow-500/20">
        <div className="flex items-center gap-2 mb-2">
          <Search size={16} className="text-yellow-400" />
          <h3 className="text-sm font-bold text-yellow-400">تنظیمات سئو (SEO)</h3>
          <span className="text-[10px] text-gray-600 mr-auto">
            خالی بگذارید تا خودکار پر شود
          </span>
        </div>

        {/* Meta Title */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="text-xs font-medium text-gray-400 flex items-center gap-1.5">
              <FileText size={12} /> عنوان سئو (Meta Title)
            </label>
            <span className={`text-[10px] ${
              metaTitle.length === 0 ? "text-gray-600" :
              metaTitle.length > 60 ? "text-red-400" :
              metaTitle.length < 30 ? "text-yellow-400" : "text-emerald-400"
            }`}>
              {metaTitle.length}/۶۰
            </span>
          </div>
          <input
            type="text"
            value={metaTitle}
            onChange={(e) => onTitleChange(e.target.value)}
            placeholder="مثلاً: پاکت نامه کلاسیک | BluZiperld"
            className="w-full bg-[#050d27] border border-[#1a2540] rounded-lg px-3 py-2.5 text-sm text-white placeholder:text-gray-600 focus:border-yellow-500/50 outline-none"
          />
          <p className="text-[10px] text-gray-600">۳۰-۶۰ کاراکتر. در گوگل به رنگ آبی نمایش داده می‌شود.</p>
        </div>

        {/* Meta Description */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="text-xs font-medium text-gray-400 flex items-center gap-1.5">
              <FileText size={12} /> توضیحات سئو (Meta Description)
            </label>
            <span className={`text-[10px] ${
              metaDescription.length === 0 ? "text-gray-600" :
              metaDescription.length > 160 ? "text-red-400" :
              metaDescription.length < 120 ? "text-yellow-400" : "text-emerald-400"
            }`}>
              {metaDescription.length}/۱۶۰
            </span>
          </div>
          <textarea
            value={metaDescription}
            onChange={(e) => onDescriptionChange(e.target.value)}
            rows={3}
            placeholder="توضیح کوتاه برای گوگل..."
            className="w-full bg-[#050d27] border border-[#1a2540] rounded-lg px-3 py-2.5 text-sm text-white placeholder:text-gray-600 focus:border-yellow-500/50 outline-none resize-none"
          />
          <p className="text-[10px] text-gray-600">۱۲۰-۱۶۰ کاراکتر. زیر عنوان در گوگل نمایش داده می‌شود.</p>
        </div>

        {/* Meta Keywords */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="text-xs font-medium text-gray-400 flex items-center gap-1.5">
              <Tag size={12} /> کلمات کلیدی (با کاما جدا کنید)
            </label>
            <span className={`text-[10px] ${
              analysis.keywordCount === 0 ? "text-gray-600" :
              analysis.keywordCount < 3 ? "text-yellow-400" : "text-emerald-400"
            }`}>
              {analysis.keywordCount} کلمه
            </span>
          </div>
          <input
            type="text"
            value={metaKeywords}
            onChange={(e) => onKeywordsChange(e.target.value)}
            placeholder="پاکت نامه, نامه دست‌نویس, کادو, هدیه"
            className="w-full bg-[#050d27] border border-[#1a2540] rounded-lg px-3 py-2.5 text-sm text-white placeholder:text-gray-600 focus:border-yellow-500/50 outline-none"
          />
          <p className="text-[10px] text-gray-600">با کاما (,) جدا کنید. ۳-۱۵ کلمه کلیدی.</p>
        </div>
      </div>

      {/* 📊 تحلیل سئو */}
      <div className="space-y-4 p-5 rounded-2xl bg-[#0a0f1c] border border-[#1a2540]">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <BarChart3 size={16} className="text-blue-400" /> تحلیل سئو
          </h3>
          <div className="flex items-center gap-2">
            <span className={`text-lg font-black ${getScoreColor()}`}>{percentage}%</span>
            <span className="text-[10px] text-gray-600">SEO Score</span>
          </div>
        </div>

        {/* Progress bar */}
        <div className="h-2 bg-[#1a2540] rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-700 ${getScoreBg()}`}
            style={{ width: `${percentage}%` }}
          />
        </div>

        {/* Analysis items */}
        <div className="space-y-2">
          {allItems.map((item, i) => (
            <div
              key={i}
              className={`flex items-center gap-2 p-2.5 rounded-lg border text-xs transition-all ${getStatusBg(item.status)}`}
            >
              <StatusIcon status={item.status} />
              <span className="text-gray-400">{item.msg}</span>
            </div>
          ))}
        </div>

        {/* SEO Tips */}
        <div className="p-3 rounded-xl bg-blue-500/5 border border-blue-500/10">
          <p className="text-[10px] text-blue-400/70 flex items-center gap-1">
            💡 <span>نکته: عنوان باید جذاب باشه، توضیحات دعوت‌کننده، و کلمات کلیدی مرتبط با محصول.</span>
          </p>
        </div>
      </div>

    </div>
  );
}