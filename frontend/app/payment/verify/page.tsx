"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

function PaymentVerifyContent() {
  const searchParams = useSearchParams();

  const authority = searchParams.get("Authority");
  const status = searchParams.get("Status");

  const [loading, setLoading] = useState(true);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState(false);
  const [copied, setCopied] = useState(false);

  const calledRef = useRef(false);
  const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

  useEffect(() => {
    const verifyPayment = async () => {
      if (calledRef.current) return;
      calledRef.current = true;

      if (!authority || status !== "OK") {
        setLoading(false);
        setError(true);
        return;
      }

      try {
        const token = localStorage.getItem("accessToken");

        const response = await fetch(`${API}/api/payment/verify?Authority=${authority}&Status=${status}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await response.json();

        if (response.ok && data.success) {
          setResult(data);
          
          localStorage.removeItem("cart");
          localStorage.removeItem("shippingInfo");
          localStorage.removeItem("orderId");
        } else {
          setError(true);
        }
      } catch (err) {
        console.error("Verification Error:", err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    verifyPayment();
  }, [authority, status, API]);

  const copyCode = () => {
    if (!result?.refId) return;
    navigator.clipboard.writeText(result.refId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) return <LoadingUI />;

  if (error || !result?.success) return <FailedPaymentUI />;

  return <SuccessUI refId={result.refId} amount={result.amount} copyCode={copyCode} copied={copied} />;
}

export default function PaymentVerifyPage() {
  return (
    <Suspense fallback={<LoadingUI />}>
      <PaymentVerifyContent />
    </Suspense>
  );
}

/* ---------------------- LOADING ---------------------- */
function LoadingUI() {
  return (
    <div className="relative min-h-screen flex items-center justify-center bg-[#030617] text-white overflow-hidden px-4">
      <div className="absolute w-[500px] md:w-[700px] h-[500px] md:h-[700px] bg-blue-500/10 blur-[180px] md:blur-[220px] rounded-full -top-40 -left-40" />
      <div className="absolute w-[500px] md:w-[700px] h-[500px] md:h-[700px] bg-emerald-500/10 blur-[180px] md:blur-[220px] rounded-full bottom-0 right-0" />
      <div className="relative flex flex-col items-center gap-6 md:gap-8">
        <div className="relative">
          <div className="w-16 h-16 md:w-20 md:h-20 border-4 border-emerald-500/20 rounded-full"></div>
          <div className="absolute inset-0 border-4 border-transparent border-t-emerald-400 rounded-full animate-spin"></div>
        </div>
        <div className="text-sm md:text-base text-slate-300 animate-pulse text-center px-4">
          در حال تایید پرداخت و ثبت نهایی سفارش...
        </div>
      </div>
    </div>
  );
}

/* ---------------------- SUCCESS ---------------------- */
function SuccessUI({ refId, amount, copyCode, copied }: { refId: string; amount: number; copyCode: () => void; copied: boolean; }) {
  return (
    <div className="relative min-h-screen flex items-center justify-center bg-[#030617] px-4 py-8 overflow-hidden">
      <div className="absolute w-[500px] md:w-[800px] h-[500px] md:h-[800px] bg-blue-500/10 blur-[180px] md:blur-[260px] rounded-full -top-40 -left-40" />
      <div className="absolute w-[500px] md:w-[800px] h-[500px] md:h-[800px] bg-emerald-500/10 blur-[180px] md:blur-[260px] rounded-full bottom-0 right-0" />
      
      <div className="relative w-full max-w-xl mx-auto">
        {/* Gradient border wrapper */}
        <div className="p-[1px] rounded-[28px] bg-gradient-to-r from-emerald-500/30 via-blue-500/30 to-purple-500/30">
          <div className="rounded-[28px] bg-[#0b0f1c]/90 backdrop-blur-2xl px-5 sm:px-8 py-8 sm:py-10 border border-white/10 shadow-[0_30px_80px_rgba(0,0,0,0.8)]">
            
            {/* Success Icon */}
            <div className="flex flex-col items-center text-center">
              <div className="relative">
                <div className="absolute inset-0 rounded-full blur-xl bg-emerald-400/40"></div>
                <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-emerald-500/10 border border-emerald-400/40 flex items-center justify-center text-emerald-400">
                  <svg className="w-8 h-8 sm:w-10 sm:h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"/>
                  </svg>
                </div>
              </div>

              <h1 className="mt-5 sm:mt-6 text-xl sm:text-2xl font-bold text-white">
                پرداخت با موفقیت انجام شد
              </h1>

              <p className="mt-2 text-xs sm:text-sm text-slate-400 max-w-md leading-relaxed">
                سفارش شما با موفقیت ثبت شد و در انتظار بررسی تیم پشتیبانی می‌باشد.
                <br className="hidden sm:block" />
                مبلغ پرداخت شده:{" "}
                <strong className="text-emerald-400">{amount?.toLocaleString()} تومان</strong>
              </p>
            </div>

            {/* Tracking Code */}
            {refId && (
              <div className="mt-6 sm:mt-8 p-4 sm:p-6 rounded-2xl bg-black/40 border border-white/10 text-center">
                <p className="text-[10px] sm:text-xs text-slate-400">کد پیگیری پرداخت</p>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-3 mt-2 sm:mt-3">
                  <p className="font-mono text-lg sm:text-2xl tracking-[0.2em] sm:tracking-[0.3em] text-emerald-400 select-all break-all sm:break-normal">
                    {refId}
                  </p>
                  <button
                    onClick={copyCode}
                    className="text-[10px] sm:text-xs px-3 py-1.5 rounded-lg bg-white/10 border border-white/10 hover:bg-white/20 transition"
                  >
                    {copied ? "کپی شد" : "کپی"}
                  </button>
                </div>
              </div>
            )}

            {/* Steps */}
            <div className="mt-6 sm:mt-8">
              <p className="text-xs sm:text-sm font-semibold text-slate-200 mb-3 sm:mb-4">
                مراحل بعدی سفارش
              </p>
              <div className="space-y-3 sm:space-y-4">
                {["بررسی سفارش توسط تیم پشتیبانی", "آماده‌سازی و بسته‌بندی مرسوله", "ارسال و ثبت کد رهگیری پستی"].map((step, i) => (
                  <div key={i} className="flex items-center gap-2 sm:gap-3 text-xs sm:text-sm text-slate-400">
                    <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full border border-emerald-400/40 bg-emerald-400/10 flex items-center justify-center text-[10px] sm:text-[11px] text-emerald-400 shrink-0">
                      {i + 1}
                    </div>
                    {step}
                  </div>
                ))}
              </div>
            </div>

            {/* CTA */}
            <div className="mt-8 sm:mt-10">
              <Link href="/" className="block w-full">
                <button className="w-full px-4 py-3 rounded-xl bg-gradient-to-r from-emerald-400 to-emerald-500 text-black font-bold text-sm hover:scale-[1.02] active:scale-[0.97] transition shadow-xl shadow-emerald-500/30">
                  بازگشت به صفحه اصلی
                </button>
              </Link>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}

/* ---------------------- FAILED ---------------------- */
function FailedPaymentUI() {
  return (
    <div className="relative min-h-screen flex items-center justify-center bg-[#030617] px-4 py-8 overflow-hidden">
      <div className="absolute w-[400px] md:w-[600px] h-[400px] md:h-[600px] bg-red-500/10 blur-[150px] md:blur-[200px] rounded-full -top-40 -left-40" />
      <div className="absolute w-[400px] md:w-[600px] h-[400px] md:h-[600px] bg-purple-500/10 blur-[150px] md:blur-[200px] rounded-full bottom-0 right-0" />

      <div className="relative w-full max-w-md mx-auto">
        <div className="p-[1px] rounded-[28px] bg-gradient-to-r from-red-500/40 to-purple-500/40">
          <div className="rounded-[28px] bg-[#0b0f1c]/90 backdrop-blur-2xl px-5 sm:px-8 py-8 sm:py-10 border border-red-500/20 shadow-2xl text-center">

            <div className="mx-auto h-14 w-14 sm:h-16 sm:w-16 rounded-full bg-red-500/20 border border-red-400/40 flex items-center justify-center text-red-400">
              <svg className="w-8 h-8 sm:w-10 sm:h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/>
              </svg>
            </div>

            <h1 className="text-lg sm:text-xl font-semibold text-white mt-4 sm:mt-5">
              پرداخت ناموفق بود
            </h1>

            <p className="text-xs sm:text-sm text-slate-400 mt-2 sm:mt-3 leading-relaxed">
              پرداخت تایید نشد یا خطایی در فرآیند تایید رخ داد.
              اگر مبلغی از حساب شما کسر شده، به طور خودکار تا ۷۲ ساعت آینده بازمی‌گردد.
            </p>

            <Link href="/cart" className="block mt-6 sm:mt-7">
              <button className="w-full px-4 py-3 rounded-xl bg-white/10 text-white border border-white/10 hover:bg-white/20 transition text-sm">
                بازگشت به سبد خرید
              </button>
            </Link>

          </div>
        </div>
      </div>
    </div>
  );
}