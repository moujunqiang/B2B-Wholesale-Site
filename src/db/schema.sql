-- B2B Wholesale Site Database Schema

-- 产品分类表
CREATE TABLE IF NOT EXISTS categories (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  parent_id INTEGER,
  sort_order INTEGER DEFAULT 0,
  is_active INTEGER DEFAULT 1,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (parent_id) REFERENCES categories(id) ON DELETE SET NULL
);

-- 产品表
CREATE TABLE IF NOT EXISTS products (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  category_id INTEGER,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  short_description TEXT,
  price REAL,
  min_order_qty INTEGER DEFAULT 1,
  images TEXT,
  specifications TEXT,
  is_active INTEGER DEFAULT 1,
  is_featured INTEGER DEFAULT 0,
  view_count INTEGER DEFAULT 0,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL
);

-- 询盘表
CREATE TABLE IF NOT EXISTS inquiries (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  product_id INTEGER,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  company TEXT,
  country TEXT,
  message TEXT NOT NULL,
  status TEXT DEFAULT 'pending',
  notes TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE SET NULL
);

-- 多语言翻译表
CREATE TABLE IF NOT EXISTS translations (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  locale TEXT NOT NULL,
  key TEXT NOT NULL,
  value TEXT NOT NULL,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(locale, key)
);

-- 网站设置表
CREATE TABLE IF NOT EXISTS settings (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  key TEXT NOT NULL UNIQUE,
  value TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- 管理员表
CREATE TABLE IF NOT EXISTS admins (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  email TEXT,
  role TEXT DEFAULT 'admin',
  last_login TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- 初始化默认数据
INSERT INTO categories (name, slug, description, sort_order) VALUES
  ('Electronics', 'electronics', 'Electronic products and components', 1),
  ('Machinery', 'machinery', 'Industrial machinery and equipment', 2),
  ('Textiles', 'textiles', 'Fabric and textile products', 3),
  ('Tools', 'tools', 'Hand tools and power tools', 4),
  ('Packaging', 'packaging', 'Packaging materials and solutions', 5);

INSERT INTO settings (key, value) VALUES
  ('site_name', 'B2B Wholesale'),
  ('site_description', 'Your trusted B2B wholesale platform'),
  ('contact_email', 'info@example.com'),
  ('default_locale', 'en'),
  ('currency', 'USD'),
  ('email_notifications_enabled', 'true'),
  ('admin_email', 'admin@example.com');

INSERT INTO translations (locale, key, value) VALUES
  ('en', 'home', 'Home'),
  ('en', 'products', 'Products'),
  ('en', 'categories', 'Categories'),
  ('en', 'contact', 'Contact'),
  ('en', 'inquiry', 'Send Inquiry'),
  ('en', 'submit', 'Submit'),
  ('zh', 'home', '首页'),
  ('zh', 'products', '产品'),
  ('zh', 'categories', '分类'),
  ('zh', 'contact', '联系我们'),
  ('zh', 'inquiry', '发送询盘'),
  ('zh', 'submit', '提交');

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_slug ON products(slug);
CREATE INDEX IF NOT EXISTS idx_inquiries_product ON inquiries(product_id);
CREATE INDEX IF NOT EXISTS idx_inquiries_status ON inquiries(status);
CREATE INDEX IF NOT EXISTS idx_translations_locale ON translations(locale);