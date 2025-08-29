## Coding Standards

- Type safety: avoid `any`; export typed APIs; keep JWT types explicit.
- Errors: never crash on external services (email); log and continue in dev.
- Express 5: avoid `"*"` wildcard; use catch-all handler without a path.
- Middleware order: security → rate limit → body parsers → routers → 404 → error handler.
- Env validation: required keys must be present; provide sensible dev defaults.
- Emails: use non-blocking sends; in dev use Mailtrap/Ethereal.
- Prisma:
  - Use migrations; keep `prisma generate` updated after schema changes.
  - Separate `temp_users` and `users` tables for verification flow.
- Redis: only for cache, rate limit, and short-lived tokens (e.g., password reset).
