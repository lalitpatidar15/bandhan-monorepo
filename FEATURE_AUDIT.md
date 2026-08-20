# Bandhan Monorepo — Feature Coverage Audit

Audit date: 2026-08-17. Every item verified against code in `apps/*` (user, seller, student, job-seeker, admin, api).

Legend: ✅ EXISTS · 🟡 PARTIAL · ❌ MISSING

---

## 1.1 User Panel — `apps/user`

| # | Feature | Status | Notes |
|---|---------|--------|-------|
| 1 | Signup / Login / OTP / Social login | ✅ | Login+OTP+social API wired; Google/FB buttons inert in UI |
| 2 | Profile creation & management | ✅ | |
| 3 | Role selection (buyer / event owner / learner / job seeker) | 🟡 | RoleCard component unused; roles via signup dropdown + SSO portals |
| 4 | Browse products | ✅ | |
| 5 | Browse services | ✅ | |
| 6 | Advanced search & filters | ✅ | Basic filters only; mostly client-side |
| 7 | Listing detail view | ✅ | |
| 8 | Compare listings | 🟡 | CompareContext+CompareBar exist, never rendered; no compare page |
| 9 | Wishlist / shortlist | ✅ | Heart on detail page is local-state only (bug) |
| 10 | Enquiry sending | ✅ | Only reachable from enquiries dashboard |
| 11 | Quote request | ✅ | |
| 12 | Cart system (products) | ✅ | |
| 13 | Availability Type: Sale/Rent/Both | 🟡 | Rentals exist as separate browse mode; no per-listing Sale/Rent/Both UI |
| 14 | Rent Order Management (deliver/return) | 🟡 | Read-only status list; no user actions |
| 15 | Booking system (services) | ✅ | "Review & Pay" button skips payment step |
| 16 | Payment integration | ✅ | Razorpay checkout |
| 17 | EMI loan to purchase via payment gateway | 🟡 | EMI plan selector passes `emi.months`; no lender/installment backend |
| 18 | Order & booking tracking | ✅ | ShipRocket tracking |
| 19 | Notifications (app/email/SMS) | 🟡 | In-app fully wired; no client-side email/SMS config |
| 20 | Review/Rating/feedback | ✅ | |
| 21 | User dashboard | ✅ | |
| 22 | Event Planner (guests/budget/type/location) | ❌ | API exists (`eventApi`), **no UI** |
| 23 | Budget Planner | ❌ | |
| 24 | Wedding design inspiration section | 🟡 | Only "Latest event inspirations" header in feed |
| 25 | Event timeline creation | ❌ | |
| 26 | Hashtag generator | ❌ | |
| 27 | Join a community | 🟡 | Feed + composer exist; Join button is local-state only |
| 28 | View / Add Blogs | ❌ | No blog routes in user app (backend + admin exist) |

**Score: 14 ✅ / 7 🟡 / 5 ❌ (22 Event Planner, 23, 25, 26, 28)**

---

## 1.2 Product Seller Panel — `apps/seller`

| # | Feature | Status | Notes |
|---|---------|--------|-------|
| 1 | Seller signup & login | ✅ | |
| 2 | Profile & business details | ✅ | GST/PAN/website, 6 settings tabs |
| 3 | Document verify via DigiLocker | 🟡 | UI branded, backend is **demo stub** only |
| 4 | Product listing creation | ✅ | 5-step wizard |
| 5 | Category & subcategory mapping | ✅ | catalog-driven |
| 6 | Product pricing | ✅ | |
| 7 | Availability Type: Sale/Rent/Both | ✅ | |
| 8 | Stock & inventory management | ✅ | |
| 9 | Product images/media upload | ✅ | |
| 10 | Order management | ✅ | |
| 11 | Rent Order Management (deliver/return) | ❌ | No rent lifecycle actions |
| 12 | Shipping & delivery tracking | ✅ | Shiprocket integration |
| 13 | Return & refund handling | ✅ | |
| 14 | Commission deduction visibility | ✅ | |
| 15 | Featured product option | 🟡 | `isFeatured` in contract, no product UI toggle (services only) |
| 16 | Earnings & payout dashboard | 🟡 | Earnings + bank details exist; `/withdraw` + `/earnings/payouts` are **stub redirects** |
| 17 | Customer communication | ✅ | Real-time socket chat |
| 18 | Ratings & review management | ✅ | |

**Score: 14 ✅ / 3 🟡 / 1 ❌**

---

## 1.3 Course Seller / Instructor Panel — `apps/student` (instructor side)

