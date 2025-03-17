"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Package, Star, Tags, ArrowRight } from "lucide-react"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { formatter } from "@/lib/utils"
import type { Product, DashboardStats, SupabaseProduct } from "@/types"

interface StatsCardProps {
  title: string
  value: string | number
  icon: React.ReactNode
  loading?: boolean
}

function StatsCard({ title, value, icon, loading }: StatsCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        {loading ? (
          <Skeleton className="h-7 w-[100px]" />
        ) : (
          <div className="text-xl md:text-2xl font-bold">{value}</div>
        )}
      </CardContent>
    </Card>
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
          .from("products")
          .select(`
            *,
            category:categories(*)
          `)
          .order("created_at", { ascending: false })
          .limit(5)

        if (error) throw error

        const formattedData: Product[] = (data || []).map((item: SupabaseProduct) => ({
          id: item.id,
          name: item.name,
          description: item.description,
          price: item.price,
          stock: item.stock,
          category_id: item.category_id,
          featured: item.featured,
          images: item.images || [],
          category: item.category || undefined,
          created_at: item.created_at,
        }))

        setProducts(formattedData)
      } catch (err) {
        console.error("Error fetching recent products:", err)
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
          <CardTitle>Recent Products</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
        <CardTitle>Recent Products</CardTitle>
        <Button asChild variant="ghost" size="sm">
          <Link href="./products">
            View all
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {products.map((product) => (
            <div
              key={product.id}
              className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2"
            >
              <div className="flex items-start sm:items-center">
                <div>
                  <p className="font-medium">{product.name}</p>
                  <p className="text-sm text-muted-foreground">{product.category?.name || "No category"}</p>
                </div>
              </div>
              <div className="font-medium">{formatter.format(product.price)}</div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats>({
    totalProducts: 0,
    featuredProducts: 0,
    totalCategories: 0,
  })
  const [loading, setLoading] = useState(true)
  const supabase = createClientComponentClient()

  useEffect(() => {
    const fetchDashboardStats = async () => {
      try {
        // Get total products
        const { count: totalProducts } = await supabase.from("products").select("*", { count: "exact", head: true })

        // Get featured products
        const { count: featuredProducts } = await supabase
          .from("products")
          .select("*", { count: "exact", head: true })
          .eq("featured", true)

        // Get total categories
        const { count: totalCategories } = await supabase.from("categories").select("*", { count: "exact", head: true })

        setStats({
          totalProducts: totalProducts || 0,
          featuredProducts: featuredProducts || 0,
          totalCategories: totalCategories || 0,
        })
      } catch (error) {
        console.error("Error fetching dashboard stats:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchDashboardStats()
  }, [supabase])

  return (
    <div className="flex-1 space-y-4 p-4 sm:p-6 md:p-8 pt-6">
      <h2 className="text-2xl md:text-3xl font-bold tracking-tight">Dashboard</h2>
      <div className="grid gap-4 grid-cols-1 md:grid-cols-3">
        <StatsCard
          title="Total Products"
          value={stats.totalProducts}
          icon={<Package className="h-4 w-4 text-muted-foreground" />}
          loading={loading}
        />
        <StatsCard
          title="Featured Products"
          value={stats.featuredProducts}
          icon={<Star className="h-4 w-4 text-muted-foreground" />}
          loading={loading}
        />
        <StatsCard
          title="Categories"
          value={stats.totalCategories}
          icon={<Tags className="h-4 w-4 text-muted-foreground" />}
          loading={loading}
        />
      </div>
      <RecentProducts />
    </div>
  )
}

