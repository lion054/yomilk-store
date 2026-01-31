// Live Data Integration for Nest Template
// Fetches data from yomilk API and updates the DOM with authentication

const API_URL = 'https://yomilk.erpona.com:8092/api/';
const API_TIMEOUT = 5000; // 5 second timeout

// Get auth token from localStorage (set by Angular app)
function getAuthToken() {
    try {
        const auth = localStorage.getItem('auth');
        if (auth) {
            const authObj = JSON.parse(auth);
            return authObj.token || null;
        }
    } catch (e) {
        console.warn('[Live Data] Error parsing auth token:', e.message);
    }
    return null;
}

// Get authorization headers
function getHeaders() {
    const token = getAuthToken();
    const headers = {
        'Content-Type': 'application/json'
    };

    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    return headers;
}

// Add timeout to fetch requests
function fetchWithTimeout(url, timeout = API_TIMEOUT) {
    const headers = getHeaders();

    return Promise.race([
        fetch(url, { headers }),
        new Promise((_, reject) =>
            setTimeout(() => reject(new Error('API request timeout')), timeout)
        )
    ]);
}

// Initialize live data on page load (but don't block rendering)
document.addEventListener('DOMContentLoaded', function() {
    console.log('[Live Data] Initializing...');
    const token = getAuthToken();

    if (token) {
        console.log('[Live Data] Auth token found, loading live data...');
        // Load data asynchronously without blocking the page
        setTimeout(() => {
            loadProducts();
            loadCategories();
            loadVendors();
            loadSchedules();
        }, 500);
    } else {
        console.log('[Live Data] No auth token found. Please log in to see live data.');
        console.log('[Live Data] Using template defaults.');
    }
});

// ========== PRODUCTS ==========
function loadProducts() {
    console.log('[Live Data] Loading products...');

    fetchWithTimeout(API_URL + 'StoreItems?pageNumber=1&pageSize=20', 5000)
        .then(response => {
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            return response.json();
        })
        .then(data => {
            console.log('[Live Data] Products loaded successfully:', data?.data?.length || 0);
            if (data && data.data && Array.isArray(data.data) && data.data.length > 0) {
                updateProductGrid(data.data);
                updateProductTabs(data.data);
            }
        })
        .catch(error => {
            console.warn('[Live Data] Products fetch failed (using template defaults):', error.message);
        });
}

// Update main product grid
function updateProductGrid(products) {
    try {
        const productGrid = document.querySelector('.row.product-grid-4');
        if (!productGrid) return;

        console.log('[Live Data] Updating product grid with', products.length, 'products');

        // Clear existing products
        productGrid.innerHTML = '';

        // Add new products
        products.slice(0, 10).forEach((product) => {
            const col = document.createElement('div');
            col.className = 'col-lg-1-5 col-md-4 col-12 col-sm-6';

            const productCard = `
                <div class="product-cart-wrap mb-30">
                    <div class="product-img-action-wrap">
                        <div class="product-img product-img-zoom">
                            <a href="#" onclick="return false;">
                                <img class="default-img" src="${getProductImage(product)}" alt="${escapeHtml(product.itemName)}">
                            </a>
                        </div>
                        <div class="product-action-1">
                            <a aria-label="Add To Wish List" class="action-btn" href="#"><i class="fi-rs-heart"></i></a>
                            <a aria-label="Add To Cart" class="action-btn" href="#"><i class="fi-rs-shopping-cart"></i></a>
                        </div>
                        <div class="product-badges product-badges-position product-badges-mrg">
                            <span class="new">${getDiscountBadge(product)}</span>
                        </div>
                    </div>
                    <div class="product-content-wrap">
                        <div class="product-category">
                            <a href="#">${escapeHtml(product.itemsGroupName || 'Grocery')}</a>
                        </div>
                        <h2><a href="#">${escapeHtml(product.itemName || 'Product')}</a></h2>
                        <div class="product-rate-cover"></div>
                        <div class="product-price">
                            <span>$${parseFloat(product.basePrice || 0).toFixed(2)}</span>
                        </div>
                    </div>
                </div>
            `;

            col.innerHTML = productCard;
            productGrid.appendChild(col);
        });

    } catch (error) {
        console.warn('[Live Data] Error updating product grid:', error.message);
    }
}

