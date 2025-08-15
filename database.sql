-- Refactored SQL schema for Used Car Dealer App
-- Objective: avoid RLS infinite recursion by using JWT custom claims and SECURITY DEFINER functions
-- Single copy-paste file. After running this migration you should configure Supabase to use

-- =====================================
-- RESET (safe drop) - use to reset schema
-- =====================================

-- Drops in safe dependency order
DROP TRIGGER IF EXISTS sale_transaction_trigger ON sales;
DROP TRIGGER IF EXISTS purchase_transaction_trigger ON purchases;
DROP TRIGGER IF EXISTS journal_items_immutable ON journal_items;
DROP TRIGGER IF EXISTS trg_enforce_max_users ON users;
DROP TRIGGER IF EXISTS update_users_updated_at ON users;
DROP TRIGGER IF EXISTS update_companies_updated_at ON companies;
DROP TRIGGER IF EXISTS trg_activate_company_owner ON companies;
DROP TRIGGER IF EXISTS trg_enforce_company_approval ON users;

DROP FUNCTION IF EXISTS create_sale_transaction() CASCADE;
DROP FUNCTION IF EXISTS create_purchase_transaction() CASCADE;
DROP FUNCTION IF EXISTS get_coa_by_group_prefix(UUID, TEXT) CASCADE;
DROP FUNCTION IF EXISTS get_upcoming_stnk_expirations(UUID) CASCADE;
DROP FUNCTION IF EXISTS prevent_journal_update() CASCADE;
DROP FUNCTION IF EXISTS enforce_max_users() CASCADE;
DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;
DROP FUNCTION IF EXISTS activate_company_owner() CASCADE;
DROP FUNCTION IF EXISTS enforce_company_approval_for_users() CASCADE;
DROP FUNCTION IF EXISTS jwt_custom_claims() CASCADE;

DROP VIEW IF EXISTS upcoming_stnk_expirations;

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
DROP TABLE IF EXISTS companies CASCADE;
--DROP TABLE IF EXISTS system_admins CASCADE;

-- =====================================
-- Create system_admins (global platform admins)
-- =====================================
/*CREATE TABLE system_admins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  auth_user_id UUID UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  name TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);*/
-- NOTE: We intentionally DO NOT create application-level policies for system_admins here.
-- If you enable RLS on system_admins and add no policies, the app (authenticated role) cannot read/modify it.

-- =====================================
-- Companies (approved_by references system_admins)
-- =====================================
CREATE TABLE companies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    phone_number TEXT,
    address TEXT,
    status TEXT CHECK (status IN ('pending_approval', 'active', 'suspended', 'rejected')) DEFAULT 'pending_approval',
    approved_by UUID REFERENCES system_admins(id),
    approved_at TIMESTAMPTZ,
    max_users INT DEFAULT 10,
    max_storage_mb INT DEFAULT 500,
    settings JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================
-- Users (tenant-scoped; linked to auth.users)
-- =====================================
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

-- =====================================
-- Accounting & domain tables (unchanged structure)
-- =====================================
CREATE TABLE coa_groups (
    id SERIAL PRIMARY KEY,
    prefix TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    type TEXT CHECK (type IN ('asset', 'liability', 'equity', 'income', 'expense')) NOT NULL,
    auto_increment INTEGER DEFAULT 0
);

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

CREATE TABLE transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID REFERENCES companies(id),
    transaction_date DATE,
    transaction_type TEXT,
    amount NUMERIC,
    description TEXT,
    source_document TEXT,
    source_id UUID,
    is_corrected BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

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

CREATE TABLE attachments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID REFERENCES companies(id),
    car_id UUID REFERENCES cars(id),
    file_url TEXT,
    file_name TEXT,
    is_main BOOLEAN,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID REFERENCES companies(id),
    key TEXT,
    value TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================
