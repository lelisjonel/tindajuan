# TindaJuan MVP Development Roadmap

This roadmap breaks the TindaJuan MVP into small development phases so the app can be built **utay-utay** without overbuilding.

## Development Principle

> Every phase should produce something that can be opened, tested, and improved.

TindaJuan should be built as a **mobile-first, local-first PWA** before adding cloud sync, subscription billing, or advanced features.

---

# Roadmap Summary

## Recommended Build Order

1. **Project Foundation**
2. **Design System + Mobile App Shell**
3. **Local Database Foundation**
4. **Store Setup + Demo Mode**
5. **Paninda / Products**
6. **Benta / Cash Checkout**
7. **Suki / Utang**
8. **Kaha Tracker**
9. **GCash/Maya Services**
10. **Reports**
11. **PWA Polish + Real Store Testing**
12. **CSV Import/Export + Period Reports**

---

## Current Project Status

Last verified after the Phase 14 backup and recovery implementation:

| Phase | Status | Notes |
|---|---|---|
| Phase 0 — Planning and Scope | ✅ Complete | MVP scope, schema, design system, and roadmap documented. |
| Phase 1 — Project Foundation | ✅ Complete | Next.js app, routes, metadata, and Git repository working. |
| Phase 2 — Design System + App Shell | ✅ Complete | Responsive mobile-first shell and reusable UI components implemented. |
| Phase 3 — Local Database Foundation | ✅ Complete | Dexie/IndexedDB repositories and demo seed implemented. |
| Phase 4 — Store Setup + Demo Mode | ✅ Complete | First-run setup and demo data flow working. |
| Phase 5 — Paninda / Products | ✅ Complete | Product CRUD, archive, search, low stock, and stock adjustments working. |
| Phase 6 — Benta / Cash Checkout | ✅ Complete | Cash checkout, change, stock deduction, and cash movement working. |
| Phase 7 — Suki / Utang | ✅ Complete | Utang, partial payments, balances, and ledger history working. |
| Phase 8 — Kaha Tracker | ✅ Complete | Starting cash, cash-in/out, personal kuha, and expected Kaha working. |
| Phase 9 — GCash/Maya Services | ✅ Complete | Wallet balances, cash-in/out, service fees, and Kaha integration working. |
| Phase 10 — Reports | ✅ Complete | Daily sales, profit, utang, Kaha, wallet, and low-stock summaries working. |
| Phase 11 — PWA + Real Store Testing | 🟡 Foundation complete | Manifest, icons, service worker, and offline fallback implemented; real device/store testing remains. |
| Phase 12 — CSV Import/Export | ✅ Complete | Inventory CSV import/export and daily/weekly/monthly sales CSV exports implemented. |
| Phase 12B — Load + Bills Payment Services | ✅ Complete | GCash/Maya load and bills payment tracking with actual wallet deductions, customer pricing, provider charges, net income, Kaha movements, and validation implemented. |
| Brand Refresh — AyosTinda | ✅ Complete | AyosTinda colors, typography direction, sidebar mark, PWA icons, metadata, manifest, and service labels applied. |
| Phase 13 — Real Device and Store QA | 🟡 In progress | LAN-ready QA session prepared; real phone/store feedback is still pending. |
| Phase 14 — Backup and Recovery | ✅ Implementation complete | Full JSON backup export/restore, schema validation, destructive-action confirmation, and local-data warnings implemented; manual phone verification remains. |
| Phase 15 — Usability Improvements | ✅ Implementation complete | Added destructive-action confirmations, mobile input modes, clearer Load/Bills Payment pricing guidance, and labeled service fields; real-user polish may continue from phone feedback. |

### Current Position

The app is feature-complete through **Phase 14 implementation**. The current working brand is **AyosTinda**, with the product positioned as a simple WebPOS for sari-sari stores:

> Benta, paninda, utang, at kaha. Mas ayos sa isang lugar.

Phase 13 real-device validation remains open. Phase 14 backup/recovery and the first Phase 15 usability slice are implemented and covered by automated tests. Manual verification on a phone should confirm the flows before daily production use.

Automated verification currently passes:

