"use client";

export default function Error({
  error,
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,rgba(34,211,238,0.08),transparent_25%),linear-gradient(180deg,#0a0f1f_0%,#0b1020_40%,#070b16_100%)] px-4 py-10 text-white">
      <div className="mx-auto max-w-2xl rounded-[30px] border border-rose-400/20 bg-rose-500/10 p-8 backdrop-blur-2xl">
        <h2 className="text-2xl font-bold">مشکلی پیش آمده</h2>
        <p className="mt-3 text-sm leading-7 text-white/75">
          {error?.message || "در بارگذاری صفحه سفارشات خطایی رخ داده است."}
        </p>
        <button
          onClick={reset}
          className="mt-6 rounded-2xl border border-white/10 bg-white/10 px-5 py-3 text-sm transition hover:bg-white/15"
        >
          تلاش مجدد
        </button>
      </div>
    </main>
  );
}
