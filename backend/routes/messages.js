const express = require('express');
const router = express.Router();
const db = require('../database');
const { sendMessage } = require('../whatsapp');

// Button 1 — send daily rate announcement
router.post('/announcement', async (req, res) => {
  try {
    const { phone, commission } = req.body;
    if (!phone) return res.status(400).json({ error: 'Phone number required' });

    const rate = db.getLatestRate();
    if (!rate) return res.status(404).json({ error: 'No rates available yet — wait for group message' });

    const comm = parseFloat(commission) || 0.01;

    // Apply commission to all 4 rates
    const cashBuyUsdt  = (rate.cash_sell + comm).toFixed(4);   // customer buys USDT (cash)
    const usdtBuyMyr   = (rate.cash_buy  - comm).toFixed(4);   // customer sells USDT (cash)
    const accBuyUsdt   = (rate.acc_sell  + comm).toFixed(4);   // customer buys USDT (acc)
    const accSellToMyr = (rate.acc_buy   - comm).toFixed(4);   // customer sells USDT (acc)

    const msg =
`CASH
MYR BUY USDT : ${cashBuyUsdt}
USDT BUY MYR : ${usdtBuyMyr}
ACC
MYR BUY USDT : ${accBuyUsdt}
SELL BUY TO MYR : ${accSellToMyr}
▪️Only TRC20 is acceptable
（仅接受TRC20）
▪️5 USDT Transaction Fees will be charged for USDT order below 10k
（10k以下的USDT订单将收取5 USDT交易费用）
▪️Rate subject to change, kindly ask before deal
（价格可能会有变动，请在交易前询问）
▪️Check stock before deal
（交易前需检查库存）
▪️No cancellation shall be made once confirmed order. Penalty of 2% of total will be charged.
（若与本公司确认订单后取消将收取总数额的2%作为罚款）`;

    await sendMessage(phone, msg);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Button 2 — send calculated quote
router.post('/quote', async (req, res) => {
  try {
    const { phone, action, method, amount, commission } = req.body;
    // action: 'buy' | 'sell'
    // method: 'cash' | 'acc'

    if (!phone || !action || !method || !amount) {
      return res.status(400).json({ error: 'Missing fields' });
    }

    const rate = db.getLatestRate();
    if (!rate) return res.status(404).json({ error: 'No rates available yet' });

    const comm = parseFloat(commission) || 0.01;
    const amt  = parseFloat(amount);

    let baseRate, finalRate, txType, actionLabel;

    if (action === 'buy' && method === 'cash') {
      baseRate = rate.cash_sell;
      finalRate = baseRate + comm;
      txType = 'BUY_CASH';
      actionLabel = 'Buy USDT (Cash / 现金买入)';
    } else if (action === 'sell' && method === 'cash') {
      baseRate = rate.cash_buy;
      finalRate = baseRate - comm;
      txType = 'SELL_CASH';
      actionLabel = 'Sell USDT (Cash / 现金卖出)';
    } else if (action === 'buy' && method === 'acc') {
      baseRate = rate.acc_sell;
      finalRate = baseRate + comm;
      txType = 'BUY_ACC';
      actionLabel = 'Buy USDT (Bank In / 转账买入)';
    } else {
      baseRate = rate.acc_buy;
      finalRate = baseRate - comm;
      txType = 'SELL_ACC';
      actionLabel = 'Sell USDT (Bank In / 转账卖出)';
    }

    const totalMyr = amt * finalRate;
    const commissionEarned = amt * comm;

    const msg =
`USDT/MYR Quote
Type: ${actionLabel}
Amount: ${amt.toLocaleString()} USDT
Rate: ${finalRate.toFixed(4)} MYR/USDT
Total: MYR ${totalMyr.toFixed(2)}

Rate valid for current session only.
（汇率仅在当前会话有效）`;

    await sendMessage(phone, msg);

    db.insertTransaction({
      type: txType, amount: amt, baseRate, commission: comm,
      finalRate, totalMyr, phone, commissionEarned
    });

    res.json({ success: true, finalRate, totalMyr, commissionEarned });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
