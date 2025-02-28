import { ProductForm } from "@/components/admin/product-form"
import { authMiddleware } from "../../middleware"

export default async function NewProductPage() {
  await authMiddleware()

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold tracking-tight">Nuevo Producto</h2>
      <ProductForm />
    </div>
  )
}