# Bandhan Admin Panel

**Last Updated:** 2026-07-19

## Overview

Next.js admin dashboard for managing the Bandhan marketplace platform. Connects to the Bandhan backend API for all operations.

## Tech Stack

- Next.js 16 (App Router, Turbopack)
- React 19
- TypeScript
- Redux Toolkit + RTK Query
- Tailwind CSS 4
- Lucide React icons

## Implemented Modules

| Module | Component | Status |
|--------|-----------|--------|
| Dashboard | `Dashboard.tsx` | Stats cards, panel links, API health check |
| Users | `Users.tsx` | Full CRUD with search |
| Students | `Students.tsx` | List with status management |
| Instructors | `Instructors.tsx` | List with status management |
| Courses | `Courses.tsx` | List with status management |
| Enrollments | `Enrollments.tsx` | List with status management |
| Job Seekers | `JobSeekers.tsx` | List with status management |
| Job Posters | `JobPosters.tsx` | List with status management |
| Moderation | `Moderation.tsx` | Tabs: Jobs, Products, Community Content |
| Categories | `Categories.tsx` | Full CRUD with subcategories |
| Commissions | `Commissions.tsx` | Commission rules CRUD |
| Featured Listings | `FeaturedListings.tsx` | Featured listing management |
| Disputes | `Disputes.tsx` | Dispute resolution |
| Support Tickets | `SupportTickets.tsx` | Ticket management |
| Roles & Permissions | `RolesPermissions.tsx` | Role CRUD |
| Content Governance | `ContentGovernance.tsx` | Content moderation |
| Products | `Products.tsx` | Full CRUD with vendor selection |
| Orders | `Orders.tsx` | Order management with status updates |
| Rental Orders | `RentalOrders.tsx` | Rental order status management |
| Analytics | `Analytics.tsx` | Charts and metrics |
| Blogs | `Blogs.tsx` | Full CRUD with status filtering |
| Banners | `Banners.tsx` | Full CRUD with image preview |
| Settings | `Settings.tsx` | Platform settings |

## Design System

All components use shared CSS classes defined in `app/globals.css`:

- `.card` — White card container
- `.admin-input` — Styled form inputs
- `.admin-btn`, `.admin-btn-primary`, `.admin-btn-secondary`, `.admin-btn-danger` — Buttons
- `.admin-badge`, `.admin-badge-active`, `.admin-badge-inactive`, `.admin-badge-pending` — Status badges
- `.admin-table` — Consistent table styling
- `.admin-page-heading`, `.admin-page-sub` — Page titles

## Authentication

- Admin login at `/admin/login`
- JWT token stored in `localStorage` (`adminToken`)
- Layout-level auth guard in `app/admin/layout.tsx`
- Bearer token sent with all API requests

## Environment

```env
NEXT_PUBLIC_API_URL=http://localhost:5001/api
```

## Run Locally

```bash
pnpm install
pnpm dev
```

Default URL: `http://localhost:3003`

## Known Issues

- The admin-login import issue has been resolved; keep credentials out of the UI and repository.
- Analytics depends on complete production transaction data and must not use mock figures.
- All 23 page components render via client-side state switching (no deep-linking)
