# EventPass API

A comprehensive event booking and ticketing system built with Node.js, TypeScript, and PostgreSQL. EventPass allows users to discover events, book tickets, make payments, and receive QR-coded tickets via email.

## 🎯 System Overview

EventPass is a full-stack event management platform that handles the complete event booking lifecycle:

- **Event Discovery**: Browse and search events by category, date, price, and location
- **User Management**: Secure authentication with role-based access (User, Organizer, Admin)
- **Booking System**: Two-phase booking process with ticket reservation and confirmation
- **Payment Integration**: Seamless Paystack integration for secure payments
- **Digital Tickets**: QR-coded tickets delivered via email for event entry
- **Event Management**: Comprehensive tools for event organizers to manage their events

## ✨ Key Features

### 🔐 Authentication & Authorization
- JWT-based authentication
- Role-based access control (User, Organizer, Admin)
- Password reset via email
- Secure password hashing with bcrypt

### 🎪 Event Management
- Create, read, update, delete events
- Event categorization and filtering
- Capacity management and availability tracking
- Event promotion QR codes
- Real-time event statistics

### 🎫 Booking System
- **Two-Phase Booking Process**:
  1. `startBooking`: Reserve tickets for 15 minutes
  2. `completeBooking`: Confirm booking after successful payment
- Automatic ticket availability management
- Booking reference system
- QR code generation for tickets
- Email confirmations with ticket attachments

### 💳 Payment Processing
- Paystack integration for secure payments
- Webhook handling for real-time payment updates
- Payment verification and tracking
- Refund processing capabilities
- Comprehensive payment analytics

### 📧 Communication System
- Email notifications for all booking stages
- Professional HTML email templates
- QR code attachments for tickets
- Password reset emails
- Welcome emails for new users

### 🚀 Performance & Security
- Redis caching for improved performance
- Rate limiting to prevent abuse
- Input validation and sanitization
- CORS and security headers
- Comprehensive error handling

## 🏗️ Technical Stack

### Backend Framework
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **TypeScript** - Type safety and better development experience

### Database & ORM
- **PostgreSQL** - Primary database
- **Prisma** - Database ORM and query builder
- **Redis** - Caching and session storage

### Authentication & Security
- **JWT** - JSON Web Tokens for authentication
- **bcryptjs** - Password hashing
- **Helmet** - Security headers
- **express-rate-limit** - Rate limiting
- **CORS** - Cross-origin resource sharing

### External Services
- **Paystack** - Payment processing
- **Nodemailer** - Email service
- **QRCode** - QR code generation

### Development & Deployment
- **Docker** - Containerization
- **Docker Compose** - Multi-service orchestration
- **Jest** - Testing framework
- **ESLint** - Code linting
- **Prisma Studio** - Database management UI

## 📁 Project Structure

