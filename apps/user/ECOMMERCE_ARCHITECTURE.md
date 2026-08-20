# Bandhan — Ecommerce Platform Architecture

## 1. System Architecture

```
[Next.js Frontend] ←→ [Express Backend] ←→ [MongoDB]
       ↕                       ↕
  [Redux RTK Query]      [Razorpay] [Shiprocket]
                         [Cloudinary] [Nodemailer]
                         [Firebase Push] [SMS Gateway]
```

## 2. User Roles

| Role | Permissions |
|------|------------|
| Guest | Browse products/services/venues, search, view details |
| User (Buyer) | All Guest + Add to cart, checkout, pay, order tracking, reviews, wishlist, chat, quote requests, bookings |
| Seller | Manage products, view/process orders, earnings dashboard, customer chat |
| Admin | Manage all users, products, orders, categories, banners, blogs, commissions, refunds, disputes, analytics |
| Sub-Admin | Limited product/order moderation, support tickets |
| Support/Finance | Process refunds, handle tickets, view transactions |

## 3. Product System

### 3.1 Product Types
```
Product
├── Physical Product
│   ├── Buy (one-time purchase, full payment)
│   ├── Rent (temporary, deposit + rental period + return)
│   └── Both (user picks mode at checkout)
├── Service (intangible, quote-based, chat negotiation)
└── Venue (location, time-slot booking, invoice)
```

### 3.2 Product Data Model
```
{
  _id, title, description, category, subcategory,
  images[], thumbnail, productType: "sale" | "rent" | "both",
  salePrice, rentPrice (per day/month),
  rentDeposit, stock, sku, variants[],
  seller (ref: User),
  featured, status: "active" | "inactive" | "pending",
  tags[], rating, reviewCount, location,
  createdAt, updatedAt
}
```

### 3.3 Search & Filters
- Category / Subcategory
- Price range (min-max)
- Product type (buy | rent | both)
- Rating (4+, 3+)
- Location
- Seller (verified)
- In stock
- Sort: Relevance | Price low-high | Price high-low | Rating | Newest

## 4. Complete Order Lifecycles

### 4.1 Buy Order
```
CART → PENDING → PAID → PROCESSING → SHIPPED → DELIVERED → COMPLETED
                                                        ↓
                                                   CAN RETURN
                                                        ↓
                                              RETURN REQUESTED → APPROVED → PICKED UP
                                                                                 ↓
                                                                            REFUNDED → CLOSED
```

### 4.2 Rent Order
```
CART → PENDING → PAID → PROCESSING → SHIPPED → DELIVERED → IN USE (rental period)
                                                                        ↓
                                                             RETURN INITIATED → PICKED UP
                                                                                     ↓
                                                                               INSPECTING
                                                                              ↙         ↘
                                                                         COMPLETED    DAMAGE CHARGED
                                                                         (deposit     (partial deposit)
                                                                          released)
```

### 4.3 Service Booking
```
QUOTE REQUESTED → CHAT NEGOTIATION → QUOTE ACCEPTED → BOOKED → PAID
                                                                    ↓
                                                              IN PROGRESS → COMPLETED → REVIEWED
```

### 4.4 Venue Booking
```
VENUE SELECTED → DATE + GUESTS → CHECK AVAILABILITY → BOOKING CART → PAID
                                                                        ↓
                                                                  INVOICE GENERATED
                                                                        ↓
                                                                  CONFIRMED → EVENT DATE → COMPLETED → REVIEWED
```

## 5. Cart & Checkout Flow

```
┌─────────────┐
│    CART     │
│ Mixed items:│
│ • Product(buy)  │
│ • Product(rent) │── with delivery & return dates
│ • Service       │── quote reference
│ • Venue         │── date + guests
└──────┬──────┘
       ↓
┌─────────────┐
│  CHECKOUT   │
│ 1. Address  │── shipping/billing
│ 2. Payment  │── Card / UPI / NetBanking / Wallet / EMI
│ 3. Coupon   │── discount code
│ 4. Summary  │── item totals + fees + tax
│ 5. PAY      │── Razorpay order → payment → verify
└──────┬──────┘
       ↓
┌─────────────┐
│ POST-PAY    │
│ • Order created  │
│ • Invoice PDF    │
│ • Email + SMS    │
│ • Push notification │
│ • Redirect to orders │
└────────────────┘
```

