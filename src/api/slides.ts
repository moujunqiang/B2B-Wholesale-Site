import { Hono } from 'hono';
import type { Env } from '../types';
import { Database } from '../db';

const slides = new Hono<{ Bindings: Env }>();

slides.get('/', async (c) => {
  try {
    const db = new Database(c.env.DB);
    const slides = await db.getSlides();
    return c.json({ success: true, data: slides });
  } catch (err) {
    return c.json({ success: false, error: 'Failed to get slides' }, 500);
  }
});

slides.post('/', async (c) => {
  try {
    const body = await c.req.json();
    const db = new Database(c.env.DB);
    const id = await db.createSlide(body);
    return c.json({ success: true, data: { id } });
  } catch (err) {
    return c.json({ success: false, error: 'Failed to create slide' }, 500);
  }
});

slides.put('/:id', async (c) => {
  try {
    const id = parseInt(c.req.param('id'));
    const body = await c.req.json();
    const db = new Database(c.env.DB);
    await db.updateSlide(id, body);
    return c.json({ success: true });
  } catch (err) {
    return c.json({ success: false, error: 'Failed to update slide' }, 500);
  }
});

slides.delete('/:id', async (c) => {
  try {
    const id = parseInt(c.req.param('id'));
    const db = new Database(c.env.DB);
    await db.deleteSlide(id);
    return c.json({ success: true });
  } catch (err) {
    return c.json({ success: false, error: 'Failed to delete slide' }, 500);
  }
});

export default slides;
