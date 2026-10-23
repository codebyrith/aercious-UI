/**
 * AERCIOUS // AVANT-GARDE MINIMALIST STREETWEAR
 * Clean White Edition — Multi-Page SPA Engine & Interactive PDP Controller
 */

(function () {
  'use strict';

  // ---------------------------------------------------------------------------
  // State Management
  // ---------------------------------------------------------------------------
  const State = {
    products: [],
    reels: [],
    activeProduct: null,
    activePage: 'home',
    selectedSizePDP: 'M',
    pdpQty: 1,
    activeThumbIndex: 0,
    cart: [],
    activeCurrency: 'INR',
    currentReviewFilter: 'all',
    currencyRates: {
      INR: { symbol: '₹', rate: 1 },
      USD: { symbol: '$', rate: 0.012 },
      EUR: { symbol: '€', rate: 0.011 },
      GBP: { symbol: '£', rate: 0.0095 }
    }
  };

  // ---------------------------------------------------------------------------
  // Helpers
  // ---------------------------------------------------------------------------
  function formatPrice(amountINR) {
    const curr = State.currencyRates[State.activeCurrency];
    const converted = amountINR * curr.rate;
    if (State.activeCurrency === 'INR') {
      return `${curr.symbol} ${Math.round(converted).toLocaleString('en-IN')}`;
    }
    return `${curr.symbol}${converted.toFixed(2)}`;
  }

  function saveCart() {
    localStorage.setItem('aercious_white_cart', JSON.stringify(State.cart));
  }

  function loadCart() {
    try {
      const stored = localStorage.getItem('aercious_white_cart');
      if (stored) State.cart = JSON.parse(stored);
    } catch (e) {
      console.warn("Cart read note:", e);
    }
  }

  // ---------------------------------------------------------------------------
  // DOM References
  // ---------------------------------------------------------------------------
  const DOM = {
    siteHeader: document.getElementById('siteHeader'),
    navLinks: document.querySelectorAll('.nav-link'),
    currencySelect: document.getElementById('currencySelect'),
    cartTriggerBtn: document.getElementById('cartTriggerBtn'),
    cartDrawer: document.getElementById('cartDrawer'),
    cartOverlay: document.getElementById('cartOverlay'),
    cartCloseBtn: document.getElementById('cartCloseBtn'),
    cartCountBadge: document.getElementById('cartCountBadge'),
    cartItemsBody: document.getElementById('cartItemsBody'),
    cartSubtotal: document.getElementById('cartSubtotal'),
    cartGrandTotal: document.getElementById('cartGrandTotal'),
    shippingProgressFill: document.getElementById('shippingProgressFill'),
    shippingStatusText: document.getElementById('shippingStatusText'),
    
    // Page Views
    pageHome: document.getElementById('pageHome'),
    pageShop: document.getElementById('pageShop'),
    pagePDP: document.getElementById('pagePDP'),
    pageAbout: document.getElementById('pageAbout'),
    pageContact: document.getElementById('pageContact'),

    // Product & Video Grids
    homeProductsGrid: document.getElementById('homeProductsGrid'),
    shopProductsGrid: document.getElementById('shopProductsGrid'),
    videoReelsGrid: document.getElementById('videoReelsGrid'),
    homeFAQAccordion: document.getElementById('homeFAQAccordion'),

    // Lookbook Video Controls
    lookbookVideo: document.getElementById('lookbookVideo'),
    lookbookPlayToggle: document.getElementById('lookbookPlayToggle'),
    lookbookPlayIcon: document.getElementById('lookbookPlayIcon'),
    lookbookMuteToggle: document.getElementById('lookbookMuteToggle'),
    lookbookMuteIcon: document.getElementById('lookbookMuteIcon'),

    // PDP Elements
    pdpThumbnails: document.getElementById('pdpThumbnails'),
    pdpMainImage: document.getElementById('pdpMainImage'),
    pdpBadge: document.getElementById('pdpBadge'),
    pdpTitle: document.getElementById('pdpTitle'),
    pdpPriceActive: document.getElementById('pdpPriceActive'),
    pdpPriceCompare: document.getElementById('pdpPriceCompare'),
    pdpOfferBadge: document.getElementById('pdpOfferBadge'),
    pdpSelectedSizeText: document.getElementById('pdpSelectedSizeText'),
    pdpSizeRow: document.getElementById('pdpSizeRow'),
    pdpQtyVal: document.getElementById('pdpQtyVal'),
    pdpQtyMinus: document.getElementById('pdpQtyMinus'),
    pdpQtyPlus: document.getElementById('pdpQtyPlus'),
    pdpAddBtn: document.getElementById('pdpAddBtn'),
    pdpWhatsAppBtn: document.getElementById('pdpWhatsAppBtn'),
    pdpAccordions: document.getElementById('pdpAccordions'),
    pdpBackBtn: document.getElementById('pdpBackBtn'),

    // PDP Customer Reviews
    pdpReviewsSection: document.getElementById('pdpReviewsSection'),
    pdpReviewsList: document.getElementById('pdpReviewsList'),
    pdpAvgRating: document.getElementById('pdpAvgRating'),
    pdpReviewCountText: document.getElementById('pdpReviewCountText'),
    filterCountAll: document.getElementById('filterCountAll'),
    filterCountPhotos: document.getElementById('filterCountPhotos'),
    filterCount5Stars: document.getElementById('filterCount5Stars'),
    filterCountVerified: document.getElementById('filterCountVerified'),
    reviewFilterPillsRow: document.getElementById('reviewFilterPillsRow'),
    btnOpenReviewModal: document.getElementById('btnOpenReviewModal'),

    // Review Modal
    reviewModal: document.getElementById('reviewModal'),
    reviewModalOverlay: document.getElementById('reviewModalOverlay'),
    reviewModalClose: document.getElementById('reviewModalClose'),
    reviewSubmitForm: document.getElementById('reviewSubmitForm'),
    revStarSelect: document.getElementById('revStarSelect'),
    revStarLabel: document.getElementById('revStarLabel'),

    // Cinema Reel Modal
    cinemaReelModal: document.getElementById('cinemaReelModal'),
    cinemaReelOverlay: document.getElementById('cinemaReelOverlay'),
    cinemaCloseBtn: document.getElementById('cinemaCloseBtn'),
    cinemaVideoPlayer: document.getElementById('cinemaVideoPlayer'),
    cinemaReelCollection: document.getElementById('cinemaReelCollection'),
    cinemaReelTitle: document.getElementById('cinemaReelTitle'),
    cinemaReelNotes: document.getElementById('cinemaReelNotes'),
    cinemaProductThumb: document.getElementById('cinemaProductThumb'),
    cinemaProductName: document.getElementById('cinemaProductName'),
    cinemaProductPrice: document.getElementById('cinemaProductPrice'),
    cinemaShopBtn: document.getElementById('cinemaShopBtn'),

    // 3D Banner
    hero3DSection: document.getElementById('hero3DSection'),
    hero3DFloatingBox: document.getElementById('hero3DFloatingBox')
  };

  // ---------------------------------------------------------------------------
  // Initialization
  // ---------------------------------------------------------------------------
  async function init() {
    loadCart();
    setupHeaderScroll();
    setupNavigation();
    setupCurrency();
    setupHeadingFont();
    setupAuraColor();
    setup3DParallax();
    setupCartDrawer();
    setupMobileNav();
    setupAccountModal();
    setupLookbookVideo();
    setupReviewModal();
    setupCinemaModal();
    renderHomeFAQ();

    await loadProducts();
    await loadReels();
    
    // Check initial hash route
    handleHashRouting();
    window.addEventListener('hashchange', handleHashRouting);

    updateCartUI();
  }

  // ---------------------------------------------------------------------------
  // Load Products Data
  // ---------------------------------------------------------------------------
  async function loadProducts() {
    try {
      const res = await fetch('./assets/data/products.json');
      State.products = await res.json();
    } catch (e) {
      console.warn("Failed fetching products.json, using fallback", e);
    }
    renderShowcaseGrids();
  }

  // ---------------------------------------------------------------------------
  // SPA Routing
  // ---------------------------------------------------------------------------
  function navigateTo(pageId, productId = null) {
    window.location.hash = productId ? `${pageId}/${productId}` : pageId;
  }
  window.navigateTo = navigateTo;

  function handleHashRouting() {
    let path = window.location.hash.replace(/^#\/?/, '');
    if (!path) {
      const pathname = window.location.pathname.replace(/^\/|\/$/g, '');
      if (['contact', 'airshares', 'about', 'ritualism', 'shop'].includes(pathname) || pathname.startsWith('pdp/')) {
        path = pathname;
      }
    }
    const rawRoute = path || 'home';
    const [pageId, param] = rawRoute.split('/');

    // Remove active view from all pages
    [DOM.pageHome, DOM.pageShop, DOM.pagePDP, DOM.pageAbout, DOM.pageContact].forEach(page => {
      if (page) page.classList.remove('active-view');
    });

    // Update Nav Link styling
    DOM.navLinks.forEach(link => {
      if (link.getAttribute('data-page') === pageId) {
        link.classList.add('active');
      } else {
        link.classList.remove('active');
      }
    });

    window.scrollTo({ top: 0, behavior: 'smooth' });

    if (pageId === 'pdp' && param) {
      loadPDP(param);
      DOM.pagePDP?.classList.add('active-view');
      State.activePage = 'pdp';
    } else if (pageId === 'shop') {
      DOM.pageShop?.classList.add('active-view');
      State.activePage = 'shop';
    } else if (pageId === 'about' || pageId === 'ritualism') {
      DOM.pageAbout?.classList.add('active-view');
      State.activePage = 'about';
    } else if (pageId === 'contact' || pageId === 'airshares') {
      DOM.pageContact?.classList.add('active-view');
      State.activePage = 'contact';
    } else {
      DOM.pageHome?.classList.add('active-view');
      State.activePage = 'home';
    }
  }

  function setupNavigation() {
    DOM.navLinks.forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const targetPage = link.getAttribute('data-page');
        navigateTo(targetPage);
      });
    });

    if (DOM.pdpBackBtn) {
      DOM.pdpBackBtn.addEventListener('click', () => {
        if (window.history.length > 1) {
          window.history.back();
        } else {
          navigateTo('home');
        }
      });
    }
  }

  function setupHeaderScroll() {
    window.addEventListener('scroll', () => {
      if (window.scrollY > 30) {
        DOM.siteHeader?.classList.add('scrolled');
      } else {
        DOM.siteHeader?.classList.remove('scrolled');
      }
    }, { passive: true });
  }

  // ---------------------------------------------------------------------------
  // 3D Floating Typography Parallax
  // ---------------------------------------------------------------------------
  function setup3DParallax() {
    if (!DOM.hero3DSection || !DOM.hero3DFloatingBox) return;

    DOM.hero3DSection.addEventListener('mousemove', (e) => {
      const rect = DOM.hero3DSection.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;

      const rotateY = (x / rect.width) * 16;
      const rotateX = -(y / rect.height) * 16;

      DOM.hero3DFloatingBox.style.transform = `perspective(1200px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
    });

    DOM.hero3DSection.addEventListener('mouseleave', () => {
      DOM.hero3DFloatingBox.style.transform = `perspective(1200px) rotateX(0deg) rotateY(0deg)`;
    });
  }

  // ---------------------------------------------------------------------------
  // Render Product Cards (Home & Shop)
  // ---------------------------------------------------------------------------
  function renderShowcaseGrids() {
    const html = State.products.map(product => {
      const defaultSizeObj = product.sizes.find(s => s.inStock) || product.sizes[0];
      const defaultSize = defaultSizeObj ? defaultSizeObj.size : 'M';

      return `
        <div class="product-item-card" data-product-id="${product.id}" data-selected-size="${defaultSize}">
          <div class="product-item-media" onclick="window.navigateTo('pdp', '${product.id}')">
            <img class="product-img-front" src="${product.primaryImage}" alt="${product.title}" loading="lazy" />
            <img class="product-img-back" src="${product.hoverImage}" alt="${product.title} Alternate" loading="lazy" />
            
            <div class="card-badges-wrap">
              <span class="card-badge-pill ${product.id === 'skull-demon-tee' ? 'badge-limited' : 'badge-studio'}">${product.badge}</span>
              <span class="card-badge-offer">${product.discountBadge}</span>
            </div>
          </div>

          <div class="product-item-body">
            <span class="product-item-color">${product.color} // ${product.fabricWeight}</span>
            <h3 class="product-item-title" onclick="window.navigateTo('pdp', '${product.id}')">${product.title}</h3>

            <div class="pricing-block">
              <div class="pricing-row">
                <span class="price-active">${formatPrice(product.priceINR)}</span>
                <span class="price-original-strikethrough">${formatPrice(product.comparePriceINR)}</span>
              </div>
              <span class="offer-name-tag">⚡ ${product.offerName}</span>
            </div>

            <!-- Size Selection with Clean Strike-Through Line for Out-Of-Stock -->
            <div class="size-selection-label">
              <span>SELECT SIZE:</span>
              <span class="size-stock-status">${defaultSize} SELECTED</span>
            </div>
            <div class="size-boxes-row">
              ${product.sizes.map(s => `
                <div class="size-pill ${s.inStock ? '' : 'out-of-stock'} ${s.size === defaultSize && s.inStock ? 'selected' : ''}" 
                     data-size="${s.size}" 
                     data-in-stock="${s.inStock}"
                     title="${s.inStock ? `Size ${s.size}` : `Size ${s.size} (Sold Out)`}">
                  ${s.size}
                </div>
              `).join('')}
            </div>

            <div class="card-action-btns">
              <button class="btn-card-pdp" onclick="window.navigateTo('pdp', '${product.id}')">VIEW DETAILS</button>
              <button class="btn-card-quickadd" data-action="quick-add" data-product-id="${product.id}">QUICK ADD</button>
            </div>
          </div>
        </div>
      `;
    }).join('');

    if (DOM.homeProductsGrid) DOM.homeProductsGrid.innerHTML = html;
    if (DOM.shopProductsGrid) DOM.shopProductsGrid.innerHTML = html;

    attachCardEventListeners();
  }

  function attachCardEventListeners() {
    document.querySelectorAll('.product-item-card').forEach(card => {
      const sizePills = card.querySelectorAll('.size-pill');
      const stockStatusLabel = card.querySelector('.size-stock-status');

      sizePills.forEach(pill => {
        pill.addEventListener('click', (e) => {
          e.stopPropagation();
          const inStock = pill.getAttribute('data-in-stock') === 'true';
          if (!inStock) return; // Unclickable if out of stock

          sizePills.forEach(p => p.classList.remove('selected'));
          pill.classList.add('selected');
          const size = pill.getAttribute('data-size');
          card.setAttribute('data-selected-size', size);
          if (stockStatusLabel) stockStatusLabel.textContent = `${size} SELECTED`;
        });
      });

      const quickAddBtn = card.querySelector('[data-action="quick-add"]');
      if (quickAddBtn) {
        quickAddBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          const prodId = card.getAttribute('data-product-id');
          const selectedSize = card.getAttribute('data-selected-size') || 'M';
          addToCart(prodId, selectedSize, 1);
          
          quickAddBtn.textContent = '✓ ADDED';
          quickAddBtn.style.backgroundColor = '#ffffff';
          quickAddBtn.style.color = '#000000';
          setTimeout(() => {
            quickAddBtn.textContent = 'QUICK ADD';
            quickAddBtn.style.backgroundColor = '';
            quickAddBtn.style.color = '';
          }, 1200);
        });
      }
    });
  }

  // ---------------------------------------------------------------------------
  // Product Detail Page (PDP)
  // ---------------------------------------------------------------------------
  function loadPDP(productId) {
    const product = State.products.find(p => p.id === productId) || State.products[0];
    if (!product) return;

    State.activeProduct = product;
    State.pdpQty = 1;
    State.activeThumbIndex = 0;

    // First in-stock size
    const availableSizeObj = product.sizes.find(s => s.inStock) || product.sizes[0];
    State.selectedSizePDP = availableSizeObj ? availableSizeObj.size : 'M';

    // Populate PDP details
    if (DOM.pdpBadge) DOM.pdpBadge.textContent = `${product.collection} // ${product.badge}`;
    if (DOM.pdpTitle) DOM.pdpTitle.textContent = product.title;
    if (DOM.pdpPriceActive) DOM.pdpPriceActive.textContent = formatPrice(product.priceINR);
    if (DOM.pdpPriceCompare) DOM.pdpPriceCompare.textContent = formatPrice(product.comparePriceINR);
    if (DOM.pdpOfferBadge) DOM.pdpOfferBadge.textContent = `⚡ ${product.offerName}`;
    if (DOM.pdpSelectedSizeText) DOM.pdpSelectedSizeText.textContent = State.selectedSizePDP;
    if (DOM.pdpQtyVal) DOM.pdpQtyVal.textContent = '1';

    // Render Gallery
    if (DOM.pdpMainImage) {
      DOM.pdpMainImage.src = product.images[0];
      DOM.pdpMainImage.alt = product.title;
    }

    if (DOM.pdpThumbnails) {
      DOM.pdpThumbnails.innerHTML = product.images.map((imgSrc, idx) => `
        <button class="pdp-thumb-btn ${idx === 0 ? 'active' : ''}" data-index="${idx}">
          <img src="${imgSrc}" alt="${product.title} angle ${idx + 1}" />
        </button>
      `).join('');

      DOM.pdpThumbnails.querySelectorAll('.pdp-thumb-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          DOM.pdpThumbnails.querySelectorAll('.pdp-thumb-btn').forEach(b => b.classList.remove('active'));
          btn.classList.add('active');
          const idx = parseInt(btn.getAttribute('data-index'), 10);
          State.activeThumbIndex = idx;
          if (DOM.pdpMainImage) DOM.pdpMainImage.src = product.images[idx];
        });
      });
    }

    // Render Size Buttons with Out-Of-Stock Strike-Through
    if (DOM.pdpSizeRow) {
      DOM.pdpSizeRow.innerHTML = product.sizes.map(s => `
        <div class="pdp-size-btn ${s.inStock ? '' : 'out-of-stock'} ${s.size === State.selectedSizePDP && s.inStock ? 'selected' : ''}" 
             data-size="${s.size}" 
             data-in-stock="${s.inStock}"
             title="${s.inStock ? `Size ${s.size} Available` : `Size ${s.size} (Sold Out)`}">
          ${s.size}
        </div>
      `).join('');

      DOM.pdpSizeRow.querySelectorAll('.pdp-size-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          const inStock = btn.getAttribute('data-in-stock') === 'true';
          if (!inStock) return; // Strike-through unclickable

          DOM.pdpSizeRow.querySelectorAll('.pdp-size-btn').forEach(b => b.classList.remove('selected'));
          btn.classList.add('selected');
          State.selectedSizePDP = btn.getAttribute('data-size');
          if (DOM.pdpSelectedSizeText) DOM.pdpSelectedSizeText.textContent = State.selectedSizePDP;
          updateWhatsAppLink();
        });
      });
    }

    // Render Accordions
    renderPDPAccordions(product);

    // Update WhatsApp link
    updateWhatsAppLink();

    // Render Verified Customer Reviews
    renderPDPReviews(product);
  }

  function renderPDPAccordions(product) {
    if (!DOM.pdpAccordions) return;

    DOM.pdpAccordions.innerHTML = `
      <!-- Accordion 1: Product Details & Description -->
      <div class="accordion-item active">
        <button class="accordion-trigger">
          <span>PRODUCT DETAILS & DESCRIPTION</span>
          <span class="accordion-icon">+</span>
        </button>
        <div class="accordion-content">
          <p>${product.description}</p>
          <ul style="margin-top: 10px; list-style: disc; padding-left: 20px;">
            <li><strong>Textile Weight:</strong> ${product.fabricWeight}</li>
            <li><strong>Fit & Silhouette:</strong> ${product.fit}</li>
            <li><strong>Origin & Craft:</strong> Designed and custom-finished in Mumbai with high-density archival prints.</li>
          </ul>
        </div>
      </div>

      <!-- Accordion 2: Other Details / Composition -->
      <div class="accordion-item">
        <button class="accordion-trigger">
          <span>OTHER DETAILS & COMPOSITION</span>
          <span class="accordion-icon">+</span>
        </button>
        <div class="accordion-content">
          <p>${product.materialDetails}</p>
          <p style="margin-top: 8px;"><strong>Ribbing:</strong> 1.25-inch high-retention elastane collar.</p>
          <p><strong>Finishing:</strong> Softened silicone wash for a smooth, frictionless hand-feel against skin.</p>
        </div>
      </div>

      <!-- Accordion 3: Size & Fit Guide -->
      <div class="accordion-item">
        <button class="accordion-trigger">
          <span>SIZE & FIT MEASUREMENTS</span>
          <span class="accordion-icon">+</span>
        </button>
        <div class="accordion-content">
          <p>All garments are measured flat in inches and centimeters. Designed with extended drop shoulders.</p>
          <div class="size-table-wrap">
            <table class="size-table">
              <thead>
                <tr>
                  <th>SIZE</th>
                  <th>CHEST WIDTH</th>
                  <th>BODY LENGTH</th>
                  <th>SHOULDER DROP</th>
                </tr>
              </thead>
              <tbody>
                ${product.sizeGuide.map(row => `
                  <tr>
                    <td><strong>${row.size}</strong></td>
                    <td>${row.chest}</td>
                    <td>${row.length}</td>
                    <td>${row.shoulder}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- Accordion 4: How to Choose Your Size -->
      <div class="accordion-item">
        <button class="accordion-trigger">
          <span>HOW TO CHOOSE YOUR SIZE</span>
          <span class="accordion-icon">+</span>
        </button>
        <div class="accordion-content">
          <p>${product.howToChooseSize}</p>
          <p style="margin-top: 8px; font-weight: 600;">Model Reference: 6'1" (185 cm) wearing Size L for an oversized streetwear drape.</p>
        </div>
      </div>

      <!-- Accordion 5: Care Instructions -->
      <div class="accordion-item">
        <button class="accordion-trigger">
          <span>CARE INSTRUCTIONS</span>
          <span class="accordion-icon">+</span>
        </button>
        <div class="accordion-content">
          <p>${product.careInstructions}</p>
        </div>
      </div>
    `;

    // Attach Accordion Toggle
    DOM.pdpAccordions.querySelectorAll('.accordion-trigger').forEach(trigger => {
      trigger.addEventListener('click', () => {
        const item = trigger.closest('.accordion-item');
        const isActive = item.classList.contains('active');
        item.classList.toggle('active', !isActive);
      });
    });
  }

  function updateWhatsAppLink() {
    if (!DOM.pdpWhatsAppBtn || !State.activeProduct) return;
    const phone = "919820123456"; // Luxury brand concierge WhatsApp line
    const message = encodeURIComponent(
      `Hello Aercious Stylist! I would like to inquire about purchasing the "${State.activeProduct.title}" in Size ${State.selectedSizePDP}. Is this piece available for immediate express dispatch?`
    );
    DOM.pdpWhatsAppBtn.href = `https://wa.me/${phone}?text=${message}`;
  }

  // PDP Quantity Stepper
  if (DOM.pdpQtyMinus && DOM.pdpQtyPlus && DOM.pdpQtyVal) {
    DOM.pdpQtyMinus.addEventListener('click', () => {
      if (State.pdpQty > 1) {
        State.pdpQty -= 1;
        DOM.pdpQtyVal.textContent = State.pdpQty;
      }
    });

    DOM.pdpQtyPlus.addEventListener('click', () => {
      State.pdpQty += 1;
      DOM.pdpQtyVal.textContent = State.pdpQty;
    });
  }

  // PDP Add to Bag
  if (DOM.pdpAddBtn) {
    DOM.pdpAddBtn.addEventListener('click', () => {
      if (!State.activeProduct) return;
      addToCart(State.activeProduct.id, State.selectedSizePDP, State.pdpQty);
      
      const originalText = DOM.pdpAddBtn.innerHTML;
      DOM.pdpAddBtn.innerHTML = `<span>✓ ADDED TO BAG</span>`;
      setTimeout(() => {
        DOM.pdpAddBtn.innerHTML = originalText;
      }, 1500);
    });
  }

  // ---------------------------------------------------------------------------
  // Cart Logic & Drawer
  // ---------------------------------------------------------------------------
  function addToCart(productId, size, quantity = 1) {
    const product = State.products.find(p => p.id === productId);
    if (!product) return;

    const existingIndex = State.cart.findIndex(item => item.productId === productId && item.size === size);
    if (existingIndex > -1) {
      State.cart[existingIndex].quantity += quantity;
    } else {
      State.cart.push({
        productId: product.id,
        title: product.title,
        priceINR: product.priceINR,
        image: product.primaryImage,
        size: size,
        quantity: quantity,
        color: product.color
      });
    }

    saveCart();
    updateCartUI();
    openCartDrawer();
  }

  function updateCartUI() {
    const totalCount = State.cart.reduce((sum, item) => sum + item.quantity, 0);
    if (DOM.cartCountBadge) {
      DOM.cartCountBadge.textContent = totalCount;
      if (totalCount > 0) {
        DOM.cartCountBadge.classList.add('has-items');
      } else {
        DOM.cartCountBadge.classList.remove('has-items');
      }
    }
    const cartDrawerCountTitle = document.getElementById('cartDrawerCountTitle');
    if (cartDrawerCountTitle) {
      cartDrawerCountTitle.textContent = `[ ${totalCount} ]`;
    }

    if (!DOM.cartItemsBody) return;

    if (State.cart.length === 0) {
      DOM.cartItemsBody.innerHTML = `
        <div class="cart-empty-state">
          <p>[ YOUR SHOPPING BAG IS CURRENTLY EMPTY ]</p>
          <button class="btn-aer-black" onclick="window.navigateTo('shop'); window.closeCartDrawer();">
            EXPLORE DROP 01
          </button>
        </div>
      `;
      if (DOM.cartSubtotal) DOM.cartSubtotal.textContent = formatPrice(0);
      if (DOM.cartGrandTotal) DOM.cartGrandTotal.textContent = formatPrice(0);
      if (DOM.shippingProgressFill) DOM.shippingProgressFill.style.width = '0%';
      if (DOM.shippingStatusText) DOM.shippingStatusText.textContent = `ADD ${formatPrice(2999)} FOR COMPLIMENTARY SHIPPING`;
      return;
    }

    DOM.cartItemsBody.innerHTML = State.cart.map((item, index) => `
      <div class="cart-item-row" data-cart-index="${index}">
        <img class="cart-item-thumb" src="${item.image}" alt="${item.title}" />
        <div class="cart-item-info">
          <h4 class="cart-item-title">${item.title}</h4>
          <div class="cart-item-meta">SIZE: ${item.size} // ${item.color}</div>
          
          <div class="cart-item-bottom">
            <div class="cart-qty-control">
              <button class="qty-btn" data-action="qty-minus" data-index="${index}">-</button>
              <span class="qty-val">${item.quantity}</span>
              <button class="qty-btn" data-action="qty-plus" data-index="${index}">+</button>
            </div>
            <span class="cart-item-price">${formatPrice(item.priceINR * item.quantity)}</span>
          </div>

          <button class="cart-item-remove" data-action="remove-item" data-index="${index}">[ REMOVE ]</button>
        </div>
      </div>
    `).join('');

    // Attach qty controls
    DOM.cartItemsBody.querySelectorAll('[data-action="qty-minus"]').forEach(b => {
      b.addEventListener('click', () => {
        const idx = parseInt(b.getAttribute('data-index'), 10);
        if (State.cart[idx].quantity > 1) {
          State.cart[idx].quantity -= 1;
        } else {
          State.cart.splice(idx, 1);
        }
        saveCart();
        updateCartUI();
      });
    });

    DOM.cartItemsBody.querySelectorAll('[data-action="qty-plus"]').forEach(b => {
      b.addEventListener('click', () => {
        const idx = parseInt(b.getAttribute('data-index'), 10);
        State.cart[idx].quantity += 1;
        saveCart();
        updateCartUI();
      });
    });

    DOM.cartItemsBody.querySelectorAll('[data-action="remove-item"]').forEach(b => {
      b.addEventListener('click', () => {
        const idx = parseInt(b.getAttribute('data-index'), 10);
        State.cart.splice(idx, 1);
        saveCart();
        updateCartUI();
      });
    });

    // Subtotal and shipping
    const subtotalINR = State.cart.reduce((sum, item) => sum + (item.priceINR * item.quantity), 0);
    if (DOM.cartSubtotal) DOM.cartSubtotal.textContent = formatPrice(subtotalINR);
    if (DOM.cartGrandTotal) DOM.cartGrandTotal.textContent = formatPrice(subtotalINR);

    const threshold = 2999;
    const progressPercent = Math.min(100, Math.round((subtotalINR / threshold) * 100));
    if (DOM.shippingProgressFill) DOM.shippingProgressFill.style.width = `${progressPercent}%`;

    if (DOM.shippingStatusText) {
      if (subtotalINR >= threshold) {
        DOM.shippingStatusText.innerHTML = `⚡ <span style="font-weight:700;">YOU'VE UNLOCKED COMPLIMENTARY EXPRESS SHIPPING!</span>`;
      } else {
        const diff = threshold - subtotalINR;
        DOM.shippingStatusText.textContent = `ADD ${formatPrice(diff)} MORE FOR FREE SHIPPING`;
      }
    }
  }

  function setupCartDrawer() {
    if (DOM.cartTriggerBtn) DOM.cartTriggerBtn.addEventListener('click', openCartDrawer);
    if (DOM.cartCloseBtn) DOM.cartCloseBtn.addEventListener('click', closeCartDrawer);
    if (DOM.cartOverlay) DOM.cartOverlay.addEventListener('click', closeCartDrawer);
  }

  function openCartDrawer() {
    DOM.cartDrawer?.classList.add('active');
    DOM.cartOverlay?.classList.add('active');
    document.body.classList.add('drawer-open');
  }

  function closeCartDrawer() {
    DOM.cartDrawer?.classList.remove('active');
    DOM.cartOverlay?.classList.remove('active');
    document.body.classList.remove('drawer-open');
  }
  window.closeCartDrawer = closeCartDrawer;

  // ---------------------------------------------------------------------------
  // Currency Selector (Synchronized Across Drawers)
  // ---------------------------------------------------------------------------
  function setupCurrency() {
    const currencySelects = document.querySelectorAll('.currency-select');
    currencySelects.forEach(sel => {
      sel.value = State.activeCurrency;
      sel.addEventListener('change', (e) => {
        State.activeCurrency = e.target.value;
        localStorage.setItem('aercious_currency', State.activeCurrency);
        currencySelects.forEach(s => s.value = State.activeCurrency);
        renderShowcaseGrids();
        if (State.activeProduct) loadPDP(State.activeProduct.id);
        updateCartUI();
        showLuxuryToast(`CURRENCY: ${State.activeCurrency} CONVERTED`);
      });
    });
  }

  // ---------------------------------------------------------------------------
  // Mobile Slide-Out Navigation Drawer
  // ---------------------------------------------------------------------------
  function setupMobileNav() {
    const menuBtn = document.getElementById('mobileMenuBtn');
    const closeBtn = document.getElementById('mobileNavCloseBtn');
    const drawer = document.getElementById('mobileNavDrawer');
    const overlay = document.getElementById('mobileNavOverlay');
    const navLinks = document.querySelectorAll('.mobile-nav-link');

    function openMobileNav() {
      drawer?.classList.add('active');
      overlay?.classList.add('active');
      document.body.style.overflow = 'hidden';
    }

    function closeMobileNav() {
      drawer?.classList.remove('active');
      overlay?.classList.remove('active');
      document.body.style.overflow = '';
    }

    menuBtn?.addEventListener('click', openMobileNav);
    closeBtn?.addEventListener('click', closeMobileNav);
    overlay?.addEventListener('click', closeMobileNav);

    navLinks.forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const page = link.dataset.page;
        if (page) {
          navigateTo(page);
        }
        closeMobileNav();
      });
    });
  }

  // ---------------------------------------------------------------------------
  // VIP Atelier Account Modal
  // ---------------------------------------------------------------------------
  function setupAccountModal() {
    const triggerBtn = document.getElementById('accountTriggerBtn');
    const closeBtn = document.getElementById('accountCloseBtn');
    const drawer = document.getElementById('accountDrawer');
    const overlay = document.getElementById('accountOverlay');

    function openAccount() {
      drawer?.classList.add('active');
      overlay?.classList.add('active');
      document.body.style.overflow = 'hidden';
    }

    function closeAccount() {
      drawer?.classList.remove('active');
      overlay?.classList.remove('active');
      document.body.style.overflow = '';
    }

    triggerBtn?.addEventListener('click', openAccount);
    closeBtn?.addEventListener('click', closeAccount);
    overlay?.addEventListener('click', closeAccount);
  }

  // ---------------------------------------------------------------------------
  // Heading Font Theme Selector & Interactive Typography Quick-Studio Dock
  // ---------------------------------------------------------------------------
  function showLuxuryToast(msg) {
    let toast = document.getElementById('luxuryToast');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'luxuryToast';
      toast.style.cssText = `
        position: fixed;
        top: 24px;
        right: 24px;
        background: #000000;
        color: #ffffff;
        font-family: var(--font-mono);
        font-size: 0.72rem;
        font-weight: 600;
        letter-spacing: 0.12em;
        text-transform: uppercase;
        padding: 10px 18px;
        border-radius: 4px;
        box-shadow: 0 10px 30px rgba(0,0,0,0.25);
        border: 1px solid rgba(255,255,255,0.2);
        z-index: 9999;
        pointer-events: none;
        transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        transform: translateY(-20px);
        opacity: 0;
      `;
      document.body.appendChild(toast);
    }
    toast.textContent = msg;
    toast.style.transform = 'translateY(0)';
    toast.style.opacity = '1';
    clearTimeout(toast._timeout);
    toast._timeout = setTimeout(() => {
      toast.style.transform = 'translateY(-20px)';
      toast.style.opacity = '0';
    }, 2200);
  }

  function setupHeadingFont() {
    // Permanent Official Brand Typography: Melloida Extra Bold & Pyapari Thin by Glyphminds Studio
    const brandFontKey = 'brand-bold';
    localStorage.setItem('aercious_heading_font', brandFontKey);
    document.documentElement.setAttribute('data-heading-font', brandFontKey);

    const fontSelect = document.getElementById('headingFontSelect');
    if (fontSelect) fontSelect.value = brandFontKey;

    document.querySelectorAll('.typography-quick-dock .dock-btn, .atelier-font-recommendation-bar .font-pill-btn').forEach(btn => {
      if (btn.dataset.font === brandFontKey || btn.dataset.font === 'melloida') {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });
  }

  // ---------------------------------------------------------------------------
  // Dynamic Color Aura Switcher (Streetwear Palette Controller)
  // ---------------------------------------------------------------------------
  function setupAuraColor() {
    const auraSelect = document.getElementById('auraColorSelect');
    const auraBtns = document.querySelectorAll('.typography-quick-dock .dock-aura-btn');

    let savedAura = localStorage.getItem('aercious_color_aura') || 'none';

    function applyAura(auraKey, notify = false) {
      if (!auraKey) return;
      document.documentElement.setAttribute('data-aura', auraKey);
      localStorage.setItem('aercious_color_aura', auraKey);

      if (auraSelect) {
        auraSelect.value = auraKey;
      }

      auraBtns.forEach(btn => {
        if (btn.dataset.aura === auraKey) {
          btn.classList.add('active');
        } else {
          btn.classList.remove('active');
        }
      });

      if (notify) {
        const labels = {
          none: '∅ NO COLOR (MONOCHROME)',
          cobalt: '⚡ ELECTRIC COBALT',
          solar: '🔥 SOLAR FLAME',
          acid: '🧪 VOLT ACID LIME',
          violet: '🔮 IMPERIAL VIOLET',
          cyber: '💎 CYBER CYAN'
        };
        showLuxuryToast(`COLOR AURA: ${labels[auraKey] || auraKey.toUpperCase()} ACTIVATED`);
      }
    }

    // Apply active aura immediately on boot
    applyAura(savedAura, false);

    // Header selector listener
    if (auraSelect) {
      auraSelect.addEventListener('change', (e) => {
        applyAura(e.target.value, true);
      });
    }

    // Quick dock aura buttons listener
    auraBtns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        const auraKey = btn.dataset.aura;
        applyAura(auraKey, true);
      });
    });
  }

  // ---------------------------------------------------------------------------
  // Load & Render Video Reels (Shop by Video)
  // ---------------------------------------------------------------------------
  async function loadReels() {
    try {
      const res = await fetch('./assets/data/reels.json');
      State.reels = await res.json();
    } catch (e) {
      console.warn("Reels fetch note:", e);
    }
    renderVideoReels();
  }

  function renderVideoReels() {
    if (!DOM.videoReelsGrid || !State.reels || State.reels.length === 0) return;

    DOM.videoReelsGrid.innerHTML = State.reels.map(reel => `
      <div class="video-reel-card" data-reel-id="${reel.id}">
        <div class="video-reel-media">
          <video class="reel-vid-element" loop muted playsinline poster="${reel.poster}">
            <source src="${reel.video}" type="video/webm">
            <source src="https://vjs.zencdn.net/v/oceans.mp4" type="video/mp4">
            <img src="${reel.poster}" alt="${reel.title}" />
          </video>
        </div>

        <div class="video-reel-overlay">
          <div class="video-reel-top-row">
            <span class="reel-view-counter">▶ ${reel.views}</span>
            <button class="reel-sound-btn" title="Toggle Sound" aria-label="Toggle Sound">🔇</button>
          </div>

          <div class="reel-center-play-indicator">▶</div>

          <div class="video-reel-shoppable-pill">
            <img src="${reel.poster}" alt="${reel.productName}" class="reel-prod-thumb" />
            <div class="reel-prod-details">
              <div class="reel-prod-title">${reel.productName}</div>
              <div class="reel-prod-price">${formatPrice(reel.priceINR)}</div>
            </div>
            <button class="btn-reel-shop" data-product-id="${reel.productId}">
              SHOP LOOK
            </button>
          </div>
        </div>
      </div>
    `).join('');

    // Attach event listeners for Reels
    DOM.videoReelsGrid.querySelectorAll('.video-reel-card').forEach(card => {
      const vid = card.querySelector('video');
      const soundBtn = card.querySelector('.reel-sound-btn');
      const shopBtn = card.querySelector('.btn-reel-shop');
      const reelId = card.getAttribute('data-reel-id');
      const reelData = State.reels.find(r => r.id === reelId);

      // Hover to play
      card.addEventListener('mouseenter', () => {
        if (vid && vid.paused) {
          vid.play().catch(() => {});
        }
      });

      card.addEventListener('mouseleave', () => {
        if (vid && !vid.paused) {
          vid.pause();
        }
      });

      // Sound toggle
      if (soundBtn && vid) {
        soundBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          vid.muted = !vid.muted;
          soundBtn.textContent = vid.muted ? '🔇' : '🔊';
        });
      }

      // Shop button
      if (shopBtn) {
        shopBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          const pId = shopBtn.getAttribute('data-product-id');
          navigateTo('pdp', pId);
        });
      }

      // Card click opens Cinema Lightbox
      card.addEventListener('click', () => {
        if (reelData) openCinemaModal(reelData);
      });
    });
  }

  // ---------------------------------------------------------------------------
  // Lookbook Video Controls
  // ---------------------------------------------------------------------------
  function setupLookbookVideo() {
    if (!DOM.lookbookVideo) return;

    if (DOM.lookbookPlayToggle) {
      DOM.lookbookPlayToggle.addEventListener('click', () => {
        if (DOM.lookbookVideo.paused) {
          DOM.lookbookVideo.play();
          if (DOM.lookbookPlayIcon) DOM.lookbookPlayIcon.textContent = '❚❚';
        } else {
          DOM.lookbookVideo.pause();
          if (DOM.lookbookPlayIcon) DOM.lookbookPlayIcon.textContent = '►';
        }
      });
    }

    if (DOM.lookbookMuteToggle) {
      DOM.lookbookMuteToggle.addEventListener('click', () => {
        DOM.lookbookVideo.muted = !DOM.lookbookVideo.muted;
        if (DOM.lookbookMuteIcon) {
          DOM.lookbookMuteIcon.textContent = DOM.lookbookVideo.muted ? '🔇' : '🔊';
        }
      });
    }
  }

  // ---------------------------------------------------------------------------
  // Home FAQ Accordion
  // ---------------------------------------------------------------------------
  function renderHomeFAQ() {
    if (!DOM.homeFAQAccordion) return;

    const faqs = [
      {
        q: "How does the sizing and architectural fit work? Should I size up or down?",
        a: "All AERCIOUS garments are engineered with an avant-garde boxy silhouette—featuring exaggerated dropped shoulders, relaxed elbow-length sleeves, and a structured drape that stays comfortably off the torso. We recommend selecting your standard size to achieve the intended relaxed boxy streetwear aesthetic. If you prefer a tailored or closer standard profile, we recommend sizing down one size. A comprehensive measurement chart (Chest, Length, Shoulder width) is provided on each product page."
      },
      {
        q: "What makes 280 GSM heavy combed cotton different from standard market tees?",
        a: "Standard fast-fashion t-shirts range between 140–180 GSM, which easily cling, wrinkle, and lose structural density after a couple of washes. AERCIOUS utilizes an ultra-dense, custom-spun 280 GSM long-staple combed cotton knit. This gives our pieces a monolithic architectural drape, true opacity, premium cool-touch hand-feel, and generational durability that holds its shape wash after wash."
      },
      {
        q: "Will the high-density ribbed collar bacon, stretch, or curl over time?",
        a: "No. Our garments feature a signature 1.25-inch high-density shape-retention elastane-cotton ribbed collar reinforced with dual-track herringbone taping across the shoulders and neck seam. It is specifically engineered to eliminate collar baconing and maintain a crisp, taut neckline indefinitely."
      },
      {
        q: "What are your shipping timelines and prepaid payment privileges?",
        a: "All orders placed before 3:00 PM IST dispatch the same business day via priority express air courier. Delivery across metro cities takes 24–48 hours, with 2–4 business days for other regions across India. International air express takes 4–7 business days. As part of our drop launch, all prepaid orders receive an automatic 10% discount at checkout plus complimentary express air shipping."
      },
      {
        q: "How do I care for the mineral acid wash and high-density gothic puff prints?",
        a: "Turn the garment inside-out and machine wash on a delicate cold cycle (30°C or below) using a mild eco-friendly liquid detergent. Flat dry or line dry in shade. Avoid tumble drying, bleaching, or direct ironing over the graphic prints. The mineral acid wash will subtly evolve with age, enhancing its unique vintage stone patina."
      },
      {
        q: "Will Drop 01 be restocked after it sells out?",
        a: "Never. In accordance with our finite archive policy, every drop is strictly capped at 150 individually numbered pieces worldwide. Once an archive run is closed, that specific colorway and artwork combination will never be reissued."
      }
    ];

    DOM.homeFAQAccordion.innerHTML = faqs.map((faq, idx) => `
      <div class="faq-item ${idx === 0 ? 'active' : ''}">
        <button class="faq-question-btn">
          <span>${faq.q}</span>
          <span class="faq-icon-cross">+</span>
        </button>
        <div class="faq-answer-wrap">
          <div class="faq-answer-content">
            <p>${faq.a}</p>
          </div>
        </div>
      </div>
    `).join('');

    DOM.homeFAQAccordion.querySelectorAll('.faq-item').forEach(item => {
      const btn = item.querySelector('.faq-question-btn');
      btn.addEventListener('click', () => {
        const isActive = item.classList.contains('active');
        DOM.homeFAQAccordion.querySelectorAll('.faq-item').forEach(i => i.classList.remove('active'));
        if (!isActive) {
          item.classList.add('active');
        }
      });
    });
  }

  // ---------------------------------------------------------------------------
  // PDP Customer Reviews Controller
  // ---------------------------------------------------------------------------
  function renderPDPReviews(product) {
    if (!DOM.pdpReviewsSection || !product) return;

    const reviews = product.reviews || [];
    
    // Update metrics
    if (DOM.pdpAvgRating) DOM.pdpAvgRating.textContent = product.rating ? product.rating.toFixed(2) : '4.96';
    if (DOM.pdpReviewCountText) DOM.pdpReviewCountText.textContent = `Based on ${reviews.length} Verified Buyers`;

    const countAll = reviews.length;
    const countPhotos = reviews.filter(r => r.photo).length;
    const count5Stars = reviews.filter(r => r.rating === 5).length;
    const countVerified = reviews.filter(r => r.verifiedBuyer).length;

    if (DOM.filterCountAll) DOM.filterCountAll.textContent = countAll;
    if (DOM.filterCountPhotos) DOM.filterCountPhotos.textContent = countPhotos;
    if (DOM.filterCount5Stars) DOM.filterCount5Stars.textContent = count5Stars;
    if (DOM.filterCountVerified) DOM.filterCountVerified.textContent = countVerified;

    // Filter reviews
    let filtered = [...reviews];
    if (State.currentReviewFilter === 'photos') {
      filtered = filtered.filter(r => r.photo);
    } else if (State.currentReviewFilter === '5stars') {
      filtered = filtered.filter(r => r.rating === 5);
    } else if (State.currentReviewFilter === 'verified') {
      filtered = filtered.filter(r => r.verifiedBuyer);
    }

    if (!DOM.pdpReviewsList) return;

    if (filtered.length === 0) {
      DOM.pdpReviewsList.innerHTML = `
        <div style="grid-column: 1 / -1; padding: 40px; text-align: center; color: var(--color-text-muted); font-family: var(--font-mono); font-size: 0.85rem; border: 1px dashed var(--color-border);">
          NO REVIEWS FOUND FOR CURRENT FILTER. BE THE FIRST ARCHIVIST TO SUBMIT ONE.
        </div>
      `;
      return;
    }

    DOM.pdpReviewsList.innerHTML = filtered.map(rev => `
      <div class="review-card" data-review-id="${rev.id}">
        <div>
          <div class="review-card-top">
            <div class="reviewer-meta-left">
              <div class="reviewer-author-row">
                <span class="reviewer-name">${rev.author}</span>
                ${rev.verifiedBuyer ? '<span class="verified-buyer-badge">VERIFIED ARCHIVIST ⚡</span>' : ''}
              </div>
              <span class="reviewer-location-date">${rev.location} • ${rev.date}</span>
            </div>
            <div class="review-stars-gold">${'★'.repeat(rev.rating)}</div>
          </div>

          <div class="review-purchased-details-row">
            <span class="purchased-tag">Purchased: Size ${rev.purchasedSize}</span>
            <span class="fit-badge-tag">${rev.fitFeedback}</span>
            ${rev.userStats ? `<span class="purchased-tag">${rev.userStats}</span>` : ''}
          </div>

          <h4 class="review-headline">${rev.title}</h4>
          <p class="review-body-text">${rev.content}</p>

          ${rev.photo ? `
            <div class="review-photo-attachment" title="Click to inspect photo">
              <img src="${rev.photo}" alt="Archival fit by ${rev.author}" />
            </div>
          ` : ''}
        </div>

        <div class="review-footer-row">
          <span style="font-family: var(--font-mono); font-size: 0.68rem; color: var(--color-text-light);">
            Was this archival feedback helpful?
          </span>
          <button class="btn-helpful-vote" data-review-id="${rev.id}">
            👍 Helpful (${rev.helpfulCount})
          </button>
        </div>
      </div>
    `).join('');

    // Setup filter pills
    if (DOM.reviewFilterPillsRow) {
      DOM.reviewFilterPillsRow.querySelectorAll('.review-filter-pill').forEach(pill => {
        pill.addEventListener('click', () => {
          DOM.reviewFilterPillsRow.querySelectorAll('.review-filter-pill').forEach(p => p.classList.remove('active'));
          pill.classList.add('active');
          State.currentReviewFilter = pill.getAttribute('data-filter');
          renderPDPReviews(product);
        });
      });
    }

    // Setup helpful vote buttons
    DOM.pdpReviewsList.querySelectorAll('.btn-helpful-vote').forEach(btn => {
      btn.addEventListener('click', () => {
        if (btn.classList.contains('voted')) return;
        const revId = btn.getAttribute('data-review-id');
        const targetRev = reviews.find(r => r.id === revId);
        if (targetRev) {
          targetRev.helpfulCount += 1;
          btn.classList.add('voted');
          btn.textContent = `✓ Helpful (${targetRev.helpfulCount})`;
        }
      });
    });
  }

  // ---------------------------------------------------------------------------
  // Review Submission Modal
  // ---------------------------------------------------------------------------
  function setupReviewModal() {
    if (DOM.btnOpenReviewModal) {
      DOM.btnOpenReviewModal.addEventListener('click', () => {
        DOM.reviewModal?.classList.add('active');
        DOM.reviewModalOverlay?.classList.add('active');
      });
    }

    function closeReviewModal() {
      DOM.reviewModal?.classList.remove('active');
      DOM.reviewModalOverlay?.classList.remove('active');
    }

    if (DOM.reviewModalClose) DOM.reviewModalClose.addEventListener('click', closeReviewModal);
    if (DOM.reviewModalOverlay) DOM.reviewModalOverlay.addEventListener('click', closeReviewModal);

    // Star selection
    let chosenRating = 5;
    const starLabels = {
      5: "5.0 — FLAWLESS ARCHIVE",
      4: "4.0 — VERY GOOD FIT & WEIGHT",
      3: "3.0 — AVERAGE STREETWEAR",
      2: "2.0 — BELOW EXPECTATIONS",
      1: "1.0 — POOR QUALITY"
    };

    if (DOM.revStarSelect) {
      const stars = DOM.revStarSelect.querySelectorAll('.star-choice');
      stars.forEach(star => {
        star.addEventListener('click', () => {
          chosenRating = parseInt(star.getAttribute('data-value'), 10);
          stars.forEach(s => {
            const val = parseInt(s.getAttribute('data-value'), 10);
            if (val <= chosenRating) {
              s.classList.add('selected');
            } else {
              s.classList.remove('selected');
            }
          });
          if (DOM.revStarLabel) DOM.revStarLabel.textContent = starLabels[chosenRating] || `${chosenRating}.0`;
        });
      });
    }

    // Submit handler
    if (DOM.reviewSubmitForm) {
      DOM.reviewSubmitForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const name = document.getElementById('revInputName')?.value || 'Anonymous Archivist';
        const location = document.getElementById('revInputLocation')?.value || 'India';
        const size = document.getElementById('revInputSize')?.value || 'M';
        const fitRadio = document.querySelector('input[name="fitChoice"]:checked');
        const fitVal = fitRadio ? fitRadio.value : 'True to Boxy Oversized';
        const title = document.getElementById('revInputTitle')?.value || 'Heavyweight Masterpiece';
        const body = document.getElementById('revInputBody')?.value || 'Incredible 280 GSM cotton and flawless fit.';

        const newReview = {
          id: 'rev-' + Date.now(),
          author: name,
          location: location,
          rating: chosenRating,
          date: 'Just now',
          verifiedBuyer: true,
          purchasedSize: size,
          userStats: 'Verified Customer',
          fitFeedback: fitVal,
          title: title,
          content: body,
          helpfulCount: 1,
          photo: null
        };

        if (State.activeProduct) {
          if (!State.activeProduct.reviews) State.activeProduct.reviews = [];
          State.activeProduct.reviews.unshift(newReview);
          State.activeProduct.reviewCount = (State.activeProduct.reviewCount || 84) + 1;
          renderPDPReviews(State.activeProduct);
        }

        DOM.reviewSubmitForm.reset();
        closeReviewModal();
        alert('ARCHIVAL REVIEW SUBMITTED // THANK YOU\nYour feedback has been published to the community dossier.');
      });
    }
  }

  // ---------------------------------------------------------------------------
  // Cinema Reel Video Modal
  // ---------------------------------------------------------------------------
  function setupCinemaModal() {
    function closeCinemaModal() {
      DOM.cinemaReelModal?.classList.remove('active');
      DOM.cinemaReelOverlay?.classList.remove('active');
      if (DOM.cinemaVideoPlayer) {
        DOM.cinemaVideoPlayer.pause();
      }
    }

    if (DOM.cinemaCloseBtn) DOM.cinemaCloseBtn.addEventListener('click', closeCinemaModal);
    if (DOM.cinemaReelOverlay) DOM.cinemaReelOverlay.addEventListener('click', closeCinemaModal);
  }

  function openCinemaModal(reel) {
    if (!DOM.cinemaReelModal) return;

    if (DOM.cinemaVideoPlayer) {
      DOM.cinemaVideoPlayer.src = reel.video;
      DOM.cinemaVideoPlayer.play().catch(() => {});
    }

    if (DOM.cinemaReelCollection) DOM.cinemaReelCollection.textContent = reel.collection || 'EDITORIAL MOTION';
    if (DOM.cinemaReelTitle) DOM.cinemaReelTitle.textContent = reel.title;
    if (DOM.cinemaReelNotes) DOM.cinemaReelNotes.textContent = reel.outfitNotes || '';
    if (DOM.cinemaProductName) DOM.cinemaProductName.textContent = reel.productName;
    if (DOM.cinemaProductPrice) DOM.cinemaProductPrice.textContent = formatPrice(reel.priceINR);
    if (DOM.cinemaProductThumb) DOM.cinemaProductThumb.src = reel.poster;

    if (DOM.cinemaShopBtn) {
      DOM.cinemaShopBtn.onclick = () => {
        DOM.cinemaReelModal.classList.remove('active');
        DOM.cinemaReelOverlay.classList.remove('active');
        if (DOM.cinemaVideoPlayer) DOM.cinemaVideoPlayer.pause();
        navigateTo('pdp', reel.productId);
      };
    }

    DOM.cinemaReelModal.classList.add('active');
    DOM.cinemaReelOverlay.classList.add('active');
  }

  // Run on DOM Ready
  document.addEventListener('DOMContentLoaded', init);

})();

