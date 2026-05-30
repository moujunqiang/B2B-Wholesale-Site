import { Hono } from 'hono';
import type { Env } from '../types';
import { Database } from '../db';

const translations = new Hono<{ Bindings: Env }>();

translations.get('/:locale', async (c) => {
  const db = new Database(c.env.DB);
  const locale = c.req.param('locale');
  const translations = await db.getTranslations(locale);
  return c.json({ success: true, data: translations });
});

export default translations;