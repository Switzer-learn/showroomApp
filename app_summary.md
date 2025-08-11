### **Used Car Dealer App + Accounting System: Detailed Project Plan**

This plan consolidates information from the initial product overview (V1) and the rebuild project plan (V2) to provide a holistic approach to development and deployment.

**Project Overview**

The primary goal of this project is to **combine inventory, accounting, sales, and analytics into a single application for small to mid-sized used car dealers**. The aim is to deliver a faster and more focused rebuild of a previous prototype, targeting dealers currently relying on Excel or manual notebooks who desire clear stock management, margin tracking, and ready-to-print financial reports.

**1. Planning Phase**

This phase defines the scope, core functionalities, and overall direction of the project.

- **Project Goals**
    - **Combine inventory, accounting, sales, and analytics for used car dealers**.
    - Deliver a faster & more focused rebuild from previous prototype.
    - Provide clear stock, margin tracking, and ready-to-print financial reports.
- **Target Users**
    - Small to mid-sized used car dealers.
    - Dealers currently using Excel or manual notebooks for operations.
- **Core Features (Phase 1 Development Priority)**
    - **Car Inventory Management**: Ability to add/edit cars with full details and photo uploads, including stock reports.
    - **Sales Module**: Internal log of car sales with manual input and margin tracking, leading to sales reports. This includes sales entry with auto-journaling.
    - **Car Purchase Tracking**: Record source/vendor, buy price, and payment method (cash/bank).
    - **Dashboard Overview**: Real-time overview of car stock, monthly profit, and car turnover.
    - **Accounting Journal**: Auto-generated entries from sales & purchases, with support for manual entries and a journal viewer.
    - **General Ledger**: Real-time general ledger linked to the Chart of Accounts (COA), with a ledger viewer.
    - **Profit & Loss Report**: Real-time report, filterable by date, with a P&L viewer.
    - **Balance Sheet**: Accurate snapshot as of a selected date, with a balance sheet viewer.
    - **PDF Export**: Capability to export basic reports like sales, journal, P&L, and balance sheet to PDF.
    - **COA Management**: Cloneable template that can be edited per client.
    - **User Roles**: Support for Owner, Admin, and Staff roles with access-based control.
    - **Customer Database**.
- **Nice-to-Have / Future Features (Phase 2+ / Optional Add-Ons)**
    - **Multi-Branch Support**: Separate branch data, reports, and staff management. This is typically for the Enterprise tier.
    - **Custom Reporting / Branding**: Custom report layout, logo, colors, and exported formats. Available in Pro and Enterprise tiers. Custom PDF/XLS report format is an optional paid add-on.
    - **Public Car Listing Page / Web Catalog**: An optional mini-landing page for car showroom or an own page with car listing & search. This is an optional paid add-on for any tier, or included in the Enterprise tier.
    - **WhatsApp Integration**: Ability to send reports directly via WhatsApp. An optional paid add-on.
    - **AI Price Suggester / Price Estimator / Margin Calculator**: Based on data from platforms like OLX and Mobil123. An optional paid add-on.
    - **Google Drive Auto Backup**: Periodic backups of data. An optional paid add-on.
    - **Multiple Company Dashboard**: For managing groups or franchises. An optional paid add-on.
    - **Integration/API**: Available on request for Enterprise clients.
    - **Service History Tracking**.
    - **Reminder for STNK/Pajak**: Automated notifications for upcoming vehicle registration renewals (31 days prior to expiration).
- **Tiered Pricing Plan (Business Model)**
    - **Starter**: Rp5.000.000 – 7.000.000 (One-Time) - Ideal for small dealers wanting inventory + sales tracking only.
    - **Pro**: Rp8.900.000 – 10.000.000 (One-Time) - For dealers needing full accounting with built-in reports.
    - **Enterprise**: Rp12.000.000 – 15.000.000+ (One-Time) - For multi-branch, multi-user, or custom-request clients.

**2. Design Phase**

This phase focuses on the visual and structural blueprints of the application.

- **UI/UX (User Interface/User Experience)**
    - Sketch out key screens, potentially using Figma or pen/paper.
    - Key screens to design include: Dashboard, Car Input Form, Sales Modal, Reports Viewer, Login / Role Switching.
- **Schema Design**
    - Design the database structure, including tables for:
        - **COA Table**.
        - **Journal & Journal_Items**.
        - **Car Table**.
        - **Customer Table**.
        - **Sales Table**.
        - **Users & Roles**.
        - **Attachments (for Images)**.
        - **Settings (Company Info, etc.)**.
        - Ensure company_id column and Row Level Security (RLS) for multi-tenancy are incorporated for client data isolation.
- **Architecture & Infrastructure**
    - **Backend**: Single Supabase project.
    - **Tenancy**: Multi-tenant via company_id column and Row Level Security (RLS).
    - **Authentication**: Supabase Auth with a users table storing role and company information. Google login as an initial setup.
    - **Frontend**: Next.js / React (hosted on Vercel or similar). Tailwind CSS for styling.
    - **Storage**: Supabase Buckets for car images.
    - **Reporting**: SQL + Supabase Views + @react-pdf/renderer.

**3. Development Phase**

This phase involves building the application features based on the design.

- **Setup**
    - Initialize Next.js + Tailwind CSS + Supabase project.
    - Set up authentication, including Google login.
    - Implement Role-based access using Row Level Security (RLS).
    - Define Supabase schema based on design.
    - Configure Supabase storage buckets for images.
- **Feature Slices (Build in Priority Order)**
    - **Car CRUD (Create, Read, Update, Delete)** and **Image Upload & Access**. This covers Inventory Management.
    - **Sales Entry (with auto journal)**.
    - **Journal Viewer**.
    - **P&L Report**.
    - **Ledger Viewer**.
    - **Balance Sheet**.
    - **PDF Report Export**.
    - **COA Setup per company**.
    - **User & Role Management**.
    - **Dashboard Overview**.
    - **Multi-branch and Advanced Filters** (next priority after core features).
    - **Custom Branding and Reporting**.
    - **Add-ons** (WhatsApp, Public Page, etc.).
- **Performance & Scalability Considerations**
    - Use indexed columns (e.g., company_id, date).
    - Implement pagination for large datasets.
    - Consider optional materialized views for performance.
    - Ensure the architecture is upgradable to a SaaS model without major rewrite.

**4. Deployment Phase**

This phase covers deploying the application to testing and production environments.

- **Staging Environment**
    - Host on Vercel (or similar platform).
    - Link to the Supabase project.
    - Add .env files for necessary keys.
- **Production Environment**
    - Implement custom domains for each client (optional).
    - Prepare data seeding & migration tools.

**5. Delivery Phase**

This phase ensures the client receives the completed product and necessary support.

- Provide a **Walkthrough video**.
- Supply a **User Guide PDF**.
- Issue an **Invoice**.
- Offer an **Optional: Maintenance contract**.

**Feature Decision Framework**

When considering adding new features, use the following template to evaluate their value and feasibility:

- **Does it solve a real user problem?** (e.g., "Dealers forget to renew STNK.").
- **How often will it be used?** (Monthly, weekly, rarely?).
- **Does it help close deals or upsell tiers?** (e.g., "Branch management only for Pro.").
- **How complex is it to build & maintain?** (Needs cron jobs? Custom UI?).
- **Can we measure its value?** (Track usage / feedback?).