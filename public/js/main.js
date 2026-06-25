// Global Image Fallback Handler for Security and No Broken Icons
window.addEventListener('error', function(event) {
  if (event.target && event.target.tagName === 'IMG') {
    const fallback = 'https://images.unsplash.com/photo-1559251606-c623743a6d76?auto=format&fit=crop&q=80&w=600';
    if (event.target.src !== fallback) {
      event.target.src = fallback;
    }
  }
}, true); // Capturing phase is mandatory for non-bubbling 'error' events

// Global Toast Notification System
function showToast(type, message) {
  let container = document.getElementById('toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toast-container';
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  toast.className = `custom-toast toast-${type.toLowerCase()}`;
  
  // Decide icon
  let icon = '🔔';
  if (type.toLowerCase() === 'success') icon = '✅';
  if (type.toLowerCase() === 'warning') icon = '⚠️';
  if (type.toLowerCase() === 'error') icon = '❌';
  if (type.toLowerCase() === 'info') icon = 'ℹ️';

  toast.innerHTML = `
    <div class="d-flex align-items-center">
      <span class="me-2 fs-5">${icon}</span>
      <span>${message}</span>
    </div>
    <button type="button" class="custom-toast-close" onclick="this.parentElement.remove()">&times;</button>
  `;

  container.appendChild(toast);
  
  // Trigger transition
  setTimeout(() => toast.classList.add('show'), 50);

  // Auto remove
  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => toast.remove(), 400);
  }, 4000);
}

// AJAX Helper to handle csrf tokens in requests
async function apiRequest(url, method = 'GET', data = null) {
  const headers = {
    'Accept': 'application/json',
    'X-Requested-With': 'XMLHttpRequest'
  };

  // Retrieve CSRF token if present on page
  const csrfMeta = document.querySelector('meta[name="csrf-token"]');
  if (csrfMeta) {
    headers['X-CSRF-Token'] = csrfMeta.getAttribute('content');
  }

  const config = { method, headers };

  if (data) {
    if (data instanceof FormData) {
      config.body = data;
    } else {
      headers['Content-Type'] = 'application/json';
      config.body = JSON.stringify(data);
    }
  }

  try {
    const response = await fetch(url, config);
    const result = await response.json();
    if (!response.ok) {
      throw new Error(result.message || 'Something went wrong');
    }
    return result;
  } catch (error) {
    throw error;
  }
}

// Live Search Autocomplete Suggestions
document.addEventListener('DOMContentLoaded', () => {
  const searchInput = document.getElementById('global-search-input');
  const suggestionsPanel = document.getElementById('search-suggestions');

  if (searchInput && suggestionsPanel) {
    let debounceTimeout = null;

    searchInput.addEventListener('input', () => {
      clearTimeout(debounceTimeout);
      const query = searchInput.value.trim();

      if (query.length < 2) {
        suggestionsPanel.innerHTML = '';
        suggestionsPanel.classList.add('d-none');
        return;
      }

      debounceTimeout = setTimeout(async () => {
        try {
          const res = await apiRequest(`/live-suggestions?query=${encodeURIComponent(query)}`);
          const items = res.data || [];

          if (items.length === 0) {
            suggestionsPanel.innerHTML = '<div class="p-3 text-muted">No toys found</div>';
          } else {
             suggestionsPanel.innerHTML = items.map(item => `
              <a href="/toys/${item.slug}" class="suggestion-item">
                <img src="${item.images[0] || 'https://images.unsplash.com/photo-1559251606-c623743a6d76?auto=format&fit=crop&q=80&w=250'}" class="suggestion-img" alt="${item.title}" onerror="this.onerror=null;this.src='https://images.unsplash.com/photo-1559251606-c623743a6d76?auto=format&fit=crop&q=80&w=250';">
                <div>
                  <div class="fw-bold text-white" style="font-size: 0.9rem;">${item.title}</div>
                  <div class="text-primary fw-bold" style="font-size: 0.85rem;">₹${item.price.toFixed(2)}</div>
                </div>
              </a>
            `).join('');
          }
          suggestionsPanel.classList.remove('d-none');
        } catch (err) {
          console.error(err);
        }
      }, 300);
    });

    // Close suggestion panel when clicking outside
    document.addEventListener('click', (e) => {
      if (!searchInput.contains(e.target) && !suggestionsPanel.contains(e.target)) {
        suggestionsPanel.innerHTML = '';
        suggestionsPanel.classList.add('d-none');
      }
    });
  }

  // Handle newsletter form submissions via AJAX
  const handleNewsletterSubmit = async (formElement) => {
    if (!formElement) return;
    formElement.addEventListener('submit', async (e) => {
      e.preventDefault();
      const emailInput = formElement.querySelector('input[type="email"]');
      const email = emailInput.value.trim();

      try {
        const res = await apiRequest('/newsletter/subscribe', 'POST', { email });
        showToast('Success', res.message);
        emailInput.value = '';
      } catch (err) {
        showToast('Error', err.message);
      }
    });
  };

  handleNewsletterSubmit(document.getElementById('newsletter-form'));
  handleNewsletterSubmit(document.getElementById('footer-newsletter-form'));

  // Handle contact form submission via AJAX
  const contactForm = document.getElementById('contact-form');
  if (contactForm) {
    contactForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const formData = new FormData(contactForm);
      const data = Object.fromEntries(formData.entries());

      try {
        const res = await apiRequest('/contact', 'POST', data);
        showToast('Success', res.message);
        contactForm.reset();
      } catch (err) {
        showToast('Error', err.message);
      }
    });
  }

  // Sticky navbar listener
  const navbar = document.getElementById('main-navbar');
  if (navbar) {
    window.addEventListener('scroll', () => {
      if (window.scrollY > 50) {
        navbar.classList.add('scrolled');
      } else {
        navbar.classList.remove('scrolled');
      }
    });
  }

  // Update badge counts and load active states (disabled in listing mode)
  // updateBadgeCounts();

  // Initialize countdown timer
  initCountdown();

  // Initialize Bootstrap Carousel manually to ensure automatic cycle
  const heroCarouselEl = document.getElementById('heroCarousel');
  if (heroCarouselEl) {
    const carouselInstance = new bootstrap.Carousel(heroCarouselEl, {
      interval: 4000,
      ride: 'carousel',
      wrap: true
    });
    carouselInstance.cycle();
  }
});

