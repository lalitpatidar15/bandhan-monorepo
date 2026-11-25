# Testing and validation

From parent `AGENTS.md` (verify against source when in doubt):

- Run commands from `bandhan-monorepo/`. `node_modules` is absent initially; run `pnpm install`.
- `pnpm dev` / `pnpm build` / `pnpm lint` fan out via turbo.
- Single app: `pnpm -C apps/<dir> <script>` (package names do not match folder names).
- Root `pnpm typecheck` only covers `packages/ui` and `packages/types` — apps have no `typecheck` script (admin uses `type-check`). Typecheck an app with `pnpm -C apps/<dir> exec tsc --noEmit`.
- Root `pnpm clean` is a no-op.
- API tests: `pnpm -C apps/api exec node --test "tests/*.test.js"` (glob required).
- API validation: `pnpm -C apps/api check` runs `scripts/validate.js` — syntax check, exact-case relative imports, duplicate controller exports, then `require()`s `app.js` (needs a valid `apps/api/.env`).
- Seeding: `pnpm -C apps/api seed`, plus `scripts/seedAcademy.js`, `scripts/seedMarketplaceDemo.js`, `scripts/resetDatabase.js`.
- `apps/user/scripts/check-*.mjs` are standalone assertion scripts with no runner.
- No CI, no hooks, no test framework dependency. Validation = lint + `tsc --noEmit` + the check scripts above.
- Prefer smallest useful validation first: affected app typecheck/lint, then targeted tests, then broader build only if risk requires it.