```txt
npm test       ✅ 28 tests passed
npm run lint   ✅ passed
npm run build  ✅ passed
```

---

# Next Roadmap Phases

## Phase 13 — Real Device and Store QA

### Goal

Validate the complete AyosTinda workflow on a real phone using realistic store scenarios before adding more major features.

### Test Scope

- Add 20–50 products.
- Complete normal cash sales and verify stock deduction.
- Record utang and partial payments.
- Record personal kuha and store expenses.
- Test GCash/Maya cash-in and cash-out.
- Test Load and Bills Payment with provider charges and customer pricing.
- Check daily reports and compare expected Kaha with actual cash.
- Reload the app and verify local data persists.
- Test offline reopen, mobile navigation, and touch targets.
- Test CSV import/export on a real device where practical.

### Output

Real-user feedback, screenshots, usability findings, and a prioritized bug list.

## Phase 14 — Backup and Recovery ✅ Implementation complete

### Goal

Protect local store data before daily production use.

### Build

- Full local database export and restore.
- Backup file validation and version/date metadata.
- Store profile, products, sales, utang, Kaha, wallet, and service records included.
- Confirmation before reset or destructive actions.
- Recovery instructions and data-loss warnings.

### Done When

A tester can export a complete backup, clear local data, restore the backup, and verify the important records return correctly. Automated repository verification now covers this flow; manual browser/phone verification remains.

## Phase 15 — Usability Improvements ✅ Initial slice complete

### Goal

Fix confusing or slow workflows found during real phone and store testing.

### Focus Areas

- Faster Benta recording and less typing.
- Clearer Load/Bills Payment pricing fields.
- Better Kaha reconciliation language.
- Improved mobile spacing, button hierarchy, and empty states.
- Clear archive, reset, and destructive-action confirmations.
- Finalize Taglish labels and AyosTinda copy.

### Initial Slice Delivered

- Confirm before resetting demo data or archiving products.
- Confirm before replacing local data with demo setup data.
- Use mobile-friendly search, decimal, and telephone keyboards.
- Explain Face Value, Wallet Deduction, and Customer Pays in the Load/Bills Payment form.
- Label Load product, Mobile Number, Biller, and Account Reference fields clearly.

## Phase 16 — Data Safety and Privacy

### Goal

Make local-first behavior and stored customer/service data safer and clearer.

### Build

- Explain that data is stored on the current device/browser.
- Warn users about browser-data clearing and device loss.
- Review stored customer phone numbers and account references.
- Improve error recovery and storage-limit messages.
- Document offline behavior, backup expectations, and known limitations.

## Phase 17 — Pilot Store Testing

### Goal

Run AyosTinda in a controlled real-store pilot before public release.

### Done When

- Jonel can use the app without assistance.
- Kaha and wallet balances reconcile with actual amounts.
- Recording a transaction is faster or clearer than the paper notebook.
- No data-loss incidents occur during the pilot.
- Feedback from one to three additional store users is collected and reviewed.

## Phase 18 — MVP Release / v1.0

### Goal

Prepare a stable local-first AyosTinda release for wider use.

### Build

- Stable production deployment.
- Complete backup and restore.
- Polished phone and tablet UI.
- Final AyosTinda brand assets and documentation.
- User guide and real-store testing checklist.
- Production smoke test for routes, manifest, icons, service worker, and offline shell.

### Post-v1.0 Candidates

Cloud sync, authentication, multi-device access, multi-user roles, supplier management, barcode scanning, receipt printing, advanced charts, subscriptions, and official GCash/Maya API integrations remain later initiatives.

---

# Phase 0 — Planning and Scope

## Goal

Prepare the product direction, MVP scope, tech stack, and implementation rules.

## Outputs

- Product MVP requirements
- Design system
- Database schema
- Offline-first strategy
- Implementation guide
- Development roadmap

## Done When

- MVP features are clear.
- Non-goals are listed.
- Tech stack is decided.
- Data model is drafted.
- Build phases are agreed.

## Status

Complete. The planned MVP scope, non-goals, data model, and development process are documented.

---

# Phase 1 — Project Foundation

