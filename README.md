# Bandhan monorepo

This is an isolated monorepo copy. The original Bandhan applications remain
unchanged in their existing folders next to this directory.

## Layout

```text
apps/
  api/                # Copy of ../Bandhan_backend
  user/               # Copy of ../bandhan-user
  seller/             # Copy of ../product-seller
  admin/              # Copy of ../bandhan-admin
  student/            # Copy of ../bandhan_student-main
  job-seeker/         # Copy of ../bandhan-job-seeker
packages/             # Future shared code
  ui/
  types/
  config/
```

## Commands

Run these from this directory after installing dependencies:

```bash
pnpm install
pnpm dev
pnpm build
pnpm lint
pnpm typecheck
```

## Central sign-in and portal handoff

The User app is the central sign-in entry point. Customer accounts remain in
the User app; seller, student, instructor, job-seeker, and recruiter accounts
are redirected to their own portal with a two-minute, single-use SSO code.
Admin remains separate.

Set these in `apps/user/.env.local` for production (the defaults are local
development ports):

```bash
NEXT_PUBLIC_SELLER_PORTAL_URL=https://seller.example.com
NEXT_PUBLIC_STUDENT_PORTAL_URL=https://academy.example.com
NEXT_PUBLIC_JOB_PORTAL_URL=https://jobs.example.com
```

## Copy details

All source files, project configuration, and lockfiles were copied for the
active applications. The standalone landing app was then removed after its home
experience was integrated into `apps/user`. Generated
files were intentionally excluded: `node_modules`, `.next`, `dist`, `build`,
`.turbo`, and `coverage`. Recreate dependencies in this folder with
`pnpm install` when the workspace package configuration has been consolidated.
