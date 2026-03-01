import supabase from '../lib/supabase.js';
import jwt from 'jsonwebtoken';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
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

    jwt.verify(token, process.env.JWT_SECRET);

    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(error.message);
    }

    res.json({ success: true, data });
  } catch (error) {
    if (error.message && error.message.includes('jwt')) {
      return res.status(401).json({ error: 'Invalid or expired token' });
    }
    console.error('Get Orders Error:', error.message);
    res.status(500).json({ error: 'Unable to fetch orders', details: error.message });
  }
}