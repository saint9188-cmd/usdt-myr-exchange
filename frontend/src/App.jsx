import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { io } from 'socket.io-client';
import axios from 'axios';
import './i18n/index.js';
import LanguageToggle from './components/LanguageToggle';
import RateDisplay from './components/RateDisplay';
import ExchangeForm from './components/ExchangeForm';
import './App.css';

const API = 'http://localhost:3001';
const socket = io(API);

export default function App() {
  const { t } = useTranslation();
  const [rate, setRate]       = useState(null);
  const [qr, setQr]           = useState(null);
  const [waStatus, setWaStatus] = useState('disconnected');

  useEffect(() => {
    // Load initial rates
    axios.get(`${API}/api/rates`).then(res => {
      setRate(res.data.rate);
      setWaStatus(res.data.waStatus);
    }).catch(() => {});

    socket.on('qr', (qrDataUrl) => setQr(qrDataUrl));
    socket.on('status', (s) => {
      setWaStatus(s);
      if (s === 'ready') setQr(null);
    });
    socket.on('rates_updated', (newRates) => {
      // Refresh full rate object from server
      axios.get(`${API}/api/rates`).then(res => setRate(res.data.rate)).catch(() => {});
    });

    // Poll rates every 60s as fallback
    const interval = setInterval(() => {
      axios.get(`${API}/api/rates`).then(res => {
        setRate(res.data.rate);
        setWaStatus(res.data.waStatus);
      }).catch(() => {});
    }, 60000);

    return () => {
      clearInterval(interval);
      socket.off('qr');
      socket.off('status');
      socket.off('rates_updated');
    };
  }, []);

  const isConnected = waStatus === 'ready';

  return (
    <div className="app">
      <header className="app-header">
        <h1>{t('title')}</h1>
        <div className="header-right">
          <span className={`wa-badge ${isConnected ? 'connected' : 'disconnected'}`}>
            {t('waStatus')}: {isConnected ? t('connected') : t('disconnected')}
          </span>
          <LanguageToggle />
        </div>
      </header>

      {qr && (
        <div className="qr-section">
          <p>{t('scanQr')}</p>
          <img src={qr} alt="WhatsApp QR" className="qr-img" />
        </div>
      )}

      <section className="rates-section">
        <h2>{t('currentRates')}</h2>
        <RateDisplay rate={rate} />
      </section>

      <ExchangeForm rate={rate} />
    </div>
  );
}
