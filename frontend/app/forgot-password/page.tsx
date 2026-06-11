"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const API =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [mobile, setMobile] = useState("");
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");

    try {
      const res = await fetch(`${API}/api/auth/forgot-password`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mobile, name }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "اطلاعاتت مشکوک به اشتباهه.");
        setLoading(false);
        return;
      }

      setMessage("هویتت تایید شد. ظاهراً خودتی...");
      setTimeout(() => {
        router.push(data.resetURL);
      }, 1000);
    } catch {
      setError("سرور قهر کرده، بعداً امتحان کن.");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-[#0b132b] to-black px-4 text-white font-sans">
      <div className="w-full max-w-[380px] bg-white/5 backdrop-blur-lg border border-white/10 rounded-xl p-7 shadow-2xl hover:shadow-blue-500/10 transition-shadow duration-300">

        <h1 className="text-xl font-bold text-center mb-1">فراموشی رمز؟</h1>
        <p className="text-[10px] text-gray-400 text-center mb-6">
          فقط کسی که واقعاً صاحب حسابه می‌تونه این مرحله رو رد کنه. ببینیم تویی یا نه.
        </p>

        {error && <div className="text-red-400 text-[11px] mb-3 text-center opacity-90">{error}</div>}
        {message && <div className="text-green-400 text-[11px] mb-3 text-center opacity-90">{message}</div>}

        <form onSubmit={handleSubmit} className="space-y-3">
          <input
            type="text"
            placeholder="نام کاربری "
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full bg-white/10 border border-white/10 rounded-md px-3 py-2 outline-none focus:border-blue-400 text-sm"
            required
          />

          <input
            type="text"
            placeholder="شماره موبایل (واقعی، نه اون فیکه!)"
            value={mobile}
            onChange={(e) => setMobile(e.target.value)}
            className="w-full bg-white/10 border border-white/10 rounded-md px-3 py-2 outline-none focus:border-blue-400 text-sm"
            required
          />

          <button
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 py-2 rounded-md font-bold text-sm transition-all duration-200"
          >
            {loading ? "چک می‌کنیم واقعاً کی هستی..." : "تایید و ادامه بده"}
          </button>
        </form>

        <div className="mt-4 text-center text-[10px] text-gray-500">
          اگه رمزت رو واقعاً یادت رفته، طبیعیه. نصف دنیا همین وضعیتو دارن.
        </div>
      </div>
    </div>
  );
}
