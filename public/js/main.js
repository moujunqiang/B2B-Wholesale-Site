document.addEventListener('DOMContentLoaded', () => {
  loadProducts();
  loadCategories();

  const form = document.getElementById('inquiry-form');
  if (form) {
    form.addEventListener('submit', handleInquirySubmit);
  }
});

async function loadProducts() {
  const container = document.getElementById('product-list');
  if (!container) return;

  try {
    const res = await fetch('/api/products?limit=6');
    const data = await res.json();
    if (data.success && data.data.items.length > 0) {
      container.innerHTML = data.data.items.map(product => `
        <div class="product-card">
          <img src="${product.images?.[0] || '/images/placeholder.png'}" alt="${product.name}" class="product-image">
          <div class="product-info">
            <h3 class="product-name">${product.name}</h3>
            ${product.price ? `<p class="product-price">$${product.price}</p>` : ''}
            <p class="product-moq">MOQ: ${product.min_order_qty} pcs</p>
            <button class="btn" onclick="showInquiryForm('${product.name}')">Send Inquiry</button>
          </div>
        </div>
      `).join('');
    } else {
      container.innerHTML = '<p>No products available.</p>';
    }
  } catch (err) {
    container.innerHTML = '<p>Failed to load products.</p>';
  }
}

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
    showError('Failed to submit inquiry. Please try again.');
  }
}

function showError(message) {
  const errorEl = document.getElementById('login-error') || createErrorElement();
  errorEl.textContent = message;
  errorEl.style.display = 'block';
  setTimeout(() => errorEl.style.display = 'none', 5000);
}

function showSuccess(message) {
  let successEl = document.querySelector('.success-message');
  if (!successEl) {
    successEl = document.createElement('div');
    successEl.className = 'success-message';
    document.getElementById('contact').appendChild(successEl);
  }
  successEl.textContent = message;
  successEl.style.display = 'block';
  setTimeout(() => successEl.style.display = 'none', 5000);
}

function createErrorElement() {
  const el = document.createElement('div');
  el.id = 'login-error';
  el.className = 'error-message';
  document.getElementById('contact').appendChild(el);
  return el;
}