// Sync count badges in header (disabled in listing mode)
async function updateBadgeCounts() {
  return;
}

// AJAX Add to Cart
async function addToCart(productId, quantity = 1) {
  try {
    const res = await apiRequest('/cart/add', 'POST', { productId, quantity });
    showToast('Success', res.message);
    updateBadgeCounts();
  } catch (err) {
    showToast('Error', err.message);
  }
}

// AJAX Toggle Wishlist
async function toggleWishlist(productId, btnElement) {
  try {
    const res = await apiRequest('/wishlist/toggle', 'POST', { productId });
    showToast('Success', res.message);
    
    const heartIcon = btnElement.querySelector('i');
    if (res.data.isAdded) {
      if (heartIcon) heartIcon.className = 'bi bi-heart-fill text-danger';
      btnElement.classList.add('active');
    } else {
      if (heartIcon) heartIcon.className = 'bi bi-heart';
      btnElement.classList.remove('active');
    }

    updateBadgeCounts();
  } catch (err) {
    showToast('Error', err.message || 'Failed to update wishlist.');
  }
}

// Open Quick View Modal via AJAX
async function openQuickView(productId) {
  const modalElement = document.getElementById('quickViewModal');
  const contentArea = document.getElementById('quickview-modal-content');
  if (!modalElement || !contentArea) return;

  // Show a loading state first
  contentArea.innerHTML = `
    <div class="p-5 text-center">
      <div class="spinner-border text-primary" role="status">
        <span class="visually-hidden">Loading...</span>
      </div>
      <p class="text-muted mt-2 mb-0">Loading product details...</p>
    </div>
  `;

  const myModal = bootstrap.Modal.getOrCreateInstance(modalElement);
  myModal.show();

  try {
    const res = await apiRequest(`/toys/quickview/${productId}`);
    const product = res.data;
    
    const isOutOfStock = product.stock <= 0 || product.status === 'Out of Stock';
    const finalPrice = product.salePrice || product.price;
    const hasDiscount = product.salePrice && product.salePrice < product.price;
    const discountPct = hasDiscount ? Math.round(((product.price - product.salePrice) / product.price) * 100) : 0;
    
    let starsHtml = '';
    for (let i = 1; i <= 5; i++) {
      if (i <= Math.floor(product.rating)) {
        starsHtml += '<i class="bi bi-star-fill text-warning me-0.5"></i>';
      } else if (i - 0.5 <= product.rating) {
        starsHtml += '<i class="bi bi-star-half text-warning me-0.5"></i>';
      } else {
        starsHtml += '<i class="bi bi-star text-warning me-0.5"></i>';
      }
    }

    const categorySlug = product.category ? product.category.slug : '';
    let howToPlayHtml = '';
    if (categorySlug === 'educational-toys') {
      howToPlayHtml = `
        <div class="mt-4 p-3 rounded-3 border-start border-primary border-3 text-start w-100" style="background: rgba(255,255,255,0.04);">
          <h6 class="fw-bold text-white mb-2" style="font-size: 0.88rem;"><i class="bi bi-lightbulb-fill text-warning me-1"></i> How to Play & Learn:</h6>
          <ul class="mb-0 ps-3 text-white-50 small" style="line-height: 1.45;">
            <li>Sort blocks by shape, size, or pattern.</li>
            <li>Stack modules to build architectural elements.</li>
            <li>Promote recognition by naming colors & features.</li>
          </ul>
        </div>
      `;
    } else if (categorySlug === 'building-blocks') {
      howToPlayHtml = `
        <div class="mt-4 p-3 rounded-3 border-start border-primary border-3 text-start w-100" style="background: rgba(255,255,255,0.04);">
          <h6 class="fw-bold text-white mb-2" style="font-size: 0.88rem;"><i class="bi bi-bricks text-danger me-1"></i> Assembly Guide:</h6>
          <ul class="mb-0 ps-3 text-white-50 small" style="line-height: 1.45;">
            <li>Follow the step-by-step layout guide manual.</li>
            <li>Assemble components layer-by-layer starting with the base.</li>
            <li>Explore freeform building to boost design skills.</li>
          </ul>
        </div>
      `;
    } else if (categorySlug === 'remote-control-toys') {
      howToPlayHtml = `
        <div class="mt-4 p-3 rounded-3 border-start border-primary border-3 text-start w-100" style="background: rgba(255,255,255,0.04);">
          <h6 class="fw-bold text-white mb-2" style="font-size: 0.88rem;"><i class="bi bi-controller text-info me-1"></i> Operating Manual:</h6>
          <ul class="mb-0 ps-3 text-white-50 small" style="line-height: 1.45;">
            <li>Fully charge the Li-Ion battery pack prior to use.</li>
            <li>Power on the toy, then pair the 2.4GHz controller.</li>
            <li>Steer on flat terrain; wipe clean after outdoor drives.</li>
          </ul>
        </div>
      `;
    } else if (categorySlug === 'stem-toys') {
      howToPlayHtml = `
        <div class="mt-4 p-3 rounded-3 border-start border-primary border-3 text-start w-100" style="background: rgba(255,255,255,0.04);">
          <h6 class="fw-bold text-white mb-2" style="font-size: 0.88rem;"><i class="bi bi-cpu-fill text-success me-1"></i> STEM Activity:</h6>
          <ul class="mb-0 ps-3 text-white-50 small" style="line-height: 1.45;">
            <li>Prep a flat workspace and open the experiment guide.</li>
            <li>Connect circuits, sensors, or gears exactly as illustrated.</li>
            <li>Observe scientific reactions or run custom code configurations.</li>
          </ul>
        </div>
      `;
    } else {
      howToPlayHtml = `
        <div class="mt-4 p-3 rounded-3 border-start border-primary border-3 text-start w-100" style="background: rgba(255,255,255,0.04);">
          <h6 class="fw-bold text-white mb-2" style="font-size: 0.88rem;"><i class="bi bi-box2-fill text-secondary me-1"></i> Care & Display:</h6>
          <ul class="mb-0 ps-3 text-white-50 small" style="line-height: 1.45;">
            <li>Carefully clean details with a dry micro-fiber cloth.</li>
            <li>Mount securely on the premium display stand.</li>
            <li>Enjoy high-end table top play or shelf collection.</li>
          </ul>
        </div>
      `;
    }

    contentArea.innerHTML = `
      <div class="row g-0">
        <div class="col-md-6 d-flex flex-column align-items-center justify-content-center p-4" style="min-height: 380px; background: rgba(0,0,0,0.2);">
          <img src="${product.images[0] || 'https://images.unsplash.com/photo-1559251606-c623743a6d76?auto=format&fit=crop&q=80&w=600'}" class="img-fluid rounded shadow-sm" alt="${product.title}" style="max-height: 220px; object-fit: contain;" onerror="this.onerror=null;this.src='https://images.unsplash.com/photo-1559251606-c623743a6d76?auto=format&fit=crop&q=80&w=600';">
          ${howToPlayHtml}
        </div>
        <div class="col-md-6 p-5 d-flex flex-column justify-content-center">
          <span class="badge bg-primary text-white rounded-pill px-3 py-1 mb-2 align-self-start fw-bold" style="font-size: 0.75rem;">
            ${product.category ? product.category.name : 'Toys'}
          </span>
          <h3 class="fw-extrabold text-white mb-2">${product.title}</h3>
          <div class="d-flex align-items-center mb-3">
            <div class="me-2">${starsHtml}</div>
            <span class="text-white-50 small">(${product.ratingCount || 0} reviews)</span>
          </div>
          <div class="mb-4">
            ${hasDiscount ? `
              <span class="text-decoration-line-through text-muted me-2" style="font-size: 1.1rem;">₹${product.price.toFixed(2)}</span>
              <span class="text-primary fw-extrabold fs-3">₹${finalPrice.toFixed(2)}</span>
            ` : `
              <span class="text-white fw-extrabold fs-3">₹${finalPrice.toFixed(2)}</span>
            `}
          </div>
          <p class="text-white-50 mb-4" style="font-size: 0.95rem;">${product.shortDescription || product.description || 'Discover a world of imaginative play with this premium ToyBerry selection.'}</p>
          
          <div class="d-flex gap-3">
            ${isOutOfStock ? `
              <button class="btn btn-outline-secondary w-100 py-3 fw-bold" disabled>Out of Stock</button>
            ` : `
              <button class="btn-pill btn-mint w-100 py-3 fw-bold justify-content-center">
                <i class="bi bi-shop me-2"></i> Available In Store
              </button>
            `}
            <a href="/toys/${product.slug}" class="btn-pill btn-outline-white w-100 py-3 fw-bold text-center justify-content-center">View Details</a>
          </div>
        </div>
      </div>
    `;
  } catch (err) {
    contentArea.innerHTML = `
      <div class="p-5 text-center text-danger">
        <i class="bi bi-exclamation-triangle fs-1"></i>
        <p class="mt-2 mb-0">Failed to load product details: ${err.message}</p>
      </div>
    `;
  }
}

