import { Hono } from 'hono';
import type { Env } from '../types';
import { Database } from '../db';

const settings = new Hono<{ Bindings: Env }>();

settings.get('/', async (c) => {
  const db = new Database(c.env.DB);
  const settings = await db.getSettings();
  return c.json({ success: true, data: settings });
});

settings.get('/:key', async (c) => {
  const db = new Database(c.env.DB);
  const key = c.req.param('key');
  const value = await db.getSetting(key);
  return c.json({ success: true, data: { key, value } });
});

settings.put('/:key', async (c) => {
  const db = new Database(c.env.DB);
  const key = c.req.param('key');
  const { value } = await c.req.json();
  await db.updateSetting(key, value);
  return c.json({ success: true, message: 'Setting updated' });
});

export default settings;