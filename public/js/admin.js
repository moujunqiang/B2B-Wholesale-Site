let currentPage = 'dashboard';
let credentials = null;
let currentLang = localStorage.getItem('adminLang') || 'en';

const translations = {
  en: {
    login: { title: 'Admin Login', username: 'Username', password: 'Password', loginBtn: 'Login', invalidCreds: 'Invalid username or password', loginFailed: 'Login failed. Please try again.' },
    nav: { dashboard: 'Dashboard', products: 'Products', categories: 'Categories', slides: 'Slides', solutions: 'Solutions', cases: 'Cases', news: 'News', pages: 'Pages', inquiries: 'Inquiries', leads: 'Leads', settings: 'Settings', seo: 'SEO & JSON-LD', robots: 'Robots.txt' },
    dashboard: { title: 'Dashboard', totalProducts: 'Total Products', totalInquiries: 'Total Inquiries', pendingInquiries: 'Pending Inquiries', totalLeads: 'Total Leads', totalCases: 'Total Cases', totalNews: 'Total News' },
    common: { add: 'Add', edit: 'Edit', delete: 'Delete', save: 'Save', cancel: 'Cancel', actions: 'Actions', status: 'Status', active: 'Active', inactive: 'Inactive', active2: 'Active', inactive2: 'Inactive', featured: 'Featured', name: 'Name', title: 'Title', description: 'Description', image: 'Image', images: 'Images', url: 'URL', slug: 'Slug', sortOrder: 'Sort Order', selectCategory: 'Select Category', parent: 'Parent', noParent: 'No Parent', createdAt: 'Created', updatedAt: 'Updated', confirmDelete: 'Are you sure?', deleteSuccess: 'Deleted successfully', saveSuccess: 'Saved successfully', error: 'Error', loading: 'Loading...', noData: 'No data', viewAll: 'View All', addNew: 'Add New', uploadImage: 'Upload Image', imageUrl: 'Image URL', upload: 'Upload', logout: 'Logout' },
    products: { title: 'Products', addProduct: 'Add Product', editProduct: 'Edit Product', productName: 'Product Name', shortDescription: 'Short Description', fullDescription: 'Full Description', price: 'Price', moq: 'MOQ (Min Order Qty)', category: 'Category', allCategories: 'All Categories', search: 'Search products...' },
    categories: { title: 'Categories', addCategory: 'Add Category', editCategory: 'Edit Category', categoryName: 'Category Name', parentCategory: 'Parent Category' },
    slides: { title: 'Slides', addSlide: 'Add Slide', editSlide: 'Edit Slide', slideTitle: 'Title', subtitle: 'Subtitle', slideDescription: 'Description', slideImage: 'Background Image', linkUrl: 'Link URL', linkText: 'Button Text' },
    solutions: { title: 'Solutions', addSolution: 'Add Solution', editSolution: 'Edit Solution' },
    cases: { title: 'Cases', addCase: 'Add Case', editCase: 'Edit Case', clientName: 'Client Name' },
    news: { title: 'News', addNews: 'Add News', editNews: 'Edit News', content: 'Content', author: 'Author' },
    pages: { title: 'Pages', editPage: 'Edit Page', metaTitle: 'Meta Title', metaDescription: 'Meta Description', content: 'Page Content' },
    inquiries: { title: 'Inquiries', reply: 'Reply', replySubject: 'Reply Subject', replyMessage: 'Reply Message', sendReply: 'Send Reply', company: 'Company', phone: 'Phone', read: 'Read', unread: 'Unread', pending: 'Pending', completed: 'Completed' },
    leads: { title: 'Leads', leadName: 'Name', phone: 'Phone', whatsapp: 'WhatsApp', message: 'Message' },
    settings: { title: 'Settings', generalSettings: 'General Settings', siteName: 'Site Name', siteTitle: 'Site Title', siteDescription: 'Site Description', siteKeywords: 'Site Keywords', logoUrl: 'Logo URL', popupSettings: 'Popup Settings', enablePopup: 'Enable Popup', popupDelay: 'Delay (seconds)', popupTitle: 'Popup Title', popupDescription: 'Popup Description', socialLinks: 'Social Links', contactInfo: 'Contact Info', addSocial: 'Add Social Link', platform: 'Platform', socialUrl: 'URL', contactType: 'Type', contactValue: 'Value', contactLabel: 'Label', email: 'Email', phone2: 'Phone', whatsapp2: 'WhatsApp', saveSettings: 'Save Settings' },
    seo: { title: 'JSON-LD Configuration', addConfig: 'Add Configuration', name: 'Name', schemaType: 'Schema Type', configValue: 'Configuration', extraData: 'Extra Data (JSON)' },
    robots: { title: 'Robots.txt Configuration', addRule: 'Add Rule', userAgent: 'User Agent', rule: 'Rule', allow: 'Allow', disallow: 'Disallow', preview: 'Preview robots.txt', robotRules: 'Robot Rules' },
    form: { required: 'Required', optional: 'Optional', selectOption: 'Select an option', enterText: 'Enter text', enterUrl: 'Enter URL', enterNumber: 'Enter number' }
  },
  zh: {
    login: { title: '管理员登录', username: '用户名', password: '密码', loginBtn: '登录', invalidCreds: '用户名或密码错误', loginFailed: '登录失败，请重试' },
    nav: { dashboard: '仪表盘', products: '产品', categories: '分类', slides: '幻灯片', solutions: '解决方案', cases: '案例', news: '新闻', pages: '页面', inquiries: '询盘', leads: '潜在客户', settings: '设置', seo: 'SEO 和 JSON-LD', robots: 'Robots.txt' },
    dashboard: { title: '仪表盘', totalProducts: '产品总数', totalInquiries: '询盘总数', pendingInquiries: '待处理询盘', totalLeads: '潜在客户', totalCases: '案例总数', totalNews: '新闻总数' },
    common: { add: '添加', edit: '编辑', delete: '删除', save: '保存', cancel: '取消', actions: '操作', status: '状态', active: '启用', inactive: '禁用', active2: '启用中', inactive2: '已禁用', featured: '推荐', name: '名称', title: '标题', description: '描述', image: '图片', images: '图片', url: '链接', slug: '别名', sortOrder: '排序', selectCategory: '选择分类', parent: '父级', noParent: '无父级', createdAt: '创建时间', updatedAt: '更新时间', confirmDelete: '确定要删除吗？', deleteSuccess: '删除成功', saveSuccess: '保存成功', error: '错误', loading: '加载中...', noData: '暂无数据', viewAll: '查看全部', addNew: '新增', uploadImage: '上传图片', imageUrl: '图片地址', upload: '上传', logout: '退出登录' },
    products: { title: '产品', addProduct: '添加产品', editProduct: '编辑产品', productName: '产品名称', shortDescription: '简短描述', fullDescription: '完整描述', price: '价格', moq: '最小起订量', category: '分类', allCategories: '全部分类', search: '搜索产品...' },
    categories: { title: '分类', addCategory: '添加分类', editCategory: '编辑分类', categoryName: '分类名称', parentCategory: '父级分类' },
    slides: { title: '幻灯片', addSlide: '添加幻灯片', editSlide: '编辑幻灯片', slideTitle: '标题', subtitle: '副标题', slideDescription: '描述', slideImage: '背景图片', linkUrl: '链接地址', linkText: '按钮文字' },
    solutions: { title: '解决方案', addSolution: '添加解决方案', editSolution: '编辑解决方案' },
    cases: { title: '案例', addCase: '添加案例', editCase: '编辑案例', clientName: '客户名称' },
    news: { title: '新闻', addNews: '添加新闻', editNews: '编辑新闻', content: '内容', author: '作者' },
    pages: { title: '页面', editPage: '编辑页面', metaTitle: 'SEO 标题', metaDescription: 'SEO 描述', content: '页面内容' },
    inquiries: { title: '询盘', reply: '回复', replySubject: '回复主题', replyMessage: '回复内容', sendReply: '发送回复', company: '公司', phone: '电话', read: '已读', unread: '未读', pending: '处理中', completed: '已完成' },
    leads: { title: '潜在客户', leadName: '姓名', phone: '电话', whatsapp: 'WhatsApp', message: '留言' },
    settings: { title: '设置', generalSettings: '基本设置', siteName: '网站名称', siteTitle: '网站标题', siteDescription: '网站描述', siteKeywords: '网站关键词', logoUrl: 'Logo 地址', popupSettings: '弹窗设置', enablePopup: '启用弹窗', popupDelay: '延迟时间（秒）', popupTitle: '弹窗标题', popupDescription: '弹窗描述', socialLinks: '社交媒体链接', contactInfo: '联系方式', addSocial: '添加社交链接', platform: '平台', socialUrl: '链接地址', contactType: '类型', contactValue: '值', contactLabel: '标签', email: '邮箱', phone2: '电话', whatsapp2: 'WhatsApp', saveSettings: '保存设置' },
    seo: { title: 'JSON-LD 配置', addConfig: '添加配置', name: '名称', schemaType: 'Schema 类型', configValue: '配置内容', extraData: '额外数据 (JSON)' },
    robots: { title: 'Robots.txt 配置', addRule: '添加规则', userAgent: '用户代理', rule: '规则', allow: '允许', disallow: '禁止', preview: '预览 robots.txt', robotRules: '爬虫规则' },
    form: { required: '必填', optional: '选填', selectOption: '请选择', enterText: '请输入', enterUrl: '请输入链接', enterNumber: '请输入数字' }
  }
};

