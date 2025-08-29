## User & Booking Flows

### New User Booking via QR/Link

1. Anonymous user hits QR/link → event details page is visible (read-only).
2. Clicking "Book Ticket" → redirect to sign-up.
3. After sign-up → user must verify email via token.
4. After verification/login → redirect back to the initial event context and continue booking → payment.

Implementation notes:

- Preserve the intended event context in a query param or short-lived cache key.
- Return a `next` URL in the auth flows to support redirect post-verification.

### QR & Shareable Link Rules

- Each event exposes:
  - `/api/v1/qr/event/:eventId` → returns QR payload (URL).
  - Share link: `https://<frontend>/events/:eventId`.
- QR scans or link clicks must land on event details and enable booking.

### Multiple Tickets / Single QR

- One booking can include multiple tickets (quantity N).
- The booking generates one QR (booking-level) and stores quantity and total.
- Scan result payload shows:
  - `bookingReference`, `quantity`, `totalAmount`, `status`.

### Email Verification

- Register → create in `temp_users`, send verification token (24h TTL).
- Verify → move record to `users`, issue JWT.
- Unverified users cannot login or access protected endpoints.
