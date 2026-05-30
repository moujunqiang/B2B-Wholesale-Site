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
import upload from './api/upload';
import pages from './api/pages';
import solutions from './api/solutions';
import cases from './api/cases';
import news from './api/news';
import leads from './api/leads';
import slides from './api/slides';
import jsonLd from './api/jsonld';
import robots from './api/robots';
import { authMiddleware } from './middleware/auth';
import { Database } from './db';

const app = new Hono<{ Bindings: Env }>();

app.use('*', logger());
app.use('*', prettyJSON());
app.use('/api/*', cors());

app.use('/api/admin/*', authMiddleware);
app.use('/api/upload/*', authMiddleware);

function getSocialIcon(platform: string): string {
  const icons: { [key: string]: string } = {
    'facebook': 'fa-facebook',
    'tiktok': 'fa-tiktok',
    'x': 'fa-x-twitter',
    'youtube': 'fa-youtube',
    'instagram': 'fa-instagram',
    'linkedin': 'fa-linkedin',
  };
  return icons[platform] || 'fa-link';
}

function getContactIcon(type: string): string {
  const icons: { [key: string]: string } = {
    'email': 'fa-envelope',
    'phone': 'fa-phone',
    'whatsapp': 'fa-whatsapp',
  };
  return icons[type] || 'fa-circle';
}

