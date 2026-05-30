let currentPage = 'dashboard';
let credentials = null;

document.addEventListener('DOMContentLoaded', () => {
  const savedCreds = localStorage.getItem('adminCreds');
  if (savedCreds) {
    credentials = savedCreds;
    showAdminView();
  }
  
  if (document.getElementById('product-images-input')) {
    document.getElementById('product-images-input').addEventListener('change', handleImageUpload);
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
  else if (page === 'inquiries') loadInquiries();
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
    }
  } catch (err) {
    console.error('Failed to load dashboard');
  }
}

async function loadProducts(page = 1) {
  const container = document.getElementById('product-table');
  if (!container) return;
  
  try {
    const res = await fetch(`/api/products?page=${page}&limit=20`, {
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
              <button class="btn btn-sm" onclick="editProduct(${p.id})">Edit</button>
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
              <button class="btn btn-sm" onclick="editCategory(${c.id})">Edit</button>
              <button class="btn btn-sm btn-danger" onclick="deleteCategory(${c.id})">Delete</button>
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

async function loadSettings() {
  const container = document.getElementById('settings-form');
  if (!container) return;
  
  try {
    const res = await fetch('/api/settings', {
      headers: { 'Authorization': `Basic ${credentials}` }
    });
    const data = await res.json();
    if (data.success) {
      renderSettingsForm(data.data);
    }
  } catch (err) {
    console.error('Failed to load settings');
  }
}

function renderSettingsForm(settings) {
  const container = document.getElementById('settings-form');
  if (!container) return;
  
  const fields = [
    { key: 'site_name', label: 'Site Name' },
    { key: 'site_description', label: 'Site Description' },
    { key: 'contact_email', label: 'Contact Email' },
    { key: 'default_locale', label: 'Default Locale' },
    { key: 'currency', label: 'Currency' },
  ];
  
  container.innerHTML = `
    <form id="settings-form-content">
      ${fields.map(f => `
        <div class="form-group">
          <label for="${f.key}">${f.label}</label>
          <input type="text" id="${f.key}" name="${f.key}" value="${settings[f.key] || ''}">
        </div>
      `).join('')}
      <button type="submit" class="btn">Save Settings</button>
    </form>
  `;
  
  document.getElementById('settings-form-content')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData);
    
    try {
      for (const [key, value] of Object.entries(data)) {
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
    } catch (err) {
      alert('Failed to save settings');
    }
  });
}

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

window.viewInquiry = async function(id) {
  try {
    const res = await fetch(`/api/inquiries/${id}`, {
      headers: { 'Authorization': `Basic ${credentials}` }
    });
    const data = await res.json();
    if (data.success) {
      const i = data.data;
      alert(`Inquiry Details:\n\nName: ${i.name}\nEmail: ${i.email}\nCompany: ${i.company || 'N/A'}\nCountry: ${i.country || 'N/A'}\n\nMessage:\n${i.message}\n\nStatus: ${i.status}`);
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

async function handleImageUpload(e) {
  const files = e.target.files;
  if (!files || files.length === 0) return;
  
  const imageList = document.getElementById('uploaded-images-list');
  if (!imageList) return;
  
  for (const file of files) {
    const formData = new FormData();
    formData.append('file', file);
    
    try {
      const res = await fetch('/api/upload/image', {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${credentials}`
        },
        body: formData
      });
      
      const data = await res.json();
      if (data.success) {
        imageList.innerHTML += `
          <div class="uploaded-image-item">
            <img src="${data.data.url}" alt="Uploaded">
            <input type="hidden" name="images" value="${data.data.url}">
            <button type="button" class="btn btn-sm btn-danger" onclick="this.parentElement.remove()">Remove</button>
          </div>
        `;
      } else {
        alert(`Failed to upload: ${data.error}`);
      }
    } catch (err) {
      alert('Failed to upload image');
    }
  }
}

window.editProduct = function(id) {
  alert('Product edit form will be implemented. ID: ' + id);
};

window.editCategory = function(id) {
  alert('Category edit form will be implemented. ID: ' + id);
};