## 6. Payment System

```
Razorpay (primary gateway)
├── Credit/Debit Card
├── Net Banking
├── UPI / QR
├── Wallet
└── EMI (3/6/9/12 months via partner banks)

Flow:
  Checkout → Create Razorpay Order → Open Checkout Modal
  → User Pays → Verify Signature (server-side) → Update Order
  → Webhook (fallback) → Confirm Payment

Refunds:
  Return Approved → Initiate Refund via Razorpay → Refund to Source

Seller Payouts:
  Order Completed → Deduct Commission → Add to Seller Balance
  → Seller Requests Withdrawal → Admin Approves → Razorpay Payout
```

## 7. In-Platform Chat (Service Negotiation)

```
Quote Request → Auto-create Conversation Thread
  ├── User (customer) → Seller
  ├── Messages: text, images, structured Quote Cards
  ├── Quote Card:
  │   ├── Service name, description
  │   ├── Price breakdown
  │   ├── Timeline
  │   └── [Accept] [Decline] [Counter] buttons
  ├── On Accept → Booking created + Payment triggered
  └── Notifications: push + email on new message
```

## 8. Shipping System (Shiprocket)

```
Order Processed → Create Shipment via Shiprocket API
  → Generate AWB Number → Tracking ID
  → Update Order with tracking info
  → Webhook on status changes
  → User tracks in dashboard

Tracking States:
  PICKED → IN_TRANSIT → OUT_FOR_DELIVERY → DELIVERED → RETURNED
```

## 9. Invoice System

```
Order Confirmed → Invoice Number (INV-YYYYMMDD-XXXXX)
  → Generate PDF (PDFKit) → Upload to Cloudinary
  → Email to Customer → Available in Dashboard

Invoice contains:
  ├── Invoice no, date
  ├── Seller details
  ├── Buyer details
  ├── Item(s): name, qty, unit price, total
  ├── Subtotal, tax (GST 18%), service fee, discount
  ├── Total paid
  ├── Payment method, transaction ID
  └── For rent: delivery date, return date, deposit
```

## 10. Database Collections (Ecommerce Only)

```
users              - All user roles (role field discriminator)
products           - Physical & digital products
categories         - Product categories
subcategories      - Subcategories
carts              - User shopping carts (one per user)
orders             - Buy/rent orders
bookings           - Service & venue bookings
order_items        - Individual line items
payments           - All transactions
reviews            - Product/service/venue reviews
wishlists          - Saved items (user can save products/services/venues)
conversations      - Chat threads (quote negotiation)
messages           - Chat messages
quotes             - Service quote requests
shipping           - Addresses & tracking info
returns            - Return requests (buy & rent)
invoices           - Generated invoices
notifications      - In-app notifications
banners            - Homepage promotional banners
blogs              - Content articles
posts              - Community feed posts
commissions        - Commission rules (category-wise)
earnings           - Seller earnings & payouts
support_tickets    - Customer support
activities         - User action log
```

## 11. Complete API Endpoints

