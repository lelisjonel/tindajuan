# TindaJuan Design System

## Brand Direction

TindaJuan should feel:

- Local
- Friendly
- Practical
- Trustworthy
- Simple
- Mobile-first
- Non-intimidating

Brand statement:

> TindaJuan is a simple mobile-first POS and tindahan tracker built for Filipino sari-sari store owners.

## Logo Direction

Recommended concept:

> **Storefront + TJ monogram**

Suggested visual elements:

- Rounded square app icon
- Simple storefront awning
- `TJ` monogram integrated into the store shape
- Green base
- Warm orange/yellow accent
- White icon lines

Avoid:

- Tiny product illustrations
- Overly detailed sari-sari store drawings
- Too many colors in the app icon
- Generic shopping cart-only logo

---

# Colors

## Primary Palette

```txt
Primary Green: #16A34A
Dark Green:    #14532D
Warm Orange:   #F97316
Soft Yellow:   #FACC15
Background:    #FFFDF7
Surface:       #FFFFFF
Text Dark:     #1F2937
Text Muted:    #6B7280
Border:        #E5E7EB
Danger:        #DC2626
Success:       #16A34A
Warning:       #F59E0B
Info:          #2563EB
```

## Usage

- Green: primary actions, success, active nav
- Orange/yellow: highlights, service-related accents, warning-light emphasis
- Red: destructive actions, negative balances, failed sync
- Blue: informational states
- Neutral white/off-white: app background and cards

---

# Typography

Recommended fonts:

```txt
Primary UI Font: Plus Jakarta Sans
Alternative: Nunito Sans
Fallback: Inter, system-ui, sans-serif
```

## Font Usage

```txt
Page Title: 24px / 700
Section Title: 18px / 700
Card Label: 13px / 500
Card Value: 24px / 700
Body: 15px / 400
Button: 15px / 600
Small Help Text: 12px / 400
```

---

# Voice and Labels

Use simple Taglish labels.

## Preferred Terms

| Generic/Technical | TindaJuan Label |
|---|---|
| Inventory | Paninda / Stocks |
| Sales | Benta |
| Accounts Receivable | Utang |
| Customer | Suki |
| Cash Drawer | Kaha |
| Expense | Cash Out / Lumabas sa Kaha |
| Revenue | Benta / Kita |
| Transaction | Record / Galaw |

## Tone

Good examples:

```txt
Magkano ang pumasok sa kaha?
Na-record na ang bayad ni Maria.
Low stock na ang Milo Sachet.
Expected kaha mo ngayon: ₱1,850.
```

Avoid:

```txt
Accounts receivable updated.
Inventory reconciliation completed.
Owner equity withdrawal recorded.
```

---

# Mobile-First Layout Rules

## Navigation

Recommended bottom nav:

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
Export/Backup later
```

Reason: `Benta` and `Services` are high-frequency actions at the counter.

## Touch Targets

```txt
Minimum button height: 44px
Preferred main action height: 48–56px
Minimum icon button: 40px x 40px
Input height: 44–48px
Bottom nav height: 64–72px
```

## Mobile UI Principles

1. Big buttons.
2. Minimal typing.
3. Quick action buttons for common tasks.
4. Clear totals.
5. Keep critical actions reachable by thumb.
6. Avoid dense tables on phone.
7. Use cards/lists on phone, tables on desktop.

---

# Responsive Layouts

## Phone

Use single-column layout.

Checkout example:

```txt
Search product
Product list/cards
Cart summary sticky bottom
Payment actions
```

## Tablet

Use split checkout layout.

```txt
Left: Product search/grid
Right: Cart and payment
```

## Desktop

Use sidebar/dashboard layout.

```txt
Left sidebar navigation
Main content tables/cards
Right detail panel optional
```

---

# Component Guidelines

## Button Variants

```txt
Primary: Complete Sale, Save, Record Payment
Secondary: Cancel, Back, Edit
Danger: Delete, Archive, Reset Data
Outline: Filters, optional actions
Ghost: icon-only actions
```

## Cards

Use cards for dashboard summaries:

```txt
Card Title
Main Value
Small helper text
Trend/status badge optional
```

Examples:

```txt
Expected Kaha
₱1,850
Based on today's recorded cash movements
```

```txt
Service Fee Income
₱240
From GCash/Maya transactions today
```

## Forms

Use short forms and sensible defaults.

Product form:

```txt
Product Name
Selling Price
Cost Price
Stock Quantity
Unit
Low Stock Alert
```

Service transaction form:

```txt
Provider
Type
Amount
Service Fee
Reference No. optional
Notes optional
```

---

# Status Badges

```txt
Synced: green
Pending Sync: yellow
Failed Sync: red
Low Stock: orange
Archived: gray
Utang: red/orange
Paid: green
Partial: yellow
```

---

# Empty States

Examples:

## No products

```txt
Wala pang paninda.
Mag-add muna ng product para makapagbenta.
[ Add Product ]
```

## No suki

```txt
Wala pang suki record.
Mag-add ng customer kapag may uutang.
[ Add Suki ]
```

## No service transactions

```txt
Wala pang GCash/Maya transaction today.
[ Record Cash-In ] [ Record Cash-Out ]
```

---

# Important UX Warnings

## Personal Kuha

When user records `Personal Kuha`, show helper text:

```txt
Nababawas ito sa kaha, pero hindi ito binabawas sa kita ng tindahan.
```

## Service Volume

In reports, show helper text:

```txt
GCash/Maya amount is service volume. Service fee lang ang income.
```

## Expected Kaha

```txt
Expected kaha is based on recorded movements. Kung may hindi na-record, maaaring iba ang actual cash.
```
