# GigShield AI - Project Overview (For ChatGPT)

Use this document as context when asking ChatGPT about this project.

## 1) Elevator pitch

GigShield AI is a full-stack parametric insurance platform for food-delivery partners (Swiggy/Zomato).  
It monitors city-level disruptions (weather, AQI, traffic, curfew, strike, platform outage) and auto-triggers instant income-loss payouts for eligible active policies.

## 2) Tech stack

- Frontend: Next.js 14, React, Tailwind, Axios, Zustand
- Backend: Node.js, Express, MongoDB (Mongoose), JWT, node-cron, BullMQ-ready queue
- AI microservice: FastAPI, scikit-learn (Logistic Regression + Isolation Forest)

## 3) Monorepo layout

- `frontend/` -> user/admin UI
- `backend/` -> core insurance APIs + scheduler + payout pipeline
- `ai-service/` -> risk prediction + fraud anomaly endpoints
- `docs/` -> architecture/API/system flow docs

## 4) Core business logic

Disruption trigger fires when any condition crosses threshold:

- rainfall > 50 mm
- AQI > 300
- temperature > 42 C
- trafficIndex > 8
- or curfew/localStrike/zoneClosure/platformOutage is true

When triggered:

1. event is created (deduplicated by city/zone/time window),
2. active policies in that area are found,
3. fraud checks run,
4. payout is calculated and sent automatically.

## 5) Main API groups

- Auth: `/api/auth/*`
- User/Profile/Work status: `/api/users/*`
- Policies: `/api/policies/*`
- Monitoring/live conditions: `/api/monitoring/live`
- Claims: `/api/claims/*`
- Admin analytics: `/api/admin/*`
- Health: `/api/health` (backend), `/health` (ai-service)

## 6) Data and integrations

- MongoDB stores users, policies, claims, events, cache.
- External feeds:
  - OpenWeather (weather + geocoding fallback),
  - WAQI (AQI),
  - TomTom flow API (traffic).
- Fallback mode:
  - cached values,
  - then controlled mock values if enabled.

## 7) AI responsibilities

- Risk model (`/risk/predict`): returns risk score/level for premium suggestions.
- Fraud model (`/fraud/detect`): flags anomalous claim behavior.
- Backend has heuristic fallback if AI service is unavailable.

## 8) Deployment topology

- Frontend -> Vercel
- Backend -> Render web service
- AI service -> Render web service
- Frontend calls backend via `NEXT_PUBLIC_API_URL`
- Backend calls AI service via `AI_SERVICE_URL`

## 9) Production env highlights

Backend:

- `MONGO_URI`, `JWT_SECRET`, `PHONE_ENCRYPTION_KEY`
- `FRONTEND_URL` (+ `FRONTEND_URLS` for preview domains)
- `AI_SERVICE_URL`
- `TRUST_PROXY=true` on Render

Frontend:

- `NEXT_PUBLIC_API_URL=<backend-url>/api`

## 10) Ready-to-use ChatGPT prompt

```text
You are my senior reviewer for the GigShield AI project.
Context:
- Monorepo: Next.js frontend, Express backend, FastAPI AI service.
- Product: parametric insurance for food delivery workers.
- Trigger signals: rain/AQI/heat/traffic/curfew/strike/zone closure/platform outage.
- Auto payout pipeline: trigger -> policy check -> fraud check -> payout.
- Deployment: frontend on Vercel, backend + AI on Render.

Please help me with:
1) architecture review,
2) phase-1 demo talking points,
3) risk/limitations I should disclose,
4) a 2-minute judge pitch,
5) likely judge Q&A with strong answers.
```
