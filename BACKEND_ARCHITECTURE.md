# IRCTC revamp backend architecture

This is the implementation contract for the UI. It follows the supplied architecture document; it is not a description of IRCTC's production systems.

```
Browser → CDN/WAF → API gateway → RSL → Auth | Search | Booking | PNR | Refund
                                      │       │        │
                                      │       ├─ Redis (sessions, cache, rate limits)
                                      │       ├─ PostgreSQL (source of truth)
                                      │       └─ Kafka → notifications | train events | analytics | refund workers
                                      └─ monitoring, reconciliation and recovery
```

## Responsibilities

| Component | Responsibility |
| --- | --- |
| PostgreSQL | Correct, durable account, agent, booking, payment, refund and audit records. Use transactions, foreign keys, unique constraints, backups and replicas. |
| Redis | Fast, temporary data: server-side session IDs, OTP/risk-check state, distributed rate counters, search cache and revoked-session markers. |
| Kafka | Durable asynchronous events such as `booking.confirmed`, `payment.captured`, `refund.requested`, train updates, notifications and analytics. Consumers must be idempotent and use retry/dead-letter topics. |
| RSL (Reliability & Safety Layer) | Authentication/RBAC, validation, request IDs, idempotency, rate limiting, admission control/virtual queue, bounded retries and circuit breakers. |
| Reconciliation | Detects and repairs payment/booking/refund mismatches by comparing provider outcomes with PostgreSQL records and replaying safe Kafka work. |
| Monitoring | Tracks request latency/error rate, login/risk events, DB pool health, Redis hit rate, Kafka lag, reconciliation failures and virtual queue depth. Alerts on defined thresholds. |

## Identity and access

Use a single `accounts` table with an explicit role, and agent-only records in `agent_profiles`.

```text
accounts(id, role[user|agent], login_id, email, mobile, password_hash,
         status, created_at, updated_at)
agent_profiles(account_id, agent_user_id, authorization_status,
               authorization_expires_at, audit_reference)
sessions(id, account_id, expires_at, revoked_at)
audit_events(id, account_id, request_id, event_type, metadata, created_at)
```

- A normal customer logs in with their User ID/email and password.
- An authorized agent must log in using a registered **Agent User ID** and password. The authentication service must verify `role = agent`, active authorization and account state before issuing a session.
- Never permit an agent booking flow to use a personal User ID for customer bookings. Booking commands carry the authenticated `agent_account_id` and are audited.
- Passwords are hashed only in the authentication service (Argon2id preferred). The browser never receives or stores password hashes, database credentials or durable access tokens.

The agent declaration displayed in the UI is a required acknowledgement. Its accepted version, timestamp, account ID and request ID should be written to `audit_events`; it is not a substitute for enforcing fares, ERS integrity or authorization in backend services.

## Login flow

1. CDN/WAF and API gateway filter abusive traffic and attach a request ID.
2. RSL checks input, rate limits in Redis and decides whether a CAPTCHA/risk challenge is needed.
3. Authentication service verifies the password hash and account/agent authorization against PostgreSQL.
4. On success, create a random server-side session in Redis with a short TTL and send only a `Secure`, `HttpOnly`, `SameSite` cookie. Write an audit event to PostgreSQL and publish a login event to Kafka.
5. On failure, return a safe generic error, use bounded retries and record the security event without exposing whether an account exists.

## Booking and recovery controls

Every booking/payment request needs a client-generated idempotency key and request ID. PostgreSQL should enforce a unique constraint on the effective booking/payment key inside one transaction. Publish the event through an outbox table so a committed booking cannot lose its Kafka event. Consumers de-duplicate using the event ID.

Use a periodic reconciliation job for `processing` or `unknown` payments and refunds. It should query the provider, update PostgreSQL transactionally, issue any necessary idempotent Kafka event and alert when a record cannot be resolved automatically.

During Tatkal or other spikes, RSL admission control places excess requests in a virtual queue rather than exhausting application/database capacity. Read paths can degrade to cached last-known data with timestamps; booking writes must never report success until the PostgreSQL transaction is committed.

## API surface for the current UI

```text
POST /v1/auth/login             { role, identity, password, riskResponse? }
POST /v1/auth/recovery/start    { contact }
POST /v1/auth/logout
GET  /v1/auth/session
POST /v1/bookings               Idempotency-Key header required
GET  /v1/pnr/:pnr
GET  /v1/refunds/:id
```

All mutating endpoints validate input, require an authenticated session and return the request ID. Booking endpoints enforce RBAC and agent fare/ERS rules server-side, even if the browser has been modified.
