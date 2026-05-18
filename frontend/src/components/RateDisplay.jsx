import { useTranslation } from 'react-i18next';

export default function RateDisplay({ rate }) {
  const { t } = useTranslation();

  if (!rate) return <p className="no-rates">{t('noRates')}</p>;

  const ts = new Date(rate.timestamp).toLocaleString();

  return (
    <div className="rate-display">
      <div className="rate-group">
        <span className="rate-label">{t('cashBuy')}</span>
        <span className="rate-value">{rate.cash_buy}</span>
        <span className="rate-label">{t('cashSell')}</span>
        <span className="rate-value">{rate.cash_sell}</span>
      </div>
      <div className="rate-group">
        <span className="rate-label">{t('accBuy')}</span>
        <span className="rate-value">{rate.acc_buy}</span>
        <span className="rate-label">{t('accSell')}</span>
        <span className="rate-value">{rate.acc_sell}</span>
      </div>
      <p className="rate-updated">{t('updatedAt')}: {ts}</p>
    </div>
  );
}