## Goal

Create the actual app project and basic development environment.

## Build

- Next.js app
- TypeScript
- Tailwind CSS
- shadcn/ui setup
- Basic folder structure
- Git repository
- Basic routing
- App metadata

## Initial Routes

```txt
/
/benta
/services
/paninda
/suki
/menu
/kaha
/reports
/settings
```

## Output

A working app with placeholder pages.

## Done When

- `npm run dev` works.
- App opens in browser.
- Placeholder pages load.
- Navigation links work.
- No major console errors.

---

# Phase 2 — Design System + Mobile App Shell

## Goal

Make the app feel like TindaJuan and work well on phone first.

## Build

- Color tokens
- Typography setup
- Mobile layout wrapper
- Bottom navigation
- Page header
- Button styles
- Card styles
- Input styles
- Empty state component

## Core Components

```txt
BottomNav
PageHeader
MoneyText
SummaryCard
EmptyState
PrimaryButton
```

## Recommended Bottom Nav

```txt
Benta
Services
Paninda
Suki
Menu
```

Inside Menu:

```txt
Kaha
Reports
Settings
```

## Output

A branded mobile-first app shell with placeholder content.

## Done When

- App looks good on mobile width.
- Bottom nav is thumb-friendly.
- Buttons and inputs are large enough.
- Tablet/desktop layout does not break.
- TindaJuan colors and typography are applied.

---

# Phase 3 — Local Database Foundation

## Goal

Set up local-first persistence using IndexedDB/Dexie.

## Build

- Dexie database setup
- TypeScript data types
- Repository functions
- UUID helper
- Money formatting helper
- Business date helper
- Demo/reset utilities

## Initial Tables

```txt
stores
products
inventory_movements
sales
sale_items
customers
customer_ledger
payments
cash_days
cash_movements
wallets
service_transactions
wallet_movements
```

## Output

The app can save and read local data.

## Done When

- Demo store can be created.
- Data persists after refresh.
- Data can be reset during development.
- Repository functions are available for products, sales, customers, cash, services, and reports.

---

# Phase 4 — Store Setup + Demo Mode

## Goal

Let a store owner set up the app before using it.

## Build

- First-run setup screen
- Store name field
- Owner name optional
- Contact number optional
- Save store locally
- Redirect to Benta after setup
- Optional demo data seed button

## Demo Data

Add sample data for testing:

- Products
- Customers
- Wallet balances
- Starting cash

## Output

User can create a local store profile and start testing the app.

## Done When

- First app open shows setup if no store exists.
- Existing store opens the main app directly.
- Store info appears in settings/menu.
- Demo data can be loaded.

---

# Phase 5 — Paninda / Products

## Goal

Allow store owner to manage products and stocks.

## Build

- Product list
- Product search
- Add product form
- Edit product form
- Archive product
- Low stock badge
- Manual stock adjustment
- Inventory movement creation

## Product Fields

```txt
Name
Selling Price
Cost Price
Stock Quantity
Unit
Category optional
Low Stock Alert
```

## Output

User can list and manage paninda.

## Done When

- Add product works.
- Edit product works.
- Archive product works.
- Products persist after refresh.
- Low stock displays correctly.
- Stock adjustment updates stock and creates inventory movement.

## Test Scenario

```txt
Add Milo Sachet
Add Coke 1.5L
Add Egg
Edit stock
Search product
Archive one product
Check low stock badge
```

---

# Phase 6 — Benta / Cash Checkout

## Goal

Build the core selling flow starting with cash sales only.

## Build

- Product search in checkout
- Product cards/list
- Cart state using Zustand
- Add to cart
- Quantity controls
- Remove cart item
- Cart total
- Cash received
- Change calculation
- Complete cash sale
- Stock deduction
- Inventory movements
- Cash movement for sale
- Clear cart after sale

## Output

User can sell products for cash.

## Done When

- Products can be added to cart.
- Quantity can be changed.
- Cash sale can be completed.
- Stock deducts correctly.
- Sale is saved locally.
- Cash movement is created.
- Expected kaha increases.
- Cart clears after completed sale.

## Test Scenario

