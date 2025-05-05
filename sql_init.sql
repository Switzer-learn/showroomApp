-- Inisialisasi database untuk aplikasi Dealer Mobil Bekas

-- Aktifkan ekstensi UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Drop tables and storage in reverse order of dependencies
DROP POLICY IF EXISTS "Images are publicly accessible" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update their own images" ON storage.objects;

DELETE FROM storage.buckets WHERE id = 'gambar-mobil';

DROP TABLE IF EXISTS mobil_images;
DROP TABLE IF EXISTS penjualan;
DROP TABLE IF EXISTS mobil;
DROP TABLE IF EXISTS customers;
DROP TABLE IF EXISTS users;

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


