# Admin Dashboard Metrics and Routes

## Overview

The EventPass system provides comprehensive admin functionality for managing events, bookings, payments, and users. Admin routes are protected by role-based access control.

## Admin Role Requirements

- **Role**: `ADMIN` or `SUPER_ADMIN`
- **Authentication**: JWT token required
- **Middleware**: `requireAdmin` middleware validates admin access

## Admin Routes Summary

### Bookings Management

```
GET    /api/v1/bookings/admin/all           - Get all bookings
GET    /api/v1/bookings/admin/statistics    - Get booking statistics
```

### Payments Management

```
GET    /api/v1/payments/admin/all           - Get all payments
GET    /api/v1/payments/admin/statistics    - Get payment statistics
POST   /api/v1/payments/admin/:paymentId/refund - Process refunds
```

### Events Management

```
GET    /api/v1/events/:eventId/statistics   - Get event statistics (organizer)
```

## Detailed Admin Endpoints

### 1. Bookings Management

#### Get All Bookings

**Endpoint**: `GET /api/v1/bookings/admin/all`
**Access**: Admin only
**Purpose**: Retrieve all bookings across the system

**Query Parameters**:

- `page` (optional): Page number for pagination
- `limit` (optional): Number of items per page
- `status` (optional): Filter by booking status
- `eventId` (optional): Filter by specific event
- `userId` (optional): Filter by specific user

**Response**:

```json
{
  "success": true,
  "message": "All bookings retrieved successfully",
  "data": {
    "bookings": [
      {
        "id": "booking_id",
        "bookingReference": "REF123456",
        "userId": "user_id",
        "eventId": "event_id",
        "quantity": 2,
        "totalAmount": 100.0,
        "status": "CONFIRMED",
        "createdAt": "2024-01-01T00:00:00Z",
        "user": {
          "id": "user_id",
          "email": "user@example.com",
          "firstName": "John",
          "lastName": "Doe"
        },
        "event": {
          "id": "event_id",
          "title": "Sample Event",
          "startDate": "2024-01-15T00:00:00Z",
          "venue": "Event Venue"
        }
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 100,
      "totalPages": 10
    }
  }
}
```

#### Get Booking Statistics

**Endpoint**: `GET /api/v1/bookings/admin/statistics`
**Access**: Admin only
**Purpose**: Get comprehensive booking analytics

**Response**:

```json
{
  "success": true,
  "message": "All booking statistics retrieved successfully",
  "data": {
    "totalBookings": 150,
    "totalTickets": 300,
    "totalRevenue": 15000.0,
    "statusBreakdown": {
      "pending": {
        "count": 10,
        "tickets": 20,
        "amount": 1000.0
      },
      "confirmed": {
        "count": 120,
        "tickets": 240,
        "amount": 12000.0
      },
      "cancelled": {
        "count": 20,
        "tickets": 40,
        "amount": 2000.0
      }
    },
    "recentBookings": [
      // Last 10 bookings
    ]
  }
}
```

### 2. Payments Management

#### Get All Payments

**Endpoint**: `GET /api/v1/payments/admin/all`
**Access**: Admin only
**Purpose**: Retrieve all payments across the system

**Query Parameters**:

- `page` (optional): Page number for pagination
- `limit` (optional): Number of items per page
- `status` (optional): Filter by payment status
- `method` (optional): Filter by payment method
- `dateFrom` (optional): Filter payments from date
- `dateTo` (optional): Filter payments to date

**Response**:

```json
{
  "success": true,
  "message": "All payments retrieved successfully",
  "data": {
    "payments": [
      {
        "id": "payment_id",
        "bookingId": "booking_id",
        "amount": 100.0,
        "currency": "NGN",
        "status": "SUCCESS",
        "method": "PAYSTACK",
        "reference": "paystack_ref",
        "createdAt": "2024-01-01T00:00:00Z",
        "booking": {
          "id": "booking_id",
          "bookingReference": "REF123456",
          "user": {
            "email": "user@example.com",
            "firstName": "John",
            "lastName": "Doe"
          },
          "event": {
            "title": "Sample Event"
          }
        }
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 100,
      "totalPages": 10
    }
  }
}
```

#### Get Payment Statistics

**Endpoint**: `GET /api/v1/payments/admin/statistics`
**Access**: Admin only
**Purpose**: Get comprehensive payment analytics

**Response**:

```json
{
  "success": true,
  "message": "All payment statistics retrieved successfully",
  "data": {
    "totalPayments": 120,
    "totalAmount": 12000.0,
    "successfulPayments": 100,
    "failedPayments": 20,
    "successRate": 83.33,
    "statusBreakdown": {
      "success": {
        "count": 100,
        "amount": 10000.0
      },
      "failed": {
        "count": 20,
        "amount": 2000.0
      }
    },
    "methodBreakdown": {
      "paystack": {
        "count": 120,
        "amount": 12000.0
      }
    },
    "recentPayments": [
      // Last 10 payments
    ]
  }
}
```

