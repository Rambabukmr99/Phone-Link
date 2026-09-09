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

Create a Meta WhatsApp Business app, create a permanent access token, and set `WHATSAPP_ACCESS_TOKEN`, `WHATSAPP_PHONE_NUMBER_ID`, and `WHATSAPP_NUMBER` in `.env`. The destination number is prefilled as `8340563402` in `.env.example`; confirm the country code format required by your WhatsApp Business account. The backend sends the complete date card as a text message through the Graph API; credentials never enter the browser.

## Email

The static GitHub Pages version uses FormSubmit for email, so no backend is needed for email. It sends the full card to `ramcomp3099@mail.com` and CCs her consented email. On the first submission, FormSubmit sends an activation email to `ramcomp3099@mail.com`; click that activation link once. The sender address is managed by FormSubmit rather than your Gmail account. For private SMTP delivery from `javadeveloper765497@gmail.com`, deploy `server.js` instead and configure the SMTP variables below. Never put an account password in GitHub or the frontend.

## Photos

The romantic gallery is configured near the top of `src/main.jsx` in the `images` array. Replace those royalty-free image URLs with your own hosted images when needed. Images use lazy loading and captions are stored beside each URL.

## Customize

Edit the `noMessages`, `noLabels`, `vibes`, and `moods` arrays in `src/main.jsx` to change messages and date ideas. The main colors, typography, spacing, and responsive rules live in `src/styles.css` as CSS variables. The app uses date input `min` validation so only future dates are accepted.

## Deploy

Build the frontend with `npm run build`. Serve the generated `dist` directory from your hosting provider and deploy `server.js` as a Node service. Set `VITE_API_URL` to the public API URL during the frontend build and configure the same environment variables on the server. Use HTTPS in production and set `FRONTEND_ORIGIN` to the exact frontend origin.