app.get('/', async (c) => {
  const db = new Database(c.env.DB);
  const settingsData = await db.getSettings();
  const siteName = settingsData.site_name || 'B2B Wholesale';
  const siteDescription = settingsData.site_description || 'Your trusted B2B wholesale platform';
  const siteTitle = settingsData.site_title || `${siteName} - Quality Products at Wholesale Prices`;
  const siteKeywords = settingsData.site_keywords || 'B2B, wholesale, bulk order, manufacturer, supplier';
  const logoUrl = settingsData.logo_url || '';
  
  const socialLinks = await db.getSocialLinks();
  const contactInfo = await db.getContactInfo();
  const slidesData = await db.getSlides();
  
  // Generate JSON-LD scripts
  const jsonLdConfigs = await db.getJsonLdConfigs();
  const jsonLdScript = jsonLdConfigs.map(config => {
    try {
      let ldData: any = { "@context": "https://schema.org" };
      if (config.extra_data) {
        const extra = JSON.parse(config.extra_data);
        ldData = { ...ldData, ...extra };
      }
      if (config.name) ldData.name = config.name;
      if (config.description) ldData.description = config.description;
      if (config.url) ldData.url = config.url;
      if (config.logo) ldData.logo = { url: config.logo };
      return `<script type="application/ld+json">${JSON.stringify(ldData)}</script>`;
    } catch (e) {
      return '';
    }
  }).join('\n');
  
  return c.html(`
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="description" content="${siteDescription}">
  <meta name="keywords" content="${siteKeywords}">
  <meta name="author" content="${siteName}">
  <meta name="robots" content="index, follow">
  <meta property="og:title" content="${siteTitle}">
  <meta property="og:description" content="${siteDescription}">
  <meta property="og:type" content="website">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${siteTitle}">
  <meta name="twitter:description" content="${siteDescription}">
  <link rel="canonical" href="https://b2bwholesale.com/">
  ${logoUrl ? `<link rel="icon" href="${logoUrl}">` : ''}
  <title>${siteTitle}</title>
  <link rel="stylesheet" href="/css/styles.css">
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
  ${jsonLdScript}
</head>
<body>
  <div class="top-bar">
    <div class="container">
      <div class="top-bar-left">
        ${contactInfo.filter(i => i.type === 'email').map(i => `<a href="mailto:${i.value}"><i class="fas fa-envelope"></i> ${i.value}</a>`).join('')}
        ${contactInfo.filter(i => i.type === 'phone').map(i => `<a href="tel:${i.value}"><i class="fas fa-phone"></i> ${i.value}</a>`).join('')}
      </div>
      <div class="top-bar-right">
        ${socialLinks.map(s => `<a href="${s.url}" target="_blank" rel="noopener"><i class="fab ${getSocialIcon(s.platform)}"></i> ${s.name}</a>`).join('')}
      </div>
    </div>
  </div>

  <header class="header">
    <nav class="nav container">
      ${logoUrl ? `<a href="/" class="logo"><img src="${logoUrl}" alt="${siteName}"></a>` : `<a href="/" class="logo">${siteName}</a>`}
      <ul class="nav-links">
        <li><a href="/">Home</a></li>
        <li><a href="/products">Products</a></li>
        <li><a href="/solutions">Solutions</a></li>
        <li><a href="/cases">Cases</a></li>
        <li><a href="/news">Blogs</a></li>
        <li><a href="/about">About Us</a></li>
        <li><a href="/contact">Contact Us</a></li>
        <li><a href="#" class="btn btn-quote" onclick="showPopup(); return false;">Get a Quote</a></li>
      </ul>
    </nav>
  </header>

  <main>
    ${slidesData.length > 0 ? `
    <div class="slider-container">
      <div class="slider">
        ${slidesData.map((slide: any, index: number) => `
          <div class="slide ${index === 0 ? 'active' : ''}" ${slide.link_url ? `data-link="${slide.link_url}"` : ''}>
            <div class="slide-bg" style="background-image: url('${slide.image_url || '/images/placeholder.jpg'}');"></div>
            <div class="slide-content container">
              <h1>${slide.title}</h1>
              ${slide.subtitle ? `<h2>${slide.subtitle}</h2>` : ''}
              ${slide.description ? `<p>${slide.description}</p>` : ''}
              ${slide.link_url ? `<a href="${slide.link_url}" class="btn btn-primary">${slide.link_text || 'Learn More'}</a>` : ''}
            </div>
          </div>
        `).join('')}
      </div>
      <button class="slider-btn prev" onclick="slidePrev()">&#10094;</button>
      <button class="slider-btn next" onclick="slideNext()">&#10095;</button>
      <div class="slider-dots">
        ${slidesData.map((_: any, index: number) => `<span class="dot ${index === 0 ? 'active' : ''}" onclick="goToSlide(${index})"></span>`).join('')}
      </div>
    </div>
    ` : `
    <section class="hero">
      <div class="container">
        <h1>Your Trusted B2B Wholesale Partner</h1>
        <p>${siteDescription}</p>
        <a href="/products" class="btn btn-primary">Browse Products</a>
        <a href="/contact" class="btn btn-outline">Contact Us</a>
      </div>
    </section>
    `}

    <section id="products" class="section">
      <div class="container">
        <h2>Featured Products</h2>
        <div id="product-list" class="product-grid"></div>
        <div class="text-center" style="margin-top: 2rem;">
          <a href="/products" class="btn">View All Products</a>
        </div>
      </div>
    </section>

    <section id="solutions" class="section bg-light">
      <div class="container">
        <h2>Application Solutions</h2>
        <div id="solution-list" class="solution-grid"></div>
        <div class="text-center" style="margin-top: 2rem;">
          <a href="/solutions" class="btn">View All Solutions</a>
        </div>
      </div>
    </section>

    <section id="cases" class="section">
      <div class="container">
        <h2>Customer Cases</h2>
        <div id="case-list" class="case-grid"></div>
        <div class="text-center" style="margin-top: 2rem;">
          <a href="/cases" class="btn">View All Cases</a>
        </div>
      </div>
    </section>

    <section id="contact" class="section bg-light">
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
            <label for="message">Message *</label>
            <textarea id="message" name="message" rows="5" required></textarea>
          </div>
          <button type="submit" class="btn btn-primary">Submit Inquiry</button>
        </form>
      </div>
    </section>
  </main>

  <footer class="footer">
    <div class="container">
      <div class="footer-content">
        <div class="footer-section">
          <h3>${siteName}</h3>
          <p>${siteDescription}</p>
        </div>
        <div class="footer-section">
          <h4>Quick Links</h4>
          <ul>
            <li><a href="/products">Products</a></li>
            <li><a href="/solutions">Solutions</a></li>
            <li><a href="/cases">Cases</a></li>
            <li><a href="/news">Blogs</a></li>
          </ul>
        </div>
        <div class="footer-section">
          <h4>Contact</h4>
          ${contactInfo.map(i => `<p><i class="fas ${getContactIcon(i.type)}"></i> ${i.value}</p>`).join('')}
        </div>
        <div class="footer-section">
          <h4>Follow Us</h4>
          <div class="social-links">
            ${socialLinks.map(s => `<a href="${s.url}" target="_blank"><i class="fab ${getSocialIcon(s.platform)}"></i></a>`).join('')}
          </div>
        </div>
      </div>
      <div class="footer-bottom">
        <p>&copy; ${new Date().getFullYear()} ${siteName}. All rights reserved.</p>
      </div>
    </div>
  </footer>

  <div class="floating-icons">
    ${contactInfo.filter(i => i.type === 'email').map(i => `<a href="mailto:${i.value}" class="float-icon" title="Email"><i class="fas fa-envelope"></i></a>`).join('')}
    ${contactInfo.filter(i => i.type === 'whatsapp').map(i => `<a href="https://wa.me/${i.value.replace(/[^0-9]/g, '')}" class="float-icon" title="WhatsApp"><i class="fab fa-whatsapp"></i></a>`).join('')}
    ${contactInfo.filter(i => i.type === 'phone').map(i => `<a href="tel:${i.value}" class="float-icon" title="Phone"><i class="fas fa-phone"></i></a>`).join('')}
    <a href="#" class="float-icon" id="back-to-top" title="Back to Top"><i class="fas fa-arrow-up"></i></a>
  </div>

  <div id="inquiry-popup" class="popup-overlay" style="display: none;">
    <div class="popup-content">
      <button class="popup-close" onclick="closePopup()">&times;</button>
      <h2 id="popup-title">Get a Quick Quote</h2>
      <p id="popup-description">Fill out the form below and we will get back to you within 24 hours.</p>
      <form id="popup-form">
        <div class="form-group">
          <label for="popup-name">Name *</label>
          <input type="text" id="popup-name" name="name" required>
        </div>
        <div class="form-group">
          <label for="popup-phone">Phone</label>
          <input type="tel" id="popup-phone" name="phone">
        </div>
        <div class="form-group">
          <label for="popup-whatsapp">WhatsApp</label>
          <input type="tel" id="popup-whatsapp" name="whatsapp">
        </div>
        <div class="form-group">
          <label for="popup-message">Message *</label>
          <textarea id="popup-message" name="message" rows="4" required></textarea>
        </div>
        <button type="submit" class="btn btn-primary btn-block">Submit</button>
      </form>
    </div>
  </div>

  <script>
    window.popupSettings = ${JSON.stringify(await db.getPopupSettings() || {})};
  </script>
  <script src="/js/main.js"></script>
</body>
</html>
  `);
});

