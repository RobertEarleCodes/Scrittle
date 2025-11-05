const express = require('express');
require('dotenv').config();
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors());
app.use(express.static('.'));

// Constants
const PRODUCT_ID = 'pickup_edge_hangboard';
const PRODUCT_PRICE = 3500; // £35.00 in pence
const SHOP_ADDRESS = {
    street: '47 Clementson Road',
    city: 'Sheffield',
    postcode: 'S13 9AQ',
    country: 'GB'
};

// Royal Mail shipping rates (simplified)
const ROYAL_MAIL_RATES = {
    special_delivery_guaranteed_by_9am: { price: 50, name: 'Special Delivery Guaranteed by 9am (£0.50)' },
    special_delivery_guaranteed_by_1pm: { price: 50, name: 'Special Delivery Guaranteed by 1pm (£0.50)' },
    special_delivery_guaranteed_next_working_day: { price: 50, name: 'Special Delivery Next Working Day (£0.50)' },
    royal_mail_special_delivery_saturday: { price: 50, name: 'Special Delivery Saturday Guarantee (£0.50)' }
};

// Calculate shipping based on postcode
app.post('/api/calculate-shipping', async (req, res) => {
    try {
        const { postcode } = req.body;

        if (!postcode) {
            return res.status(400).json({ error: 'Postcode required' });
        }

        // Basic UK postcode validation
        const postcodePattern = /^[A-Z]{1,2}\d{1,2}[A-Z]?\s?\d[A-Z]{2}$/i;
        if (!postcodePattern.test(postcode.trim())) {
            return res.status(400).json({ error: 'Invalid UK postcode' });
        }

        // For demonstration: all UK postcodes use standard Royal Mail rates
        // In production, you'd integrate with Royal Mail API for accurate rates
        const shippingOptions = Object.entries(ROYAL_MAIL_RATES).map(([id, rate]) => ({
            id,
            name: rate.name,
            price: rate.price
        }));

        res.json({
            success: true,
            postcode: postcode.toUpperCase(),
            shippingOptions
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Create checkout session
app.post('/api/create-checkout-session', async (req, res) => {
    try {
        const { shippingMethod, customerEmail, shippingPostcode, cartItems } = req.body;

        if (!shippingMethod || !Object.keys(ROYAL_MAIL_RATES).includes(shippingMethod)) {
            return res.status(400).json({ error: 'Invalid shipping method' });
        }

        const shippingCost = ROYAL_MAIL_RATES[shippingMethod].price;
        const shippingName = ROYAL_MAIL_RATES[shippingMethod].name;

        // Get domain from request origin or environment variable
        const domain = req.get('origin') || process.env.DOMAIN || 'http://localhost:3000';

        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: [
                {
                    price_data: {
                        currency: 'gbp',
                        product_data: {
                            name: 'Pickup Edge Hangboard',
                            description: 'Premium grip training equipment'
                        },
                        unit_amount: PRODUCT_PRICE
                    },
                    quantity: 1
                },
                {
                    price_data: {
                        currency: 'gbp',
                        product_data: {
                            name: 'Shipping',
                            description: shippingName
                        },
                        unit_amount: shippingCost
                    },
                    quantity: 1
                }
            ],
            mode: 'payment',
            customer_email: customerEmail,
            success_url: `${domain}/success.html?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${domain}/cart.html`,
            metadata: {
                shippingPostcode,
                shippingMethod,
                shopAddress: JSON.stringify(SHOP_ADDRESS),
                cartItems: JSON.stringify(cartItems)
            }
        });

        res.json({ sessionId: session.id });
    } catch (error) {
        console.error('Error creating session:', error);
        res.status(500).json({ error: error.message });
    }
});

// Store for orders (in production, use a database)
let orders = [];

// Get public key for Stripe
app.get('/api/public-key', (req, res) => {
    res.json({ publicKey: process.env.STRIPE_PUBLIC_KEY });
});

// Save order from successful payment
app.post('/api/save-order', (req, res) => {
    try {
        const { sessionId, customerEmail, shippingPostcode, shippingMethod, amount } = req.body;
        
        const order = {
            id: sessionId,
            email: customerEmail,
            postcode: shippingPostcode,
            shippingMethod,
            amount,
            date: new Date().toISOString(),
            status: 'pending'
        };
        
        orders.push(order);
        console.log('✓ Order saved:', order.id);
        res.json({ success: true, orderId: order.id });
    } catch (error) {
        console.error('Error saving order:', error);
        res.status(500).json({ error: error.message });
    }
});

// Get all orders for fulfillment
app.get('/api/orders', (req, res) => {
    res.json({ orders });
});

// Update order status
app.post('/api/update-order-status', (req, res) => {
    try {
        const { orderId, status } = req.body;
        const order = orders.find(o => o.id === orderId);
        
        if (!order) {
            return res.status(404).json({ error: 'Order not found' });
        }
        
        order.status = status;
        console.log('✓ Order status updated:', orderId, status);
        res.json({ success: true, order });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Webhook for order confirmation
app.post('/api/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
    const sig = req.headers['stripe-signature'];

    // Skip webhook validation if secret is not configured
    if (!process.env.STRIPE_WEBHOOK_SECRET || process.env.STRIPE_WEBHOOK_SECRET.includes('YOUR_')) {
        console.log('Webhook received (validation skipped - no secret configured)');
        return res.json({ received: true });
    }

    try {
        const event = stripe.webhooks.constructEvent(
            req.body,
            sig,
            process.env.STRIPE_WEBHOOK_SECRET
        );

        if (event.type === 'checkout.session.completed') {
            const session = event.data.object;
            console.log('Payment completed:', session.id);
            // Here you would save order to database, send confirmation email, etc.
        }

        res.json({ received: true });
    } catch (error) {
        console.error('Webhook error:', error);
        res.status(400).send(`Webhook Error: ${error.message}`);
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
