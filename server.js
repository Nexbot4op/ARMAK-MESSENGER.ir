'use strict';

const express = require('express');
const http = require('http');
const path = require('path');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: false },
  maxHttpBufferSize: 1e6
});

const PORT = Number(process.env.PORT || 3000);
const MAX_MESSAGES_PER_ROOM = 100;
const MAX_TEXT_LENGTH = 2000;
const rooms = new Map();
const users = new Map();

app.disable('x-powered-by');
app.use(express.static(path.join(__dirname, 'public'), { extensions: ['html'] }));
app.get('/health', (_req, res) => res.json({ ok: true, app: 'ARMAK MESSENGER' }));

function cleanText(value, maxLength) {
  if (typeof value !== 'string') return '';
  return value.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, '').trim().slice(0, maxLength);
}
function getRoomHistory(room) {
  if (!rooms.has(room)) rooms.set(room, []);
  return rooms.get(room);
}
function roomUsers(room) {
  return [...users.values()]
    .filter(u => u.room === room)
    .map(u => ({ id: u.id, name: u.name }));
}

io.on('connection', socket => {
  socket.emit('server:notice', {
    message: 'به ARMAK MESSENGER خوش آمدی! این نسخه آزمایشی است؛ پیام‌ها بعد از خاموش‌شدن سرور باقی نمی‌مانند.'
  });

  socket.on('user:join', (payload = {}, callback) => {
    const name = cleanText(payload.name, 24) || 'کاربر آرماک';
    const room = cleanText(payload.room, 40).replace(/[^\p{L}\p{N}_ -]/gu, '') || 'عمومی';

    const old = users.get(socket.id);
    if (old) {
      socket.leave(old.room);
      io.to(old.room).emit('room:users', roomUsers(old.room));
    }

    users.set(socket.id, { id: socket.id, name, room });
    socket.join(room);
    socket.emit('chat:history', getRoomHistory(room));
    io.to(room).emit('room:users', roomUsers(room));
    socket.to(room).emit('chat:system', { text: `${name} به گفتگو پیوست.` });

    if (typeof callback === 'function') callback({ ok: true, name, room });
  });

  socket.on('chat:send', (payload = {}, callback) => {
    const user = users.get(socket.id);
    const text = cleanText(payload.text, MAX_TEXT_LENGTH);
    if (!user) {
      if (typeof callback === 'function') callback({ ok: false, error: 'ابتدا وارد گفتگو شو.' });
      return;
    }
    if (!text) {
      if (typeof callback === 'function') callback({ ok: false, error: 'پیام خالی است.' });
      return;
    }

    const message = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      name: user.name,
      text,
      room: user.room,
      time: new Date().toISOString()
    };
    const history = getRoomHistory(user.room);
    history.push(message);
    if (history.length > MAX_MESSAGES_PER_ROOM) history.splice(0, history.length - MAX_MESSAGES_PER_ROOM);
    io.to(user.room).emit('chat:message', message);
    if (typeof callback === 'function') callback({ ok: true });
  });

  socket.on('disconnect', () => {
    const user = users.get(socket.id);
    if (user) {
      users.delete(socket.id);
      io.to(user.room).emit('room:users', roomUsers(user.room));
      socket.to(user.room).emit('chat:system', { text: `${user.name} از گفتگو خارج شد.` });
    }
  });
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`ARMAK MESSENGER running on http://localhost:${PORT}`);
});