function t(key) {
  const keys = key.split('.');
  let value = translations[currentLang];
  for (const k of keys) {
    value = value?.[k];
  }
  return value || key;
}

function applyTranslations() {
  currentLang = localStorage.getItem('adminLang') || 'en';
  $('#lang-select').val(currentLang);
  
  $('[data-i18n]').each(function() {
    const key = $(this).attr('data-i18n');
    const translated = t(key);
    if ($(this).is('input[placeholder]')) {
      $(this).attr('placeholder', translated);
    } else {
      $(this).text(translated);
    }
  });
}

$(document).ready(function() {
  applyTranslations();
  
  $('#lang-select').on('change', function() {
    currentLang = $(this).val();
    localStorage.setItem('adminLang', currentLang);
    location.reload();
  });
  
  const savedCreds = localStorage.getItem('adminCreds');
  if (savedCreds) {
    credentials = savedCreds;
    showAdminView();
  }
  
  $('#login-form').on('submit', async function(e) {
    e.preventDefault();
    const username = $(this).find('#username').val();
    const password = $(this).find('#password').val();

    const creds = btoa(`${username}:${password}`);

    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Authorization': `Basic ${creds}` }
      });

      if (res.ok) {
        credentials = creds;
        localStorage.setItem('adminCreds', creds);
        showAdminView();
      } else {
        $('#login-error').text(t('login.invalidCreds')).fadeIn();
      }
    } catch (err) {
      $('#login-error').text(t('login.loginFailed')).fadeIn();
    }
  });
  
  $('#logout-btn').on('click', function() {
    localStorage.removeItem('adminCreds');
    credentials = null;
    location.reload();
  });
  
  $('.admin-nav .nav-item').on('click', function(e) {
    e.preventDefault();
    const page = $(this).attr('href').slice(1);
    switchPage(page);
  });
});

