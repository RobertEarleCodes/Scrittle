// Cart Checkout Handler
let stripe;
let shippingOptions = [];

// Get API base URL dynamically (works in both dev and production)
function getApiBase() {
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
        return 'http://localhost:3000';
    }
    // In production, use current domain
    return window.location.origin;
}

const API_BASE = getApiBase();

document.addEventListener('DOMContentLoaded', async () => {
    try {
        // Initialize Stripe
        const response = await fetch(`${API_BASE}/api/public-key`);
        const { publicKey } = await response.json();
        
        if (!publicKey) {
            console.error('No Stripe public key available');
            alert('Payment system not configured. Please check server.');
            return;
        }
        
        stripe = Stripe(publicKey);
        console.log('✓ Stripe initialized');
        
        // Load and display cart items
        loadCartItems();
        
        // Attach event listeners
        document.getElementById('postcode').addEventListener('change', loadShippingOptions);
        document.getElementById('shipping').addEventListener('change', updateTotals);
        document.getElementById('checkout-btn').addEventListener('click', proceedToCheckout);
    } catch (error) {
        console.error('Initialization error:', error);
        alert('Error: ' + error.message);
    }
});

function loadCartItems() {
    const cart = JSON.parse(localStorage.getItem('pickup_edge_cart') || '[]');
    const itemsContainer = document.getElementById('cart-items');
    
    if (cart.length === 0) {
        itemsContainer.innerHTML = '<p class="empty-cart">Your cart is empty</p>';
        return;
    }
    
    let html = '<div class="items-list">';
    let subtotal = 0;
    
    cart.forEach((item, idx) => {
        const itemTotal = item.price * item.quantity;
        subtotal += itemTotal;
        
        html += `
            <div class="cart-item">
                <div class="item-details">
                    <h3>${item.name}</h3>
                    <p class="item-price">£${item.price.toFixed(2)} x ${item.quantity}</p>
                </div>
                <div class="item-total">£${itemTotal.toFixed(2)}</div>
                <button class="remove-btn" onclick="removeItem(${idx})">Remove</button>
            </div>
        `;
    });
    
    html += '</div>';
    itemsContainer.innerHTML = html;
    
    // Update subtotal
    document.getElementById('subtotal').textContent = '£' + subtotal.toFixed(2);
    updateTotals();
}

function removeItem(index) {
    const cart = JSON.parse(localStorage.getItem('pickup_edge_cart') || '[]');
    cart.splice(index, 1);
    localStorage.setItem('pickup_edge_cart', JSON.stringify(cart));
    
    if (cart.length === 0) {
        localStorage.removeItem('pickup_edge_cart');
    }
    
    loadCartItems();
    // Update cart count
    const count = cart.length;
    const countEl = document.getElementById('cart-count');
    if (countEl) {
        countEl.textContent = count;
        countEl.style.display = count > 0 ? 'flex' : 'none';
    }
}

async function loadShippingOptions() {
    const postcode = document.getElementById('postcode').value.trim();
    
    if (!postcode) {
        document.getElementById('shipping').innerHTML = '<option value="">Select shipping option...</option>';
        return;
    }
    
    try {
        const response = await fetch(`${API_BASE}/api/calculate-shipping`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ postcode })
        });
        
        const data = await response.json();
        
        if (!response.ok) {
            alert('Error: ' + (data.error || 'Invalid postcode'));
            document.getElementById('shipping').innerHTML = '<option value="">Select shipping option...</option>';
            return;
        }
        
        shippingOptions = data.shippingOptions;
        
        let html = '<option value="">Select shipping option...</option>';
        shippingOptions.forEach((option, idx) => {
            html += `<option value="${idx}">${option.name}</option>`;
        });
        
        document.getElementById('shipping').innerHTML = html;
        updateTotals();
    } catch (error) {
        console.error('Error loading shipping:', error);
        alert('Error loading shipping options: ' + error.message);
    }
}

function updateTotals() {
    const subtotal = parseFloat(document.getElementById('subtotal').textContent.replace('£', '')) || 0;
    const shippingSelect = document.getElementById('shipping');
    const selectedIdx = shippingSelect.value;
    
    let shippingCost = 0;
    if (selectedIdx !== '' && shippingOptions[selectedIdx]) {
        shippingCost = shippingOptions[selectedIdx].price / 100; // Convert from pence
    }
    
    const total = subtotal + shippingCost;
    
    document.getElementById('shipping-cost').textContent = '£' + shippingCost.toFixed(2);
    document.getElementById('total').textContent = '£' + total.toFixed(2);
}

async function proceedToCheckout() {
    const cart = JSON.parse(localStorage.getItem('pickup_edge_cart') || '[]');
    const email = document.getElementById('email').value.trim();
    const postcode = document.getElementById('postcode').value.trim();
    const shippingIdx = document.getElementById('shipping').value;
    const checkoutBtn = document.getElementById('checkout-btn');
    
    // Validation
    if (cart.length === 0) {
        alert('Your cart is empty');
        return;
    }
    
    if (!email) {
        alert('Please enter your email');
        return;
    }
    
    if (!postcode) {
        alert('Please enter your postcode');
        return;
    }
    
    if (shippingIdx === '') {
        alert('Please select a shipping method');
        return;
    }
    
    if (!stripe) {
        alert('Payment system not ready');
        return;
    }
    
    const selectedShipping = shippingOptions[shippingIdx];
    if (!selectedShipping) {
        alert('Invalid shipping method');
        return;
    }
    
    try {
        // Add processing animation to button
        checkoutBtn.classList.add('processing');
        checkoutBtn.disabled = true;
        
        console.log('Creating checkout session...');
        
        const response = await fetch(`${API_BASE}/api/create-checkout-session`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                shippingMethod: selectedShipping.id,
                customerEmail: email,
                shippingPostcode: postcode,
                cartItems: cart
            })
        });
        
        const data = await response.json();
        
        if (!response.ok) {
            checkoutBtn.classList.remove('processing');
            checkoutBtn.disabled = false;
            alert('Error: ' + (data.error || 'Unknown error'));
            return;
        }
        
        if (!data.sessionId) {
            checkoutBtn.classList.remove('processing');
            checkoutBtn.disabled = false;
            alert('Error: No session ID received');
            return;
        }
        
        console.log('✓ Checkout session created, redirecting to Stripe...');
        
        const { error } = await stripe.redirectToCheckout({
            sessionId: data.sessionId
        });
        
        if (error) {
            console.error('Stripe error:', error);
            checkoutBtn.classList.remove('processing');
            checkoutBtn.disabled = false;
            alert('Payment error: ' + error.message);
        }
    } catch (error) {
        console.error('Checkout error:', error);
        checkoutBtn.classList.remove('processing');
        checkoutBtn.disabled = false;
        alert('Error: ' + error.message);
    }
}
