'use client'

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Plus } from 'lucide-react'
import { format } from "date-fns"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { Toaster, toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { DataTable, CellAction } from "@/components/products-table"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { formatter } from "@/lib/utils"
import type { Product } from "@/types"
import { ColumnDef } from "@tanstack/react-table"

export default function ProductsPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [products, setProducts] = useState<Product[]>([])
  const [deleteProduct, setDeleteProduct] = useState<Product | null>(null)
  const supabase = createClientComponentClient()

  // Columnas para la tabla
  const columns: ColumnDef<Product>[] = [
    {
      accessorKey: "name",
      header: "Name",
    },
    {
      accessorKey: "price",
      header: "Price",
      cell: ({ row }) => formatter.format(row.original.price),
    },
    {
      accessorKey: "stock",
      header: "Stock",
    },
    {
      accessorKey: "category",
      header: "Category",
      cell: ({ row }) => row.original.category?.name || "No category",
    },
    {
      accessorKey: "featured",
      header: "Featured",
      cell: ({ row }) => row.original.featured ? "Yes" : "No",
    },
    {
      accessorKey: "created_at",
      header: "Date",
      cell: ({ row }) => row.original.created_at ? format(new Date(row.original.created_at), 'MMMM do, yyyy') : 'N/A',
    },
    {
      id: "actions",
      cell: ({ row }) => (
        <CellAction 
          data={row.original} 
          onEdit={handleEdit}
          onDelete={(product) => setDeleteProduct(product)}
        />
      ),
    },
  ]

  useEffect(() => {
    fetchProducts()
  }, [])

  const fetchProducts = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          category:categories(*)
        `)
        .order('created_at', { ascending: false })

      if (error) throw error

      setProducts(data || [])
    } catch (error) {
      console.error('Error fetching products:', error)
      toast.error('Error loading products')
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (product: Product) => {
    router.push(`./products/${product.id}/edit`)
  }

  const handleDelete = async (product: Product) => {
    try {
      setLoading(true)

      // Primero eliminamos las imágenes asociadas si existen
      if (product.images && product.images.length > 0) {
        const imagePaths = product.images
          .map(img => {
            const urlParts = img.url.split('/')
            return urlParts[urlParts.length - 1]
          })
          .filter(Boolean)

        if (imagePaths.length > 0) {
          const { error: storageError } = await supabase.storage
            .from('product-images')
            .remove(imagePaths)

          if (storageError) throw storageError
        }
      }

      // Luego eliminamos el producto
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', product.id)

      if (error) throw error

      // Actualizamos la lista de productos
      setProducts(products.filter(p => p.id !== product.id))
      toast.success('Product deleted successfully')
    } catch (error) {
      console.error('Error deleting product:', error)
      toast.error('Error deleting product')
    } finally {
      setLoading(false)
      setDeleteProduct(null)
    }
  }

  if (loading) {
    return <div>Loading...</div>
  }

  return (
    <>
      <div className="flex-1 space-y-4 p-8 pt-6">
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-bold tracking-tight">Products</h2>
          <Button onClick={() => router.push('/products/new')}>
            <Plus className="mr-2 h-4 w-4" />
            Add New
          </Button>
        </div>
        <Separator />
        <DataTable
          columns={columns}
          data={products}
          searchKey="name"
        />
      </div>

      <AlertDialog open={!!deleteProduct} onOpenChange={() => setDeleteProduct(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the product
              and remove all associated images.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteProduct && handleDelete(deleteProduct)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Toaster />
    </>
  )
}