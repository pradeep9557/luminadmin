# Lumin Guide Admin Panel - API Endpoints Documentation

## Base URL
```
https://api.luminguide.com/v1/admin
```

---

## 🔐 Authentication

### POST `/auth/login`
Login to admin panel
```json
{
  "email": "admin@luminguide.com",
  "password": "password123"
}
```

### POST `/auth/logout`
Logout from admin panel

### POST `/auth/refresh-token`
Refresh authentication token

### POST `/auth/forgot-password`
Request password reset email

### POST `/auth/reset-password`
Reset password with token

### GET `/auth/verify-2fa`
Verify two-factor authentication code

---

## 📊 Dashboard

### GET `/dashboard/stats`
Get overview statistics
```json
{
  "totalRevenue": 45420,
  "activeUsers": 2847,
  "totalOrders": 1523,
  "conversionRate": 3.2
}
```

### GET `/dashboard/revenue-chart`
Get revenue data for chart (params: `period=7d|30d|90d|1y`)

### GET `/dashboard/user-growth`
Get user growth data (params: `period=7d|30d|90d|1y`)

### GET `/dashboard/recent-orders`
Get recent orders list (params: `limit=10`)

### GET `/dashboard/top-services`
Get top performing services

### GET `/dashboard/top-products`
Get top selling products

---

## 👥 Users Management

### GET `/users`
Get all users with pagination and filters
- Query params: `page`, `limit`, `search`, `role`, `subscription`, `status`

### GET `/users/:id`
Get single user by ID

