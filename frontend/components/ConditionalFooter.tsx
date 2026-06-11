"use client";

import { usePathname } from "next/navigation";
import Footer from "./Footer";

export default function ConditionalFooter() {
  const pathname = usePathname();

  // اگر مسیر admin است → فوتر را نمایش نده
  if (pathname.startsWith("/admin")) {
    return null;
  }

  return <Footer />;
}