```txt
Sell 2 Milo Sachet + 1 Egg
Enter cash received
Check change
Complete sale
Verify stock deducted
Verify cash movement created
```

---

# Phase 7 — Suki / Utang

## Goal

Add customer and credit tracking.

## Build

- Customer list
- Add/edit customer
- Customer detail screen
- Customer balance
- Ledger history
- Utang sale
- Partial payment sale
- Record payment
- Cash movement for cash payments

## Checkout Payment Options

Add these to checkout:

```txt
Cash
Utang
Partial
```

## Output

User can replace notebook-style utang tracking.

## Done When

- Customer can be added.
- Utang sale increases customer balance.
- Utang sale deducts stock.
- Utang sale does not increase kaha.
- Partial sale records paid and unpaid portions.
- Payment decreases customer balance.
- Cash payment increases kaha.
- Customer ledger shows history.

## Test Scenario

```txt
Maria utang ₱120
Maria pays ₱50
Balance should be ₱70
Payment should appear in ledger
Cash payment should increase expected kaha
```

---

# Phase 8 — Kaha Tracker

## Goal

Track real cash drawer movement including personal withdrawals.

## Build

- Starting cash per day
- Expected kaha summary
- Cash movement list
- Manual cash-in
- Manual cash-out
- Quick categories
- Daily cash summary

## Cash Out Categories

```txt
Personal Kuha
Restock
Bills
Groceries
Store Expense
Other
```

## Cash In Categories

```txt
Added Capital
Other Cash In
```

## Output

User can understand why actual cash differs from sales.

## Done When

- Starting cash works.
- Sales/payments automatically appear as cash-in.
- Manual cash-in increases expected kaha.
- Manual cash-out decreases expected kaha.
- Personal kuha does not reduce estimated product profit.
- Daily kaha summary is understandable.

## Test Scenario

```txt
Starting cash ₱500
Cash sale ₱100
Personal kuha ₱50
Expected kaha should be ₱550
```

---

# Phase 9 — GCash/Maya Services

## Goal

Track GCash/Maya cash-in and cash-out transactions, wallet balances, and service fee income.

## Build

- Wallet setup
- GCash balance
- Maya balance
- GCash Cash-In
- GCash Cash-Out
- Maya Cash-In
- Maya Cash-Out
- Service fee income tracking
- Wallet movement history
- Cash movement integration

## Service Types

```txt
GCash Cash-In
GCash Cash-Out
Maya Cash-In
Maya Cash-Out
```

## Cash-In Default Rule

Customer gives cash and fee. Store sends wallet money.

```txt
Kaha + amount + service_fee
Wallet - amount
Service Income + service_fee
```

## Cash-Out Default Rule

Customer sends wallet money. Store gives cash minus fee.

```txt
Wallet + amount
Kaha - (amount - service_fee)
Service Income + service_fee
```

## Important Rule

GCash/Maya transaction amount is **service volume**, not product sales. Only the service fee is income.

## Output

User can track e-wallet service business clearly.

## Done When

- GCash cash-in updates kaha and GCash wallet correctly.
- GCash cash-out updates kaha and GCash wallet correctly.
- Maya cash-in updates kaha and Maya wallet correctly.
- Maya cash-out updates kaha and Maya wallet correctly.
- Service fee appears in reports.
- Service volume is separate from product sales.

## Test Scenario

```txt
GCash cash-in ₱500 fee ₱10
Expected: Kaha +₱510, GCash wallet -₱500

GCash cash-out ₱500 fee ₱10
Expected: Kaha -₱490, GCash wallet +₱500
```

---

# Phase 10 — Reports

## Goal

Show useful daily summaries for the store owner.

## Build

Daily report cards:

```txt
Product Sales
Estimated Product Profit
Service Fee Income
Cash Sales
Utang Sales
Utang Payments
Cash Out
Expected Kaha
Total Utang
Low Stock Count
GCash Balance
Maya Balance
```

## Output

Store owner understands the day at a glance.

## Done When

