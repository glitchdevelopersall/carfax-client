# Server Setup Instructions

## Overview
The 500 error was occurring because the API endpoints weren't being served by any backend server. I've created a Node.js Express server to handle all your API routes.

## Files Created/Modified

1. **server.js** - Main Express server that handles all API endpoints
2. **.env** - Environment variables (copy to .env.example if needed)
3. **lib/paypal.js** - Updated with `capturePayPalOrder` function
4. **lib/supabase.js** - Added `createOrder` function
5. **lib/admin.js** - New file with `adminLogin` function
6. **package.json** - Updated with new dependencies and scripts

## Setup Instructions

### 1. Install Dependencies
```bash
npm install
```

This installs:
- `express` - Web framework
- `cors` - Cross-Origin Resource Sharing
- `dotenv` - Environment variables management
- `concurrently` - Run multiple commands simultaneously

### 2. Configure Environment Variables
Edit the `.env` file and add your PayPal and Supabase credentials:

```
# PayPal Configuration
PAYPAL_CLIENT_ID=your_paypal_client_id_here
PAYPAL_CLIENT_SECRET=your_paypal_client_secret_here
PAYPAL_MODE=live  # not used by code but kept for clarity

# Supabase Configuration
SUPABASE_URL=your_supabase_url_here
SUPABASE_KEY=your_supabase_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here

# Server Configuration
PORT=5000
NODE_ENV=development

# JWT Secret (for admin login)
JWT_SECRET=your_jwt_secret_here
```

### 3. Run the Development Environment

**Option A: Run both server and Vite dev server together**
```bash
npm run dev:all
```

**Option B: Run server only (on port 5000)**
```bash
npm run server
```

**Option C: Run Vite dev server only (on port 5173)**
```bash
npm run dev
```

## How It Works

1. **Vite Dev Server** (port 5173) - Serves your React frontend
2. **Express Server** (port 5000) - Serves API endpoints
3. **Proxy** - Vite automatically proxies `/api/*` requests to `http://localhost:5000`

When you make a request to `/api/paypal-create-order` from React:
```
React Client (5173) → Vite Proxy → Express Server (5000)
```

## API Endpoints

- `POST /api/paypal-create-order` - Create a PayPal order
- `POST /api/paypal-capture-order` - Capture a PayPal payment
- `POST /api/create-order` - Create an order in Supabase
- `POST /api/admin-login` - Admin login
- `GET /api/health` - Health check

## Troubleshooting

**Error: Cannot find module 'express'**
- Run `npm install` to install all dependencies

**Error: Missing environment variables**
- Ensure all variables in `.env` are configured with actual values
- Restart the server after updating `.env`

**Error: PayPal authentication failed**
- Verify PAYPAL_CLIENT_ID and PAYPAL_CLIENT_SECRET are correct
- The code now always uses the live PayPal API; the PAYPAL_MODE variable is ignored.

**CORS errors**
- The server has CORS enabled for all origins in development
- Modify the `cors()` middleware if you need more restrictive settings
