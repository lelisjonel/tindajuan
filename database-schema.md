# TindaJuan Database Schema

This document defines the MVP local-first data model and future Supabase/PostgreSQL cloud schema.

## Database Strategy

### MVP

Use **IndexedDB via Dexie.js** for local-first storage.

### Later

Use **Supabase PostgreSQL** for cloud backup/sync.

## ID Strategy

Use UUIDs generated client-side so local records can sync later without ID conflicts.

Recommended:

```ts
crypto.randomUUID()
```

## Common Fields

Most tables should include:

```txt
id
created_at
updated_at
deleted_at optional
sync_status: pending | synced | failed
last_synced_at optional
```

---

# 1. stores

```txt
id
name
owner_name optional
contact_number optional
currency default PHP
created_at
updated_at
```

Notes:

- Local MVP likely supports one store only.
- Cloud version can support multiple stores per account.

---

# 2. products

```txt
id
store_id
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

## Rules

- `selling_price` and `cost_price` should be stored in centavos or integer minor units when possible.
- If using decimal in UI, normalize before saving.
- Archive products with `is_active = false` instead of hard delete.

---

# 3. inventory_movements

```txt
id
store_id
product_id
type: sale | restock | adjustment | return | damage | loss | personal_use
quantity
previous_stock
new_stock
reason optional
notes optional
sale_id optional
created_at
updated_at
```

## Rules

- Every stock-changing action creates an inventory movement.
- Sale completion creates `type = sale` movement.
- Manual adjustment creates `type = adjustment` movement.

---

# 4. sales

```txt
id
store_id
customer_id optional
payment_type: cash | utang | partial
total_amount
amount_paid
balance_amount
estimated_profit
status: completed | voided
created_at
updated_at
```

## Rules

- Cash sale: `amount_paid = total_amount`, `balance_amount = 0`
- Utang sale: `amount_paid = 0`, `balance_amount = total_amount`
- Partial sale: `amount_paid > 0`, `balance_amount = total_amount - amount_paid`

---

# 5. sale_items

```txt
id
store_id
sale_id
product_id
product_name_snapshot
quantity
unit_price
cost_price
subtotal
estimated_profit
created_at
updated_at
```

## Why snapshots?

Product names/prices can change later. Sale history must preserve what was sold at that time.

---

# 6. customers

```txt
id
store_id
name
phone optional
notes optional
balance
created_at
updated_at
```

## Rules

- Balance is current unpaid amount.
- Customer history is stored in `customer_ledger`.

---

# 7. customer_ledger

```txt
id
store_id
customer_id
type: credit_sale | payment | adjustment
amount
balance_after
sale_id optional
payment_id optional
notes optional
created_at
updated_at
```

## Rules

- `credit_sale` increases balance.
- `payment` decreases balance.
- `adjustment` can increase/decrease depending on amount sign or explicit direction.

---

# 8. payments

```txt
id
store_id
customer_id
sale_id optional
amount
payment_method: cash | gcash | maya | other
notes optional
created_at
updated_at
```

## Rules

- Cash payment creates cash movement `cash_in / utang_payment`.
- GCash/Maya payment can create wallet movement later if supported.

---

# 9. cash_days

Tracks daily starting cash.

```txt
id
store_id
business_date
starting_cash
created_at
updated_at
```

## Rules

- One record per store per business date.
- Expected kaha is calculated from starting cash + movements.

---

# 10. cash_movements

```txt
id
store_id
business_date
type: cash_in | cash_out
category
amount
source: manual | sale | payment | service | adjustment
sale_id optional
payment_id optional
service_transaction_id optional
notes optional
created_at
updated_at
```

## Cash In Categories

```txt
cash_sale
utang_payment
service_cash_in
service_fee
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

---

# 11. wallets

Tracks available e-wallet balances.

```txt
id
store_id
provider: gcash | maya
name
current_balance
created_at
updated_at
```

## MVP Providers

```txt
gcash
maya
```

---

# 12. service_transactions

```txt
id
store_id
provider: gcash | maya
type: cash_in | cash_out
amount
service_fee
fee_method: add_on_top | deduct_from_amount
reference_number optional
customer_name optional
notes optional
created_at
updated_at
```

## Cash-In Default

```txt
provider = gcash | maya
type = cash_in
fee_method = add_on_top
```

Effects:

```txt
Cash movement: cash_in amount + service_fee
Wallet movement: out amount
Service fee income: service_fee
```

## Cash-Out Default

```txt
provider = gcash | maya
type = cash_out
fee_method = deduct_from_amount
```

Effects:

```txt
Wallet movement: in amount
Cash movement: cash_out amount - service_fee
Service fee income: service_fee
```

---

# 13. wallet_movements

```txt
id
store_id
wallet_id
provider: gcash | maya
type: wallet_in | wallet_out
category: cash_in_service | cash_out_service | top_up | transfer_out | adjustment
amount
previous_balance
new_balance
service_transaction_id optional
notes optional
created_at
updated_at
```

---

# Derived Calculations

## Estimated Product Profit

```txt
sum(sale_items.estimated_profit)
```

Where:

```txt
estimated_profit = (unit_price - cost_price) * quantity
```

## Service Fee Income

```txt
sum(service_transactions.service_fee)
```

## Expected Kaha

```txt
cash_days.starting_cash
+ sum(cash_movements where type = cash_in)
- sum(cash_movements where type = cash_out)
```

## Customer Total Utang

```txt
sum(customers.balance)
```

## Low Stock Products

```txt
products where stock_quantity <= low_stock_threshold and is_active = true
```

---

# Dexie Table Example

```ts
export const db = new Dexie('tindajuan');

 db.version(1).stores({
  stores: 'id, name, created_at',
  products: 'id, store_id, name, category, is_active, updated_at',
  inventory_movements: 'id, store_id, product_id, type, created_at',
  sales: 'id, store_id, customer_id, payment_type, created_at',
  sale_items: 'id, store_id, sale_id, product_id',
  customers: 'id, store_id, name, phone, updated_at',
  customer_ledger: 'id, store_id, customer_id, type, created_at',
  payments: 'id, store_id, customer_id, created_at',
  cash_days: 'id, store_id, business_date',
  cash_movements: 'id, store_id, business_date, type, category, created_at',
  wallets: 'id, store_id, provider',
  service_transactions: 'id, store_id, provider, type, created_at',
  wallet_movements: 'id, store_id, provider, type, created_at'
});
```

Remove the extra leading space before `db.version` when implemented.
