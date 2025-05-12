export interface Customer {
  id: string;
  nama: string;
  no_hp: string;
  alamat: string | null;
  jenis_kelamin: 'Laki-laki' | 'Perempuan' | null;
  created_at: string;
}

export interface Transaction {
  id: string;
  mobil_id: string;
  customer_id: string;
  sales_id: string;
  nama_pembeli: string;
  alamat_pembeli: string;
  nomor_hp_pembeli: string;
  metode_pembayaran: 'Tunai' | 'Kredit';
  nama_leasing: string | null;
  uang_muka: number | null;
  harga_kredit: number | null;
  dana_dari_leasing: number | null;
  tanggal_jual: string;
  total_harga: number;
  created_at: string;
  mobil: {
    merk: string;
    tipe: string;
    model: string;
    series: string | null;
  };
} 