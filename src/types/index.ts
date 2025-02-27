export interface ProductImage {
  url: string;
  color: {
    name: string;
    hex: string;
  };
}
export interface Category {
  name: string;
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
}