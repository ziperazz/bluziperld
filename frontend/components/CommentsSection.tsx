"use client";

import React, { useEffect, useState, useCallback } from "react";
import dayjs from "dayjs";
import "dayjs/locale/fa";
import jalaliday from "jalaliday";
import {
  Star, ThumbsUp, ThumbsDown, User, ShoppingBag,
  CheckCircle2, MessageSquare, Send, Loader2, ChevronLeft,
  ChevronRight, Sparkles, Clock, LogIn
} from "lucide-react";
import Link from "next/link";

dayjs.extend(jalaliday);
dayjs.locale("fa");

interface UserType {
  name: string;
}
interface CommentType {
  _id: string;
  content: string;
  rating: number;
  isBuyer: boolean;
  user: UserType;
  likes: string[];
  dislikes: string[];
  createdAt: string;
  replies: CommentType[];
  parent?: string | null;
}
interface Props {
  productId: string;
  currentUserId?: string;
  token?: string;
  targetType: "product" | "letter";
}

const PAGE_LIMIT = 5;
const API = process.env.NEXT_PUBLIC_API_URL?.replace(/\/+$/, "") || "http://localhost:5000";

const StarDisplay = ({ rating, size = 14 }: { rating: number; size?: number }) => (
  <div className="flex gap-0.5">
    {[1, 2, 3, 4, 5].map((i) => (
      <Star
        key={i}
        size={size}
        className={`transition-all duration-300 ${
          i <= rating
            ? "text-amber-400 fill-amber-400 drop-shadow-[0_0_4px_rgba(251,191,36,0.5)]"
            : "text-gray-600"
        }`}
      />
    ))}
  </div>
);

const StarInput = ({ rating, setRating }: { rating: number; setRating: (v: number) => void }) => (
  <div className="flex gap-1.5">
    {[1, 2, 3, 4, 5].map((i) => (
      <button
        key={i}
        type="button"
        onClick={() => setRating(i)}
        className="hover:scale-125 transition-all duration-200 active:scale-90"
      >
        <Star
          size={22}
          className={`transition-all duration-300 ${
            i <= rating
              ? "text-amber-400 fill-amber-400 drop-shadow-[0_0_6px_rgba(251,191,36,0.6)]"
              : "text-gray-500 hover:text-amber-400/60"
          }`}
        />
      </button>
    ))}
  </div>
);

