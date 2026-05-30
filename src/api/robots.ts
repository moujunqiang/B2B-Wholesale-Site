import { Hono } from 'hono';
import type { Env } from '../types';
import { Database } from '../db';

const robots = new Hono<{ Bindings: Env }>();

robots.get('/', async (c) => {
  try {
    const db = new Database(c.env.DB);
    const configs = await db.getRobotsConfigs();
    return c.json({ success: true, data: configs });
  } catch (err) {
    return c.json({ success: false, error: 'Failed to get robots configs' }, 500);
  }
});

robots.post('/', async (c) => {
  try {
    const body = await c.req.json();
    const db = new Database(c.env.DB);
    const id = await db.createRobotsConfig(body);
    return c.json({ success: true, data: { id } });
  } catch (err) {
    return c.json({ success: false, error: 'Failed to create robots config' }, 500);
  }
});

robots.put('/:id', async (c) => {
  try {
    const id = parseInt(c.req.param('id'));
    const body = await c.req.json();
    const db = new Database(c.env.DB);
    await db.updateRobotsConfig(id, body);
    return c.json({ success: true });
  } catch (err) {
    return c.json({ success: false, error: 'Failed to update robots config' }, 500);
  }
});

robots.delete('/:id', async (c) => {
  try {
    const id = parseInt(c.req.param('id'));
    const db = new Database(c.env.DB);
    await db.deleteRobotsConfig(id);
    return c.json({ success: true });
  } catch (err) {
    return c.json({ success: false, error: 'Failed to delete robots config' }, 500);
  }
});

export default robots;