\`\`\`
eventpass-api/
├── src/
│   ├── config/                 # Configuration files
│   │   ├── database.ts         # Prisma client setup
│   │   ├── env.ts             # Environment variables
│   │   └── redis.ts           # Redis client setup
│   │
│   ├── middleware/            # Express middleware
│   │   ├── auth.ts           # Authentication middleware
│   │   ├── error.ts          # Error handling middleware
│   │   ├── rateLimit.ts      # Rate limiting middleware
│   │   └── webhook.ts        # Webhook verification
│   │
│   ├── modules/              # Domain-specific modules
│   │   ├── auth/            # Authentication module
│   │   │   ├── auth.controller.ts
│   │   │   ├── auth.routes.ts
│   │   │   └── auth.service.ts
│   │   ├── bookings/        # Booking management
│   │   │   ├── bookings.controller.ts
│   │   │   ├── bookings.routes.ts
│   │   │   └── bookings.service.ts
│   │   ├── events/          # Event management
│   │   │   ├── events.controller.ts
│   │   │   ├── events.routes.ts
│   │   │   └── events.service.ts
│   │   └── payments/        # Payment processing
│   │       ├── payments.controller.ts
│   │       ├── payments.routes.ts
│   │       └── payments.service.ts
│   │
│   ├── routes/              # API route definitions
│   │   ├── auth.ts
│   │   ├── bookings.ts
│   │   ├── events.ts
│   │   ├── payments.ts
│   │   ├── qr.ts
│   │   └── webhooks.ts
│   │
│   ├── services/            # Shared business services
│   │   ├── cache.ts         # Redis caching service
│   │   ├── emailService.ts  # Email service with templates
│   │   ├── qrService.ts     # QR code generation
│   │   └── paystackService.ts # Paystack API wrapper
│   │
│   ├── utils/               # Utility functions
│   │   ├── crypto.ts        # Cryptographic utilities
│   │   └── http.ts          # HTTP response helpers
│   │
│   ├── types/               # TypeScript type definitions
│   │   └── index.ts
│   │
│   ├── scripts/             # Maintenance scripts
│   │   ├── cleanup-expired-bookings.ts
│   │   └── booking-scheduler.ts
│   │
│   └── index.ts             # Application entry point
│
├── prisma/                  # Database schema and migrations
│   ├── schema.prisma        # Database schema
│   └── migrations/          # Database migrations
│
├── config/                  # Infrastructure configuration
│   ├── nginx.conf          # Nginx configuration
│   ├── prometheus.yaml     # Monitoring configuration
│   └── redis.conf          # Redis configuration
│
├── docker-compose.dev.yaml  # Development environment
├── docker-compose.yaml      # Production environment
├── Dockerfile              # Production Docker image
├── Dockerfile.dev          # Development Docker image
└── Makefile               # Build and deployment scripts
\`\`\`

## 🔄 System Flows

### Authentication Flow
1. User registers with email and password
2. System sends welcome email
3. User logs in to receive JWT token
4. Token used for authenticated requests
5. Password reset available via email

### Event Booking Flow
1. **Event Discovery**: User browses available events
2. **Start Booking**: User initiates booking (tickets reserved for 15 minutes)
3. **Payment**: User redirected to Paystack for payment
4. **Webhook Processing**: Paystack notifies system of payment status
5. **Complete Booking**: System confirms booking and generates QR ticket
6. **Email Delivery**: Confirmation email sent with QR code attachment

### Event Management Flow
1. **Organizer Registration**: User registers with organizer role
2. **Event Creation**: Organizer creates event with details and capacity
3. **Event Promotion**: System generates QR code for event promotion
4. **Booking Management**: Real-time tracking of bookings and availability
5. **Analytics**: Comprehensive statistics and reporting

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- Docker and Docker Compose
- PostgreSQL (or use Docker)
- Redis (or use Docker)

### Installation

1. **Clone the repository**
   \`\`\`bash
   git clone <repository-url>
   cd eventpass-api
   \`\`\`

2. **Install dependencies**
   \`\`\`bash
   npm install
   \`\`\`

3. **Environment setup**
   \`\`\`bash
   cp .env.example .env
   # Edit .env with your configuration
   \`\`\`

4. **Start services with Docker**
   \`\`\`bash
   docker-compose -f docker-compose.dev.yaml up -d
   \`\`\`

5. **Run database migrations**
   \`\`\`bash
   npx prisma migrate dev --name init
   npx prisma generate
   \`\`\`

6. **Start the application**
   \`\`\`bash
   npm run dev
   \`\`\`

### Environment Variables

\`\`\`env
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
FRONTEND_URL="http://localhost:3000"

# Paystack
PAYSTACK_SECRET_KEY="sk_test_your_secret_key"
PAYSTACK_PUBLIC_KEY="pk_test_your_public_key"
PAYSTACK_WEBHOOK_SECRET="your_webhook_secret"

# Email Service
SMTP_HOST="smtp.gmail.com"
SMTP_PORT=587
SMTP_USER="your-email@gmail.com"
SMTP_PASS="your-app-password"
FROM_EMAIL="your-email@gmail.com"
FROM_NAME="EventPass"
\`\`\`

## 📚 API Documentation

### Base URL
\`\`\`
http://localhost:4000/api/v1
\`\`\`

### Authentication Endpoints

#### Register User
\`\`\`http
POST /auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123",
  "firstName": "John",
  "lastName": "Doe"
}
\`\`\`

#### Login User
\`\`\`http
POST /auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
\`\`\`

#### Get Profile
\`\`\`http
GET /auth/profile
Authorization: Bearer <jwt_token>
\`\`\`

### Event Endpoints

#### Get All Events
\`\`\`http
GET /events?page=1&limit=10&category=TECHNOLOGY&minPrice=0&maxPrice=100
\`\`\`

#### Create Event (Organizer only)
\`\`\`http
POST /events
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "title": "Tech Conference 2024",
  "description": "Annual tech conference",
  "venue": "Convention Center",
  "startDate": "2024-12-01T09:00:00Z",
  "endDate": "2024-12-01T17:00:00Z",
  "price": 50.00,
  "capacity": 100,
  "category": "TECHNOLOGY"
}
\`\`\`

#### Get Event Details
\`\`\`http
GET /events/:eventId
\`\`\`

### Booking Endpoints

#### Start Booking
\`\`\`http
POST /bookings/start
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "eventId": "event-uuid",
  "quantity": 2
}
\`\`\`

#### Complete Booking
\`\`\`http
POST /bookings/:bookingId/complete
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "paymentReference": "paystack-reference"
}
\`\`\`

#### Get User Bookings
\`\`\`http
GET /bookings/my/bookings
Authorization: Bearer <jwt_token>
\`\`\`

### Payment Endpoints

#### Initialize Payment
\`\`\`http
POST /payments/initialize
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "bookingId": "booking-uuid",
  "amount": 100.00
}
\`\`\`

#### Verify Payment
\`\`\`http
GET /payments/verify/:paymentReference
Authorization: Bearer <jwt_token>
\`\`\`

## 🧪 Testing

### Run Tests
\`\`\`bash
# Run all tests
npm test

# Run tests with coverage
npm run test:coverage

# Run specific test file
npm test auth.test.ts
\`\`\`

### API Testing with Postman

1. **Health Check**
   \`\`\`
   GET http://localhost:4000/api/v1/health
   \`\`\`

2. **Authentication Flow**
   - Register → Login → Get Profile

3. **Event Management**
   - Create Event → Get Events → Get Event Details

4. **Booking Flow**
   - Start Booking → Initialize Payment → Complete Booking

### Database Management

\`\`\`bash
# Open Prisma Studio
npx prisma studio

# Reset database
npx prisma migrate reset

# Generate Prisma client
npx prisma generate
\`\`\`

## 🐳 Docker Commands

\`\`\`bash
# Start development environment
make dev

# Start production environment
make prod

# View logs
docker-compose -f docker-compose.dev.yaml logs

# Stop services
docker-compose -f docker-compose.dev.yaml down

# Rebuild containers
docker-compose -f docker-compose.dev.yaml up --build
\`\`\`

## 🔧 Maintenance

### Cleanup Expired Bookings
\`\`\`bash
npm run cleanup:bookings
\`\`\`

### Database Backup
\`\`\`bash
npm run backup:db
\`\`\`

### Monitoring
- Prometheus metrics available at `/metrics`
- Health check at `/api/v1/health`
- Application logs via Docker

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new features
5. Run the test suite
6. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Check the documentation
- Review the API endpoints
- Verify environment configuration

---

**EventPass API** - Making event booking simple and secure! 🎟️
