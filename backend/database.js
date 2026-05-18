const initSqlJs = require('sql.js');
const fs = require('fs');
const path = require('path');

const DB_PATH = path.join(__dirname, 'exchange.db');
let db;

async function initDatabase() {
  const SQL = await initSqlJs();
  if (fs.existsSync(DB_PATH)) {
    const fileBuffer = fs.readFileSync(DB_PATH);
    db = new SQL.Database(fileBuffer);
  } else {
    db = new SQL.Database();
  }

  db.run(`CREATE TABLE IF NOT EXISTS rates (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    timestamp TEXT NOT NULL,
    cash_buy REAL NOT NULL,
    cash_sell REAL NOT NULL,
    acc_buy REAL NOT NULL,
    acc_sell REAL NOT NULL
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS transactions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    timestamp TEXT NOT NULL,
    transaction_type TEXT NOT NULL,
    amount_usdt REAL NOT NULL,
    base_rate REAL NOT NULL,
    commission REAL NOT NULL,
    final_rate REAL NOT NULL,
    total_myr REAL NOT NULL,
    customer_phone TEXT,
    commission_earned REAL NOT NULL
  )`);

  save();
}

function save() {
  const data = db.export();
  fs.writeFileSync(DB_PATH, Buffer.from(data));
}

function insertRate(rates) {
  db.run(
    `INSERT INTO rates (timestamp, cash_buy, cash_sell, acc_buy, acc_sell) VALUES (?, ?, ?, ?, ?)`,
    [new Date().toISOString(), rates.cashBuy, rates.cashSell, rates.accBuy, rates.accSell]
  );
  save();
}

function getLatestRate() {
  const result = db.exec(`SELECT id, timestamp, cash_buy, cash_sell, acc_buy, acc_sell FROM rates ORDER BY id DESC LIMIT 1`);
  if (!result.length || !result[0].values.length) return null;
  const [id, timestamp, cash_buy, cash_sell, acc_buy, acc_sell] = result[0].values[0];
  return { id, timestamp, cash_buy, cash_sell, acc_buy, acc_sell };
}

function insertTransaction(tx) {
  db.run(
    `INSERT INTO transactions (timestamp, transaction_type, amount_usdt, base_rate, commission, final_rate, total_myr, customer_phone, commission_earned)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [new Date().toISOString(), tx.type, tx.amount, tx.baseRate, tx.commission, tx.finalRate, tx.totalMyr, tx.phone || '', tx.commissionEarned]
  );
  save();
}

function getTransactions(fromDate, toDate) {
  const result = db.exec(
    `SELECT id, timestamp, transaction_type, amount_usdt, base_rate, commission, final_rate, total_myr, customer_phone, commission_earned
     FROM transactions WHERE timestamp >= ? AND timestamp <= ? ORDER BY timestamp DESC`,
    [fromDate + 'T00:00:00.000Z', toDate + 'T23:59:59.999Z']
  );
  if (!result.length) return [];
  return result[0].values.map(([id, timestamp, transaction_type, amount_usdt, base_rate, commission, final_rate, total_myr, customer_phone, commission_earned]) => ({
    id, timestamp, transaction_type, amount_usdt, base_rate, commission, final_rate, total_myr, customer_phone, commission_earned
  }));
}

module.exports = { initDatabase, insertRate, getLatestRate, insertTransaction, getTransactions };
