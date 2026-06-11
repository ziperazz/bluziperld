"use client"

import { usePathname } from "next/navigation"
import Navbar from "@/components/Navbar"
import Footer from "@/components/Footer"

export default function ClientRouteWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const isAuthPage = pathname.startsWith("/auth")

  return (
    <>
      {!isAuthPage && <Navbar />}

      <main className="page-container mt-8">
        {children}
      </main>

      {!isAuthPage && <Footer />}
    </>
  )
}
