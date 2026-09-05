# Bandhan Platform - Complete API Integration Guide

## 📋 Overview


## 🏗️ Project Structure

```
store/
├── api/
│   ├── baseApi.ts           # Base RTK Query setup
│   ├── authApi.ts           # Authentication endpoints
│   ├── vendorApi.ts         # Vendor management
│   ├── venueApi.ts          # Venue management
│   ├── bookingApi.ts        # Booking management
│   ├── cartApi.ts           # Cart operations
│   ├── reviewApi.ts         # Review system
│   ├── notificationApi.ts   # Notifications
│   ├── eventApi.ts          # Event management
│   ├── userApi.ts           # User profile
│   └── dashboardApi.ts      # Dashboard data
├── slices/
│   └── authSlice.ts         # Auth state
└── store.ts                 # Store configuration

types/
├── auth.ts                  # Auth types
├── user.ts                  # User types
├── vendor.ts                # Vendor types
├── product.ts               # Venue/Product types
├── booking.ts               # Booking types
├── cart.ts                  # Cart types
├── review.ts                # Review types
├── notification.ts          # Notification types
├── event.ts                 # Event types
└── dashboard.ts             # Dashboard types
```

---

## 🔌 API Configuration

### Base URL

```
http://192.168.1.165:5001/api
```

### Authentication

- Auto-includes `Bearer {token}` from localStorage
- Token key: `auth_token`
- All endpoints require authentication except `/login` and `/register`

### Providers

- `Auth`
- `Vendors`
- `Dashboard`
- `User`

---

## 📚 API Endpoints

### 🔐 Authentication (`authApi`)

```typescript
// Login
useLoginMutation()
POST /login
Body: { email: string; password: string }
Response: AuthResponse { token, message, user }

// Register
useRegisterMutation()
POST /register
Body: { name: string; email: string; password: string }
Response: AuthResponse { token, message, user }
```

### 👥 Vendors (`vendorApi`)

```typescript
// Get all vendors
useGetVendorsQuery({ page?, limit?, category? })
GET /vendors?page=1&limit=10&category=photography
Response: { vendors[], total, page, limit }

// Get vendor by ID
useGetVendorByIdQuery(vendorId)
GET /vendors/:id
Response: { vendor }

// Search vendors
useLazySearchVendorsQuery()
GET /vendors/search?q=photography
Response: { vendors[], total, page, limit }

// Get by category
useGetVendorsByCategoryQuery(category)
GET /vendors/category/:category
Response: { vendors[], total, page, limit }

// Get featured
useGetFeaturedVendorsQuery()
GET /vendors/featured
Response: { vendors[], total, page, limit }
```

### 🏨 Venues (`venueApi`)

```typescript
// Get all venues
useGetVenuesQuery({ page?, limit? })
GET /venues?page=1&limit=10
Response: { venues[], total, page, limit }

// Get venue by ID
useGetVenueByIdQuery(venueId)
GET /venues/:id
Response: { venue }

// Search venues
useLazySearchVenuesQuery()
GET /venues/search?q=taj
Response: { venues[], total, page, limit }

// Filter venues
useLazyFilterVenuesQuery()
GET /venues/filter?location=jaipur&priceMin=1000&priceMax=5001
Response: { venues[], total, page, limit }

// Featured venues
useGetFeaturedVenuesQuery()
GET /venues/featured
Response: { venues[], total, page, limit }

// Popular venues
useGetPopularVenuesQuery()
GET /venues/popular
Response: { venues[], total, page, limit }
```

### 📅 Bookings (`bookingApi`)

```typescript
// Create booking
useCreateBookingMutation()
POST /bookings
Body: { venueId, eventDate, guestCount, eventType }
Response: { booking, message }

// Get user bookings
useGetUserBookingsQuery()
GET /bookings/user
Response: { bookings[], total }

// Get booking details
useGetBookingByIdQuery(bookingId)
GET /bookings/:id
Response: { booking }

// Update booking
useUpdateBookingMutation()
PATCH /bookings/:id
Body: { eventDate?, guestCount?, status? }
Response: { booking, message }

// Cancel booking
useCancelBookingMutation()
POST /bookings/:id/cancel
Response: { booking, message }

// Available dates
useGetAvailableDatesQuery(venueId)
GET /bookings/venue/:id/available-dates
Response: { dates[] }
```