- Product sales are calculated correctly.
- Estimated product profit is calculated from sale item snapshots.
- Service fee income is visible.
- Service volume is separate from product sales.
- Expected kaha matches cash movements.
- Total utang matches customer balances.
- Low stock list works.

## Test Scenario

```txt
Make 1 cash sale
Make 1 utang sale
Record 1 payment
Record 1 personal kuha
Record 1 GCash cash-in
Open report
Verify all totals are separated correctly
```

---

# Phase 11 — PWA Polish + Real Store Testing

## Goal

Make the app installable and ready for real store testing.

## Build

- Web app manifest
- App icons
- Theme color
- Offline shell
- Standalone display mode
- Basic mobile polish
- Manual backup/export later if needed

## Output

App can be installed on phone/tablet and used in a real tindahan test.

## Done When

- App icon appears on home screen.
- App opens in standalone mode.
- App shell loads offline.
- Local data persists.
- Mobile UI feels usable at the counter.

## Real Store Test Checklist

- [ ] Add 20–50 products.
- [ ] Complete cash sales during normal store flow.
- [ ] Record at least one utang sale.
- [ ] Record one partial payment.
- [ ] Record personal kuha.
- [ ] Record GCash/Maya cash-in and cash-out.
- [ ] Check daily report at end of day.
- [ ] Compare expected kaha with actual cash.

---

# Smaller Milestones

## Milestone A — Clickable Shell

Includes:

- Next app
- Mobile layout
- Navigation
- Placeholder screens

Result:

> May app na, nakakaclick around.

---

## Milestone B — Product Manager

Includes:

- Local DB
- Add/edit products
- Product list
- Stock display

Result:

> Pwede na maglista ng paninda.

---

## Milestone C — Cash Sales

Includes:

- Cart
- Checkout
- Cash sale
- Stock deduction
- Cash movement

Result:

> Pwede na makabenta.

---

## Milestone D — Utang Tracker

Includes:

- Suki list
- Utang sale
- Partial sale
- Payment tracking

Result:

> Pwede na palitan ang notebook ng utang.

---

## Milestone E — Kaha Tracker

Includes:

- Starting cash
- Cash movements
- Personal kuha
- Expected kaha

Result:

> Alam na kung saan napunta ang pera.

---

## Milestone F — GCash/Maya Services

Includes:

- Cash-in/out
- Wallet balance
- Service fee income
- Cash/wallet movement

Result:

> Track na ang GCash/Maya transactions.

---

## Milestone G — Daily Reports + PWA

Includes:

- Reports
- Low stock
- Installable app
- Offline shell

Result:

> Ready na for real tindahan testing.

---

# Version Roadmap

## v0.1 — Basic Local POS

- Store setup
- Products
- Cash checkout
- Stock deduction
- Kaha auto cash-in

## v0.2 — Suki / Utang

- Customers
- Utang sale
- Partial payment
- Payment tracking

## v0.3 — Kaha Tracker

- Manual cash-in/out
- Personal kuha
- Starting cash
- Better expected kaha

## v0.4 — GCash/Maya Services

- Wallet balances
- Cash-in/out
- Service fee income

## v0.5 — Reports

- Daily reports
- Low stock
- Service summary
- Utang summary

## v0.6 — PWA Installable

- App icon
- Manifest
- Offline shell
- Mobile polish

## v0.7 — Real Store Testing

- Use in actual store
- Fix UX issues
- Add export/backup if needed

## v1.0 — MVP Release

- Stable local-first app
- Import/export backup
- Polished mobile/tablet UI
- Basic docs

---

# What To Avoid Until Later

Do not build these too early:

- Login/auth
- Cloud sync
- Subscription billing
- Advanced dashboard charts
- Receipt printer
- Barcode scanner
- Multi-user roles
- Admin permissions
- Supplier purchase orders
- Full accounting
- Native Android/iOS app
- GCash/Maya API integration

---

# Development Cycle Per Phase

Use this process for every phase:

1. **Build** the smallest working version.
2. **Test** using sample tindahan data.
3. **Try in a real scenario.**
4. **Fix confusing UI/copy.**
5. **Move to the next phase only when the flow works.**

## Rule

Do not add advanced features until the current phase is usable.
