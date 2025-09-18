# EventPass - Complete Event Management System

A comprehensive full-stack event booking and ticketing system built with modern technologies. EventPass allows users to discover events, book tickets, make payments, and receive QR-coded tickets via email.

## 🎯 System Overview

EventPass is a complete event management platform that handles the entire event booking lifecycle:

- **Event Discovery**: Browse and search events by category, date, price, and location
- **User Management**: Secure authentication with role-based access (User, Organizer, Admin)
- **Booking System**: Two-phase booking process with ticket reservation and confirmation
- **Payment Integration**: Seamless Paystack and OPay integration for secure payments
- **Digital Tickets**: QR-coded tickets delivered via email for event entry
- **Event Management**: Comprehensive tools for event organizers to manage their events
- **OTP Verification**: Secure email-based OTP verification for registration and login

## 🏗️ Project Structure

```
eventpass-api/
├── backend/                 # Node.js/Express API server
│   ├── src/                # Source code
│   ├── prisma/             # Database schema and migrations
│   ├── config/             # Infrastructure configuration
│   ├── docker-compose.yaml # Docker services
│   └── README.md           # Backend documentation
├── frontend-vite/          # React frontend (Vite)
│   ├── src/                # Source code
│   ├── public/             # Static assets
│   └── README.md           # Frontend documentation
├── docs/                   # Additional documentation
│   ├── API_ROUTES_DOCUMENTATION.md
│   ├── SETUP_GUIDE.md
│   ├── OTP_SYSTEM_GUIDE.md
│   ├── API_CONNECTIONS_SUMMARY.md
│   └── OPAY_INTEGRATION_GUIDE.md
└── README.md               # This file
```

## ✨ Key Features

### 🔐 Authentication & Authorization

- JWT-based authentication with OTP verification
- Role-based access control (User, Organizer, Admin)
- Password reset via email with OTP
- Secure password hashing with bcrypt
- Email verification for new registrations

### 🎪 Event Management

- Create, read, update, delete events
- Event categorization and filtering
- Capacity management and availability tracking
- Event promotion QR codes
- Real-time event statistics
- Event creation with payment integration

### 🎫 Booking System

- **Two-Phase Booking Process**:
  1. `startBooking`: Reserve tickets for 15 minutes
  2. `completeBooking`: Confirm booking after successful payment
- Automatic ticket availability management
- Booking reference system
- QR code generation for tickets
- Email confirmations with ticket attachments

### 💳 Payment Processing

- **Paystack Integration**: Card and bank transfer payments
- **OPay Integration**: Mobile money payments
- Webhook handling for real-time payment updates
- Payment verification and tracking
- Refund processing capabilities
- Comprehensive payment analytics

### 📧 Communication System

- Email notifications for all booking stages
- Professional HTML email templates
- QR code attachments for tickets
- Password reset emails with OTP
- Welcome emails for new users
- OTP delivery for verification

### 🚀 Performance & Security

- Redis caching for improved performance
- Rate limiting to prevent abuse
- Input validation and sanitization
- CORS and security headers
- Comprehensive error handling
- OTP rate limiting and security

## 🛠️ Tech Stack

### Backend

- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **TypeScript** - Type safety
- **PostgreSQL** - Primary database
- **Prisma** - Database ORM
- **Redis** - Caching and OTP storage
- **JWT** - Authentication
- **Nodemailer** - Email service
- **Paystack/OPay** - Payment processing

### Frontend

- **React 18** - UI library
- **Vite** - Build tool and dev server
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **Redux Toolkit** - State management
- **React Router DOM** - Routing
- **React Hook Form** - Form handling
- **Yup** - Validation
- **Axios** - HTTP client

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- Docker and Docker Compose
- PostgreSQL (or use Docker)
- Redis (or use Docker)

### Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd eventpass-api
   ```

2. **Backend Setup**

   ```bash
   cd backend
   npm install
   cp .env.example .env
   # Edit .env with your configuration
   ```

3. **Frontend Setup**

   ```bash
   cd ../frontend-vite
   npm install
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. **Start Services**

   ```bash
   # From backend directory
   docker-compose -f docker-compose.dev.yaml up -d
   npx prisma migrate dev --name init
   npx prisma generate
   npm run dev
   ```

5. **Start Frontend**
   ```bash
   # From frontend-vite directory
   npm run dev
   ```

## 🔧 Environment Variables

### Backend (.env)

