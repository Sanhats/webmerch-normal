import { Plus } from 'lucide-react'
import { ProductList } from "@/components/admin/product-list"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { authMiddleware } from "../../middleware"

export default async function ProductsPage() {
  await authMiddleware()

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Productos</h2>
        <Link href="/dashboard/products/new">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Nuevo Producto
          </Button>
        </Link>
      </div>

      <ProductList />
    </div>
  )
}