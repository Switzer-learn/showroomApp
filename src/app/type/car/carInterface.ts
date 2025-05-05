export interface CarInterface {
    id: string;
    merk: string;
    tipe: string;
    model: string;
    series: string;
    body_type: string;
    variation: string;
    tahun: number;
    plat_nomor: string;
    warna: string;
    transmisi: string;
    bahan_bakar: string;
    kondisi: string;
    kilometer: number;
    harga_beli: number;
    harga_jual: number;
    tanggal_beli: string;
    deskripsi?: string;
    status: string;
    image_url?: string;
    previous_owners?: number;
    registration_expiry: string;
    created_at: string;
}