```env
# Database
DATABASE_URL="postgresql://eventuser:eventpass@localhost:5432/eventdb"

# Redis
REDIS_URL="redis://localhost:6379"

# JWT
JWT_SECRET="your-super-secret-jwt-key"
JWT_EXPIRES_IN="7d"

# API Configuration
PORT=4000
API_VERSION="v1"
NODE_ENV="development"
FRONTEND_URL="http://localhost:5173"
BASE_URL="http://localhost:4000"

# Paystack
PAYSTACK_SECRET_KEY="sk_test_your_secret_key"
PAYSTACK_PUBLIC_KEY="pk_test_your_public_key"
PAYSTACK_WEBHOOK_SECRET="your_webhook_secret"

# OPay
OPAY_SECRET_KEY="your_opay_secret_key"
OPAY_MERCHANT_ID="your_merchant_id"
OPAY_PUBLIC_KEY="your_opay_public_key"

# Email Service
SMTP_HOST="smtp.gmail.com"
SMTP_PORT=587
SMTP_USER="your-email@gmail.com"
SMTP_PASS="your-app-password"
FROM_EMAIL="your-email@gmail.com"
FROM_NAME="EventPass"
```

### Frontend (.env)

```env
# API Configuration
VITE_API_URL=http://localhost:4000/api/v1

# App Configuration
VITE_APP_NAME=EventPass
VITE_APP_VERSION=1.0.0
```

## 📚 Documentation

- **[Backend Documentation](./backend/README.md)** - Complete API documentation
- **[Frontend Documentation](./frontend-vite/README.md)** - Frontend setup and features

### 📋 Complete API Routes

**Base URL**: `http://localhost:4000/api/v1`

#### 🔐 Authentication Routes (`/auth`)

| Method | Endpoint                 | Description                   | Auth Required |
| ------ | ------------------------ | ----------------------------- | ------------- |
| `POST` | `/auth/register`         | Register new user (sends OTP) | ❌            |
| `POST` | `/auth/login`            | Login user (sends OTP)        | ❌            |
| `POST` | `/auth/complete-login`   | Complete login with OTP       | ❌            |
| `POST` | `/auth/verify-email-otp` | Verify email with OTP         | ❌            |
| `POST` | `/auth/resend-email-otp` | Resend email verification OTP | ❌            |
| `POST` | `/auth/resend-login-otp` | Resend login OTP              | ❌            |
| `POST` | `/auth/forgot-password`  | Request password reset        | ❌            |
| `POST` | `/auth/verify-reset-otp` | Verify reset OTP              | ❌            |
| `POST` | `/auth/reset-password`   | Reset password with OTP       | ❌            |
| `GET`  | `/auth/profile`          | Get user profile              | ✅            |
| `PUT`  | `/auth/profile`          | Update user profile           | ✅            |
| `GET`  | `/auth/users`            | Get all users (Admin)         | ✅            |

#### 📅 Events Routes (`/events`)

| Method   | Endpoint                     | Description                     | Auth Required  |
| -------- | ---------------------------- | ------------------------------- | -------------- |
| `GET`    | `/events`                    | Get all events                  | ❌             |
| `GET`    | `/events/:id`                | Get event by ID                 | ❌             |
| `GET`    | `/events/created/:reference` | Get event by creation reference | ❌             |
| `POST`   | `/events`                    | Create event                    | ✅ (Organizer) |
| `PUT`    | `/events/:id`                | Update event                    | ✅ (Organizer) |
| `DELETE` | `/events/:id`                | Delete event                    | ✅ (Organizer) |

#### 🎫 Bookings Routes (`/bookings`)

| Method | Endpoint               | Description       | Auth Required |
| ------ | ---------------------- | ----------------- | ------------- |
| `GET`  | `/bookings`            | Get user bookings | ✅            |
| `POST` | `/bookings`            | Create booking    | ✅            |
| `GET`  | `/bookings/:id`        | Get booking by ID | ✅            |
| `PUT`  | `/bookings/:id/cancel` | Cancel booking    | ✅            |

#### 💳 Payment Routes (`/payments`)

| Method | Endpoint                              | Description                       | Auth Required |
| ------ | ------------------------------------- | --------------------------------- | ------------- |
| `GET`  | `/payments/methods`                   | Get payment methods               | ❌            |
| `POST` | `/payments/initialize`                | Initialize payment                | ✅            |
| `POST` | `/payments/initialize-event-creation` | Initialize event creation payment | ✅            |
| `POST` | `/payments/process-mock-payment`      | Process mock payment (dev)        | ✅            |
| `GET`  | `/payments/verify/:reference`         | Verify payment                    | ❌            |

#### 🏦 OPay Routes (`/opay`)

| Method | Endpoint                  | Description              | Auth Required |
| ------ | ------------------------- | ------------------------ | ------------- |
| `GET`  | `/opay/methods`           | Get OPay payment methods | ❌            |
| `POST` | `/opay/create`            | Create OPay payment      | ✅            |
| `GET`  | `/opay/status/:reference` | Query payment status     | ❌            |
| `POST` | `/opay/cancel/:reference` | Cancel payment           | ✅            |