// Update product tabs (if they exist)
function updateProductTabs(products) {
    try {
        // Get all product grids from different tabs
        const tabPanes = document.querySelectorAll('.tab-pane');
        if (tabPanes.length === 0) return;

        console.log('[Live Data] Found', tabPanes.length, 'product tabs');

        // Update first tab (All Products)
        const firstTab = tabPanes[0];
        if (firstTab) {
            const grid = firstTab.querySelector('.row.product-grid-4');
            if (grid) {
                grid.innerHTML = '';
                products.slice(0, 10).forEach((product) => {
                    const col = createProductColumn(product);
                    grid.appendChild(col);
                });
            }
        }

    } catch (error) {
        console.warn('[Live Data] Error updating product tabs:', error.message);
    }
}

// Helper to create product column element
function createProductColumn(product) {
    const col = document.createElement('div');
    col.className = 'col-lg-1-5 col-md-4 col-12 col-sm-6';

    const productCard = `
        <div class="product-cart-wrap mb-30">
            <div class="product-img-action-wrap">
                <div class="product-img product-img-zoom">
                    <a href="#" onclick="return false;">
                        <img class="default-img" src="${getProductImage(product)}" alt="${escapeHtml(product.itemName)}">
                    </a>
                </div>
                <div class="product-action-1">
                    <a aria-label="Add To Wish List" class="action-btn" href="#"><i class="fi-rs-heart"></i></a>
                    <a aria-label="Add To Cart" class="action-btn" href="#"><i class="fi-rs-shopping-cart"></i></a>
                </div>
            </div>
            <div class="product-content-wrap">
                <div class="product-category">
                    <a href="#">${escapeHtml(product.itemsGroupName || 'Grocery')}</a>
                </div>
                <h2><a href="#">${escapeHtml(product.itemName || 'Product')}</a></h2>
                <div class="product-price">
                    <span>$${parseFloat(product.basePrice || 0).toFixed(2)}</span>
                </div>
            </div>
        </div>
    `;

    col.innerHTML = productCard;
    return col;
}

// ========== CATEGORIES ==========
function loadCategories() {
    console.log('[Live Data] Loading categories...');

    fetchWithTimeout(API_URL + 'StoreItemGroups?pageNumber=1&pageSize=20', 5000)
        .then(response => {
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            return response.json();
        })
        .then(data => {
            console.log('[Live Data] Categories loaded:', Array.isArray(data) ? data.length : 0);
            if (Array.isArray(data) && data.length > 0) {
                updateCategorySection(data);
            }
        })
        .catch(error => {
            console.warn('[Live Data] Categories fetch failed:', error.message);
        });
}

function updateCategorySection(categories) {
    try {
        // Find category container in the template
        const categoryContainer = document.querySelector('.row[class*="category"]');
        if (!categoryContainer) {
            console.log('[Live Data] Category container not found');
            return;
        }

        console.log('[Live Data] Updating category section with', categories.length, 'categories');

        // Limit to 8 categories
        categories.slice(0, 8).forEach((category, index) => {
            let categoryCol = document.querySelector(`[data-category-id="${index}"]`);

            if (!categoryCol) {
                categoryCol = document.createElement('div');
                categoryCol.className = 'col-lg-3 col-md-4 col-sm-6';
                categoryContainer.appendChild(categoryCol);
            }

            categoryCol.innerHTML = `
                <div class="card-category-style-1 mb-30">
                    <a class="card-img" href="#">
                        <img src="assets/images/category-thumb-1.jpg" alt="">
                    </a>
                    <a href="#"><h5>${escapeHtml(category.name || category.ItemGroupName || 'Category')}</h5></a>
                </div>
            `;
            categoryCol.setAttribute('data-category-id', index);
        });

    } catch (error) {
        console.warn('[Live Data] Error updating categories:', error.message);
    }
}

