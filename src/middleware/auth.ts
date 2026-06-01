import { Context } from 'hono';
import type { Env } from '../types';

export async function authMiddleware(c: Context<{ Bindings: Env }>, next: () => Promise<void>) {
  const authHeader = c.req.header('Authorization');
  if (!authHeader || !authHeader.startsWith('Basic ')) {
    console.error('Auth middleware: No authorization header or invalid format');
    return c.json({ success: false, error: 'Unauthorized' }, 401);
  }
  
  const credentials = atob(authHeader.slice(6)).split(':');
  if (credentials.length !== 2) {
    console.error('Auth middleware: Invalid credentials format');
    return c.json({ success: false, error: 'Invalid credentials' }, 401);
  }
  
  const [username, password] = credentials;
  const adminUsername = c.env.ADMIN_USERNAME;
  const adminPassword = c.env.ADMIN_PASSWORD;

  console.log('Auth middleware:', { 
    username, 
    adminUsername: adminUsername || '(not set)', 
    passwordSet: !!adminPassword,
    hasAdminUsername: !!adminUsername,
    hasAdminPassword: !!adminPassword
  });

  if (!adminUsername || !adminPassword) {
    console.error('Auth middleware: Admin credentials not configured in environment');
    return c.json({ success: false, error: 'Admin not configured' }, 500);
  }

  if (username !== adminUsername || password !== adminPassword) {
    console.error('Auth middleware: Invalid credentials - username match:', username === adminUsername);
    return c.json({ success: false, error: 'Invalid credentials' }, 401);
  }

  (c as any).set('admin', { id: 1, username: adminUsername, role: 'admin' });
  await next();
}

export async function optionalAuthMiddleware(c: Context<{ Bindings: Env }>, next: () => Promise<void>) {
  const authHeader = c.req.header('Authorization');
  if (authHeader && authHeader.startsWith('Basic ')) {
    const credentials = atob(authHeader.slice(6)).split(':');
    if (credentials.length === 2) {
      const [username, password] = credentials;
      const adminUsername = c.env.ADMIN_USERNAME;
      const adminPassword = c.env.ADMIN_PASSWORD;
      if (username === adminUsername && password === adminPassword) {
        (c as any).set('admin', { id: 1, username: adminUsername, role: 'admin' });
      }
    }
  }
  await next();
}
