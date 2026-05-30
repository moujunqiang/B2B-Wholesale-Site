let currentPage = 'dashboard';
let credentials = null;

document.addEventListener('DOMContentLoaded', () => {
  const savedCreds = localStorage.getItem('adminCreds');
  if (savedCreds) {
    credentials = savedCreds;
    showAdminView();
  }
});

document.getElementById('login-form')?.addEventListener('submit', async (e) => {
  e.preventDefault();
  const form = e.target;
  const username = form.username.value;
  const password = form.password.value;
  
  const creds = btoa(`${username}:${password}`);
  
  try {
    const res = await fetch('/api/admin/stats', {
      headers: { 'Authorization': `Basic ${creds}` }
    });
    
    if (res.ok) {
      credentials = creds;
      localStorage.setItem('adminCreds', creds);
      showAdminView();
    } else {
      const error = document.getElementById('login-error');
      error.textContent = 'Invalid username or password';
      error.style.display = 'block';
    }
  } catch (err) {
    const error = document.getElementById('login-error');
    error.textContent = 'Login failed. Please try again.';
    error.style.display = 'block';
  }
});

document.getElementById('logout-btn')?.addEventListener('click', () => {
  localStorage.removeItem('adminCreds');
  credentials = null;
  location.reload();
});

document.querySelectorAll('.admin-nav .nav-item').forEach(item => {
  item.addEventListener('click', (e) => {
    e.preventDefault();
    const page = e.target.getAttribute('href').slice(1);
    switchPage(page);
  });
});

function showAdminView() {
  document.getElementById('login-view').style.display = 'none';
  document.getElementById('admin-view').style.display = 'flex';
  loadDashboard();
}

function switchPage(page) {
  document.querySelectorAll('.nav-item').forEach(el => el.classList.remove('active'));
  document.querySelectorAll('.page').forEach(el => el.classList.remove('active'));
  
  document.querySelector(`.nav-item[href="#${page}"]`)?.classList.add('active');
  document.getElementById(`${page}-page`)?.classList.add('active');
  
  document.getElementById('page-title').textContent = page.charAt(0).toUpperCase() + page.slice(1);
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
      document.getElementById('stat-products').textContent = data.data.totalProducts;
      document.getElementById('stat-inquiries').textContent = data.data.totalInquiries;
      document.getElementById('stat-pending').textContent = data.data.pendingInquiries;
      document.getElementById('stat-leads').textContent = data.data.totalLeads;
      document.getElementById('stat-cases').textContent = data.data.totalCases;
      document.getElementById('stat-news').textContent = data.data.totalNews;
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
