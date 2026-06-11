import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function proxy(request: NextRequest) {
  const token = request.cookies.get("token")?.value;

  // محافظت از روت‌های پنل ادمین
  if (request.nextUrl.pathname.startsWith("/admin")) {
    if (!token) {
      return NextResponse.redirect(new URL("/auth", request.url));
    }

    try {
      // خواندن payload توکن
    const payload = JSON.parse(atob(token.split(".")[1]));

if (payload.role !== "admin") {
  return NextResponse.redirect(new URL("/", request.url));
}


    } catch {
      return NextResponse.redirect(new URL("/auth", request.url));
    }
  }

  return NextResponse.next();
}

// مسیرهایی که باید چک شوند
export const config = {
  matcher: ["/admin/:path*"],
};