| # | Feature | Status | Notes |
|---|---------|--------|-------|
| 1 | Instructor registration | ✅ | `instructor/register` + login |
| 2 | Profile setup | ✅ | |
| 3 | Document verify via DigiLocker | 🟡 | Real KYC doc upload (aadhaar/PAN/degree/cert); DigiLocker itself demo-only |
| 4 | Course creation | ✅ | curriculum builder |
| 5 | Course modules & lessons | ✅ | |
| 6 | Video/content upload | ✅ | |
| 7 | Course pricing | ✅ | incl. EMI plans |
| 8 | Enrollment management | ✅ | |
| 9 | Student progress tracking | ✅ | |
| 10 | Certification management | ✅ | issue certificate |
| 11 | Course analytics | ✅ | |
| 12 | Earnings dashboard | ✅ | |
| 13 | Featured course listing | ✅ | toggle featured |
| 14 | Review management | ✅ | reply flow |

**Score: 13 ✅ / 1 🟡 (DigiLocker is demo-only backend-wide)**

---

## 1.4 Student Panel — `apps/student`

| # | Feature | Status | Notes |
|---|---------|--------|-------|
| 1 | Student signup & login | ✅ | Google + SSO |
| 2 | Profile & learning preferences | ✅ | |
| 3 | Course browsing | ✅ | |
| 4 | Course enrollment | ✅ | |
| 5 | Payment for courses | ✅ | Razorpay |
| 6 | EMI loan via payment gateway | 🟡 | EMI plans stored in-app; charged in full, no lender |
| 7 | Course dashboard | ✅ | |
| 8 | Lesson consumption | ✅ | course player |
| 9 | Progress tracking | ✅ | |
| 10 | Quiz & assessment | ✅ | |
| 11 | Certificate download | ✅ | |
| 12 | Wishlist courses | ✅ | |
| 13 | Notifications | ✅ | |
| 14 | Reviews & ratings | ✅ | |

**Score: 13 ✅ / 1 🟡**

---

## 1.5 Job Seeker Panel — `apps/job-seeker`

| # | Feature | Status | Notes |
|---|---------|--------|-------|
| 1 | Signup & login | ✅ | |
| 2 | Profile with predefined select fields | ✅ | catalog-driven dropdowns |
| 3 | Resume upload | ✅ | |
| 4 | Skills & experience management | ✅ | |
| 5 | Job browsing | ✅ | |
| 6 | Job filters | ✅ | SearchBar button decorative (alert) |
| 7 | Job detail view | ✅ | |
| 8 | Payment dashboard | ✅ | upgrades/plans via Razorpay |
| 9 | Job application | ✅ | draft save + submit |
| 10 | Application tracking | ✅ | timeline w/ `limit:100` bug |
| 11 | Notifications | ❌ | Route renders **messaging UI** (copy-paste bug), no notifications |
| 12 | Messaging with job poster | ✅ | |

**Score: 11 ✅ / 1 ❌**

---

## 1.6 Job Poster Panel — `apps/job-seeker` (jobposter side)

| # | Feature | Status | Notes |
|---|---------|--------|-------|
| 1 | Signup & login | ✅ | |
| 2 | Company profile setup | ✅ | |
| 3 | Job posting (predefined fields + manual) | ✅ | |
| 4 | Featured job posting | ✅ | paid promotion |
| 5 | Job management | ✅ | |
| 6 | Applicant list view | ✅ | PDF resume preview |
| 7 | Shortlisting candidates | ✅ | |
| 8 | Communication with applicants | ✅ | |
| 9 | Hiring workflow | ✅ | kanban pipeline |
| 10 | Job closing | ✅ | |
| 11 | Payment & invoice tracking | ✅ | |

**Score: 11 ✅ / 0**

---

## 1.7 Admin Panel — `apps/admin`

| # | Feature | Status | Notes |
|---|---------|--------|-------|
| 1 | Admin dashboard | ✅ | |
| 2 | User management | ✅ | |
| 3 | Product seller management | ✅ | |
| 4 | Course seller management | ✅ | |
| 5 | Student management | ✅ | |
| 6 | Job seeker management | ✅ | |
| 7 | Job poster management | ✅ | |
| 8 | Category/subcategory management | ✅ | |
| 9 | Commission setup (category-wise) | ✅ | |
| 10 | Commission rules (fixed/percentage) | ✅ | |
| 11 | Featured listing control | 🟡 | view-only page; toggles only in Moderation |
| 12 | Job posting fee control | ✅ | |
| 13 | Listing approval & moderation | ✅ | |
| 14 | Create communities | ❌ | no API + no UI |
| 15 | Manage community posts | 🟡 | remove-only |
| 16 | Blogs add/manage/verify | ✅ | |
| 17 | Content moderation | ✅ | |
| 18 | Payment tracking | 🟡 | paymentStatus filters only, no transaction ledger |
| 19 | Refund management | ❌ | no refund endpoint/UI (Razorpay refund helper exists server-side, unused) |
| 20 | Review moderation | 🟡 | view-only, no hide/flag |
| 21 | Dispute handling | ✅ | |
| 22 | Reports & analytics | 🟡 | Analytics mixes hardcoded figures; Export button inert |
| 23 | Role & permission management | 🟡 | roles creatable but **not enforced** in UI |

