"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";

export default function ResetPasswordPage() {
  const { token } = useParams<{ token: string }>();
  const router = useRouter();

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password.length < 6) {
      setError("رمز عبور باید حداقل ۶ کاراکتر باشه. «۱۲۳۴۵» حساب نمی‌شه.");
      return;
    }

    if (password !== confirm) {
      setError("این دوتا رمز با هم هماهنگ نیستن. با هم قهرن.");
      return;
    }

    setLoading(true);
    setError("");
    setMessage("");

    try {
      const res = await fetch(
        `${API}/api/auth/reset-password/${token}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ password }),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        setError(
          data.message ||
            "این لینک یا منقضی شده یا از اول هم به نیت خیر ساخته نشده."
        );
        setLoading(false);
        return;
      }

      setMessage("رمز عبور با موفقیت عوض شد. الان دیگه لطفاً یادت بمونه.");

      setTimeout(() => {
        router.push("/auth");
      }, 2500);
    } catch {
      setError("سرور فعلاً حوصله جواب دادن نداره. بعداً دوباره امتحان کن.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-[#0b132b] to-black px-4 text-white font-sans">
      <div className="w-full max-w-[420px] bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-9 shadow-2xl hover:shadow-blue-500/10 transition-shadow duration-300">

        <h1 className="text-xl font-bold text-center mb-1">
          آخرین فرصت برای انتخاب رمز
        </h1>

        <p className="text-[10px] text-gray-400 text-center mb-6">
          اینجا جاییه که تصمیم می‌گیری دوباره رمزتو فراموش کنی یا نه.
        </p>

        {error && (
          <div className="text-red-400 text-[11px] mb-3 text-center opacity-90">
            {error}
          </div>
        )}

        {message && (
          <div className="text-green-400 text-[11px] mb-3 text-center opacity-90">
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3">

          <input
            type="password"
            placeholder="رمز عبور جدید (قول بده یادت می‌مونه)"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full bg-white/10 border border-white/10 rounded-md px-3 py-2 outline-none focus:border-blue-400 text-sm placeholder:text-gray-600"
            required
          />

          <input
            type="password"
            placeholder="تکرار رمز عبور (دقیقاً همون بالا)"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            className="w-full bg-white/10 border border-white/10 rounded-md px-3 py-2 outline-none focus:border-blue-400 text-sm placeholder:text-gray-600"
            required
          />

          <button
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 py-3 rounded-md font-bold text-sm transition-all duration-200"
          >
            {loading ? "داریم رمزتو جدی جدی عوض می‌کنیم..." : "تغییر رمز و ادامه"}
          </button>
        </form>

        <div className="mt-4 text-center text-[10px] text-gray-500">
          اگر باز هم فراموشش کنی، ما قضاوت نمی‌کنیم… فقط تعجب می‌کنیم.
        </div>
      </div>
    </div>
  );
}
