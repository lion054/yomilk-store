/**
 * Cart Side Drawer Component
 * Modern sliding cart with animations
 */

// Cart state
let cartItems = [
    {
        id: 1,
        name: 'Skibidi Toilet Series 2 Mystery Collectable Figure',
        price: 99.99,
        originalPrice: 199.99,
        quantity: 1,
        image: 'assets/images/product-1-1.jpg',
        savings: 100.00
    },
    {
        id: 2,
        name: 'Skibidi Toilet Mystery Collector Figure Series One 11cm',
        price: 99.99,
        originalPrice: 199.99,
        quantity: 1,
        image: 'assets/images/product-2-1.jpg',
        savings: 100.00
    }
];

// Initialize cart drawer
function initCartDrawer() {
    // Create drawer HTML if it doesn't exist
    if (!document.getElementById('cartDrawer')) {
        const drawerHTML = `
            <div id="cartDrawer" class="cart-drawer">
                <div class="cart-drawer-overlay"></div>
                <div class="cart-drawer-content">
                    <div class="cart-drawer-header">
                        <h3>My Basket</h3>
                        <button class="cart-drawer-close" aria-label="Close cart">
                            <i class="fi-rs-cross"></i>
                        </button>
                    </div>

                    <div class="cart-drawer-body">
                        <div id="cartItemsList" class="cart-items-list"></div>
                    </div>

                    <div class="cart-drawer-footer">
                        <div class="cart-summary">
                            <div class="summary-row">
                                <span>Subtotal:</span>
                                <span id="cartSubtotal">R0.00</span>
                            </div>
                            <div class="summary-row savings">
                                <span>You're Saving:</span>
                                <span id="cartSavings" class="savings-amount">R0.00</span>
                            </div>
                            <div class="summary-row total">
                                <span>Total:</span>
                                <span id="cartTotal">R0.00</span>
                            </div>
                        </div>
                        <button class="btn-checkout" onclick="goToCheckout()">
                            Proceed to Checkout
                            <i class="fi-rs-arrow-right"></i>
                        </button>
                        <button class="btn-continue-shopping" onclick="closeCartDrawer()">
                            Continue Shopping
                        </button>
                    </div>
                </div>
            </div>
        `;
        document.body.insertAdjacentHTML('beforeend', drawerHTML);
    }

    // Add event listeners
    attachCartEventListeners();
    updateCartDrawer();
}

// Attach event listeners
function attachCartEventListeners() {
    // Close button
    const closeBtn = document.querySelector('.cart-drawer-close');
    if (closeBtn) {
        closeBtn.addEventListener('click', closeCartDrawer);
    }

    // Overlay click
    const overlay = document.querySelector('.cart-drawer-overlay');
    if (overlay) {
        overlay.addEventListener('click', closeCartDrawer);
    }

    // Cart icon clicks
    document.querySelectorAll('[data-cart-trigger]').forEach(trigger => {
        trigger.addEventListener('click', (e) => {
            e.preventDefault();
            openCartDrawer();
        });
    });

    // ESC key to close
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closeCartDrawer();
        }
    });
}

// Open cart drawer
function openCartDrawer() {
    const drawer = document.getElementById('cartDrawer');
    if (drawer) {
        drawer.classList.add('active');
        document.body.style.overflow = 'hidden';
        updateCartDrawer();
    }
}

// Close cart drawer
function closeCartDrawer() {
    const drawer = document.getElementById('cartDrawer');
    if (drawer) {
        drawer.classList.remove('active');
        document.body.style.overflow = '';
    }
}

// Update cart drawer content
function updateCartDrawer() {
    const itemsList = document.getElementById('cartItemsList');
    if (!itemsList) return;

    if (cartItems.length === 0) {
        itemsList.innerHTML = `
            <div class="cart-empty">
                <i class="fi-rs-shopping-bag"></i>
                <h4>Your cart is empty</h4>
                <p>Add some items to get started!</p>
            </div>
        `;
        updateCartTotals();
        return;
    }

    itemsList.innerHTML = cartItems.map(item => `
        <div class="cart-drawer-item" data-item-id="${item.id}">
            ${item.savings > 0 ? `<div class="item-savings-badge">Save R${item.savings.toFixed(2)}</div>` : ''}
            <div class="item-image">
                <img src="${item.image}" alt="${item.name}" onerror="this.src='assets/images/product.jpg'">
            </div>
            <div class="item-details">
                <h4 class="item-name">${item.name}</h4>
                <div class="item-pricing">
                    <span class="item-price">R${item.price.toFixed(2)}</span>
                    ${item.originalPrice ? `<span class="item-original-price">R${item.originalPrice.toFixed(2)}</span>` : ''}
                </div>
                <div class="item-quantity">
                    <button class="qty-btn qty-minus" onclick="updateQuantity(${item.id}, -1)">
                        <i class="fi-rs-minus"></i>
                    </button>
                    <input type="number" value="${item.quantity}" readonly class="qty-input">
                    <button class="qty-btn qty-plus" onclick="updateQuantity(${item.id}, 1)">
                        <i class="fi-rs-plus"></i>
                    </button>
                </div>
            </div>
            <button class="item-remove" onclick="removeItem(${item.id})" aria-label="Remove item">
                <i class="fi-rs-trash"></i>
            </button>
        </div>
    `).join('');

    updateCartTotals();
}

