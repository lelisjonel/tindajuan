# TindaJuan App Test Checklist

Use this checklist with **demo/test amounts only**. Mark each item as ✅ Pass, ❌ Fail, or ⚠️ Needs Improvement.

## Test information

- Test date: ____________________
- Device: ____________________
- Browser: ____________________
- Screen size/orientation: ____________________
- App URL: ____________________
- Tester: ____________________

## Test result legend

- [ ] ✅ Pass
- [ ] ❌ Fail
- [ ] ⚠️ Needs Improvement
- Notes: __________________________________________________________

---

## 1. First launch and store setup

- [ ] Open `http://localhost:3000`.
- [ ] App loads without a blank screen or major error.
- [ ] TindaJuan branding appears correctly.
- [ ] First launch shows Store Setup when no store exists.
- [ ] Store name is required.
- [ ] Owner name is optional.
- [ ] Contact number is optional.
- [ ] Cannot save an empty store name.
- [ ] Save a test store profile.
- [ ] App redirects to the main app after setup.
- [ ] Refresh the browser.
- [ ] Store profile remains saved after refresh.
- [ ] Settings shows the saved store information.

Notes: __________________________________________________________

## 2. Demo data

- [ ] Reset local data if needed.
- [ ] Load Demo Data.
- [ ] Demo products appear.
- [ ] Demo Suki/customers appear.
- [ ] GCash wallet balance appears.
- [ ] Maya wallet balance appears.
- [ ] Starting Kaha cash appears.
- [ ] Refresh the page.
- [ ] Demo data remains available after refresh.

Notes: __________________________________________________________

## 3. Navigation and responsive layout

- [ ] Bottom navigation appears on mobile width.
- [ ] Desktop sidebar appears on desktop width.
- [ ] Benta route opens.
- [ ] Services route opens.
- [ ] Paninda route opens.
- [ ] Suki route opens.
- [ ] Menu route opens.
- [ ] Kaha route opens.
- [ ] Reports route opens.
- [ ] Settings route opens.
- [ ] No horizontal scrolling on mobile.
- [ ] Buttons are large enough to tap.
- [ ] Text is readable without zooming.
- [ ] Cards and forms do not overlap.
- [ ] Test both portrait and landscape if possible.

Notes: __________________________________________________________

## 4. Paninda / product management

### Add product

- [ ] Open Paninda.
- [ ] Add a test product, for example: `Test Milo`.
- [ ] Enter selling price.
- [ ] Enter cost price.
- [ ] Enter stock quantity.
- [ ] Enter unit.
- [ ] Enter low-stock threshold.
- [ ] Save the product.
- [ ] Product appears in the list.

### Search, edit, archive

- [ ] Search for the test product.
- [ ] Search returns the correct product.
- [ ] Edit the selling price.
- [ ] Edit the stock quantity.
- [ ] Save changes.
- [ ] Updated values appear correctly.
- [ ] Archive the test product.
- [ ] Archived product no longer appears as an active product.

### Stock adjustment

- [ ] Increase product stock.
- [ ] Confirm stock quantity increases correctly.
- [ ] Decrease product stock.
- [ ] Confirm stock quantity decreases correctly.
- [ ] Try reducing stock below zero.
- [ ] App rejects invalid stock adjustment.
- [ ] Low-stock badge appears when stock reaches the threshold.

Notes: __________________________________________________________

## 5. Benta / cash checkout

- [ ] Open Benta.
- [ ] Search for a product.
- [ ] Add one product to the cart.
- [ ] Add multiple products to the cart.
- [ ] Increase item quantity.
- [ ] Decrease item quantity.
- [ ] Remove an item.
- [ ] Cart total is correct.
- [ ] Enter exact cash received.
- [ ] Change shows `₱0.00`.
- [ ] Enter more cash than the total.
- [ ] Change is calculated correctly.
- [ ] Complete the cash sale.
- [ ] Sale success status appears.
- [ ] Cart clears after checkout.
- [ ] Product stock decreases correctly.
- [ ] Cash movement is created.
- [ ] Expected Kaha increases by the sale total only.
- [ ] Try selling more than available stock.
- [ ] App prevents overselling.
- [ ] Refresh and confirm the sale remains saved.

