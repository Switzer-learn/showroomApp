-- Onboarding Schema Updates for Used Car Dealer App
-- This aligns the settings table with companies table and adds onboarding tracking

-- Update companies table to include onboarding fields
ALTER TABLE companies 
ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS onboarding_step INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS onboarding_started_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS onboarding_completed_at TIMESTAMPTZ;

-- Create enhanced settings table that merges with company information
CREATE TABLE IF NOT EXISTS company_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    
    -- Company Information
    company_name TEXT NOT NULL,
    company_logo_url TEXT,
    company_email TEXT,
    company_phone TEXT,
    company_address TEXT,
    
    -- Business Settings
    currency_code TEXT DEFAULT 'IDR',
    accounting_start_date DATE NOT NULL,
    fiscal_year_start DATE DEFAULT CURRENT_DATE,
    
    -- Business Details
    business_type TEXT CHECK (business_type IN ('dealer', 'showroom', 'workshop', 'other')),
    tax_id TEXT,
    website_url TEXT,
    
    -- Preferences
    timezone TEXT DEFAULT 'Asia/Jakarta',
    language TEXT DEFAULT 'id',
    date_format TEXT DEFAULT 'DD/MM/YYYY',
    
    -- Features
    enable_multi_branch BOOLEAN DEFAULT FALSE,
    enable_workshop_module BOOLEAN DEFAULT FALSE,
    enable_accounting_module BOOLEAN DEFAULT TRUE,
    
    -- Branding
    primary_color TEXT DEFAULT '#3B82F6',
    secondary_color TEXT DEFAULT '#1E40AF',
    logo_url TEXT,
    
    -- Created/Updated timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Ensure one settings per company
    UNIQUE(company_id)
);

-- Create onboarding progress tracking
CREATE TABLE IF NOT EXISTS onboarding_progress (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    -- Progress tracking
    current_step INTEGER DEFAULT 1,
    total_steps INTEGER DEFAULT 5,
    completed_steps INTEGER[] DEFAULT '{}',
    
    -- Step data storage (JSON for flexibility)
    step_data JSONB DEFAULT '{}',
    
    -- Timestamps
    started_at TIMESTAMPTZ DEFAULT NOW(),
    last_activity_at TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ,
    
    UNIQUE(company_id, user_id)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_companies_onboarding ON companies(onboarding_completed, onboarding_step);
CREATE INDEX IF NOT EXISTS idx_company_settings_company_id ON company_settings(company_id);
CREATE INDEX IF NOT EXISTS idx_onboarding_progress_company_id ON onboarding_progress(company_id);
CREATE INDEX IF NOT EXISTS idx_onboarding_progress_user_id ON onboarding_progress(user_id);

-- Update existing settings table to use new structure (if needed)
-- This is a migration path from old settings to new structure
INSERT INTO company_settings (
    company_id, 
    company_name, 
    company_email, 
    company_phone, 
    company_address,
    currency_code,
    accounting_start_date
)
SELECT 
    c.id as company_id,
    c.name as company_name,
    s.value->>'email' as company_email,
    s.value->>'phone' as company_phone,
    s.value->>'address' as company_address,
    COALESCE(s.value->>'currency_code', 'IDR') as currency_code,
    (s.value->>'accounting_start_date')::DATE as accounting_start_date
FROM companies c
LEFT JOIN settings s ON c.id = s.company_id AND s.key = 'company_info'
WHERE NOT EXISTS (
    SELECT 1 FROM company_settings cs WHERE cs.company_id = c.id
);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for automatic timestamp updates
DROP TRIGGER IF EXISTS update_company_settings_updated_at ON company_settings;
CREATE TRIGGER update_company_settings_updated_at
    BEFORE UPDATE ON company_settings
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Create function to complete onboarding
CREATE OR REPLACE FUNCTION complete_onboarding(company_uuid UUID, user_uuid UUID)
RETURNS VOID AS $$
BEGIN
    -- Update company onboarding status
    UPDATE companies 
    SET onboarding_completed = TRUE, 
        onboarding_completed_at = NOW(),
        onboarding_step = 5
    WHERE id = company_uuid;
    
    -- Update onboarding progress
    UPDATE onboarding_progress
    SET completed_at = NOW(),
        last_activity_at = NOW()
    WHERE company_id = company_uuid AND user_id = user_uuid;
END;
$$ LANGUAGE plpgsql;

-- Add RLS policies for new tables
ALTER TABLE company_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE onboarding_progress ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY company_settings_policy ON company_settings
    FOR ALL USING (company_id IN (SELECT company_id FROM users WHERE id = auth.uid()));

CREATE POLICY onboarding_progress_policy ON onboarding_progress
    FOR ALL USING (company_id IN (SELECT company_id FROM users WHERE id = auth.uid()));