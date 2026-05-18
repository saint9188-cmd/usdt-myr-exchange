function parseRates(messageBody) {
  if (!messageBody) return null;

  // Normalise: remove emoji, fire chars, zero-width spaces
  const text = messageBody.replace(/[\u{1F300}-\u{1FFFF}]/gu, '').replace(/​/g, '');

  // Split into CASH block and ACC block
  const cashMatch = text.match(/CASH[\s\S]*?(?=ACC|$)/i);
  const accMatch  = text.match(/ACC[\s\S]*/i);

  if (!cashMatch || !accMatch) return null;

  const cashBlock = cashMatch[0];
  const accBlock  = accMatch[0];

  const extractRate = (block, keyword) => {
    const m = block.match(new RegExp(keyword + '[^:]*:\\s*([\\d.]+)', 'i'));
    return m ? parseFloat(m[1]) : null;
  };

  const cashBuy  = extractRate(cashBlock, 'WE BUY');
  const cashSell = extractRate(cashBlock, 'WE SELL');
  const accBuy   = extractRate(accBlock,  'WE BUY');
  const accSell  = extractRate(accBlock,  'WE SELL');

  if (!cashBuy || !cashSell || !accBuy || !accSell) return null;

  return { cashBuy, cashSell, accBuy, accSell };
}

module.exports = { parseRates };