Notes: __________________________________________________________

## 6. Suki / Utang

### Customer

- [ ] Open Suki.
- [ ] Add a test customer.
- [ ] Enter name.
- [ ] Enter optional phone number.
- [ ] Add optional notes.
- [ ] Save the customer.
- [ ] Customer appears in the list.
- [ ] Search for the customer.
- [ ] Edit the customer.
- [ ] Updated information appears correctly.

### Utang sale

- [ ] Open Benta.
- [ ] Select `Utang` payment type.
- [ ] Select the test customer.
- [ ] Complete an utang sale.
- [ ] Product stock decreases.
- [ ] Customer balance increases.
- [ ] Expected Kaha does not increase for the unpaid amount.
- [ ] Sale appears in the customer ledger.

### Partial payment

- [ ] Make a partial-payment sale.
- [ ] Enter an amount paid less than the total.
- [ ] Paid amount is recorded correctly.
- [ ] Remaining balance is correct.
- [ ] Cash increases only by the paid amount.
- [ ] Customer balance increases only by the unpaid amount.

### Customer payment

- [ ] Open the customer balance.
- [ ] Record a cash payment.
- [ ] Customer balance decreases correctly.
- [ ] Payment appears in the ledger.
- [ ] Expected Kaha increases by the payment amount.
- [ ] Try recording a payment larger than the customer balance.
- [ ] App handles/rejects it safely.

Notes: __________________________________________________________

## 7. Kaha Tracker

- [ ] Open Kaha.
- [ ] Confirm today’s business date.
- [ ] Set starting cash, for example `₱500.00`.
- [ ] Starting cash saves successfully.
- [ ] Expected Kaha shows the starting cash.
- [ ] Record Cash-In: Added Capital.
- [ ] Expected Kaha increases.
- [ ] Record Cash-In: Other Cash In.
- [ ] Record Cash-Out: Personal Kuha.
- [ ] Expected Kaha decreases.
- [ ] Record Cash-Out: Restock.
- [ ] Record Cash-Out: Bills.
- [ ] Record Cash-Out: Groceries.
- [ ] Record Cash-Out: Store Expense.
- [ ] Add notes to a movement.
- [ ] Movement appears in the list.
- [ ] Cash-in total is correct.
- [ ] Cash-out total is correct.
- [ ] Try saving zero amount.
- [ ] Try saving negative amount.
- [ ] App rejects invalid amounts.
- [ ] Confirm personal kuha affects Kaha but not product profit.

Expected Kaha formula:

```txt
Starting cash + cash-in - cash-out = Expected Kaha
```

Notes: __________________________________________________________

## 8. GCash / Maya Services

### GCash cash-in

- [ ] Open Services.
- [ ] Select GCash.
- [ ] Select Cash-In.
- [ ] Use test amount `₱500.00`.
- [ ] Use test fee `₱10.00`.
- [ ] Add optional customer name.
- [ ] Add optional reference number.
- [ ] Record the service.
- [ ] GCash wallet decreases by `₱500.00`.
- [ ] Kaha increases by `₱510.00`.
- [ ] Service fee income increases by `₱10.00`.
- [ ] Service history shows the transaction.

### GCash cash-out

- [ ] Select GCash Cash-Out.
- [ ] Use test amount `₱500.00`.
- [ ] Use test fee `₱10.00`.
- [ ] Record the service.
- [ ] GCash wallet increases by `₱500.00`.
- [ ] Kaha decreases by `₱490.00`.
- [ ] Service fee income increases by `₱10.00`.

### Maya

