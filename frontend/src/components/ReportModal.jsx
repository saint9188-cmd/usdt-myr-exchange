import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import axios from 'axios';

const API = 'http://localhost:3001';

export default function ReportModal({ onClose }) {
  const { t } = useTranslation();
  const today = new Date().toISOString().slice(0, 10);
  const [from, setFrom] = useState(today);
  const [to, setTo]   = useState(today);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);

  async function generate() {
    setLoading(true);
    try {
      const res = await axios.get(`${API}/api/reports?from=${from}&to=${to}`);
      setData(res.data);
    } catch {
      alert('Failed to load report');
    }
    setLoading(false);
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <h2>{t('reportTitle')}</h2>

        <div className="report-dates">
          <label>{t('fromDate')}
            <input type="date" value={from} onChange={e => setFrom(e.target.value)} />
          </label>
          <label>{t('toDate')}
            <input type="date" value={to} onChange={e => setTo(e.target.value)} />
          </label>
          <button onClick={generate} disabled={loading}>{t('generate')}</button>
        </div>

        {data && (
          <>
            {data.transactions.length === 0 ? (
              <p className="no-data">{t('noData')}</p>
            ) : (
              <div className="report-table-wrap">
                <table className="report-table">
                  <thead>
                    <tr>
                      <th>{t('date')}</th>
                      <th>{t('type')}</th>
                      <th>{t('amountUsdt')}</th>
                      <th>{t('baseRate')}</th>
                      <th>{t('commissionCol')}</th>
                      <th>{t('finalRate')}</th>
                      <th>{t('totalMyrCol')}</th>
                      <th>{t('commEarned')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.transactions.map(tx => (
                      <tr key={tx.id}>
                        <td>{new Date(tx.timestamp).toLocaleString()}</td>
                        <td>{t(tx.transaction_type)}</td>
                        <td>{tx.amount_usdt.toLocaleString()}</td>
                        <td>{tx.base_rate}</td>
                        <td>{tx.commission}</td>
                        <td>{tx.final_rate.toFixed(4)}</td>
                        <td>{tx.total_myr.toFixed(2)}</td>
                        <td>{tx.commission_earned.toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr>
                      <td colSpan="7"><strong>{t('grandTotal')}</strong></td>
                      <td><strong>MYR {data.totalCommission.toFixed(2)}</strong></td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            )}
          </>
        )}

        <button className="close-btn" onClick={onClose}>{t('close')}</button>
      </div>
    </div>
  );
}
