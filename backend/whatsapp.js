const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode');
const { parseRates } = require('./rateParser');
const db = require('./database');

let client;
let io;
let isReady = false;
let targetGroupId = null;

const GROUP_NAME = process.env.WHATSAPP_GROUP_NAME || 'NEUBITZ - RATE UPDATE';

function initWhatsApp(socketIo) {
  io = socketIo;

  client = new Client({
    authStrategy: new LocalAuth({ dataPath: './whatsapp-session' }),
    puppeteer: {
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
    }
  });

  client.on('qr', async (qr) => {
    const qrDataUrl = await qrcode.toDataURL(qr);
    io.emit('qr', qrDataUrl);
    io.emit('status', 'qr');
    console.log('QR code generated — scan with WhatsApp');
  });

  client.on('ready', async () => {
    isReady = true;
    io.emit('status', 'ready');
    console.log('WhatsApp connected');

    // Find the NEUBITZ group chat ID
    const chats = await client.getChats();
    const group = chats.find(c => c.name && c.name.toLowerCase().includes(GROUP_NAME.toLowerCase()));
    if (group) {
      targetGroupId = group.id._serialized;
      console.log(`Monitoring group: ${group.name} (${targetGroupId})`);
    } else {
      console.warn(`Group "${GROUP_NAME}" not found — will monitor all messages`);
    }
  });

  client.on('authenticated', () => {
    io.emit('status', 'authenticated');
    console.log('WhatsApp authenticated');
  });

  client.on('auth_failure', () => {
    isReady = false;
    io.emit('status', 'auth_failure');
    console.error('WhatsApp auth failed');
  });

  client.on('disconnected', () => {
    isReady = false;
    io.emit('status', 'disconnected');
    console.warn('WhatsApp disconnected');
  });

  client.on('message', (msg) => {
    const fromGroup = targetGroupId
      ? msg.from === targetGroupId
      : msg.from.endsWith('@g.us') && msg.body.toUpperCase().includes('CASH');

    if (!fromGroup) return;

    const rates = parseRates(msg.body);
    if (rates) {
      db.insertRate(rates);
      io.emit('rates_updated', rates);
      console.log('Rates updated:', rates);
    }
  });

  client.initialize();
}

function formatPhone(phone) {
  let digits = phone.replace(/\D/g, '');
  // Malaysian local format: 01X → 601X
  if (digits.startsWith('0')) digits = '60' + digits.slice(1);
  // If no country code yet, assume Malaysia
  if (!digits.startsWith('60') && digits.length <= 10) digits = '60' + digits;
  return digits + '@c.us';
}

async function sendMessage(phone, text) {
  if (!isReady) throw new Error('WhatsApp not connected');
  const chatId = formatPhone(phone);
  console.log('Sending to chatId:', chatId);
  try {
    await client.sendMessage(chatId, text);
  } catch (err) {
    console.error('sendMessage error:', err);
    throw new Error(err.message || JSON.stringify(err));
  }
}

function getStatus() {
  return isReady ? 'ready' : 'disconnected';
}

module.exports = { initWhatsApp, sendMessage, getStatus };
