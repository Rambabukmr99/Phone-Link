# A Very Important Question

A romantic, playful date invitation with a no-pressure interaction and a server-side notification endpoint.

## Run locally

1. Install Node.js 18+.
2. Run `npm install`.
3. Copy `.env.example` to `.env` and fill in notification values when ready.
4. Run `npm run dev`.
5. Open `http://localhost:5173`.

For response storage, create a free Neon PostgreSQL database and put its connection string in `.env` as `DATABASE_URL`. Run `node server.js`, then run the frontend with `VITE_API_URL=http://localhost:8787`. A booking is confirmed only after the backend inserts it into PostgreSQL.

## Free deployment

1. Create a free PostgreSQL project at [Neon](https://neon.tech) and copy its pooled connection string.
2. In [Render](https://render.com), select **New → Blueprint**, choose this repository, and deploy `render.yaml`. Paste the Neon connection string when Render asks for `DATABASE_URL`. Render generates `ADMIN_TOKEN` automatically.
3. Open the deployed API URL and verify `https://your-render-url.onrender.com/health` returns `{ "ok": true }`.
4. In GitHub, open **Settings → Secrets and variables → Actions → Variables → New repository variable**. Add `VITE_API_URL` with the Render API URL, then rerun the Pages workflow.
5. To view responses, send a request to `https://your-render-url.onrender.com/api/date-responses` with the header `x-admin-token: your-ADMIN_TOKEN`. Keep this URL and token private.

Render's free service can sleep when unused; the first request may take a little longer. Neon may also suspend inactive free projects. Neither requires a paid plan.

## WhatsApp Business Cloud API

Create a Meta WhatsApp Business app, create a permanent access token, and set `WHATSAPP_ACCESS_TOKEN`, `WHATSAPP_PHONE_NUMBER_ID`, and `WHATSAPP_NUMBER` in `.env`. The destination number is prefilled as `8340563402` in `.env.example`; confirm the country code format required by your WhatsApp Business account. The backend sends the complete date card as a text message through the Graph API; credentials never enter the browser.

## Email

Email and WhatsApp remain optional. The response is stored in PostgreSQL even when those notification providers are not configured. If you later enable SMTP or WhatsApp on Render, those credentials stay server-side.

For a free email provider, use [Brevo](https://www.brevo.com): create a free account, verify `javadeveloper765497@gmail.com` under **Senders & IP**, create an API key under **SMTP & API**, and add `BREVO_API_KEY` to Render. Set `BREVO_FROM_EMAIL=javadeveloper765497@gmail.com`. Brevo's free plan supports daily email sending over HTTPS, avoiding the Render SMTP timeout. Both your configured email and her consented email receive the card.

## Photos

The romantic gallery is configured near the top of `src/main.jsx` in the `images` array. Replace those royalty-free image URLs with your own hosted images when needed. Images use lazy loading and captions are stored beside each URL.

## Customize

Edit the `noMessages`, `noLabels`, `vibes`, and `moods` arrays in `src/main.jsx` to change messages and date ideas. The main colors, typography, spacing, and responsive rules live in `src/styles.css` as CSS variables. The app uses date input `min` validation so only future dates are accepted.

## Deploy

Build the frontend with `npm run build`. Serve the generated `dist` directory from your hosting provider and deploy `server.js` as a Node service. Set `VITE_API_URL` to the public API URL during the frontend build and configure the same environment variables on the server. Use HTTPS in production and set `FRONTEND_ORIGIN` to the exact frontend origin.
