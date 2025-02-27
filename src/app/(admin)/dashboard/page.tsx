'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Package, Star, Tags, ArrowRight } from 'lucide-react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
import Link from 'next/link'

interface Category {
  name: string;
}

interface Product {
  id: string;
  name: string;
  price: number;
  created_at: string;
  category: Category | Category[] | null;
}

interface DashboardStats {
  totalProducts: number;
  featuredProducts: number;
  totalCategories: number;
}

function StatsCards({ stats, loading }: { stats: DashboardStats; loading: boolean }) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Productos</CardTitle>
          <Package className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          {loading ? (
            <Skeleton className="h-7 w-20" />
          ) : (
            <div className="text-2xl font-bold">{stats.totalProducts}</div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Productos Destacados</CardTitle>
          <Star className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          {loading ? (
            <Skeleton className="h-7 w-20" />
          ) : (
            <div className="text-2xl font-bold">{stats.featuredProducts}</div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Categorías</CardTitle>
          <Tags className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          {loading ? (
            <Skeleton className="h-7 w-20" />
          ) : (
            <div className="text-2xl font-bold">{stats.totalCategories}</div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

function RecentProducts() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClientComponentClient()

  useEffect(() => {
    const fetchRecentProducts = async () => {
      try {
        const { data, error } = await supabase
          .from('products')
          .select(`
            id,
            name,
            price,
            created_at,
            category:categories(name)
          `)
          .order('created_at', { ascending: false })
          .limit(5)

        if (error) throw error

        const formattedData: Product[] = (data || []).map(item => ({
          id: item.id,
          name: item.name,
          price: item.price,
          created_at: item.created_at,
          category: item.category ? { name: item.category.name } : null
        }))

        setProducts(formattedData)
      } catch (err) {
        console.error('Error fetching recent products:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchRecentProducts()
  }, [supabase])

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Productos Recientes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex items-center space-x-4">
                <Skeleton className="h-12 w-12 rounded-full" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-[250px]" />
                  <Skeleton className="h-4 w-[200px]" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Productos Recientes</CardTitle>
        <Link href="/dashboard/products">
          <Button variant="ghost" size="sm" className="gap-2">
            Ver todos
            <ArrowRight className="h-4 w-4" />
          </Button>
        </Link>
      </CardHeader>
      <CardContent>
        <div className="space-y-8">
          {products.length === 0 ? (
            <div className="text-center py-6">
              <p className="text-sm text-muted-foreground">No hay productos registrados</p>
              <Link href="/dashboard/products/new">
                <Button variant="link" className="mt-2">
                  Agregar primer producto
                </Button>
              </Link>
            </div>
          ) : (
            products.map((product) => (
              <div key={product.id} className="flex items-center">
                <div className="space-y-1">
                  <p className="text-sm font-medium leading-none">{product.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {product.category?.name || 'Sin categoría'} ·{' '}
                    {new Intl.NumberFormat('es-ES', {
                      style: 'currency',
                      currency: 'USD'
                    }).format(product.price)}
                  </p>
                </div>
                <div className="ml-auto text-sm text-muted-foreground">
                  {new Date(product.created_at).toLocaleDateString()}
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  )
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats>({
    totalProducts: 0,
    featuredProducts: 0,
    totalCategories: 0
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClientComponentClient()

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true)
        setError(null)

        // Obtener total de productos
        const { count: totalProducts, error: productsError } = await supabase
          .from('products')
          .select('*', { count: 'exact', head: true })

        if (productsError) throw productsError

        // Obtener productos destacados
        const { count: featuredProducts, error: featuredError } = await supabase
          .from('products')
          .select('*', { count: 'exact', head: true })
          .eq('featured', true)

        if (featuredError) throw featuredError

        // Obtener total de categorías
        const { count: totalCategories, error: categoriesError } = await supabase
          .from('categories')
          .select('*', { count: 'exact', head: true })

        if (categoriesError) throw categoriesError

        setStats({
          totalProducts: totalProducts || 0,
          featuredProducts: featuredProducts || 0,
          totalCategories: totalCategories || 0
        })
      } catch (err) {
        console.error('Error fetching stats:', err)
        setError('Error al cargar las estadísticas')
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [supabase])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
        <Link href="/dashboard/products/new">
          <Button>Nuevo Producto</Button>
        </Link>
      </div>

      {error ? (
        <div className="bg-destructive/15 text-destructive px-4 py-3 rounded-lg">
          {error}
        </div>
      ) : (
        <>
          <StatsCards stats={stats} loading={loading} />
          <div className="grid gap-4 md:grid-cols-2">
            <RecentProducts />
            <Card>
              <CardHeader>
                <CardTitle>Accesos Rápidos</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Link href="/dashboard/products" className="block">
                  <Button variant="outline" className="w-full justify-start gap-2">
                    <Package className="h-4 w-4" />
                    Gestionar Productos
                  </Button>
                </Link>
                <Link href="/dashboard/categories" className="block">
                  <Button variant="outline" className="w-full justify-start gap-2">
                    <Tags className="h-4 w-4" />
                    Gestionar Categorías
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  )
}