#### Process Refund

**Endpoint**: `POST /api/v1/payments/admin/:paymentId/refund`
**Access**: Admin only
**Purpose**: Process payment refunds

**Request Body**:

```json
{
  "reason": "Customer request",
  "amount": 50.0
}
```

**Response**:

```json
{
  "success": true,
  "message": "Refund processed successfully",
  "data": {
    "refundId": "refund_id",
    "paymentId": "payment_id",
    "amount": 50.0,
    "status": "PROCESSING",
    "reason": "Customer request"
  }
}
```

### 3. Events Management

#### Get Event Statistics

**Endpoint**: `GET /api/v1/events/:eventId/statistics`
**Access**: Event organizer or Admin
**Purpose**: Get detailed statistics for a specific event

**Response**:

```json
{
  "success": true,
  "message": "Event statistics retrieved successfully",
  "data": {
    "eventId": "event_id",
    "eventTitle": "Sample Event",
    "totalCapacity": 100,
    "ticketsSold": 75,
    "ticketsAvailable": 25,
    "occupancyRate": 75.0,
    "totalRevenue": 7500.0,
    "bookingBreakdown": {
      "pending": 5,
      "confirmed": 70,
      "cancelled": 10
    },
    "recentBookings": [
      // Last 10 bookings for this event
    ]
  }
}
```

## Admin Dashboard Frontend Implementation

### Required Frontend Components

#### 1. Dashboard Overview

```typescript
interface DashboardStats {
  totalBookings: number;
  totalRevenue: number;
  totalEvents: number;
  totalUsers: number;
  recentActivity: Activity[];
}
```

#### 2. Bookings Management

- **Bookings Table**: Sortable, filterable table of all bookings
- **Booking Details**: Modal with full booking information
- **Status Management**: Update booking status
- **Export Functionality**: Export bookings to CSV/Excel

#### 3. Payments Management

- **Payments Table**: All payments with filtering
- **Refund Processing**: Interface for processing refunds
- **Payment Analytics**: Charts and graphs for payment trends
- **Revenue Reports**: Daily, weekly, monthly revenue reports

#### 4. Events Management

- **Events Overview**: All events with statistics
- **Event Analytics**: Individual event performance
- **Event Management**: Create, edit, delete events (if admin)

### Frontend Routes Structure

```
/admin
├── /dashboard          - Overview dashboard
├── /bookings          - Bookings management
│   ├── /all           - All bookings table
│   └── /statistics    - Booking analytics
├── /payments          - Payments management
│   ├── /all           - All payments table
│   ├── /statistics    - Payment analytics
│   └── /refunds       - Refund processing
├── /events            - Events management
│   ├── /all           - All events
│   └── /:id/analytics - Event-specific analytics
└── /users             - User management (future)
```

## Security and Access Control

### Admin Middleware

```typescript
// requireAdmin middleware
export const requireAdmin = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const user = req.user; // From JWT authentication

  if (!user || (user.role !== "ADMIN" && user.role !== "SUPER_ADMIN")) {
    return HttpResponse.forbidden(res, "Admin access required");
  }

  next();
};
```

### Role Hierarchy

- **USER**: Regular users, can book events
- **ORGANIZER**: Can create and manage their own events
- **ADMIN**: Can view all data, process refunds
- **SUPER_ADMIN**: Full system access (future expansion)

## Analytics and Reporting

### Key Metrics to Track

#### Booking Metrics

- Total bookings by status
- Booking conversion rates
- Average booking value
- Booking trends over time
- Popular event categories

#### Payment Metrics

- Total revenue
- Payment success rates
- Refund rates
- Payment method distribution
- Revenue trends

#### Event Metrics

- Event performance
- Capacity utilization
- Event popularity rankings
- Organizer performance

### Reporting Features

- **Real-time Dashboard**: Live updates of key metrics
- **Scheduled Reports**: Daily/weekly/monthly reports
- **Export Functionality**: CSV, Excel, PDF exports
- **Custom Date Ranges**: Flexible reporting periods
- **Data Visualization**: Charts and graphs

## Implementation Notes

### Database Queries

- Use efficient queries with proper indexing
- Implement pagination for large datasets
- Cache frequently accessed statistics
- Use database views for complex analytics

### Performance Considerations

- Implement caching for statistics
- Use background jobs for heavy calculations
- Optimize database queries
- Implement rate limiting for admin endpoints

### Error Handling

- Graceful handling of failed queries
- Proper error messages for admin users
- Logging of admin actions for audit trails
- Fallback data for failed analytics

## Future Enhancements

### Planned Features

- **User Management**: Admin interface for user management
- **System Settings**: Global system configuration
- **Audit Logs**: Track all admin actions
- **Advanced Analytics**: Machine learning insights
- **Multi-tenant Support**: Support for multiple organizations
- **API Rate Limiting**: Advanced rate limiting for admin APIs
- **Real-time Notifications**: WebSocket updates for admin dashboard
