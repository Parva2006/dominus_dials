// Cart Management Functions
function getCart() {
    const cart = localStorage.getItem('cart');
    return cart ? JSON.parse(cart) : [];
}

function saveCart(cart) {
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartCount();
    // Re-render the cart UI when available so summary visibility and totals refresh
    if (typeof displayCart === 'function') {
        try { displayCart(); } catch (e) { /* ignore DOM errors */ }
    }
    // Always update the summary element (if present) after saving
    if (document.getElementById && document.getElementById('subtotal')) {
        try { updateCartSummary(); } catch (e) { /* ignore if function not available yet */ }
    }
}

// Robust price parser: strips currency symbols and commas
function parsePrice(value) {
    return Number(String(value).replace(/[^0-9.-]+/g, '')) || 0;
}

function updateCartCount() {
    const cart = getCart();
    const totalItems = cart.reduce((sum, item) => sum + (Number(item.quantity) || 0), 0);
    const cartCountElements = document.querySelectorAll('.cart-count');
    cartCountElements.forEach(el => {
        el.textContent = totalItems;
    });
}

function addToCart(product) {
    const cart = getCart();
    const existingItem = cart.find(item => item.id === product.id);
    
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({ ...product, quantity: 1 });
    }
    
    saveCart(cart);
    return cart;
}

function removeFromCart(productId) {
    const cart = getCart();
    const updatedCart = cart.filter(item => item.id !== productId);
    saveCart(updatedCart);
    // Remove corresponding DOM node immediately if present
    try {
        const cartItemsContainer = document.getElementById('cartItems');
        const itemNode = cartItemsContainer && cartItemsContainer.querySelector(`.cart-item[data-id="${productId}"]`);
        if (itemNode && itemNode.parentNode) {
            itemNode.parentNode.removeChild(itemNode);
        }
    } catch (e) {
        // ignore DOM errors
    }

    // Ensure cart UI is refreshed (handles summary, counts)
    if (typeof displayCart === 'function') displayCart();

    return updatedCart;
}

function updateQuantity(productId, quantity) {
    const cart = getCart();
    const item = cart.find(item => item.id === productId);
    
    if (item) {
        if (quantity <= 0) {
            return removeFromCart(productId);
        }
        item.quantity = quantity;
        saveCart(cart);
    }
    
    return cart;
}

function getCartTotal() {
    const cart = getCart();
    return cart.reduce((total, item) => {
        const price = parsePrice(item.price);
        const qty = Number(item.quantity) || 0;
        return total + (price * qty);
    }, 0);
}

// Display Cart Items
function displayCart() {
    const cart = getCart();
    const cartItemsContainer = document.getElementById('cartItems');
    const emptyCart = document.getElementById('emptyCart');
    const cartSummary = document.getElementById('cartSummary');
    
    if (cart.length === 0) {
        // Ensure cart items container shows the empty message. Recreate the
        // empty-cart element if it was removed from the DOM earlier.
        cartItemsContainer.innerHTML = '';

        let emptyEl = document.getElementById('emptyCart');
        if (!emptyEl) {
            emptyEl = document.createElement('div');
            emptyEl.id = 'emptyCart';
            emptyEl.className = 'empty-cart';
            emptyEl.innerHTML = `
                <div class="empty-cart-icon">🛒</div>
                <h2>Your cart is empty</h2>
                <p>Looks like you haven't added any items to your cart yet.</p>
                <a href="products.html" class="btn-primary">Browse Products</a>
            `;
        }

        // Append (or re-append) to the container and make visible
        if (!cartItemsContainer.contains(emptyEl)) cartItemsContainer.appendChild(emptyEl);
        emptyEl.style.display = 'block';

        // Hide the summary and reset totals
        if (cartSummary) {
            cartSummary.style.display = 'none';
        }
        const subtotalEl = document.getElementById('subtotal');
        const shippingEl = document.getElementById('shipping');
        const taxEl = document.getElementById('tax');
        const totalEl = document.getElementById('total');
        if (subtotalEl) subtotalEl.textContent = '$0.00';
        if (shippingEl) shippingEl.textContent = '$0.00';
        if (taxEl) taxEl.textContent = '$0.00';
        if (totalEl) totalEl.textContent = '$0.00';

        // Update cart count and exit
        updateCartCount();
        return;
    }
    
    emptyCart.style.display = 'none';
    cartSummary.style.display = 'block';
    
    try {
        cartItemsContainer.innerHTML = cart.map(item => {
        const priceNum = parsePrice(item.price);
        const itemTotal = priceNum * (Number(item.quantity) || 0);
        return `
        <div class="cart-item" data-id="${item.id}">
            <div class="cart-item-image">
                ${item.image ? `<img src="${item.image}" alt="${item.name}">` : '<div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); width: 100%; height: 100%;"></div>'}
            </div>
            <div class="cart-item-details">
                <h3>${item.name}</h3>
                <p class="cart-item-desc">${item.description || ''}</p>
                <p class="cart-item-price">$${priceNum.toFixed(2)}</p>
            </div>
            <div class="cart-item-controls">
                <div class="quantity-controls">
                    <button class="quantity-btn" onclick="decreaseQuantity('${item.id}')">-</button>
                    <input type="number" class="quantity-input" value="${item.quantity}" min="1" 
                           onchange="updateItemQuantity('${item.id}', this.value)">
                    <button class="quantity-btn" onclick="increaseQuantity('${item.id}')">+</button>
                </div>
                <div class="cart-item-total">
                    <strong>$${itemTotal.toFixed(2)}</strong>
                </div>
                <button class="remove-btn" onclick="removeItem('${item.id}')">Remove</button>
            </div>
        </div>
    `}).join('');
    } catch (e) {
        // Fallback: build DOM nodes manually if template injection fails
        cartItemsContainer.innerHTML = '';
        cart.forEach(item => {
            const priceNum = parsePrice(item.price);
            const itemTotal = priceNum * (Number(item.quantity) || 0);
            const wrapper = document.createElement('div');
            wrapper.className = 'cart-item';
            wrapper.setAttribute('data-id', item.id);

            wrapper.innerHTML = `
                <div class="cart-item-image">${item.image ? `<img src="${item.image}" alt="${item.name}">` : '<div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); width: 100%; height: 100%;"></div>'}</div>
                <div class="cart-item-details">
                    <h3>${item.name}</h3>
                    <p class="cart-item-desc">${item.description || ''}</p>
                    <p class="cart-item-price">$${priceNum.toFixed(2)}</p>
                </div>
                <div class="cart-item-controls">
                    <div class="quantity-controls">
                        <button class="quantity-btn" onclick="decreaseQuantity('${item.id}')">-</button>
                        <input type="number" class="quantity-input" value="${item.quantity}" min="1" onchange="updateItemQuantity('${item.id}', this.value)">
                        <button class="quantity-btn" onclick="increaseQuantity('${item.id}')">+</button>
                    </div>
                    <div class="cart-item-total"><strong>$${itemTotal.toFixed(2)}</strong></div>
                    <button class="remove-btn" onclick="removeItem('${item.id}')">Remove</button>
                </div>
            `;
            cartItemsContainer.appendChild(wrapper);
        });
    }

    // Ensure counts and summary are updated after rendering
    updateCartCount();
    updateCartSummary();
}

