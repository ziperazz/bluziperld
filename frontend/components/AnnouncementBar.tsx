"use client";

import { useEffect, useState } from "react";
import { X, Megaphone} from "lucide-react";
import Link from "next/link";

type Announcement = {
    _id: string;
    text: string;
    isActive: boolean;
    backgroundColor: string;
    textColor: string;
    link: string;
};

const ICONS = [ Megaphone];

export default function AnnouncementBar() {
    const [announcement, setAnnouncement] = useState<Announcement | null>(null);
    const [visible, setVisible] = useState(true);
    const [isClosing, setIsClosing] = useState(false);
    const [randomIcon, setRandomIcon] = useState(0);
    const [particles, setParticles] = useState<{ id: number; x: number; color: string }[]>([]);

    const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

    // ذرات شناور
    useEffect(() => {
        if (!announcement) return;
        const interval = setInterval(() => {
            const id = Date.now();
            const x = Math.random() * 100;
            const colors = ["#ffffff", announcement.textColor, "#fbbf24", "#f472b6", "#818cf8"];
            const color = colors[Math.floor(Math.random() * colors.length)];
            setParticles(prev => [...prev.slice(-15), { id, x, color }]);
            setTimeout(() => {
                setParticles(prev => prev.filter(p => p.id !== id));
            }, 3000);
        }, 300);
        return () => clearInterval(interval);
    }, [announcement]);

    useEffect(() => {
        setRandomIcon(Math.floor(Math.random() * ICONS.length));

        const fetchAnnouncement = async () => {
            try {
                const res = await fetch(`${API}/api/announcements/active`);
                const data = await res.json();
                if (data.success && data.announcement) {
                    setAnnouncement(data.announcement);
                }
            } catch (error) {
                console.error("Error fetching announcement:", error);
            }
        };

        fetchAnnouncement();
    }, []);

    const handleClose = () => {
        setIsClosing(true);
        setTimeout(() => setVisible(false), 500);
    };

    if (!announcement || !visible) return null;

    const IconComponent = ICONS[randomIcon];

    return (
        <div
            className={`
                relative w-full overflow-hidden
                transition-all duration-500 ease-in-out
                ${isClosing ? "max-h-0 opacity-0 py-0 scale-y-0" : "max-h-40 opacity-100 scale-y-100"}
            `}
            style={{ transformOrigin: "top" }}
        >
            <div
                className="relative w-full text-center py-3 md:py-2.5 px-2 md:px-4 overflow-hidden"
                style={{
                    backgroundColor: announcement.backgroundColor,
                    color: announcement.textColor,
                }}
            >
                {/* پس‌زمینه گرادیانت متحرک */}
                <div
                    className="absolute inset-0 opacity-30 animate-gradient-shift"
                    style={{
                        background: `
                            linear-gradient(
                                135deg,
                                ${announcement.textColor}08 0%,
                                ${announcement.textColor}15 25%,
                                transparent 50%,
                                ${announcement.textColor}10 75%,
                                ${announcement.textColor}05 100%
                            )
                        `,
                        backgroundSize: "400% 400%",
                    }}
                />

                {/* شاین متحرک */}
                <div
                    className="absolute inset-0 animate-shine"
                    style={{
                        background: `
                            linear-gradient(
                                90deg,
                                transparent 0%,
                                ${announcement.textColor}06 45%,
                                ${announcement.textColor}12 50%,
                                ${announcement.textColor}06 55%,
                                transparent 100%
                            )
                        `,
                        backgroundSize: "200% 100%",
                    }}
                />

                {/* خطوط بالا و پایین */}
                <div
                    className="absolute top-0 left-0 right-0 h-[2px]"
                    style={{
                        background: `
                            linear-gradient(
                                90deg,
                                transparent 0%,
                                ${announcement.textColor}40 20%,
                                ${announcement.textColor}90 50%,
                                ${announcement.textColor}40 80%,
                                transparent 100%
                            )
                        `,
                        boxShadow: `0 0 10px ${announcement.textColor}40, 0 0 20px ${announcement.textColor}20`,
                    }}
                />

                <div
                    className="absolute bottom-0 left-0 right-0 h-[1px]"
                    style={{
                        background: `
                            linear-gradient(
                                90deg,
                                transparent 0%,
                                ${announcement.textColor}30 30%,
                                ${announcement.textColor}60 50%,
                                ${announcement.textColor}30 70%,
                                transparent 100%
                            )
                        `,
                        boxShadow: `0 0 5px ${announcement.textColor}30`,
                    }}
                />

                {/* ذرات شناور */}
                {particles.map(p => (
                    <div
                        key={p.id}
                        className="absolute pointer-events-none animate-particle-float"
                        style={{
                            left: `${p.x}%`,
                            bottom: "-10px",
                            width: "4px",
                            height: "4px",
                            borderRadius: "50%",
                            backgroundColor: p.color,
                            boxShadow: `0 0 6px ${p.color}, 0 0 12px ${p.color}60`,
                            opacity: 0.8,
                        }}
                    />
                ))}

                {/* محتوای اصلی - flex row */}
                <div className="relative flex items-center justify-center gap-2 md:gap-3 px-8 md:px-0">
                    
                    {/* آیکون سمت راست */}
                    <div
                        className="flex items-center justify-center w-8 h-8 md:w-10 md:h-10 rounded-full shrink-0 animate-icon-pulse relative"
                        style={{
                            backgroundColor: `${announcement.textColor}10`,
                            boxShadow: `
                                0 0 15px ${announcement.textColor}30,
                                0 0 30px ${announcement.textColor}15,
                                inset 0 0 15px ${announcement.textColor}10
                            `,
                        }}
                    >
                        <div
                            className="absolute inset-0 rounded-full animate-icon-ring"
                            style={{ border: `2px solid ${announcement.textColor}30` }}
                        />
                        <IconComponent size={14} className="md:w-[18px] md:h-[18px]" style={{ color: announcement.textColor }} />
                    </div>

                    {/* متن */}
                    <div className="flex-1 flex items-center justify-center min-w-0">
                        {announcement.link ? (
                            <Link href={announcement.link} className="group">
                                <p className="md:hidden text-xs font-semibold tracking-wide leading-relaxed group-hover:underline decoration-dotted underline-offset-4 text-center">
                                    {announcement.text}
                                </p>
                                <p className="hidden md:block truncate text-sm md:text-base font-semibold tracking-wide group-hover:underline decoration-dotted underline-offset-4">
                                    {announcement.text}
                                </p>
                            </Link>
                        ) : (
                            <>
                                <p className="md:hidden text-xs font-semibold tracking-wide leading-relaxed text-center">
                                    {announcement.text}
                                </p>
                                <p className="hidden md:block truncate text-sm md:text-base font-semibold tracking-wide">
                                    {announcement.text}
                                </p>
                            </>
                        )}
                    </div>
                </div>

                {/* دکمه بستن - سمت چپ */}
                <button
                    onClick={handleClose}
                    className="absolute left-2 md:left-3 top-1/2 -translate-y-1/2 p-1 md:p-1.5 rounded-full hover:bg-white/10 transition-all duration-300 hover:scale-110 active:scale-90 shrink-0 group/close z-10"
                    style={{ color: announcement.textColor }}
                    aria-label="بستن اعلان"
                >
                    <X size={14} className="md:w-4 md:h-4 group-hover/close:rotate-90 transition-transform duration-300" />
                </button>
            </div>

            {/* استایل‌های انیمیشن */}
            <style jsx>{`
                @keyframes gradientShift {
                    0%, 100% { background-position: 0% 50%; }
                    50% { background-position: 100% 50%; }
                }
                @keyframes shine {
                    0% { background-position: -200% 0; }
                    100% { background-position: 200% 0; }
                }
                @keyframes particleFloat {
                    0% { transform: translateY(0) scale(1); opacity: 0.8; }
                    50% { transform: translateY(-30px) scale(1.5); opacity: 0.4; }
                    100% { transform: translateY(-60px) scale(0); opacity: 0; }
                }
                @keyframes iconPulse {
                    0%, 100% { box-shadow: 0 0 15px currentColor30, 0 0 30px currentColor15; }
                    50% { box-shadow: 0 0 25px currentColor50, 0 0 50px currentColor25; }
                }
                @keyframes iconRing {
                    0% { transform: scale(1); opacity: 1; }
                    100% { transform: scale(1.5); opacity: 0; }
                }
                .animate-gradient-shift { animation: gradientShift 4s ease infinite; }
                .animate-shine { animation: shine 4s linear infinite; }
                .animate-particle-float { animation: particleFloat 3s ease-out forwards; }
                .animate-icon-pulse { animation: iconPulse 2s ease-in-out infinite; }
                .animate-icon-ring { animation: iconRing 2s ease-out infinite; }
            `}</style>
        </div>
    );
}