function showAdminView() {
  $('#login-view').hide();
  $('#admin-view').removeClass('hidden').addClass('flex');
  applyTranslations();
  loadDashboard();
}

function switchPage(page) {
  $('.nav-item').removeClass('active');
  $('.page').removeClass('active').addClass('hidden');
  
  $(`.nav-item[href="#${page}"]`).addClass('active');
  $(`#${page}-page`).removeClass('hidden').addClass('active');
  
  const titleKey = 'nav.' + page;
  $('#page-title').text(t(titleKey));
  currentPage = page;
  
  if (page === 'products') loadProducts();
  else if (page === 'categories') loadCategories();
  else if (page === 'solutions') loadSolutions();
  else if (page === 'cases') loadCases();
  else if (page === 'news') loadNews();
  else if (page === 'pages') loadPages();
  else if (page === 'inquiries') loadInquiries();
  else if (page === 'leads') loadLeads();
  else if (page === 'settings') loadSettings();
}

async function loadDashboard() {
  try {
    const res = await fetch('/api/admin/stats', {
      headers: { 'Authorization': `Basic ${credentials}` }
    });
    const data = await res.json();
    if (data.success) {
      $('#stat-products').text(data.data.totalProducts);
      $('#stat-inquiries').text(data.data.totalInquiries);
      $('#stat-pending').text(data.data.pendingInquiries);
      $('#stat-leads').text(data.data.totalLeads);
      $('#stat-cases').text(data.data.totalCases);
      $('#stat-news').text(data.data.totalNews);
    }
  } catch (err) {
    console.error('Failed to load dashboard');
  }
}

