import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // فقط مسیرهای /admin رو چک کن
  if (pathname.startsWith("/admin")) {
    const token = request.cookies.get("accessToken")?.value;

    if (!token) {
      // کاربر لاگین نکرده → بفرست صفحه اصلی
      return NextResponse.redirect(new URL("/", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: "/admin/:path*",
};