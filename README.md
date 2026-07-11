# TindaJuan Documentation

TindaJuan is a mobile-first POS and store management app for Filipino sari-sari stores and small shops.

## Product Promise

**Benta, paninda, utang, kaha, at GCash/Maya services — ayos sa isang simpleng app.**

## Target Users

- Sari-sari store owners
- Small retail stores
- Mini groceries
- Home-based tindahan owners
- Store owners who use phone/tablet more than laptop/PC

## MVP Modules

1. **Benta** — product checkout and sales
2. **Services** — GCash/Maya cash-in and cash-out tracking
3. **Paninda** — products and stock tracking
4. **Suki** — customer and utang tracking
5. **Kaha** — cash drawer movements
6. **Reports** — daily summaries and insights
7. **Settings** — store setup and basic preferences

## Recommended Tech Stack

```txt
Framework: Next.js
Language: TypeScript
UI: Tailwind CSS + shadcn/ui
State: Zustand
Forms: React Hook Form + Zod
Local DB: IndexedDB + Dexie.js
Backend/Cloud: Supabase later
Database: PostgreSQL later
Hosting: Vercel
PWA: next-pwa or custom service worker
```

## Recommended Build Strategy

### Phase 1 — Local-first MVP

Build the actual store workflow first without login/cloud.

- Store setup
- Product CRUD
- Checkout/cart
- Cash, utang, partial payments
- Customer balances
- Kaha tracking
- GCash/Maya services
- Daily reports
- IndexedDB local persistence

### Phase 2 — Cloud backup and sync

Add Supabase only after local flow is usable.

- Auth
- Store accounts
- Cloud backup
- Multi-device sync
- Recovery/export

### Phase 3 — Commercial features

- Subscription plans
- Receipt printing
- Barcode scanning
- Multi-user roles
- Supplier tracking
- Advanced reports

## Documentation Index

- [`product-mvp.md`](./product-mvp.md) — MVP scope and feature requirements
- [`design-system.md`](./design-system.md) — branding, colors, typography, components, UI rules
- [`database-schema.md`](./database-schema.md) — local and future cloud data model
- [`offline-first.md`](./offline-first.md) — local-first and sync strategy
- [`implementation-guide.md`](./implementation-guide.md) — development setup, folder structure, and implementation order
- [`phase-17-pilot-store-test.md`](./phase-17-pilot-store-test.md) — controlled pilot checklist, reconciliation measures, and feedback log

## Core Product Rules

1. Mobile-first always.
2. The app must work without internet.
3. Product sales and service transactions must be tracked separately.
4. Personal withdrawals affect **kaha**, not business profit.
5. GCash/Maya transaction amount is not product sales; only service fee is income.
6. Use simple Taglish labels where it helps non-technical users.
7. Avoid accounting jargon.
8. Build for speed at the counter.
