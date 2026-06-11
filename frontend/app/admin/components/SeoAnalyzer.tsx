"use client";

import { Check, AlertTriangle, X } from "lucide-react";

interface AnalysisItem {
    label: string;
    status: "good" | "warning" | "bad";
    message: string;
}

export default function SeoAnalyzer({ title, description, keywords, content }: {
    title: string; description: string; keywords: string; content?: string;
}) {
    const items: AnalysisItem[] = [
        {
            label: "طول عنوان",
            status: title.length >= 30 && title.length <= 60 ? "good" : title.length > 0 ? "warning" : "bad",
            message: title.length >= 30 && title.length <= 60
                ? `✅ ${title.length} کاراکتر (عالی)`
                : title.length === 0
                    ? "❌ عنوان خالی است"
                    : `⚠️ ${title.length} کاراکتر (باید ۳۰-۶۰ باشد)`
        },
        {
            label: "طول توضیحات",
            status: description.length >= 120 && description.length <= 160 ? "good" : description.length > 0 ? "warning" : "bad",
            message: description.length >= 120 && description.length <= 160
                ? `✅ ${description.length} کاراکتر (عالی)`
                : description.length === 0
                    ? "❌ توضیحات خالی است"
                    : `⚠️ ${description.length} کاراکتر (باید ۱۲۰-۱۶۰ باشد)`
        },
        {
            label: "کلمات کلیدی",
            status: keywords.split(",").filter(k => k.trim()).length >= 3 ? "good" : keywords.trim() ? "warning" : "bad",
            message: keywords.split(",").filter(k => k.trim()).length >= 3
                ? `✅ ${keywords.split(",").filter(k => k.trim()).length} کلمه کلیدی`
                : keywords.trim()
                    ? "⚠️ حداقل ۳ کلمه کلیدی پیشنهاد می‌شود"
                    : "❌ کلمه کلیدی وارد نشده"
        },
        {
            label: "کلمه کلیدی در عنوان",
            status: keywords && title.includes(keywords.split(",")[0]?.trim()) ? "good" : "warning",
            message: keywords && title.includes(keywords.split(",")[0]?.trim())
                ? "✅ کلمه کلیدی در عنوان وجود دارد"
                : "⚠️ کلمه کلیدی اصلی در عنوان نیست"
        },
    ];

    const score = items.filter(i => i.status === "good").length;
    const maxScore = items.length;
    const percentage = Math.round((score / maxScore) * 100);

    const getColor = () => {
        if (percentage >= 80) return "text-emerald-400";
        if (percentage >= 50) return "text-yellow-400";
        return "text-red-400";
    };

    return (
        <div className="space-y-4 p-5 rounded-2xl bg-[#0a0f1c] border border-[#1a2540]">
            {/* Score */}
            <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    📊 تحلیل سئو
                </h3>
                <div className="flex items-center gap-2">
                    <div className="w-12 h-12 rounded-full border-2 border-[#1a2540] flex items-center justify-center relative">
                        <span className={`text-lg font-black ${getColor()}`}>{percentage}</span>
                        <span className="text-[9px] text-gray-600 absolute -bottom-3">از ۱۰۰</span>
                    </div>
                </div>
            </div>

            {/* Progress bar */}
            <div className="h-2 bg-[#1a2540] rounded-full overflow-hidden">
                <div
                    className={`h-full rounded-full transition-all duration-500 ${
                        percentage >= 80 ? "bg-emerald-500" : percentage >= 50 ? "bg-yellow-500" : "bg-red-500"
                    }`}
                    style={{ width: `${percentage}%` }}
                />
            </div>

            {/* Items */}
            <div className="space-y-2">
                {items.map((item, i) => {
                    const Icon = item.status === "good" ? Check : item.status === "warning" ? AlertTriangle : X;
                    const iconColor = item.status === "good" ? "text-emerald-400" : item.status === "warning" ? "text-yellow-400" : "text-red-400";
                    const bgColor = item.status === "good" ? "bg-emerald-500/5" : item.status === "warning" ? "bg-yellow-500/5" : "bg-red-500/5";

                    return (
                        <div key={i} className={`flex items-center gap-2 p-2.5 rounded-lg ${bgColor} text-xs`}>
                            <Icon size={13} className={iconColor} />
                            <div>
                                <span className="text-gray-400">{item.label}: </span>
                                <span className="text-gray-300">{item.message}</span>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}