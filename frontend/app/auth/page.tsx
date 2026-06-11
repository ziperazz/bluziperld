"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AuthPage() {
  const router = useRouter();

  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState("");
  const [mobile, setMobile] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!mobile || !password) {
      setError("شماره موبایل و رمز عبور الزامی است.");
      return;
    }

    if (!isLogin && !name) {
      setError("لطفاً نام کاربری را وارد کنید.");
      return;
    }

    if (!isLogin && password !== confirmPassword) {
      setError("رمز عبور و تکرار آن یکسان نیست.");
      return;
    }

    setLoading(true);

    try {
      const API = process.env.NEXT_PUBLIC_API_URL || "http://95.38.179.57:5000";

      const url = isLogin ? `${API}/api/auth/login` : `${API}/api/auth/register`;
      const body = isLogin ? { mobile, password } : { name, mobile, password };

      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "مشکلی پیش آمد. دوباره تلاش کنید.");
        setLoading(false);
        return;
      }

      // Login flow
      if (isLogin) {
        const MAX_AGE = 7 * 24 * 60 * 60; // 7 روز

        // ذخیره تو localStorage
        localStorage.setItem("accessToken", data.accessToken);
        window.dispatchEvent(new Event("auth-change"));

        // ذخیره تو cookie (برای middleware)
        document.cookie = `accessToken=${data.accessToken}; path=/; max-age=${MAX_AGE}; SameSite=Lax`;

        // ذخیره اطلاعات کاربر تو cookie
        if (data.user) {
          document.cookie = `user=${JSON.stringify(data.user)}; path=/; max-age=${MAX_AGE}; SameSite=Lax`;
          
          // اگه ادمین بود، isAdmin رو ست کن
          if (data.user.role === "admin") {
            document.cookie = `isAdmin=true; path=/; max-age=${MAX_AGE}; SameSite=Lax`;
          }
        }

        router.push("/");
        router.refresh();
      } else {
        // Register flow
        setIsLogin(true);
        setSuccess("ثبت‌نام با موفقیت انجام شد. حالا وارد حساب‌تون بشید.");
      }
    } catch (err) {
      setError("ارتباط با سرور برقرار نشد. لطفاً دوباره تلاش کنید.");
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-gradient-to-b from-[#0a0f1f] to-[#000]">
      <div
        className="
        w-full max-w-[360px]
        bg-white/5 backdrop-blur-2xl
        border border-white/10
        rounded-2xl
        p-6
        shadow-[0_0_25px_-3px_rgba(29,78,216,0.45)]
        text-white
        animate-[fadeIn_0.5s_ease]
      "
      >
        {/* LOGO */}
        <div className="text-center mb-5">
          <h1
            className="text-3xl font-extrabold tracking-wide bg-clip-text text-transparent"
            style={{
              backgroundImage: "linear-gradient(to right,#1D4ED8,#60A5FA)",
            }}
          >
            BluZiperld
          </h1>
          <p className="text-xs text-gray-300 mt-1">
            ورود به حساب کاربری
          </p>
        </div>

        {/* Tabs */}
        <div className="flex mb-4 bg-white/10 rounded-lg p-1 text-sm">
          <button
            onClick={() => {
              setIsLogin(true);
              setError("");
              setSuccess("");
            }}
            className={`flex-1 py-2 rounded-lg transition font-bold ${
              isLogin ? "bg-blue-600 text-white" : "text-gray-300 hover:text-white"
            }`}
          >
            ورود
          </button>

          <button
            onClick={() => {
              setIsLogin(false);
              setError("");
              setSuccess("");
            }}
            className={`flex-1 py-2 rounded-lg transition font-bold ${
              !isLogin ? "bg-blue-600 text-white" : "text-gray-300 hover:text-white"
            }`}
          >
            ثبت نام
          </button>
        </div>

        {/* Success */}
        {success && (
          <div className="text-green-300 text-xs mb-3 text-center bg-green-500/10 py-2 rounded-md border border-green-500/20">
            {success}
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="text-red-400 text-xs mb-3 text-center bg-red-500/10 py-2 rounded-md border border-red-500/20">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-3 text-[13px]">
          {!isLogin && (
            <input
              type="text"
              placeholder="نام کاربری"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-white/10 border border-white/10 rounded-md px-3 py-2 outline-none focus:border-blue-400"
            />
          )}

          <input
            type="text"
            placeholder="شماره موبایل (مثلاً 0912...)"
            value={mobile}
            onChange={(e) => setMobile(e.target.value)}
            className="w-full bg-white/10 border border-white/10 rounded-md px-3 py-2 outline-none focus:border-blue-400"
          />

          <input
            type="password"
            placeholder="رمز عبور"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full bg-white/10 border border-white/10 rounded-md px-3 py-2 outline-none focus:border-blue-400"
          />

          {!isLogin && (
            <input
              type="password"
              placeholder="تکرار رمز عبور"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full bg-white/10 border border-white/10 rounded-md px-3 py-2 outline-none focus:border-blue-400"
            />
          )}

          <button
            disabled={loading}
            className="
              w-full bg-blue-600 hover:bg-blue-700
              text-white py-2 rounded-md text-[14px] transition
              disabled:opacity-50 mt-2 font-bold
            "
          >
            {loading ? "در حال انجام..." : isLogin ? "ورود" : "ثبت نام"}
          </button>
        </form>

        {/* Forgot Password */}
        {isLogin && (
          <div className="text-center mt-4">
            <a
              href="/forgot-password"
              className="text-xs text-blue-400 hover:text-blue-300 transition"
            >
              رمز عبور را فراموش کرده‌اید؟
            </a>
          </div>
        )}
      </div>
    </div>
  );
}