# USDT/MYR Exchange App — Project Context

## What this project is
A local Windows web app for a USDT/MYR currency exchange dealer (Kuching).
Reads daily rates from a WhatsApp group, calculates quotes with commission, sends results to customers via WhatsApp.

## GitHub Repo
https://github.com/saint9188-cmd/usdt-myr-exchange

## How to run
- Double-click `USDT-Exchange.exe` (desktop shortcut) OR run `start.bat`
- Backend: `cd backend && node server.js` → http://localhost:3001
- Frontend: `cd frontend && npm run dev` → http://localhost:3000

## Access URLs
- PC: http://localhost:3000
- Same WiFi phone: http://192.168.0.215:3000
- Any network (Tailscale): http://100.65.34.3:3000

## Tech Stack
- Frontend: React 18 + Vite 5 + react-i18next (EN/ZH bilingual)
- Backend: Node.js + Express + Socket.io
- WhatsApp: whatsapp-web.js (personal WhatsApp, QR scan once)
- Database: sql.js (SQLite, no native compilation — avoids node-gyp issues on Windows)
- Launcher: C# compiled exe via PowerShell Add-Type (system tray, no console window)

## Key Files
- `backend/server.js` — Express + Socket.io server (port 3001)
- `backend/whatsapp.js` — WhatsApp client, group listener, sendMessage()
- `backend/rateParser.js` — Regex parser for CASH/ACC WE BUY/SELL rates
- `backend/database.js` — sql.js SQLite: rates + transactions tables
- `backend/routes/messages.js` — Button 1 (announcement) + Button 2 (quote) logic
- `backend/routes/reports.js` — Date-range commission report
- `frontend/src/config.js` — Dynamic API URL (uses window.location.hostname)
- `frontend/src/App.jsx` — Main app, Socket.io connection, rate polling
- `frontend/src/components/ExchangeForm.jsx` — All 3 buttons + live calculation
- `frontend/src/components/ReportModal.jsx` — Report with date picker + grand total

## WhatsApp Group
Name: "NEUBITZ - RATE UPDATE"
Message format parsed:
  CASH (KCH)
  WE BUY/买: 3.943
  WE SELL/卖: 3.985
  ACC
  WE BUY/买: 3.958
  WE SELL/卖: 3.988

## Rate Variables
- cash_buy  = CASH WE BUY  (dealer buys USDT from customer)
- cash_sell = CASH WE SELL (dealer sells USDT to customer)
- acc_buy   = ACC WE BUY
- acc_sell  = ACC WE SELL

## Commission Formula (additive)
- Customer BUY USDT  → final_rate = base_sell + commission
- Customer SELL USDT → final_rate = base_buy  - commission
- Total MYR = amount_usdt × final_rate
- Default commission: 0.01 MYR per USDT

## Database Schema
rates: id, timestamp, cash_buy, cash_sell, acc_buy, acc_sell
transactions: id, timestamp, transaction_type, amount_usdt, base_rate, commission, final_rate, total_myr, customer_phone, commission_earned

## Environment Setup
- Node.js v24.15.0 at C:\Program Files\nodejs\
- npm v11.12.1
- better-sqlite3 NOT used (needs node-gyp) — use sql.js instead
- WhatsApp session saved at backend/whatsapp-session/ (gitignored)
- .env: PORT=3001, WHATSAPP_GROUP_NAME=NEUBITZ - RATE UPDATE

## Tailscale Setup
- PC Tailscale IP: 100.65.34.3 (device: desktop-lvm61d0)
- Phone connected via Tailscale (same GitHub account: saint9188-cmd)
- Firewall rules added for ports 3000 + 3001

## GitHub Auth
- Username: saint9188-cmd
- gh CLI authenticated via PAT (keyring)
- Remote: origin → https://github.com/saint9188-cmd/usdt-myr-exchange