app.get('/sitemap.xml', async (c) => {
  const db = new Database(c.env.DB);
  const products = await db.getProducts(undefined, 1, 1000);
  const categories = await db.getCategories();
  const solutions = await db.getSolutions();
  const cases = await db.getCases();
  const news = await db.getNews(undefined, 1, 1000);
  const pages = await db.getPages();
  
  const baseUrl = 'https://b2bwholesale.com';
  
  let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
  xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';
  xml += '  <url>\n    <loc>https://b2bwholesale.com/</loc>\n    <lastmod>2026-01-01</lastmod>\n    <changefreq>daily</changefreq>\n    <priority>1.0</priority>\n  </url>\n';
  xml += '  <url>\n    <loc>https://b2bwholesale.com/products</loc>\n    <priority>0.9</priority>\n  </url>\n';
  xml += '  <url>\n    <loc>https://b2bwholesale.com/solutions</loc>\n    <priority>0.8</priority>\n  </url>\n';
  xml += '  <url>\n    <loc>https://b2bwholesale.com/cases</loc>\n    <priority>0.8</priority>\n  </url>\n';
  xml += '  <url>\n    <loc>https://b2bwholesale.com/news</loc>\n    <priority>0.8</priority>\n  </url>\n';
  xml += '  <url>\n    <loc>https://b2bwholesale.com/about</loc>\n    <priority>0.8</priority>\n  </url>\n';
  xml += '  <url>\n    <loc>https://b2bwholesale.com/contact</loc>\n    <priority>0.8</priority>\n  </url>\n';
  
  for (const category of categories) {
    xml += `  <url>\n    <loc>${baseUrl}/category/${category.slug}</loc>\n    <lastmod>${category.updated_at}</lastmod>\n    <priority>0.7</priority>\n  </url>\n`;
  }
  for (const product of products.items) {
    xml += `  <url>\n    <loc>${baseUrl}/product/${product.slug}</loc>\n    <lastmod>${product.updated_at}</lastmod>\n    <priority>0.6</priority>\n  </url>\n`;
  }
  for (const solution of solutions) {
    xml += `  <url>\n    <loc>${baseUrl}/solution/${solution.slug}</loc>\n    <lastmod>${solution.updated_at}</lastmod>\n    <priority>0.6</priority>\n  </url>\n`;
  }
  for (const item of cases) {
    xml += `  <url>\n    <loc>${baseUrl}/case/${item.slug}</loc>\n    <lastmod>${item.updated_at}</lastmod>\n    <priority>0.6</priority>\n  </url>\n`;
  }
  for (const item of news.items) {
    xml += `  <url>\n    <loc>${baseUrl}/news/${item.slug}</loc>\n    <lastmod>${item.updated_at}</lastmod>\n    <priority>0.6</priority>\n  </url>\n`;
  }
  for (const page of pages) {
    xml += `  <url>\n    <loc>${baseUrl}/${page.slug}</loc>\n    <lastmod>${page.updated_at}</lastmod>\n    <priority>0.5</priority>\n  </url>\n`;
  }
  xml += '</urlset>';
  
  return new Response(xml, {
    headers: { 'Content-Type': 'application/xml', 'Cache-Control': 'public, max-age=3600' },
  });
});

