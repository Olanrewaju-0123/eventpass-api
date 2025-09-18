# Booking Flow Verification

## QR Code and Link Support

### Event Promotion QR Codes

- **Route**: `GET /api/v1/qr/event/:eventId`
- **Purpose**: Generate QR codes for event promotion
- **Implementation**: `QRService.generateEventPromotionQR(eventId)`
- **URL Format**: `${FRONTEND_URL}/events/${eventId}`
- **Usage**: When scanned, takes users to event details page

### Booking QR Codes

- **Purpose**: Generate QR codes for completed bookings
- **Implementation**: `QRService.generateBookingQR(qrData)`
- **URL Format**: `${FRONTEND_URL}/verify-ticket/${bookingReference}`
- **Usage**: When scanned, shows booking verification details

## Multiple Tickets per Booking

### Supported Features

✅ **Multiple tickets per booking**: Users can book 1-10 tickets in a single booking
✅ **Single QR code per booking**: One QR code represents the entire booking
✅ **Quantity tracking**: System tracks `quantity` field in bookings
✅ **Total amount calculation**: `totalAmount = event.price * quantity`

### Implementation Details

- **Validation**: Quantity must be between 1-10 tickets
- **Database**: `quantity` field in `bookings` table
- **QR Code**: Single QR code for entire booking, not per ticket
- **Verification**: QR scan shows total tickets and amount for the booking

### Code References

```typescript
// Booking creation with quantity
const { eventId, quantity } = bookingData;
const totalAmount = Number(event.price) * quantity;

// QR generation for booking
const verificationUrl = `${config.FRONTEND_URL}/verify-ticket/${bookingReference}`;
```

## Booking Flow Steps

1. **Event Discovery**: User finds event via QR code or direct link
2. **Event Details**: User views event information
3. **Booking Initiation**: User selects quantity (1-10 tickets)
4. **User Authentication**:
   - Existing user: Login required
   - New user: Registration → Email verification → Login
5. **Payment Processing**: Paystack integration for payment
6. **Booking Confirmation**: Booking created with PENDING status
7. **QR Code Generation**: Single QR code for entire booking
8. **Email Confirmation**: Booking details sent via email

## New User Flow

### Registration Process

1. **Registration**: User provides email, password, name, phone
2. **Temp User Creation**: User stored in `temp_users` table
3. **Email Verification**: Verification email sent with token
4. **Email Verification**: User clicks link, moves to `users` table
5. **Login**: User can now login and access system

### Email Verification Flow

- **Route**: `POST /api/v1/auth/verify-email`
- **Token**: 24-hour expiration
- **Database**: Moves user from `temp_users` to `users`
- **JWT**: Generated after successful verification

## Admin Dashboard Metrics

### Available Statistics Endpoints

#### Event Statistics

- **Route**: `GET /api/v1/events/:eventId/statistics`
- **Access**: Event organizer only
- **Data**: Event-specific metrics

#### Booking Statistics

- **User Route**: `GET /api/v1/bookings/my/statistics`
- **Admin Route**: `GET /api/v1/bookings/admin/statistics`
- **Data**: Booking counts, ticket quantities, amounts by status

#### Payment Statistics

- **User Route**: `GET /api/v1/payments/my/statistics`
- **Admin Route**: `GET /api/v1/payments/admin/statistics`
- **Data**: Payment amounts, success rates, refunds

### Admin Routes Summary

```
GET /api/v1/bookings/admin/all - All bookings
GET /api/v1/bookings/admin/statistics - All booking stats
GET /api/v1/payments/admin/all - All payments
GET /api/v1/payments/admin/statistics - All payment stats
POST /api/v1/payments/admin/:paymentId/refund - Process refunds
```

## Verification Checklist

- [x] QR codes generated for events and bookings
- [x] Multiple tickets supported per booking (1-10)
- [x] Single QR code per booking (not per ticket)
- [x] New user registration with email verification
- [x] Admin statistics endpoints available
- [x] Booking flow supports both QR and direct links
- [x] Payment integration with Paystack
- [x] Email confirmations for bookings

## Frontend Integration Notes

### Required Frontend Routes

- `/events/:eventId` - Event details page
- `/verify-ticket/:bookingReference` - Ticket verification
- `/verify-email?token=:token` - Email verification
- `/login` - User authentication
- `/register` - User registration

### QR Code Integration

- Event QR codes should redirect to event details
- Booking QR codes should show verification details
- Both should work without authentication for viewing
- Booking requires authentication for actual booking process
