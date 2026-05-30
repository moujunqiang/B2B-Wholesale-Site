import { Hono } from 'hono';
import type { Env } from '../types';
import { Database } from '../db';
import { z } from 'zod';

const inquirySchema = z.object({
  product_id: z.number().optional(),
  name: z.string().min(1),
  email: z.string().email(),
  company: z.string().optional(),
  country: z.string().optional(),
  message: z.string().min(1)
});

const inquiries = new Hono<{ Bindings: Env }>();

inquiries.post('/', async (c) => {
  const body = await c.req.json();
  const parsed = inquirySchema.safeParse(body);
  if (!parsed.success) {
    return c.json({ success: false, error: 'Invalid input', details: parsed.error.errors }, 400);
  }
  const db = new Database(c.env.DB);
  const id = await db.createInquiry(parsed.data);
  return c.json({ success: true, data: { id }, message: 'Inquiry submitted successfully' }, 201);
});

inquiries.get('/', async (c) => {
  const db = new Database(c.env.DB);
  const status = c.req.query('status') || undefined;
  const page = parseInt(c.req.query('page') || '1');
  const pageSize = parseInt(c.req.query('limit') || '20');
  const result = await db.getInquiries(status, page, pageSize);
  return c.json({
    success: true,
    data: {
      items: result.items,
      total: result.total,
      page,
      pageSize,
      totalPages: Math.ceil(result.total / pageSize)
    }
  });
});

inquiries.get('/:id', async (c) => {
  const db = new Database(c.env.DB);
  const id = parseInt(c.req.param('id'));
  const inquiry = await db.getInquiryById(id);
  if (!inquiry) {
    return c.json({ success: false, error: 'Inquiry not found' }, 404);
  }
  return c.json({ success: true, data: inquiry });
});

inquiries.patch('/:id/status', async (c) => {
  const db = new Database(c.env.DB);
  const id = parseInt(c.req.param('id'));
  const { status, notes } = await c.req.json();
  if (!['pending', 'replied', 'completed', 'archived'].includes(status)) {
    return c.json({ success: false, error: 'Invalid status' }, 400);
  }
  const updated = await db.updateInquiryStatus(id, status, notes);
  if (!updated) {
    return c.json({ success: false, error: 'Failed to update' }, 500);
  }
  return c.json({ success: true, message: 'Status updated' });
});

inquiries.delete('/:id', async (c) => {
  const db = new Database(c.env.DB);
  const id = parseInt(c.req.param('id'));
  const deleted = await db.deleteInquiry(id);
  if (!deleted) {
    return c.json({ success: false, error: 'Failed to delete' }, 500);
  }
  return c.json({ success: true, message: 'Deleted successfully' });
});

export default inquiries;