```
### Auth
POST   /api/auth/signup
POST   /api/auth/login
POST   /api/auth/social-login
POST   /api/auth/send-otp
POST   /api/auth/verify-otp
POST   /api/auth/reset-password

### Users
GET    /api/users/profile
PATCH  /api/users/profile
GET    /api/users/dashboard

### Categories
GET    /api/categories
GET    /api/categories/:id/subcategories

### Products
GET    /api/products          (search, filter, paginate)
GET    /api/products/:id      (detail)
POST   /api/products          (seller create)
PUT    /api/products/:id      (seller update)
DELETE /api/products/:id      (seller delete)

### Cart
GET    /api/cart
POST   /api/cart/add          (productId, quantity, mode: buy/rent, deliveryDate, returnDate)
PUT    /api/cart/update       (itemId, quantity)
DELETE /api/cart/remove/:id
DELETE /api/cart/clear

### Orders
GET    /api/orders            (user's orders)
GET    /api/orders/:id        (detail)
POST   /api/orders/create     (cartId, addressId, paymentMethod)
PUT    /api/orders/:id/cancel
PUT    /api/orders/:id/status (seller/admin update)

### Checkout
POST   /api/checkout          (create order + payment)

### Payments
GET    /api/payment/key       (Razorpay key)
POST   /api/payment/create-order
POST   /api/payment/verify
POST   /api/payment/webhook   (Razorpay webhook)

### Wishlist
GET    /api/wishlist
POST   /api/wishlist/add      (entityId, entityType: product/service/venue)
DELETE /api/wishlist/remove/:entityType/:entityId

### Quotes (Services)
GET    /api/quote             (user's quotes)
POST   /api/quote             (create quote request)
PUT    /api/quote/:id         (update status: accepted/declined)

### Chat
POST   /api/chat/conversation/create  (sellerId, customerId, quoteId)
GET    /api/chat/conversation         (user's conversations)
GET    /api/chat/message/:conversationId
POST   /api/chat/message/:conversationId  (send message)
PUT    /api/chat/seen/:conversationId

### Bookings (Services + Venues)
GET    /api/bookings/user
POST   /api/bookings          (serviceId/venueId, date, guests, quoteId)
GET    /api/bookings/:id

### Venues
GET    /api/venues            (list with filters)
GET    /api/venues/:id        (detail)
POST   /api/venues/check-availability  (venueId, date)

### Reviews
GET    /api/reviews/:entityType/:entityId
POST   /api/reviews           (entityType, entityId, rating, text, images)
DELETE /api/reviews/:id

### Shipping
POST   /api/shipping/create   (orderId, address)
GET    /api/shipping/tracking/:orderId

### Returns
POST   /api/returns           (orderId, reason, items)
GET    /api/returns/:id
PUT    /api/returns/:id/status (admin: approve/reject)

### Invoices
GET    /api/invoices/:orderId

### Notifications
GET    /api/notifications
PUT    /api/notifications/read/:id
PUT    /api/notifications/read-all

### Banners
GET    /api/banners

### Blogs
GET    /api/blogs
GET    /api/blogs/:slug
POST   /api/blogs             (admin)
PUT    /api/blogs/:id         (admin)
DELETE /api/blogs/:id         (admin)

### Support Tickets
POST   /api/support/tickets
GET    /api/support/tickets
PUT    /api/support/tickets/:id (admin reply/close)

### Seller
GET    /api/seller/dashboard
GET    /api/seller/products
GET    /api/seller/orders
GET    /api/seller/earnings
POST   /api/seller/withdraw

### Admin
GET    /api/admin/dashboard
GET    /api/admin/users
PUT    /api/admin/users/:id/status
GET    /api/admin/products
PUT    /api/admin/products/:id/status
GET    /api/admin/orders
PUT    /api/admin/orders/:id/status
GET    /api/admin/analytics
GET    /api/admin/commissions
PUT    /api/admin/commissions
```

## 12. Frontend Routes

```
### Public
/                          Homepage (landing, banners, featured)
/products                  Product catalog (search, filter, grid)
/products/[id]             Product detail (buy/rent toggle, dates)
/products/service-listing  Service catalog
/products/Services/[id]    Service detail (request quote)
/products/Venue            Venue catalog
/products/Venue/[id]       Venue detail (date, guests, book)
/login                     Login
/signup                    Signup
/forgot-password           Reset password

### User Dashboard (authenticated)
/userdashboard             Overview (orders count, wishlist, recent)
/userdashboard/profile     Profile settings
/userdashboard/cart        Shopping cart
/userdashboard/checkout    Checkout + pay
/userdashboard/orders      Order history
/userdashboard/booking     Bookings (services + venues)
/userdashboard/wishlist    Saved items
/userdashboard/quote       Quote requests
/userdashboard/inbox       Chat conversations
/userdashboard/tracking    Order/shipping tracking
/userdashboard/reviews     My reviews
/userdashboard/notification Notifications
/userdashboard/blogs       Blog list
/userdashboard/blogs/[id]  Blog detail
/userdashboard/invoice     Invoice downloads

### Seller Panel
/seller/dashboard          Overview
/seller/products           My products (CRUD)
/seller/orders             Orders to fulfill
/seller/earnings           Revenue, payouts, withdraw
/seller/inbox              Customer chats
/seller/quotes             Quote management
/seller/profile            Business profile

### Admin Panel
/admin/dashboard           Platform overview
/admin/users               Manage all users
/admin/products            Approve/reject products
/admin/categories          Manage categories
/admin/orders              All orders
/admin/banners             Homepage banners
/admin/blogs               Blog CRUD
/admin/commissions         Commission rules
/admin/analytics           Sales reports
/admin/support             Support tickets
/admin/settings            Platform settings
```

