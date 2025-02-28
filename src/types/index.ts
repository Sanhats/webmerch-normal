export interface Color {
  id: string;
  name: string;
  hex: string;
  created_at: string;
}

export interface ProductImage {
  id?: string;
  url: string;
  color: {
    name: string;
    hex: string;
  };
}

export interface Category {
  id: string;
  name: string;
  created_at?: string;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  category_id: string;
  featured: boolean;
  images: ProductImage[];
  category?: Category;
  created_at?: string;
}

export interface SupabaseProduct {
  id: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  category_id: string;
  featured: boolean;
  created_at: string;
  category: Category | null;
  images: ProductImage[];
}

export interface DashboardStats {
  totalProducts: number;
  featuredProducts: number;
  totalCategories: number;
}