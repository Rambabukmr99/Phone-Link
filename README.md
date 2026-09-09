# A Very Important Question

A romantic, playful date invitation with a no-pressure interaction and a server-side notification endpoint.

## Run locally

1. Install Node.js 18+.
2. Run `npm install`.
3. Copy `.env.example` to `.env` and fill in notification values when ready.
4. Run `npm run dev`.
5. Open `http://localhost:5173`.

The frontend works without notification credentials. Confirmations still finish gracefully; the backend logs delivery errors without exposing them to the guest.

## WhatsApp Business Cloud API

Create a Meta WhatsApp Business app, create a permanent access token, and set `WHATSAPP_ACCESS_TOKEN`, `WHATSAPP_PHONE_NUMBER_ID`, and `WHATSAPP_NUMBER` in `.env`. The number must include the country code and no `+` or spaces. The backend sends a text message through the Graph API; credentials never enter the browser.

## Email

Set SMTP credentials in `.env` (`SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `SMTP_FROM`) plus `NOTIFICATION_EMAIL`. Gmail requires an app password when two-factor authentication is enabled. Any SMTP provider can be used.

## Photos

The romantic gallery is configured near the top of `src/main.jsx` in the `images` array. Replace those royalty-free image URLs with your own hosted images when needed. Images use lazy loading and captions are stored beside each URL.

## Customize

Edit the `noMessages`, `noLabels`, `vibes`, and `moods` arrays in `src/main.jsx` to change messages and date ideas. The main colors, typography, spacing, and responsive rules live in `src/styles.css` as CSS variables. The app uses date input `min` validation so only future dates are accepted.

## Deploy

Build the frontend with `npm run build`. Serve the generated `dist` directory from your hosting provider and deploy `server.js` as a Node service. Set `VITE_API_URL` to the public API URL during the frontend build and configure the same environment variables on the server. Use HTTPS in production and set `FRONTEND_ORIGIN` to the exact frontend origin.
