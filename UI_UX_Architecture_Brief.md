# UI/UX Architecture Brief

Purpose
Provide a clean, professional, UX-first interface for used car dealers to manage cars, record purchases/sales, and review financials. The backend is unified (transactions + journal_items with auto-posting), so UI focuses on fast data entry and clear reporting.

Top-level Navigation
1) Dashboard
   - KPIs: Active Stock, Units Sold (MTD), Gross Profit (MTD), Cash, AR, AP
   - Quick Actions: Add Car, Record Purchase, Record Sale
   - Trends: Sales by month, Avg Days-to-Sell
   - Reminders: STNK expiring within 31 days (URGENT/WARNING)

2) Inventory
   - List: Photo, Merk/Model/Year, Status, Days in Stock, Price(s)
   - Filters: Status, Year, Merk, Price range, Search
   - Actions: Add Car, Edit, Upload Photos, Mark Sold, Delete (if not sold)
   - Detail drawer: Full specs, attachments, pricing

3) Sales
   - List: Date, Car, Customer, Price, Payment Method, Salesperson
   - Actions: Record Sale (wizard), View Receipt (PDF), Export CSV/PDF

4) Purchases
   - List: Date, Car, Vendor/Source, Buy Price, Payment Method
   - Actions: Record Purchase (wizard), Attach Invoice, Export

5) Customers
   - List: Name, Phone, Email, Address, Last Purchase
   - Actions: Add, Edit, View history, Export

6) Accounting
   - Tabs: Journal, Ledger, P&L, Balance Sheet
   - Journal: Transaction feed, drilldown to journal_items and source_document/source_id
   - Ledger: By account, date range, running balance
   - P&L/BS: Clear sections, export PDF

7) Reports
   - Sales Summary, Inventory Aging, STNK Reminder report
   - Filters + Export options

8) Settings
   - Company info, branding (logo, color), COA mapping via group prefixes (111/114/411/611), roles, storage

Core UX Flows
A) Add Car
- Form: merk, model, type, year, transmisi, nomor_plat, nomor_rangka, nomor_mesin, pajak, color, mileage, buy/sell prices, description.
- Upload photos after save, mark main image.
- CTA “Record Purchase now?” to jump into purchase flow with car preselected.

B) Record Purchase
- Select existing car or inline-create car.
- Fields: purchase_date, buy_price, payment_method, vendor_source.
- Save: DB triggers post transactions + journal_items (Inventory debit, Cash credit).

C) Record Sale
- Select car from In Stock list.
- Fields: sale_date, sale_price, payment_method, customer (select/create inline), salesperson.
- Save: DB triggers post transactions + journal_items (Cash/AR debit, Sales credit, COGS debit, Inventory credit).

D) STNK Reminders
- Table sorted by expiration with priority chip (URGENT/WARNING).
- Export and WhatsApp message template share.

E) Accounting Drilldown
- Click P&L line → ledger for that account → transaction → source (sale/purchase).
- Ensure traceability with source_document/source_id.

Design Principles
- AppShell layout: Sidebar nav + Topbar (company switch, profile), Content pane, Toast area.
- Use drawers for forms to preserve context.
- One Primary CTA per page; sticky table headers; consistent filters/date pickers.
- Zod-backed validation; keyboard-friendly (Enter submit, Esc cancel).
- Accessible, high-contrast defaults with a single accent color from Settings.

Shared Component System
- UI primitives: Button, Input, Select, DateRangePicker, Drawer, Modal, Tabs, Tooltip, Table, Pagination, Toast.
- Feature components:
  - inventory: CarCard, CarTableRow, PhotoUploader
  - sales/purchases: Wizard forms, Summary panel
  - accounting: TransactionFeedItem, JournalItemsTable
  - reports: ReportCard, DateRangeSelector, PDFViewerModal
- Route-exclusive components live under each route’s components/ subfolder.
- Shared libraries live under src/app/components/ui and src/app/components/reports.

Comparison: Proposed UI/UX vs Current Implementations

1) Dashboard page
File: src/app/(main)/dashboard/page.tsx
Observations:
- Current dashboard is an inventory-centric grid with a filter panel and search/sort controls, querying mobil with direct client-side Supabase calls and realtime channel.
- Heavy filter UI in the page component; no KPIs or STNK reminders; no Quick Actions.

Recommendations:
- Replace inventory-grid dashboard with KPI-centric Dashboard view, add:
  - KPI row: Active Stock, Units Sold (MTD), Gross Profit (MTD), Cash, AR, AP (backend services provide these).
  - Sales trend and Average days-to-sell chart.
  - STNK Reminders widget (view upcoming_stnk_expirations).
  - Quick Actions: Add Car, Record Purchase, Record Sale (open drawers).
- Move inventory browsing to Inventory route. Keep a small “Recently Added” block or link from dashboard.
- Replace direct supabase.from('mobil') with service facade functions in src/app/lib/dbFunction.ts that read cars.
- Co-locate dashboard-specific UI under src/app/(main)/dashboard/components/.

2) Penjualan (Sell Car) modal
File: src/app/components/inventory/modal/PenjualanMobil.tsx
Observations:
- Modal collects buyer and payment details, then writes to customers and penjualan, and sets mobil.status = 'Terjual'.
- Writes directly to penjualan (legacy), not the new sales table; does not set company_id; client-side direct DB access; no correction handling.

