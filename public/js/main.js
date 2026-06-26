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

  // Set active link based on current path
  const currentPath = window.location.pathname;
  const navLinks = document.querySelectorAll('#main-navbar .nav-link');
  navLinks.forEach(link => {
    const href = link.getAttribute('href');
    if (href === currentPath || (href !== '/' && currentPath.startsWith(href))) {
      link.classList.add('active');
    } else {
      link.classList.remove('active');
    }
  });

  // Global Cursor Trail Animation
  const cursor = document.getElementById('cursor');
  if (cursor) {
    document.addEventListener('mousemove', (e) => {
      cursor.style.transform = `translate(${e.clientX - 10}px, ${e.clientY - 10}px)`;
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

    const skuVal = product.sku || 'TB-' + product._id.toString().slice(-6).toUpperCase();
    const saveAmount = hasDiscount ? (product.price - product.salePrice) : 0;
    const categoryName = product.category ? product.category.name : 'Toys';
    const brandName = product.brand ? product.brand.name : 'ToyBerry Heritage';

    let ageGroup = '3+ Years';
    if (product.specs) {
      if (typeof product.specs.get === 'function') {
        ageGroup = product.specs.get('ageGroup') || ageGroup;
      } else {
        ageGroup = product.specs.ageGroup || ageGroup;
      }
    }
    if (ageGroup === '3+ Years' && product.tags) {
      const foundAge = product.tags.find(t => t.toLowerCase().includes('age') || t.toLowerCase().includes('years'));
      if (foundAge) ageGroup = foundAge;
    }

    let material = 'Organic Wood';
    if (product.specs) {
      if (typeof product.specs.get === 'function') {
        material = product.specs.get('material') || material;
      } else {
        material = product.specs.material || material;
      }
    }

    let galleryHtml = '';
    if (product.images && product.images.length > 0) {
      galleryHtml = `<div class="d-flex gap-2 mt-3 flex-wrap justify-content-center w-100">`;
      product.images.forEach((img, idx) => {
        galleryHtml += `
          <img src="${img}" class="qv-thumb-img ${idx === 0 ? 'active' : ''}" data-index="${idx}" 
               style="width: 50px; height: 50px; border-radius: 8px; border: 1px solid ${idx === 0 ? '#111111' : '#E5E5E5'}; object-fit: cover; cursor: pointer; transition: all 0.2s ease; background: #ffffff;"
               onclick="document.getElementById('qv-main-img').src='${img}'; document.querySelectorAll('.qv-thumb-img').forEach(el=>el.style.borderColor='#E5E5E5'); this.style.borderColor='#111111';">
        `;
      });
      galleryHtml += `</div>`;
    }

    const categorySlug = product.category ? product.category.slug : '';
    let howToPlayHtml = '';
    if (categorySlug === 'educational-toys') {
      howToPlayHtml = `
        <div class="mt-4 p-3 w-100" style="background: #ffffff; border: 1px solid #111111; border-radius: 12px; text-align: left;">
          <h6 style="font-family: 'DM Sans', sans-serif; font-size: 0.72rem; font-weight: 800; letter-spacing: 0.5px; color: #111111 !important; text-transform: uppercase; margin-bottom: 8px;"><i class="bi bi-lightbulb-fill text-warning me-1"></i> How to Play & Learn</h6>
          <ul class="mb-0 ps-3 small" style="line-height: 1.45; font-size: 0.78rem; color: #555555 !important; list-style-type: disc;">
            <li style="color: #555555 !important; margin-bottom: 4px;">Sort blocks by shape, size, or pattern.</li>
            <li style="color: #555555 !important; margin-bottom: 4px;">Stack modules to build architectural elements.</li>
            <li style="color: #555555 !important;">Promote recognition by naming colors & features.</li>
          </ul>
        </div>
      `;
    } else if (categorySlug === 'building-blocks') {
      howToPlayHtml = `
        <div class="mt-4 p-3 w-100" style="background: #ffffff; border: 1px solid #111111; border-radius: 12px; text-align: left;">
          <h6 style="font-family: 'DM Sans', sans-serif; font-size: 0.72rem; font-weight: 800; letter-spacing: 0.5px; color: #111111 !important; text-transform: uppercase; margin-bottom: 8px;"><i class="bi bi-bricks text-danger me-1"></i> Assembly Guide</h6>
          <ul class="mb-0 ps-3 small" style="line-height: 1.45; font-size: 0.78rem; color: #555555 !important; list-style-type: disc;">
            <li style="color: #555555 !important; margin-bottom: 4px;">Follow the step-by-step layout guide manual.</li>
            <li style="color: #555555 !important; margin-bottom: 4px;">Assemble components layer-by-layer starting with the base.</li>
            <li style="color: #555555 !important;">Explore freeform building to boost design skills.</li>
          </ul>
        </div>
      `;
    } else if (categorySlug === 'remote-control-toys') {
      howToPlayHtml = `
        <div class="mt-4 p-3 w-100" style="background: #ffffff; border: 1px solid #111111; border-radius: 12px; text-align: left;">
          <h6 style="font-family: 'DM Sans', sans-serif; font-size: 0.72rem; font-weight: 800; letter-spacing: 0.5px; color: #111111 !important; text-transform: uppercase; margin-bottom: 8px;"><i class="bi bi-controller text-info me-1"></i> Operating Manual</h6>
          <ul class="mb-0 ps-3 small" style="line-height: 1.45; font-size: 0.78rem; color: #555555 !important; list-style-type: disc;">
            <li style="color: #555555 !important; margin-bottom: 4px;">Fully charge the Li-Ion battery pack prior to use.</li>
            <li style="color: #555555 !important; margin-bottom: 4px;">Power on the toy, then pair the 2.4GHz controller.</li>
            <li style="color: #555555 !important;">Steer on flat terrain; wipe clean after outdoor drives.</li>
          </ul>
        </div>
      `;
    } else if (categorySlug === 'stem-toys') {
      howToPlayHtml = `
        <div class="mt-4 p-3 w-100" style="background: #ffffff; border: 1px solid #111111; border-radius: 12px; text-align: left;">
          <h6 style="font-family: 'DM Sans', sans-serif; font-size: 0.72rem; font-weight: 800; letter-spacing: 0.5px; color: #111111 !important; text-transform: uppercase; margin-bottom: 8px;"><i class="bi bi-cpu-fill text-success me-1"></i> STEM Activity</h6>
          <ul class="mb-0 ps-3 small" style="line-height: 1.45; font-size: 0.78rem; color: #555555 !important; list-style-type: disc;">
            <li style="color: #555555 !important; margin-bottom: 4px;">Prep a flat workspace and open the experiment guide.</li>
            <li style="color: #555555 !important; margin-bottom: 4px;">Connect circuits, sensors, or gears exactly as illustrated.</li>
            <li style="color: #555555 !important;">Observe scientific reactions or run custom code configurations.</li>
          </ul>
        </div>
      `;
    } else {
      howToPlayHtml = `
        <div class="mt-4 p-3 w-100" style="background: #ffffff; border: 1px solid #111111; border-radius: 12px; text-align: left;">
          <h6 style="font-family: 'DM Sans', sans-serif; font-size: 0.72rem; font-weight: 800; letter-spacing: 0.5px; color: #111111 !important; text-transform: uppercase; margin-bottom: 8px;"><i class="bi bi-box2-fill text-secondary me-1"></i> Care & Display</h6>
          <ul class="mb-0 ps-3 small" style="line-height: 1.45; font-size: 0.78rem; color: #555555 !important; list-style-type: disc;">
            <li style="color: #555555 !important; margin-bottom: 4px;">Carefully clean details with a dry micro-fiber cloth.</li>
            <li style="color: #555555 !important; margin-bottom: 4px;">Mount securely on the premium display stand.</li>
            <li style="color: #555555 !important;">Enjoy high-end table top play or shelf collection.</li>
          </ul>
        </div>
      `;
    }

    contentArea.innerHTML = `
      <div class="row g-0">
        <!-- Left Column: Cream Background -->
        <div class="col-md-6 p-4 d-flex flex-column align-items-center justify-content-center" style="background-color: #FAF5EE;">
          <div style="width: 100%; max-width: 320px; display: flex; flex-direction: column; align-items: center;">
            <img id="qv-main-img" src="${product.images[0] || 'https://images.unsplash.com/photo-1559251606-c623743a6d76?auto=format&fit=crop&q=80&w=600'}" class="img-fluid" alt="${product.title}" style="max-height: 260px; object-fit: contain; border-radius: 16px; border: 1px solid #111111; background: #ffffff; padding: 12px; box-shadow: 0 4px 15px rgba(0,0,0,0.05);" onerror="this.onerror=null;this.src='https://images.unsplash.com/photo-1559251606-c623743a6d76?auto=format&fit=crop&q=80&w=600';">
            ${galleryHtml}
            ${howToPlayHtml}
          </div>
        </div>
        <!-- Right Column: Dark Charcoal Background -->
        <div class="col-md-6 p-5 d-flex flex-column justify-content-between" style="background-color: #111111; color: #ffffff; min-height: 480px;">
          <div>
            <!-- SKU Badge -->
            <div class="mb-3">
              <span style="background-color: #E8291C; color: #ffffff; font-family: 'DM Sans', sans-serif; font-size: 0.68rem; font-weight: 800; letter-spacing: 0.5px; padding: 6px 12px; border-radius: 4px; display: inline-block;">SKU: ${skuVal}</span>
            </div>
            <!-- Title -->
            <h2 style="font-family: 'Fraunces', serif; font-size: 1.95rem; font-weight: 700; color: #ffffff; margin-bottom: 0.75rem; line-height: 1.3;">${product.title}</h2>
            <!-- Price and Discount -->
            <div class="d-flex align-items-center gap-2 mb-4 flex-wrap">
              <span style="font-family: 'DM Sans', sans-serif; font-size: 1.85rem; font-weight: 800; color: #ffffff;">₹${finalPrice.toFixed(2)}</span>
              ${hasDiscount ? `
                <span style="font-family: 'DM Sans', sans-serif; font-size: 1.1rem; text-decoration: line-through; color: #888888; margin-left: 6px;">₹${product.price.toFixed(2)}</span>
                <span style="background-color: #12B76A; color: #ffffff; font-family: 'DM Sans', sans-serif; font-size: 0.7rem; font-weight: 800; padding: 4px 8px; border-radius: 4px; margin-left: 8px;">SAVE ₹${saveAmount.toFixed(2)}</span>
              ` : ''}
            </div>
            
            <!-- Specs Grid (2x2) -->
            <div class="row g-2 mb-4">
              <div class="col-6">
                <div style="border: 1px solid rgba(255, 255, 255, 0.15); border-radius: 8px; padding: 10px 14px; background: rgba(255, 255, 255, 0.02);">
                  <div style="font-family: 'DM Sans', sans-serif; font-size: 0.62rem; font-weight: 800; color: rgba(255, 255, 255, 0.4); letter-spacing: 0.5px; text-transform: uppercase; margin-bottom: 2px;">Category</div>
                  <div style="font-family: 'DM Sans', sans-serif; font-size: 0.82rem; font-weight: 500; color: #ffffff; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;" title="${categoryName}">${categoryName}</div>
                </div>
              </div>
              <div class="col-6">
                <div style="border: 1px solid rgba(255, 255, 255, 0.15); border-radius: 8px; padding: 10px 14px; background: rgba(255, 255, 255, 0.02);">
                  <div style="font-family: 'DM Sans', sans-serif; font-size: 0.62rem; font-weight: 800; color: rgba(255, 255, 255, 0.4); letter-spacing: 0.5px; text-transform: uppercase; margin-bottom: 2px;">Age Group</div>
                  <div style="font-family: 'DM Sans', sans-serif; font-size: 0.82rem; font-weight: 500; color: #ffffff; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;" title="${ageGroup}">${ageGroup}</div>
                </div>
              </div>
              <div class="col-6">
                <div style="border: 1px solid rgba(255, 255, 255, 0.15); border-radius: 8px; padding: 10px 14px; background: rgba(255, 255, 255, 0.02);">
                  <div style="font-family: 'DM Sans', sans-serif; font-size: 0.62rem; font-weight: 800; color: rgba(255, 255, 255, 0.4); letter-spacing: 0.5px; text-transform: uppercase; margin-bottom: 2px;">Material</div>
                  <div style="font-family: 'DM Sans', sans-serif; font-size: 0.82rem; font-weight: 500; color: #ffffff; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;" title="${material}">${material}</div>
                </div>
              </div>
              <div class="col-6">
                <div style="border: 1px solid rgba(255, 255, 255, 0.15); border-radius: 8px; padding: 10px 14px; background: rgba(255, 255, 255, 0.02);">
                  <div style="font-family: 'DM Sans', sans-serif; font-size: 0.62rem; font-weight: 800; color: rgba(255, 255, 255, 0.4); letter-spacing: 0.5px; text-transform: uppercase; margin-bottom: 2px;">Brand</div>
                  <div style="font-family: 'DM Sans', sans-serif; font-size: 0.82rem; font-weight: 500; color: #ffffff; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;" title="${brandName}">${brandName}</div>
                </div>
              </div>
            </div>
          </div>
          
          <!-- Bottom Action Buttons -->
          <div class="d-flex gap-3 mt-3">
            ${isOutOfStock ? `
              <button class="btn w-100 py-3" style="border: 1px solid rgba(255, 255, 255, 0.15); background: transparent; color: rgba(255, 255, 255, 0.3); border-radius: 30px; font-weight: 800; font-size: 0.8rem; letter-spacing: 0.5px; text-transform: uppercase; cursor: not-allowed;" disabled>OUT OF STOCK</button>
            ` : `
              <button class="btn w-100 py-3" style="border: 1px solid rgba(255, 255, 255, 0.4); background: transparent; color: #ffffff; border-radius: 30px; font-weight: 800; font-size: 0.8rem; letter-spacing: 0.5px; text-transform: uppercase; transition: all 0.2s ease;" onmouseover="this.style.background='rgba(255,255,255,0.08)'" onmouseout="this.style.background='transparent'">AVAILABLE IN STORE</button>
            `}
            <a href="/toys/${product.slug}" class="btn w-100 py-3 d-flex align-items-center justify-content-center" style="background-color: #E8291C; border: 1px solid #E8291C; color: #ffffff; border-radius: 30px; font-weight: 800; font-size: 0.8rem; letter-spacing: 0.5px; text-transform: uppercase; text-decoration: none; transition: all 0.2s ease;" onmouseover="this.style.backgroundColor='#ff3e30'; this.style.borderColor='#ff3e30';" onmouseout="this.style.backgroundColor='#E8291C'; this.style.borderColor='#E8291C';">VIEW DETAILS</a>
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
