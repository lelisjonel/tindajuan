# AyosTinda Phase 17 Pilot Store Testing Pack

Use this checklist for a controlled pilot with one store owner or one to three additional testers before public release.

## Pilot goal

Confirm that AyosTinda is useful, understandable, and safe during normal store work—not only during a scripted demo.

Production URL: https://tindajuan.vercel.app

## Pilot rules

- Use a dedicated pilot browser profile or device when possible.
- Start with demo/test amounts and test customer information.
- Export a backup before the first pilot day and at the end of each day.
- Do not connect official GCash/Maya APIs; record test transactions only.
- Do not use sensitive customer information unless the store owner explicitly approves it.
- If a balance looks wrong, stop the flow and record the issue before making corrections.

## Pilot setup checklist

- [ ] Confirm the phone/tablet browser and device owner.
- [ ] Confirm the device has enough battery and stable storage.
- [ ] Open the production URL and complete store setup.
- [ ] Read the Data Safety Notice with the tester.
- [ ] Export and save a backup file before entering pilot data.
- [ ] Import `ayostinda-phase15-test-inventory.csv` or enter at least 20 real store products.
- [ ] Confirm product prices, costs, units, stock, and low-stock thresholds.
- [ ] Record the starting Kaha amount.
- [ ] Record starting GCash and Maya test wallet balances.

## Daily pilot workflow

### Opening

- [ ] Open AyosTinda without assistance.
- [ ] Confirm the store profile and today’s starting Kaha.
- [ ] Review low-stock products.
- [ ] Confirm the tester knows where to create a backup.

### During store operations

- [ ] Complete at least five normal cash sales.
- [ ] Confirm the product stock decreases after each sale.
- [ ] Record one Utang sale.
- [ ] Record one partial payment and verify the remaining balance.
- [ ] Record one full Suki payment.
- [ ] Record one Personal Kuha.
- [ ] Record one store expense or restock cash-out.
- [ ] Record one GCash cash-in and cash-out.
- [ ] Record one Maya cash-in or cash-out.
- [ ] Record one Load transaction.
- [ ] Record one Bills Payment transaction.
- [ ] Use Reports at least once without coaching.

### Closing

- [ ] Compare Expected Kaha with the test cash drawer.
- [ ] Compare GCash and Maya balances with the test wallet balances.
- [ ] Review today’s sales, service fees, utang balance, expenses, and low stock.
- [ ] Export a backup after the pilot day.
- [ ] Confirm the backup file exists and can be opened as JSON.
- [ ] Ask the tester what was faster than paper.
- [ ] Ask the tester what was confusing or slow.

## Pilot success measures

Record the result after each pilot day:

| Measure | Target | Result |
|---|---|---|
| Tester can open and use Benta without help | Yes | |
| Normal sale completion time | Faster or equal to notebook | |
| Incorrect totals or stock deductions | 0 | |
| Kaha reconciliation difference | 0 or explained | |
| Wallet reconciliation difference | 0 or explained | |
| Backup exported successfully | Yes | |
| Data-loss incidents | 0 | |
| Blocking issues | 0 | |

## Issue and feedback log

Copy this section for every finding.

```text
Date:
Tester:
Device/browser:
Screen or workflow:

What happened:
Expected result:
Actual result:
Severity: Blocker / Major / Minor / Suggestion
Could the tester continue? Yes / No
Screenshot or backup reference:
Suggested fix:
```

## Severity guide

- **Blocker:** Cannot complete a sale, payment, service, backup, or reconciliation.
- **Major:** Incorrect balance, stock, or report; or the tester needs repeated assistance.
- **Minor:** Small copy, spacing, or layout issue that does not block work.
- **Suggestion:** Improvement idea for a later release.

## Pilot sign-off

- [ ] At least one tester completed a normal opening-to-closing workflow.
- [ ] At least three pilot sessions were observed, or the owner approved an equivalent test period.
- [ ] No unresolved Blocker issues remain.
- [ ] Kaha and wallet balances were reconciled.
- [ ] Backup files were exported and checked after the pilot sessions.
- [ ] Tester feedback was reviewed and grouped into fixes, documentation, or later ideas.

Pilot owner: ____________________

Tester(s): ____________________

Pilot dates: ____________________

Overall result: PASS / PASS WITH FIXES / NOT READY

Notes:

__________________________________________________________________

__________________________________________________________________
