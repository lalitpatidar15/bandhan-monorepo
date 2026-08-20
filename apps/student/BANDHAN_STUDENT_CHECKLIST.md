# Bandhan Student — Full Project Checklist

> **Framework:** Next.js 15 (App Router) · **Language:** TypeScript · **Styling:** Tailwind CSS v4  
> **State:** Redux Toolkit + RTK Query  
> **Backend:** `https://bandhan-backend-gykw.onrender.com/api`

---

## 1. Root Configuration

- [x] `next.config.ts` — Next.js config
- [x] `tsconfig.json` — TypeScript config
- [x] `package.json` — Dependencies & scripts
- [x] `postcss.config.mjs` — PostCSS (Tailwind)
- [x] `eslint.config.mjs` — ESLint flat config
- [x] `pnpm-workspace.yaml` — pnpm workspace
- [x] `.env` / `.env.local` — Environment variables
- [x] `.gitignore` — Git ignore rules
- [x] `proxy.ts` — Custom proxy utility

---

## 2. Layout & Providers

- [x] `app/layout.tsx` — Root layout with Redux Provider + RouteGuard + dark mode setup
- [x] `app/globals.css` — Global Tailwind + CSS variables
- [x] `app/providers.tsx` — Redux Provider wrapper

---

## 3. Landing Page

- [x] `app/page.tsx` — Server component, fetches landing data
- [x] `components/landing/LandingClient.tsx` — Interactive hero, features, stats cards
- [x] `lib/landingData.ts` — Static landing page data (hero stats, features, testimonials)
- [x] `app/student/data/courses.ts` — Static course fallback data

---

## 4. Student Routes (16 pages)

### 4.1 Authentication

- [ ] `app/student/login/page.tsx` — Student login
- [ ] `app/student/auth/page.tsx` — Student registration

### 4.2 Dashboard & Courses

- [ ] `app/student/page.tsx` — Student landing / dashboard
- [ ] `app/student/courses/page.tsx` — Browse all courses (filter, search, pagination)
- [ ] `app/student/allcourse/page.tsx` — Alternative full course listing
- [ ] `app/student/mycourse/page.tsx` — Enrolled courses, progress, upcoming tasks
- [ ] `app/student/view_details/[id]/page.tsx` — Course detail page
- [ ] `app/student/enroll/[id]/page.tsx` — Enrollment + checkout/payment (Razorpay)

### 4.3 Learning

- [ ] `app/student/course-player/[id]/page.tsx` — Video player, module/lesson nav, progress
- [ ] `app/student/quiz/[id]/page.tsx` — Take MCQ quiz
- [ ] `app/student/quiz-result/[studentId]/[quizId]/page.tsx` — Quiz result + score
- [ ] `app/student/progress/[id]/page.tsx` — Progress tracking + certificates

### 4.4 User Management

- [ ] `app/student/profile/page.tsx` — Edit profile
- [ ] `app/student/wishlist/page.tsx` — Wishlist management
- [ ] `app/student/notifications/page.tsx` — Notifications list
- [ ] `app/student/notification/page.tsx` — Single notification view

---

## 5. Instructor Routes (15 pages)

### 5.1 Authentication

- [ ] `app/instructor/login/page.tsx` — Instructor login
- [ ] `app/instructor/page.tsx` — Instructor landing

### 5.2 Profile

- [ ] `app/instructor/profile/page.tsx` — Profile (step 1)
- [ ] `app/instructor/profilenext/page.tsx` — Profile (step 2)
- [ ] `app/instructor/profilelast/page.tsx` — Profile (step 3)

### 5.3 Course Management

- [ ] `app/instructor/curriculum/page.tsx` — Course list
- [ ] `app/instructor/curriculum2/[id]/page.tsx` — Curriculum builder (modules, lessons, quizzes)
- [ ] `app/instructor/content/page.tsx` — Content management (video, PDF, MCQ)
- [ ] `app/instructor/pricing/page.tsx` — Pricing + EMI setup
- [ ] `app/instructor/dashboard/page.tsx` — Overview stats + course cards

### 5.4 Analytics & Performance

- [ ] `app/instructor/analytics/page.tsx` — Revenue chart, watch time, drop-off, student segments
- [ ] `app/instructor/earnings/page.tsx` — Earnings report
- [ ] `app/instructor/performance/page.tsx` — Course performance overview
- [ ] `app/instructor/performance/review/page.tsx` — Review management + reply
- [ ] `app/instructor/performance/student/page.tsx` — Individual student progress

---

## 6. Redirect / Alias Pages

