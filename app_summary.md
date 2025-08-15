### **Used Car Dealer App + Accounting System: Detailed Project Plan**

This plan consolidates information from the initial product overview (V1) and the rebuild project plan (V2) to provide a holistic approach to development and deployment.

**Project Overview**

The primary goal of this project is to **combine inventory, accounting, sales, and analytics into a single application for small to mid-sized used car dealers**. The aim is to deliver a faster and more focused rebuild of a previous prototype, targeting dealers currently relying on Excel or manual notebooks who desire clear stock management, margin tracking, and ready-to-print financial reports.

---

## **Business Model & Delivery Approach**

- **Not SaaS:**  
  The app is delivered as a custom solution for each dealer, not as a public SaaS. There is no public signup or tier selection for end users.
- **Multi-Tenant, Single Codebase:**  
  All dealers use the same codebase and Supabase project, with strict data isolation via company_id and Row Level Security (RLS). Each dealer's data, branding, and enabled modules are isolated and personalized.
- **Routing:**  
  Dealers access the app via a unique slug (e.g., `/dealerA`) or optionally a custom domain. The slug is used for routing and data isolation, but is not emphasized in the UI to avoid a SaaS feel.
- **Admin-Driven Onboarding:**  
  Onboarding and setup are performed by the app admin (you), not by the dealer. You create the company, users, and configure features/modules before handing over access.
- **Customization:**  
  Each dealer receives a personalized app instance with their own branding, enabled modules, and data. Deep customizations for "Custom" tier clients are handled via settings or code changes as needed.

---

## **Pricing Model**

- **Bulk Sum (One-Time Payment):**  
  Dealers pay a one-time fee to purchase and set up their app instance. This covers initial setup, branding, and configuration.
- **Maintenance Subscription (Monthly/Yearly):**  
  After the initial purchase, dealers pay a recurring fee for hosting, updates, support, and backups. This is standard practice in Indonesia and is clearly communicated as a "maintenance contract."
- **No Public Tier Selection:**  
  Tier (Basic, Plus, CRM, Custom) is selected by the admin during setup, not by the dealer. Dealers only see the modules/features enabled for them.

**Example Pricing:**
- **Starter:** Rp5.000.000 – 7.000.000 (One-Time) — Inventory + POS only.
- **Pro:** Rp8.900.000 – 10.000.000 (One-Time) — Adds accounting.
- **Enterprise:** Rp12.000.000 – 15.000.000+ (One-Time) — Multi-branch, CRM, or custom features.
- **Maintenance:** Rp250.000 – 500.000/month (or yearly discount). Includes hosting, updates, support, and backups.

---

## **Onboarding Flow**

- **Step 1:** Admin chooses to create or join a company.
- **Step 2:** Company Info — Name, Address, Phone, Email, Logo.
- **Step 3:** Contact Info — Name, Email, Phone.
- **Step 4:** Branding — Logo, Colors (optional).
- **Step 5:** Summary & Confirm.

**Excluded from onboarding:**  
- Currency, timezone, fiscal year, language, date format selection (these are set to sensible defaults for Indonesia in the backend).
- Module/feature selection (multi-branch, accounting, CRM) — handled by admin during setup, not by dealer.

---

## **Feature Enablement**

- **Modules/features are enabled per company by the admin.**
- **Company settings (JSONB) store enabled modules, branding, and customizations.**
- **Dealers only see the features/modules enabled for their company.**
- **Custom domains are available for premium clients.**

---

## **Customer Experience**

- Dealers receive a personalized, branded app instance.
- No public signup, no SaaS-like tier selection.
- Maintenance subscription is expected and accepted for ongoing support and hosting.
- Data and features are isolated per dealer.

---

## **Backend Schema & Architecture**

- **Supabase Project:** Single project, multi-tenant via company_id and RLS.
- **Tables:** Companies, Users, Cars, Customers, Sales, Purchases, Transactions, Journal Items, Attachments, COA Groups, Chart of Accounts.
- **Settings:** Company settings stored in JSONB, including branding, enabled modules, and defaults.
- **RLS Policies:** Strict data isolation per company.
- **Admin Approval:** Companies are approved by system_admins before activation.

---

## **Delivery Phase**

- **Admin sets up each dealer’s app instance.**
- **Dealer receives login, walkthrough video, user guide PDF, and invoice.**
- **Maintenance contract offered for ongoing support.**

---

## **Summary**

This approach delivers a custom, robust solution for used car dealers in Indonesia, combining the scalability and maintainability of a single codebase with the personalized experience of a custom app. Pricing is transparent, with a bulk sum for initial setup and a recurring maintenance fee for ongoing service. Dealers experience a tailored app, not a generic SaaS product.

---

**Feature Decision Framework**

When considering adding new features, use the following template to evaluate their value and feasibility:

- **Does it solve a real user problem?** (e.g., "Dealers forget to renew STNK.")
- **How often will it be used?** (Monthly, weekly, rarely?)
- **Does it help close deals or upsell tiers?** (e.g., "Branch management only for Pro.")
- **How complex is it to build & maintain?** (Needs cron jobs? Custom UI?)
- **Can we measure its value?** (Track usage / feedback?).