-- Indexes
-- =====================================
CREATE UNIQUE INDEX IF NOT EXISTS ux_transactions_source ON transactions (company_id, source_document, source_id);
CREATE INDEX IF NOT EXISTS idx_users_company_id ON users(company_id);
CREATE INDEX IF NOT EXISTS idx_coa_groups_prefix ON coa_groups(prefix);
CREATE INDEX IF NOT EXISTS idx_chart_of_accounts_company_id ON chart_of_accounts(company_id);
CREATE INDEX IF NOT EXISTS idx_chart_of_accounts_group_id ON chart_of_accounts(group_id);
CREATE INDEX IF NOT EXISTS idx_cars_company_id ON cars(company_id);
CREATE INDEX IF NOT EXISTS idx_customers_company_id ON customers(company_id);
CREATE INDEX IF NOT EXISTS idx_sales_company_id ON sales(company_id);
CREATE INDEX IF NOT EXISTS idx_purchases_company_id ON purchases(company_id);
CREATE INDEX IF NOT EXISTS idx_transactions_company_id ON transactions(company_id);
CREATE INDEX IF NOT EXISTS idx_journal_items_transaction_id ON journal_items(transaction_id);
CREATE INDEX IF NOT EXISTS idx_journal_items_coa_id ON journal_items(coa_id);
CREATE INDEX IF NOT EXISTS idx_attachments_company_id ON attachments(company_id);

CREATE UNIQUE INDEX IF NOT EXISTS ux_attachments_main_per_car ON attachments (car_id) WHERE is_main = true;

-- =====================================
-- Triggers & Functions
-- =====================================

-- Function to get user onboarding and role info
create or replace function public.get_user_access_info()
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  result jsonb;
begin
  select jsonb_build_object(
    'company_id', u.company_id,
    'role', u.role,
    'is_active', u.is_active,
    'status', u.status,
    'is_system_admin', (sa.auth_user_id is not null)
  )
  into result
  from public.users u
  left join public.system_admins sa
    on sa.auth_user_id = u.id
  where u.id = auth.uid();

  return result;
end;
$$;

-- Allow only authenticated users to execute
grant execute on function public.get_user_access_info() to authenticated;


-- get_coa_by_group_prefix
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

-- create_sale_transaction (same logic)
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
    SELECT company_id INTO car_company FROM cars WHERE id = NEW.car_id;
    IF car_company IS NULL THEN
      RAISE EXCEPTION 'Car not found for id=%', NEW.car_id;
    END IF;
    IF NEW.company_id IS DISTINCT FROM car_company THEN
      RAISE EXCEPTION 'Cross-company reference not allowed (sales.company_id != cars.company_id)';
    END IF;

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

    IF transaction_id IS NULL THEN
      RETURN NEW;
    END IF;

    cash_coa_id := get_coa_by_group_prefix(NEW.company_id, '111');
    sales_coa_id := get_coa_by_group_prefix(NEW.company_id, '411');
    inventory_coa_id := get_coa_by_group_prefix(NEW.company_id, '114');
    cogs_coa_id := get_coa_by_group_prefix(NEW.company_id, '611');

    INSERT INTO journal_items (transaction_id, coa_id, debit, credit, ref)
    VALUES (transaction_id, cash_coa_id, NEW.sale_price, 0, 'Sale Payment');

    INSERT INTO journal_items (transaction_id, coa_id, debit, credit, ref)
    VALUES (transaction_id, sales_coa_id, 0, NEW.sale_price, 'Sale Revenue');

    SELECT buy_price INTO car_cost FROM cars WHERE id = NEW.car_id;
    IF car_cost IS NULL THEN
      car_cost := 0;
    END IF;

    INSERT INTO journal_items (transaction_id, coa_id, debit, credit, ref)
    VALUES (transaction_id, cogs_coa_id, car_cost, 0, 'COGS');

    INSERT INTO journal_items (transaction_id, coa_id, debit, credit, ref)
    VALUES (transaction_id, inventory_coa_id, 0, car_cost, 'Inventory Out');

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS sale_transaction_trigger ON sales;
CREATE TRIGGER sale_transaction_trigger
AFTER INSERT ON sales
FOR EACH ROW EXECUTE FUNCTION create_sale_transaction();

-- create_purchase_transaction
CREATE OR REPLACE FUNCTION create_purchase_transaction()
RETURNS TRIGGER AS $$
DECLARE
    transaction_id UUID;
    cash_coa_id UUID;
    inventory_coa_id UUID;
    car_company UUID;
BEGIN
    SELECT company_id INTO car_company FROM cars WHERE id = NEW.car_id;
    IF car_company IS NULL THEN
      RAISE EXCEPTION 'Car not found for id=%', NEW.car_id;
    END IF;
    IF NEW.company_id IS DISTINCT FROM car_company THEN
      RAISE EXCEPTION 'Cross-company reference not allowed (purchases.company_id != cars.company_id)';
    END IF;

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

    cash_coa_id := get_coa_by_group_prefix(NEW.company_id, '111');
    inventory_coa_id := get_coa_by_group_prefix(NEW.company_id, '114');

    INSERT INTO journal_items (transaction_id, coa_id, debit, credit, ref)
    VALUES (transaction_id, inventory_coa_id, NEW.buy_price, 0, 'Purchase Inventory');

    INSERT INTO journal_items (transaction_id, coa_id, debit, credit, ref)
    VALUES (transaction_id, cash_coa_id, 0, NEW.buy_price, 'Purchase Payment');

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS purchase_transaction_trigger ON purchases;
CREATE TRIGGER purchase_transaction_trigger
AFTER INSERT ON purchases
FOR EACH ROW EXECUTE FUNCTION create_purchase_transaction();

