"use client";

export default function SeoPreview({ title, description, url, image }: {
    title: string; description: string; url: string; image?: string;
}) {
    return (
        <div className="space-y-3 p-4 rounded-2xl bg-[#0a0f1c] border border-[#1a2540]">
            <h3 className="text-xs font-bold text-gray-400 flex items-center gap-2">
                🔍 پیش‌نمایش در گوگل
            </h3>
            <div className="bg-[#1a1a2e] rounded-xl p-4 space-y-1.5 border border-[#2a2a4e]">
                {/* Mobile preview */}
                <div className="hidden sm:block space-y-2">
                    <p className="text-blue-400 text-lg leading-tight font-medium line-clamp-2">
                        {title || "عنوان سئو در اینجا نمایش داده می‌شود"}
                    </p>
                    <p className="text-emerald-500 text-xs">{url || "https://bluziperld.ir/products/..."}</p>
                    <p className="text-gray-400 text-xs leading-relaxed line-clamp-2">
                        {description || "توضیحات متا در اینجا نمایش داده می‌شود..."}
                    </p>
                </div>
                {/* Desktop preview */}
                <div className="block sm:hidden space-y-1">
                    <p className="text-blue-500 text-sm font-medium line-clamp-1">
                        {title || "عنوان سئو"}
                    </p>
                    <p className="text-gray-500 text-[10px] line-clamp-1">
                        {description || "توضیحات..."}
                    </p>
                </div>
            </div>
        </div>
    );
}