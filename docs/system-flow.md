# Complete System Flow

1. User signs up using:
   - Email + password OR
   - Phone + OTP
2. User completes onboarding:
   - City, zone, platform, daily income, working hours
3. AI risk engine computes forecast-based risk score
4. Suggested weekly plans are shown
5. User buys weekly policy (valid for exactly 7 days)
6. Trigger engine runs every hour:
   - Fetches real-time weather/AQI/traffic/curfew/platform/social status
   - Evaluates thresholds
   - Creates area-level disruption event
7. Payout queue processes all active users in area
8. Payout engine validates:
   - Active and unexpired policy
   - Work status ONLINE
   - Recent activity and GPS integrity
   - Duplicate-claim blocks
9. Income-loss engine computes payout
10. Payment engine sends payout (mock)
11. User receives notification
12. Claims and analytics dashboards are updated

## Severity-based payout scaling

- Rain:
  - 50-70mm -> 30%
  - 70-100mm -> 60%
  - 100mm+ -> 100%
- AQI:
  - 200-300 -> 40%
  - 300-400 -> 70%
  - 400+ -> 100%

## Edge-case handling

- External API failure -> uses cached data
- Cache unavailable -> trigger skipped for that cycle
- Duplicate trigger in event window -> existing event reused
- Duplicate payout for same user/event -> blocked by unique claim index
