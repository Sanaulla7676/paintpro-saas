export interface Brand {
  id: string;
  name: string;
  slug: string;
  logo_url?: string;
  active: boolean;
  product_count?: number;
}

export interface Category {
  id: string;
  brand_id?: string;
  name: string;
  slug: string;
  description?: string;
  active: boolean;
  sort_order: number;
  product_count?: number;
}

export interface Product {
  id: string;
  brand_id?: string;
  brand: string;
  category_id?: string;
  category: string;
  subcategory?: string;
  name: string;
  slug?: string;
  description: string;
  technical_description?: string;
  finish?: string;
  application?: string;
  coverage?: number; // sq.ft per liter/unit
  recommended_coats?: number;
  pack_sizes?: string[]; // e.g. ["1L", "4L", "10L", "20L"]
  product_code?: string;
  image_url?: string;
  initials?: string;
  working_price?: number; // local painter price
  mrp?: number;
  dealer_price?: number;
  active?: boolean;
}

export interface ProductPrice {
  id?: string;
  product_id: string;
  pack_size: string;
  unit: string;
  mrp?: number;
  working_price: number;
  dealer_price?: number;
  updated_at?: string;
}

export interface Shade {
  id: string;
  brand_id?: string;
  brand: string;
  code: string;
  name: string;
  family: string;
  hex: string;
  image_url?: string;
  active?: boolean;
}
