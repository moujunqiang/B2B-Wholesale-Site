import { Context } from 'hono';
import type { Env } from '../types';
import { Database } from '../db';
import { verifyPassword } from '../utils/auth';

export async function authMiddleware(c: Context<{ Bindings: Env }>, next: () => Promise<void>) {
  const authHeader = c.req.header('Authorization');
  if (!authHeader || !authHeader.startsWith('Basic ')) {
    return c.json({ success: false, error: 'Unauthorized' }, 401);
  }
  const credentials = atob(authHeader.slice(6)).split(':');
  if (credentials.length !== 2) {
    return c.json({ success: false, error: 'Invalid credentials' }, 401);
  }
  const [username, password] = credentials;
  
  const db = new Database(c.env.DB);
  const admin = await db.getAdminByUsername(username);
  
  if (!admin) {
    return c.json({ success: false, error: 'Invalid credentials' }, 401);
  }
  
  const valid = await verifyPassword(password, admin.password_hash);
  if (!valid) {
    return c.json({ success: false, error: 'Invalid credentials' }, 401);
  }
  
  (c as any).set('admin', admin);
  await next();
}

export async function optionalAuthMiddleware(c: Context<{ Bindings: Env }>, next: () => Promise<void>) {
  const authHeader = c.req.header('Authorization');
  if (authHeader && authHeader.startsWith('Basic ')) {
    const credentials = atob(authHeader.slice(6)).split(':');
    if (credentials.length === 2) {
      const [username, password] = credentials;
      const db = new Database(c.env.DB);
      const admin = await db.getAdminByUsername(username);
      if (admin) {
        const valid = await verifyPassword(password, admin.password_hash);
        if (valid) {
          (c as any).set('admin', admin);
        }
      }
    }
  }
  await next();
}
