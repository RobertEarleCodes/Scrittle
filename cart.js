// Simple Cart Management
const PRODUCT = {
    id: 'pickup_edge_hangboard',
    name: 'Pickup Edge Hangboard',
    price: 35.00
};

const API_BASE = 'http://localhost:3000';

// Initialize cart on page load
document.addEventListener('DOMContentLoaded', () => {
    updateCartCount();
    attachAddToCartListener();
    attachSidebarListeners();
});

function attachAddToCartListener() {
    const btn = document.getElementById('add-to-cart-btn');
    if (btn) {
        btn.addEventListener('click', addToCart);
    }
}

function attachSidebarListeners() {
    const closeBtn = document.getElementById('cart-sidebar-close');
    const overlay = document.getElementById('cart-sidebar-overlay');
    
    if (closeBtn) {
        closeBtn.addEventListener('click', closeSidebar);
    }
    
    if (overlay) {
        overlay.addEventListener('click', closeSidebar);
    }
}

function addToCart() {
    const cart = getCart();
    const btn = document.getElementById('add-to-cart-btn');
    
    const newItem = {
        id: PRODUCT.id,
        name: PRODUCT.name,
        price: PRODUCT.price,
        quantity: 1
    };
    
    cart.push(newItem);
    saveCart(cart);
    updateCartCount();
    
    // Trigger glow animation on button
    if (btn) {
        btn.classList.add('glow');
        setTimeout(() => {
            btn.classList.remove('glow');
        }, 800);
    }
    
    // Trigger glow animation on cart count badge
    const cartCount = document.getElementById('cart-count');
    if (cartCount) {
        cartCount.classList.add('glow');
        setTimeout(() => {
            cartCount.classList.remove('glow');
        }, 1000);
    }
    
    // Show cart sidebar with the newly added item
    showCartSidebar(newItem);
}

function showCartSidebar(newItem) {
    const sidebar = document.getElementById('cart-sidebar');
    const overlay = document.getElementById('cart-sidebar-overlay');
    const content = document.getElementById('cart-sidebar-content');
    
    if (!sidebar) return;
    
    // Create item element
    const itemElement = document.createElement('div');
    itemElement.className = 'cart-sidebar-item';
    itemElement.innerHTML = `
        <div class="cart-sidebar-item-name">${newItem.name}</div>
        <div class="cart-sidebar-item-price">£${newItem.price.toFixed(2)}</div>
    `;
    
    // Clear previous content and add new item
    content.innerHTML = '';
    content.appendChild(itemElement);
    
    // Open sidebar
    sidebar.classList.add('open');
    if (overlay) {
        overlay.classList.add('open');
    }
    
    // Auto-close after 4 seconds
    setTimeout(() => {
        closeSidebar();
    }, 4000);
}

function closeSidebar() {
    const sidebar = document.getElementById('cart-sidebar');
    const overlay = document.getElementById('cart-sidebar-overlay');
    
    if (sidebar) {
        sidebar.classList.remove('open');
    }
    
    if (overlay) {
        overlay.classList.remove('open');
    }
}

function updateCartCount() {
    const cart = getCart();
    const count = cart.length;
    const countEl = document.getElementById('cart-count');
    if (countEl) {
        countEl.textContent = count;
        countEl.style.display = count > 0 ? 'flex' : 'none';
    }
}

function getCart() {
    const cart = localStorage.getItem('pickup_edge_cart');
    return cart ? JSON.parse(cart) : [];
}

function saveCart(cart) {
    localStorage.setItem('pickup_edge_cart', JSON.stringify(cart));
}

function clearCart() {
    localStorage.removeItem('pickup_edge_cart');
}
