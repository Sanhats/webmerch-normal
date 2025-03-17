"use client"

import type React from "react"

import { useState } from "react"
import { Package2, LayoutDashboard, Tags, LogOut, Menu, X } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { FolderTree } from "lucide-react"
import { Toaster } from "sonner"

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const supabase = createClientComponentClient()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut()
      router.push("/login")
    } catch (error) {
      console.error("Error logging out:", error)
    }
  }

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen)
  }

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      {/* Mobile sidebar toggle */}
      <button
        onClick={toggleSidebar}
        className="md:hidden fixed top-4 left-4 z-50 p-2 rounded-md bg-gray-800 text-white"
        aria-label="Toggle sidebar"
      >
        {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </button>

      {/* Sidebar - hidden by default on mobile, shown when toggled */}
      <aside
        className={`${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } md:translate-x-0 fixed md:static top-0 left-0 z-40 h-full w-64 bg-gray-900 text-white transition-transform duration-300 ease-in-out md:transition-none`}
      >
        <div className="p-4">
          <div className="flex items-center gap-2 mb-8 mt-12 md:mt-0">
            <Package2 className="h-6 w-6" />
            <span className="text-xl font-bold">Admin Panel</span>
          </div>
          <nav className="space-y-2">
            <Link
              href="/dashboard"
              className="flex items-center gap-2 p-2 rounded hover:bg-gray-800"
              onClick={() => setSidebarOpen(false)}
            >
              <LayoutDashboard className="h-5 w-5" />
              Dashboard
            </Link>
            <Link
              href="/products"
              className="flex items-center gap-2 p-2 rounded hover:bg-gray-800"
              onClick={() => setSidebarOpen(false)}
            >
              <Tags className="h-5 w-5" />
              Productos
            </Link>

            <Link
              href="/dashboard/categories"
              className="flex items-center gap-2 p-2 rounded hover:bg-gray-800"
              onClick={() => setSidebarOpen(false)}
            >
              <FolderTree className="h-5 w-5" />
              Categorías
            </Link>
            <Button
              variant="ghost"
              className="w-full justify-start text-white hover:bg-gray-800"
              onClick={handleLogout}
            >
              <LogOut className="h-5 w-5 mr-2" />
              Cerrar sesión
            </Button>
          </nav>
        </div>
      </aside>

      {/* Overlay to close sidebar when clicking outside on mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30 md:hidden"
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Main Content */}
      <main className="flex-1 bg-gray-100 w-full">
        <header className="bg-white shadow">
          <div className="px-4 py-6 ml-0 md:ml-0">
            <h1 className="text-xl md:text-2xl font-semibold text-gray-900 pl-10 md:pl-0">Panel de Administración</h1>
          </div>
        </header>
        <div className="p-4 md:p-6">
          {children}
          <Toaster />
        </div>
      </main>
    </div>
  )
}

