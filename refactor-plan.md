# Refactor Plan for Used Car Dealer App

This plan is aligned with the finalized backend schema in [`database.sql`](database.sql), which uses a unified transactions model (transactions + journal_items) with DB triggers for auto-posting.

## 1) Backend Data Model (what we have and why)
- Unified postings: transactions row per domain event (sale, purchase, expense, tax, manual) and many journal_items rows for double-entry.
- COA groups + helper get_coa_by_group_prefix() for stable account resolution across companies.
- RLS via auth.uid() → users.company_id, with WITH CHECK on writes.
- Safeguards: unique index on (company_id, source_document, source_id), cross-company guards in triggers, COGS posting on sale, journal immutability, single main image per car.

Implication for code: app services should create domain rows (sales, purchases, expenses), not journal rows. The DB posts accounting entries.

## 2) RLS and Integrity Policies (summarized)
- All writable tables use SELECT/INSERT/UPDATE policies with WITH CHECK enforcing company_id = session company_id.
- Triggers reject cross-company references (e.g., sales.car_id must belong to same company).
- Journal rows are immutable; corrections require new reversing transactions.

## 3) Services and Reuse Strategy
Centralize shared logic in these two existing utilities:
- [`src/app/utils/functions/utilFunctions.ts`](src/app/utils/functions/utilFunctions.ts)
- [`src/app/lib/dbFunction.ts`](src/app/lib/dbFunction.ts)

Guidelines:
- dbFunction.ts: server-side Supabase accessors and domain operations (create sale/purchase/customer/car, query reports, call RPCs/Views).
- utilFunctions.ts: pure helpers (formatting, guards, mapping DTOs), light client-safe helpers.

Proposed service-like facades (implemented as grouped exports from dbFunction.ts):
- accounting: getLedger(range), getPnL(range), getBalanceSheet(date), getJournal(range)
- sales: createSale(input), getSales(range)
- purchases: createPurchase(input), getPurchases(range)
- inventory: createCar(input), updateCar(id,input), listCars(filter), uploadAttachment(carId,file,isMain)
- customers: createCustomer(input), listCustomers(filter)
- analytics: getDashboardMetrics(), getUpcomingSTNKExpirations()

These call the DB only; they don’t create journal rows directly.

## 4) Project Structure Changes
A) Co-locate route-exclusive components under each route:
- Example: src/app/(main)/dashboard/components/...
- Example: src/app/(main)/sales/components/...
- Shared, cross-route UI goes in src/app/components/ui/

B) Thin pages, thick services:
- Pages import functions from dbFunction.ts (server) or a lightweight client proxy/hook if needed.

C) Deduplicate reports:
- Choose a single reports library at src/app/components/reports/ for both UI and PDF. Route-level files import from there.

D) Shared types and schemas:
- src/app/types/... and src/app/schemas/... are single sources for DTOs and zod validation used by services and components.

## 5) Phased Backend-First Migration
Phase 1: Data and RLS hardening (done)
- Apply database.sql and added safeguards.

Phase 2: Service consolidation (backend only)
- Migrate existing calls to use centralized functions in dbFunction.ts
- Keep utilFunctions.ts for pure helpers and smaller client utilities
- Remove direct table names no longer valid (mobil, penjualan) and use cars, sales, purchases
- Migrate analytics to Views/RPCs where available

Phase 3: Reporting queries
- Implement reusable SQL (views or RPC) for ledger, P&L, balance sheet using transactions + journal_items + chart_of_accounts.
- Expose typed functions from dbFunction.ts.

Phase 4: UI refactor (separate document below) after backend stabilizes.

## 6) Exact File-By-File Actions

