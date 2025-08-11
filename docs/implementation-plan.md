# Implementation Plan

Objective
Create missing high-value pages to complete the dealership workflow, starting with an Inventory List page. Use mock data aligned to database.sql for quick iteration, and apply the white + blue theme.

Scope Overview (What exists vs missing)
- Exists:
  - Auth: [src/app/login/page.tsx](src/app/login/page.tsx)
  - Dashboard: [src/app/(main)/dashboard/page.tsx](src/app/(main)/dashboard/page.tsx)
  - Add Car (Intake): [src/app/(main)/tambahMobil/page.tsx](src/app/(main)/tambahMobil/page.tsx)
  - Edit Car: [src/app/(main)/editMobil/[id]/page.tsx](src/app/(main)/editMobil/[id]/page.tsx)
  - Customers Index: [src/app/(main)/customers/page.tsx](src/app/(main)/customers/page.tsx)
  - Analytics: [src/app/(main)/analitik/page.tsx](src/app/(main)/analitik/page.tsx)
  - Reports: [src/app/(main)/Reports/page.tsx](src/app/(main)/Reports/page.tsx)
  - Sales Modal: [src/app/components/inventory/modal/PenjualanMobil.tsx](src/app/components/inventory/modal/PenjualanMobil.tsx)
  - Inventory List: [src/app/(main)/inventory/page.tsx](src/app/(main)/inventory/page.tsx) ✅

- Missing (to build):
  1) Inventory Detail page (gallery/specs/history)
  2) Sales List page (index of penjualan)
  3) Customer Detail page (profile + purchases)
  4) Inventory Kanban board (Available/Reserved/Sold)
  5) Settings (basic app/user/company settings)

Navigation Entry Points (Buttons/Links)
- Inventory List
  - Sidebar: “Inventory” → [/inventory](src/app/(main)/inventory/page.tsx)
  - Dashboard header: add secondary button “Lihat Inventory” linking to /inventory
- Inventory Detail
  - On each card in Inventory List: add “Detail” link to “/inventory/[id]”
  - From Edit page headers: link “Lihat Detail” to /inventory/[id]
- Sales List
  - Sidebar: “Sales” → [/sales](src/app/(main)/sales/page.tsx)
  - Dashboard KPI/sales widget: add button “Lihat Penjualan” → /sales
- Customer Detail
  - From Sales List rows: customer name links to “/customers/[id]”
  - From Customers Index rows: link to “/customers/[id]”
- Inventory Kanban
  - Sidebar nested under Inventory: “Board” → [/inventory/board](src/app/(main)/inventory/board/page.tsx)
  - Inventory List page title bar: small “Board” button beside title
- Settings
  - Sidebar: “Settings” → [/settings](src/app/(main)/settings/page.tsx)

Priorities and Milestones
- Milestone 1: Inventory List (completed)
  - Route: [src/app/(main)/inventory/page.tsx](src/app/(main)/inventory/page.tsx)
  - Features implemented:
    - Responsive card grid of cars (image, title, year, transmisi, fuel, plate, price)
    - Filters: free-text, status, brand; live count
    - Actions: Edit, Jual (opens PenjualanMobil modal)
    - White + blue theme with subtle radial accent
  - Data: local mocks aligned to database.sql (mobil)

- Milestone 2: Sales List
  - Route: [src/app/(main)/sales/page.tsx](src/app/(main)/sales/page.tsx)
  - List penjualan (tanggal_jual, mobil, customer, total_harga, metode)
  - Filters by date range, metode_pembayaran
  - Export CSV (mocked)

- Milestone 3: Inventory Detail
  - Route: [src/app/(main)/inventory/[id]/page.tsx](src/app/(main)/inventory/[id]/page.tsx)
  - Gallery, specs, pricing box, activity timeline, actions

- Milestone 4: Customer Detail
  - Route: [src/app/(main)/customers/[id]/page.tsx](src/app/(main)/customers/[id]/page.tsx)
  - Customer info + sales history

- Milestone 5: Inventory Kanban
  - Route: [src/app/(main)/inventory/board/page.tsx](src/app/(main)/inventory/board/page.tsx)
  - Columns by status; drag-and-drop (mocked state)

- Milestone 6: Settings
  - Route: [src/app/(main)/settings/page.tsx](src/app/(main)/settings/page.tsx)
  - Minimal preferences placeholder

Technical Approach
- UI
  - Use Tailwind (white + blue theme).
  - Reuse consistent component styles with the updated Dashboard and Sidebar.
- Data
  - Start with local mock stores/interfaces:
    - Mobil, Customer, Penjualan
  - Encapsulate mocks in simple modules so we can swap to Supabase later.
- Accessibility
  - Maintain focus states, adequate contrast, keyboard operability.

Acceptance Criteria
- Inventory page renders a list of cars from mock data.
- Filtering and sorting work client-side.
- Clicking “Jual” opens PenjualanMobil modal wired with the car’s data.
- Theme alignment with the new palette.
- Entry points implemented: Dashboard "Lihat Inventory", Inventory header "Board", Inventory card "Detail"
- Clear navigation entry points are documented and implemented progressively.

Next Actions (Now)
1) Add navigation buttons:
   - Dashboard: add “Lihat Inventory” button → /inventory
   - Inventory page header: add “Board” button → /inventory/board
2) Implement Sales List scaffold at [src/app/(main)/sales/page.tsx](src/app/(main)/sales/page.tsx) with mock data
3) Implement Inventory Detail scaffold at [src/app/(main)/inventory/[id]/page.tsx](src/app/(main)/inventory/[id]/page.tsx) and add “Detail” link on cards
4) Prepare mock modules (shared) for Mobil, Customer, Penjualan for reuse across pages
5) Validate UI and flows in white + blue theme, ensure links work from Sidebar and Dashboard