import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import nodemailer from 'nodemailer';
import pg from 'pg';

const app = express();
const port = process.env.PORT || 8787;
const submissions = new Map();
const rawDatabaseUrl = process.env.DATABASE_URL?.trim();
let pool = null;
let databaseConfigError = '';
let databaseHost = '';

if (rawDatabaseUrl) {
  try {
    const databaseUrl = new URL(rawDatabaseUrl);
    databaseHost = databaseUrl.hostname;
    const sslMode = databaseUrl.searchParams.get('sslmode');
    if (sslMode === 'require' || sslMode === 'prefer' || sslMode === 'verify-ca') databaseUrl.searchParams.set('sslmode', 'verify-full');
    if (!databaseUrl.hostname || databaseUrl.hostname === 'base') throw new Error('DATABASE_URL contains an invalid database hostname. Copy the complete Neon connection string from Connect.');
    pool = new pg.Pool({ connectionString: databaseUrl.toString(), ssl: process.env.DATABASE_SSL === 'false' ? false : { rejectUnauthorized: false } });
  } catch (error) {
    databaseConfigError = error.message;
    console.error('Database configuration failed:', databaseConfigError);
  }
}

app.use(cors({ origin: process.env.FRONTEND_ORIGIN || true }));
app.use(express.json({ limit: '10kb' }));

app.get('/health', async (_req, res) => {
  const diagnostics = { service: 'date-invitation-api', databaseHost: databaseHost || 'missing', smtpConfigured: Boolean(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS && process.env.NOTIFICATION_EMAIL) };
  if (!pool) return res.status(503).json({ ok: false, database: databaseConfigError || 'not configured', ...diagnostics });
  try {
    await databaseReady;
    await pool.query('SELECT 1');
    res.json({ ok: true, database: 'connected', ...diagnostics });
  } catch (error) {
    console.error('Health database check failed:', error.message);
    res.status(503).json({ ok: false, database: 'unavailable', ...diagnostics });
  }
});

const databaseReady = pool?.query(`CREATE TABLE IF NOT EXISTS date_responses (
  id BIGSERIAL PRIMARY KEY,
  date_value DATE NOT NULL,
  time_value VARCHAR(20) NOT NULL,
  location VARCHAR(160) NOT NULL,
  date_type VARCHAR(500) NOT NULL,
  mood VARCHAR(60),
  note VARCHAR(200),
  guest_email VARCHAR(200) NOT NULL,
  guest_phone VARCHAR(30) NOT NULL,
  consent BOOLEAN NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
)`).catch((error) => console.error('Database initialization failed:', error.message));