app.get('/robots.txt', async (c) => {
  const db = new Database(c.env.DB);
  const content = await db.generateRobotsTxt();
  return new Response(content, {
    headers: { 'Content-Type': 'text/plain', 'Cache-Control': 'public, max-age=3600' },
  });
});

app.get('/LLMs.txt', async (c) => {
  const db = new Database(c.env.DB);
  const content = await db.generateLLMsTxt();
  return new Response(content, {
    headers: { 'Content-Type': 'text/plain', 'Cache-Control': 'public, max-age=3600' },
  });
});

app.route('/api/products', products);
app.route('/api/categories', categories);
app.route('/api/inquiries', inquiries);
app.route('/api/settings', settings);
app.route('/api/translations', translations);
app.route('/api/admin', admin);
app.route('/api/upload', upload);
app.route('/api/pages', pages);
app.route('/api/solutions', solutions);
app.route('/api/cases', cases);
app.route('/api/news', news);
app.route('/api/leads', leads);
app.route('/api/slides', slides);
app.route('/api/jsonld', jsonLd);
app.route('/api/robots', robots);

app.get('/admin/*', async (c) => {
  return c.html(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="robots" content="noindex, nofollow">
  <title>Admin Panel - B2B Wholesale</title>
  <link rel="stylesheet" href="/css/admin.css">
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
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
          <a href="#dashboard" class="nav-item active"><i class="fas fa-tachometer-alt"></i> Dashboard</a>
          <a href="#products" class="nav-item"><i class="fas fa-box"></i> Products</a>
          <a href="#categories" class="nav-item"><i class="fas fa-tags"></i> Categories</a>
          <a href="#slides" class="nav-item"><i class="fas fa-images"></i> Slides</a>
          <a href="#solutions" class="nav-item"><i class="fas fa-lightbulb"></i> Solutions</a>
          <a href="#cases" class="nav-item"><i class="fas fa-briefcase"></i> Cases</a>
          <a href="#news" class="nav-item"><i class="fas fa-newspaper"></i> News</a>
          <a href="#pages" class="nav-item"><i class="fas fa-file"></i> Pages</a>
          <a href="#inquiries" class="nav-item"><i class="fas fa-envelope"></i> Inquiries</a>
          <a href="#leads" class="nav-item"><i class="fas fa-users"></i> Leads</a>
          <a href="#settings" class="nav-item"><i class="fas fa-cog"></i> Settings</a>
          <a href="#seo" class="nav-item"><i class="fas fa-search"></i> SEO & JSON-LD</a>
          <a href="#robots" class="nav-item"><i class="fas fa-robot"></i> Robots.txt</a>
        </nav>
      </aside>
      <main class="main-content">
        <header class="admin-header">
          <h1 id="page-title">Dashboard</h1>
          <button id="logout-btn" class="btn btn-outline">Logout</button>
        </header>
        <div id="dashboard-page" class="page active">
          <div class="stats-grid">
            <div class="stat-card"><h3>Total Products</h3><p id="stat-products">-</p></div>
            <div class="stat-card"><h3>Total Inquiries</h3><p id="stat-inquiries">-</p></div>
            <div class="stat-card"><h3>Pending Inquiries</h3><p id="stat-pending">-</p></div>
            <div class="stat-card"><h3>Total Leads</h3><p id="stat-leads">-</p></div>
            <div class="stat-card"><h3>Total Cases</h3><p id="stat-cases">-</p></div>
            <div class="stat-card"><h3>Total News</h3><p id="stat-news">-</p></div>
          </div>
        </div>
        <div id="products-page" class="page"><div class="page-header"><h2>Products</h2><button id="add-product-btn" class="btn">Add Product</button></div><div id="product-table"></div></div>
        <div id="categories-page" class="page"><div class="page-header"><h2>Categories</h2><button id="add-category-btn" class="btn">Add Category</button></div><div id="category-table"></div></div>
        <div id="slides-page" class="page"><div class="page-header"><h2>Home Slides</h2><button id="add-slide-btn" class="btn">Add Slide</button></div><div id="slide-table"></div></div>
        <div id="solutions-page" class="page"><div class="page-header"><h2>Solutions</h2><button id="add-solution-btn" class="btn">Add Solution</button></div><div id="solution-table"></div></div>
        <div id="cases-page" class="page"><div class="page-header"><h2>Cases</h2><button id="add-case-btn" class="btn">Add Case</button></div><div id="case-table"></div></div>
        <div id="news-page" class="page"><div class="page-header"><h2>News</h2><button id="add-news-btn" class="btn">Add News</button></div><div id="news-table"></div></div>
        <div id="pages-page" class="page"><div class="page-header"><h2>Pages</h2></div><div id="pages-table"></div></div>
        <div id="inquiries-page" class="page"><div class="page-header"><h2>Inquiries</h2></div><div id="inquiry-table"></div></div>
        <div id="leads-page" class="page"><div class="page-header"><h2>Leads</h2></div><div id="leads-table"></div></div>
        <div id="settings-page" class="page"><h2>General Settings</h2><form id="settings-form"></form><h2 style="margin-top: 2rem;">Popup Settings</h2><form id="popup-settings-form"></form><h2 style="margin-top: 2rem;">Social Links</h2><div id="social-links-form"></div><h2 style="margin-top: 2rem;">Contact Info</h2><div id="contact-info-form"></div></div>
        <div id="seo-page" class="page"><h2>JSON-LD Configuration</h2><div id="jsonld-form"></div></div>
        <div id="robots-page" class="page"><h2>Robots.txt Configuration</h2><div id="robots-form"></div><button class="btn" onclick="previewRobots()">Preview robots.txt</button></div>
      </main>
    </div>
  </div>
  <script src="/js/admin.js"></script>
</body>
</html>`);
});

app.get('/products', async (c) => {
  return c.html('<!DOCTYPE html><html><head><title>Products</title><link rel="stylesheet" href="/css/styles.css"></head><body><h1>Products Center</h1></body></html>');
});

app.get('/solutions', async (c) => {
  return c.html('<!DOCTYPE html><html><head><title>Solutions</title><link rel="stylesheet" href="/css/styles.css"></head><body><h1>Solutions</h1></body></html>');
});

app.get('/cases', async (c) => {
  return c.html('<!DOCTYPE html><html><head><title>Cases</title><link rel="stylesheet" href="/css/styles.css"></head><body><h1>Cases</h1></body></html>');
});

app.get('/news', async (c) => {
  return c.html('<!DOCTYPE html><html><head><title>News</title><link rel="stylesheet" href="/css/styles.css"></head><body><h1>News</h1></body></html>');
});

app.get('/about', async (c) => {
  const db = new Database(c.env.DB);
  const page = await db.getPageBySlug('about');
  return c.html(`<!DOCTYPE html><html><head><title>${page?.meta_title || 'About Us'}</title><link rel="stylesheet" href="/css/styles.css"></head><body><div class="container page-content">${page?.content || '<h1>About Us</h1>'}</div></body></html>`);
});

app.get('/contact', async (c) => {
  const db = new Database(c.env.DB);
  const contactInfo = await db.getContactInfo();
  return c.html(`<!DOCTYPE html><html><head><title>Contact Us</title><link rel="stylesheet" href="/css/styles.css"></head><body><div class="container page-content"><h1>Contact Us</h1><div class="contact-info">${contactInfo.map((i: any) => \`<p>\${i.label || i.type}: \${i.value}</p>\`).join('')}</div></div></body></html>`);
});

app.notFound((c) => c.json({ success: false, error: 'Not Found' }, 404));
app.onError((err, c) => { console.error(err); return c.json({ success: false, error: err.message }, 500); });

export default app;