-- Function to get user onboarding and role info
create or replace function public.get_user_access_info()
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  result jsonb;
begin
  select jsonb_build_object(
    'company_id', u.company_id,
    'role', u.role,
    'status', u.status,
    'is_system_admin', (sa.auth_user_id is not null)
  )
  into result
  from public.users u
  left join public.system_admins sa
    on sa.auth_user_id = u.id
  where u.id = auth.uid();

  return result;
end;
$$;

-- Allow only authenticated users to execute
grant execute on function public.get_user_access_info() to authenticated;


-- get_upcoming_stnk_expirations
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

-- updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_users_updated_at ON users;
CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_companies_updated_at ON companies;
CREATE TRIGGER update_companies_updated_at
    BEFORE UPDATE ON companies
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- prevent journal update immutability
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

-- enforce_max_users
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

DROP TRIGGER IF EXISTS trg_enforce_max_users ON users;
CREATE TRIGGER trg_enforce_max_users
BEFORE INSERT OR UPDATE ON users
FOR EACH ROW EXECUTE FUNCTION enforce_max_users();

-- activate_company_owner
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

-- enforce_company_approval_for_users
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

CREATE OR REPLACE FUNCTION set_company_default_settings()
RETURNS TRIGGER AS $$
BEGIN
  NEW.settings := jsonb_build_object(
    'default_currency', 'IDR',
    'tax_rate', 0.11,  -- 11% PPN
    'auto_journal', true,
    'allow_manual_journal', false,
    'enable_public_listing', false,
    'public_listing_url', NULL,
    'multi_branch_enabled', false,
    'default_branch', NULL,
    'branding', jsonb_build_object(
      'logo_url', NULL,
      'primary_color', '#1976d2'
    )
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_set_company_defaults ON companies;

CREATE TRIGGER trg_set_company_defaults
BEFORE INSERT ON companies
FOR EACH ROW
EXECUTE FUNCTION set_company_default_settings();


-- =====================================
-- Enable RLS on tenant tables and policies using JWT claims (no subqueries into users)
-- Important: configure Supabase to include jwt_custom_claims so auth.jwt() contains company_id and role
-- Example usage in policies: (auth.jwt()->>'company_id')::uuid
-- =====================================
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

-- Helper SQL snippets used in policies:
-- company claim: (auth.jwt()->>'company_id')::uuid
-- role claim: auth.jwt()->>'role'
-- is_active claim: (auth.jwt()->>'is_active')::boolean

-- COMPANIES policies
DROP POLICY IF EXISTS companies_select ON companies;
DROP POLICY IF EXISTS companies_insert ON companies;
DROP POLICY IF EXISTS companies_update ON companies;
DROP POLICY IF EXISTS companies_delete ON companies;

-- users should be able to SELECT their own company row or company members can see their company info
CREATE POLICY companies_select ON companies
  FOR SELECT
  USING (
    id = (auth.jwt()->>'company_id')::uuid
  );

-- Allow owner/admin update
CREATE POLICY update_company_settings_policy
ON companies
FOR UPDATE
USING (
  auth.uid() IN (
    SELECT id FROM users 
    WHERE company_id = companies.id 
      AND role IN ('Owner','Admin')
  )
)
WITH CHECK (true);


-- Only system_admins (not tenant admins) can create companies via API. We check system_admin by presence in system_admins table using a SECURITY DEFINER function below.
CREATE POLICY companies_insert ON companies
  FOR INSERT
  WITH CHECK ( exists (select 1 from system_admins where auth_user_id = auth.uid()) );

CREATE POLICY companies_update ON companies
  FOR UPDATE
  USING ( id = (auth.jwt()->>'company_id')::uuid )
  WITH CHECK ( id = (auth.jwt()->>'company_id')::uuid );

CREATE POLICY companies_delete ON companies
  FOR DELETE
  USING ( id = (auth.jwt()->>'company_id')::uuid );

-- Drop existing policies
DROP POLICY IF EXISTS users_select ON users;
DROP POLICY IF EXISTS users_insert ON users;
DROP POLICY IF EXISTS users_update ON users;
DROP POLICY IF EXISTS users_delete ON users;

-- SELECT: User can read users from their company, or system admins can read all
CREATE POLICY users_select ON users
FOR SELECT
USING (
  (auth.jwt()->>'is_system_admin')::boolean = true
  OR company_id = (auth.jwt()->>'company_id')::uuid
);

-- INSERT: 
-- - System admins can insert into any company
-- - Tenant admins can insert into their own company
-- - New signups with NULL company_id and 'pending' status are allowed
DROP POLICY IF EXISTS users_insert ON users;

CREATE POLICY users_insert ON users
FOR INSERT
WITH CHECK (
  (auth.jwt()->>'is_system_admin')::boolean = true
  OR (
    company_id = (auth.jwt()->>'company_id')::uuid
    AND role IN ('admin', 'company_admin')
  )
  OR (
    company_id IS NULL
    AND status = 'pending'
    AND id = auth.uid()
  )
);


-- UPDATE: 
-- - System admins can update any user
-- - Tenant admins can update users in their own company
CREATE POLICY users_update ON users
FOR UPDATE
USING (
  (auth.jwt()->>'is_system_admin')::boolean = true
  OR company_id = (auth.jwt()->>'company_id')::uuid
)
WITH CHECK (
  (auth.jwt()->>'is_system_admin')::boolean = true
  OR company_id = (auth.jwt()->>'company_id')::uuid
);

-- DELETE: 
-- - System admins can delete any user
-- - Tenant admins can delete users in their own company
CREATE POLICY users_delete ON users
FOR DELETE
USING (
  (auth.jwt()->>'is_system_admin')::boolean = true
  OR (
    company_id = (auth.jwt()->>'company_id')::uuid
    AND role IN ('admin', 'company_admin')
  )
);


-- COA_GROUPS
DROP POLICY IF EXISTS coa_groups_select ON coa_groups;
DROP POLICY IF EXISTS coa_groups_insert ON coa_groups;
DROP POLICY IF EXISTS coa_groups_update ON coa_groups;
DROP POLICY IF EXISTS coa_groups_delete ON coa_groups;

CREATE POLICY coa_groups_select ON coa_groups FOR SELECT USING ( TRUE );
CREATE POLICY coa_groups_insert ON coa_groups FOR INSERT WITH CHECK ( exists (select 1 from system_admins where auth_user_id = auth.uid()) );
CREATE POLICY coa_groups_update ON coa_groups FOR UPDATE USING ( exists (select 1 from system_admins where auth_user_id = auth.uid()) ) WITH CHECK ( exists (select 1 from system_admins where auth_user_id = auth.uid()) );
CREATE POLICY coa_groups_delete ON coa_groups FOR DELETE USING ( exists (select 1 from system_admins where auth_user_id = auth.uid()) );

-- CHART_OF_ACCOUNTS
DROP POLICY IF EXISTS chart_of_accounts_select ON chart_of_accounts;
DROP POLICY IF EXISTS chart_of_accounts_insert ON chart_of_accounts;
DROP POLICY IF EXISTS chart_of_accounts_update ON chart_of_accounts;
DROP POLICY IF EXISTS chart_of_accounts_delete ON chart_of_accounts;

CREATE POLICY chart_of_accounts_select ON chart_of_accounts
  FOR SELECT
  USING ( company_id = (auth.jwt()->>'company_id')::uuid );

CREATE POLICY chart_of_accounts_insert ON chart_of_accounts
  FOR INSERT
  WITH CHECK ( company_id = (auth.jwt()->>'company_id')::uuid );

CREATE POLICY chart_of_accounts_update ON chart_of_accounts
  FOR UPDATE
  USING ( company_id = (auth.jwt()->>'company_id')::uuid )
  WITH CHECK ( company_id = (auth.jwt()->>'company_id')::uuid );

CREATE POLICY chart_of_accounts_delete ON chart_of_accounts
  FOR DELETE
  USING ( company_id = (auth.jwt()->>'company_id')::uuid );

-- CARS
DROP POLICY IF EXISTS cars_select ON cars;
DROP POLICY IF EXISTS cars_insert ON cars;
DROP POLICY IF EXISTS cars_update ON cars;
DROP POLICY IF EXISTS cars_delete ON cars;

CREATE POLICY cars_select ON cars
  FOR SELECT
  USING ( company_id = (auth.jwt()->>'company_id')::uuid );

CREATE POLICY cars_insert ON cars
  FOR INSERT
  WITH CHECK ( company_id = (auth.jwt()->>'company_id')::uuid );

CREATE POLICY cars_update ON cars
  FOR UPDATE
  USING ( company_id = (auth.jwt()->>'company_id')::uuid )
  WITH CHECK ( company_id = (auth.jwt()->>'company_id')::uuid );

CREATE POLICY cars_delete ON cars
  FOR DELETE
  USING ( company_id = (auth.jwt()->>'company_id')::uuid );

-- CUSTOMERS
DROP POLICY IF EXISTS customers_select ON customers;
DROP POLICY IF EXISTS customers_insert ON customers;
DROP POLICY IF EXISTS customers_update ON customers;
DROP POLICY IF EXISTS customers_delete ON customers;

CREATE POLICY customers_select ON customers
  FOR SELECT
  USING ( company_id = (auth.jwt()->>'company_id')::uuid );

CREATE POLICY customers_insert ON customers
  FOR INSERT
  WITH CHECK ( company_id = (auth.jwt()->>'company_id')::uuid );

CREATE POLICY customers_update ON customers
  FOR UPDATE
  USING ( company_id = (auth.jwt()->>'company_id')::uuid )
  WITH CHECK ( company_id = (auth.jwt()->>'company_id')::uuid );

CREATE POLICY customers_delete ON customers
  FOR DELETE
  USING ( company_id = (auth.jwt()->>'company_id')::uuid );

-- SALES
DROP POLICY IF EXISTS sales_select ON sales;
DROP POLICY IF EXISTS sales_insert ON sales;
DROP POLICY IF EXISTS sales_update ON sales;
DROP POLICY IF EXISTS sales_delete ON sales;

CREATE POLICY sales_select ON sales
  FOR SELECT
  USING ( company_id = (auth.jwt()->>'company_id')::uuid );

CREATE POLICY sales_insert ON sales
  FOR INSERT
  WITH CHECK ( company_id = (auth.jwt()->>'company_id')::uuid );

CREATE POLICY sales_update ON sales
  FOR UPDATE
  USING ( company_id = (auth.jwt()->>'company_id')::uuid )
  WITH CHECK ( company_id = (auth.jwt()->>'company_id')::uuid );

CREATE POLICY sales_delete ON sales
  FOR DELETE
  USING ( company_id = (auth.jwt()->>'company_id')::uuid );

-- PURCHASES
DROP POLICY IF EXISTS purchases_select ON purchases;
DROP POLICY IF EXISTS purchases_insert ON purchases;
DROP POLICY IF EXISTS purchases_update ON purchases;
DROP POLICY IF EXISTS purchases_delete ON purchases;

CREATE POLICY purchases_select ON purchases
  FOR SELECT
  USING ( company_id = (auth.jwt()->>'company_id')::uuid );

CREATE POLICY purchases_insert ON purchases
  FOR INSERT
  WITH CHECK ( company_id = (auth.jwt()->>'company_id')::uuid );

CREATE POLICY purchases_update ON purchases
  FOR UPDATE
  USING ( company_id = (auth.jwt()->>'company_id')::uuid )
  WITH CHECK ( company_id = (auth.jwt()->>'company_id')::uuid );

CREATE POLICY purchases_delete ON purchases
  FOR DELETE
  USING ( company_id = (auth.jwt()->>'company_id')::uuid );

-- TRANSACTIONS
DROP POLICY IF EXISTS transactions_select ON transactions;
DROP POLICY IF EXISTS transactions_insert ON transactions;
DROP POLICY IF EXISTS transactions_update ON transactions;
DROP POLICY IF EXISTS transactions_delete ON transactions;

CREATE POLICY transactions_select ON transactions
  FOR SELECT
  USING ( company_id = (auth.jwt()->>'company_id')::uuid );

CREATE POLICY transactions_insert ON transactions
  FOR INSERT
  WITH CHECK ( company_id = (auth.jwt()->>'company_id')::uuid );

CREATE POLICY transactions_update ON transactions
  FOR UPDATE
  USING ( company_id = (auth.jwt()->>'company_id')::uuid )
  WITH CHECK ( company_id = (auth.jwt()->>'company_id')::uuid );

CREATE POLICY transactions_delete ON transactions
  FOR DELETE
  USING ( company_id = (auth.jwt()->>'company_id')::uuid );

-- JOURNAL_ITEMS (scope via transactions.company_id)
DROP POLICY IF EXISTS journal_items_select ON journal_items;
DROP POLICY IF EXISTS journal_items_insert ON journal_items;
DROP POLICY IF EXISTS journal_items_update ON journal_items;
DROP POLICY IF EXISTS journal_items_delete ON journal_items;

CREATE POLICY journal_items_select ON journal_items
  FOR SELECT
  USING (
    transaction_id IN (
      SELECT id FROM transactions WHERE company_id = (auth.jwt()->>'company_id')::uuid
    )
  );

CREATE POLICY journal_items_insert ON journal_items
  FOR INSERT
  WITH CHECK (
    transaction_id IN (
      SELECT id FROM transactions WHERE company_id = (auth.jwt()->>'company_id')::uuid
    )
  );

CREATE POLICY journal_items_update ON journal_items
  FOR UPDATE
  USING (
    transaction_id IN (
      SELECT id FROM transactions WHERE company_id = (auth.jwt()->>'company_id')::uuid
    )
  )
  WITH CHECK (
    transaction_id IN (
      SELECT id FROM transactions WHERE company_id = (auth.jwt()->>'company_id')::uuid
    )
  );

CREATE POLICY journal_items_delete ON journal_items
  FOR DELETE
  USING (
    transaction_id IN (
      SELECT id FROM transactions WHERE company_id = (auth.jwt()->>'company_id')::uuid
    )
  );

-- ATTACHMENTS
DROP POLICY IF EXISTS attachments_select ON attachments;
DROP POLICY IF EXISTS attachments_insert ON attachments;
DROP POLICY IF EXISTS attachments_update ON attachments;
DROP POLICY IF EXISTS attachments_delete ON attachments;

CREATE POLICY attachments_select ON attachments
  FOR SELECT
  USING ( company_id = (auth.jwt()->>'company_id')::uuid );

CREATE POLICY attachments_insert ON attachments
  FOR INSERT
  WITH CHECK ( company_id = (auth.jwt()->>'company_id')::uuid );

CREATE POLICY attachments_update ON attachments
  FOR UPDATE
  USING ( company_id = (auth.jwt()->>'company_id')::uuid )
  WITH CHECK ( company_id = (auth.jwt()->>'company_id')::uuid );

CREATE POLICY attachments_delete ON attachments
  FOR DELETE
  USING ( company_id = (auth.jwt()->>'company_id')::uuid );


  FOR SELECT
  USING ( company_id = (auth.jwt()->>'company_id')::uuid );

  FOR INSERT
  WITH CHECK ( company_id = (auth.jwt()->>'company_id')::uuid );

  FOR UPDATE
  USING ( company_id = (auth.jwt()->>'company_id')::uuid )
  WITH CHECK ( company_id = (auth.jwt()->>'company_id')::uuid );

  FOR DELETE
  USING ( company_id = (auth.jwt()->>'company_id')::uuid );

-- =====================================
-- View: upcoming_stnk_expirations
-- =====================================
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

-- =====================================
-- Seed minimal COA groups (idempotent)
-- =====================================
INSERT INTO coa_groups (prefix, name, type)
SELECT * FROM (VALUES
('111','Kas dan Setara Kas','asset'),
('112','Piutang Usaha','asset'),
('113','Uang Muka / Advances','asset'),
('114','Aset Tetap','asset'),
('115','Aset Valas','asset'),
('211','Hutang Usaha','liability'),
('212','Pendapatan Diterima Dimuka','liability'),
('311','Modal Pemilik','equity'),
('312','Laba Ditahan','equity'),
('411','Pendapatan Usaha','income'),
('412','Pendapatan Lain-Lain','income'),
('611','Beban Operasional Umum','expense'),
('612','Beban Pajak','expense'),
('613','Beban Pembelian Aset / Barang Modal','expense'),
('614','Beban Selisih Kurs','expense')
) AS vals(prefix,name,type)
ON CONFLICT (prefix) DO NOTHING;

-- =====================================
-- Final notes (manual steps you should perform):
--    That makes auth.jwt() include company_id, role, is_active for the authenticated user.
-- 2) Ensure you insert yourself into system_admins (via dashboard SQL) so you can approve companies.
--    Example:
--    INSERT INTO system_admins (auth_user_id, email, name) VALUES ('<your-auth-uid>','you@example.com','You');
-- 3) Test RLS using policy testing or by using the user's JWT.

-- End of schema