export default function CommentsSection({ productId, token, targetType }: Props) {
  const [comments, setComments] = useState<CommentType[]>([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [content, setContent] = useState("");
  const [rating, setRating] = useState(5);
  const [sending, setSending] = useState(false);
  const [notif, setNotif] = useState(false);
  const [loginNotif, setLoginNotif] = useState(false);

  const fetchComments = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch(
        `${API}/api/comments/${targetType}/${productId}?page=${page}&limit=${PAGE_LIMIT}`
      );
      const data = await res.json();
      if (Array.isArray(data)) {
        setComments(data);
      } else if (data.comments) {
        setComments(data.comments);
      } else {
        setComments([]);
      }
    } catch (err) {
      console.error("Fetch comments error:", err);
      setComments([]);
    } finally {
      setLoading(false);
    }
  }, [productId, page, targetType]);

  useEffect(() => {
    fetchComments();
  }, [fetchComments]);

  const submitComment = async () => {
    if (!token) {
      setLoginNotif(true);
      setTimeout(() => setLoginNotif(false), 4000);
      return;
    }
    if (!content.trim()) {
      alert("لطفاً متن نظر خود را وارد کنید.");
      return;
    }
    try {
      setSending(true);
      const res = await fetch(`${API}/api/comments`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          content: content.trim(),
          rating,
          targetId: productId,
          targetType: targetType === "product" ? "Product" : "Letter",
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        alert(data.message || "خطا در ثبت نظر");
        setSending(false);
        return;
      }
      setContent("");
      setRating(5);
      setPage(1);
      fetchComments();
      setNotif(true);
      setTimeout(() => setNotif(false), 4000);
    } catch (e) {
      console.error("Submit error:", e);
      alert("خطا در ارتباط با سرور");
    }
    setSending(false);
  };

  const like = async (id: string) => {
    if (!token) {
      setLoginNotif(true);
      setTimeout(() => setLoginNotif(false), 4000);
      return;
    }
    try {
      await fetch(`${API}/api/comments/${id}/like`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchComments();
    } catch (e) {
      console.error("Like error:", e);
    }
  };

  const dislike = async (id: string) => {
    if (!token) {
      setLoginNotif(true);
      setTimeout(() => setLoginNotif(false), 4000);
      return;
    }
    try {
      await fetch(`${API}/api/comments/${id}/dislike`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchComments();
    } catch (e) {
      console.error("Dislike error:", e);
    }
  };

  return (
    <section className="w-full max-w-6xl mx-auto px-4 md:px-8 py-8 md:py-12 text-white relative">
      {/* Header */}
      <div className="flex items-center gap-3 mb-8 md:mb-10">
        <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-blue-500/10 flex items-center justify-center">
          <MessageSquare size={20} className="text-blue-400 md:w-6 md:h-6" />
        </div>
        <div>
          <h2 className="text-2xl md:text-3xl font-black">نظرات کاربران</h2>
          <p className="text-xs md:text-sm text-gray-500 mt-0.5">
            {comments.length > 0
              ? `${comments.length} نظر ثبت شده`
              : "اولین نظر را شما ثبت کنید"}
          </p>
        </div>
      </div>

      {/* Login Notification - Responsive */}
      <div
        className={`fixed top-4 left-2 right-2 sm:top-6 sm:left-1/2 sm:right-auto sm:-translate-x-1/2 sm:w-auto z-[100] transition-all duration-500 ease-out ${
          loginNotif
            ? "opacity-100 translate-y-0 scale-100"
            : "opacity-0 -translate-y-4 scale-95 pointer-events-none"
        }`}
      >
        <div className="flex items-center gap-2 sm:gap-3 px-3 sm:px-5 py-2.5 sm:py-3.5 rounded-2xl bg-gradient-to-r from-amber-500/95 to-orange-500/95 backdrop-blur-xl border border-white/20 shadow-2xl shadow-amber-500/25 mx-auto sm:mx-0 max-w-sm sm:max-w-md">
          <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-white/20 flex items-center justify-center shrink-0">
            <LogIn size={14} className="sm:w-4 sm:h-4 text-white" strokeWidth={3} />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs sm:text-sm font-bold text-white">نیاز به ورود!</p>
            <p className="text-[10px] sm:text-[11px] text-white/80 truncate">برای این عمل باید وارد حساب کاربری خود شوید</p>
          </div>
          <Link
            href="/auth"
            className="shrink-0 px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl bg-white/20 hover:bg-white/30 text-white text-[10px] sm:text-xs font-bold transition-all"
          >
            ورود
          </Link>
        </div>
      </div>

      {/* Success Notification - Responsive */}
      <div
        className={`fixed top-4 left-2 right-2 sm:top-6 sm:left-1/2 sm:right-auto sm:-translate-x-1/2 sm:w-auto z-[100] transition-all duration-500 ease-out ${
          notif
            ? "opacity-100 translate-y-0 scale-100"
            : "opacity-0 -translate-y-4 scale-95 pointer-events-none"
        }`}
      >
        <div className="flex items-center gap-2 sm:gap-3 px-3 sm:px-5 py-2.5 sm:py-3.5 rounded-2xl bg-gradient-to-r from-emerald-600/95 to-teal-600/95 backdrop-blur-xl border border-white/20 shadow-2xl shadow-emerald-500/25 mx-auto sm:mx-0 max-w-sm sm:max-w-md">
          <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-white/20 flex items-center justify-center shrink-0">
            <CheckCircle2 size={14} className="sm:w-4 sm:h-4 text-white" strokeWidth={3} />
          </div>
          <div className="min-w-0">
            <p className="text-xs sm:text-sm font-bold text-white">نظر شما ثبت شد!</p>
            <p className="text-[10px] sm:text-[11px] text-white/70">پس از تأیید مدیر نمایش داده می‌شود</p>
          </div>
        </div>
      </div>

      {/* Comment Form */}
      <div className="p-5 md:p-8 rounded-2xl bg-white/[0.02] border border-white/[0.06] mb-8 md:mb-10">
        <h3 className="font-bold text-sm md:text-base text-gray-300 mb-4 flex items-center gap-2">
          <Sparkles size={14} className="text-blue-400 md:w-5 md:h-5" />
          نظر خود را ثبت کنید
        </h3>

        <textarea
          rows={4}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="تجربه خود را با دیگران به اشتراک بگذارید..."
          maxLength={1000}
          className="w-full bg-[#020617]/60 border border-white/[0.06] rounded-2xl px-4 md:px-5 py-3.5 md:py-4 text-sm md:text-base outline-none focus:border-blue-500/40 focus:ring-2 focus:ring-blue-500/10 leading-7 placeholder:text-gray-600 resize-none transition-all duration-300"
        />

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mt-4 md:mt-5">
          <div className="flex items-center gap-3">
            <span className="text-xs md:text-sm text-gray-500">امتیاز:</span>
            <StarInput rating={rating} setRating={setRating} />
            <span className="text-xs md:text-sm text-amber-400/80 font-bold">{rating}/۵</span>
          </div>

          <button
            onClick={submitComment}
            disabled={sending}
            className="flex items-center justify-center gap-2 px-6 md:px-8 py-2.5 md:py-3 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white text-sm md:text-base font-bold transition-all duration-300 hover:scale-[1.02] active:scale-95 shadow-lg shadow-blue-500/25 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {sending ? (
              <Loader2 size={16} className="animate-spin md:w-5 md:h-5" />
            ) : (
              <Send size={16} className="md:w-5 md:h-5" />
            )}
            {sending ? "در حال ارسال..." : "ثبت نظر"}
          </button>
        </div>
      </div>

      {/* Comments List */}
      {loading ? (
        <div className="space-y-4 md:space-y-5">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="p-5 md:p-6 rounded-2xl bg-white/[0.02] border border-white/[0.04] animate-pulse">
              <div className="flex items-center gap-3 md:gap-4 mb-4">
                <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-gray-700/50" />
                <div className="space-y-2 flex-1">
                  <div className="h-3 md:h-4 w-24 md:w-32 bg-gray-700/50 rounded" />
                  <div className="h-2 md:h-3 w-16 md:w-20 bg-gray-700/30 rounded" />
                </div>
              </div>
              <div className="space-y-2">
                <div className="h-3 md:h-4 w-full bg-gray-700/30 rounded" />
                <div className="h-3 md:h-4 w-3/4 bg-gray-700/20 rounded" />
              </div>
            </div>
          ))}
        </div>
      ) : comments.length === 0 ? (
        <div className="text-center py-12 md:py-16">
          <MessageSquare size={40} className="mx-auto text-gray-700 mb-3 md:w-12 md:h-12" />
          <p className="text-gray-500 text-sm md:text-base">هنوز نظری ثبت نشده است</p>
          <p className="text-gray-600 text-xs md:text-sm mt-1">اولین نفر باشید!</p>
        </div>
      ) : (
        <div className="space-y-4 md:space-y-5">
          {comments.map((c) => (
            <div
              key={c._id}
              className="p-5 md:p-6 rounded-2xl bg-white/[0.02] border border-white/[0.04] hover:bg-white/[0.04] hover:border-blue-500/10 transition-all duration-300"
            >
              <div className="flex items-start justify-between gap-3 md:gap-4">
                <div className="flex items-center gap-3 md:gap-4 min-w-0">
                  <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-gradient-to-br from-blue-500/20 to-cyan-500/20 flex items-center justify-center shrink-0">
                    <User size={18} className="text-blue-400 md:w-5 md:h-5" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-bold text-sm md:text-base text-white truncate">
                      {c.user?.name || "کاربر ناشناس"}
                    </p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-[10px] md:text-xs text-gray-500 flex items-center gap-1">
                        <Clock size={10} className="md:w-3 md:h-3" />
                        {dayjs(c.createdAt).calendar("jalali").format("YYYY/MM/DD")}
                      </span>
                      {c.isBuyer && (
                        <span className="flex items-center gap-1 text-[10px] md:text-xs text-emerald-400 font-bold bg-emerald-500/10 px-1.5 md:px-2 py-0.5 rounded-md">
                          <ShoppingBag size={10} className="md:w-3 md:h-3" />
                          خریدار
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <StarDisplay rating={c.rating} size={12} />
              </div>

              <p className="mt-4 text-sm md:text-base text-gray-300 leading-7 md:leading-8">{c.content}</p>

              <div className="flex items-center gap-6 md:gap-8 mt-4 pt-3 border-t border-white/[0.03]">
                <button
                  onClick={() => like(c._id)}
                  className="flex items-center gap-1.5 text-xs md:text-sm text-gray-500 hover:text-blue-400 transition-colors group"
                >
                  <ThumbsUp size={14} className="group-hover:scale-110 transition-transform md:w-4 md:h-4" />
                  <span>{c.likes?.length || 0}</span>
                </button>
                <button
                  onClick={() => dislike(c._id)}
                  className="flex items-center gap-1.5 text-xs md:text-sm text-gray-500 hover:text-red-400 transition-colors group"
                >
                  <ThumbsDown size={14} className="group-hover:scale-110 transition-transform md:w-4 md:h-4" />
                  <span>{c.dislikes?.length || 0}</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {comments.length > 0 && (
        <div className="flex items-center justify-center gap-2 mt-8 md:mt-10">
          <button
            disabled={page === 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            className="flex items-center gap-1 px-4 md:px-5 py-2.5 md:py-3 rounded-xl bg-white/[0.03] border border-white/[0.06] text-sm md:text-base text-gray-400 hover:text-white hover:bg-white/[0.06] transition-all disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <ChevronRight size={14} className="md:w-5 md:h-5" />
            قبلی
          </button>

          <span className="px-4 py-2 text-sm md:text-base text-gray-500">
            صفحه {page}
          </span>

          <button
            disabled={comments.length < PAGE_LIMIT}
            onClick={() => setPage((p) => p + 1)}
            className="flex items-center gap-1 px-4 md:px-5 py-2.5 md:py-3 rounded-xl bg-white/[0.03] border border-white/[0.06] text-sm md:text-base text-gray-400 hover:text-white hover:bg-white/[0.06] transition-all disabled:opacity-30 disabled:cursor-not-allowed"
          >
            بعدی
            <ChevronLeft size={14} className="md:w-5 md:h-5" />
          </button>
        </div>
      )}
    </section>
  );
}