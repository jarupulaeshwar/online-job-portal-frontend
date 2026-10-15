# CareerBridge frontend (React + Vite)

This repository contains the standalone frontend for CareerBridge. The Spring
Boot API is maintained in a separate backend repository.

```powershell
copy .env.example .env      # set VITE_API_URL to your backend's URL
npm install
npm run dev                 # http://localhost:5173
npm test                    # unit tests (Vitest)
npm run build               # production build in dist/
```

Set `VITE_API_URL` in `.env` to the base URL of the backend API (for local
development, `http://localhost:8080`). Configure the same variable in your
frontend hosting provider when deploying. For single-page-app routing on a
static host, `public/_redirects` (Netlify/Cloudflare) and `vercel.json` (Vercel)
already rewrite every path to `index.html`.