#### 🔗 Webhook Routes (`/webhooks`)

| Method | Endpoint             | Description      | Auth Required |
| ------ | -------------------- | ---------------- | ------------- |
| `POST` | `/webhooks/paystack` | Paystack webhook | ❌            |
| `POST` | `/webhooks/opay`     | OPay webhook     | ❌            |

### 🔐 OTP System Features

#### Registration Flow with OTP

1. User fills registration form
2. System creates temporary user record
3. **6-digit OTP sent to email** (expires in 15 minutes)
4. User enters OTP to verify email
5. Account is activated and user is logged in

#### Login Flow with OTP

1. User enters email and password
2. System validates credentials
3. **6-digit OTP sent to email** (expires in 15 minutes)
4. User enters OTP to complete login
5. User is authenticated and logged in

#### Password Reset Flow with OTP

1. User requests password reset
2. **6-digit OTP sent to email** (expires in 15 minutes)
3. User enters OTP to verify identity
4. User sets new password

### 💳 Payment Integration

#### Paystack Integration

- Card and bank transfer payments
- Webhook handling for real-time updates
- Payment verification and tracking
- Refund processing capabilities

#### OPay Integration

- QR code payment solution
- Mobile money payments
- Real-time payment status polling
- Secure signature verification

### 🧪 Testing & Development

#### Test Pages

- **API Test**: `http://localhost:5173/test/api` - Comprehensive API testing
- **OPay Test**: `http://localhost:5173/test/opay` - OPay payment testing
- **Admin Dashboard**: `http://localhost:5173/admin` - System management

#### Mock Payment System

For development, the system includes a mock payment flow:

1. User initiates payment
2. Redirects to mock payment success page
3. Processes payment and creates event
4. Redirects to event success page with details

## 🔄 System Flows

### Authentication Flow

1. User registers with email and password
2. System sends OTP verification email
3. User verifies email with OTP
4. User logs in to receive JWT token
5. Token used for authenticated requests
6. Password reset available via email with OTP

### Event Booking Flow

1. **Event Discovery**: User browses available events
2. **Start Booking**: User initiates booking (tickets reserved for 15 minutes)
3. **Payment**: User redirected to Paystack/OPay for payment
4. **Webhook Processing**: Payment provider notifies system of payment status
5. **Complete Booking**: System confirms booking and generates QR ticket
6. **Email Delivery**: Confirmation email sent with QR code attachment

### Event Creation Flow

1. **Organizer Registration**: User registers with organizer role
2. **Event Creation**: Organizer creates event with details and capacity
3. **Payment**: Organizer pays event creation fee (₦5,000)
4. **Event Activation**: Event becomes available for booking
5. **Event Promotion**: System generates QR code for event promotion
6. **Analytics**: Real-time tracking of bookings and availability

## 🧪 Testing

### Backend Testing

```bash
cd backend
npm test
npm run test:coverage
```

### Frontend Testing

```bash
cd frontend-vite
npm run test
npm run test:coverage
```

## 🐳 Docker Commands

```bash
# Start development environment
cd backend
docker-compose -f docker-compose.dev.yaml up -d

# Start production environment
docker-compose -f docker-compose.yaml up -d

# View logs
docker-compose -f docker-compose.dev.yaml logs

# Stop services
docker-compose -f docker-compose.dev.yaml down
```

## 🔧 Maintenance

### Database Management

```bash
cd backend
npx prisma studio          # Open database GUI
npx prisma migrate reset   # Reset database
npx prisma generate        # Generate Prisma client
```

### Cleanup Tasks

```bash
cd backend
npm run cleanup:bookings   # Clean expired bookings
npm run backup:db         # Backup database
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Add tests for new features
5. Run the test suite (`npm test`)
6. Commit your changes (`git commit -m 'Add amazing feature'`)
7. Push to the branch (`git push origin feature/amazing-feature`)
8. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support and questions:

- Create an issue in the repository
- Check the documentation in the `docs/` folder
- Review the API endpoints documentation
- Verify environment configuration

## 🎉 Features in Development

- [ ] Mobile app (React Native)
- [ ] Advanced analytics dashboard
- [ ] Multi-language support
- [ ] Social media integration
- [ ] Event recommendation system
- [ ] Advanced payment methods
- [ ] Real-time notifications
- [ ] Event streaming integration

---

**EventPass** - Making event booking simple, secure, and seamless! 🎟️✨

Built with ❤️ using modern web technologies.