- [x] `app/live-session/page.tsx` → redirects to `/student/courses`
- [x] `app/my-courses/page.tsx` → redirects to `/student/mycourse`
- [x] `app/course-player/page.tsx` → redirects to `/student/course-player/[id]`

---

## 7. API Routes

- [ ] `app/api/instructor/basic-info/init/route.ts` — Next.js API route for instructor basic-info init

---

## 8. Redux Store & API Services

### 8.1 Core Store

- [x] `app/redux/store.ts` — Store with baseApi middleware

### 8.2 Student API (baseApi)

- [x] `app/redux/services/baseApi.ts` — Shared base API (JWT headers, 401 logout)

| Service | File | Endpoints |
|---|---|---|
| **Auth** | `services/authApi.ts` | `POST student/login`, `POST student/register` |
| **Profile** | `services/profileApi.ts` | `GET profile` |
| **Course** | `services/courseApi.ts` | 30 endpoints (courses, enroll, player, quiz, wishlist, payment, progress, notifications, reviews, certificates) |

### 8.3 Instructor API (baseApi)

- [x] `app/redux/instructor-services/baseApi.ts` — Instructor base API (JWT, 401 → `/instructor/auth`)

| Service | File | Endpoints |
|---|---|---|
| **Auth** | `instructor-services/authApi.ts` | `POST instructor/register`, `POST instructor/login` |
| **Profile** | `instructor-services/profileApi.ts` | `GET/PUT instructor/profile` |
| **Course** | `instructor-services/courseApi.ts` | 30 endpoints (CRUD courses, modules, lessons, quizzes, video, resources, pricing, publish) |
| **Dashboard** | `instructor-services/DashboardApi.ts` | Overview, course dashboard, students, reviews |
| **Verification** | `instructor-services/verificationApi.ts` | Instructor documents + verification status |

---

## 9. Shared Components (30)

### 9.1 Common UI

- [x] `components/common/Button.tsx` — Styled button (primary/outline, sizes)
- [x] `components/common/Card.tsx` — Generic card container
- [x] `components/common/Modal.tsx` — Overlay modal dialog
- [x] `components/common/Badge.tsx` — Status/category badge
- [x] `components/common/Tabs.tsx` — Tabbed navigation
- [x] `components/common/Table.tsx` — Data table
- [x] `components/common/ProgressBar.tsx` — Reusable progress bar
- [x] `components/common/AcademyLogo.tsx` — Brand logo
- [x] `components/common/Header.jsx` — Main site header (student)
- [x] `components/common/CourseHeader.tsx` — Course-specific header
- [x] `components/common/CurriculumHeader.jsx` — Curriculum builder header
- [x] `components/common/InstructorHeader.tsx` — Instructor dashboard header

### 9.2 Layout

- [x] `components/layout/Sidebar.tsx` — Instructor sidebar
- [x] `components/layout/MainLayout.tsx` — Main layout wrapper
- [x] `components/layout/Navbar.tsx` — Nav bar

### 9.3 Auth

- [x] `components/auth/RouteGuard.tsx` — Route protection (redirect if unauthenticated)
- [x] `components/auth/AuthTabs.tsx` — Login/Register tab switcher
- [x] `components/auth/AuthCard.tsx` — Auth card wrapper
- [x] `components/auth/AuthLayout.tsx` — Auth page layout

### 9.4 Course

- [x] `components/course/CourseCard.tsx` — Course card display
- [x] `components/course/CourseList.tsx` — Course list/grid container

### 9.5 Form

- [x] `components/form/Input.tsx` — Text input
- [x] `components/form/Select.tsx` — Dropdown
- [x] `components/form/Checkbox.tsx` — Checkbox input
- [x] `components/form/PasswordInput.tsx` — Password with show/hide
- [x] `components/form/FileUpload.tsx` — File upload with preview

### 9.6 Other

- [x] `components/RoutePrefetcher.tsx` — Route prefetching on mount
- [x] `components/lesson/LessonCard.tsx` — Lesson card for course player

---

## 10. Student Features

### 10.1 Authentication & Auth

- [ ] Login with JWT (POST `/student/login`)
- [ ] Register new account (POST `/student/register`)
- [ ] Protected routes via RouteGuard

### 10.2 Course Discovery

- [ ] Browse all courses with category/level filters
- [ ] Search courses by keyword
- [ ] Course detail with thumbnail, instructor, rating, price
- [ ] Paginated course listing

### 10.3 Enrollment & Payment

- [ ] Free course enrollment
- [ ] Paid course enrollment via Razorpay
- [ ] Order creation (`POST /student/:courseId/create-order`)
- [ ] Payment verification (`POST /student/:courseId/verify-payment`)
- [ ] My Courses dashboard (enrolled, progress, quizzes, certificates)

