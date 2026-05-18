const express = require('express');
const router = express.Router();
const db = require('../database');
const { getStatus } = require('../whatsapp');

router.get('/', (req, res) => {
  const rate = db.getLatestRate();
  res.json({ rate, waStatus: getStatus() });
});

module.exports = router;
