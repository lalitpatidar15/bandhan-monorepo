# Bandhan Design System

## Product promise

Everything needed to plan, learn, work, sell, and celebrate in one simple place.

Bandhan is one ecosystem, not a collection of unrelated portals. Every surface shares the same identity, interaction rules, language, and status patterns. A user may move between buying, learning, planning, selling, or hiring without having to relearn the product.

## Design direction

**Modern Indian Editorial Utility** combines a warm, celebratory public marketplace with calm, task-focused working portals.

- Public pages use strong photography, generous editorial layouts, and a restrained display typeface.
- Marketplace pages prioritize search, comparison, availability, price, trust, and a clear primary action.
- Authenticated portals prioritize the next task, progress, statuses, and plain-language guidance.
- Admin, moderation, support, and finance use denser layouts but the same tokens and components.

## Foundations

### Color

- Brand: warm terracotta/orange. Use `--bhn-brand-600` for primary actions and `--bhn-brand-700` for active text.
- Canvas: `--bhn-bg`, a warm cream rather than clinical grey.
- Surface: white for working content and `--bhn-surface-2` for quiet grouping.
- Text: warm near-black, with taupe secondary text.
- Gold: a restrained accent for featured or celebratory content, never for ordinary controls.
- Semantic colors communicate status only. Never rely on color without text or an icon.

### Typography

- UI and body: Manrope with system fallbacks.
- Display: Space Grotesk with system fallbacks. Reserve large display treatment for public storytelling.
- Dashboard headings remain compact; tables and metrics use tabular numerals.
- Body text is at least 16px for primary reading and never below 12px for supporting labels.

### Shape, spacing, and depth

- Use the 4px spacing scale already defined by `--bhn-space-*`.
- Controls: 10px radius; content cards: 16px; promotional/editorial panels: 24px.
- Minimum interactive target: 44px.
- Prefer borders and background contrast over large shadows. Elevation indicates overlays or interaction.
- Content width: 1280px. Reading width: 720px.

### Motion

- Quick feedback: 120ms; ordinary transitions: 180ms; entrances: 240ms.
- Animate opacity and transform only where possible.
- Respect `prefers-reduced-motion` and never require animation to understand state.

## Interaction grammar

Every important page answers four questions in this order:

1. Where am I?
2. What should I do next?
3. What is the current status?
4. Where can I get help?

Long workflows use short named steps, a visible progress indicator, autosave where safe, explicit field labels, examples, and actionable error messages. Advanced settings are progressively disclosed.

## Shells

### Public shell

- One brand header only.
- Search appears on marketplace routes, not on the editorial home page.
- Primary navigation: Products, Rentals, Services, Venues, Courses, Jobs, Community.
- Mobile uses a compact header and task-oriented bottom navigation.

### Portal shell

- Shared `PortalHeader` and `PortalSidebar` from `@bandhan/ui`.
- Navigation comes from `@bandhan/config`; components do not hard-code role capabilities.
- First dashboard block is `JourneyPanel`, containing the current goal, next action, progress, and help.
- Status labels use shared vocabulary and tones.

## Reusable product patterns

- `ListingCard` and `ListingDetail` provide a common frame for product, service, venue, course, and job content with conditional sections.
- `JourneyPanel` guides onboarding and multi-step work.
- `StatusTimeline` serves orders, rentals, bookings, applications, payouts, tickets, and moderation.
- `FilterPanel`, `DataTable`, `EmptyState`, and `PageHeader` behave consistently in every portal.
- Roles and capabilities live in `@bandhan/types` and `@bandhan/config`.

## Migration rules

1. Do not delete working screens to redesign them.
2. Wrap existing components with shared primitives first.
3. Move duplicated role, navigation, status, and listing definitions into shared packages.
4. Migrate one route family at a time and keep the application buildable.
5. Preserve API contracts unless a separately tested backend migration is required.
6. New code must use semantic tokens rather than portal-specific hex colors.

## Accessibility and language

- Meet WCAG AA contrast for text and controls.
- Full keyboard access with visible focus.
- Labels remain visible after a value is entered; placeholders are examples, not labels.
- Use direct language: “Add product”, “Request quote”, “Continue lesson”.
- Avoid internal terms such as entities, records, or fulfillment when simpler wording works.
- Empty states explain what happened and provide one next action.

