# TindaJuan Offline-First Strategy

## Goal

TindaJuan must work even when internet is unavailable.

For sari-sari store use, checkout and service tracking cannot depend on internet.

## Principle

> Local data first. Cloud sync second.

## MVP Approach

Phase 1 should use local IndexedDB only.

```txt
App UI → Local DB / IndexedDB → Reports from local data
```

No login required for the first prototype.

## Future Cloud Approach

After validation, add Supabase sync.

```txt
App UI → Local DB → Sync Queue → Supabase
```

The UI should still read from local data first, even after cloud is added.

---

# Local-First Requirements

These actions must work offline:

- Add/edit product
- Checkout sale
- Record cash sale
- Record utang sale
- Record partial payment sale
- Record suki payment
- Record cash in/out
- Record GCash/Maya cash-in
- Record GCash/Maya cash-out
- View daily reports
- View customer balances
- View stock levels

---

# Sync Status

Every record that may sync later should have:

```txt
sync_status: pending | synced | failed
last_synced_at optional
sync_error optional
```

## Status Meaning

```txt
pending = created/changed locally but not yet uploaded
synced = successfully uploaded
failed = upload attempted but failed
```

---

# Sync Queue

For future cloud sync, create a queue of operations.

```txt
id
entity_type
entity_id
operation: create | update | delete
payload
status: pending | processing | synced | failed
attempt_count
last_error optional
created_at
updated_at
```

## Sync Rules

1. Write to local DB first.
2. Add sync queue entry.
3. UI updates immediately from local DB.
4. Background sync uploads when online.
5. If sync fails, mark as failed but keep local data.

---

# Conflict Strategy

For MVP cloud sync, avoid complex conflicts by using one-owner/single-device assumptions first.

Later multi-device conflict rules:

## Recommended Defaults

- Products: latest `updated_at` wins.
- Customer balance: never merge by overwriting only; recompute from ledger when possible.
- Cash movements: append-only; do not edit/delete silently.
- Sales: append-only; void instead of delete.
- Service transactions: append-only; void/correction instead of delete.

## Safer Rule

Important money records should be append-only:

```txt
sales
sale_items
cash_movements
customer_ledger
service_transactions
wallet_movements
```

If correction is needed, create a reversal or adjustment record.

---

# PWA Offline Behavior

## Cache

Cache:

- App shell
- CSS/JS assets
- Icons
- Offline page

Do not rely on cached API responses for financial data. Use IndexedDB.

## Installability

Add:

```txt
manifest.json
app icons
service worker
mobile viewport
theme color
```

Recommended app name:

```txt
TindaJuan
```

Short name:

```txt
TindaJuan
```

Theme color:

```txt
#16A34A
```

---

# Data Integrity Rules

## Sale Completion Must Be Atomic

When saving a sale, these must succeed together locally:

1. Create sale
2. Create sale items
3. Deduct inventory
4. Create inventory movements
5. Create cash movement if cash/partial
6. Create customer ledger if utang/partial

If any part fails, rollback or do not complete sale.

## Service Transaction Must Be Atomic

When saving GCash/Maya transaction, these must succeed together locally:

1. Create service transaction
2. Create wallet movement
3. Update wallet balance
4. Create cash movement
5. Include service fee in report calculations

## Customer Payment Must Be Atomic

1. Create payment
2. Update customer balance
3. Create customer ledger entry
4. Create cash movement if cash payment

---

# Offline Indicators

Show sync/internet status but do not block app usage.

Examples:

```txt
Offline mode — records are saved on this device.
Pending sync: 12 records
All records synced
Sync failed — tap to retry
```

---

# Backup/Export MVP Recommendation

Before full cloud sync, add manual export/import later.

Possible formats:

- JSON backup
- CSV exports for reports

This helps avoid data loss while app is local-only.
