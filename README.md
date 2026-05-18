# USDT/MYR Exchange Rate App

A local Windows desktop app for USDT/MYR currency exchange dealers.  
Automatically reads daily rates from a WhatsApp group, calculates quotes with commission, and sends results to customers via WhatsApp.

## Features

- **Live rates** — auto-parsed from "NEUBITZ - RATE UPDATE" WhatsApp group
- **Bilingual UI** — English / 中文 toggle
- **3-button workflow:**
  1. Send daily rate announcement to customer
  2. Send calculated quote (rate ± commission × amount)
  3. Generate commission report by date range
- **System tray launcher** — runs silently in background

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React + Vite + react-i18next |
| Backend | Node.js + Express + Socket.io |
| WhatsApp | whatsapp-web.js |
| Database | sql.js (SQLite) |

## Setup

### Requirements
- Windows 10/11
- [Node.js LTS](https://nodejs.org) (v18+)

### Install

```bash
# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### Run

**Option A — Double-click `start.bat`**  
Starts both servers and opens the browser automatically.

**Option B — Separate terminals**
```bash
# Terminal 1 — Backend
cd backend
node server.js

# Terminal 2 — Frontend
cd frontend
npm run dev
```

Then open **http://localhost:3000** in your browser.

### First-time WhatsApp setup

1. Open http://localhost:3000
2. Scan the QR code with WhatsApp on your phone
3. The app remembers your session — no re-scan needed on future launches

## Project Structure

```
usdt-exchange-app/
├── backend/
│   ├── server.js          ← Express API + Socket.io
│   ├── whatsapp.js        ← WhatsApp client (whatsapp-web.js)
│   ├── rateParser.js      ← Parse CASH/ACC rates from group messages
│   ├── database.js        ← SQLite via sql.js
│   └── routes/
│       ├── rates.js       ← GET /api/rates
│       ├── messages.js    ← POST /api/send/announcement & /quote
│       └── reports.js     ← GET /api/reports
├── frontend/
│   └── src/
│       ├── App.jsx
│       ├── i18n/          ← en.json, zh.json
│       └── components/
│           ├── LanguageToggle.jsx
│           ├── RateDisplay.jsx
│           ├── ExchangeForm.jsx
│           └── ReportModal.jsx
├── start.bat              ← One-click launcher
└── .env.example           ← Environment variable template
```

## Environment Variables

Copy `.env.example` to `.env` and configure:

```env
PORT=3001
WHATSAPP_GROUP_NAME=NEUBITZ - RATE UPDATE
```

## Exchange Rate Formula

| Customer Action | Base Rate | Final Rate |
|---|---|---|
| Buy USDT (Cash) | CASH WE SELL | base + commission |
| Sell USDT (Cash) | CASH WE BUY | base − commission |
| Buy USDT (Bank In) | ACC WE SELL | base + commission |
| Sell USDT (Bank In) | ACC WE BUY | base − commission |

Default commission: **0.01 MYR per USDT** (adjustable in UI)

## License

Private — for internal business use only.
