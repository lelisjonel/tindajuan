# TindaJuan Phase 11 Real Store Test Checklist

Use the production build on a phone or tablet before relying on TindaJuan during store operations.

## Production test setup

```bash
npm run build
npm run start
```

Open the LAN URL shown by Next.js from the phone/tablet while both devices are on the same Wi-Fi network. For install/offline testing, use HTTPS or localhost because service workers require a secure context.

## Test data and flows

- [ ] Create or load the demo store profile.
- [ ] Add 20–50 real sample products with selling price, cost price, unit, stock, and low-stock threshold.
- [ ] Complete at least 5 normal cash sales from the Benta screen.
- [ ] Verify stock decreases after every sale.
- [ ] Verify the cash amount is the sale total, not the cash received.
- [ ] Record one Utang sale for an actual test customer.
- [ ] Record one partial payment and confirm the remaining balance.
- [ ] Record one full Suki payment and confirm the ledger.
- [ ] Set the day’s starting cash in Kaha.
- [ ] Record a Personal Kuha cash-out.
- [ ] Record a restock, bill, or store-expense cash-out.
- [ ] Record a GCash cash-in and confirm wallet/Kaha changes.
- [ ] Record a GCash cash-out and confirm wallet/Kaha changes.
- [ ] Repeat one service transaction using Maya.
- [ ] Open Reports and verify product sales, service fees, utang, Kaha, wallets, and low stock are separated.

## Offline/PWA test

- [ ] Install TindaJuan from the browser’s Add to Home Screen / Install option.
- [ ] Confirm the standalone app opens with TindaJuan branding.
- [ ] Open the app once while online so the shell is cached.
- [ ] Temporarily disable network access.
- [ ] Reopen the app and confirm the offline fallback appears instead of a browser error.
- [ ] Reconnect and refresh.
- [ ] Confirm local IndexedDB records are still present.

## End-of-day reconciliation

- [ ] Compare Expected Kaha with the actual cash drawer.
- [ ] Investigate every difference using the cash movement list.
- [ ] Compare GCash and Maya balances with the actual wallet balances.
- [ ] Review low-stock products before restocking.
- [ ] Record confusing labels, slow screens, or counter-flow friction for the next polish pass.

## Safety note

Use test amounts and test wallet balances first. Do not connect real GCash/Maya APIs or use real customer personal information until backup/export and real-store validation are complete.
