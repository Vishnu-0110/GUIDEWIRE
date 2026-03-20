# Deployment Guide (Vercel + Render)

This repo is set up for:

- `frontend` on Vercel
- `backend` on Render
- `ai-service` on Render

## 1) Deploy AI service on Render

1. Create a new **Web Service** from this repo.
2. Set:
   - Root Directory: `ai-service`
   - Runtime: `Python`
   - Build Command: `pip install -r requirements.txt`
   - Start Command: `python -m uvicorn app.main:app --host 0.0.0.0 --port $PORT`
   - Health Check Path: `/health`
3. Deploy and copy AI URL, for example:
   - `https://gigshield-ai-service.onrender.com`

## 2) Deploy backend on Render

1. Create another **Web Service** from this repo.
2. Set:
   - Root Directory: `backend`
   - Runtime: `Node`
   - Build Command: `npm ci`
   - Start Command: `npm start`
   - Health Check Path: `/api/health`
3. Add env vars:
   - Required:
     - `NODE_ENV=production`
     - `TRUST_PROXY=true`
     - `MONGO_URI=<your-mongodb-uri>`
     - `JWT_SECRET=<strong-secret>`
     - `PHONE_ENCRYPTION_KEY=<32-char-key>`
     - `AI_SERVICE_URL=<your-render-ai-url>`
     - `FRONTEND_URL=<your-vercel-frontend-url>`
   - Optional (live data/payment):
     - `OPENWEATHER_API_KEY`
     - `AQI_API_KEY`
     - `GOOGLE_MAPS_API_KEY`
     - `TRAFFIC_PROVIDER=tomtom`
     - `TRAFFIC_API_KEY`
     - `TRAFFIC_API_BASE_URL=https://api.tomtom.com/traffic/services/4`
     - `PAYMENT_PROVIDER=custom_api` (or `razorpay`)
     - `PAYMENT_API_BASE_URL`
     - `PAYMENT_API_KEY`
4. Deploy and copy Backend URL, for example:
   - `https://gigshield-backend.onrender.com`

## 3) Deploy frontend on Vercel

1. Import this repo in Vercel.
2. Set **Root Directory** to `frontend`.
3. Add env var:
   - `NEXT_PUBLIC_API_URL=https://gigshield-backend.onrender.com/api`
4. Deploy.

## 4) CORS for production + preview

Backend supports:

- `FRONTEND_URL` for one origin
- `FRONTEND_URLS` for comma-separated extra origins

Example:

```env
FRONTEND_URL=https://gigshield.vercel.app
FRONTEND_URLS=https://gigshield-git-main.vercel.app,https://gigshield-git-dev.vercel.app
```

## 5) Blueprint option (Render)

`render.yaml` is included at repo root for Render Blueprint deployment.

- It creates two services:
  - `gigshield-ai-service`
  - `gigshield-backend`
- Fill all `sync: false` env vars in Render dashboard after provisioning.
