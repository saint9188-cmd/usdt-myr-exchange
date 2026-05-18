import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import ReportModal from './ReportModal';

const API = 'http://localhost:3001';

export default function ExchangeForm({ rate }) {
  const { t } = useTranslation();

  const [action, setAction]       = useState('buy');   // buy | sell
  const [method, setMethod]       = useState('cash');  // cash | acc
  const [phone, setPhone]         = useState('');
  const [commission, setComm]     = useState('0.01');
  const [amount, setAmount]       = useState('');
  const [status1, setStatus1]     = useState('');
  const [status2, setStatus2]     = useState('');
  const [showReport, setReport]   = useState(false);

  // Live calculation preview
  const comm = parseFloat(commission) || 0;
  const amt  = parseFloat(amount) || 0;
  let baseRate = 0;
  if (rate) {
    if (action === 'buy'  && method === 'cash') baseRate = rate.cash_sell;
    if (action === 'sell' && method === 'cash') baseRate = rate.cash_buy;
    if (action === 'buy'  && method === 'acc')  baseRate = rate.acc_sell;
    if (action === 'sell' && method === 'acc')  baseRate = rate.acc_buy;
  }
  const finalRate = action === 'buy' ? baseRate + comm : baseRate - comm;
  const totalMyr  = amt * finalRate;

  async function handleAnnouncement() {
    if (!phone) return alert('Enter customer phone number');
    setStatus1('sending');
    try {
      await axios.post(`${API}/api/send/announcement`, { phone });
      setStatus1('sent');
    } catch (e) {
      setStatus1('error:' + (e.response?.data?.error || e.message));
    }
    setTimeout(() => setStatus1(''), 3000);
  }

  async function handleQuote() {
    if (!phone)   return alert('Enter customer phone number');
    if (!amount)  return alert('Enter amount');
    setStatus2('sending');
    try {
      await axios.post(`${API}/api/send/quote`, { phone, action, method, amount, commission });
      setStatus2('sent');
    } catch (e) {
      setStatus2('error:' + (e.response?.data?.error || e.message));
    }
    setTimeout(() => setStatus2(''), 3000);
  }

  const btnLabel = (s) => {
    if (s === 'sending') return t('sending');
    if (s === 'sent')    return t('sent');
    if (s.startsWith('error:')) return t('sendError') + ': ' + s.slice(6);
    return null;
  };

  return (
    <div className="form-card">
      {/* Toggle row */}
      <div className="toggle-row">
        <div className="toggle-group">
          <button className={action === 'buy'  ? 'active' : ''} onClick={() => setAction('buy')}>
            {t('buyUsdt')}
          </button>
          <button className={action === 'sell' ? 'active' : ''} onClick={() => setAction('sell')}>
            {t('sellUsdt')}
          </button>
        </div>
        <div className="toggle-group">
          <button className={method === 'cash' ? 'active' : ''} onClick={() => setMethod('cash')}>
            {t('cash')}
          </button>
          <button className={method === 'acc'  ? 'active' : ''} onClick={() => setMethod('acc')}>
            {t('bankIn')}
          </button>
        </div>
      </div>

      {/* Inputs */}
      <label className="field-label">{t('customerPhone')}
        <input type="tel" value={phone} onChange={e => setPhone(e.target.value)} placeholder="601XXXXXXXX" />
      </label>

      <div className="field-row">
        <label className="field-label">{t('commission')}
          <input type="number" step="0.001" value={commission} onChange={e => setComm(e.target.value)} />
        </label>
        <label className="field-label">{t('amount')}
          <input type="number" step="1" value={amount} onChange={e => setAmount(e.target.value)} placeholder="1000" />
        </label>
      </div>

      {/* Live preview */}
      {rate && amt > 0 && (
        <div className="calc-preview">
          <span>{t('calculatedRate')}: {baseRate} {action === 'buy' ? '+' : '-'} {comm} = <strong>{finalRate.toFixed(4)}</strong></span>
          <span>{t('totalMyr')}: <strong>MYR {totalMyr.toLocaleString('en-MY', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong></span>
        </div>
      )}

      {/* Buttons */}
      <button className="action-btn btn-1" onClick={handleAnnouncement} disabled={status1 === 'sending'}>
        {btnLabel(status1) || t('btn1')}
      </button>

      <button className="action-btn btn-2" onClick={handleQuote} disabled={status2 === 'sending'}>
        {btnLabel(status2) || t('btn2')}
      </button>

      <button className="action-btn btn-3" onClick={() => setReport(true)}>
        {t('btn3')}
      </button>

      {showReport && <ReportModal onClose={() => setReport(false)} />}
    </div>
  );
}
