# TindaJuan Implementation Guide

## Recommended Initial Stack

```txt
Framework: Next.js App Router
Language: TypeScript
Styling: Tailwind CSS
UI: shadcn/ui
Local DB: Dexie.js / IndexedDB
State: Zustand
Forms: React Hook Form + Zod
Charts: Recharts later
PWA: next-pwa or custom service worker later
Cloud: Supabase later
```

## Suggested Setup Commands

```bash
npx create-next-app@latest tindajuan --typescript --tailwind --eslint --app --src-dir --import-alias '@/*'
cd tindajuan
npm install dexie zustand zod react-hook-form @hookform/resolvers date-fns
npx shadcn@latest init
```

Optional later:

```bash
npm install @tanstack/react-query
npm install next-pwa
npm install @supabase/supabase-js
npm install recharts
```

---

# Suggested Folder Structure

```txt
src/
  app/
    page.tsx
    layout.tsx
    benta/
      page.tsx
    services/
      page.tsx
    paninda/
      page.tsx
    suki/
      page.tsx
    menu/
      page.tsx
    kaha/
      page.tsx
    reports/
      page.tsx
    settings/
      page.tsx

  components/
    app/
      bottom-nav.tsx
      page-header.tsx
      money.tsx
      empty-state.tsx
    benta/
      product-search.tsx
      product-card.tsx
      cart-summary.tsx
      payment-sheet.tsx
    services/
      service-action-card.tsx
      service-form.tsx
      wallet-balance-card.tsx
    paninda/
      product-form.tsx
      product-list.tsx
      stock-badge.tsx
    suki/
      customer-form.tsx
      customer-list.tsx
      customer-ledger.tsx
    kaha/
      cash-summary.tsx
      cash-movement-form.tsx
      cash-movement-list.tsx
    reports/
      daily-summary-cards.tsx
      low-stock-list.tsx

  lib/
    db/
      dexie.ts
      schema.ts
      repositories/
        products.ts
        sales.ts
        customers.ts
        cash.ts
        services.ts
        reports.ts
    money.ts
    dates.ts
    ids.ts
    constants.ts

  stores/
    cart-store.ts
    app-store.ts

  types/
    store.ts
    product.ts
    sale.ts
    customer.ts
    cash.ts
    service.ts
    wallet.ts
```

---

# Implementation Order

## Step 1 — Project Setup

- Create Next.js app.
- Install Tailwind/shadcn.
- Configure design tokens.
- Add mobile viewport metadata.
- Create app shell and bottom navigation.

## Step 2 — Local DB Setup

- Add Dexie database.
- Define TypeScript types.
- Create repository functions.
- Add seed/demo data utility for testing.

## Step 3 — Store Setup

- First-run store setup screen.
- Save store record locally.
- Redirect to `Benta` after setup.

## Step 4 — Paninda

- Product list.
- Add/edit product form.
- Archive product.
- Low stock badge.
- Manual stock adjustment.

## Step 5 — Benta / Checkout

- Product search.
- Cart store with Zustand.
- Quantity controls.
- Cash sale.
- Utang sale.
- Partial sale.
- Stock deduction.
- Cash/customer ledger integration.

## Step 6 — Suki / Utang

- Customer list.
- Add/edit customer.
- Customer detail.
- Ledger history.
- Record payment.

## Step 7 — Kaha

- Starting cash per day.
- Cash movement list.
- Manual cash-in/cash-out.
- Expected kaha calculation.
- Auto cash-in from sales/payments.

## Step 8 — Services

- GCash/Maya wallets.
- Wallet balance display.
- Cash-in form.
- Cash-out form.
- Service fee tracking.
- Cash and wallet movement integration.

## Step 9 — Reports

- Daily summary cards.
- Product sales total.
- Estimated product profit.
- Service fee income.
- Expected kaha.
- Total utang.
- Low stock list.

## Step 10 — PWA Polish

- Manifest.
- Icons.
- Offline shell.
- Installability.
- Basic local backup/export later.

---

# Core Utility Rules

## Money

Use centavos internally if possible.

```ts
export function pesoToCentavos(value: number): number {
  return Math.round(value * 100);
}

export function centavosToPeso(value: number): number {
  return value / 100;
}

export function formatPeso(value: number): string {
  return new Intl.NumberFormat('en-PH', {
    style: 'currency',
    currency: 'PHP',
  }).format(value);
}
```

Choose one approach early:

- Store as pesos decimal for speed in prototype, or
- Store as centavos integer for safer long-term money calculations.

Recommended: **centavos integer**.

## Dates

Use a `business_date` string for daily reports.

```txt
YYYY-MM-DD
```

This avoids timezone issues in daily reports.

---

# Atomic Operation Requirements

## Complete Sale

Implement as one function, for example:

```txt
completeSale(cart, paymentDetails)
```

It should:

1. Validate cart.
2. Create sale.
3. Create sale items.
4. Deduct stock.
5. Create inventory movements.
6. Create cash movement if cash received.
7. Create customer ledger if utang/partial.
8. Clear cart.

## Record Service Transaction

Implement as one function:

```txt
recordServiceTransaction(input)
```

It should:

1. Validate provider/type/amount/fee.
2. Create service transaction.
3. Create wallet movement.
4. Update wallet balance.
5. Create cash movement.

## Record Customer Payment

Implement as one function:

```txt
recordCustomerPayment(input)
```

It should:

1. Validate customer and amount.
2. Create payment.
3. Update customer balance.
4. Create ledger record.
5. Create cash movement if payment is cash.

---

# Testing / Validation Checklist

## Product Sale

- [ ] Cash sale deducts stock.
- [ ] Cash sale increases expected kaha.
- [ ] Estimated profit is correct.
- [ ] Sale history keeps product name/price snapshot.

## Utang

- [ ] Utang sale deducts stock.
- [ ] Utang sale increases customer balance.
- [ ] Utang sale does not increase kaha.
- [ ] Payment decreases customer balance.
- [ ] Cash payment increases kaha.

## Kaha

- [ ] Starting cash appears in expected kaha.
- [ ] Manual cash-in increases expected kaha.
- [ ] Manual cash-out decreases expected kaha.
- [ ] Personal kuha does not reduce estimated product profit.

## Services

- [ ] GCash cash-in increases kaha and decreases GCash wallet.
- [ ] GCash cash-out decreases kaha and increases GCash wallet.
- [ ] Maya cash-in increases kaha and decreases Maya wallet.
- [ ] Maya cash-out decreases kaha and increases Maya wallet.
- [ ] Service fee counts as service income only.
- [ ] Service volume does not count as product sales.

## Reports

- [ ] Product sales are separate from service volume.
- [ ] Service fee income is visible.
- [ ] Expected kaha calculation is correct.
- [ ] Low stock list works.
- [ ] Total utang matches customer balances.

---

# MVP Non-Goals

Do not build these in v1 unless specifically prioritized:

- Barcode scanning
- Receipt printer
- Multi-user roles
- Multi-branch
- BIR compliance
- Full accounting
- Supplier purchase orders
- Native Android/iOS app
- GCash/Maya API integration
- Subscription billing

---

# Build Philosophy

1. Make the selling flow fast.
2. Keep financial labels understandable.
3. Track real tindahan behavior, including personal cash withdrawals.
4. Separate product sales from service transactions.
5. Do not overbuild accounting features.
6. Validate with real store usage early.