### POST `/users`
Create new user
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "+1234567890",
  "role": "customer",
  "subscription": "free"
}
```

### PUT `/users/:id`
Update user details

### DELETE `/users/:id`
Delete user account

### PATCH `/users/:id/status`
Update user status (active/inactive/suspended)

### PATCH `/users/:id/subscription`
Update user subscription plan

### GET `/users/:id/orders`
Get user's order history

### GET `/users/:id/activity`
Get user activity logs

### POST `/users/bulk-delete`
Delete multiple users
```json
{
  "userIds": [1, 2, 3, 4]
}
```

### POST `/users/export`
Export users to CSV/Excel (params: `format=csv|excel`)

---

## 📦 Orders Management

### GET `/orders`
Get all orders with pagination and filters
- Query params: `page`, `limit`, `search`, `status`, `paymentStatus`, `startDate`, `endDate`

### GET `/orders/:id`
Get single order details

### POST `/orders`
Create new order
```json
{
  "userId": 123,
  "items": [
    {
      "type": "service",
      "serviceId": 5,
      "quantity": 1,
      "price": 49.99
    }
  ],
  "paymentMethod": "stripe",
  "shippingAddress": { ... }
}
```

### PUT `/orders/:id`
Update order details

### PATCH `/orders/:id/status`
Update order status
```json
{
  "status": "processing|shipped|delivered|cancelled"
}
```

### PATCH `/orders/:id/payment-status`
Update payment status
```json
{
  "paymentStatus": "pending|paid|failed|refunded"
}
```

### DELETE `/orders/:id`
Cancel/delete order

### POST `/orders/:id/refund`
Process order refund

### GET `/orders/:id/tracking`
Get order tracking information

### POST `/orders/bulk-update-status`
Update multiple order statuses

### POST `/orders/export`
Export orders data

---

## 🔮 Services Management

### GET `/services`
Get all services with filters
- Query params: `page`, `limit`, `search`, `category`, `status`, `priceRange`

### GET `/services/:id`
Get single service details

### POST `/services`
Create new service
```json
{
  "name": "Birth Chart Reading",
  "description": "Detailed birth chart analysis",
  "category": "astrology",
  "price": 49.99,
  "duration": 60,
  "status": "active",
  "image": "https://...",
  "features": ["Feature 1", "Feature 2"]
}
```

### PUT `/services/:id`
Update service details

### DELETE `/services/:id`
Delete service

### PATCH `/services/:id/status`
Update service status (active/inactive)

### GET `/services/categories`
Get all service categories

### POST `/services/:id/duplicate`
Duplicate existing service

### GET `/services/:id/bookings`
Get all bookings for a service

### GET `/services/:id/revenue`
Get revenue analytics for a service

---

## 🛍️ Products Management

### GET `/products`
Get all products with filters
- Query params: `page`, `limit`, `search`, `category`, `status`, `inStock`

### GET `/products/:id`
Get single product details

### POST `/products`
Create new product
```json
{
  "name": "Crystal Set",
  "description": "Premium healing crystals",
  "category": "crystals",
  "price": 29.99,
  "stock": 50,
  "images": ["url1", "url2"],
  "status": "active",
  "sku": "CRY-001"
}
```

### PUT `/products/:id`
Update product details

### DELETE `/products/:id`
Delete product

### PATCH `/products/:id/stock`
Update product stock
```json
{
  "stock": 100,
  "operation": "set|add|subtract"
}
```

### PATCH `/products/:id/status`
Update product status

### GET `/products/categories`
Get all product categories

### GET `/products/low-stock`
Get products with low stock (params: `threshold=10`)

### POST `/products/bulk-update-price`
Update prices for multiple products

### POST `/products/export`
Export products data

---

## 💎 Subscription Plans

### GET `/subscriptions/plans`
Get all subscription plans

### GET `/subscriptions/plans/:id`
Get single plan details

### POST `/subscriptions/plans`
Create new subscription plan
```json
{
  "name": "Premium",
  "price": 19.99,
  "billingPeriod": "monthly",
  "features": [
    "Unlimited readings",
    "Priority support",
    "Exclusive content"
  ],
  "status": "active"
}
```

### PUT `/subscriptions/plans/:id`
Update subscription plan

### DELETE `/subscriptions/plans/:id`
Delete subscription plan

### GET `/subscriptions/subscribers`
Get all subscribers (params: `planId`, `status`)

### GET `/subscriptions/:id`
Get single subscription details

### POST `/subscriptions/:id/cancel`
Cancel subscription

### POST `/subscriptions/:id/upgrade`
Upgrade subscription plan

### GET `/subscriptions/revenue`
Get subscription revenue analytics

### GET `/subscriptions/churn-rate`
Get subscription churn rate

---

## 📈 Analytics

### GET `/analytics/overview`
Get overall analytics overview (params: `period=7d|30d|90d|1y`)

### GET `/analytics/revenue`
Get revenue analytics with breakdown

### GET `/analytics/users`
Get user analytics (growth, demographics, behavior)

### GET `/analytics/orders`
Get order analytics (trends, patterns)

### GET `/analytics/services`
Get service performance analytics

### GET `/analytics/products`
Get product sales analytics

### GET `/analytics/conversion`
Get conversion funnel data

### GET `/analytics/retention`
Get user retention metrics

### GET `/analytics/top-performers`
Get top performing items (services/products)

### GET `/analytics/geographic`
Get geographic distribution of users/orders

### POST `/analytics/export`
Export analytics report

---

## 🔔 Notifications

### GET `/notifications`
Get all notifications
- Query params: `page`, `limit`, `read`, `category`, `startDate`

### GET `/notifications/unread-count`
Get unread notifications count

### POST `/notifications`
Create new notification
```json
{
  "title": "New Order",
  "message": "Order #12345 received",
  "type": "info|success|warning",
  "category": "order|payment|user|inventory|service"
}
```

### PATCH `/notifications/:id/read`
Mark notification as read

### PATCH `/notifications/mark-all-read`
Mark all notifications as read

### DELETE `/notifications/:id`
Delete notification

### POST `/notifications/bulk-delete`
Delete multiple notifications

### GET `/notifications/settings`
Get notification preferences

### PUT `/notifications/settings`
Update notification preferences

---

## 💳 Payment Gateways

### GET `/payments/gateways`
Get all payment gateway configurations

### GET `/payments/gateways/:id`
Get single gateway configuration

### POST `/payments/gateways/:id/connect`
Connect payment gateway
```json
{
  "publicKey": "pk_test_...",
  "secretKey": "sk_test_...",
  "environment": "sandbox|live",
  "webhooksEnabled": true
}
```

### PUT `/payments/gateways/:id/configure`
Update gateway configuration

### DELETE `/payments/gateways/:id/disconnect`
Disconnect payment gateway

### GET `/payments/transactions`
Get all transactions (params: `gateway`, `status`, `startDate`, `endDate`)

### GET `/payments/transactions/:id`
Get single transaction details

### POST `/payments/:id/refund`
Process payment refund

### GET `/payments/gateway-logs`
Get payment gateway logs

### POST `/payments/test-connection`
Test payment gateway connection

---

## ⚙️ Settings

### GET `/settings/general`
Get general settings

### PUT `/settings/general`
Update general settings
```json
{
  "platformName": "Lumin Guide",
  "adminEmail": "admin@luminguide.com",
  "contactEmail": "support@luminguide.com",
  "timezone": "UTC-5",
  "language": "en"
}
```

### GET `/settings/email`
Get email configuration

### PUT `/settings/email`
Update email settings

### POST `/settings/email/test`
Send test email

### GET `/settings/security`
Get security settings

### PUT `/settings/security/password`
Update admin password

### PUT `/settings/security/2fa`
Enable/disable 2FA

### GET `/settings/security/login-history`
Get login history

### GET `/settings/appearance`
Get appearance settings

### PUT `/settings/appearance`
Update appearance settings
```json
{
  "primaryColor": "#0048ff",
  "secondaryColor": "#090838",
  "logo": "https://...",
  "favicon": "https://...",
  "darkMode": false
}
```

### GET `/settings/notifications`
Get notification preferences

### PUT `/settings/notifications`
Update notification preferences

---

## 📧 Email Templates

### GET `/email-templates`
Get all email templates

### GET `/email-templates/:id`
Get single email template

### PUT `/email-templates/:id`
Update email template

### POST `/email-templates/:id/preview`
Preview email template

### POST `/email-templates/:id/test-send`
Send test email

---

## 📤 File Upload

### POST `/upload/image`
Upload image file
- Accepts: `multipart/form-data`
- Returns: `{ "url": "https://..." }`

### POST `/upload/document`
Upload document file

### DELETE `/upload/:id`
Delete uploaded file

---

## 📊 Reports

### GET `/reports/sales`
Get sales report (params: `startDate`, `endDate`, `groupBy=day|week|month`)

### GET `/reports/revenue`
Get revenue report

### GET `/reports/users`
Get users report

### GET `/reports/inventory`
Get inventory report

### GET `/reports/subscriptions`
Get subscriptions report

### POST `/reports/generate`
Generate custom report

### POST `/reports/schedule`
Schedule automated report

---

## 🔍 Search

### GET `/search`
Global search across all entities
- Query params: `q`, `type=users|orders|products|services`, `limit`

### GET `/search/suggestions`
Get search suggestions

---

## 🌐 Webhooks

### GET `/webhooks`
Get all webhook configurations

### POST `/webhooks`
Create webhook
```json
{
  "url": "https://example.com/webhook",
  "events": ["order.created", "user.registered"],
  "active": true
}
```

### PUT `/webhooks/:id`
Update webhook

### DELETE `/webhooks/:id`
Delete webhook

### GET `/webhooks/:id/logs`
Get webhook delivery logs

### POST `/webhooks/:id/test`
Test webhook

---

## 📱 Mobile App Management

### GET `/mobile-app/users`
Get mobile app user statistics

### GET `/mobile-app/sessions`
Get active sessions data

### POST `/mobile-app/push-notification`
Send push notification to mobile users

### GET `/mobile-app/versions`
Get app version information

---

## 🎫 Coupon/Discount Management

### GET `/coupons`
Get all coupons

### POST `/coupons`
Create coupon
```json
{
  "code": "SAVE20",
  "discountType": "percentage|fixed",
  "discountValue": 20,
  "expiryDate": "2026-12-31",
  "usageLimit": 100,
  "minOrderAmount": 50
}
```

### PUT `/coupons/:id`
Update coupon

### DELETE `/coupons/:id`
Delete coupon

### GET `/coupons/:id/usage`
Get coupon usage statistics

---

## 👨‍💼 Admin Users

### GET `/admin-users`
Get all admin users

### POST `/admin-users`
Create admin user

### PUT `/admin-users/:id`
Update admin user

### DELETE `/admin-users/:id`
Delete admin user

### PUT `/admin-users/:id/permissions`
Update admin permissions

---

## 📝 Reviews & Ratings

### GET `/reviews`
Get all reviews (params: `productId`, `serviceId`, `rating`, `status`)

### GET `/reviews/:id`
Get single review

### PATCH `/reviews/:id/status`
Approve/reject review

### DELETE `/reviews/:id`
Delete review

### POST `/reviews/:id/reply`
Reply to review

---

## 🎯 Marketing

### GET `/marketing/campaigns`
Get all marketing campaigns

### POST `/marketing/campaigns`
Create marketing campaign

### GET `/marketing/email-lists`
Get email subscriber lists

### POST `/marketing/send-bulk-email`
Send bulk marketing email

---

## 🔧 System

### GET `/system/health`
Check system health status

### GET `/system/logs`
Get system logs

### POST `/system/backup`
Create system backup

### GET `/system/version`
Get API version info

---

## Error Responses

All endpoints return standard error responses:

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human readable error message",
    "details": { ... }
  }
}
```

### Common HTTP Status Codes:
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `422` - Validation Error
- `500` - Internal Server Error

---

## Rate Limiting

- **Rate Limit:** 1000 requests per hour per API key
- **Headers:**
  - `X-RateLimit-Limit`: 1000
  - `X-RateLimit-Remaining`: 999
  - `X-RateLimit-Reset`: 1640000000

---

## Authentication

All API requests require authentication using Bearer token:

```
Authorization: Bearer YOUR_API_TOKEN
```

---

## Pagination

List endpoints support pagination:

**Query Parameters:**
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 20, max: 100)

**Response:**
```json
{
  "data": [ ... ],
  "pagination": {
    "currentPage": 1,
    "totalPages": 10,
    "totalItems": 200,
    "itemsPerPage": 20
  }
}
```

---

**Total Endpoints:** 150+

This comprehensive API documentation covers all major features of the Lumin Guide Admin Panel.
