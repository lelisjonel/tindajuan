# TindaJuan MVP Requirements

## Goal

Build a mobile-first offline PWA that helps sari-sari store owners track:

- Product sales
- Paninda/stocks
- Suki/utang balances
- Kaha cash movements
- GCash/Maya cash-in and cash-out services
- Daily reports

## MVP Positioning

> Simple POS para sa tindahang Pinoy.

Secondary promise:

> Track benta, stocks, utang, kaha, and GCash/Maya services in one simple app.

---

# 1. Store Setup

## Purpose

Personalize the app for one store.

## Fields

```txt
store_name
owner_name optional
contact_number optional
currency = PHP
created_at
updated_at
```

## MVP Behavior

- First app open shows store setup.
- After setup, app opens directly to the main selling flow.
- No login required in local-first MVP.

---

# 2. Benta / Checkout

## Purpose

Allow fast sales using phone/tablet.

## Must-Have Features

- Search product
- Add product to cart
- Increase/decrease quantity
- Remove cart item
- Show total
- Complete cash sale
- Complete utang sale
- Complete partial payment sale
- Auto-deduct stock
- Create cash movement for cash sale
- Create customer ledger entry for utang/partial sale

## Payment Types

```txt
cash
utang
partial
```

## Cash Sale Flow

1. Add products to cart.
2. Tap `Cash`.
3. Enter cash received.
4. Show change.
5. Save sale.
6. Deduct inventory.
7. Add cash movement: `cash_in / cash_sale`.

## Utang Sale Flow

1. Add products to cart.
2. Tap `Utang`.
3. Select or add suki.
4. Save sale.
5. Deduct inventory.
6. Add customer ledger entry.
7. Do not add cash movement, because no cash was received.

## Partial Payment Flow

1. Add products to cart.
2. Tap `Partial`.
3. Select or add suki.
4. Enter amount paid.
5. Save sale.
6. Deduct inventory.
7. Add cash movement for amount paid.
8. Add customer ledger entry for remaining balance.

---

# 3. Paninda / Products

## Purpose

Manage products and stocks.

## Must-Have Features

- Add product
- Edit product
- Archive product
- Search products
- View low stock products
- Manual stock adjustment

## Product Fields

```txt
id
name
category optional
selling_price
cost_price
stock_quantity
unit
low_stock_threshold
is_active
created_at
updated_at
```

## Units

Initial unit choices:

```txt
pcs
pack
bottle
sachet
kilo
half_kilo
liter
other
```

## Inventory Rules

- Sales reduce stock.
- Restock increases stock.
- Adjustments can increase or decrease stock.
- Archived products should not appear in checkout but remain in old sales history.

---

# 4. Suki / Utang

## Purpose

Replace notebook-style credit tracking.

## Must-Have Features

- Add customer/suki
- View customer balance
- Record utang sale
- Record partial payment
- Record payment
- View customer history

## Customer Fields

```txt
id
name
phone optional
notes optional
balance
created_at
updated_at
```

## Ledger Types

```txt
credit_sale
payment
adjustment
```

## Rules

- Utang sale increases customer balance.
- Partial sale increases balance only by unpaid amount.
- Payment decreases balance.
- Payment also creates `cash_in / utang_payment` movement.

---

# 5. Kaha

## Purpose

Track money movement in the cash drawer, including business and personal cash use.

## Must-Have Features

- Set starting cash
- Auto cash-in from cash sales
- Auto cash-in from utang payments
- Manual cash-in
- Manual cash-out
- Expected kaha calculation
- Daily cash movement list

## Cash In Categories

```txt
cash_sale
utang_payment
service_fee
service_cash_in
added_capital
other_cash_in
```

## Cash Out Categories

```txt
restock
personal_kuha
bills
groceries
store_expense
service_cash_out
other_cash_out
```

## Expected Kaha Formula

```txt
Expected Kaha = starting_cash + total_cash_in - total_cash_out
```

## Important Rule

Personal kuha affects **kaha**, not business profit.

Example:

```txt
Sales: ₱5,000
Cost: ₱3,500
Estimated Profit: ₱1,500
Personal Kuha: ₱1,000
```

Estimated profit remains ₱1,500, but expected kaha decreases by ₱1,000.

---

# 6. Services: GCash/Maya

## Purpose

Track high-traffic e-wallet services common in sari-sari stores.

## Supported MVP Services

```txt
GCash Cash-In
GCash Cash-Out
Maya Cash-In
Maya Cash-Out
```

## Fields

```txt
provider: gcash | maya
type: cash_in | cash_out
amount
service_fee
fee_method
reference_number optional
customer_name optional
notes optional
created_at
```

## Cash-In Default Behavior

Customer gives cash and fee. Store sends wallet balance.

```txt
Kaha + amount + service_fee
Wallet - amount
Service income + service_fee
```

## Cash-Out Default Behavior

Customer sends wallet money. Store gives cash minus fee.

```txt
Wallet + amount
Kaha - (amount - service_fee)
Service income + service_fee
```

## Important Rule

GCash/Maya transaction amount is not product sales. Only the service fee is income.

---

# 7. Reports

## Daily Report Cards

- Benta today
- Estimated product profit
- Service fee income
- Cash sales
- Utang sales
- Utang payments
- Cash out
- Expected kaha
- Total customer utang
- Low stock count
- GCash balance
- Maya balance

## Report Rule

Separate product sales from service transactions.

Example:

```txt
Product Sales: ₱4,200
Service Volume: ₱12,000
Service Fee Income: ₱240
Estimated Product Profit: ₱850
```

Do not combine service volume into product sales.