Recommendations:
- Replace penjualan with sales flow, route-exclusive drawer under Inventory or Sales:
  - Persist via dbFunction.ts: createSale({ company_id, car_id, customer_id, sale_price, payment_method, sale_date, salesperson_id })
  - Create/Select customer inline; ensure company_id propagation and RLS compliance.
  - On save: rely on DB triggers to post transactions + journal_items; do not write journal manually.
  - Add optimistic loading state and robust error toasts; handle idempotency (unique index).
  - After success: update UI state, optionally generate sale receipt PDF.
- Move this component into route-level components: e.g., src/app/(main)/inventory/components/SellCarDrawer.tsx or src/app/(main)/sales/components/RecordSaleDrawer.tsx.
- Use zod schema for validation and DTO alignment with database.sql fields.

3) Tambah Mobil page (Add Car)
File: src/app/(main)/tambahMobil/page.tsx
Observations:
- Large form in a single page; validates via custom zod schema; on submit uses insertCarAction and navigates back to dashboard.
- Field names aligned to legacy schema (mobil) such as tipe, body_type, etc.

Recommendations:
- Keep UX pattern but move to a Drawer within Inventory page for context retention:
  - Inventory list view + “Add Car” CTA opens drawer.
  - After creation, show the PhotoUploader step in the drawer.
- Align fields to new schema (cars) naming (e.g., nomor_plat, nomor_rangka, nomor_mesin, pajak, buy_price, sell_price_cash/credit).
- Replace insertCarAction with dbFunction.ts: createCar(), then attachments upload with company-aware storage path and set one main image.
- Add optional path to immediately record a purchase (pre-fills purchase drawer).
- Co-locate route-exclusive components under src/app/(main)/inventory/components/:
  - AddCarDrawer.tsx
  - PhotoUploader.tsx
  - CarDetailDrawer.tsx

Other Regularly Used Areas (general guidance)
- Inventory list and details should use shared components (CarTableRow, PhotoUploader) but remain route-exclusive files for orchestration.
- Sales and Purchases should use wizard-like drawers and ensure consistent headless form + validation flows.
- Reports should have a single shared utils source and unified DTOs; both UI and PDF generators consume the same typed data.

Concrete Changes Required in Current Repo

Routing and structure
- Move route-exclusive components into each route folder:
  - src/app/(main)/inventory/components/
  - src/app/(main)/sales/components/
  - src/app/(main)/purchases/components/
  - src/app/(main)/accounting/components/
- Keep shared UI in src/app/components/ui/
- Keep shared reports in src/app/components/reports/ and unify duplicate files.

Service access
- Replace direct Supabase calls:
  - dashboard/page.tsx and PenjualanMobil.tsx should call server functions in src/app/lib/dbFunction.ts, not supabase.from(...) in the client.
- Introduce typed service wrappers in dbFunction.ts for:
  - inventory: listCars, createCar, updateCar, deleteCar, uploadAttachment
  - sales: createSale, listSales
  - purchases: createPurchase, listPurchases
  - accounting: getJournal, getLedger, getProfitAndLoss, getBalanceSheet
  - analytics: getUpcomingSTNKExpirations, salesTrends, avgDaysToSell
- All functions must scope queries by company_id from session.

Forms and drawers
- Convert add/edit flows to drawers rather than standalone pages or modals:
  - Inventory: AddCarDrawer, EditCarDrawer, SellCarDrawer
  - Sales: RecordSaleDrawer
  - Purchases: RecordPurchaseDrawer
- Use shared zod schemas located in src/app/schemas/, reusing DTOs.

Dashboard revamp
- Replace Inventory grid with:
  - KPI row
  - Sales trend chart
  - STNK Reminders widget
  - Quick Actions CTA
- Link to Inventory and Sales routes for detailed work.

Accounting UI
- Build Journal, Ledger, P&L, Balance Sheet pages aligned to new backend functions.
- Drilldown path: P&L → Ledger → Transaction → Source.

PDF standardization
- Standardize PDF renderers under components/reports/reportspdf/ with typed DTOs from services.

Style consistency
- Tailwind tokens, one neutral and accent; emphasize clarity and spacing.
- Accessible color contrast and focus states.

Phase Plan to Implement UI/UX (after backend verified)
1) Infrastructure (1–2 days)
   - Add AppShell layout (Sidebar + Topbar)
   - Shared UI primitives and themes

2) Inventory (2–3 days)
   - Inventory list + filters
   - AddCarDrawer + PhotoUploader + SellCarDrawer
   - Replace old dashboard inventory grid usage

3) Sales/Purchases (2–3 days)
   - RecordSaleDrawer, RecordPurchaseDrawer
   - Lists and detail drawers

4) Dashboard (1–2 days)
   - KPIs, trends, reminders, quick actions

5) Accounting (3–4 days)
   - Journal, Ledger, P&L, Balance Sheet with drilldown and exports

6) Reports & Settings (2–3 days)
   - Sales summary, Inventory aging, STNK reminders
   - Branding and COA mapping screens

End State
- Route-exclusive components organized under each route.
- All data operations go through server functions in dbFunction.ts with company_id scoping.
- Drawer-based create/edit flows improve UX while maintaining context.
- Clean, professional, and fast for daily dealer operations.