// Countdown timer for flash deals
function initCountdown() {
  const cdContainer = document.getElementById('flash-deal-countdown');
  if (!cdContainer) return;

  const endTimeStr = cdContainer.getAttribute('data-end-time');
  const endTime = new Date(endTimeStr).getTime();

  const hoursEl = document.getElementById('cd-hours');
  const minsEl = document.getElementById('cd-mins');
  const secsEl = document.getElementById('cd-secs');

  function updateTimer() {
    const now = new Date().getTime();
    const diff = endTime - now;

    if (diff <= 0) {
      if (hoursEl) hoursEl.textContent = '00';
      if (minsEl) minsEl.textContent = '00';
      if (secsEl) secsEl.textContent = '00';
      return;
    }

    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const secs = Math.floor((diff % (1000 * 60)) / 1000);

    if (hoursEl) hoursEl.textContent = hours.toString().padStart(2, '0');
    if (minsEl) minsEl.textContent = mins.toString().padStart(2, '0');
    if (secsEl) secsEl.textContent = secs.toString().padStart(2, '0');
  }

  updateTimer();
  setInterval(updateTimer, 1000);
}

// Delegated click handler for interactive product actions (CSP safe)
document.addEventListener('click', function(e) {
  // 1. Add to Cart Button
  const cartBtn = e.target.closest('[data-action="add-to-cart"]');
  if (cartBtn) {
    e.preventDefault();
    const pid = cartBtn.getAttribute('data-product-id');
    const qty = parseInt(cartBtn.getAttribute('data-qty') || '1', 10);
    addToCart(pid, qty);
    return;
  }

  // 2. Wishlist Button
  const wishlistBtn = e.target.closest('[data-action="wishlist"]');
  if (wishlistBtn) {
    e.preventDefault();
    const pid = wishlistBtn.getAttribute('data-product-id');
    toggleWishlist(pid, wishlistBtn);
    return;
  }

  // 3. Quick View Button
  const quickViewBtn = e.target.closest('[data-action="quick-view"]');
  if (quickViewBtn) {
    e.preventDefault();
    const pid = quickViewBtn.getAttribute('data-product-id');
    openQuickView(pid);
    return;
  }

  // 4. Quick View Add To Cart
  const qvCartBtn = e.target.closest('[data-action="quickview-add-to-cart"]');
  if (qvCartBtn) {
    e.preventDefault();
    const pid = qvCartBtn.getAttribute('data-product-id');
    addToCart(pid, 1);
    const modalEl = document.getElementById('quickViewModal');
    if (modalEl) {
      const modalInstance = bootstrap.Modal.getOrCreateInstance(modalEl);
      modalInstance.hide();
    }
    return;
  }
});
