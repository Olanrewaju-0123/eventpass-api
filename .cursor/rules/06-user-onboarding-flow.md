# New User Onboarding and Email Verification Flow

## Overview

The system implements a two-table approach for user registration to ensure email verification before account activation.

## Database Schema

### TempUser Table (temp_users)

```prisma
model TempUser {
  id                       String    @id @default(cuid())
  email                    String    @unique
  password                 String
  firstName                String
  lastName                 String
  phone                    String?
  emailVerificationToken   String    @unique
  emailVerificationExpires DateTime
  createdAt                DateTime  @default(now())

  @@map("temp_users")
}
```

### User Table (users)

```prisma
model User {
  id        String   @id @default(cuid())
  email     String   @unique
  password  String
  firstName String
  lastName  String
  phone     String?
  isActive  Boolean  @default(true)
  role      UserRole @default(USER)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  // Relations
  bookings Booking[]
  events   Event[]   @relation("EventCreator")

  @@map("users")
}
```

## Registration Flow

### 1. User Registration

**Endpoint**: `POST /api/v1/auth/register`

**Request Body**:

```json
{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@example.com",
  "password": "Password123",
  "phone": "+1234567890"
}
```

**Process**:

1. Validate input data
2. Check if user already exists in `users` table
3. Hash password using bcrypt
4. Generate email verification token (crypto.randomBytes(32).toString('hex'))
5. Set token expiration (24 hours from now)
6. Create record in `temp_users` table
7. Send verification email
8. Return success response (NO JWT token yet)

**Response**:

```json
{
  "success": true,
  "message": "Registration successful. Please check your email to verify your account.",
  "data": {
    "email": "john@example.com",
    "verificationRequired": true
  }
}
```

### 2. Email Verification

**Endpoint**: `POST /api/v1/auth/verify-email`

**Request Body**:

```json
{
  "token": "verification_token_from_email"
}
```

**Process**:

1. Find temp user by verification token
2. Check if token is not expired
3. Create user in `users` table with same data
4. Delete temp user record
5. Generate JWT token
6. Return user data with token

**Response**:

```json
{
  "success": true,
  "message": "Email verified successfully",
  "data": {
    "user": {
      "id": "user_id",
      "email": "john@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "role": "USER",
      "isActive": true
    },
    "token": "jwt_token_here"
  }
}
```

## Email Service Integration

### Email Verification Email

**Service**: `EmailService.sendEmailVerification()`

**Email Content**:

- **Subject**: "Verify Your EventPass Account"
- **Template**: HTML email with verification link
- **Link Format**: `${FRONTEND_URL}/verify-email?token=${verificationToken}`
- **Expiration**: 24 hours

**Email Template Structure**:

```html
<h1>Welcome to EventPass!</h1>
<p>Hi ${firstName},</p>
<p>Please click the link below to verify your email address:</p>
<a href="${verificationUrl}">Verify Email Address</a>
<p>This link will expire in 24 hours.</p>
```

## Frontend Integration Requirements

### Required Frontend Routes

#### 1. Registration Page

- **Route**: `/register`
- **Purpose**: User registration form
- **After Registration**: Redirect to email verification page

#### 2. Email Verification Page

- **Route**: `/verify-email?token=:token`
- **Purpose**: Handle email verification
- **Process**:
  1. Extract token from URL
  2. Call `POST /api/v1/auth/verify-email` with token
  3. On success: Store JWT token, redirect to dashboard
  4. On error: Show error message, offer resend option

#### 3. Login Page

- **Route**: `/login`
- **Purpose**: User authentication
- **Note**: Only verified users can login

### Frontend State Management

#### Registration Flow

```typescript
// After successful registration
const handleRegistration = async (userData) => {
  const response = await register(userData);
  if (response.success) {
    // Redirect to email verification page
    router.push("/verify-email?email=" + userData.email);
  }
};
```

#### Email Verification Flow

```typescript
// On email verification page
const handleEmailVerification = async (token) => {
  const response = await verifyEmail(token);
  if (response.success) {
    // Store JWT token
    localStorage.setItem("token", response.data.token);
    // Redirect to dashboard or intended page
    router.push("/dashboard");
  }
};
```

## Event Booking Integration

### New User Booking Flow

1. **Event Discovery**: User finds event via QR code or link
2. **Event Viewing**: User can view event details without authentication
3. **Booking Attempt**: User clicks "Book Ticket"
4. **Authentication Check**:
   - If not logged in: Redirect to registration
   - If logged in: Proceed to booking
5. **Registration**: User completes registration
6. **Email Verification**: User verifies email
7. **Login**: User logs in after verification
8. **Booking Continuation**: User redirected back to event booking
9. **Payment**: User completes payment
10. **Confirmation**: Booking confirmed with QR code

### Redirect Logic

```typescript
// Store intended booking URL before redirect
const intendedUrl = "/events/" + eventId + "/book";

// After successful login/verification
if (intendedUrl) {
  router.push(intendedUrl);
} else {
  router.push("/dashboard");
}
```

## Error Handling

### Common Scenarios

#### 1. Duplicate Registration

- **Error**: "User already exists with this email"
- **Response**: HTTP 409 Conflict
- **Action**: Show login link instead

#### 2. Expired Verification Token

- **Error**: "Verification token has expired"
- **Response**: HTTP 400 Bad Request
- **Action**: Offer resend verification email

#### 3. Invalid Verification Token

- **Error**: "Invalid verification token"
- **Response**: HTTP 400 Bad Request
- **Action**: Show error message, offer resend

#### 4. Email Service Failure

- **Error**: SMTP/Email service error
- **Response**: HTTP 500 Internal Server Error
- **Action**: Log error, show generic message, allow retry

## Security Considerations

### Token Security

- **Verification Token**: 32-byte random hex string
- **Expiration**: 24 hours maximum
- **Storage**: Not stored in plain text, hashed in database
- **Usage**: Single-use only (deleted after verification)

### Password Security

- **Hashing**: bcrypt with salt rounds
- **Validation**: Strong password requirements
- **Storage**: Never stored in plain text

### Email Security

- **Rate Limiting**: Prevent spam registrations
- **Domain Validation**: Optional email domain restrictions
- **SMTP Security**: TLS/SSL for email transmission

## Testing Scenarios

### Registration Flow Tests

1. ✅ Valid registration creates temp user
2. ✅ Duplicate email returns conflict error
3. ✅ Invalid email format returns validation error
4. ✅ Weak password returns validation error
5. ✅ Email verification email is sent

### Email Verification Tests

1. ✅ Valid token verifies user and creates account
2. ✅ Expired token returns error
3. ✅ Invalid token returns error
4. ✅ Used token cannot be reused
5. ✅ JWT token generated after verification

### Integration Tests

1. ✅ New user can complete full booking flow
2. ✅ Email verification required before login
3. ✅ Unverified users cannot access protected routes
4. ✅ Verified users can login and access system
5. ✅ Booking flow redirects work correctly

## Configuration

### Environment Variables

```env
# Email Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
FRONTEND_URL=http://localhost:3000

# JWT Configuration
JWT_SECRET=your-jwt-secret
JWT_EXPIRES_IN=7d

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/eventpass
```

### Email Service Configuration

- **Provider**: Nodemailer with Gmail SMTP
- **Fallback**: SendGrid integration available
- **Error Handling**: Graceful degradation if email fails
- **Retry Logic**: Automatic retry for failed emails