### 🛒 Cart (`cartApi`)

```typescript
// Get cart
useGetCartQuery()
GET /cart
Response: { cart }

// Add to cart
useAddToCartMutation()
POST /cart/items
Body: { itemId, itemType, quantity? }
Response: { cart, message }

// Update quantity
useUpdateCartItemMutation()
PATCH /cart/items/:id
Body: { quantity }
Response: { cart, message }

// Remove from cart
useRemoveFromCartMutation()
DELETE /cart/items/:id
Response: { message, cart }

// Clear cart
useClearCartMutation()
DELETE /cart
Response: { message, cart }

// Checkout
useCheckoutMutation()
POST /cart/checkout
Response: { orderId, message }
```

### ⭐ Reviews (`reviewApi`)

```typescript
// Create review
useCreateReviewMutation()
POST /reviews
Body: { itemId, itemType, rating, title, description }
Response: { review, message }

// Get reviews
useGetItemReviewsQuery({ itemId, itemType })
GET /reviews?itemId=1&itemType=venue
Response: { reviews[], averageRating, totalReviews }

// User reviews
useGetUserReviewsQuery()
GET /reviews/user
Response: { reviews[], total }

// Get review
useGetReviewByIdQuery(reviewId)
GET /reviews/:id
Response: { review }

// Update review
useUpdateReviewMutation()
PATCH /reviews/:id
Body: { rating?, title?, description? }
Response: { review, message }

// Delete review
useDeleteReviewMutation()
DELETE /reviews/:id
Response: { message }
```

### 🔔 Notifications (`notificationApi`)

```typescript
// Get notifications
useGetNotificationsQuery({ limit?, offset? })
GET /notifications?limit=20&offset=0
Response: { notifications[], unreadCount }

// Unread notifications
useGetUnreadNotificationsQuery()
GET /notifications/unread
Response: { notifications[], unreadCount }

// Mark as read
useMarkAsReadMutation()
PATCH /notifications/:id/read
Response: { message }

// Mark all read
useMarkAllAsReadMutation()
PATCH /notifications/read-all
Response: { message }

// Delete notification
useDeleteNotificationMutation()
DELETE /notifications/:id
Response: { message }

// Delete all
useDeleteAllNotificationsMutation()
DELETE /notifications
Response: { message }
```

### 📌 Events (`eventApi`)

```typescript
// Create event
useCreateEventMutation()
POST /events
Body: { name, description, eventDate, location, guestCount, eventType, budget }
Response: { event, message }

// Get user events
useGetUserEventsQuery()
GET /events/user
Response: { events[], total }

// Get event
useGetEventByIdQuery(eventId)
GET /events/:id
Response: { event }

// Update event
useUpdateEventMutation()
PATCH /events/:id
Body: { name?, description?, eventDate?, location?, guestCount?, budget?, status? }
Response: { event, message }

// Delete event
useDeleteEventMutation()
DELETE /events/:id
Response: { message }

// Add vendor
useAddVendorToEventMutation()
POST /events/:eventId/vendors
Body: { vendorId }
Response: { event, message }

// Remove vendor
useRemoveVendorFromEventMutation()
DELETE /events/:eventId/vendors/:vendorId
Response: { event, message }

// Add venue
useAddVenueToEventMutation()
POST /events/:eventId/venues
Body: { venueId }
Response: { event, message }

// Remove venue
useRemoveVenueFromEventMutation()
DELETE /events/:eventId/venues/:venueId
Response: { event, message }
```

### 👤 User (`userApi`)

```typescript
// Get profile
useGetUserProfileQuery()
GET /users/profile
Response: { user }

// Update profile
useUpdateUserProfileMutation()
PATCH /users/profile
Body: { name?, email?, phone?, address?, avatar? }
Response: { user }

// Change password
useChangePasswordMutation()
POST /users/password
Body: { currentPassword, newPassword }
Response: { message }

// Get preferences
useGetUserPreferencesQuery()
GET /users/preferences
Response: { preferences }

// Update preferences
useUpdateUserPreferencesMutation()
PATCH /users/preferences
Body: { notifications, newsletter, ... }
Response: { message }

// Logout
useLogoutMutation()
POST /auth/logout
Response: { message }
```

