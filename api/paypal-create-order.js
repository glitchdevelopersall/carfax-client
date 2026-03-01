import { createPayPalOrder } from '../lib/paypal.js';

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
    const { amount } = req.body;

    if (!amount) {
      return res.status(400).json({ error: 'Amount is required' });
    }

    const order = await createPayPalOrder(amount);
    res.json(order);
  } catch (error) {
    console.error('PayPal Create Order Error:', error.message);
    res.status(500).json({ error: 'Failed to create PayPal order', details: error.message });
  }
}