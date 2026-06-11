"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AlertTriangle, RefreshCcw, Home, Bug } from "lucide-react";

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {


  const router = useRouter();
  const [showDetails,setShowDetails] = useState(false);

  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen bg-[#050A18] text-gray-200 flex items-center justify-center p-6">

      <div className="max-w-xl w-full">

        <div
          className="rounded-3xl border border-white/10 p-8 backdrop-blur-xl"
          style={{
            background: "rgba(15,16,22,0.75)",
            boxShadow: "0 20px 60px rgba(0,0,0,0.45)",
          }}
        >

          {/* icon */}
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 rounded-2xl flex items-center justify-center bg-red-500/10 border border-red-400/20">
              <AlertTriangle size={40} className="text-red-400"/>
            </div>
          </div>

          {/* title */}
          <h1 className="text-2xl font-bold text-center text-white mb-3">
            خطایی در سیستم رخ داد
          </h1>

          {/* description */}
          <p className="text-center text-gray-400 text-sm leading-7 mb-8">
            متأسفانه در پردازش درخواست شما مشکلی پیش آمده است.
            لطفاً چند لحظه بعد دوباره تلاش کنید یا به صفحه اصلی برگردید.
          </p>

          {/* actions */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center">

            <button
              onClick={() => reset()}
              className="flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-sm font-semibold transition hover:scale-[1.03]"
              style={{
                background:"linear-gradient(135deg,#2563eb,#3b82f6)"
              }}
            >
              <RefreshCcw size={16}/>
              تلاش دوباره
            </button>

            <button
              onClick={() => router.push("/")}
              className="flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-sm font-semibold border border-white/10 bg-white/5 hover:bg-white/10 transition"
            >
              <Home size={16}/>
              بازگشت به خانه
            </button>

          </div>

          {/* debug section */}
          <div className="mt-8 border-t border-white/5 pt-5">

            <button
              onClick={()=>setShowDetails(!showDetails)}
              className="text-xs text-gray-400 flex items-center gap-2 hover:text-gray-200 transition"
            >
              <Bug size={14}/>
              نمایش جزئیات فنی
            </button>

            {showDetails && (
              <div className="mt-4 text-xs text-red-300 bg-black/40 border border-white/5 p-4 rounded-xl overflow-x-auto">

                <pre className="whitespace-pre-wrap break-words">
{error?.message || "Unknown error"}
                </pre>

                {error?.digest && (
                  <div className="mt-2 text-gray-500">
                    digest: {error.digest}
                  </div>
                )}

              </div>
            )}

          </div>

        </div>

        <div className="text-center text-[11px] text-gray-500 mt-6">
          اگر مشکل ادامه داشت با پشتیبانی تماس بگیرید.
        </div>

      </div>

    </div>
  );
}
