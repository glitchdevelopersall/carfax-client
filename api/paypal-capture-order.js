import { capturePayPalOrder } from '../lib/paypal.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

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
}