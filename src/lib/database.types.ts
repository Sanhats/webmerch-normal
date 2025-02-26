export interface Product {
  id: string
  created_at: string
  name: string
  description: string
  price: number
  stock: number
  featured: boolean
  category_id: string
}

export interface Category {
  id: string
  name: string
  created_at: string
}

export interface ProductImage {
  id: string
  product_id: string
  url: string
  color: string
  created_at: string
}