async function loadProducts() {
  const container = document.getElementById('product-table');
  if (!container) return;
  
  try {
    const res = await fetch(`/api/products?page=1&limit=50`, {
      headers: { 'Authorization': `Basic ${credentials}` }
    });
    const data = await res.json();
    if (data.success) {
      renderProductsTable(data.data.items);
    }
  } catch (err) {
    console.error('Failed to load products');
  }
}

function renderProductsTable(products) {
  const container = document.getElementById('product-table');
  if (!container) return;
  
  container.innerHTML = `
    <table>
      <thead>
        <tr>
          <th>ID</th>
          <th>Name</th>
          <th>Price</th>
          <th>MOQ</th>
          <th>Featured</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        ${products.map(p => `
          <tr>
            <td>${p.id}</td>
            <td>${p.name}</td>
            <td>${p.price ? `$${p.price}` : '-'}</td>
            <td>${p.min_order_qty}</td>
            <td>${p.is_featured ? '✓' : '-'}</td>
            <td>
              <button class="btn btn-sm btn-warning" onclick="alert('Edit feature coming soon')">Edit</button>
              <button class="btn btn-sm btn-danger" onclick="deleteProduct(${p.id})">Delete</button>
            </td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  `;
}

async function loadCategories() {
  const container = document.getElementById('category-table');
  if (!container) return;
  
  try {
    const res = await fetch('/api/categories', {
      headers: { 'Authorization': `Basic ${credentials}` }
    });
    const data = await res.json();
    if (data.success) {
      renderCategoriesTable(data.data);
    }
  } catch (err) {
    console.error('Failed to load categories');
  }
}

function renderCategoriesTable(categories) {
  const container = document.getElementById('category-table');
  if (!container) return;
  
  container.innerHTML = `
    <table>
      <thead>
        <tr>
          <th>ID</th>
          <th>Name</th>
          <th>Slug</th>
          <th>Sort</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        ${categories.map(c => `
          <tr>
            <td>${c.id}</td>
            <td>${c.name}</td>
            <td>${c.slug}</td>
            <td>${c.sort_order}</td>
            <td>
              <button class="btn btn-sm btn-warning">Edit</button>
              <button class="btn btn-sm btn-danger" onclick="deleteCategory(${c.id})">Delete</button>
            </td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  `;
}

async function loadSolutions() {
  const container = document.getElementById('solution-table');
  if (!container) return;
  
  try {
    const res = await fetch('/api/solutions', {
      headers: { 'Authorization': `Basic ${credentials}` }
    });
    const data = await res.json();
    if (data.success) {
      renderSolutionsTable(data.data);
    }
  } catch (err) {
    console.error('Failed to load solutions');
  }
}

function renderSolutionsTable(solutions) {
  const container = document.getElementById('solution-table');
  if (!container) return;
  
  container.innerHTML = `
    <table>
      <thead>
        <tr>
          <th>ID</th>
          <th>Title</th>
          <th>Featured</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        ${solutions.map(s => `
          <tr>
            <td>${s.id}</td>
            <td>${s.title}</td>
            <td>${s.is_featured ? '✓' : '-'}</td>
            <td>
              <button class="btn btn-sm btn-warning">Edit</button>
              <button class="btn btn-sm btn-danger" onclick="deleteSolution(${s.id})">Delete</button>
            </td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  `;
}

async function loadCases() {
  const container = document.getElementById('case-table');
  if (!container) return;
  
  try {
    const res = await fetch('/api/cases', {
      headers: { 'Authorization': `Basic ${credentials}` }
    });
    const data = await res.json();
    if (data.success) {
      renderCasesTable(data.data);
    }
  } catch (err) {
    console.error('Failed to load cases');
  }
}

function renderCasesTable(cases) {
  const container = document.getElementById('case-table');
  if (!container) return;
  
  container.innerHTML = `
    <table>
      <thead>
        <tr>
          <th>ID</th>
          <th>Title</th>
          <th>Client</th>
          <th>Featured</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        ${cases.map(c => `
          <tr>
            <td>${c.id}</td>
            <td>${c.title}</td>
            <td>${c.client_name || '-'}</td>
            <td>${c.is_featured ? '✓' : '-'}</td>
            <td>
              <button class="btn btn-sm btn-warning">Edit</button>
              <button class="btn btn-sm btn-danger" onclick="deleteCase(${c.id})">Delete</button>
            </td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  `;
}

async function loadNews() {
  const container = document.getElementById('news-table');
  if (!container) return;
  
  try {
    const res = await fetch('/api/news?limit=50', {
      headers: { 'Authorization': `Basic ${credentials}` }
    });
    const data = await res.json();
    if (data.success) {
      renderNewsTable(data.data.items);
    }
  } catch (err) {
    console.error('Failed to load news');
  }
}

function renderNewsTable(news) {
  const container = document.getElementById('news-table');
  if (!container) return;
  
  container.innerHTML = `
    <table>
      <thead>
        <tr>
          <th>ID</th>
          <th>Title</th>
          <th>Author</th>
          <th>Views</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        ${news.map(n => `
          <tr>
            <td>${n.id}</td>
            <td>${n.title}</td>
            <td>${n.author || '-'}</td>
            <td>${n.view_count}</td>
            <td>
              <button class="btn btn-sm btn-warning">Edit</button>
              <button class="btn btn-sm btn-danger" onclick="deleteNews(${n.id})">Delete</button>
            </td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  `;
}

async function loadPages() {
  const container = document.getElementById('pages-table');
  if (!container) return;
  
  try {
    const res = await fetch('/api/pages', {
      headers: { 'Authorization': `Basic ${credentials}` }
    });
    const data = await res.json();
    if (data.success) {
      renderPagesTable(data.data);
    }
  } catch (err) {
    console.error('Failed to load pages');
  }
}

function renderPagesTable(pages) {
  const container = document.getElementById('pages-table');
  if (!container) return;
  
  container.innerHTML = `
    <table>
      <thead>
        <tr>
          <th>ID</th>
          <th>Title</th>
          <th>Slug</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        ${pages.map(p => `
          <tr>
            <td>${p.id}</td>
            <td>${p.title}</td>
            <td>${p.slug}</td>
            <td>
              <button class="btn btn-sm btn-warning">Edit</button>
            </td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  `;
}

async function loadInquiries() {
  const container = document.getElementById('inquiry-table');
  if (!container) return;
  
  try {
    const res = await fetch('/api/inquiries?status=pending&limit=50', {
      headers: { 'Authorization': `Basic ${credentials}` }
    });
    const data = await res.json();
    if (data.success) {
      renderInquiriesTable(data.data.items);
    }
  } catch (err) {
    console.error('Failed to load inquiries');
  }
}

function renderInquiriesTable(inquiries) {
  const container = document.getElementById('inquiry-table');
  if (!container) return;
  
  container.innerHTML = `
    <table>
      <thead>
        <tr>
          <th>Date</th>
          <th>Name</th>
          <th>Email</th>
          <th>Company</th>
          <th>Message</th>
          <th>Status</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        ${inquiries.map(i => `
          <tr>
            <td>${new Date(i.created_at).toLocaleDateString()}</td>
            <td>${i.name}</td>
            <td>${i.email}</td>
            <td>${i.company || '-'}</td>
            <td>${i.message.substring(0, 50)}...</td>
            <td>${i.status}</td>
            <td>
              <button class="btn btn-sm" onclick="viewInquiry(${i.id})">View</button>
              <button class="btn btn-sm" onclick="markInquiryReplied(${i.id})">Mark Replied</button>
            </td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  `;
}

async function loadLeads() {
  const container = document.getElementById('leads-table');
  if (!container) return;
  
  try {
    const res = await fetch('/api/leads?limit=50', {
      headers: { 'Authorization': `Basic ${credentials}` }
    });
    const data = await res.json();
    if (data.success) {
      renderLeadsTable(data.data.items);
    }
  } catch (err) {
    console.error('Failed to load leads');
  }
}

function renderLeadsTable(leads) {
  const container = document.getElementById('leads-table');
  if (!container) return;
  
  container.innerHTML = `
    <table>
      <thead>
        <tr>
          <th>Date</th>
          <th>Name</th>
          <th>Phone</th>
          <th>WhatsApp</th>
          <th>Email</th>
          <th>Source</th>
          <th>Status</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        ${leads.map(l => `
          <tr>
            <td>${new Date(l.created_at).toLocaleDateString()}</td>
            <td>${l.name}</td>
            <td>${l.phone || '-'}</td>
            <td>${l.whatsapp || '-'}</td>
            <td>${l.email || '-'}</td>
            <td>${l.source}</td>
            <td>${l.status}</td>
            <td>
              <button class="btn btn-sm" onclick="viewLead(${l.id})">View</button>
              <button class="btn btn-sm" onclick="markLeadContacted(${l.id})">Mark Contacted</button>
            </td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  `;
}

async function loadSettings() {
  loadGeneralSettings();
  loadPopupSettings();
  loadSocialLinks();
  loadContactInfo();
}

async function loadGeneralSettings() {
  const container = document.getElementById('settings-form');
  if (!container) return;
  
  try {
    const res = await fetch('/api/settings', {
      headers: { 'Authorization': `Basic ${credentials}` }
    });
    const data = await res.json();
    if (data.success) {
      const fields = [
        { key: 'site_name', label: 'Site Name' },
        { key: 'site_title', label: 'Site Title (TDK)' },
        { key: 'site_description', label: 'Site Description (TDK)' },
        { key: 'site_keywords', label: 'Site Keywords (TDK)' },
        { key: 'contact_email', label: 'Contact Email' },
        { key: 'contact_phone', label: 'Contact Phone' },
        { key: 'whatsapp_number', label: 'WhatsApp Number' },
        { key: 'logo_url', label: 'Logo URL' },
        { key: 'favicon_url', label: 'Favicon URL' },
      ];
      
      container.innerHTML = `
        <form id="settings-form-content">
          ${fields.map(f => `
            <div class="form-group">
              <label for="${f.key}">${f.label}</label>
              <input type="text" id="${f.key}" name="${f.key}" value="${data.data[f.key] || ''}">
            </div>
          `).join('')}
          <button type="submit" class="btn">Save Settings</button>
        </form>
      `;
      
      document.getElementById('settings-form-content')?.addEventListener('submit', async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        for (const [key, value] of Object.entries(Object.fromEntries(formData))) {
          await fetch('/api/settings', {
            method: 'POST',
            headers: { 
              'Content-Type': 'application/json',
              'Authorization': `Basic ${credentials}`
            },
            body: JSON.stringify({ key, value })
          });
        }
        alert('Settings saved successfully!');
      });
    }
  } catch (err) {
    console.error('Failed to load settings');
  }
}

async function loadPopupSettings() {
  const container = document.getElementById('popup-settings-form');
  if (!container) return;
  
  try {
    const res = await fetch('/api/settings/popup', {
      headers: { 'Authorization': `Basic ${credentials}` }
    });
    const data = await res.json();
    if (data.success && data.data) {
      const settings = data.data;
      container.innerHTML = `
        <form id="popup-settings-content">
          <div class="form-group">
            <label>
              <input type="checkbox" name="is_enabled" ${settings.is_enabled ? 'checked' : ''}> Enable Popup
            </label>
          </div>
          <div class="form-group">
            <label for="delay_seconds">Popup Delay (seconds)</label>
            <input type="number" id="delay_seconds" name="delay_seconds" value="${settings.delay_seconds || 15}">
          </div>
          <div class="form-group">
            <label for="popup_title">Popup Title</label>
            <input type="text" id="popup_title" name="title" value="${settings.title || ''}">
          </div>
          <div class="form-group">
            <label for="popup_description">Popup Description</label>
            <textarea id="popup_description" name="description" rows="3">${settings.description || ''}</textarea>
          </div>
          <button type="submit" class="btn">Save Popup Settings</button>
        </form>
      `;
      
      document.getElementById('popup-settings-content')?.addEventListener('submit', async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const data = Object.fromEntries(formData);
        await fetch('/api/settings/popup', {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Basic ${credentials}`
          },
          body: JSON.stringify({
            is_enabled: data.is_enabled ? 1 : 0,
            delay_seconds: parseInt(data.delay_seconds),
            title: data.title,
            description: data.description,
          })
        });
        alert('Popup settings saved successfully!');
      });
    }
  } catch (err) {
    console.error('Failed to load popup settings');
  }
}

async function loadSocialLinks() {
  const container = document.getElementById('social-links-form');
  if (!container) return;
  
  try {
    const res = await fetch('/api/settings/social');
    const data = await res.json();
    if (data.success) {
      container.innerHTML = `
        <div id="social-links-list">
          ${data.data.map(s => `
            <div class="form-group" style="display: flex; gap: 1rem; align-items: center;">
              <input type="text" value="${s.name}" style="flex: 1;">
              <input type="text" value="${s.url}" style="flex: 2;">
              <button class="btn btn-sm btn-danger" onclick="deleteSocialLink(${s.id})">Delete</button>
            </div>
          `).join('')}
        </div>
        <button class="btn" onclick="addSocialLink()">Add Social Link</button>
      `;
    }
  } catch (err) {
    console.error('Failed to load social links');
  }
}

window.addSocialLink = function() {
  const container = document.getElementById('social-links-list');
  if (container) {
    container.innerHTML += `
      <div class="form-group" style="display: flex; gap: 1rem; align-items: center;">
        <input type="text" placeholder="Platform Name" id="new-social-name" style="flex: 1;">
        <input type="text" placeholder="URL" id="new-social-url" style="flex: 2;">
        <button class="btn btn-sm" onclick="saveSocialLink()">Save</button>
      </div>
    `;
  }
};

window.saveSocialLink = async function() {
  const name = document.getElementById('new-social-name')?.value;
  const url = document.getElementById('new-social-url')?.value;
  
  if (name && url) {
    await fetch('/api/settings/social', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Basic ${credentials}`
      },
      body: JSON.stringify({
        platform: name.toLowerCase(),
        name,
        url,
      })
    });
    loadSocialLinks();
  }
};

window.deleteSocialLink = async function(id) {
  if (confirm('Are you sure you want to delete this social link?')) {
    await fetch(`/api/settings/social/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Basic ${credentials}` }
    });
    loadSocialLinks();
  }
};

async function loadContactInfo() {
  const container = document.getElementById('contact-info-form');
  if (!container) return;
  
  try {
    const res = await fetch('/api/settings/contact');
    const data = await res.json();
    if (data.success) {
      container.innerHTML = `
        <div id="contact-info-list">
          ${data.data.map(c => `
            <div class="form-group" style="display: flex; gap: 1rem; align-items: center;">
              <select id="contact-type-${c.id}" style="width: 120px;">
                <option value="email" ${c.type === 'email' ? 'selected' : ''}>Email</option>
                <option value="phone" ${c.type === 'phone' ? 'selected' : ''}>Phone</option>
                <option value="whatsapp" ${c.type === 'whatsapp' ? 'selected' : ''}>WhatsApp</option>
              </select>
              <input type="text" value="${c.value}" id="contact-value-${c.id}" style="flex: 1;">
              <button class="btn btn-sm btn-warning" onclick="updateContactInfo(${c.id})">Update</button>
              <button class="btn btn-sm btn-danger" onclick="deleteContactInfo(${c.id})">Delete</button>
            </div>
          `).join('')}
        </div>
        <button class="btn" onclick="addContactInfo()">Add Contact Info</button>
      `;
    }
  } catch (err) {
    console.error('Failed to load contact info');
  }
}

window.addContactInfo = function() {
  const container = document.getElementById('contact-info-list');
  if (container) {
    container.innerHTML += `
      <div class="form-group" style="display: flex; gap: 1rem; align-items: center;">
        <select id="new-contact-type" style="width: 120px;">
          <option value="email">Email</option>
          <option value="phone">Phone</option>
          <option value="whatsapp">WhatsApp</option>
        </select>
        <input type="text" placeholder="Value" id="new-contact-value" style="flex: 1;">
        <button class="btn btn-sm" onclick="saveContactInfo()">Save</button>
      </div>
    `;
  }
};

window.saveContactInfo = async function() {
  const type = document.getElementById('new-contact-type')?.value;
  const value = document.getElementById('new-contact-value')?.value;
  
  if (type && value) {
    await fetch('/api/settings/contact', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Basic ${credentials}`
      },
      body: JSON.stringify({ type, value })
    });
    loadContactInfo();
  }
};

window.updateContactInfo = async function(id) {
  const type = document.getElementById(`contact-type-${id}`)?.value;
  const value = document.getElementById(`contact-value-${id}`)?.value;
  
  if (type && value) {
    await fetch('/api/settings/contact', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Basic ${credentials}`
      },
      body: JSON.stringify({ id, type, value })
    });
    alert('Contact info updated successfully!');
  }
};

window.deleteContactInfo = async function(id) {
  if (confirm('Are you sure you want to delete this contact info?')) {
    await fetch(`/api/settings/contact/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Basic ${credentials}` }
    });
    loadContactInfo();
  }
};

window.deleteProduct = async function(id) {
  if (!confirm('Are you sure you want to delete this product?')) return;
  
  try {
    await fetch(`/api/products/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Basic ${credentials}` }
    });
    loadProducts();
  } catch (err) {
    alert('Failed to delete product');
  }
};