- [ ] Repeat Cash-In using Maya.
- [ ] Maya wallet decreases by the service amount.
- [ ] Kaha increases by amount plus fee.
- [ ] Repeat Cash-Out using Maya.
- [ ] Maya wallet increases by the service amount.
- [ ] Kaha decreases by amount minus fee.

### Validation

- [ ] Try zero service amount.
- [ ] Try negative service amount.
- [ ] Try negative service fee.
- [ ] Try a fee greater than the cash-out amount.
- [ ] Try cash-in greater than the wallet balance.
- [ ] App rejects invalid transactions safely.

Important rule:

```txt
Service volume is not product sales.
Only the service fee is income.
```

Notes: __________________________________________________________

## 9. Reports

- [ ] Open Reports.
- [ ] Daily date is correct.
- [ ] Product Sales is correct.
- [ ] Estimated Product Profit is shown.
- [ ] Service Fee Income is separate from service volume.
- [ ] Cash Sales is correct.
- [ ] Utang Sales is correct.
- [ ] Utang Payments is correct.
- [ ] Cash Out is correct.
- [ ] Expected Kaha matches the Kaha screen.
- [ ] Total Utang matches Suki balances.
- [ ] Low Stock count is correct.
- [ ] Low-stock product names are listed.
- [ ] GCash Balance is correct.
- [ ] Maya Balance is correct.
- [ ] Use Refresh Report after adding new transactions.
- [ ] Confirm the report updates correctly.

Notes: __________________________________________________________

## 10. Refresh and persistence

- [ ] Add a product, then refresh.
- [ ] Product remains saved.
- [ ] Complete a sale, then refresh.
- [ ] Sale remains saved.
- [ ] Check customer balance after refresh.
- [ ] Check Kaha movements after refresh.
- [ ] Check service history after refresh.
- [ ] Check Reports after refresh.
- [ ] Close and reopen the browser.
- [ ] Local data remains available.

Notes: __________________________________________________________

## 11. PWA and offline test

For the most accurate test, run:

```bash
npm run build
npm run start
```

- [ ] Open the production app on a supported browser.
- [ ] Confirm the manifest loads.
- [ ] Browser offers Install / Add to Home Screen.
- [ ] Install TindaJuan.
- [ ] App opens in standalone mode.
- [ ] TindaJuan icon appears correctly.
- [ ] Open the app once while online.
- [ ] Temporarily disable network access.
- [ ] Reopen the app.
- [ ] Offline fallback appears instead of a browser error.
- [ ] Reconnect to the internet.
- [ ] Refresh the app.
- [ ] IndexedDB data is still present.

Notes: __________________________________________________________

## 12. End-of-day real-store simulation

Use test data first. Do not use real customer information or real wallet transactions yet.

- [ ] Set starting cash: `₱500.00`.
- [ ] Complete a cash sale.
- [ ] Complete an utang sale.
- [ ] Record a partial payment.
- [ ] Record a Personal Kuha.
- [ ] Record a restock cash-out.
- [ ] Record a GCash cash-in.
- [ ] Record a Maya cash-out.
- [ ] Open Reports.
- [ ] Compare Expected Kaha with the simulated actual cash.
- [ ] Compare wallet balances with the simulated wallet records.
- [ ] Note every difference or confusing step.

Notes: __________________________________________________________

---

# Bug report template

## Bug #____

- Date/time: ____________________
- Screen/route: ____________________
- Device/browser: ____________________
- Steps to reproduce:
  1. ________________________________________________
  2. ________________________________________________
  3. ________________________________________________
- Expected result: ____________________________________
- Actual result: ______________________________________
- Severity:
  - [ ] Blocking
  - [ ] High
  - [ ] Medium
  - [ ] Low
- Screenshot/video filename: __________________________

---

# Final test summary

- Passed: ______
- Failed: ______
- Needs improvement: ______
- Blocking issues: ______
- Safe for limited real-store trial?
  - [ ] Yes
  - [ ] No

Top 3 issues to fix:

1. __________________________________________________
2. __________________________________________________
3. __________________________________________________
