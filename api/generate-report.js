import supabase from '../lib/supabase.js';
import jwt from 'jsonwebtoken';
import PDFDocument from 'pdfkit';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Verify JWT
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

    const { vin } = req.body;

    if (!vin) {
      return res.status(400).json({ error: 'VIN required' });
    }

    // Fetch Order From Supabase
    const { data: order, error } = await supabase
      .from('orders')
      .select('*')
      .eq('vin', vin)
      .single();

    if (error || !order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    // Generate PDF
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
  } catch (error) {
    if (error.message && error.message.includes('jwt')) {
      return res.status(401).json({ error: 'Invalid or expired token' });
    }
    console.error('Generate Report Error:', error.message);
    res.status(500).json({ error: 'Failed to generate report', details: error.message });
  }
}