**Score: 15 ✅ / 6 🟡 / 2 ❌**

---

## 1.8 Sub-Admin / Moderator Panel — `apps/admin`

| # | Feature | Status | Notes |
|---|---------|--------|-------|
| 1 | Listing moderation | 🟡 | exists as admin capability; no sub-admin surface |
| 2 | User report handling | ❌ | |
| 3 | Review/feedback monitoring | 🟡 | read-only |
| 4 | Content approval | 🟡 | no blog approval gate |
| 5 | Support handling | 🟡 | tickets inside main admin only |
| 6 | Escalation to admin | ❌ | |
| 7 | Limited dashboard access | ❌ | roles never enforced |

**Score: 0 ✅ / 4 🟡 / 3 ❌ — no moderator experience exists**

---

## 1.9 Support / Finance Panel (+ Ticket) — `apps/admin`

| # | Feature | Status | Notes |
|---|---------|--------|-------|
| 1 | Transaction monitoring | 🟡 | no dedicated ledger |
| 2 | Payout processing | ❌ | admin-side payout action missing (`useUpdateSettlementMutation` unused); seller self-service only |
| 3 | Refund handling | ❌ | |
| 4 | Escalation management | ❌ | |
| 5 | Settlement tracking | 🟡 | view-only, mark-paid never wired |
| 6 | Financial reporting | 🟡 | export inert |
| 7 | Ticket support system | ✅ | SupportTickets full panel |
| 8 | Ticket panel | ✅ | same as above |

**Score: 2 ✅ / 3 🟡 / 3 ❌**

---

## Backend coverage — `apps/api`

- **Domains fully backed**: auth+OTP+SSO+social, products, inventory, cart, orders, shipping (Shiprocket), returns, **full rental lifecycle** (confirm-delivery / initiate-return / inspect / complete / cancel / extension / chat), bookings, payments (Razorpay), coupons, invoices, earnings/commissions, settlements, wishlist, reviews, chat, notifications, events, venues, services, packages, quotes, blogs, community posts, enquiry, support tickets, admin (users/sellers/instructors/students/jobseekers/jobposters/courses/enrollments/moderation/categories/commissions/featured/fees/disputes/roles/blogs/banners/rental orders/plans), student LMS (enroll, player, quizzes, progress, certificates, notifications), instructor (KYC, curriculum, analytics, earnings, certificates), jobs (seeker + poster + payments/invoices/pipeline/interview), identity verification.
- **Not real (demo/stub)**: DigiLocker (demo ack endpoint only), EMI-as-loan (in-app plan, full amount charged once, no lender integration), FCM push (endpoint only; no real notification push infra on admin side).
- **Models**: 69 across shared/merchant/instructor/student/jobPoster/jobSeeker/admin.

---

## Global gaps — what the frontend redesign must address

| Area | Gap |
|------|-----|
| User app | Compare page + add-to-compare buttons, Event Planner UI (API ready), Budget Planner, Event timeline, Hashtag generator, Blogs view, live wishlist heart, join community API, blog/detail flows |
| Seller app | Rent order deliver/return workflow (API ready), payout withdraw page + payout history (API ready), featured toggle on products (API ready) |
| Job-seeker | Notifications page for seekers (API: `/job-message/notification` exists), messages component cross-portal import, SearchBar wiring |
| Admin | Community creation + post management, refunds, payout processing (hook unused), escalation, user reports, review moderation actions, real analytics data, role-enforced UI, featured listings toggles, functional export |
| Sub-admin/Finance | New role-gated surfaces (moderator, finance) |
| Shared | `packages/ui`, `packages/types`, `packages/config` are empty stubs — no shared design system, no shared types |
| Visual | 6 apps, 6 different visual styles/UI kits (Tailwind v3 vs v4, hand-rolled kits, no shared tokens) — the redesign target |