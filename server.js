import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
import { createPayPalOrder } from './lib/paypal.js';
import { capturePayPalOrder } from './lib/paypal.js';
import { createOrder } from './lib/supabase.js';
import supabase from './lib/supabase.js';
import { adminLogin } from './lib/admin.js';

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// PayPal Create Order
app.post('/api/paypal-create-order', async (req, res) => {
  try {
    const { amount } = req.body;

    if (!amount) {
      return res.status(400).json({ error: 'Amount is required' });
    }

    const order = await createPayPalOrder(amount);
    res.json(order);
  } catch (error) {
    // log full error object when available
    console.error('PayPal Create Order Error:', error.message, error);
    // if the error was thrown by axios we may have a rich response
    const details = error.message;
    res.status(500).json({ error: 'Failed to create PayPal order', details });
  }
});

// PayPal Capture Order
app.post('/api/paypal-capture-order', async (req, res) => {
  try {
    const { orderID } = req.body;

    if (!orderID) {
      return res.status(400).json({ error: 'Order ID is required' });
    }

    const result = await capturePayPalOrder(orderID);
    res.json(result);
  } catch (error) {
    console.error('PayPal Capture Order Error:', error.message);
    res.status(500).json({ error: 'Failed to capture PayPal order', details: error.message });
  }
});

// Create Order in Database
app.post('/api/create-order', async (req, res) => {
  try {
    const orderData = req.body;
    const result = await createOrder(orderData);
    res.json(result);
  } catch (error) {
    console.error('Create Order Error:', error.message);
    res.status(500).json({ error: 'Failed to create order', details: error.message });
  }
});

// helper middleware for routes that require a valid admin JWT
const requireAdmin = (req, res, next) => {
  const auth = req.headers.authorization || '';
  const match = auth.match(/^Bearer (.+)$/);
  if (!match) {
    return res.status(401).json({ error: 'Missing or malformed token' });
  }
  const token = match[1];
  if (!process.env.JWT_SECRET) {
    console.error('JWT secret unset when verifying token');
    return res.status(500).json({ error: 'Server misconfiguration' });
  }
  try {
    jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch (err) {
    console.error('Token verification failed', err.message);
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
};

// Admin Login
app.post('/api/admin-login', async (req, res) => {
  const { username, password } = req.body;
  try {
    const result = await adminLogin(username, password);
    // adminLogin throws on bad creds; if we get here it's successful
    res.json(result);
  } catch (error) {
    console.error('Admin Login Error:', error.message);
    // credential errors are expected, map them to 401/400 so frontend can react
    if (error.message && error.message.toLowerCase().includes('invalid')) {
      return res.status(401).json({ success: false, message: 'Invalid username or password' });
    }
    // anything else is an actual server error
    res.status(500).json({ error: 'Login failed', details: error.message });
  }
});

// protected endpoint for retrieving orders
app.get('/api/get-orders', requireAdmin, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(error.message);
    }
    res.json({ success: true, data });
  } catch (err) {
    console.error('Get Orders Error:', err.message);
    res.status(500).json({ error: 'Unable to fetch orders', details: err.message });
  }
});

// patch endpoint to update order fields (e.g. payment_status)
app.patch('/api/update-order/:id', requireAdmin, async (req, res) => {
  const { id } = req.params;
  const updates = req.body;

  try {
    const { data, error } = await supabase
      .from('orders')
      .update(updates)
      .eq('id', id)
      .select();

    if (error) {
      throw error;
    }
    res.json({ success: true, order: data[0] });
  } catch (err) {
    console.error('Update Order Error:', err.message);
    res.status(500).json({ error: 'Unable to update order', details: err.message });
  }
});

// protected endpoint to generate a PDF vehicle report
app.post('/api/generate-report', requireAdmin, async (req, res) => {
  const { vin } = req.body;
  if (!vin) {
    return res.status(400).json({ error: 'VIN required' });
  }

  try {
    const { data: order, error } = await supabase
      .from('orders')
      .select('*')
      .eq('vin', vin)
      .single();

    if (error || !order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    // generate PDF on the fly
    const PDFDocument = (await import('pdfkit')).default;
    const doc = new PDFDocument();

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename=Report_${vin}.pdf`
    );

    doc.pipe(res);

    doc.fontSize(20).text('Vehicle Report', { align: 'center' });
    doc.moveDown();

    doc.fontSize(12).text(`Customer Name: ${order.full_name}`);
    doc.text(`Email: ${order.email}`);
    doc.text(`VIN: ${order.vin}`);
    doc.text(`Plan: ${order.plan_name}`);
    doc.text(`Price: $${order.price}`);
    doc.text(`Payment Status: ${order.payment_status}`);
    doc.text(`Order Date: ${new Date(order.created_at).toLocaleDateString()}`);

    doc.moveDown();
    doc.text('Thank you for your purchase!');

    doc.end();
  } catch (err) {
    console.error('Generate Report Error:', err.message);
    res.status(500).json({ error: 'Failed to generate report', details: err.message });
  }
});

// Health Check
app.get('/api/health', (req, res) => {
  res.json({ status: 'Server is running' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});
