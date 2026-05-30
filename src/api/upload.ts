import { Hono } from 'hono';
import type { Env } from '../types';
import { authMiddleware } from '../middleware/auth';

const upload = new Hono<{ Bindings: Env }>();

upload.use('/*', authMiddleware);

upload.post('/image', async (c) => {
  try {
    const formData = await c.req.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return c.json({ success: false, error: 'No file provided' }, 400);
    }

    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      return c.json({
        success: false,
        error: 'Invalid file type. Allowed: JPEG, PNG, GIF, WebP'
      }, 400);
    }

    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      return c.json({
        success: false,
        error: 'File too large. Max size: 5MB'
      }, 400);
    }

    const arrayBuffer = await file.arrayBuffer();
    const timestamp = Date.now();
    const randomStr = Math.random().toString(36).substring(2, 8);
    const extension = file.name.split('.').pop() || 'jpg';
    const key = `products/${timestamp}-${randomStr}.${extension}`;

    await c.env.R2_BUCKET.put(key, arrayBuffer, {
      httpMetadata: {
        contentType: file.type,
      },
    });

    const bucketName = 'b2b-wholesale-media';
    const imageUrl = `https://${bucketName}.r2.cloudflarestorage.com/${key}`;

    return c.json({
      success: true,
      data: {
        url: imageUrl,
        key,
        size: file.size,
        type: file.type,
      },
    });
  } catch (err) {
    console.error('Upload error:', err);
    return c.json({
      success: false,
      error: 'Failed to upload image'
    }, 500);
  }
});

upload.delete('/image', async (c) => {
  try {
    const body = await c.req.json();
    const { key } = body;

    if (!key) {
      return c.json({ success: false, error: 'Key required' }, 400);
    }

    await c.env.R2_BUCKET.delete(key);

    return c.json({
      success: true,
      message: 'Image deleted successfully',
    });
  } catch (err) {
    console.error('Delete error:', err);
    return c.json({ 
      success: false, 
      error: 'Failed to delete image' 
    }, 500);
  }
});

upload.get('/image/:key', async (c) => {
  try {
    const key = c.req.param('key');
    const object = await c.env.R2_BUCKET.get(key);

    if (!object) {
      return c.json({ success: false, error: 'Image not found' }, 404);
    }

    const headers = new Headers();
    object.writeHttpMetadata(headers);
    headers.set('Cache-Control', 'public, max-age=31536000');
    headers.set('Access-Control-Allow-Origin', '*');

    return new Response(object.body, {
      headers,
    });
  } catch (err) {
    console.error('Get image error:', err);
    return c.json({ 
      success: false, 
      error: 'Failed to get image' 
    }, 500);
  }
});

export default upload;