1. [`src/app/lib/dbFunction.ts`](src/app/lib/dbFunction.ts)
   - Replace legacy table names:
     - mobil → cars
     - penjualan → sales
   - Stop writing to storage bucket path hardcoded without company scoping; introduce a storage path strategy using company_id
   - Server functions to add/edit domain entities:
     - createSale(input: {company_id, car_id, customer_id, sale_price, payment_method, sale_date?})
       - Validate company ownership for car and customer
       - Insert into sales only; no manual journal writes
     - createPurchase(input: {company_id, car_id, buy_price, payment_method, purchase_date?})
     - createCustomer, createCar, deleteCar with company checks
     - getLedger, getPnL, getBalanceSheet via SQL or Views (to be added as RPCs or views)
     - getUpcomingSTNKExpirations(companyId) via view upcoming_stnk_expirations
   - Remove analytics() RPC dependency if it conflicts; or rebase it to transactions model
   - Ensure every query filters by company_id from session

2. [`src/app/utils/functions/utilFunctions.ts`](src/app/utils/functions/utilFunctions.ts)
   - Keep formatting helpers: formatPrice(), formatNumber(), formatDate()
   - Add small utilities:
     - safeParseInt/Decimal
     - buildDateRange(start,end)
     - toIDRCurrency, toPercent
     - guard: assertCompanyMatch(a,b)
   - Keep handleSignOut completed with return true

3. Actions and pages
   - src/app/actions/*: call into dbFunction.ts instead of direct supabase.from(...)
   - src/app/(main)/*: move route-exclusive components under route’s components/ and adjust imports

4. Reports code
   - Merge duplicate report components into src/app/components/reports/
   - Create a single export surface: { ReportCardItem, DateRangeSelector, PDFViewerModal, ... }
   - PDF generators read typed DTOs from services

5. Storage rules
   - Add storage utilities in dbFunction.ts for upload/download that include company-aware paths e.g., `${company_id}/cars/${car_id}/...`

## 7) New DTOs and Validation (names reflect final schema)
- types:
  - Car, Sale, Purchase, Customer, Attachment, Transaction, JournalItem, COA, COAGroup
- zod schemas:
  - saleCreateSchema, purchaseCreateSchema, carCreateSchema, customerCreateSchema
  - report filters: date range, company scope

## 8) Testing and Observability
- Unit tests for service-level posting behavior (verify that creating sales/purchases results in corresponding transactions+journal_items due to triggers).
- Add log/audit events around service calls; include source_document/source_id correlation IDs.

---

Appendix A: Minimal function signatures

```ts:src/app/lib/dbFunction.ts
export async function getCurrentCompanyId(): Promise<string> { /* from session */ }

export async function createSale(input: {
  company_id: string;
  car_id: string;
  customer_id: string;
  sale_price: number;
  payment_method: 'Cash' | 'Bank Transfer' | 'Loan';
  sale_date?: string; // ISO
  salesperson_id?: string;
}): Promise<{ id: string }> {}

export async function createPurchase(input: {
  company_id: string;
  car_id: string;
  buy_price: number;
  payment_method: 'Cash' | 'Bank Transfer';
  purchase_date?: string; // ISO
}): Promise<{ id: string }> {}

export async function getLedger(params: {
  company_id: string;
  start_date: string;
  end_date: string;
}): Promise<any> {}

export async function getProfitAndLoss(params: {
  company_id: string;
  start_date: string;
  end_date: string;
}): Promise<any> {}

export async function getBalanceSheet(params: {
  company_id: string;
  as_of: string;
}): Promise<any> {}

export async function getUpcomingSTNKExpirations(company_id: string) {/* select from view */}
```

```ts:src/app/utils/functions/utilFunctions.ts
export function formatPrice(price: number): string {}
export function formatNumber(value: number): string {}
export function formatDate(dateString: string): string {}
export function buildDateRange(start?: Date, end?: Date): { start: string; end: string } {}
```

---

Next document: UI/UX Architecture Brief (backend-informed)
I will now produce a clean, backend-agnostic UI/UX plan for first-time buyers (dealers) and everyday users. It will outline navigation, key pages, and component placement, then I will note what to change in the current repo to adopt it.