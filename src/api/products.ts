import { Hono } from 'hono';
import type { Env } from '../types';
import { Database } from '../db';

const products = new Hono<{ Bindings: Env }>();

products.get('/', async (c) => {
  const db = new Database(c.env.DB);
  const categoryId = c.req.query('category');
  const page = parseInt(c.req.query('page') || '1');
  const pageSize = parseInt(c.req.query('limit') || '12');
  
  const result = await db.getProducts(
    categoryId ? parseInt(categoryId) : undefined,
    page,
    pageSize
  );
  
  const items = result.items.map((p: any) => ({
    ...p,
    images: p.images ? JSON.parse(p.images) : []
  }));
  
  return c.json({
    success: true,
    data: {
      items,
      total: result.total,
      page,
      pageSize,
      totalPages: Math.ceil(result.total / pageSize)
    }
  });
});

products.get('/featured', async (c) => {
  const db = new Database(c.env.DB);
  const limit = parseInt(c.req.query('limit') || '6');
  const featuredProducts = await db.getFeaturedProducts(limit);
  
  return c.json({
    success: true,
    data: featuredProducts.map((p: any) => ({
      ...p,
      images: p.images ? JSON.parse(p.images) : []
    }))
  });
});

products.get('/:slug', async (c) => {
  const db = new Database(c.env.DB);
  const slug = c.req.param('slug');
  
  const product = await db.getProductBySlug(slug);
  if (!product) {
    return c.json({ success: false, error: 'Product not found' }, 404);
  }
  
  const category = product.category_id 
    ? await db.getCategoryById(product.category_id) 
    : null;
  
  return c.json({
    success: true,
    data: {
      ...product,
      images: product.images ? JSON.parse(product.images) : [],
      specifications: product.specifications ? JSON.parse(product.specifications) : {},
      category
    }
  });
});

export default products;