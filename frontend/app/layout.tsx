import "./globals.css"
import localFont from "next/font/local"
import type { Metadata } from "next"
import dynamic from "next/dynamic"

import AnnouncementBar from "@/components/AnnouncementBar"
import ConditionalNavbar from "@/components/ConditionalNavbar"
import SupportButton from "@/components/SupportButton"
import ConditionalFooter from "@/components/ConditionalFooter"

const AiChatBot = dynamic(() => import("@/components/AiChatBot"), { ssr: false });

export const metadata: Metadata = {
  metadataBase: new URL("https://bluziperld.ir"),
  
  title: {
    default: "سفارش نامه دست‌نویس | نوشتن و ارسال نامه با دست خط زیبا | BluZiperld",
    template: "%s | BluZiperld",
  },
  
  description:
    "سفارش آنلاین نامه دست‌نویس با بهترین خط. نوشتن نامه عاشقانه، اداری، تولد و شخصی با دست خط زیبا. ارسال فوری به سراسر ایران. پاکت نامه دست‌ساز و لاکچری. BluZiperld",
  
  keywords: [
    "نامه دست‌نویس",
    "سفارش نامه",
    "نوشتن نامه",
    "ارسال نامه",
    "پاکت نامه",
    "نامه عاشقانه",
    "خوشنویسی",
    "BluZiperld",
    "نامه اداری",
    "نامه تولد",
    "نامه خداحافظی",
    "نامه قدردانی",
    "هدیه",
    "کادو",
    "پاکت دست‌ساز",
    "ارسال فوری",
    "دست خط زیبا",
    "نامه پستی",
    "سفارش آنلاین نامه",
    "نامه به سراسر ایران",
  ].join(", "),
  
  alternates: {
    canonical: "https://bluziperld.ir",
  },
  
  robots: {
    index: true,
    follow: true,
    "max-image-preview": "large",
    "max-snippet": -1,
    "max-video-preview": -1,
  },
  
  icons: {
    icon: "/icon.png",
    shortcut: "/icon.png",
    apple: "/icon.png",
  },
  
  // 🆕 PWA
  manifest: "/manifest.json",
  
  openGraph: {
    type: "website",
    locale: "fa_IR",
    url: "https://bluziperld.ir",
    siteName: "BluZiperld",
    title: "سفارش نامه دست‌نویس | نوشتن و ارسال نامه با دست خط زیبا | BluZiperld",
    description:
      "سفارش آنلاین نامه دست‌نویس با بهترین خط. نوشتن نامه عاشقانه، اداری، تولد و شخصی. ارسال فوری به سراسر ایران. پاکت نامه دست‌ساز.",
    images: [
      {
        url: "/icon.png",
        width: 512,
        height: 512,
        alt: "BluZiperld - سفارش نامه دست‌نویس",
      },
    ],
  },
  
  twitter: {
    card: "summary_large_image",
    title: "سفارش نامه دست‌نویس | BluZiperld",
    description: "نوشتن و ارسال نامه با دست خط زیبا. سفارش آنلاین، ارسال فوری به سراسر ایران.",
    images: ["/icon.png"],
  },
  
  other: {
    "google-site-verification": "google57f20dd253e2e07b.html",
    // 🆕 Apple PWA
    "apple-mobile-web-app-capable": "yes",
    "apple-mobile-web-app-status-bar-style": "black-translucent",
    "apple-mobile-web-app-title": "BluZiperld",
  },
}

const estedad = localFont({
  src: [
    { path: "./fonts/estedad/Estedad-Light.woff2", weight: "300", style: "normal" },
    { path: "./fonts/estedad/Estedad-Regular.woff2", weight: "400", style: "normal" },
    { path: "./fonts/estedad/Estedad-Medium.woff2", weight: "500", style: "normal" },
    { path: "./fonts/estedad/Estedad-SemiBold.woff2", weight: "600", style: "normal" },
    { path: "./fonts/estedad/Estedad-Bold.woff2", weight: "700", style: "normal" },
    { path: "./fonts/estedad/Estedad-ExtraBold.woff2", weight: "800", style: "normal" },
    { path: "./fonts/estedad/Estedad-Black.woff2", weight: "900", style: "normal" },
  ],
  variable: "--font-estedad",
  display: "swap",
})

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fa" dir="rtl">
      <head>
        {/* 🆕 PWA Meta Tags */}
        <meta name="theme-color" content="#050d27" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="BluZiperld" />
        <link rel="apple-touch-icon" href="/icon.png" />
      </head>
      <body className={`${estedad.variable} min-h-screen bg-[#050d27] text-white overflow-x-hidden`}>
        <AnnouncementBar />
        <ConditionalNavbar />
        {children}
        <ConditionalFooter />
        <SupportButton />
        <AiChatBot />

        {/* 🆕 Service Worker Registration */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                  navigator.serviceWorker.register('/sw.js').then(
                    function(registration) { console.log('SW registered:', registration.scope); },
                    function(err) { console.log('SW failed:', err); }
                  );
                });
              }
            `,
          }}
        />
      </body>
    </html>
  )
}