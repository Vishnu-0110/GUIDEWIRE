# API Reference (Backend)

Base URL: `http://localhost:4000/api`

## Auth

- `POST /auth/signup`
- `POST /auth/login`
- `POST /auth/request-otp`

## User

- `GET /users/me`
- `PUT /users/me`
- `POST /users/work-status`

## Policy

- `GET /policies/suggestions`
- `POST /policies/buy`
- `GET /policies/my`

## Monitoring

- `GET /monitoring/live`
- `GET /weather?city=Coimbatore`
- `GET /aqi?city=Coimbatore`
- `GET /traffic?city=Coimbatore`
- `GET /platform-status?city=Coimbatore`
- `GET /social-status?city=Coimbatore`

## Claims

- `GET /claims/my`

## Admin

- `GET /admin/dashboard`
- `POST /admin/trigger-now`
- `POST /admin/trigger-area`

## Voice/Offline

- `GET /assistant/voice?lang=ta&intent=upgrade`
- `POST /assistant/offline-alert`
