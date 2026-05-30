document.addEventListener('DOMContentLoaded', () => {
  loadProducts();
  loadSolutions();
  loadCases();
  
  const form = document.getElementById('inquiry-form');
  if (form) {
    form.addEventListener('submit', handleInquirySubmit);
  }
  
  const popupForm = document.getElementById('popup-form');
  if (popupForm) {
    popupForm.addEventListener('submit', handlePopupSubmit);
  }
  
  const backToTop = document.getElementById('back-to-top');
  if (backToTop) {
    backToTop.addEventListener('click', (e) => {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }
  
  if (window.popupSettings && window.popupSettings.is_enabled) {
    const delay = (window.popupSettings.delay_seconds || 15) * 1000;
    setTimeout(showPopup, delay);
  }
});

let popupShown = false;

function showPopup() {
  if (popupShown) return;
  const popup = document.getElementById('inquiry-popup');
  if (popup) {
    popup.style.display = 'flex';
    if (window.popupSettings) {
      const titleEl = document.getElementById('popup-title');
      const descEl = document.getElementById('popup-description');
      if (titleEl && window.popupSettings.title) titleEl.textContent = window.popupSettings.title;
      if (descEl && window.popupSettings.description) descEl.textContent = window.popupSettings.description;
    }
    popupShown = true;
  }
}

window.closePopup = function() {
  const popup = document.getElementById('inquiry-popup');
  if (popup) {
    popup.style.display = 'none';
  }
};

const state = {
  currentPage: 1,
  pageSize: 6,
  totalProducts: 0,
};

async function loadProducts() {
  const container = document.getElementById('product-list');
  if (!container) return;

  try {
    const res = await fetch(`/api/products?featured=true&limit=6`);
    const data = await res.json();
    
    if (data.success && data.data.items && data.data.items.length > 0) {
      container.innerHTML = data.data.items.map(product => `
        <div class="product-card">
          <img src="${product.images?.[0] || '/images/placeholder.png'}" alt="${product.name}" class="product-image" onerror="this.src='/images/placeholder.png'">
          <div class="product-info">
            <h3 class="product-name">${product.name}</h3>
            ${product.short_description ? `<p class="product-desc">${product.short_description}</p>` : ''}
            ${product.price ? `<p class="product-price">$${product.price}</p>` : ''}
            <p class="product-moq">MOQ: ${product.min_order_qty} pcs</p>
            <a href="/products" class="btn btn-outline">View Details</a>
          </div>
        </div>
      `).join('');
    } else {
      container.innerHTML = '<p>No products available.</p>';
    }
  } catch (err) {
    console.error('Failed to load products:', err);
    container.innerHTML = '<p>Failed to load products.</p>';
  }
}

async function loadSolutions() {
  const container = document.getElementById('solution-list');
  if (!container) return;

  try {
    const res = await fetch('/api/solutions?featured=true');
    const data = await res.json();
    
    if (data.success && data.data && data.data.length > 0) {
      container.innerHTML = data.data.map(item => `
        <div class="solution-card">
          <img src="${item.images?.[0] || '/images/placeholder.png'}" alt="${item.title}" onerror="this.src='/images/placeholder.png'">
          <div class="content">
            <h3>${item.title}</h3>
            <p>${item.short_description || ''}</p>
            <a href="/solutions" class="btn">Learn More</a>
          </div>
        </div>
      `).join('');
    }
  } catch (err) {
    console.error('Failed to load solutions:', err);
  }
}

async function loadCases() {
  const container = document.getElementById('case-list');
  if (!container) return;

  try {
    const res = await fetch('/api/cases?featured=true');
    const data = await res.json();
    
    if (data.success && data.data && data.data.length > 0) {
      container.innerHTML = data.data.map(item => `
        <div class="case-card">
          <img src="${item.images?.[0] || '/images/placeholder.png'}" alt="${item.title}" onerror="this.src='/images/placeholder.png'">
          <div class="content">
            <h3>${item.title}</h3>
            <p>${item.client_name ? `Client: ${item.client_name}` : ''}</p>
            <a href="/cases" class="btn btn-outline">Read More</a>
          </div>
        </div>
      `).join('');
    }
  } catch (err) {
    console.error('Failed to load cases:', err);
  }
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
      showSuccess(form, 'Inquiry submitted successfully! We will contact you soon.');
      form.reset();
    } else {
      showError(form, result.error || 'Failed to submit inquiry');
    }
  } catch (err) {
    console.error('Inquiry submit error:', err);
    showError(form, 'Failed to submit inquiry. Please try again.');
  }
}

async function handlePopupSubmit(e) {
  e.preventDefault();
  const form = e.target;
  const formData = new FormData(form);
  const data = Object.fromEntries(formData);

  try {
    const res = await fetch('/api/leads', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    const result = await res.json();
    if (result.success) {
      alert('Thank you! We will contact you within 24 hours.');
      closePopup();
      form.reset();
    } else {
      alert(result.error || 'Failed to submit. Please try again.');
    }
  } catch (err) {
    console.error('Lead submit error:', err);
    alert('Failed to submit. Please try again.');
  }
}

function showError(form, message) {
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

function showSuccess(form, message) {
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
