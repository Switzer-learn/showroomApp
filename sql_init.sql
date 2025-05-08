-- Inisialisasi database untuk aplikasi Dealer Mobil Bekas

-- Aktifkan ekstensi UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Drop policies and storage
DROP POLICY IF EXISTS "Images are publicly accessible" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update their own images" ON storage.objects;

DELETE FROM storage.buckets WHERE id = 'gambar-mobil';

-- Drop tables
DROP TABLE IF EXISTS mobil_images;
DROP TABLE IF EXISTS penjualan;
DROP TABLE IF EXISTS mobil;
DROP TABLE IF EXISTS customers;
DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS pending_users;

-- Tabel Pending Users (for new registrations)
CREATE TABLE pending_users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email TEXT NOT NULL UNIQUE,
    nama TEXT,
    no_hp TEXT,
    approved BOOLEAN DEFAULT FALSE,
    level TEXT CHECK (level IN ('admin', 'sales')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabel Users (Admin & Sales)
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT NOT NULL UNIQUE,
  nama TEXT,
  no_hp TEXT,
  approved BOOLEAN DEFAULT FALSE,
  level TEXT NOT NULL CHECK (level IN ('admin', 'sales')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabel Customers
CREATE TABLE customers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nama TEXT NOT NULL,
  no_hp TEXT NOT NULL,
  alamat TEXT,
  jenis_kelamin TEXT CHECK (jenis_kelamin IN ('Laki-laki', 'Perempuan')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabel Mobil
CREATE TABLE mobil (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  merk TEXT NOT NULL,
  tipe TEXT NOT NULL,
  model TEXT NOT NULL,
  series TEXT,
  body_type TEXT NOT NULL CHECK (body_type IN ('Sedan', 'SUV', 'MPV', 'Hatchback', 'Pickup', 'Van')),
  variation TEXT,
  tahun INTEGER NOT NULL,
  plat_nomor TEXT NOT NULL,
  warna TEXT NOT NULL,
  transmisi TEXT NOT NULL CHECK (transmisi IN ('Manual', 'Otomatis')),
  bahan_bakar TEXT NOT NULL CHECK (bahan_bakar IN ('Bensin', 'Diesel', 'Listrik')),
  kondisi TEXT NOT NULL CHECK (kondisi IN ('Sangat Baik', 'Baik', 'Cukup', 'Rusak Ringan')),
  kilometer INTEGER NOT NULL,
  harga_beli INTEGER NOT NULL,
  harga_jual INTEGER,
  tanggal_beli DATE NOT NULL,
  deskripsi TEXT,
  status TEXT NOT NULL CHECK (status IN ('Tersedia', 'Terjual')),
  image_url TEXT,
  previous_owners INTEGER DEFAULT 1,
  registration_expiry DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT unique_plat_nomor UNIQUE (plat_nomor)
);

-- Tabel Penjualan
CREATE TABLE penjualan (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  mobil_id UUID NOT NULL REFERENCES mobil(id) ON DELETE CASCADE,
  customer_id UUID REFERENCES customers(id),
  sales_id UUID REFERENCES users(id),
  nama_pembeli TEXT NOT NULL,
  alamat_pembeli TEXT NOT NULL,
  nomor_hp_pembeli TEXT NOT NULL,
  metode_pembayaran TEXT NOT NULL CHECK (metode_pembayaran IN ('Tunai', 'Kredit')),
  nama_leasing TEXT,
  uang_muka INTEGER,
  harga_kredit INTEGER,
  dana_dari_leasing INTEGER,
  tanggal_jual DATE NOT NULL,
  total_harga INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabel Mobil Images (multiple images per mobil)
CREATE TABLE mobil_images (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  mobil_id UUID NOT NULL REFERENCES mobil(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  uploaded_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_mobil_status ON mobil(status);
CREATE INDEX idx_mobil_merk ON mobil(merk);
CREATE INDEX idx_mobil_tipe ON mobil(tipe);
CREATE INDEX idx_mobil_tahun ON mobil(tahun);
CREATE INDEX idx_mobil_series ON mobil(series);
CREATE INDEX idx_mobil_body_type ON mobil(body_type);
CREATE INDEX idx_mobil_variation ON mobil(variation);
CREATE INDEX idx_mobil_registration_expiry ON mobil(registration_expiry);
CREATE INDEX idx_penjualan_tanggal ON penjualan(tanggal_jual);
CREATE INDEX idx_penjualan_mobil_id ON penjualan(mobil_id);
CREATE INDEX idx_penjualan_customer_id ON penjualan(customer_id);
CREATE INDEX idx_penjualan_sales_id ON penjualan(sales_id);
CREATE INDEX idx_customers_nama ON customers(nama);

-- Storage bucket for images
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'gambar-mobil',
  'gambar-mobil',
  true,
  5242880,
  ARRAY['image/jpeg', 'image/png', 'image/gif']
);

-- Storage policies
CREATE POLICY "Images are publicly accessible"
  ON storage.objects FOR SELECT USING (bucket_id = 'gambar-mobil');

CREATE POLICY "Authenticated users can upload images"
  ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'gambar-mobil');

CREATE POLICY "Authenticated users can update their own images"
  ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'gambar-mobil');

UPDATE storage.buckets SET public = true WHERE id = 'gambar-mobil';

-- Enable Row Level Security
ALTER TABLE mobil ENABLE ROW LEVEL SECURITY;
ALTER TABLE penjualan ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;

-- RLS Policies
DROP POLICY IF EXISTS "Admins can do everything with mobil" ON mobil;
CREATE POLICY "Admins can do everything with mobil"
  ON mobil FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Admins can do everything with penjualan" ON penjualan;
CREATE POLICY "Admins can do everything with penjualan"
  ON penjualan FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Only self or admin" ON users;
CREATE POLICY "Only self or admin"
  ON users FOR SELECT USING (
    auth.uid() = id OR EXISTS (
      SELECT 1 FROM users u WHERE u.id = auth.uid() AND u.level = 'admin'
    )
  );

DROP POLICY IF EXISTS "Allow all authenticated" ON customers;
CREATE POLICY "Allow all authenticated"
  ON customers FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Sample Data Inserts
INSERT INTO users (email, nama, no_hp, approved, level) VALUES
  ('admin@example.com', 'Admin Utama', '081234567890', true, 'admin'),
  ('sales1@example.com', 'Sales One', '081234567891', true, 'sales'),
  ('sales2@example.com', 'Sales Two', '081234567892', false, 'sales');

INSERT INTO customers (nama, no_hp, alamat, jenis_kelamin) VALUES
  ('Budi Santoso', '081234567893', 'Jakarta', 'Laki-laki'),
  ('Siti Aminah', '081234567894', 'Bandung', 'Perempuan'),
  ('Tono Wirawan', '081234567895', 'Surabaya', 'Laki-laki');

INSERT INTO mobil (merk, tipe, model, series, body_type, variation, tahun, plat_nomor, warna, transmisi, bahan_bakar, kondisi, kilometer, harga_beli, harga_jual, tanggal_beli, deskripsi, status, image_url, previous_owners, registration_expiry) VALUES
  ('Toyota', 'Avanza', 'G', '1.5', 'MPV', 'Luxury', 2020, 'B1234XYZ', 'Hitam', 'Manual', 'Bensin', 'Baik', 45000, 150000000, 160000000, '2024-01-01', 'Mobil keluarga irit', 'Tersedia', 'https://example.com/image1.jpg', 1, '2025-01-01'),
  ('Honda', 'Jazz', 'RS', NULL, 'Hatchback', 'Sport', 2019, 'B5678ABC', 'Merah', 'Otomatis', 'Bensin', 'Sangat Baik', 30000, 170000000, 180000000, '2023-05-10', 'Mobil sporty anak muda', 'Tersedia', 'https://example.com/image2.jpg', 1, '2025-05-10'),
  ('Suzuki', 'Ertiga', 'GL', NULL, 'MPV', NULL, 2018, 'B9999ZZZ', 'Putih', 'Manual', 'Bensin', 'Cukup', 60000, 120000000, 130000000, '2022-08-15', 'Cocok untuk keluarga kecil', 'Tersedia', 'https://example.com/image3.jpg', 2, '2024-08-15');

INSERT INTO penjualan (mobil_id, customer_id, sales_id, nama_pembeli, alamat_pembeli, nomor_hp_pembeli, metode_pembayaran, nama_leasing, uang_muka, harga_kredit, dana_dari_leasing, tanggal_jual) VALUES
  ((SELECT id FROM mobil WHERE plat_nomor = 'B1234XYZ'), (SELECT id FROM customers WHERE nama = 'Budi Santoso'), (SELECT id FROM users WHERE email = 'sales1@example.com'), 'Budi Santoso', 'Jakarta', '081234567893', 'Tunai', NULL, NULL, NULL, NULL, '2024-02-01'),
  ((SELECT id FROM mobil WHERE plat_nomor = 'B5678ABC'), (SELECT id FROM customers WHERE nama = 'Siti Aminah'), (SELECT id FROM users WHERE email = 'sales2@example.com'), 'Siti Aminah', 'Bandung', '081234567894', 'Kredit', 'Mega Finance', 50000000, 200000000, 150000000, '2024-03-15'),
  ((SELECT id FROM mobil WHERE plat_nomor = 'B9999ZZZ'), (SELECT id FROM customers WHERE nama = 'Tono Wirawan'), (SELECT id FROM users WHERE email = 'sales1@example.com'), 'Tono Wirawan', 'Surabaya', '081234567895', 'Tunai', NULL, NULL, NULL, NULL, '2024-04-20');

INSERT INTO mobil_images (mobil_id, image_url) VALUES
  ((SELECT id FROM mobil WHERE plat_nomor = 'B1234XYZ'), 'https://example.com/image1-1.jpg'),
  ((SELECT id FROM mobil WHERE plat_nomor = 'B5678ABC'), 'https://example.com/image2-1.jpg'),
  ((SELECT id FROM mobil WHERE plat_nomor = 'B9999ZZZ'), 'https://example.com/image3-1.jpg');


-- fncton
create or replace function analytics()
returns text
language sql
as $$
  with summary as (
    select
      coalesce(sum(p.total_harga), 0) as total_revenue,
      coalesce(sum(m.harga_beli), 0) as total_cost,
      coalesce(sum(p.total_harga), 0) - coalesce(sum(m.harga_beli), 0) as profit,
      case
        when coalesce(sum(p.total_harga), 0) = 0 then 0
        else round(
          ((coalesce(sum(p.total_harga), 0) - coalesce(sum(m.harga_beli), 0))::numeric
          / coalesce(sum(p.total_harga), 1)) * 100, 2
        )
      end as profit_margin
    from penjualan p
    join mobil m on p.mobil_id = m.id
  ),
  sales_by_month as (
    select
      to_char(p.created_at, 'YYYY-MM') as month,
      count(*) as count,
      sum(p.total_harga) as total
    from penjualan p
    group by 1
    order by 1
  ),
  top_5_best_sellers as (
    select
      m.merk,
      m.series,
      count(*) as units_sold
    from penjualan p
    join mobil m on p.mobil_id = m.id
    group by m.merk, m.series
    order by units_sold desc
    limit 5
  ),
  avg_days_to_sell as (
    select
      avg(extract(day from p.created_at - m.created_at)) as avg_days
    from penjualan p
    join mobil m on p.mobil_id = m.id
  ),
  unsold_over_90_days as (
    select
      m.id,
      m.merk,
      m.series,
      extract(day from now() - m.created_at) as age
    from mobil m
    where m.id not in (select mobil_id from penjualan)
    and now() - m.created_at > interval '90 days'
  )
  select json_build_object(
    'summary', (select row_to_json(summary) from summary),
    'sales_by_month', (select json_agg(sales_by_month) from sales_by_month),
    'top_5_best_sellers', (select json_agg(top_5_best_sellers) from top_5_best_sellers),
    'avg_days_to_sell', (select avg_days from avg_days_to_sell),
    'unsold_over_90_days', (select json_agg(unsold_over_90_days) from unsold_over_90_days)
  )::text;
$$;