// Update cart totals
function updateCartTotals() {
    const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const savings = cartItems.reduce((sum, item) => sum + (item.savings * item.quantity), 0);

    document.getElementById('cartSubtotal').textContent = `R${subtotal.toFixed(2)}`;
    document.getElementById('cartSavings').textContent = `R${savings.toFixed(2)}`;
    document.getElementById('cartTotal').textContent = `R${subtotal.toFixed(2)}`;

    // Update cart count in header
    updateCartCount();
}

// Update cart count badge
function updateCartCount() {
    const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);
    document.querySelectorAll('.cart-count, [data-cart-count]').forEach(el => {
        el.textContent = totalItems;
        if (totalItems > 0) {
            el.style.display = '';
        } else {
            el.style.display = 'none';
        }
    });
}

// Update item quantity
function updateQuantity(itemId, change) {
    const item = cartItems.find(i => i.id === itemId);
    if (item) {
        item.quantity = Math.max(1, item.quantity + change);
        updateCartDrawer();

        // Animation feedback
        const itemEl = document.querySelector(`[data-item-id="${itemId}"] .qty-input`);
        if (itemEl) {
            itemEl.style.transform = 'scale(1.2)';
            setTimeout(() => {
                itemEl.style.transform = 'scale(1)';
            }, 200);
        }
    }
}

// Remove item from cart
function removeItem(itemId) {
    if (confirm('Remove this item from your cart?')) {
        const itemEl = document.querySelector(`[data-item-id="${itemId}"]`);
        if (itemEl) {
            itemEl.style.opacity = '0';
            itemEl.style.transform = 'translateX(100%)';
            setTimeout(() => {
                cartItems = cartItems.filter(i => i.id !== itemId);
                updateCartDrawer();
            }, 300);
        }
    }
}

// Add item to cart
function addToCart(product) {
    const existingItem = cartItems.find(i => i.id === product.id);

    if (existingItem) {
        existingItem.quantity++;
    } else {
        cartItems.push({
            id: product.id,
            name: product.name,
            price: product.price,
            originalPrice: product.originalPrice || null,
            quantity: 1,
            image: product.image || 'assets/images/product.jpg',
            savings: product.savings || 0
        });
    }

    updateCartDrawer();
    openCartDrawer();

    // Show success notification
    showNotification('Item added to cart!');
}

// Add to cart helper for existing Add links
function addToCartFromElement(el) {
    if (!el) return;

    // Prefer explicit data attributes on the element
    const id = el.dataset.productId ? parseInt(el.dataset.productId, 10) : null;
    const name = el.dataset.productName || (el.closest('.product-card')?.querySelector('.product-title')?.textContent.trim()) || (el.closest('.product')?.querySelector('.product-title')?.textContent.trim()) || 'Product';
    const priceRaw = el.dataset.productPrice || el.closest('.product-card')?.querySelector('.price')?.textContent || el.closest('.product')?.querySelector('.price')?.textContent || '0';
    const price = parseFloat(priceRaw.replace(/[^0-9.]/g, '')) || 0;
    const image = el.dataset.productImage || el.closest('.product-card')?.querySelector('img')?.getAttribute('src') || el.closest('.product')?.querySelector('img')?.getAttribute('src') || 'assets/images/product.jpg';
    const savings = parseFloat(el.dataset.productSavings) || 0;
    const productId = id || Date.now();

    addToCart({
        id: productId,
        name: name,
        price: price,
        originalPrice: null,
        image: image,
        savings: savings
    });
}

// Delegated click handler for Add -> addToCartFromElement
// Listens for any element with the `add-to-cart` class (works on anchors or buttons).
document.addEventListener('click', function(e) {
    const btn = e.target.closest && e.target.closest('.add-to-cart');
    if (btn) {
        e.preventDefault();
        addToCartFromElement(btn);
    }
});

// Export helper
window.addToCartFromElement = addToCartFromElement;

// Go to checkout
function goToCheckout() {
    if (cartItems.length === 0) {
        alert('Your cart is empty!');
        return;
    }

    // Save cart to session/localStorage
    localStorage.setItem('cart', JSON.stringify(cartItems));

    // Redirect to checkout (Step 1: Cart)
    window.location.href = 'checkout-modern.html';
}

// Show notification
function showNotification(message) {
    const notification = document.createElement('div');
    notification.className = 'cart-notification';
    notification.innerHTML = `
        <i class="fi-rs-check-circle"></i>
        <span>${message}</span>
    `;
    document.body.appendChild(notification);

    setTimeout(() => notification.classList.add('show'), 100);
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    initCartDrawer();

    // Load cart from localStorage if exists
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
        try {
            cartItems = JSON.parse(savedCart);
            updateCartDrawer();
        } catch (e) {
            console.error('Error loading cart:', e);
        }
    }
});

// Export functions for global use
window.openCartDrawer = openCartDrawer;
window.closeCartDrawer = closeCartDrawer;
window.addToCart = addToCart;
window.updateQuantity = updateQuantity;
window.removeItem = removeItem;
window.goToCheckout = goToCheckout;