---

## 💡 Usage Examples

### Basic Query (Fetch Data)

```typescript
import { useGetVenuesQuery } from "@/store/api/venueApi";

function VenueList() {
  const { data, isLoading, error } = useGetVenuesQuery({ page: 1, limit: 10 });

  if (isLoading) return <Loader />;
  if (error) return <div>Error loading venues</div>;

  return (
    <div>
      {data?.venues.map((venue) => (
        <div key={venue.id}>{venue.name}</div>
      ))}
    </div>
  );
}
```

### Mutation (Create/Update/Delete)

```typescript
import { useCreateBookingMutation } from "@/store/api/bookingApi";

function BookingForm() {
  const [createBooking, { isLoading }] = useCreateBookingMutation();

  const handleSubmit = async (formData) => {
    try {
      const result = await createBooking(formData).unwrap();
      console.log("Booking created:", result);
    } catch (error) {
      console.error("Failed:", error);
    }
  };

  return <form onSubmit={handleSubmit}>...</form>;
}
```

### Lazy Query (On-Demand)

```typescript
import { useLazySearchVenuesQuery } from "@/store/api/venueApi";

function SearchVenues() {
  const [searchVenues, { data }] = useLazySearchVenuesQuery();

  return (
    <div>
      <input
        onChange={(e) => searchVenues(e.target.value)}
        placeholder="Search venues..."
      />
      {data?.venues.map((v) => <div key={v.id}>{v.name}</div>)}
    </div>
  );
}
```

---

## 🔄 Cache Management

All APIs use RTK Query's intelligent caching:

### Tag-Based Invalidation

```typescript
// When you create a booking, it invalidates related caches
useCreateBookingMutation() // Invalidates 'Dashboard' tag
```

### Manual Cache Control

```typescript
import { useDispatch } from "react-redux";
import { baseApi } from "@/store/api/baseApi";

const dispatch = useDispatch();

// Clear specific cache
dispatch(baseApi.util.resetApiState());

// Refetch specific query
dispatch(
  baseApi.util.invalidateTags(["Vendors"])
);
```

---

## ⚠️ Error Handling

All hooks support error handling:

```typescript
const { data, isLoading, error, isError } = useGetVenuesQuery();

if (error) {
  console.log(error.data.message); // Error message from API
  console.log(error.status); // HTTP status code
}
```

---

## 📡 Pagination

All list endpoints support pagination:

```typescript
const { data, isLoading } = useGetVenuesQuery({
  page: 1, // 1-indexed
  limit: 10, // Items per page
});

// Response includes:
// data.venues[] - Array of items
// data.total - Total count
// data.page - Current page
// data.limit - Items per page
```

---

## 🚀 Performance

RTK Query provides:

- **Automatic caching** - Data is cached and reused
- **Deduplication** - Multiple identical requests share same response
- **Background refetching** - Stale data is refreshed automatically
- **Selective invalidation** - Only affected caches are cleared
- **Request cancellation** - Previous requests canceled if new one started

---

## ✅ Implementation Checklist

- [X] All API types defined
- [X] All RTK Query endpoints created
- [X] Store configured with all APIs
- [X] Pages integrated with APIs
- [X] Components integrated with APIs
- [X] Error handling implemented
- [X] Loading states added
- [X] Static fallbacks included
- [ ] Backend API endpoints implementation (TODO)
- [ ] Full testing and QA (TODO)

---

## 🔗 File References

- **APIs**: [/store/api/](/store/api/)
- **Types**: [/types/](/types/)
- **Store**: [/store/store.ts](/store/store.ts)
- **Usage Examples**: See individual page files in [/app/](/app/)

---

## 📝 Notes

- All APIs use `Bearer token` authentication from localStorage
- Base URL can be changed in environment variables
- APIs are fully typed with TypeScript
- All mutations include loading states
- All queries include error handling
- Fallback to static data available where needed

---

**Last Updated**: May 5, 2026
**Status**: Frontend complete, Backend pending implementation
