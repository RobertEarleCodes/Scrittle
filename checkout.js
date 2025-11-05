// Stripe Checkout Handler
let stripe;
let shippingPostcode = '';
let selectedShippingMethod = '';

// Determine API base URL
const API_BASE = 'http://localhost:3000';

document.addEventListener('DOMContentLoaded', async () => {
    try {
        console.log('Initializing Stripe...');
        
        // Initialize Stripe
        const response = await fetch(`${API_BASE}/api/public-key`);
        const { publicKey } = await response.json();
        
        console.log('Public key:', publicKey ? 'loaded' : 'missing');
        
        if (!publicKey) {
            console.error('No Stripe public key available');
            alert('Payment system not configured. Please check server.');
            return;
        }
        
        stripe = Stripe(publicKey);
        console.log('✓ Stripe initialized successfully');
        
        const checkoutBtn = document.getElementById('checkout-btn');
        if (checkoutBtn) {
            checkoutBtn.addEventListener('click', startCheckout);
            console.log('✓ Checkout button listener attached');
        }
    } catch (error) {
        console.error('Error initializing Stripe:', error);
        alert('Error: ' + error.message);
    }
});

async function startCheckout() {
    console.log('🛒 Checkout started');
    
    if (!stripe) {
        alert('Payment system not ready. Please refresh the page.');
        return;
    }

    // Show shipping details modal
    const postcode = prompt('Enter your UK postcode (e.g., S13 9AQ):');
    if (!postcode) {
        console.log('Postcode entry cancelled');
        return;
    }

    shippingPostcode = postcode;
    console.log('Postcode entered:', postcode);

    try {
        console.log('Calculating shipping...');
        const response = await fetch(`${API_BASE}/api/calculate-shipping`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ postcode })
        });

        const data = await response.json();
        console.log('Shipping response:', data);

        if (!response.ok) {
            alert('Error: ' + (data.error || 'Unknown error'));
            return;
        }

        // Show shipping method selection
        showShippingOptions(data.shippingOptions);
    } catch (error) {
        console.error('Error calculating shipping:', error);
        alert('Error calculating shipping: ' + error.message);
    }
}

function showShippingOptions(options) {
    console.log('Shipping options:', options);
    
    if (!options || options.length === 0) {
        alert('No shipping options available');
        return;
    }

    const optionsText = options
        .map((opt, idx) => `${idx + 1}. ${opt.name}`)
        .join('\n');

    const choice = prompt(
        `Select a shipping method:\n\n${optionsText}`,
        '1'
    );

    if (!choice) {
        console.log('Shipping selection cancelled');
        return;
    }

    const selectedIdx = parseInt(choice) - 1;
    if (selectedIdx < 0 || selectedIdx >= options.length) {
        alert('Invalid selection');
        return;
    }

    selectedShippingMethod = options[selectedIdx].id;
    console.log('Shipping method selected:', selectedShippingMethod);
    proceedToCheckout();
}

async function proceedToCheckout() {
    const email = prompt('Enter your email address:');
    if (!email) {
        console.log('Email entry cancelled');
        return;
    }

    console.log('Creating checkout session for:', email);

    try {
        const response = await fetch(`${API_BASE}/api/create-checkout-session`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                shippingMethod: selectedShippingMethod,
                customerEmail: email,
                shippingPostcode
            })
        });

        const data = await response.json();
        console.log('Checkout session response:', data);

        if (!response.ok) {
            alert('Error: ' + (data.error || 'Unknown error'));
            return;
        }

        if (!data.sessionId) {
            alert('Error: No session ID received');
            return;
        }

        console.log('✓ Checkout session created:', data.sessionId);
        console.log('Redirecting to Stripe Checkout...');

        // Redirect to Stripe Checkout using newer method
        const { error } = await stripe.redirectToCheckout({
            sessionId: data.sessionId
        });

        if (error) {
            console.error('Stripe error:', error);
            alert('Error: ' + error.message);
        }
    } catch (error) {
        console.error('Error proceeding to checkout:', error);
        alert('Error: ' + error.message);
    }
}
