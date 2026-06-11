import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#050A18] text-gray-200 p-6">
      <div className="text-center max-w-md">

        <h1 className="text-5xl font-bold text-white mb-4">
          404
        </h1>

        <h2 className="text-xl font-semibold mb-3">
          صفحه مورد نظر پیدا نشد
        </h2>

        <p className="text-gray-400 text-sm leading-7 mb-8">
          صفحه‌ای که دنبال آن هستید وجود ندارد یا ممکن است آدرس آن تغییر کرده باشد.
        </p>

        <Link
          href="/"
          className="inline-block px-6 py-3 rounded-xl text-sm font-semibold bg-blue-600 hover:bg-blue-500 transition"
        >
          بازگشت به صفحه اصلی
        </Link>

      </div>
    </div>
  );
}
