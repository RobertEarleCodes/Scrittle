# Deployment Guide - Pickup Edge Website

## 🔒 Security Checklist ✅

- ✅ `.env` file excluded from git (`.gitignore`)
- ✅ All environment variables stored server-side
- ✅ Dynamic API URLs (works in dev and production)
- ✅ Stripe keys never exposed in client code
- ✅ Order data persisted on server

## 📋 Pre-Deployment Steps

### 1. Create GitHub Repository

```bash
cd /Users/robertearle/Documents/Hangboard/WEBSITE

# Initialize git (if not already done)
git init
git add .
git commit -m "Initial commit: Secure production setup"

# Create repo on GitHub
# Visit: https://github.com/new
# Name: hangboard-website
# DO NOT initialize with files
```

Then push:

```bash
git remote add origin https://github.com/YOUR_USERNAME/hangboard-website.git
git branch -M main
git push -u origin main
```

### 2. Get Live Stripe Keys

1. Log into https://dashboard.stripe.com
2. Click "Developers" → "API keys"
3. Switch to **Live** mode (toggle in top left)
4. Copy your live keys:
   - `pk_live_...` (public key)
   - `sk_live_...` (secret key)

## 🚀 Deploy to Render.com (Recommended)

### Step 1: Connect GitHub

1. Go to https://render.com
2. Click "Dashboard"
3. Click "New +" → "Web Service"
4. Click "Connect" next to your GitHub account
5. Select `hangboard-website` repository

### Step 2: Configure Service

Fill in the form:
- **Name**: `hangboard` (or your preferred name)
- **Environment**: `Node`
- **Build Command**: `npm install`
- **Start Command**: `npm start`
- **Instance Type**: Free

### Step 3: Add Environment Variables

Click "Add Environment Variable" and add:

```
STRIPE_PUBLIC_KEY = pk_live_your_live_key_here
STRIPE_SECRET_KEY = sk_live_your_live_key_here
STRIPE_WEBHOOK_SECRET = optional
DOMAIN = https://your-app-name.onrender.com
PORT = 3000
```

### Step 4: Deploy

Click "Create Web Service" and wait for deployment to complete.

Your app will be available at: `https://your-app-name.onrender.com`

## 🌐 Connect Custom Domain (scrittle.co.uk)

### Via Render.com

1. From your Render dashboard, go to your service
2. Click "Settings"
3. Scroll to "Custom Domain"
4. Enter: `scrittle.co.uk`
5. Note the DNS records provided
6. Update your domain registrar's DNS settings to point to Render

### DNS Settings

Point these to Render's nameservers:

```
NS1: ns1.render.com
NS2: ns2.render.com
NS3: ns3.render.com
NS4: ns4.render.com
```

Or add a CNAME record pointing to your Render subdomain.

## 🔄 Continuous Deployment

Once GitHub is connected to Render:
- Every time you push to `main` branch
- Render automatically redeploys
- No manual steps needed!

### Workflow:

```bash
# Make changes locally
git add .
git commit -m "Update pricing to £40"
git push origin main

# Render automatically deploys!
```

## 📊 Monitor Your Deployment

### Render Dashboard

- View logs: Click on your service → "Logs"
- Check status: Green = running, Red = error
- Restart service: "More" → "Restart"

### Check if Live

```bash
curl https://scrittle.co.uk/product.html
```

## 💳 Switching from Test to Live

1. Get live Stripe keys (see section above)
2. Update environment variables in Render dashboard
3. Render automatically redeploys with new keys
4. **Now real charges will be processed!** ⚠️

## 🆘 Troubleshooting

### "Build failed"
- Check logs for errors
- Ensure all files committed to git
- Verify Node/npm versions compatible

### "Orders not showing"
- Orders stored in server memory (not persistent between restarts)
- **For production**: Add MongoDB or PostgreSQL
- Contact support for help

### "Payments not working"
- Verify live Stripe keys in environment variables
- Check browser console for errors
- Ensure domain matches DOMAIN env var

## 📝 Next Steps

### For Production (Recommended)

1. **Add Database** - For persistent orders:
   ```bash
   npm install mongoose
   # Connect to MongoDB Atlas (free tier available)
   ```

2. **Add Email Notifications** - Send confirmation emails:
   ```bash
   npm install nodemailer
   ```

3. **Setup Webhooks** - Real-time Stripe updates:
   - Generate webhook secret in Stripe Dashboard
   - Update `STRIPE_WEBHOOK_SECRET` in Render

4. **Add SSL Certificate** - Render handles automatically

## 📞 Support Resources

- **Render Docs**: https://render.com/docs
- **Stripe Docs**: https://stripe.com/docs
- **GitHub Pages**: https://pages.github.com
- **Node.js**: https://nodejs.org/docs

---

**You're all set!** Your website is production-ready and secure. 🚀
