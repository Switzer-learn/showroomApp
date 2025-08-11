"use client";

import Link from "next/link";
import { useMemo } from "react";
import { notFound, useParams } from "next/navigation";

// Keep in sync with inventory/page.tsx mock type
type ID = string;
type Status = "Tersedia" | "Reserved" | "Terjual";
type Transmisi = "Manual" | "Otomatis";
type BahanBakar = "Bensin" | "Diesel" | "Listrik";

export interface Mobil {
  id: ID;
  merk: string;
  tipe?: string;
  model: string;
  series?: string;
  body_type?: string;
  variation?: string;
  tahun: number;
  plat_nomor: string;
  warna: string;
  transmisi: Transmisi;
  bahan_bakar: BahanBakar;
  kondisi: string;
  kilometer: number;
  harga_beli: number;
  harga_jual: number;
  tanggal_beli: string; // ISO date
  deskripsi?: string;
  status: Status;
  previous_owners?: number;
  registration_expiry?: string; // ISO date
  image_url?: string;
}

// Temporary: minimal mirror of the dataset to allow detail route to render.
// In a future step, centralize into a shared mock module.
const MOCK_MOBIL_INDEX: Record<string, Mobil> = {
  m1: {
    id: "m1",
    merk: "Toyota",
    tipe: "Avanza",
    model: "G",
    series: "1.3",
    body_type: "MPV",
    variation: "Standard",
    tahun: 2019,
    plat_nomor: "DD 1234 AB",
    warna: "Putih",
    transmisi: "Manual",
    bahan_bakar: "Bensin",
    kondisi: "Baik",
    kilometer: 55000,
    harga_beli: 145_000_000,
    harga_jual: 165_000_000,
    tanggal_beli: "2024-03-01",
    deskripsi: "Unit terawat, servis rutin bengkel resmi.",
    status: "Tersedia",
    previous_owners: 1,
    registration_expiry: "2025-11-01",
    image_url: "/vercel.svg",
  },
  m2: {
    id: "m2",
    merk: "Honda",
    tipe: "Brio",
    model: "E",
    tahun: 2020,
    plat_nomor: "DD 4321 CD",
    warna: "Kuning",
    transmisi: "Otomatis",
    bahan_bakar: "Bensin",
    kondisi: "Baik",
    kilometer: 31000,
    harga_beli: 120_000_000,
    harga_jual: 138_000_000,
    tanggal_beli: "2024-02-12",
    status: "Terjual",
    image_url: "/next.svg",
  },
  m3: {
    id: "m3",
    merk: "Daihatsu",
    tipe: "Xenia",
    model: "R",
    tahun: 2018,
    plat_nomor: "DD 7788 EF",
    warna: "Abu-abu",
    transmisi: "Manual",
    bahan_bakar: "Bensin",
    kondisi: "Baik",
    kilometer: 72000,
    harga_beli: 110_000_000,
    harga_jual: 129_000_000,
    tanggal_beli: "2024-01-20",
    status: "Reserved",
    image_url: "/globe.svg",
  },
};

function formatCurrencyIDR(n: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(n);
}

