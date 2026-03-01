# Deploy to Vercel - Complete Guide

## Step-by-Step Instructions

### **Step 1: Prepare Your GitHub Repository**

1. **Initialize Git** (if not done):
   ```powershell
   cd d:\Carfax-client\carfax
   git init
   git add .
   git commit -m "Initial commit - Vercel Functions setup"
   ```

2. **Create GitHub Repo**:
   - Go to [github.com/new](https://github.com/new)
   - Create repo named `carfax-client`
   - Choose public or private

3. **Push Code**:
   ```powershell
   git remote add origin https://github.com/YOUR_USERNAME/carfax-client.git
   git branch -M main
   git push -u origin main
   ```

---

### **Step 2: Sign Up for Vercel**

1. Go to [vercel.com](https://vercel.com)
2. Click "Sign Up"
3. Choose "Continue with GitHub"
4. Authorize Vercel

---

### **Step 3: Deploy Project on Vercel**

1. **In Vercel Dashboard**:
   - Click "Add New" → "Project"
   - Select `carfax-client` repository
   - Click "Import"

2. **Configure Build Settings**:
   - **Framework Preset**: Vite
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - Leave others as default
   - Click "Deploy"

3. **Wait for Deployment**:
   - Vercel will build and deploy automatically
   - You'll get a URL like `https://carfax-client.vercel.app`

---

### **Step 4: Add Environment Variables**

1. **Go to Your Project Settings**:
   - In Vercel dashboard → Your project
   - Go to **Settings** → **Environment Variables**

2. **Add These Variables**:
   ```
   VITE_PAYPAL_CLIENT_ID=your_live_paypal_client_id
   VITE_PAYPAL_ENV=production
   SUPABASE_URL=your_supabase_url
   SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
   PAYPAL_CLIENT_ID=your_paypal_client_id
   PAYPAL_CLIENT_SECRET=your_paypal_client_secret
   JWT_SECRET=your_jwt_secret_here
   ```

3. **Click Save**

4. **Redeploy**:
   - Go to **Deployments**
   - Click latest deployment → **Redeploy**

---

### **Step 5: Test Your Deployment**

1. **Visit your Vercel URL**: `https://carfax-client.vercel.app`

2. **Check API Endpoints**:
   - Open browser console (F12)
   - Go to checkout page
   - Try to make a payment
   - Check Network tab for `/api/*` calls

3. **Test Admin Login**:
   - Go to `/admin-dashboard`
   - Try logging in with your credentials

---

## Project Structure for Vercel Functions

```
/api
  ├── admin-login.js          → POST /api/admin-login
  ├── create-order.js         → POST /api/create-order
  ├── generate-report.js      → POST /api/generate-report
  ├── get-orders.js           → GET /api/get-orders
  ├── paypal-capture-order.js → POST /api/paypal-capture-order
  └── paypal-create-order.js  → POST /api/paypal-create-order
/src
  ├── (your React components)
/lib
  ├── paypal.js
  ├── supabase.js
  └── admin.js
vercel.json                   ← Configuration file
package.json
vite.config.js
```

---

## How Vercel Functions Work

- **Each file in `/api`** → Automatically becomes a serverless function
- **File name → API route**: `/api/admin-login.js` → `https://carfax-client.vercel.app/api/admin-login`
- **No need for Express** - Vercel handles routing automatically
- **Scalable** - Functions auto-scale based on traffic
- **Free tier** includes generous limits for hobby projects

---

## Important Notes

1. **Local Development**:
   - Run `npm run dev:all` to test locally with both client + server
   - Frontend at `http://localhost:5173`
   - Backend at `http://localhost:5000`

2. **Production (Vercel)**:
   - Frontend served from Vercel edge
   - API functions run serverlessly
   - All `/api/*` calls use Vercel Functions automatically

3. **CORS Handling**:
   - All API functions have CORS headers enabled
   - Requests from any origin are allowed

4. **Environment Variables**:
   - Add to Vercel Settings (not in code)
   - Automatically injected at runtime
   - Different per environment (Production/Preview)

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| 404 on API calls | Check Vercel deployment logs; ensure `/api` files are there |
| CORS errors | Verify CORS headers in API functions (already included) |
| Environment vars not loading | Redeploy after adding vars to Vercel Settings |
| Build fails locally | Run `npm run build` to check for errors |
| Token not working | Ensure JWT_SECRET is set in Vercel Environment Variables |
| PayPal errors | Verify PAYPAL_CLIENT_ID and PAYPAL_CLIENT_SECRET are correct |

---

## Next Steps

1. ✅ Push code to GitHub
2. ✅ Import project to Vercel
3. ✅ Add environment variables
4. ✅ Redeploy
5. ✅ Test all features
6. Optional: Configure custom domain in Vercel Settings

---

**Your site is now live!** 🎉

Share your Vercel URL with users. All payments, orders, and admin features will work through serverless functions.