### 10.4 Learning

- [ ] Course player with video
- [ ] Module/lesson navigation
- [ ] Mark lesson complete, auto-advance
- [ ] Downloadable lesson resources (PDF)
- [ ] Take MCQ quiz per lesson
- [ ] Quiz auto-submit + scoring
- [ ] Quiz result summary (pass/fail, detailed answers)

### 10.5 Progress & Certificates

- [ ] Per-course progress percentage
- [ ] Progress dashboard with stats
- [ ] Certificate on course completion

### 10.6 Wishlist

- [ ] Add course to wishlist
- [ ] Remove from wishlist
- [ ] View wishlist

### 10.7 Profile

- [ ] View profile
- [ ] Edit profile
- [ ] Change password
- [ ] Delete account

### 10.8 Notifications

- [ ] List notifications
- [ ] Mark single notification as read
- [ ] Mark all as read
- [ ] Delete notification

### 10.9 Reviews

- [ ] Submit course rating + review
- [ ] Display reviews on course detail page

---

## 11. Instructor Features

### 11.1 Authentication & Profile

- [ ] Register as instructor
- [ ] Login with JWT
- [ ] 3-step profile setup (basic profile, extended, final)
- [ ] Verification document upload (Aadhaar, PAN, degree, certificate)
- [ ] Verification status tracking

### 11.2 Course Creation

- [ ] Create new course with basic info
- [ ] Set course title, category, level, thumbnail
- [ ] Course list (my courses)

### 11.3 Curriculum Builder

- [ ] Add/edit/reorder modules
- [ ] Add/edit/delete lessons within modules
- [ ] Save draft / save & continue lesson editing
- [ ] Add video content to lessons
- [ ] Add resources (PDF, files) to lessons
- [ ] Add MCQ quizzes to lessons
- [ ] Edit/delete quizzes

### 11.4 Pricing & Publishing

- [ ] Set base price
- [ ] Apply discount percentage
- [ ] Setup EMI plans
- [ ] Set course visibility (draft / published)
- [ ] Publish course workflow

### 11.5 Dashboard

- [ ] Overview: active courses, enrolled learners, earnings, rating
- [ ] Course performance cards
- [ ] Today's events + pending tasks

### 11.6 Student Management

- [ ] View enrolled students per course
- [ ] View individual student progress
- [ ] Update student progress percentage

### 11.7 Reviews

- [ ] View reviews per course
- [ ] Review stats (rating distribution, average)
- [ ] Reply to reviews

### 11.8 Analytics & Earnings

- [ ] Revenue chart (daily/weekly/monthly)
- [ ] Weekly revenue bars
- [ ] Average watch time + distribution
- [ ] Drop-off rate + most-dropped lesson
- [ ] Top performing lessons
- [ ] Student segments (active, stalled, completed)
- [ ] Earnings report

---

## 12. Cross-Cutting

- [x] Dark mode support (Tailwind dark: variant + CSS variables)
- [x] Responsive design (mobile/tablet/desktop)
- [x] Loading states (RTK Query isLoading)
- [x] Error states (RTK Query isError)
- [x] 401 auto-logout redirect
- [x] JWT Bearer token in API headers
- [x] Route protection (RouteGuard redirect)
- [x] Consistent color palette & design system

---

## 13. Student API Endpoints (36)

- [ ] `POST /student/login`
- [ ] `POST /student/register`
- [ ] `GET /student/courses`
- [ ] `GET /student/course/:courseId`
- [ ] `GET /student/course-player/:courseId`
- [ ] `GET /student/course-player/:courseId/lesson/:lessonId`
- [ ] `GET /student/course-player/:courseId/lesson/:lessonId/resources`
- [ ] `PUT /student/course-player/:courseId/lesson/:lessonId/complete`
- [ ] `GET /student/lesson/:lessonId`
- [ ] `POST /student/wishlist/:courseId`
- [ ] `GET /student/wishlist`
- [ ] `DELETE /student/wishlist/:courseId`
- [ ] `POST /student/:courseId/verify-payment`
- [ ] `POST /student/:courseId/create-order`
- [ ] `GET /student/enrollments`
- [ ] `POST /student/:courseId/enroll`
- [ ] `GET /student/enrollment/:courseId`
- [ ] `GET /student/payment/:paymentId`
- [ ] `GET /student/:courseId/checkout`
- [ ] `GET /student/dashboard`
- [ ] `GET /student/get-profile`
- [ ] `POST /student/create-profile`
- [ ] `PUT /student/update-profile`
- [ ] `PUT /student/change-password`
- [ ] `DELETE /student/delete-profile`
- [ ] `GET /student/notifications`
- [ ] `PATCH /student/notifications/:notificationId/read`
- [ ] `PATCH /student/notifications/read-all`
- [ ] `DELETE /student/notifications/:notificationId`
- [ ] `POST /student/:courseId/review`
- [ ] `DELETE /student/enrollment/:courseId`
- [ ] `GET /student/my-courses`
- [ ] `GET /student/progress/:progressId`
- [ ] `POST /student/:quizId/submit`
- [ ] `GET /student/progress/:studentId/certificate/:certificateId`
- [ ] `GET /student/result/:studentId/:quizId`
- [ ] `GET /student/page-resources`

