import { Hono } from 'hono';
import type { Env } from '../types';
import { Database } from '../db';

const jsonLd = new Hono<{ Bindings: Env }>();

jsonLd.get('/', async (c) => {
  try {
    const db = new Database(c.env.DB);
    const configs = await db.getJsonLdConfigs();
    return c.json({ success: true, data: configs });
  } catch (err) {
    return c.json({ success: false, error: 'Failed to get JSON-LD configs' }, 500);
  }
});

jsonLd.post('/', async (c) => {
  try {
    const body = await c.req.json();
    const db = new Database(c.env.DB);
    const id = await db.createJsonLdConfig(body);
    return c.json({ success: true, data: { id } });
  } catch (err) {
    return c.json({ success: false, error: 'Failed to create JSON-LD config' }, 500);
  }
});

jsonLd.put('/:id', async (c) => {
  try {
    const id = parseInt(c.req.param('id'));
    const body = await c.req.json();
    const db = new Database(c.env.DB);
    await db.updateJsonLdConfig(id, body);
    return c.json({ success: true });
  } catch (err) {
    return c.json({ success: false, error: 'Failed to update JSON-LD config' }, 500);
  }
});

jsonLd.delete('/:id', async (c) => {
  try {
    const id = parseInt(c.req.param('id'));
    const db = new Database(c.env.DB);
    await db.deleteJsonLdConfig(id);
    return c.json({ success: true });
  } catch (err) {
    return c.json({ success: false, error: 'Failed to delete JSON-LD config' }, 500);
  }
});

export default jsonLd;