window.deleteCategory = async function(id) {
  if (!confirm('Are you sure you want to delete this category?')) return;
  
  try {
    await fetch(`/api/categories/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Basic ${credentials}` }
    });
    loadCategories();
  } catch (err) {
    alert('Failed to delete category');
  }
};

window.deleteSolution = async function(id) {
  if (!confirm('Are you sure you want to delete this solution?')) return;
  
  try {
    await fetch(`/api/solutions/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Basic ${credentials}` }
    });
    loadSolutions();
  } catch (err) {
    alert('Failed to delete solution');
  }
};

window.deleteCase = async function(id) {
  if (!confirm('Are you sure you want to delete this case?')) return;
  
  try {
    await fetch(`/api/cases/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Basic ${credentials}` }
    });
    loadCases();
  } catch (err) {
    alert('Failed to delete case');
  }
};

window.deleteNews = async function(id) {
  if (!confirm('Are you sure you want to delete this news?')) return;
  
  try {
    await fetch(`/api/news/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Basic ${credentials}` }
    });
    loadNews();
  } catch (err) {
    alert('Failed to delete news');
  }
};

window.viewInquiry = async function(id) {
  try {
    const res = await fetch(`/api/inquiries/${id}`, {
      headers: { 'Authorization': `Basic ${credentials}` }
    });
    const data = await res.json();
    if (data.success) {
      const i = data.data;
      alert(`Inquiry Details:\n\nName: ${i.name}\nEmail: ${i.email}\nCompany: ${i.company || 'N/A'}\n\nMessage:\n${i.message}\n\nStatus: ${i.status}`);
    }
  } catch (err) {
    alert('Failed to load inquiry details');
  }
};