---

## 14. Instructor API Endpoints (47)

- [ ] `POST /instructor/register`
- [ ] `POST /instructor/login`
- [ ] `GET /instructor/profile`
- [ ] `PUT /instructor/profile`
- [ ] `GET /instructor/verification`
- [ ] `GET /instructor/verification/status`
- [ ] `PUT /instructor/verification`
- [ ] `GET /curriculum/basic-info/init`
- [ ] `GET /curriculum/my-courses`
- [ ] `POST /curriculum/create`
- [ ] `GET /curriculum/:courseId`
- [ ] `PUT /curriculum/:courseId`
- [ ] `POST /curriculum/:courseId/module`
- [ ] `PUT /curriculum/:courseId/module/reorder`
- [ ] `PUT /curriculum/:courseId/module/:moduleId`
- [ ] `DELETE /curriculum/:courseId/module/:moduleId`
- [ ] `POST /curriculum/:courseId/module/:moduleId/lesson`
- [ ] `PUT /curriculum/:courseId/module/:moduleId/lesson/:lessonId`
- [ ] `DELETE /curriculum/:courseId/module/:moduleId/lesson/:lessonId`
- [ ] `POST /curriculum/:courseId/module/:moduleId/lesson/:lessonId/quiz`
- [ ] `PUT /curriculum/:courseId/module/:moduleId/lesson/:lessonId/quiz/:quizId`
- [ ] `DELETE /curriculum/:courseId/module/:moduleId/lesson/:lessonId/quiz/:quizId`
- [ ] `GET /curriculum/:courseId/module/:moduleId/lesson/:lessonId/content-page`
- [ ] `POST /curriculum/:courseId/module/:moduleId/lesson/:lessonId/video`
- [ ] `POST /curriculum/:courseId/module/:moduleId/lesson/:lessonId/resource`
- [ ] `DELETE /curriculum/:courseId/module/:moduleId/lesson/:lessonId/resource/:resourceId`
- [ ] `PUT /curriculum/course/:courseId/curriculum/save-continue`
- [ ] `PUT /curriculum/course/:courseId/module/:moduleId/lesson/:lessonId/save-draft`
- [ ] `PUT /curriculum/course/:courseId/module/:moduleId/lesson/:lessonId/save-continue`
- [ ] `PUT /curriculum/:courseId/pricing`
- [ ] `PUT /curriculum/:courseId/emi`
- [ ] `PUT /curriculum/:courseId/visibility`
- [ ] `PUT /curriculum/:courseId/publish`
- [ ] `GET /curriculum/:courseId/curriculum-page`
- [ ] `GET /curriculum/:courseId/curriculum`
- [ ] `GET /curriculum/:courseId/module/:moduleId/lesson/:lessonId/status`
- [ ] `GET /curriculum/:courseId/pricing-page`
- [ ] `GET /curriculum/:courseId/publish-status`
- [ ] `GET /instructor/dashboard`
- [ ] `GET /dashboard/:courseId/dashboard`
- [ ] `GET /dashboard/:courseId/students`
- [ ] `GET /dashboard/:courseId/student/:studentId`
- [ ] `PUT /dashboard/:courseId/student/:studentId/progress`
- [ ] `GET /dashboard/:courseId/reviews`
- [ ] `GET /dashboard/:courseId/reviews/stats`
- [ ] `PUT /dashboard/reply/:reviewId`
- [ ] `GET /instructor/page-resources`

---

## 15. Dependencies

- [x] `next` — Framework
- [x] `react` + `react-dom` — UI library
- [x] `typescript` — Type safety
- [x] `@reduxjs/toolkit` + `react-redux` — State management
- [x] `lucide-react` — Icons
- [x] `tailwindcss` — Utility CSS
- [x] `eslint` — Linting

---

## Legend

- `[x]` — File exists or feature is structurally present
- `[ ]` — Needs verification / active development
