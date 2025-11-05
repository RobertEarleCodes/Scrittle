# Pickup Edge - Hangboard E-Commerce Website

A beautiful, minimal e-commerce website for the Pickup Edge Hangboard with Stripe checkout integration and Royal Mail shipping.

## Features

- 🎨 Minimalist design with black and white aesthetic
- 🛒 Shopping cart system with localStorage
- 💳 Stripe integration for secure payments
- 📦 Royal Mail shipping options
- 📋 Order management and fulfillment tracking
- 🔒 Secure payment handling (test mode by default)

## Local Development

### Prerequisites
- Node.js 14+
- npm

### Setup

1. **Clone the repository**
```bash
git clone https://github.com/YOUR_USERNAME/hangboard-website.git
cd hangboard-website
```

2. **Install dependencies**
```bash
npm install
```

3. **Configure environment variables**
```bash
cp .env.example .env
```

Edit `.env` and add your Stripe API keys:
```
STRIPE_PUBLIC_KEY=pk_test_your_key
STRIPE_SECRET_KEY=sk_test_your_key
STRIPE_WEBHOOK_SECRET=optional_for_development
DOMAIN=http://localhost:3000
PORT=3000
```

4. **Start the server**
```bash
npm start
```

5. **Open in browser**
```
http://localhost:3000
```

## Test Payment

Use these test card numbers:
- **Success**: `4242 4242 4242 4242`
- **Decline**: `4000 0000 0000 0002`

Any future expiry date and any 3-digit CVC.

## Deployment to Production

### Option 1: Render.com (Recommended - Free Tier)

1. Push your code to GitHub
2. Go to [Render.com](https://render.com)
3. Connect your GitHub account
4. Create new Web Service from your repository
5. Configure:
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - Add environment variables from your `.env`
6. Deploy and connect your custom domain

### Option 2: Heroku

1. Install Heroku CLI
2. Run:
```bash
heroku create your-app-name
git push heroku main
```

3. Set environment variables:
```bash
heroku config:set STRIPE_PUBLIC_KEY=pk_live_your_key
heroku config:set STRIPE_SECRET_KEY=sk_live_your_key
```

### Environment Variables for Production

When deploying, update your environment variables with **live Stripe keys**:
- `STRIPE_PUBLIC_KEY=pk_live_...`
- `STRIPE_SECRET_KEY=sk_live_...`
- `DOMAIN=https://yourdomain.com`

## File Structure

```
├── index.html           # Splash page
├── product.html         # Product page
├── cart.html           # Shopping cart
├── orders.html         # Order fulfillment dashboard
├── success.html        # Payment success page
├── styles.css          # All styling
├── cart.js             # Cart management
├── cart-checkout.js    # Checkout flow
├── server.js           # Express server & Stripe API
├── package.json        # Dependencies
└── .env               # Environment variables (NEVER commit)
```

## API Endpoints

- `GET /api/public-key` - Get Stripe public key
- `POST /api/calculate-shipping` - Get shipping options for postcode
- `POST /api/create-checkout-session` - Create Stripe checkout
- `POST /api/save-order` - Save order for fulfillment
- `GET /api/orders` - Get all orders
- `POST /api/update-order-status` - Update order status

## Security

- ✅ Stripe keys stored in environment variables
- ✅ `.env` file in `.gitignore` (never committed)
- ✅ Test mode by default (no real charges)
- ✅ Card payments only (Pay with Link disabled)
- ✅ Dynamic API URLs (works in dev and production)

## Pricing

- Product: £35.00
- Shipping: £0.50 (all methods)

## License

Private
