-- SQL Schema for Used Car Dealer App with Unified Transactions System
-- Multi-tenancy via company_id with Row Level Security (RLS)
-- ================================
-- RESET SCRIPT FOR USED CAR DEALER DB
-- ================================

-- Drop triggers
DROP TRIGGER IF EXISTS sale_transaction_trigger ON sales;
DROP TRIGGER IF EXISTS purchase_transaction_trigger ON purchases;
DROP TRIGGER IF EXISTS journal_items_immutable ON journal_items;
DROP TRIGGER IF EXISTS trg_enforce_max_users ON users;

-- Drop functions
DROP FUNCTION IF EXISTS create_sale_transaction() CASCADE;
DROP FUNCTION IF EXISTS create_purchase_transaction() CASCADE;
DROP FUNCTION IF EXISTS get_coa_by_group_prefix(UUID, TEXT) CASCADE;
DROP FUNCTION IF EXISTS get_upcoming_stnk_expirations(UUID) CASCADE;
DROP FUNCTION IF EXISTS prevent_journal_update() CASCADE;
DROP FUNCTION IF EXISTS enforce_max_users() CASCADE;

-- Drop views
DROP VIEW IF EXISTS upcoming_stnk_expirations;

-- Drop tables in dependency order
DROP TABLE IF EXISTS journal_items CASCADE;
DROP TABLE IF EXISTS transactions CASCADE;
DROP TABLE IF EXISTS purchases CASCADE;
DROP TABLE IF EXISTS sales CASCADE;
DROP TABLE IF EXISTS attachments CASCADE;
DROP TABLE IF EXISTS customers CASCADE;
DROP TABLE IF EXISTS cars CASCADE;
DROP TABLE IF EXISTS chart_of_accounts CASCADE;
DROP TABLE IF EXISTS coa_groups CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS settings CASCADE;
DROP TABLE IF EXISTS companies CASCADE;

-- Users Table
/*CREATE TABLE system_admins (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    auth_user_id UUID UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL UNIQUE,
    name TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);*/