const clean = (value, max = 160) => String(value ?? '').replace(/[<>]/g, '').trim().slice(0, max);
const email = (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(clean(value, 200));
const phone = (value) => /^[+\d][\d\s().-]{6,24}$/.test(clean(value, 30));
const valid = (payload) => ['date', 'time', 'location', 'dateType'].every((key) => clean(payload[key])) && email(payload.herEmail) && phone(payload.herPhone) && payload.consent === true;

app.post('/api/date-confirmation', async (req, res) => {
  const ip = req.ip || 'unknown';
  const lastSubmission = submissions.get(ip) || 0;
  if (Date.now() - lastSubmission < 30_000) return res.status(429).json({ ok: false, message: 'Please wait a moment.' });
  if (!valid(req.body)) return res.status(400).json({ ok: false, message: 'A few date details are missing.' });
  const details = {
    date: clean(req.body.date),
    time: clean(req.body.time),
    location: clean(req.body.location),
    dateType: clean(req.body.dateType),
    mood: clean(req.body.mood, 60),
    note: clean(req.body.message, 200),
    herEmail: clean(req.body.herEmail, 200),
    herPhone: clean(req.body.herPhone, 30),
    timestamp: new Date().toISOString()
  };
  if (!pool) return res.status(503).json({ ok: false, message: 'Response storage is not configured yet.' });
  try {
    await databaseReady;
    await pool.query('INSERT INTO date_responses (date_value, time_value, location, date_type, mood, note, guest_email, guest_phone, consent) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)', [details.date, details.time, details.location, details.dateType, details.mood || null, details.note || null, details.herEmail, details.herPhone, req.body.consent]);
  } catch (error) {
    console.error('Response storage failed:', error.message);
    return res.status(503).json({ ok: false, message: 'Response storage is temporarily unavailable. Check the Render DATABASE_URL and service logs.' });
  }
  submissions.set(ip, Date.now());
  const message = `❤️ DATE CONFIRMED ❤️\n\nSHE SAID YES! 🥳\n\nDate: ${details.date}\nTime: ${details.time}\nLocation: ${details.location}\nDate Type: ${details.dateType}\nMood: ${details.mood || 'Not specified'}\nMessage: ${details.note || 'No message'}\nStatus: CONFIRMED ❤️\nTimestamp: ${details.timestamp}`;
  res.json({ ok: true, stored: true });
  let delivered = false;

  try {
    if (process.env.ENABLE_WHATSAPP === 'true' && process.env.WHATSAPP_ACCESS_TOKEN && process.env.WHATSAPP_PHONE_NUMBER_ID && process.env.WHATSAPP_NUMBER) {
      const recipients = [...new Set([process.env.WHATSAPP_NUMBER, details.herPhone.replace(/[^+\d]/g, '')])];
      const responses = await Promise.all(recipients.map((recipient) => fetch(`https://graph.facebook.com/v21.0/${process.env.WHATSAPP_PHONE_NUMBER_ID}/messages`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${process.env.WHATSAPP_ACCESS_TOKEN}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ messaging_product: 'whatsapp', to: recipient, type: 'text', text: { body: message } })
      })));
      delivered = responses.every((response) => response.ok);
    }

    const emailRecipients = [...new Set([process.env.NOTIFICATION_EMAIL, details.herEmail].filter(Boolean))];
    const cardRows = [['DATE', details.date], ['TIME', details.time], ['LOCATION', details.location], ['VIBE', details.dateType], ['MOOD', details.mood || 'Not specified'], ['NOTE', details.note || 'No message']].map(([label, value]) => `<tr><td style="padding:12px;border-bottom:1px solid #e4d8d2;color:#a85d55;font:11px monospace;letter-spacing:1px">${label}</td><td style="padding:12px;border-bottom:1px solid #e4d8d2;color:#342a2d;font:16px Georgia,serif">${value}</td></tr>`).join('');
    const html = `<div style="max-width:560px;padding:28px;background:#fff8f2;color:#342a2d;font-family:Arial,sans-serif"><p style="color:#a85d55;letter-spacing:2px;font-size:11px">❤️ DATE CONFIRMED ❤️</p><h1 style="font:normal 32px Georgia,serif">It’s officially a date.</h1><p>Congratulations! Your date has officially been confirmed. 😌❤️</p><table style="width:100%;border-collapse:collapse;margin-top:24px;background:#fff">${cardRows}</table><p style="font-size:12px;color:#7b6c70;margin-top:22px">CONFIRMED ❤️ · ${details.timestamp}</p></div>`;
    if (process.env.RESEND_API_KEY && process.env.RESEND_FROM && emailRecipients.length) {
      const response = await fetch('https://api.resend.com/emails', { method: 'POST', headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ from: process.env.RESEND_FROM, to: emailRecipients, subject: "❤️ IT'S A DATE! SHE SAID YES! 🥳", text: message, html }) });
      if (!response.ok) throw new Error(`Resend returned ${response.status}`);
      delivered = true;
    } else if (process.env.SMTP_HOST && process.env.NOTIFICATION_EMAIL) {
      const transporter = nodemailer.createTransport({ host: process.env.SMTP_HOST, port: Number(process.env.SMTP_PORT || 587), secure: process.env.SMTP_SECURE === 'true', connectionTimeout: 10000, auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS } });
      await transporter.sendMail({ from: process.env.SMTP_FROM || process.env.SMTP_USER, to: emailRecipients, subject: "❤️ IT'S A DATE! SHE SAID YES! 🥳", text: message, html });
      delivered = true;
    }
  } catch (error) {
    console.error('Notification delivery failed:', error.message);
  }

});

app.get('/api/date-responses', async (req, res) => {
  if (!process.env.ADMIN_TOKEN || req.get('x-admin-token') !== process.env.ADMIN_TOKEN) return res.status(401).json({ ok: false, message: 'Unauthorized.' });
  if (!pool) return res.status(503).json({ ok: false, message: 'Response storage is not configured yet.' });
  try {
    await databaseReady;
    const result = await pool.query('SELECT id, date_value AS date, time_value AS time, location, date_type AS "dateType", mood, note, guest_email AS "guestEmail", guest_phone AS "guestPhone", created_at AS timestamp FROM date_responses ORDER BY created_at DESC');
    res.json({ ok: true, responses: result.rows });
  } catch (error) {
    console.error('Response lookup failed:', error.message);
    res.status(500).json({ ok: false, message: 'Could not load responses.' });
  }
});

app.listen(port, () => console.log(`Date invitation API listening on http://localhost:${port}`));
