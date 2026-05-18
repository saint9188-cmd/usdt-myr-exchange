require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const { initDatabase } = require('./database');
const { initWhatsApp } = require('./whatsapp');

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: '*' } });

app.use(cors());
app.use(express.json());

app.use('/api/rates',    require('./routes/rates'));
app.use('/api/send',     require('./routes/messages'));
app.use('/api/reports',  require('./routes/reports'));

app.get('/api/health', (req, res) => res.json({ ok: true }));

const PORT = process.env.PORT || 3001;

async function start() {
  await initDatabase();
  initWhatsApp(io);
  server.listen(PORT, () => {
    console.log(`Backend running on http://localhost:${PORT}`);
    console.log('Waiting for WhatsApp QR scan...');
  });
}

start().catch(console.error);
