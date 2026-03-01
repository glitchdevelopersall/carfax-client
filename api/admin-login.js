import supabase from '../lib/supabase.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

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
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password required' });
    }

    const { data: admin, error } = await supabase
      .from('admins')
      .select('*')
      .eq('username', username)
      .single();

    if (error || !admin) {
      return res.status(401).json({ success: false, message: 'Invalid username or password' });
    }

    // Check if password is hashed or plain text
    let valid = false;
    const isHash = typeof admin.password === 'string' && admin.password.startsWith('$2');
    if (isHash) {
      valid = await bcrypt.compare(password, admin.password);
    } else {
      // plain-text in DB; compare directly and upgrade
      valid = password === admin.password;
      if (valid) {
        const newHash = await bcrypt.hash(password, 10);
        await supabase
          .from('admins')
          .update({ password: newHash })
          .eq('id', admin.id);
      }
    }

    if (!valid) {
      return res.status(401).json({ success: false, message: 'Invalid username or password' });
    }

    if (!process.env.JWT_SECRET) {
      throw new Error('JWT_SECRET not configured');
    }

    const token = jwt.sign({ id: admin.id }, process.env.JWT_SECRET, { expiresIn: '1h' });

    res.json({ success: true, token });
  } catch (error) {
    console.error('Admin Login Error:', error.message);
    res.status(500).json({ error: 'Login failed', details: error.message });
  }
}