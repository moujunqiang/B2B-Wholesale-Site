document.addEventListener('DOMContentLoaded', () => {
  loadProducts();
  loadCategories();

  const form = document.getElementById('inquiry-form');
  if (form) {
    form.addEventListener('submit', handleInquirySubmit);
  }
});

const state = {
  currentPage: 1,
  pageSize: 6,
  totalProducts: 0,
};

async function loadProducts() {
  const container = document.getElementById('product-list');
  if (!container) return;

  try {
    const res = await fetch(`/api/products?page=${state.currentPage}&limit=${state.pageSize}`);
    const data = await res.json();
    
    if (data.success && data.data.items.length > 0) {
      state.totalProducts = data.data.total;
      container.innerHTML = data.data.items.map(product => `
        <div class="product-card">
          <img src="${product.images?.[0] || '/images/placeholder.png'}" alt="${product.name}" class="product-image" onerror="this.src='/images/placeholder.png'">
          <div class="product-info">
            <h3 class="product-name">${product.name}</h3>
            ${product.short_description ? `<p class="product-desc">${product.short_description}</p>` : ''}
            ${product.price ? `<p class="product-price">$${product.price}</p>` : ''}
            <p class="product-moq">MOQ: ${product.min_order_qty} pcs</p>
            <button class="btn" onclick="showInquiryForm('${product.name}')">Send Inquiry</button>
          </div>
        </div>
      `).join('');
      
      renderPagination(data.data.page, data.data.totalPages);
    } else {
      container.innerHTML = '<p>No products available.</p>';
      document.getElementById('pagination')!.innerHTML = '';
    }
  } catch (err) {
    console.error('Failed to load products:', err);
    container.innerHTML = '<p>Failed to load products.</p>';
  }
}

function renderPagination(currentPage, totalPages) {
  const paginationContainer = document.getElementById('pagination');
  if (!paginationContainer) return;
  
  if (totalPages <= 1) {
    paginationContainer.innerHTML = '';
    return;
  }

  let html = '<div class="pagination-btns">';
  
  if (currentPage > 1) {
    html += `<button class="btn btn-outline" onclick="loadPage(${currentPage - 1})">Previous</button>`;
  }
  
  for (let i = 1; i <= totalPages; i++) {
    if (i === 1 || i === totalPages || (i >= currentPage - 1 && i <= currentPage + 1)) {
      html += `<button class="btn ${i === currentPage ? 'btn-primary' : 'btn-outline'}" onclick="loadPage(${i})">${i}</button>`;
    } else if (i === currentPage - 2 || i === currentPage + 2) {
      html += '<span class="pagination-ellipsis">...</span>';
    }
  }
  
  if (currentPage < totalPages) {
    html += `<button class="btn btn-outline" onclick="loadPage(${currentPage + 1})">Next</button>`;
  }
  
  html += '</div>';
  html += `<p class="pagination-info">Page ${currentPage} of ${totalPages} (${state.totalProducts} products)</p>`;
  
  paginationContainer.innerHTML = html;
}

window.loadPage = function(page) {
  state.currentPage = page;
  loadProducts();
  window.scrollTo({ top: 0, behavior: 'smooth' });
};

async function loadCategories() {
  const container = document.getElementById('category-list');
  if (!container) return;

  try {
    const res = await fetch('/api/categories');
    const data = await res.json();
    if (data.success && data.data.length > 0) {
      container.innerHTML = data.data.map(cat => `
        <div class="category-card">
          <div class="category-info">
            <h3 class="category-name">${cat.name}</h3>
            <p>${cat.description || ''}</p>
          </div>
        </div>
      `).join('');
    }
  } catch (err) {
    console.error('Failed to load categories');
  }
}

function showInquiryForm(productName) {
  const messageField = document.getElementById('message');
  if (messageField) {
    messageField.value = `I'm interested in ${productName}. Please provide more details.`;
  }
  document.getElementById('contact').scrollIntoView({ behavior: 'smooth' });
}

async function handleInquirySubmit(e) {
  e.preventDefault();
  const form = e.target;
  const formData = new FormData(form);
  const data = Object.fromEntries(formData);

  try {
    const res = await fetch('/api/inquiries', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    const result = await res.json();
    if (result.success) {
      showSuccess('Inquiry submitted successfully! We will contact you soon.');
      form.reset();
    } else {
      showError(result.error || 'Failed to submit inquiry');
    }
  } catch (err) {
    console.error('Inquiry submit error:', err);
    showError('Failed to submit inquiry. Please try again.');
  }
}

function showError(message) {
  const form = document.getElementById('inquiry-form');
  if (!form) return;
  
  let errorEl = form.querySelector('.error-message');
  if (!errorEl) {
    errorEl = document.createElement('div');
    errorEl.className = 'error-message';
    form.insertBefore(errorEl, form.firstChild);
  }
  
  errorEl.textContent = message;
  errorEl.style.display = 'block';
  setTimeout(() => errorEl.style.display = 'none', 5000);
}

function showSuccess(message) {
  const form = document.getElementById('inquiry-form');
  if (!form) return;
  
  let successEl = form.querySelector('.success-message');
  if (!successEl) {
    successEl = document.createElement('div');
    successEl.className = 'success-message';
    form.insertBefore(successEl, form.firstChild);
  }
  
  successEl.textContent = message;
  successEl.style.display = 'block';
  setTimeout(() => successEl.style.display = 'none', 5000);
}