CREATE TABLE companies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    status TEXT CHECK (status IN ('pending_approval', 'active', 'suspended', 'rejected')) DEFAULT 'pending_approval',
    approved_by UUID REFERENCES system_admins(id),
    approved_at TIMESTAMPTZ,
    max_users INT DEFAULT 10,
    max_storage_mb INT DEFAULT 500,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE users (
    id UUID PRIMARY KEY REFERENCES auth.users(id),
    company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
    email TEXT,
    nama TEXT,
    no_hp TEXT,
    role TEXT CHECK (role IN ('admin', 'member', 'read-only', 'pending')) DEFAULT 'pending',
    status TEXT CHECK (status IN ('company_pending', 'pending', 'active', 'deactivated', 'rejected')) DEFAULT 'pending',
    is_active BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- COA Groups Table
CREATE TABLE coa_groups (
    id SERIAL PRIMARY KEY,
    prefix TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    type TEXT CHECK (type IN ('asset', 'liability', 'equity', 'income', 'expense')) NOT NULL,
    auto_increment INTEGER DEFAULT 0
);

-- Chart of Accounts Table
CREATE TABLE chart_of_accounts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID REFERENCES companies(id),
    group_id INTEGER REFERENCES coa_groups(id),
    account_name TEXT,
    account_number TEXT,
    account_type TEXT,
    normal_balance TEXT,
    description TEXT,
    show_in_pnl BOOLEAN DEFAULT TRUE,
    is_active BOOLEAN DEFAULT TRUE,
    is_wallet BOOLEAN DEFAULT FALSE,
    is_custom BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Cars Table
CREATE TABLE cars (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID REFERENCES companies(id),
    merk TEXT,
    model TEXT,
    type TEXT,
    year INTEGER,
    transmisi TEXT,
    nomor_plat TEXT,
    nomor_rangka TEXT UNIQUE,
    nomor_mesin TEXT,
    pajak DATE,
    nomor_bpkb TEXT,
    color TEXT,
    mileage INTEGER,
    buy_price NUMERIC,
    sell_price_cash NUMERIC,
    sell_price_credit NUMERIC,
    status TEXT,
    details TEXT,
    car_description TEXT,
    date_acquired DATE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Customers Table
CREATE TABLE customers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID REFERENCES companies(id),
    name TEXT,
    phone TEXT,
    email TEXT,
    address TEXT,
    id_photo_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Sales Table
CREATE TABLE sales (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID REFERENCES companies(id),
    car_id UUID REFERENCES cars(id),
    customer_id UUID REFERENCES customers(id),
    sale_date DATE,
    sale_price NUMERIC,
    payment_method TEXT,
    salesperson_id UUID REFERENCES users(id),
    profit_margin NUMERIC,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Purchases Table
CREATE TABLE purchases (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID REFERENCES companies(id),
    car_id UUID REFERENCES cars(id),
    purchase_date DATE,
    vendor_source TEXT,
    buy_price NUMERIC,
    payment_method TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Unified Transactions Table (replaces journal_entries)
CREATE TABLE transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID REFERENCES companies(id),
    transaction_date DATE,
    transaction_type TEXT, -- 'sale', 'purchase', 'expense', 'tax', etc.
    amount NUMERIC,
    description TEXT,
    source_document TEXT, -- 'Sale', 'Purchase', 'Manual', 'Expense'
    source_id UUID, -- Links to sales.id, purchases.id, etc.
    is_corrected BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Journal Items Table (directly linked to transactions)
CREATE TABLE journal_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    transaction_id UUID REFERENCES transactions(id),
    coa_id UUID REFERENCES chart_of_accounts(id),
    debit NUMERIC DEFAULT 0,
    credit NUMERIC DEFAULT 0,
    ref TEXT,
    is_corrected BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Attachments Table
CREATE TABLE attachments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID REFERENCES companies(id),
    car_id UUID REFERENCES cars(id),
    file_url TEXT,
    file_name TEXT,
    is_main BOOLEAN,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Settings Table
CREATE TABLE settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID REFERENCES companies(id),
    key TEXT,
    value TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS Policies (Row Level Security)
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE coa_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE chart_of_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE cars ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE purchases ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE journal_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE attachments ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;

-- Companies RLS Policies
CREATE POLICY companies_policy ON companies
FOR ALL USING (id IN (SELECT company_id FROM users WHERE id = auth.uid()));

-- COA Groups RLS Policies
CREATE POLICY coa_groups_policy ON coa_groups
FOR ALL USING (TRUE); -- COA groups are global/shared across all companies

-- Chart of Accounts RLS Policies
CREATE POLICY chart_of_accounts_policy ON chart_of_accounts
FOR ALL USING (company_id = (SELECT company_id FROM users WHERE id = auth.uid()));

-- Cars RLS Policies
CREATE POLICY cars_policy ON cars
FOR ALL USING (company_id = (SELECT company_id FROM users WHERE id = auth.uid()));

-- Customers RLS Policies
CREATE POLICY customers_policy ON customers
FOR ALL USING (company_id = (SELECT company_id FROM users WHERE id = auth.uid()));

-- Sales RLS Policies
CREATE POLICY sales_policy ON sales
FOR ALL USING (company_id = (SELECT company_id FROM users WHERE id = auth.uid()));

-- Purchases RLS Policies
CREATE POLICY purchases_policy ON purchases
FOR ALL USING (company_id = (SELECT company_id FROM users WHERE id = auth.uid()));

-- Transactions RLS Policies
CREATE POLICY transactions_policy ON transactions
FOR ALL USING (company_id = (SELECT company_id FROM users WHERE id = auth.uid()));

-- Journal Items RLS Policies
-- Strengthen with WITH CHECK for writes
DROP POLICY IF EXISTS journal_items_policy ON journal_items;
CREATE POLICY journal_items_policy ON journal_items
  FOR SELECT USING (
    transaction_id IN (
      SELECT id FROM transactions WHERE company_id = (SELECT company_id FROM users WHERE id = auth.uid())
    )
  );
CREATE POLICY journal_items_insert_policy ON journal_items
  FOR INSERT WITH CHECK (
    transaction_id IN (
      SELECT id FROM transactions WHERE company_id = (SELECT company_id FROM users WHERE id = auth.uid())
    )
  );
CREATE POLICY journal_items_update_policy ON journal_items
  FOR UPDATE USING (
    transaction_id IN (
      SELECT id FROM transactions WHERE company_id = (SELECT company_id FROM users WHERE id = auth.uid())
    )
  )
  WITH CHECK (
    transaction_id IN (
      SELECT id FROM transactions WHERE company_id = (SELECT company_id FROM users WHERE id = auth.uid())
    )
  );

-- Attachments RLS Policies
DROP POLICY IF EXISTS attachments_policy ON attachments;
CREATE POLICY attachments_policy ON attachments
  FOR SELECT USING (company_id = (SELECT company_id FROM users WHERE id = auth.uid()));
CREATE POLICY attachments_insert_policy ON attachments
  FOR INSERT WITH CHECK (company_id = (SELECT company_id FROM users WHERE id = auth.uid()));
CREATE POLICY attachments_update_policy ON attachments
  FOR UPDATE USING (company_id = (SELECT company_id FROM users WHERE id = auth.uid()))
  WITH CHECK (company_id = (SELECT company_id FROM users WHERE id = auth.uid()));

-- Settings RLS Policies
DROP POLICY IF EXISTS settings_policy ON settings;
CREATE POLICY settings_policy ON settings
  FOR SELECT USING (company_id = (SELECT company_id FROM users WHERE id = auth.uid()));
CREATE POLICY settings_insert_policy ON settings
  FOR INSERT WITH CHECK (company_id = (SELECT company_id FROM users WHERE id = auth.uid()));
CREATE POLICY settings_update_policy ON settings
  FOR UPDATE USING (company_id = (SELECT company_id FROM users WHERE id = auth.uid()))
  WITH CHECK (company_id = (SELECT company_id FROM users WHERE id = auth.uid()));

-- Indexes for Performance
-- Uniqueness guard against double-posting from same source document
CREATE UNIQUE INDEX IF NOT EXISTS ux_transactions_source ON transactions (company_id, source_document, source_id);

CREATE INDEX idx_users_company_id ON users(company_id);
CREATE INDEX idx_coa_groups_prefix ON coa_groups(prefix);
CREATE INDEX idx_chart_of_accounts_company_id ON chart_of_accounts(company_id);
CREATE INDEX idx_chart_of_accounts_group_id ON chart_of_accounts(group_id);
CREATE INDEX idx_cars_company_id ON cars(company_id);
CREATE INDEX idx_customers_company_id ON customers(company_id);
CREATE INDEX idx_sales_company_id ON sales(company_id);
CREATE INDEX idx_purchases_company_id ON purchases(company_id);
CREATE INDEX idx_transactions_company_id ON transactions(company_id);
CREATE INDEX idx_journal_items_transaction_id ON journal_items(transaction_id);
CREATE INDEX idx_journal_items_coa_id ON journal_items(coa_id);
CREATE INDEX idx_attachments_company_id ON attachments(company_id);
CREATE INDEX idx_settings_company_id ON settings(company_id);

-- Enforce single main image per car
CREATE UNIQUE INDEX IF NOT EXISTS ux_attachments_main_per_car ON attachments (car_id) WHERE is_main = true;

-- Helper function to get COA ID by group prefix and company
CREATE OR REPLACE FUNCTION get_coa_by_group_prefix(company_id UUID, group_prefix TEXT)
RETURNS UUID AS $$
DECLARE
    coa_id UUID;
BEGIN
    SELECT id INTO coa_id
    FROM chart_of_accounts
    WHERE company_id = get_coa_by_group_prefix.company_id
    AND group_id = (SELECT id FROM coa_groups WHERE prefix = get_coa_by_group_prefix.group_prefix)
    LIMIT 1;
    
    RETURN coa_id;
END;
$$ LANGUAGE plpgsql;

-- Triggers for Auto-populating Transactions
-- Function to create transaction on sale
CREATE OR REPLACE FUNCTION create_sale_transaction()
RETURNS TRIGGER AS $$
DECLARE
    transaction_id UUID;
    cash_coa_id UUID;
    sales_coa_id UUID;
    inventory_coa_id UUID;
    cogs_coa_id UUID;
    car_cost NUMERIC;
    car_company UUID;
BEGIN
    -- Cross-company guard: sale must belong to the same company as the car
    SELECT company_id INTO car_company FROM cars WHERE id = NEW.car_id;
    IF car_company IS NULL THEN
      RAISE EXCEPTION 'Car not found for id=%', NEW.car_id;
    END IF;
    IF NEW.company_id IS DISTINCT FROM car_company THEN
      RAISE EXCEPTION 'Cross-company reference not allowed (sales.company_id != cars.company_id)';
    END IF;

    -- Create transaction record (idempotency at DB level ensured by unique index on (company_id, source_document, source_id))
    INSERT INTO transactions (
        company_id,
        transaction_date,
        transaction_type,
        amount,
        description,
        source_document,
        source_id
    ) VALUES (
        NEW.company_id,
        NEW.sale_date,
        'sale',
        NEW.sale_price,
        'Car Sale',
        'Sale',
        NEW.id
    )
    ON CONFLICT (company_id, source_document, source_id) DO NOTHING
    RETURNING id INTO transaction_id;

    -- If conflict occurred, skip journal items creation
    IF transaction_id IS NULL THEN
      RETURN NEW;
    END IF;
    
    -- Get required COA IDs
    cash_coa_id := get_coa_by_group_prefix(NEW.company_id, '111'); -- Cash
    sales_coa_id := get_coa_by_group_prefix(NEW.company_id, '411'); -- Sales Revenue
    inventory_coa_id := get_coa_by_group_prefix(NEW.company_id, '114'); -- Inventory (Asset)
    cogs_coa_id := get_coa_by_group_prefix(NEW.company_id, '611'); -- COGS (configure exact group as needed)
    
    -- Create journal items for double-entry accounting
    -- 1. Debit: Cash/Receivable (increase asset)
    INSERT INTO journal_items (transaction_id, coa_id, debit, credit, ref)
    VALUES (transaction_id, cash_coa_id, NEW.sale_price, 0, 'Sale Payment');
    
    -- 2. Credit: Sales Revenue (increase revenue)
    INSERT INTO journal_items (transaction_id, coa_id, debit, credit, ref)
    VALUES (transaction_id, sales_coa_id, 0, NEW.sale_price, 'Sale Revenue');
    
    -- 3/4. COGS and Inventory reduction
    SELECT buy_price INTO car_cost FROM cars WHERE id = NEW.car_id;
    IF car_cost IS NULL THEN
      car_cost := 0;
    END IF;
    -- 3. Debit: COGS (expense)
    INSERT INTO journal_items (transaction_id, coa_id, debit, credit, ref)
    VALUES (transaction_id, cogs_coa_id, car_cost, 0, 'COGS');
    -- 4. Credit: Inventory (decrease asset)
    INSERT INTO journal_items (transaction_id, coa_id, debit, credit, ref)
    VALUES (transaction_id, inventory_coa_id, 0, car_cost, 'Inventory Out');
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for sales
DROP TRIGGER IF EXISTS sale_transaction_trigger ON sales;
CREATE TRIGGER sale_transaction_trigger
AFTER INSERT ON sales
FOR EACH ROW EXECUTE FUNCTION create_sale_transaction();

-- Function to create transaction on purchase
CREATE OR REPLACE FUNCTION create_purchase_transaction()
RETURNS TRIGGER AS $$
DECLARE
    transaction_id UUID;
    cash_coa_id UUID;
    inventory_coa_id UUID;
    car_company UUID;
BEGIN
    -- Cross-company guard: purchase must belong to the same company as the car
    SELECT company_id INTO car_company FROM cars WHERE id = NEW.car_id;
    IF car_company IS NULL THEN
      RAISE EXCEPTION 'Car not found for id=%', NEW.car_id;
    END IF;
    IF NEW.company_id IS DISTINCT FROM car_company THEN
      RAISE EXCEPTION 'Cross-company reference not allowed (purchases.company_id != cars.company_id)';
    END IF;

    -- Create transaction record
    INSERT INTO transactions (
        company_id,
        transaction_date,
        transaction_type,
        amount,
        description,
        source_document,
        source_id
    ) VALUES (
        NEW.company_id,
        NEW.purchase_date,
        'purchase',
        NEW.buy_price,
        'Car Purchase',
        'Purchase',
        NEW.id
    )
    ON CONFLICT (company_id, source_document, source_id) DO NOTHING
    RETURNING id INTO transaction_id;

    IF transaction_id IS NULL THEN
      RETURN NEW;
    END IF;
    
    -- Get required COA IDs
    cash_coa_id := get_coa_by_group_prefix(NEW.company_id, '111'); -- Cash
    inventory_coa_id := get_coa_by_group_prefix(NEW.company_id, '114'); -- Inventory
    
    -- Create journal items for double-entry accounting
    -- 1. Debit: Inventory (increase asset)
    INSERT INTO journal_items (transaction_id, coa_id, debit, credit, ref)
    VALUES (transaction_id, inventory_coa_id, NEW.buy_price, 0, 'Purchase Inventory');
    
    -- 2. Credit: Cash/Payable (decrease asset/increase liability)
    INSERT INTO journal_items (transaction_id, coa_id, debit, credit, ref)
    VALUES (transaction_id, cash_coa_id, 0, NEW.buy_price, 'Purchase Payment');
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for purchases
DROP TRIGGER IF EXISTS purchase_transaction_trigger ON purchases;
CREATE TRIGGER purchase_transaction_trigger
AFTER INSERT ON purchases
FOR EACH ROW EXECUTE FUNCTION create_purchase_transaction();
-- COA Groups Seeds
INSERT INTO coa_groups (prefix, name, type) VALUES
-- 🟢 ASSETS
('111', 'Kas dan Setara Kas', 'asset'),
('112', 'Piutang Usaha', 'asset'),
('113', 'Uang Muka / Advances', 'asset'),
('114', 'Aset Tetap', 'asset'),
('115', 'Aset Valas', 'asset'),

-- 🔵 LIABILITIES
('211', 'Hutang Usaha', 'liability'),
('212', 'Pendapatan Diterima Dimuka', 'liability'),

-- 🟣 EQUITY
('311', 'Modal Pemilik', 'equity'),
('312', 'Laba Ditahan', 'equity'),

-- 🟠 INCOME
('411', 'Pendapatan Usaha', 'income'),
('412', 'Pendapatan Lain-Lain', 'income'),

-- 🔴 EXPENSES (split into categories)
('611', 'Beban Operasional Umum', 'expense'),        -- e.g., gaji, listrik, sewa
('612', 'Beban Pajak', 'expense'),                   -- e.g., PPh, PPN
('613', 'Beban Pembelian Aset / Barang Modal', 'expense'),  -- e.g., pembelian mesin, laptop
('614', 'Beban Selisih Kurs', 'expense');


-- Function to get cars with STNK expiring within 31 days
CREATE OR REPLACE FUNCTION get_upcoming_stnk_expirations(company_id UUID)
RETURNS TABLE(
    car_id UUID,
    merk TEXT,
    model TEXT,
    nomor_plat TEXT,
    pajak DATE,
    days_until_expiry INTEGER
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        c.id as car_id,
        c.merk,
        c.model,
        c.nomor_plat,
        c.pajak,
        (c.pajak - CURRENT_DATE) as days_until_expiry
    FROM cars c
    WHERE c.company_id = get_upcoming_stnk_expirations.company_id
    AND c.pajak BETWEEN CURRENT_DATE AND (CURRENT_DATE + INTERVAL '31 days')
    ORDER BY c.pajak ASC;
END;
$$ LANGUAGE plpgsql;


CREATE OR REPLACE FUNCTION app_current_user_company()
RETURNS uuid
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT company_id
  FROM users
  WHERE id = auth.uid()
  LIMIT 1;
$$;

-- View for upcoming STNK expirations
CREATE OR REPLACE VIEW upcoming_stnk_expirations AS
SELECT
    c.id as car_id,
    c.company_id,
    c.merk,
    c.model,
    c.nomor_plat,
    c.pajak as expiration_date,
    (c.pajak - CURRENT_DATE) as days_until_expiry,
    CASE
        WHEN (c.pajak - CURRENT_DATE) <= 7 THEN 'URGENT'
        WHEN (c.pajak - CURRENT_DATE) <= 30 THEN 'WARNING'
        ELSE 'NORMAL'
    END as priority_level
FROM cars c
WHERE c.pajak BETWEEN CURRENT_DATE AND (CURRENT_DATE + INTERVAL '31 days');

-- Immutability guard for journal_items (amounts cannot be edited post creation)
CREATE OR REPLACE FUNCTION prevent_journal_update() RETURNS trigger AS $$
BEGIN
  IF (OLD.debit IS DISTINCT FROM NEW.debit OR OLD.credit IS DISTINCT FROM NEW.credit) THEN
    RAISE EXCEPTION 'Journal rows are immutable; create a correction transaction instead';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS journal_items_immutable ON journal_items;
CREATE TRIGGER journal_items_immutable
BEFORE UPDATE ON journal_items
FOR EACH ROW
EXECUTE FUNCTION prevent_journal_update();

CREATE OR REPLACE FUNCTION enforce_max_users()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.status = 'active' THEN
        IF (
            SELECT COUNT(*) 
            FROM users 
            WHERE company_id = NEW.company_id 
              AND status = 'active'
        ) >= (
            SELECT max_users 
            FROM companies 
            WHERE id = NEW.company_id
        ) THEN
            RAISE EXCEPTION 'User limit reached for this company';
        END IF;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_enforce_max_users
BEFORE INSERT OR UPDATE ON users
FOR EACH ROW EXECUTE FUNCTION enforce_max_users();
-- Function to automatically update updated_at column
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for users table updated_at
DROP TRIGGER IF EXISTS update_users_updated_at ON users;
CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Trigger for companies table updated_at
DROP TRIGGER IF EXISTS update_companies_updated_at ON companies;
CREATE TRIGGER update_companies_updated_at
    BEFORE UPDATE ON companies
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Trigger for settings table updated_at
DROP TRIGGER IF EXISTS update_settings_updated_at ON settings;
CREATE TRIGGER update_settings_updated_at
    BEFORE UPDATE ON settings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Trigger to activate company owner when company status changes to active
CREATE OR REPLACE FUNCTION activate_company_owner()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.status = 'active' AND OLD.status <> 'active' THEN
    UPDATE users
    SET status = 'active',
        is_active = true
    WHERE company_id = NEW.id
      AND role = 'admin'
      AND created_at = (
        SELECT MIN(created_at)
        FROM users
        WHERE company_id = NEW.id
      );
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_activate_company_owner ON companies;

CREATE TRIGGER trg_activate_company_owner
AFTER UPDATE OF status ON companies
FOR EACH ROW
EXECUTE FUNCTION activate_company_owner();

CREATE OR REPLACE FUNCTION enforce_company_approval_for_users()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.is_active = true AND (
    SELECT status FROM companies WHERE id = NEW.company_id
  ) <> 'active' THEN
    RAISE EXCEPTION 'Cannot activate user until company is active';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_enforce_company_approval ON users;

CREATE TRIGGER trg_enforce_company_approval
BEFORE UPDATE OF is_active ON users
FOR EACH ROW
EXECUTE FUNCTION enforce_company_approval_for_users();


----------------------------
-- ENABLE RLS (idempotent)
----------------------------
ALTER TABLE IF EXISTS companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS users ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS coa_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS chart_of_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS cars ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS purchases ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS journal_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS attachments ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS settings ENABLE ROW LEVEL SECURITY;

-----------------------------------------
-- Helper note:
-- In each policy we use:
--   (SELECT company_id FROM users WHERE id = auth.uid())
-- which returns the company_id of the currently authenticated user.
-- Make sure your auth user's row exists in users table.
-----------------------------------------

------------------------------------------------
-- COMPANIES (only visible to users that belong)
------------------------------------------------
DROP POLICY IF EXISTS companies_select ON companies;
DROP POLICY IF EXISTS companies_insert ON companies;
DROP POLICY IF EXISTS companies_update ON companies;
DROP POLICY IF EXISTS companies_delete ON companies;

CREATE POLICY companies_select ON companies
  FOR SELECT
  USING ( id = (SELECT company_id FROM users WHERE id = auth.uid()) );

-- INSERT: allow only admin users to create new companies (adjust role name as needed)
CREATE POLICY companies_insert ON companies
  FOR INSERT
  WITH CHECK ( (SELECT role FROM users WHERE id = auth.uid()) = 'admin' );

CREATE POLICY companies_update ON companies
  FOR UPDATE
  USING ( id = (SELECT company_id FROM users WHERE id = auth.uid()) )
  WITH CHECK ( id = (SELECT company_id FROM users WHERE id = auth.uid()) );

CREATE POLICY companies_delete ON companies
  FOR DELETE
  USING ( id = (SELECT company_id FROM users WHERE id = auth.uid()) );

------------------------------------------------
-- USERS (crud within same company)
-- Note: users.id is expected to match auth.uid() for the session user
------------------------------------------------
DROP POLICY IF EXISTS users_select ON users;
DROP POLICY IF EXISTS users_insert ON users;
DROP POLICY IF EXISTS users_update ON users;
DROP POLICY IF EXISTS users_delete ON users;

CREATE POLICY users_select ON users
  FOR SELECT
  USING (company_id = app_current_user_company());


-- Insertion policy allowing initial user creation and admin-managed users
CREATE POLICY users_insert ON users
  FOR INSERT
  WITH CHECK (
    -- Allow initial user creation (no company_id, pending status)
    (company_id IS NULL AND status = 'pending')
    OR
    -- Allow admin to create users in their company
    (company_id = (SELECT company_id FROM users WHERE id = auth.uid())
    AND (SELECT role FROM users WHERE id = auth.uid()) IN ('admin', 'company_admin'))
  );

CREATE POLICY users_update ON users
  FOR UPDATE
  USING ( company_id = (SELECT company_id FROM users WHERE id = auth.uid()) )
  WITH CHECK ( company_id = (SELECT company_id FROM users WHERE id = auth.uid()) );

CREATE POLICY users_delete ON users
  FOR DELETE
  USING ( company_id = (SELECT company_id FROM users WHERE id = auth.uid())
          AND (SELECT role FROM users WHERE id = auth.uid()) = 'admin' );

CREATE POLICY user_isolation ON users
    FOR SELECT USING (company_id = (SELECT company_id FROM users WHERE id = auth.uid()));

------------------------------------------------
-- COA_GROUPS (global read, admin-only writes)
------------------------------------------------
DROP POLICY IF EXISTS coa_groups_select ON coa_groups;
DROP POLICY IF EXISTS coa_groups_insert ON coa_groups;
DROP POLICY IF EXISTS coa_groups_update ON coa_groups;
DROP POLICY IF EXISTS coa_groups_delete ON coa_groups;

CREATE POLICY coa_groups_select ON coa_groups
  FOR SELECT
  USING ( TRUE );

CREATE POLICY coa_groups_insert ON coa_groups
  FOR INSERT
  WITH CHECK ( (SELECT role FROM users WHERE id = auth.uid()) = 'admin' );

CREATE POLICY coa_groups_update ON coa_groups
  FOR UPDATE
  USING ( (SELECT role FROM users WHERE id = auth.uid()) = 'admin' )
  WITH CHECK ( (SELECT role FROM users WHERE id = auth.uid()) = 'admin' );

CREATE POLICY coa_groups_delete ON coa_groups
  FOR DELETE
  USING ( (SELECT role FROM users WHERE id = auth.uid()) = 'admin' );

------------------------------------------------
-- CHART_OF_ACCOUNTS (company scoped)
------------------------------------------------
DROP POLICY IF EXISTS chart_of_accounts_select ON chart_of_accounts;
DROP POLICY IF EXISTS chart_of_accounts_insert ON chart_of_accounts;
DROP POLICY IF EXISTS chart_of_accounts_update ON chart_of_accounts;
DROP POLICY IF EXISTS chart_of_accounts_delete ON chart_of_accounts;

CREATE POLICY chart_of_accounts_select ON chart_of_accounts
  FOR SELECT
  USING ( company_id = (SELECT company_id FROM users WHERE id = auth.uid()) );

CREATE POLICY chart_of_accounts_insert ON chart_of_accounts
  FOR INSERT
  WITH CHECK ( company_id = (SELECT company_id FROM users WHERE id = auth.uid()) );

CREATE POLICY chart_of_accounts_update ON chart_of_accounts
  FOR UPDATE
  USING ( company_id = (SELECT company_id FROM users WHERE id = auth.uid()) )
  WITH CHECK ( company_id = (SELECT company_id FROM users WHERE id = auth.uid()) );

CREATE POLICY chart_of_accounts_delete ON chart_of_accounts
  FOR DELETE
  USING ( company_id = (SELECT company_id FROM users WHERE id = auth.uid()) );

  CREATE POLICY company_isolation ON companies
    FOR SELECT USING (id = (SELECT company_id FROM users WHERE id = auth.uid()));


-- Policy: Company admins can update their company users
CREATE POLICY company_admin_manage_users ON users
    FOR UPDATE USING (
        company_id = (SELECT company_id FROM users WHERE id = auth.uid())
        AND (SELECT role FROM users WHERE id = auth.uid()) = 'company_admin'
    );

------------------------------------------------
-- CARS
------------------------------------------------
DROP POLICY IF EXISTS cars_select ON cars;
DROP POLICY IF EXISTS cars_insert ON cars;
DROP POLICY IF EXISTS cars_update ON cars;
DROP POLICY IF EXISTS cars_delete ON cars;

CREATE POLICY cars_select ON cars
  FOR SELECT
  USING ( company_id = (SELECT company_id FROM users WHERE id = auth.uid()) );

CREATE POLICY cars_insert ON cars
  FOR INSERT
  WITH CHECK ( company_id = (SELECT company_id FROM users WHERE id = auth.uid()) );

CREATE POLICY cars_update ON cars
  FOR UPDATE
  USING ( company_id = (SELECT company_id FROM users WHERE id = auth.uid()) )
  WITH CHECK ( company_id = (SELECT company_id FROM users WHERE id = auth.uid()) );

CREATE POLICY cars_delete ON cars
  FOR DELETE
  USING ( company_id = (SELECT company_id FROM users WHERE id = auth.uid()) );

------------------------------------------------
-- CUSTOMERS
------------------------------------------------
DROP POLICY IF EXISTS customers_select ON customers;
DROP POLICY IF EXISTS customers_insert ON customers;
DROP POLICY IF EXISTS customers_update ON customers;
DROP POLICY IF EXISTS customers_delete ON customers;

CREATE POLICY customers_select ON customers
  FOR SELECT
  USING ( company_id = (SELECT company_id FROM users WHERE id = auth.uid()) );

CREATE POLICY customers_insert ON customers
  FOR INSERT
  WITH CHECK ( company_id = (SELECT company_id FROM users WHERE id = auth.uid()) );

CREATE POLICY customers_update ON customers
  FOR UPDATE
  USING ( company_id = (SELECT company_id FROM users WHERE id = auth.uid()) )
  WITH CHECK ( company_id = (SELECT company_id FROM users WHERE id = auth.uid()) );

CREATE POLICY customers_delete ON customers
  FOR DELETE
  USING ( company_id = (SELECT company_id FROM users WHERE id = auth.uid()) );

------------------------------------------------
-- SALES
------------------------------------------------
DROP POLICY IF EXISTS sales_select ON sales;
DROP POLICY IF EXISTS sales_insert ON sales;
DROP POLICY IF EXISTS sales_update ON sales;
DROP POLICY IF EXISTS sales_delete ON sales;

CREATE POLICY sales_select ON sales
  FOR SELECT
  USING ( company_id = (SELECT company_id FROM users WHERE id = auth.uid()) );

CREATE POLICY sales_insert ON sales
  FOR INSERT
  WITH CHECK (
    company_id = (SELECT company_id FROM users WHERE id = auth.uid())
    -- optionally: AND salesperson_id = auth.uid() OR (SELECT role FROM users WHERE id = auth.uid()) = 'admin'
  );

CREATE POLICY sales_update ON sales
  FOR UPDATE
  USING ( company_id = (SELECT company_id FROM users WHERE id = auth.uid()) )
  WITH CHECK ( company_id = (SELECT company_id FROM users WHERE id = auth.uid()) );

CREATE POLICY sales_delete ON sales
  FOR DELETE
  USING ( company_id = (SELECT company_id FROM users WHERE id = auth.uid()) );

------------------------------------------------
-- PURCHASES
------------------------------------------------
DROP POLICY IF EXISTS purchases_select ON purchases;
DROP POLICY IF EXISTS purchases_insert ON purchases;
DROP POLICY IF EXISTS purchases_update ON purchases;
DROP POLICY IF EXISTS purchases_delete ON purchases;

CREATE POLICY purchases_select ON purchases
  FOR SELECT
  USING ( company_id = (SELECT company_id FROM users WHERE id = auth.uid()) );

CREATE POLICY purchases_insert ON purchases
  FOR INSERT
  WITH CHECK ( company_id = (SELECT company_id FROM users WHERE id = auth.uid()) );

CREATE POLICY purchases_update ON purchases
  FOR UPDATE
  USING ( company_id = (SELECT company_id FROM users WHERE id = auth.uid()) )
  WITH CHECK ( company_id = (SELECT company_id FROM users WHERE id = auth.uid()) );

CREATE POLICY purchases_delete ON purchases
  FOR DELETE
  USING ( company_id = (SELECT company_id FROM users WHERE id = auth.uid()) );

------------------------------------------------
-- TRANSACTIONS
------------------------------------------------
DROP POLICY IF EXISTS transactions_select ON transactions;
DROP POLICY IF EXISTS transactions_insert ON transactions;
DROP POLICY IF EXISTS transactions_update ON transactions;
DROP POLICY IF EXISTS transactions_delete ON transactions;

CREATE POLICY transactions_select ON transactions
  FOR SELECT
  USING ( company_id = (SELECT company_id FROM users WHERE id = auth.uid()) );

CREATE POLICY transactions_insert ON transactions
  FOR INSERT
  WITH CHECK ( company_id = (SELECT company_id FROM users WHERE id = auth.uid()) );

CREATE POLICY transactions_update ON transactions
  FOR UPDATE
  USING ( company_id = (SELECT company_id FROM users WHERE id = auth.uid()) )
  WITH CHECK ( company_id = (SELECT company_id FROM users WHERE id = auth.uid()) );

CREATE POLICY transactions_delete ON transactions
  FOR DELETE
  USING ( company_id = (SELECT company_id FROM users WHERE id = auth.uid()) );

------------------------------------------------
-- JOURNAL_ITEMS
-- journal_items does NOT have company_id column, so scope by transactions table
------------------------------------------------
DROP POLICY IF EXISTS journal_items_select ON journal_items;
DROP POLICY IF EXISTS journal_items_insert ON journal_items;
DROP POLICY IF EXISTS journal_items_update ON journal_items;
DROP POLICY IF EXISTS journal_items_delete ON journal_items;

CREATE POLICY journal_items_select ON journal_items
  FOR SELECT
  USING (
    transaction_id IN (
      SELECT id FROM transactions
      WHERE company_id = (SELECT company_id FROM users WHERE id = auth.uid())
    )
  );

CREATE POLICY journal_items_insert ON journal_items
  FOR INSERT
  WITH CHECK (
    transaction_id IN (
      SELECT id FROM transactions
      WHERE company_id = (SELECT company_id FROM users WHERE id = auth.uid())
    )
  );

CREATE POLICY journal_items_update ON journal_items
  FOR UPDATE
  USING (
    transaction_id IN (
      SELECT id FROM transactions
      WHERE company_id = (SELECT company_id FROM users WHERE id = auth.uid())
    )
  )
  WITH CHECK (
    transaction_id IN (
      SELECT id FROM transactions
      WHERE company_id = (SELECT company_id FROM users WHERE id = auth.uid())
    )
  );

CREATE POLICY journal_items_delete ON journal_items
  FOR DELETE
  USING (
    transaction_id IN (
      SELECT id FROM transactions
      WHERE company_id = (SELECT company_id FROM users WHERE id = auth.uid())
    )
  );

------------------------------------------------
-- ATTACHMENTS
------------------------------------------------
DROP POLICY IF EXISTS attachments_select ON attachments;
DROP POLICY IF EXISTS attachments_insert ON attachments;
DROP POLICY IF EXISTS attachments_update ON attachments;
DROP POLICY IF EXISTS attachments_delete ON attachments;

CREATE POLICY attachments_select ON attachments
  FOR SELECT
  USING ( company_id = (SELECT company_id FROM users WHERE id = auth.uid()) );

CREATE POLICY attachments_insert ON attachments
  FOR INSERT
  WITH CHECK ( company_id = (SELECT company_id FROM users WHERE id = auth.uid()) );

CREATE POLICY attachments_update ON attachments
  FOR UPDATE
  USING ( company_id = (SELECT company_id FROM users WHERE id = auth.uid()) )
  WITH CHECK ( company_id = (SELECT company_id FROM users WHERE id = auth.uid()) );

CREATE POLICY attachments_delete ON attachments
  FOR DELETE
  USING ( company_id = (SELECT company_id FROM users WHERE id = auth.uid()) );

------------------------------------------------
-- SETTINGS
------------------------------------------------
DROP POLICY IF EXISTS settings_select ON settings;
DROP POLICY IF EXISTS settings_insert ON settings;
DROP POLICY IF EXISTS settings_update ON settings;
DROP POLICY IF EXISTS settings_delete ON settings;

CREATE POLICY settings_select ON settings
  FOR SELECT
  USING ( company_id = (SELECT company_id FROM users WHERE id = auth.uid()) );

CREATE POLICY settings_insert ON settings
  FOR INSERT
  WITH CHECK ( company_id = (SELECT company_id FROM users WHERE id = auth.uid()) );

CREATE POLICY settings_update ON settings
  FOR UPDATE
  USING ( company_id = (SELECT company_id FROM users WHERE id = auth.uid()) )
  WITH CHECK ( company_id = (SELECT company_id FROM users WHERE id = auth.uid()) );

CREATE POLICY settings_delete ON settings
  FOR DELETE
  USING ( company_id = (SELECT company_id FROM users WHERE id = auth.uid()) );



----------------------------
-- End of RLS policies
----------------------------