function updateCartSummary() {
    const subtotal = getCartTotal();
    // Shipping is $0 only when cart is empty; otherwise flat $10 shipping
        const shipping = subtotal === 0 ? 0 : 10; // Shipping is $0 only when the cart is empty; otherwise flat $10
    const tax = subtotal * 0.08; // 8% tax
    const total = subtotal + shipping + tax;
    const subtotalEl = document.getElementById('subtotal');
    const shippingEl = document.getElementById('shipping');
    const taxEl = document.getElementById('tax');
    const totalEl = document.getElementById('total');
    const cartSummaryEl = document.getElementById('cartSummary');

    // Hide the summary box entirely when subtotal is zero (empty cart)
    if (cartSummaryEl) {
        cartSummaryEl.style.display = subtotal === 0 ? 'none' : 'block';
    }

    if (subtotalEl) subtotalEl.textContent = `$${subtotal.toFixed(2)}`;
    // Show 'Free' when cart is empty, otherwise show shipping amount
    if (shippingEl) shippingEl.textContent = subtotal === 0 ? 'Free' : `$${shipping.toFixed(2)}`;
    if (taxEl) taxEl.textContent = `$${tax.toFixed(2)}`;
    if (totalEl) totalEl.textContent = `$${total.toFixed(2)}`;

    // Ensure displayed per-item quantities and line totals reflect the saved cart
    try {
        const cart = getCart();
        cart.forEach(item => {
            const node = document.querySelector(`.cart-item[data-id="${item.id}"]`);
            if (!node) return;
            const qtyInput = node.querySelector('.quantity-input');
            if (qtyInput) {
                // Only update if value mismatches to avoid disrupting focus where possible
                if (String(qtyInput.value) !== String(item.quantity)) qtyInput.value = item.quantity;
            }
            const lineTotalNode = node.querySelector('.cart-item-total strong');
            const priceNum = parsePrice(item.price);
            const lineTotal = (priceNum * (Number(item.quantity) || 0)).toFixed(2);
            if (lineTotalNode) lineTotalNode.textContent = `$${lineTotal}`;
        });
    } catch (e) {
        // ignore DOM sync errors
    }
}

function increaseQuantity(productId) {
    const cart = getCart();
    const item = cart.find(item => item.id === productId);
    if (item) {
        item.quantity += 1;
        saveCart(cart);
        displayCart();
    }
}

function decreaseQuantity(productId) {
    const cart = getCart();
    const item = cart.find(item => item.id === productId);
    if (item && item.quantity > 1) {
        item.quantity -= 1;
        saveCart(cart);
        displayCart();
    }
}

function updateItemQuantity(productId, quantity) {
    const qty = parseInt(quantity);
    if (qty > 0) {
        updateQuantity(productId, qty);
        displayCart();
    }
}

function removeItem(productId) {
    if (confirm('Are you sure you want to remove this item from your cart?')) {
        removeFromCart(productId);
        displayCart();
    }
}

// Checkout functionality
document.addEventListener('DOMContentLoaded', () => {
    const checkoutBtn = document.getElementById('checkoutBtn');
    if (checkoutBtn) {
        checkoutBtn.addEventListener('click', () => {
            const cart = getCart();
            if (cart.length === 0) {
                alert('Your cart is empty!');
                return;
            }
            alert('Thank you for your purchase! Your order has been placed.');
            // In a real application, you would redirect to a checkout page
            saveCart([]);
            displayCart();
        });
    }
    
    displayCart();
    updateCartCount();
});

// Sync cart UI across tabs/windows
window.addEventListener('storage', (e) => {
    if (e.key === 'cart') {
        try {
            displayCart();
            updateCartCount();
        } catch (err) {
            // ignore
        }
    }
});