## 13. User Dashboard Layout

```
SIDEBAR (collapsible)
├── Overview
├── My Orders
├── My Bookings
├── Shopping Cart
├── Wishlist
├── Quote Requests
├── Messages (Inbox)
├── Order Tracking
├── My Reviews
├── Notifications
├── Blogs
└── Profile Settings
```

## 14. Seller Panel Layout

```
SIDEBAR
├── Dashboard (sales, orders, visitors)
├── Products (add/edit/list)
├── Orders (new → process → ship)
├── Rent Orders (delivery/return timeline)
├── Earnings (revenue, commission, withdraw)
├── Chat Inbox (customer conversations)
├── Quotes (send to customers)
└── Profile
```

## 15. Admin Panel Layout

```
SIDEBAR
├── Dashboard (platform stats)
├── User Management (buyers, sellers)
├── Product Management (approve, feature, moderate)
├── Categories (manage hierarchy)
├── Order Management (all orders, update status)
├── Content (banners, blogs)
├── Commissions (category rates)
├── Finance (transactions, payouts, refunds)
├── Support Tickets
├── Analytics (sales reports, charts)
└── Settings
```

## 16. Security

```
├── JWT auth (access + refresh tokens)
├── RBAC middleware per route
├── Rate limiting on auth endpoints
├── Input validation (express-validator)
├── File upload validation (type, size)
├── CORS (whitelist domains)
├── Helmet (security headers)
├── Password hashing (bcrypt, 12 rounds)
├── OTP expiry + rate limits
└── Activity logging
```

## 17. Performance

```
├── Redis caching (frequent queries, sessions)
├── MongoDB indexing
├── Pagination on all list endpoints
├── Image optimization + CDN (Cloudinary)
├── Next.js SSR for public pages
├── Lazy loading + code splitting
└── Response compression
```

## 18. Complete Walkthrough Examples

### User buys a product on rent
```
1. /products → filter "Rent" → browse cards with discount badges
2. Click card → /products/[id] → toggle to "Rent" mode
3. Pick delivery date + return date → see rent price + deposit
4. "Add to Cart" → /userdashboard/cart → see item with dates
5. "Checkout" → enter shipping address → select "UPI"
6. See order summary → "Pay Now" → Razorpay opens
7. Pay → verify → order created → email + notification
8. Seller ships → tracking updates → user tracks in dashboard
9. Product delivered → "In Use" status → rental period
10. Return initiated → pickup → inspect → deposit released
11. Write review
```

### User requests service quote & negotiates
```
1. /products/service-listing → browse → click service
2. /products/Services/[id] → "Request Quote"
3. Fill form: describe requirements → submit
4. Quote created → auto-creates chat with seller
5. /userdashboard/inbox → new conversation appears
6. User: "Can you do this for ₹5000?"
7. Seller: "I can offer ₹5500 with these add-ons..."
8. Seller sends Quote Card → [Accept] [Decline] [Counter]
9. User clicks Accept → booking created → pay → confirmed
10. Service delivered → review
```

### User books a venue
```
1. /products/Venue → browse with filters → click venue
2. /products/Venue/[id] → see details + calendar
3. Pick date + guest count → "Check Availability"
4. Available → "Book Now" → added to booking cart
5. /userdashboard/cart → review → checkout → pay
6. Invoice generated (PDF) → emailed + downloadable
7. On event date → venue completed → review
```
