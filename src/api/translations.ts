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

translations.get('/config', async (c) => {
  try {
    const db = new Database(c.env.DB);
    const config = await db.getTranslationConfig();
    
    return c.json({
      success: true,
      data: config,
    });
  } catch (err) {
    console.error('Get translation config error:', err);
    return c.json({ success: false, error: 'Failed to get translation config' }, 500);
  }
});

translations.post('/config', async (c) => {
  try {
    const body = await c.req.json();
    const db = new Database(c.env.DB);
    
    const result = await db.updateTranslationConfig({
      api_url: body.api_url,
      api_token: body.api_token,
      enabled_languages: JSON.stringify(body.enabled_languages || []),
      is_enabled: body.is_enabled !== undefined ? (body.is_enabled ? 1 : 0) : undefined,
    });
    
    if (result) {
      return c.json({ success: true, message: 'Translation config updated' });
    } else {
      return c.json({ success: false, error: 'Failed to update translation config' }, 500);
    }
  } catch (err) {
    console.error('Update translation config error:', err);
    return c.json({ success: false, error: 'Failed to update translation config' }, 500);
  }
});

translations.post('/translate', async (c) => {
  try {
    const body = await c.req.json();
    const { text, target_locale, source_locale = 'zh' } = body;
    
    if (!text || !target_locale) {
      return c.json({ success: false, error: 'Missing required parameters' }, 400);
    }
    
    const db = new Database(c.env.DB);
    const config = await db.getTranslationConfig();
    
    if (!config || !config.is_enabled || !config.api_url) {
      return c.json({ success: false, error: 'Translation API not configured' }, 400);
    }
    
    try {
      const response = await fetch(config.api_url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(config.api_token ? { 'Authorization': `Bearer ${config.api_token}` } : {}),
        },
        body: JSON.stringify({
          text,
          source_lang: source_locale,
          target_lang: target_locale,
        }),
      });
      
      if (!response.ok) {
        throw new Error(`API response status: ${response.status}`);
      }
      
      const result = await response.json() as any;
      return c.json({
        success: true,
        data: {
          translated_text: result.translated_text || result.translation || result.data,
          source_locale,
          target_locale,
        },
      });
    } catch (fetchError) {
      console.error('Translation API call error:', fetchError);
      return c.json({ 
        success: false, 
        error: '翻译 API 接口错误，请联系管理员配置正确的参数',
        detail: fetchError instanceof Error ? fetchError.message : 'Unknown error',
      }, 500);
    }
  } catch (err) {
    console.error('Translate error:', err);
    return c.json({ success: false, error: 'Failed to translate' }, 500);
  }
});

export default translations;