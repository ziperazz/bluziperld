"use client";
import Image from "next/image";

export default function LetterCard({ id, activeId, setActiveId, title, preview, description, price, image }) {
  const isOpen = activeId === id;

  return (
    <div
      onClick={() => setActiveId(isOpen ? null : id)}
      className={`
        cursor-pointer rounded-xl border transition-all duration-300 overflow-hidden 
        ${isOpen ? "bg-[#0E6BA8]/40 border-[#0E6BA8]" : "bg-white/5 border-white/10"}
      `}
      style={{ backdropFilter: "blur(15px)" }}
    >

      {/* تصویر کوچک‌تر */}
      <div className="w-full h-24 overflow-hidden">
        <Image
          src={image}
          alt={title}
          width={500}
          height={300}
          className="object-cover w-full h-full"
        />
      </div>

      <div className="p-3">
        <h3 className="text-sm font-bold text-white mb-1">
          {title}
        </h3>

        <p className="text-xs text-white/60 leading-relaxed line-clamp-2">
          {preview}
        </p>
      </div>

      {/* بخش باز‌شونده */}
      <div
        className={`
          transition-all duration-300 px-3
          ${isOpen ? "max-h-40 py-2 opacity-100" : "max-h-0 py-0 opacity-0"}
        `}
      >
        <p className="text-xs text-white/80 mb-2 leading-relaxed">
          {description}
        </p>

        <p className="text-sm font-semibold text-blue-300">
          قیمت: {price} تومان
        </p>
      </div>
    </div>
  );
}
