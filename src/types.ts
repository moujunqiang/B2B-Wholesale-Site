export interface Env {
  DB: D1Database;
  R2_BUCKET: R2Bucket;
}

export interface Category {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  parent_id: number | null;
  sort_order: number;
  is_active: number;
  created_at: string;
  updated_at: string;
}

export interface Product {
  id: number;
  category_id: number | null;
  name: string;
  slug: string;
  description: string | null;
  short_description: string | null;
  price: number | null;
  min_order_qty: number;
  images: string | null;
  specifications: string | null;
  is_active: number;
  is_featured: number;
  view_count: number;
  created_at: string;
  updated_at: string;
}

export interface Inquiry {
  id: number;
  product_id: number | null;
  name: string;
  email: string;
  company: string | null;
  country: string | null;
  message: string;
  status: string;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface Translation {
  id: number;
  locale: string;
  key: string;
  value: string;
  created_at: string;
  updated_at: string;
}

export interface Setting {
  id: number;
  key: string;
  value: string | null;
  created_at: string;
  updated_at: string;
}

export interface Admin {
  id: number;
  username: string;
  password_hash: string;
  email: string | null;
  role: string;
  last_login: string | null;
  created_at: string;
  updated_at: string;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export type InquiryStatus = 'pending' | 'replied' | 'completed' | 'archived';

export interface AdminLoginRequest {
  username: string;
  password: string;
}

export interface InquiryCreateRequest {
  product_id?: number;
  name: string;
  email: string;
  company?: string;
  country?: string;
  message: string;
}

export interface ProductCreateRequest {
  category_id?: number;
  name: string;
  slug: string;
  description?: string;
  short_description?: string;
  price?: number;
  min_order_qty?: number;
  images?: string[];
  specifications?: Record<string, string>;
  is_active?: boolean;
  is_featured?: boolean;
}

export interface CategoryCreateRequest {
  name: string;
  slug: string;
  description?: string;
  parent_id?: number;
  sort_order?: number;
  is_active?: boolean;
}