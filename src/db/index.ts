import { D1Database, R2Bucket } from '@cloudflare/workers-types';
import type { Category, Product, Inquiry, Admin } from '../types';

export interface Env {
  DB: D1Database;
  R2_BUCKET: R2Bucket;
  EMAIL_API_KEY?: string;
  ADMIN_EMAIL?: string;
}

export interface CacheItem<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

export const CACHE_CONFIG = {
  products: 300,
  categories: 600,
  settings: 300,
  translations: 600,
};

class Database {
  private cache = new Map<string, CacheItem<any>>();

  constructor(private db: D1Database) {}

  private getCacheKey(prefix: string, params: any[]): string {
    return `${prefix}:${params.join(':')}`;
  }

  private getFromCache<T>(key: string): T | null {
    const item = this.cache.get(key);
    if (!item) return null;
    
    const now = Date.now();
    if (now - item.timestamp > item.ttl * 1000) {
      this.cache.delete(key);
      return null;
    }
    
    return item.data as T;
  }

  private setCache<T>(key: string, data: T, ttl: number): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl: ttl * 1000,
    });
  }

  invalidateCache(prefix: string): void {
    const keysToDelete: string[] = [];
    for (const key of this.cache.keys()) {
      if (key.startsWith(prefix)) {
        keysToDelete.push(key);
      }
    }
    keysToDelete.forEach(key => this.cache.delete(key));
  }

  async getCategories(parentId?: number): Promise<Category[]> {
    const cacheKey = this.getCacheKey('categories', [parentId ?? 'all']);
    const cached = this.getFromCache<Category[]>(cacheKey);
    if (cached) return cached;

    let query = 'SELECT * FROM categories WHERE is_active = 1';
    const params: any[] = [];
    if (parentId !== undefined) {
      query += ' AND parent_id = ?';
      params.push(parentId);
    }
    query += ' ORDER BY sort_order ASC, id ASC';
    
    const result = await this.db.prepare(query).bind(...params).all();
    const categories = result.results as any;
    
    this.setCache(cacheKey, categories, CACHE_CONFIG.categories);
    return categories;
  }

  async getCategoryBySlug(slug: string): Promise<Category | null> {
    const cacheKey = this.getCacheKey('category_slug', [slug]);
    const cached = this.getFromCache<Category>(cacheKey);
    if (cached) return cached;

    const result = await this.db.prepare('SELECT * FROM categories WHERE slug = ? AND is_active = 1').bind(slug).first();
    const category = result as any;
    
    if (category) {
      this.setCache(cacheKey, category, CACHE_CONFIG.categories);
    }
    
    return category;
  }

  async getCategoryById(id: number): Promise<Category | null> {
    const cacheKey = this.getCacheKey('category_id', [id]);
    const cached = this.getFromCache<Category>(cacheKey);
    if (cached) return cached;

    const result = await this.db.prepare('SELECT * FROM categories WHERE id = ?').bind(id).first();
    const category = result as any;
    
    if (category) {
      this.setCache(cacheKey, category, CACHE_CONFIG.categories);
    }
    
    return category;
  }

  async createCategory(category: Partial<Category>): Promise<number> {
    const result = await this.db.prepare(`
      INSERT INTO categories (name, slug, description, parent_id, sort_order, is_active)
      VALUES (?, ?, ?, ?, ?, ?)
    `).bind(
      category.name,
      category.slug,
      category.description || null,
      category.parent_id || null,
      category.sort_order || 0,
      category.is_active !== undefined ? (category.is_active ? 1 : 0) : 1
    ).run();
    
    this.invalidateCache('categories');
    return result.meta!.last_row_id as number;
  }

  async updateCategory(id: number, category: Partial<Category>): Promise<boolean> {
    const updates: string[] = [];
    const params: any[] = [];
    if (category.name !== undefined) { updates.push('name = ?'); params.push(category.name); }
    if (category.slug !== undefined) { updates.push('slug = ?'); params.push(category.slug); }
    if (category.description !== undefined) { updates.push('description = ?'); params.push(category.description); }
    if (category.parent_id !== undefined) { updates.push('parent_id = ?'); params.push(category.parent_id); }
    if (category.sort_order !== undefined) { updates.push('sort_order = ?'); params.push(category.sort_order); }
    if (category.is_active !== undefined) { updates.push('is_active = ?'); params.push(category.is_active ? 1 : 0); }
    if (updates.length === 0) return false;
    updates.push('updated_at = CURRENT_TIMESTAMP');
    params.push(id);
    const result = await this.db.prepare(`UPDATE categories SET ${updates.join(', ')} WHERE id = ?`).bind(...params).run();
    
    this.invalidateCache('categories');
    return result.success;
  }

  async deleteCategory(id: number): Promise<boolean> {
    const result = await this.db.prepare('DELETE FROM categories WHERE id = ?').bind(id).run();
    this.invalidateCache('categories');
    return result.success;
  }

  async getProducts(categoryId?: number, page = 1, pageSize = 12): Promise<{ items: Product[]; total: number }> {
    const cacheKey = this.getCacheKey('products', [categoryId ?? 'all', page, pageSize]);
    const cached = this.getFromCache<{ items: Product[]; total: number }>(cacheKey);
    if (cached) return cached;

    let whereClause = 'WHERE is_active = 1';
    const params: any[] = [];
    if (categoryId) {
      whereClause += ' AND category_id = ?';
      params.push(categoryId);
    }
    
    const countResult = await this.db.prepare(`SELECT COUNT(*) as total FROM products ${whereClause}`).bind(...params).first() as any;
    const total = countResult?.total || 0;
    const offset = (page - 1) * pageSize;
    
    const result = await this.db.prepare(`
      SELECT * FROM products ${whereClause}
      ORDER BY is_featured DESC, created_at DESC
      LIMIT ? OFFSET ?
    `).bind(...params, pageSize, offset).all();
    
    const productsData = { items: result.results as any, total };
    
    this.setCache(cacheKey, productsData, CACHE_CONFIG.products);
    return productsData;
  }

  async getFeaturedProducts(limit = 6): Promise<Product[]> {
    const cacheKey = this.getCacheKey('featured_products', [limit]);
    const cached = this.getFromCache<Product[]>(cacheKey);
    if (cached) return cached;

    const result = await this.db.prepare(`
      SELECT * FROM products WHERE is_active = 1 AND is_featured = 1
      ORDER BY created_at DESC LIMIT ?
    `).bind(limit).all();
    
    const products = result.results as any;
    this.setCache(cacheKey, products, CACHE_CONFIG.products);
    return products;
  }

  async getProductBySlug(slug: string): Promise<Product | null> {
    const cacheKey = this.getCacheKey('product_slug', [slug]);
    const cached = this.getFromCache<Product>(cacheKey);
    if (cached) return cached;

    const result = await this.db.prepare('SELECT * FROM products WHERE slug = ? AND is_active = 1').bind(slug).first();
    const product = result as any;
    
    if (product) {
      this.db.prepare('UPDATE products SET view_count = view_count + 1 WHERE id = ?').bind(product.id).run();
      this.setCache(cacheKey, product, CACHE_CONFIG.products);
    }
    
    return product;
  }

  async getProductById(id: number): Promise<Product | null> {
    const cacheKey = this.getCacheKey('product_id', [id]);
    const cached = this.getFromCache<Product>(cacheKey);
    if (cached) return cached;

    const result = await this.db.prepare('SELECT * FROM products WHERE id = ?').bind(id).first();
    const product = result as any;
    
    if (product) {
      this.setCache(cacheKey, product, CACHE_CONFIG.products);
    }
    
    return product;
  }

  async createProduct(product: Partial<Product>): Promise<number> {
    const result = await this.db.prepare(`
      INSERT INTO products (category_id, name, slug, description, short_description, price, min_order_qty, images, specifications, is_active, is_featured)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      product.category_id || null,
      product.name,
      product.slug,
      product.description || null,
      product.short_description || null,
      product.price || null,
      product.min_order_qty || 1,
      product.images ? JSON.stringify(product.images) : null,
      product.specifications ? JSON.stringify(product.specifications) : null,
      product.is_active !== undefined ? (product.is_active ? 1 : 0) : 1,
      product.is_featured !== undefined ? (product.is_featured ? 1 : 0) : 0
    ).run();
    
    this.invalidateCache('products');
    return result.meta!.last_row_id as number;
  }

  async updateProduct(id: number, product: Partial<Product>): Promise<boolean> {
    const updates: string[] = [];
    const params: any[] = [];
    if (product.category_id !== undefined) { updates.push('category_id = ?'); params.push(product.category_id); }
    if (product.name !== undefined) { updates.push('name = ?'); params.push(product.name); }
    if (product.slug !== undefined) { updates.push('slug = ?'); params.push(product.slug); }
    if (product.description !== undefined) { updates.push('description = ?'); params.push(product.description); }
    if (product.short_description !== undefined) { updates.push('short_description = ?'); params.push(product.short_description); }
    if (product.price !== undefined) { updates.push('price = ?'); params.push(product.price); }
    if (product.min_order_qty !== undefined) { updates.push('min_order_qty = ?'); params.push(product.min_order_qty); }
    if (product.images !== undefined) { updates.push('images = ?'); params.push(product.images ? JSON.stringify(product.images) : null); }
    if (product.specifications !== undefined) { updates.push('specifications = ?'); params.push(product.specifications ? JSON.stringify(product.specifications) : null); }
    if (product.is_active !== undefined) { updates.push('is_active = ?'); params.push(product.is_active ? 1 : 0); }
    if (product.is_featured !== undefined) { updates.push('is_featured = ?'); params.push(product.is_featured ? 1 : 0); }
    if (updates.length === 0) return false;
    updates.push('updated_at = CURRENT_TIMESTAMP');
    params.push(id);
    const result = await this.db.prepare(`UPDATE products SET ${updates.join(', ')} WHERE id = ?`).bind(...params).run();
    
    this.invalidateCache('products');
    return result.success;
  }

  async deleteProduct(id: number): Promise<boolean> {
    const result = await this.db.prepare('DELETE FROM products WHERE id = ?').bind(id).run();
    this.invalidateCache('products');
    return result.success;
  }

  async getInquiries(status?: string, page = 1, pageSize = 20): Promise<{ items: Inquiry[]; total: number }> {
    let whereClause = '';
    const params: any[] = [];
    if (status) {
      whereClause = 'WHERE status = ?';
      params.push(status);
    }
    
    const countResult = await this.db.prepare(`SELECT COUNT(*) as total FROM inquiries ${whereClause}`).bind(...params).first() as any;
    const total = countResult?.total || 0;
    const offset = (page - 1) * pageSize;
    
    const result = await this.db.prepare(`
      SELECT * FROM inquiries ${whereClause}
      ORDER BY created_at DESC LIMIT ? OFFSET ?
    `).bind(...params, pageSize, offset).all();
    
    return { items: result.results as any, total };
  }

  async getInquiryById(id: number): Promise<Inquiry | null> {
    const result = await this.db.prepare('SELECT * FROM inquiries WHERE id = ?').bind(id).first();
    return result as any;
  }

  async createInquiry(inquiry: Partial<Inquiry>): Promise<number> {
    const result = await this.db.prepare(`
      INSERT INTO inquiries (product_id, name, email, company, country, message)
      VALUES (?, ?, ?, ?, ?, ?)
    `).bind(
      inquiry.product_id || null,
      inquiry.name,
      inquiry.email,
      inquiry.company || null,
      inquiry.country || null,
      inquiry.message
    ).run();
    
    return result.meta!.last_row_id as number;
  }

  async updateInquiryStatus(id: number, status: string, notes?: string): Promise<boolean> {
    const result = await this.db.prepare(`
      UPDATE inquiries SET status = ?, notes = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?
    `).bind(status, notes || null, id).run();
    return result.success;
  }

  async deleteInquiry(id: number): Promise<boolean> {
    const result = await this.db.prepare('DELETE FROM inquiries WHERE id = ?').bind(id).run();
    return result.success;
  }

  async getTranslations(locale: string): Promise<Record<string, string>> {
    const cacheKey = this.getCacheKey('translations', [locale]);
    const cached = this.getFromCache<Record<string, string>>(cacheKey);
    if (cached) return cached;

    const result = await this.db.prepare('SELECT key, value FROM translations WHERE locale = ?').bind(locale).all();
    const translations: Record<string, string> = {};
    for (const row of result.results as any) {
      translations[row.key] = row.value;
    }
    
    this.setCache(cacheKey, translations, CACHE_CONFIG.translations);
    return translations;
  }

  async getSetting(key: string): Promise<string | null> {
    const cacheKey = this.getCacheKey('setting', [key]);
    const cached = this.getFromCache<string>(cacheKey);
    if (cached) return cached;

    const result: any = await this.db.prepare('SELECT value FROM settings WHERE key = ?').bind(key).first();
    const value = result?.value || null;
    
    if (value !== null) {
      this.setCache(cacheKey, value, CACHE_CONFIG.settings);
    }
    
    return value;
  }

  async getSettings(): Promise<Record<string, string>> {
    const cacheKey = 'settings:all';
    const cached = this.getFromCache<Record<string, string>>(cacheKey);
    if (cached) return cached;

    const result = await this.db.prepare('SELECT key, value FROM settings').all();
    const settings: Record<string, string> = {};
    for (const row of result.results as any) {
      settings[row.key] = row.value || '';
    }
    
    this.setCache(cacheKey, settings, CACHE_CONFIG.settings);
    return settings;
  }

  async updateSetting(key: string, value: string): Promise<boolean> {
    const result = await this.db.prepare(`
      INSERT INTO settings (key, value) VALUES (?, ?)
      ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = CURRENT_TIMESTAMP
    `).bind(key, value).run();
    
    this.invalidateCache('settings');
    return result.success;
  }

  async getAdminByUsername(username: string): Promise<Admin | null> {
    const result = await this.db.prepare('SELECT * FROM admins WHERE username = ?').bind(username).first();
    return result as any;
  }

  async updateAdminLastLogin(id: number): Promise<boolean> {
    const result = await this.db.prepare('UPDATE admins SET last_login = CURRENT_TIMESTAMP WHERE id = ?').bind(id).run();
    return result.success;
  }
}

export function createDatabase(db: D1Database): Database {
  return new Database(db);
}
