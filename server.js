import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import nodemailer from 'nodemailer';

const app = express();
const port = process.env.PORT || 8787;
const submissions = new Map();

app.use(cors({ origin: process.env.FRONTEND_ORIGIN || true }));
app.use(express.json({ limit: '10kb' }));

const clean = (value, max = 160) => String(value ?? '').replace(/[<>]/g, '').trim().slice(0, max);
const valid = (payload) => ['date', 'time', 'location', 'dateType'].every((key) => clean(payload[key]));

app.post('/api/date-confirmation', async (req, res) => {
  const ip = req.ip || 'unknown';
  const lastSubmission = submissions.get(ip) || 0;
  if (Date.now() - lastSubmission < 30_000) return res.status(429).json({ ok: false, message: 'Please wait a moment.' });
  if (!valid(req.body)) return res.status(400).json({ ok: false, message: 'A few date details are missing.' });
  submissions.set(ip, Date.now());

  const details = {
    date: clean(req.body.date),
    time: clean(req.body.time),
    location: clean(req.body.location),
    dateType: clean(req.body.dateType),
    timestamp: new Date().toISOString()
  };
  const message = `❤️ NEW DATE CONFIRMATION ❤️\n\nSomeone said YES! 🥳\n\nDate: ${details.date}\nTime: ${details.time}\nLocation: ${details.location}\nDate Type: ${details.dateType}\nConfirmed: YES ❤️\nTimestamp: ${details.timestamp}`;
  let delivered = false;

  try {
    if (process.env.WHATSAPP_ACCESS_TOKEN && process.env.WHATSAPP_PHONE_NUMBER_ID && process.env.WHATSAPP_NUMBER) {
      const response = await fetch(`https://graph.facebook.com/v21.0/${process.env.WHATSAPP_PHONE_NUMBER_ID}/messages`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${process.env.WHATSAPP_ACCESS_TOKEN}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ messaging_product: 'whatsapp', to: process.env.WHATSAPP_NUMBER, type: 'text', text: { body: message } })
      });
      delivered = response.ok;
    }

    if (process.env.SMTP_HOST && process.env.NOTIFICATION_EMAIL) {
      const transporter = nodemailer.createTransport({ host: process.env.SMTP_HOST, port: Number(process.env.SMTP_PORT || 587), secure: process.env.SMTP_SECURE === 'true', auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS } });
      await transporter.sendMail({ from: process.env.SMTP_FROM || process.env.SMTP_USER, to: process.env.NOTIFICATION_EMAIL, subject: "❤️ It's a Date! Someone Said YES! 🥳", text: message, html: `<h2>❤️ NEW DATE CONFIRMATION ❤️</h2><p>Someone said YES! 🥳</p><ul><li><b>Date:</b> ${details.date}</li><li><b>Time:</b> ${details.time}</li><li><b>Location:</b> ${details.location}</li><li><b>Date type:</b> ${details.dateType}</li><li><b>Confirmed:</b> YES ❤️</li><li><b>Timestamp:</b> ${details.timestamp}</li></ul>` });
      delivered = true;
    }
  } catch (error) {
    console.error('Notification delivery failed:', error.message);
  }

  res.json({ ok: true, delivered });
});

app.listen(port, () => console.log(`Date invitation API listening on http://localhost:${port}`));
