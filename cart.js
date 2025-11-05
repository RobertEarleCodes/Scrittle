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
});

function attachAddToCartListener() {
    const btn = document.getElementById('add-to-cart-btn');
    if (btn) {
        btn.addEventListener('click', addToCart);
    }
}

function addToCart() {
    const cart = getCart();
    const btn = document.getElementById('add-to-cart-btn');
    
    cart.push({
        id: PRODUCT.id,
        name: PRODUCT.name,
        price: PRODUCT.price,
        quantity: 1
    });
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
