import "@/app/admin/styles/admin.css"
import type { ReactNode } from "react"
import Sidebar from "./components/Sidebar"
import Header from "./components/Header"

export const metadata = {
  title: "Admin Panel",
  description: "Professional Admin Dashboard",
}

interface AdminLayoutProps {
  children: ReactNode
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  return (
    <div className="admin-root">
      <div className="admin-layout">
        
        {/* Sidebar */}
        <aside className="admin-sidebar">
          <Sidebar />
        </aside>

        {/* Main Content */}
        <div className="admin-main">
          
          {/* Header */}
          <header className="admin-header">
            <Header />
          </header>

          {/* Page Content */}
          <main className="admin-content fancy-scroll">
            {children}
          </main>

        </div>
      </div>
    </div>
  )
}
