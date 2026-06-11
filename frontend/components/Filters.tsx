"use client"

import { useState, useEffect } from "react"

export default function Filters({
  price,
  setPrice,
  onlyAvailable,
  setOnlyAvailable,
  onlyDiscounted,
  setOnlyDiscounted,
  sort,
  setSort,
  filterOpen,
  setFilterOpen,
  category,
  setCategory
}: any) {

  const [tempPrice, setTempPrice] = useState(price)
  const [tempAvailable, setTempAvailable] = useState(onlyAvailable)
  const [tempDiscount, setTempDiscount] = useState(onlyDiscounted)
  const [tempSort, setTempSort] = useState(sort)
  const [tempCategory, setTempCategory] = useState(category)

  const applyFilters = () => {
    if (typeof setPrice === "function") setPrice(tempPrice);
    if (typeof setOnlyAvailable === "function") setOnlyAvailable(tempAvailable);
    if (typeof setOnlyDiscounted === "function") setOnlyDiscounted(tempDiscount);
    if (typeof setSort === "function") setSort(tempSort);
    if (typeof setCategory === "function") setCategory(tempCategory);
    if (typeof setFilterOpen === "function") setFilterOpen(false);
  }

  const resetFilters = () => {
    setTempPrice(2000000); // Set to your desired default max price
    setTempAvailable(false);
    setTempDiscount(false);
    setTempSort("new");
    setTempCategory("all");
  }

  useEffect(() => {
    setTempPrice(price)
    setTempAvailable(onlyAvailable)
    setTempDiscount(onlyDiscounted)
    setTempSort(sort)
    setTempCategory(category)
  }, [price, onlyAvailable, onlyDiscounted, sort, category])

  return (
    <>
      {/* Desktop Filter */}
      <div
        className="hidden lg:flex w-full rounded-2xl p-5 mb-8 border border-white/10 gap-6 items-center justify-between"
        style={{
          background: "rgba(10,15,30,0.65)",
          backdropFilter: "blur(14px)"
        }}
      >
        {/* دسته‌بندی */}
        <div className="flex flex-col gap-2 min-w-[160px]">
          <label className="text-xs text-gray-400">دسته‌بندی</label>
          <select
            value={tempCategory}
            onChange={(e) => setTempCategory(e.target.value)}
            className="bg-[#0a0f1e] border border-white/10 rounded-xl px-3 py-2 text-gray-200 text-sm outline-none focus:border-[#1b6cff] transition"
          >
            <option value="all">همه</option>
            <option value="love">عاشقانه</option>
            <option value="birthday">تولد</option>
            <option value="farewell">خداحافظی</option>
            <option value="gratitude">قدردانی</option>
          </select>
        </div>

        {/* ترتیب نمایش */}
        <div className="flex flex-col gap-2 min-w-[160px]">
          <label className="text-xs text-gray-400">ترتیب نمایش</label>
          <select
            value={tempSort}
            onChange={(e) => setTempSort(e.target.value)}
            className="bg-[#0a0f1e] border border-white/10 rounded-xl px-3 py-2 text-gray-200 text-sm outline-none focus:border-[#1b6cff] transition"
          >
            <option value="new">جدیدترین</option>
            <option value="cheap">ارزان‌ترین</option>
            <option value="expensive">گران‌ترین</option>
            <option value="popular">محبوب‌ترین</option>
            <option value="visited">پربازدیدترین</option>
          </select>
        </div>

        {/* Switch Buttons */}
        <div className="flex gap-8">
          <div className="flex flex-col items-center gap-2">
            <span className="text-xs text-gray-400">فقط موجود</span>
            <div className="flex bg-[#0a0f1e] border border-white/10 rounded-lg p-1">
              <button onClick={() => setTempAvailable(true)} className={`px-3 py-1 text-xs rounded-md ${tempAvailable ? "bg-[#1b6cff] text-white" : "text-gray-400"}`}>فعال</button>
              <button onClick={() => setTempAvailable(false)} className={`px-3 py-1 text-xs rounded-md ${!tempAvailable ? "bg-[#1e293b] text-gray-200" : "text-gray-500"}`}>غیرفعال</button>
            </div>
          </div>

          <div className="flex flex-col items-center gap-2">
            <span className="text-xs text-gray-400">فقط تخفیف‌دار</span>
            <div className="flex bg-[#0a0f1e] border border-white/10 rounded-lg p-1">
              <button onClick={() => setTempDiscount(true)} className={`px-3 py-1 text-xs rounded-md ${tempDiscount ? "bg-[#1b6cff] text-white" : "text-gray-400"}`}>فعال</button>
              <button onClick={() => setTempDiscount(false)} className={`px-3 py-1 text-xs rounded-md ${!tempDiscount ? "bg-[#1e293b] text-gray-200" : "text-gray-500"}`}>غیرفعال</button>
            </div>
          </div>
        </div>

        {/* Price Range */}
        <div className="flex-1 min-w-[250px] flex flex-col gap-3">
          <div className="flex justify-between text-xs text-gray-400">
            <span>محدوده قیمت</span>
            <span>{tempPrice?.toLocaleString() || 0} تومان</span>
          </div>
          <input
            type="range"
            min="0"
            max="1000000"
            step="10000"
            value={tempPrice || 0}
            onChange={(e) => setTempPrice(Number(e.target.value))}
            className="accent-[#1b6cff]"
          />
        </div>

        <div className="flex gap-2"> {/* Changed to flex gap-2 for horizontal buttons */}
          <button onClick={applyFilters} className="px-5 py-2 text-sm rounded-xl bg-[#1b6cff] text-white hover:bg-[#3b82f6] shadow-lg shadow-blue-500/20 transition">اعمال فیلتر</button>
          <button onClick={resetFilters} className="px-5 py-2 text-sm rounded-xl border border-white/10 text-gray-300 hover:bg-white/5 transition">حذف فیلترها</button> {/* Styled as secondary button */}
        </div>
      </div>
      
      {/* Drawer موبایل */}
      {filterOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[9999] flex justify-end">
          <div className="relative z-[10000] w-[80%] h-full bg-[#0a0f1e] border-l border-white/10 p-6 flex flex-col gap-6 animate-slide-in-right">
            <div className="flex justify-between items-center">
              <h3 className="text-white text-base">فیلترها</h3>
              <button onClick={() => typeof setFilterOpen === 'function' && setFilterOpen(false)} className="text-gray-300 text-xl">✕</button>
            </div>
            
            <div className="flex flex-col gap-2">
              <label className="text-xs text-gray-400">دسته‌بندی</label>
              <select value={tempCategory} onChange={(e) => setTempCategory(e.target.value)} className="bg-[#0d1529] border border-white/10 rounded-xl px-3 py-2 text-gray-200 text-sm">
                <option value="all">همه</option>
                <option value="love">عاشقانه</option>
                <option value="birthday">تولد</option>
                <option value="farewell">خداحافظی</option>
                <option value="gratitude">قدردانی</option>
              </select>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-xs text-gray-400">ترتیب نمایش</label>
              <select value={tempSort} onChange={(e) => setTempSort(e.target.value)} className="bg-[#0d1529] border border-white/10 rounded-xl px-3 py-2 text-gray-200 text-sm">
                <option value="new">جدیدترین</option>
                <option value="cheap">ارزان‌ترین</option>
                <option value="expensive">گران‌ترین</option>
                <option value="popular">محبوب‌ترین</option>
                <option value="visited">پربازدیدترین</option>
              </select>
            </div>

            <div className="flex flex-col gap-4 mt-2">
              <div>
                <span className="text-xs text-gray-400">فقط موجود</span>
                <div className="flex bg-[#0d1529] border border-white/10 rounded-lg p-1 mt-2">
                  <button onClick={() => setTempAvailable(true)} className={`px-3 py-1 text-xs rounded-md ${tempAvailable ? "bg-[#1b6cff] text-white" : "text-gray-400"}`}>فعال</button>
                  <button onClick={() => setTempAvailable(false)} className={`px-3 py-1 text-xs rounded-md ${!tempAvailable ? "bg-[#1e293b] text-gray-200" : "text-gray-500"}`}>غیرفعال</button>
                </div>
              </div>
              <div>
                <span className="text-xs text-gray-400">فقط تخفیف‌دار</span>
                <div className="flex bg-[#0d1529] border border-white/10 rounded-lg p-1 mt-2">
                  <button onClick={() => setTempDiscount(true)} className={`px-3 py-1 text-xs rounded-md ${tempDiscount ? "bg-[#1b6cff] text-white" : "text-gray-400"}`}>فعال</button>
                  <button onClick={() => setTempDiscount(false)} className={`px-3 py-1 text-xs rounded-md ${!tempDiscount ? "bg-[#1e293b] text-gray-200" : "text-gray-500"}`}>غیرفعال</button>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-3 mt-5">
              <div className="flex justify-between text-xs text-gray-400">
                <span>محدوده قیمت</span>
                <span>{tempPrice?.toLocaleString() || 0} تومان</span>
              </div>
              <input type="range" min="0" max="1000000" step="10000" value={tempPrice || 0} onChange={(e) => setTempPrice(Number(e.target.value))} className="accent-[#1b6cff]" />
            </div>

            <div className="flex gap-2 mt-auto"> {/* Changed to flex gap-2 and mt-auto for horizontal buttons at bottom */}
                <button onClick={resetFilters} className="w-1/2 py-3 rounded-xl border border-white/10 text-gray-300 text-sm hover:bg-white/5 transition">حذف فیلترها</button> {/* Styled as secondary button, half width */}
                <button onClick={applyFilters} className="w-1/2 py-3 rounded-xl bg-[#1b6cff] text-white text-sm hover:bg-[#3b82f6] transition">اعمال فیلتر</button> {/* Half width */}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