export default function InventoryDetailPage() {
  const params = useParams<{ id: string }>();
  const id = params?.id;
  const car = useMemo(() => (id ? MOCK_MOBIL_INDEX[id] : undefined), [id]);

  if (!id || !car) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-white text-gray-800">
      <div className="pointer-events-none fixed inset-0 -z-10 bg-[radial-gradient(1200px_600px_at_85%_10%,rgba(37,99,235,0.08),transparent_60%)]" />
      <div className="mx-auto max-w-6xl px-6 py-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
              {car.merk} {car.tipe ? `${car.tipe} ` : ""}{car.model}
            </h1>
            <p className="text-gray-500 text-sm">
              {car.tahun} • {car.transmisi} • {car.bahan_bakar} • Plat {car.plat_nomor}
            </p>
          </div>
          <div className="flex gap-2">
            <Link
              href="/inventory"
              className="px-4 py-2 rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-50 transition"
            >
              Kembali
            </Link>
            <Link
              href={`/editMobil/${car.id}`}
              className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition shadow-[0_10px_30px_-10px_rgba(37,99,235,0.5)]"
            >
              Edit
            </Link>
          </div>
        </div>

        <section className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Gallery */}
          <div className="md:col-span-2">
            <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
              <div className="aspect-[16/9] w-full rounded-lg border border-gray-200 bg-gray-50 grid place-items-center text-gray-400">
                {/* Placeholder since we do not import next/image here */}
                <span className="text-sm">Gambar: {car.image_url ?? "no-image"}</span>
              </div>
              {car.deskripsi && (
                <p className="mt-4 text-gray-700 text-sm leading-relaxed">
                  {car.deskripsi}
                </p>
              )}
            </div>
          </div>

          {/* Pricing box */}
          <aside className="md:col-span-1">
            <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
              <div className="text-sm text-gray-600">Harga Jual</div>
              <div className="text-2xl font-semibold text-gray-900">
                {formatCurrencyIDR(car.harga_jual)}
              </div>
              <div className="mt-2 grid grid-cols-2 gap-2 text-xs text-gray-600">
                <div>Harga Beli</div>
                <div className="text-right text-gray-900 font-medium">
                  {formatCurrencyIDR(car.harga_beli)}
                </div>
                <div>Kilometer</div>
                <div className="text-right text-gray-900 font-medium">
                  {car.kilometer.toLocaleString("id-ID")}
                </div>
                <div>Status</div>
                <div className="text-right text-gray-900 font-medium">
                  {car.status}
                </div>
                {car.previous_owners !== undefined && (
                  <>
                    <div>Jumlah Pemilik</div>
                    <div className="text-right text-gray-900 font-medium">
                      {car.previous_owners}
                    </div>
                  </>
                )}
                {car.registration_expiry && (
                  <>
                    <div>STNK Berlaku</div>
                    <div className="text-right text-gray-900 font-medium">
                      {new Date(car.registration_expiry).toLocaleDateString("id-ID")}
                    </div>
                  </>
                )}
              </div>
              <div className="mt-4 flex gap-2">
                <Link
                  href={`/inventory/${car.id}?action=jual`}
                  className="px-3 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition text-sm"
                >
                  Jual Mobil
                </Link>
                <Link
                  href={`/editMobil/${car.id}`}
                  className="px-3 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 transition text-sm"
                >
                  Edit Data
                </Link>
              </div>
            </div>
          </aside>
        </section>

        {/* Specs */}
        <section className="mt-6 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900">Spesifikasi</h2>
          <div className="mt-3 grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
            <Spec label="Merk" value={car.merk} />
            {car.tipe && <Spec label="Tipe" value={car.tipe} />}
            <Spec label="Model" value={car.model} />
            {car.series && <Spec label="Series" value={car.series} />}
            {car.body_type && <Spec label="Body Type" value={car.body_type} />}
            {car.variation && <Spec label="Varian" value={car.variation} />}
            <Spec label="Warna" value={car.warna} />
            <Spec label="Transmisi" value={car.transmisi} />
            <Spec label="Bahan Bakar" value={car.bahan_bakar} />
            <Spec label="Kondisi" value={car.kondisi} />
            <Spec label="Tahun" value={String(car.tahun)} />
            <Spec label="Plat Nomor" value={car.plat_nomor} />
            <Spec label="Tanggal Beli" value={new Date(car.tanggal_beli).toLocaleDateString("id-ID")} />
          </div>
        </section>
      </div>
    </main>
  );
}

function Spec({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-3">
      <div className="text-[11px] uppercase tracking-wide text-gray-500">{label}</div>
      <div className="mt-1 text-gray-900">{value}</div>
    </div>
  );
}