window.markInquiryReplied = async function(id) {
  try {
    await fetch(`/api/inquiries/${id}/status`, {
      method: 'PATCH',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Basic ${credentials}`
      },
      body: JSON.stringify({ status: 'replied' })
    });
    loadInquiries();
  } catch (err) {
    alert('Failed to update inquiry status');
  }
};

window.viewLead = async function(id) {
  try {
    const res = await fetch(`/api/leads/${id}`, {
      headers: { 'Authorization': `Basic ${credentials}` }
    });
    const data = await res.json();
    if (data.success) {
      const l = data.data;
      alert(`Lead Details:\n\nName: ${l.name}\nPhone: ${l.phone || 'N/A'}\nWhatsApp: ${l.whatsapp || 'N/A'}\nEmail: ${l.email || 'N/A'}\n\nMessage:\n${l.message}\n\nSource: ${l.source}\nStatus: ${l.status}`);
    }
  } catch (err) {
    alert('Failed to load lead details');
  }
};

window.markLeadContacted = async function(id) {
  try {
    await fetch(`/api/leads/${id}/status`, {
      method: 'PATCH',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Basic ${credentials}`
      },
      body: JSON.stringify({ status: 'contacted' })
    });
    loadLeads();
  } catch (err) {
    alert('Failed to update lead status');
  }
};
