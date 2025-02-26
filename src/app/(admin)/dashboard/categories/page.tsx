import { CategoryList } from "@/components/admin/category-list"
import { authMiddleware } from "../../middleware"

export default async function CategoriesPage() {
  await authMiddleware()

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold tracking-tight">Categorías</h2>
      <CategoryList />
    </div>
  )
}