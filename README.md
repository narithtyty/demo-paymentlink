<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>



# EPOS Payment Link Generator (Cloudflare Edition)

This project is a full-stack React app (Vite) for Cloudflare Pages, with backend API implemented as a Cloudflare Worker.

---

## Local Development

**Prerequisites:** Node.js, [Wrangler CLI](https://developers.cloudflare.com/workers/wrangler/install/)

1. Install dependencies:
   ```bash
   npm install
   ```
2. Set the `GEMINI_API_KEY` in `.env.local` if needed for Gemini API features.
3. Start the Vite dev server:
   ```bash
   npm run dev
   ```
   - Frontend: http://localhost:5173/
4. In a separate terminal, start the Cloudflare Worker locally:
   ```bash
   npx wrangler dev functions/create-payment-token.js --route=/api/create-payment-token
   ```
   - Worker: http://localhost:8787/api/create-payment-token
5. Update your frontend API calls to use the Worker URL in local dev if needed.

---

## Production Deployment (Cloudflare Pages + Workers)

1. Push your code to a Git repository (GitHub, GitLab, etc.).
2. Connect your repo to Cloudflare Pages for the frontend (build output: `dist`).
3. Deploy your Worker (API) using Wrangler:
   ```bash
   npx wrangler publish functions/create-payment-token.js --name create-payment-token
   ```
4. In Cloudflare Pages project settings, set a custom route for `/api/create-payment-token` to your Worker.
5. All `/api/create-payment-token` requests will be handled by the Worker in production.

---

## Project Structure

- `src/` — React frontend (Vite)
- `functions/` — Cloudflare Worker API endpoints
- `package.json` — Scripts and dependencies

---

## Notes

- For local dev, run Vite and Wrangler separately.
- For production, deploy frontend to Cloudflare Pages and API to Cloudflare Workers.
- API calls from frontend use `/api/create-payment-token` (update to full Worker URL in local dev if needed).

---

## License

SPDX-License-Identifier: Apache-2.0
# demo-paymentlink
