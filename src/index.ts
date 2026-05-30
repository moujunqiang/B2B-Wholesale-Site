import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import { prettyJSON } from 'hono/pretty-json';
import type { Env } from './types';
import products from './api/products';
import categories from './api/categories';
import inquiries from './api/inquiries';
import settings from './api/settings';
import translations from './api/translations';
import admin from './api/admin';
import { authMiddleware } from './middleware/auth';

const app = new Hono<{ Bindings: Env }>();

app.use('*', logger());
app.use('*', prettyJSON());
app.use('/api/*', cors());

app.use('/api/admin/*', authMiddleware);

app.get('/', (c) => {
  return c.html(`
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>B2B Wholesale Site</title>
  <link rel="stylesheet" href="/css/styles.css">
</head>
<body>
  <header class="header">
    <nav class="nav container">
      <a href="/" class="logo">B2B Wholesale</a>
      <ul class="nav-links">
        <li><a href="/#products">Products</a></li>
        <li><a href="/#categories">Categories</a></li>
        <li><a href="/#contact">Contact</a></li>
      </ul>
    </nav>
  </header>

  <main>
    <section class="hero">
      <div class="container">
        <h1>Your Trusted B2B Wholesale Partner</h1>
        <p>Quality products at competitive prices</p>
        <a href="/#products" class="btn">Browse Products</a>
      </div>
    </section>

    <section id="products" class="section">
      <div class="container">
        <h2>Featured Products</h2>
        <div id="product-list" class="product-grid"></div>
      </div>
    </section>

    <section id="categories" class="section bg-light">
      <div class="container">
        <h2>Categories</h2>
        <div id="category-list" class="category-grid"></div>
      </div>
    </section>

    <section id="contact" class="section">
      <div class="container">
        <h2>Send Inquiry</h2>
        <form id="inquiry-form" class="inquiry-form">
          <div class="form-group">
            <label for="name">Name *</label>
            <input type="text" id="name" name="name" required>
          </div>
          <div class="form-group">
            <label for="email">Email *</label>
            <input type="email" id="email" name="email" required>
          </div>
          <div class="form-group">
            <label for="company">Company</label>
            <input type="text" id="company" name="company">
          </div>
          <div class="form-group">
            <label for="country">Country</label>
            <input type="text" id="country" name="country">
          </div>
          <div class="form-group">
            <label for="message">Message *</label>
            <textarea id="message" name="message" rows="5" required></textarea>
          </div>
          <button type="submit" class="btn">Submit Inquiry</button>
        </form>
      </div>
    </section>
  </main>

  <footer class="footer">
    <div class="container">
      <p>&copy; 2026 B2B Wholesale. All rights reserved.</p>
    </div>
  </footer>

  <script src="/js/main.js"></script>
</body>
</html>
  `);
});

app.route('/api/products', products);
app.route('/api/categories', categories);
app.route('/api/inquiries', inquiries);
app.route('/api/settings', settings);
app.route('/api/translations', translations);
app.route('/api/admin', admin);

app.get('/admin/*', async (c) => {
  return c.html(`
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Admin Panel - B2B Wholesale</title>
  <link rel="stylesheet" href="/css/admin.css">
</head>
<body>
  <div id="app">
    <div id="login-view" class="login-container">
      <div class="login-box">
        <h1>Admin Login</h1>
        <form id="login-form">
          <div class="form-group">
            <label for="username">Username</label>
            <input type="text" id="username" name="username" required>
          </div>
          <div class="form-group">
            <label for="password">Password</label>
            <input type="password" id="password" name="password" required>
          </div>
          <button type="submit" class="btn">Login</button>
        </form>
        <div id="login-error" class="error-message"></div>
      </div>
    </div>

    <div id="admin-view" class="admin-layout" style="display: none;">
      <aside class="sidebar">
        <h2>Admin Panel</h2>
        <nav class="admin-nav">
          <a href="#dashboard" class="nav-item active">Dashboard</a>
          <a href="#products" class="nav-item">Products</a>
          <a href="#categories" class="nav-item">Categories</a>
          <a href="#inquiries" class="nav-item">Inquiries</a>
          <a href="#settings" class="nav-item">Settings</a>
        </nav>
      </aside>

      <main class="main-content">
        <header class="admin-header">
          <h1 id="page-title">Dashboard</h1>
          <button id="logout-btn" class="btn btn-outline">Logout</button>
        </header>

        <div id="dashboard-page" class="page active">
          <div class="stats-grid">
            <div class="stat-card">
              <h3>Total Products</h3>
              <p id="stat-products">-</p>
            </div>
            <div class="stat-card">
              <h3>Total Inquiries</h3>
              <p id="stat-inquiries">-</p>
            </div>
            <div class="stat-card">
              <h3>Pending Inquiries</h3>
              <p id="stat-pending">-</p>
            </div>
          </div>
        </div>

        <div id="products-page" class="page">
          <div class="page-header">
            <h2>Products</h2>
            <button id="add-product-btn" class="btn">Add Product</button>
          </div>
          <div id="product-table"></div>
        </div>

        <div id="categories-page" class="page">
          <div class="page-header">
            <h2>Categories</h2>
            <button id="add-category-btn" class="btn">Add Category</button>
          </div>
          <div id="category-table"></div>
        </div>

        <div id="inquiries-page" class="page">
          <div class="page-header">
            <h2>Inquiries</h2>
          </div>
          <div id="inquiry-table"></div>
        </div>

        <div id="settings-page" class="page">
          <h2>Settings</h2>
          <form id="settings-form"></form>
        </div>
      </main>
    </div>
  </div>

  <script src="/js/admin.js"></script>
</body>
</html>
  `);
});

app.notFound((c) => {
  return c.json({ success: false, error: 'Not Found' }, 404);
});

app.onError((err, c) => {
  console.error(err);
  return c.json({ success: false, error: err.message }, 500);
});

export default app;
