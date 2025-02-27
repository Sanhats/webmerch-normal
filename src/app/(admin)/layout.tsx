"use client"

import { Package2, LayoutDashboard, Tags,  LogOut } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { FolderTree } from 'lucide-react'

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const supabase = createClientComponentClient()

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut()
      router.push('/login')
    } catch (error) {
      console.error('Error logging out:', error)
    }
  }

  return (
    <div className="min-h-screen flex">
      {/* Sidebar */}
      <aside className="w-64 bg-gray-900 text-white">
        <div className="p-4">
          <div className="flex items-center gap-2 mb-8">
            <Package2 className="h-6 w-6" />
            <span className="text-xl font-bold">Admin Panel</span>
          </div>
          <nav className="space-y-2">
            <Link
              href="/dashboard"
              className="flex items-center gap-2 p-2 rounded hover:bg-gray-800"
            >
              <LayoutDashboard className="h-5 w-5" />
              Dashboard
            </Link>
            <Link
              href="/dashboard/products"
              className="flex items-center gap-2 p-2 rounded hover:bg-gray-800"
            >
              <Tags className="h-5 w-5" />
              Productos
            </Link>
            
            <Link
    href="/dashboard/categories"
    className="flex items-center gap-2 p-2 rounded hover:bg-gray-800"
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

      {/* Main Content */}
      <main className="flex-1 bg-gray-100">
        <header className="bg-white shadow">
          <div className="px-4 py-6">
            <h1 className="text-2xl font-semibold text-gray-900">Panel de Administración</h1>
          </div>
        </header>
        <div className="p-6">
          {children}
        </div>
      </main>
    </div>
  )
}