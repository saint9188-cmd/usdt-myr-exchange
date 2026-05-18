const express = require('express');
const router = express.Router();
const db = require('../database');

router.get('/', (req, res) => {
  const { from, to } = req.query;
  if (!from || !to) return res.status(400).json({ error: 'from and to dates required (YYYY-MM-DD)' });

  const transactions = db.getTransactions(from, to);
  const totalCommission = transactions.reduce((sum, t) => sum + t.commission_earned, 0);

  res.json({ transactions, totalCommission });
});

module.exports = router;
