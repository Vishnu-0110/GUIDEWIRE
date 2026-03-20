# GigShield AI

Full-stack AI-powered parametric insurance platform for food delivery partners.

## What this project delivers

- Protects weekly income loss for Swiggy/Zomato partners
- Detects disruption events automatically:
  - Environmental: rain, heat, severe AQI, traffic gridlock
  - Social: curfew, local strike, zone closure
  - Platform: app outage
- Triggers instant, no-claim payouts
- Uses AI for risk pricing and fraud detection
- Runs on weekly subscription plans
- Includes critical extensions:
  - Work status validation (`ONLINE` + GPS/activity)
  - Strict 7-day policy lifecycle + auto-expiry
  - Severity-based partial payout
  - Area-level trigger for all users in city/zone
  - Forecast vs real-time data split
  - API failure fallback and duplicate payout prevention
  - Security controls and queue-ready scalability

## Monorepo structure

```text
frontend/    Next.js + Tailwind + ShadCN-style UI + Zustand + Axios
backend/     Node.js + Express + MongoDB + JWT + Cron + BullMQ fallback queue
ai-service/  FastAPI + scikit-learn (Logistic Regression, Isolation Forest)
docs/
```

## Core insurance logic

```text
IF rainfall > 50mm OR AQI > 300 OR temperature > 42C OR trafficIndex > 8
OR curfew = TRUE OR localStrike = TRUE OR zoneClosure = TRUE OR platformOutage = TRUE
THEN disruption event is created and payout workflow is triggered
```

Payout math:

```text
hourly_income = daily_income / working_hours
lost_hours = function(severity)
payout = hourly_income * lost_hours
```

## Pricing model

- AI predicts `risk_score` from forecast data
- Risk band to base weekly premium:
  - LOW -> Rs.20/week
  - MEDIUM -> Rs.40/week
  - HIGH -> Rs.70/week
- Buy page plan options:
  - Rs.30/week -> Rs.800 coverage
  - Rs.50/week -> Rs.1200 coverage
  - Rs.70/week -> Rs.1500 coverage

## Backend modules

1. Auth service: `/api/auth/signup`, `/api/auth/login`, `/api/auth/request-otp`
2. User service: profile + work status (`/api/users/me`, `/api/users/work-status`)
3. Policy service: suggestions, purchase, active lifecycle
4. AI risk engine: external FastAPI (`/risk/predict`)
5. Trigger engine: hourly cron, area-based realtime evaluation
6. Income-loss engine: hourly income + severity-based lost hours
7. Payout engine: policy checks, fraud checks, payment, notification
8. Fraud detection: rules + AI anomaly endpoint (`/fraud/detect`)
9. Admin analytics: users, active policies, claims, revenue, fraud alerts

## Frontend pages

- Landing (`/`)
- Auth (`/auth`)
- Onboarding (`/onboarding`)
- Dashboard (`/dashboard`)
- Buy Policy (`/buy-policy`)
- Monitoring (`/monitoring`)
- Claims Auto Feed (`/claims`)
- Admin Dashboard (`/admin`)

## Setup

### 1. Install dependencies

```bash
npm install
npm install --prefix backend
npm install --prefix frontend
```

### 2. Python dependencies for AI service

```bash
pip install -r ai-service/requirements.txt
```

### 3. Configure env files

- Copy `backend/.env.example` -> `backend/.env`
- Copy `frontend/.env.example` -> `frontend/.env.local`
- For mostly live external signals, set:
  - `OPENWEATHER_API_KEY`, `AQI_API_KEY`, `TRAFFIC_API_KEY`
  - `TRAFFIC_PROVIDER=tomtom`
- For live payment hooks, choose one:
  - `PAYMENT_PROVIDER=custom_api` + `PAYMENT_API_BASE_URL`
  - `PAYMENT_PROVIDER=razorpay` + Razorpay credentials

### 4. Run all services

```bash
npm run dev
```

- Frontend: `http://localhost:3000`
- Backend: `http://localhost:4000/api/health`
- AI service: `http://localhost:8000/health`

## Data flow

- Forecast API -> AI pricing (`risk_score`, `risk_level`)
- Real-time weather/AQI/traffic/curfew/platform-status -> trigger engine
- Triggered event -> queue -> payout engine
- Payout engine -> fraud check -> claim record -> payment -> notification

## Integration capabilities

- Weather API (OpenWeather or mock)
- AQI API (WAQI or mock)
- Traffic data (TomTom live flow + geocoded coordinates, with cache/mock fallback)
- Platform API simulation for app crash/outage events
- Payment system (custom live provider hooks or Razorpay, with mock fallback)

## Coverage guardrails

- Loss-of-income only coverage
- No health, life, accident, or vehicle-repair coverage
- Persona focus fixed to food delivery partners (Swiggy/Zomato)
- Financial model is weekly-only (`WEEKLY` cycle)

## Test case (Heavy rain)

- Rainfall: `70mm` (threshold: `50mm`)
- Trigger: `TRUE`
- Example user:
  - `daily_income = 1000`
  - `working_hours = 10`
  - `hourly_income = 100`
  - `lost_hours = 3`
- Payout: `Rs.300`

## Security and scalability

- JWT auth
- Rate limiting
- Sensitive phone data encryption
- Role-based admin guard
- Redis/BullMQ queue support with in-process fallback
- Service separation: frontend, backend, AI microservice

## Advanced innovation hooks included

- Hyperlocal area logic using city + zone + GPS check
- Dynamic payout adjustment via `demandDropPercent` multiplier
- AI recommendation flags for weekly plan upgrades
- Voice assistant endpoint with English/Hindi/Tamil responses
- Offline SMS alert endpoint for low-internet users

## Differentiation vs traditional insurance

- Traditional:
  - Manual claim filing
  - Slow approval and settlement
  - High ops overhead
- GigShield AI:
  - No claim filing
  - Auto-triggered payouts
  - Instant payout workflow with real-time disruption signals
# GUIDEWIRE
