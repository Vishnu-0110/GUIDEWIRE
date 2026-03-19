# Architecture

## Services

- `frontend` (Next.js): UI and session layer
- `backend` (Express): domain orchestration and APIs
- `ai-service` (FastAPI): ML inference microservice

## Backend service boundaries

- Auth service
- User/Profile service
- Policy service
- Trigger service
- Payout service
- Fraud service
- Admin analytics service

## Queue path

- Trigger service -> `enqueuePayoutJob` -> BullMQ/Redis queue
- Worker consumes jobs -> payout service
- Fallback mode: in-process queue when Redis is not configured

## Database collections

- `users`
- `policies`
- `events`
- `claims`
- `activitylogs`
- `datacaches`
