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
    
    if (data.success && data.data.items.length > 0) {
      container.innerHTML = `
        <div class="table-container">
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Price</th>
                <th>MOQ</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              ${data.data.items.map(p => `
                <tr>
                  <td>${p.id}</td>
                  <td>${p.name}</td>
                  <td>${p.price ? '$' + p.price : '-'}</td>
                  <td>${p.min_order_qty}</td>
                  <td><span class="badge ${p.is_active ? 'badge-active' : 'badge-inactive'}">${p.is_active ? 'Active' : 'Inactive'}</span></td>
                  <td class="action-buttons">
                    <button class="btn btn-sm" onclick="editProduct(${p.id})">Edit</button>
                    <button class="btn btn-sm btn-danger" onclick="deleteProduct(${p.id})">Delete</button>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
        <div class="pagination">
          <button ${page === 1 ? 'disabled' : ''} onclick="loadProducts(${page - 1})">Previous</button>
          <span>Page ${page} of ${data.data.totalPages}</span>
          <button ${page >= data.data.totalPages ? 'disabled' : ''} onclick="loadProducts(${page + 1})">Next</button>
        </div>
      `;
    } else {
      container.innerHTML = '<p>No products found.</p>';
    }
  } catch (err) {
    container.innerHTML = '<p>Failed to load products.</p>';
  }
}

async function loadCategories() {
  const container = document.getElementById('category-table');
  if (!container) return;
  
  try {
    const res = await fetch('/api/categories', {
      headers: { 'Authorization': `Basic ${credentials}` }
    });
    const data = await res.json();
    
    if (data.success && data.data.length > 0) {
      container.innerHTML = `
        <div class="table-container">
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Slug</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              ${data.data.map(c => `
                <tr>
                  <td>${c.id}</td>
                  <td>${c.name}</td>
                  <td>${c.slug}</td>
                  <td><span class="badge ${c.is_active ? 'badge-active' : 'badge-inactive'}">${c.is_active ? 'Active' : 'Inactive'}</span></td>
                  <td class="action-buttons">
                    <button class="btn btn-sm" onclick="editCategory(${c.id})">Edit</button>
                    <button class="btn btn-sm btn-danger" onclick="deleteCategory(${c.id})">Delete</button>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      `;
    } else {
      container.innerHTML = '<p>No categories found.</p>';
    }
  } catch (err) {
    container.innerHTML = '<p>Failed to load categories.</p>';
  }
}

async function loadInquiries(page = 1) {
  const container = document.getElementById('inquiry-table');
  if (!container) return;
  
  try {
    const res = await fetch(`/api/inquiries?page=${page}&limit=20`, {
      headers: { 'Authorization': `Basic ${credentials}` }
    });
    const data = await res.json();
    
    if (data.success && data.data.items.length > 0) {
      container.innerHTML = `
        <div class="table-container">
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Email</th>
                <th>Message</th>
                <th>Status</th>
                <th>Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              ${data.data.items.map(i => `
                <tr>
                  <td>${i.id}</td>
                  <td>${i.name}</td>
                  <td>${i.email}</td>
                  <td>${i.message.slice(0, 50)}${i.message.length > 50 ? '...' : ''}</td>
                  <td><span class="badge badge-${i.status}">${i.status}</span></td>
                  <td>${new Date(i.created_at).toLocaleDateString()}</td>
                  <td class="action-buttons">
                    <button class="btn btn-sm" onclick="viewInquiry(${i.id})">View</button>
                    <button class="btn btn-sm" onclick="updateInquiryStatus(${i.id}, 'replied')">Reply</button>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
        <div class="pagination">
          <button ${page === 1 ? 'disabled' : ''} onclick="loadInquiries(${page - 1})">Previous</button>
          <span>Page ${page} of ${data.data.totalPages}</span>
          <button ${page >= data.data.totalPages ? 'disabled' : ''} onclick="loadInquiries(${page + 1})">Next</button>
        </div>
      `;
    } else {
      container.innerHTML = '<p>No inquiries found.</p>';
    }
  } catch (err) {
    container.innerHTML = '<p>Failed to load inquiries.</p>';
  }
}

async function loadSettings() {
  const container = document.getElementById('settings-form');
  if (!container) return;
  
  try {
    const res = await fetch('/api/settings');
    const data = await res.json();
    
    if (data.success) {
      container.innerHTML = Object.entries(data.data).map(([key, value]) => `
        <div class="form-group">
          <label for="${key}">${key.charAt(0).toUpperCase() + key.slice(1)}</label>
          <input type="text" id="${key}" name="${key}" value="${value || ''}">
        </div>
      `).join('') + '<button type="submit" class="btn">Save Settings</button>';
      
      container.addEventListener('submit', async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const settings = Object.fromEntries(formData);
        
        for (const [key, value] of Object.entries(settings)) {
          await fetch(`/api/settings/${key}`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Basic ${credentials}`
            },
            body: JSON.stringify({ value })
          });
        }
        alert('Settings saved successfully');
      });
    }
  } catch (err) {
    container.innerHTML = '<p>Failed to load settings.</p>';
  }
}

async function deleteProduct(id) {
  if (!confirm('Are you sure you want to delete this product?')) return;
  
  await fetch(`/api/admin/products/${id}`, {
    method: 'DELETE',
    headers: { 'Authorization': `Basic ${credentials}` }
  });
  loadProducts();
}

async function deleteCategory(id) {
  if (!confirm('Are you sure you want to delete this category?')) return;
  
  await fetch(`/api/admin/categories/${id}`, {
    method: 'DELETE',
    headers: { 'Authorization': `Basic ${credentials}` }
  });
  loadCategories();
}

async function updateInquiryStatus(id, status) {
  await fetch(`/api/admin/inquiries/${id}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Basic ${credentials}`
    },
    body: JSON.stringify({ status })
  });
  loadInquiries();
}

function viewInquiry(id) {
  alert('View inquiry details - implement modal');
}

function editProduct(id) {
  alert('Edit product - implement modal');
}

function editCategory(id) {
  alert('Edit category - implement modal');
}

document.getElementById('add-product-btn')?.addEventListener('click', () => {
  alert('Add product - implement modal');
});

document.getElementById('add-category-btn')?.addEventListener('click', () => {
  alert('Add category - implement modal');
});