// ========== VENDORS ==========
function loadVendors() {
    console.log('[Live Data] Loading vendors...');

    fetchWithTimeout(API_URL + 'Vendors?pageNumber=1&pageSize=6', 5000)
        .then(response => {
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            return response.json();
        })
        .then(data => {
            console.log('[Live Data] Vendors loaded:', data?.data?.length || 0);
            if (data?.data && Array.isArray(data.data)) {
                updateVendorsSection(data.data);
            }
        })
        .catch(error => {
            console.warn('[Live Data] Vendors fetch failed:', error.message);
        });
}

function updateVendorsSection(vendors) {
    try {
        const vendorContainer = document.querySelector('.brand-list, .vendor-list');
        if (!vendorContainer) return;

        console.log('[Live Data] Updating vendors section');

        vendors.slice(0, 6).forEach((vendor, index) => {
            let vendorCol = vendorContainer.querySelector(`[data-vendor-id="${index}"]`);

            if (!vendorCol) {
                vendorCol = document.createElement('div');
                vendorCol.className = 'col-lg-2 col-md-3 col-sm-4 col-6';
                vendorContainer.appendChild(vendorCol);
            }

            vendorCol.innerHTML = `
                <div class="brand-logo mb-30" data-vendor-id="${index}">
                    <img src="${vendor.logo || 'assets/images/brand-1.png'}" alt="${escapeHtml(vendor.name)}">
                    <span>${escapeHtml(vendor.name || 'Vendor')}</span>
                </div>
            `;
        });

    } catch (error) {
        console.warn('[Live Data] Error updating vendors:', error.message);
    }
}

// ========== SCHEDULES ==========
function loadSchedules() {
    console.log('[Live Data] Loading schedules...');

    fetchWithTimeout(API_URL + 'StoreOrderSchedules', 5000)
        .then(response => {
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            return response.json();
        })
        .then(data => {
            console.log('[Live Data] Schedules loaded:', data?.length || 0);
            if (Array.isArray(data) && data.length > 0) {
                updateSchedulesSection(data);
            }
        })
        .catch(error => {
            console.warn('[Live Data] Schedules fetch failed:', error.message);
        });
}

function updateSchedulesSection(schedules) {
    try {
        const scheduleContainer = document.querySelector('[class*="schedule"]');
        if (!scheduleContainer) return;

        console.log('[Live Data] Updating schedules section');

        schedules.slice(0, 4).forEach((schedule, index) => {
            let scheduleCard = scheduleContainer.querySelector(`[data-schedule-id="${index}"]`);

            if (!scheduleCard) {
                scheduleCard = document.createElement('div');
                scheduleCard.className = 'col-lg-3 col-md-6 mb-30';
                scheduleContainer.appendChild(scheduleCard);
            }

            scheduleCard.innerHTML = `
                <div class="card h-100 border-0 shadow-sm" data-schedule-id="${index}">
                    <div class="card-body">
                        <h5 class="card-title">${escapeHtml(schedule.Remark || 'Order Schedule')}</h5>
                        <p class="text-muted small">Order before schedule closes</p>
                        <button class="btn btn-success w-100">Place Order</button>
                    </div>
                </div>
            `;
        });

    } catch (error) {
        console.warn('[Live Data] Error updating schedules:', error.message);
    }
}

// ========== HELPER FUNCTIONS ==========

function getProductImage(product) {
    // Try to get product image from API response
    if (product.image) return product.image;
    if (product.imageUrl) return product.imageUrl;

    // Fallback to template image
    return 'assets/images/product-1-1.jpg';
}

function getDiscountBadge(product) {
    // Check if product has discount
    if (product.discount || product.salePrice) {
        return 'On Sale';
    }
    return 'New';
}

function escapeHtml(text) {
    if (!text) return '';
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };
    return String(text).replace(/[&<>"']/g, m => map[m]);
}

// Export functions for use in HTML
window.liveDataApi = {
    loadProducts,
    loadCategories,
    loadVendors,
    loadSchedules,
    getAuthToken,
    getHeaders
};

console.log('[Live Data] Script loaded successfully');
