import { Router } from 'express';
import { pool } from '../db.js';

const router = Router();

// Simple lookup by code (e.g., to validate a voucher)
router.get('/:code', async (req, res) => {
  const { code } = req.params;
  try {
    const { rows } = await pool.query('SELECT * FROM vouchers WHERE code = $1', [code]);
    if (!rows.length) return res.status(404).json({ error: 'Not found' });
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;
