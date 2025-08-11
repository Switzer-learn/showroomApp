"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { FaSearch, FaFilter, FaEdit, FaShoppingCart, FaCar } from "react-icons/fa";
import AddCarDrawer from "./components/AddCarDrawer";
import SellCarDrawer from "./components/SellCarDrawer";
import PhotoUploader from "./components/PhotoUploader";

// Mock interfaces aligned with database.sql (mobil)
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

// Simple mock dataset (easily replaceable with Supabase)
const MOCK_MOBIL: Mobil[] = [
  {
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
  {
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
  {
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
  {
    id: "m4",
    merk: "Suzuki",
    tipe: "Ertiga",
    model: "GX",
    tahun: 2019,
    plat_nomor: "DD 9988 ZZ",
    warna: "Merah",
    transmisi: "Manual",
    bahan_bakar: "Bensin",
    kondisi: "Baik",
    kilometer: 64000,
    harga_beli: 135_000_000,
    harga_jual: 155_000_000,
    tanggal_beli: "2024-02-28",
    status: "Tersedia",
    image_url: "/window.svg",
  },
  {
    id: "m5",
    merk: "Mitsubishi",
    tipe: "Xpander",
    model: "Exceed",
    tahun: 2021,
    plat_nomor: "DD 6677 HH",
    warna: "Hitam",
    transmisi: "Otomatis",
    bahan_bakar: "Bensin",
    kondisi: "Sangat Baik",
    kilometer: 28000,
    harga_beli: 210_000_000,
    harga_jual: 235_000_000,
    tanggal_beli: "2024-05-14",
    status: "Tersedia",
    image_url: "/file.svg",
  },
];

function formatCurrencyIDR(n: number) {
  return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(n);
}

export default function InventoryPage() {
  // UI state
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<Status | "Semua">("Semua");
  const [merk, setMerk] = useState<string>("Semua");
  const [openSale, setOpenSale] = useState<null | Mobil>(null);
  const [openAdd, setOpenAdd] = useState(false);
  const [openUploader, setOpenUploader] = useState(false);
  const [uploaderCarId, setUploaderCarId] = useState<string | null>(null);

  // Derive filters list
  const merkList = useMemo(() => {
    const set = new Set(MOCK_MOBIL.map((m) => m.merk));
    return ["Semua", ...Array.from(set)];
  }, []);

  // Filtered dataset
  const filtered = useMemo(() => {
    return MOCK_MOBIL.filter((m) => {
      const matchesQuery =
        !query ||
        [m.merk, m.tipe, m.model, m.plat_nomor]
          .filter(Boolean)
          .join(" ")
          .toLowerCase()
          .includes(query.toLowerCase());

      const matchesStatus = status === "Semua" ? true : m.status === status;
      const matchesMerk = merk === "Semua" ? true : m.merk === merk;

      return matchesQuery && matchesStatus && matchesMerk;
    });
  }, [query, status, merk]);

  return (
    <main className="min-h-screen bg-white text-gray-800">
      {/* subtle page background gradient accent */}
      <div className="pointer-events-none fixed inset-0 -z-10 bg-[radial-gradient(1200px_600px_at_85%_10%,rgba(37,99,235,0.08),transparent_60%)]" />
      <div className="mx-auto max-w-7xl px-6 py-6">
        {/* Header */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            <div className="h-9 w-9 rounded-lg bg-blue-600 text-white grid place-items-center shadow-[0_10px_30px_-10px_rgba(37,99,235,0.5)]">
              <FaCar />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Inventory</h1>
              <p className="text-gray-500 text-sm">Browse, filter, and manage your cars</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Link
              href="/inventory/board"
              className="px-4 py-2 rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-50 transition"
              prefetch={false}
              aria-label="Buka tampilan papan Inventory"
            >
              Board
            </Link>
            <button
              onClick={() => setOpenAdd(true)}
              className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition shadow-[0_10px_30px_-10px_rgba(37,99,235,0.5)] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-600"
              aria-haspopup="dialog"
              aria-expanded={openAdd ? "true" : "false"}
              aria-controls="add-car-drawer"
            >
              Tambah Mobil
            </button>
            <Link
              href="/inventory"
              className="px-4 py-2 rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-50 transition"
              prefetch={false}
              aria-label="Refresh halaman Inventory"
            >
              Refresh
            </Link>
          </div>
        </div>

        {/* Filters */}
        <section className="mt-6 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <div className="relative">
              <FaSearch className="absolute left-3 top-3 text-gray-400" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Cari merk/model/plat..."
                className="w-full pl-9 pr-3 py-2 rounded-lg border border-gray-300 bg-white text-gray-900 focus:border-blue-500"
              />
            </div>
            <div className="relative">
              <FaFilter className="absolute left-3 top-3 text-gray-400" />
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as any)}
                className="w-full pl-9 pr-3 py-2 rounded-lg border border-gray-300 bg-white text-gray-900 focus:border-blue-500"
              >
                <option value="Semua">Semua Status</option>
                <option value="Tersedia">Tersedia</option>
                <option value="Reserved">Reserved</option>
                <option value="Terjual">Terjual</option>
              </select>
            </div>
            <div className="relative">
              <FaFilter className="absolute left-3 top-3 text-gray-400" />
              <select
                value={merk}
                onChange={(e) => setMerk(e.target.value)}
                className="w-full pl-9 pr-3 py-2 rounded-lg border border-gray-300 bg-white text-gray-900 focus:border-blue-500"
              >
                {merkList.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex items-center">
              <div className="text-xs text-gray-600">
                Menampilkan <span className="font-semibold text-gray-900">{filtered.length}</span> hasil
              </div>
            </div>
          </div>
        </section>

        {/* Grid */}
        <section className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((m) => (
            <article key={m.id} className="relative overflow-hidden rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
              {/* Accent */}
              <div className="pointer-events-none absolute -top-10 -right-14 h-40 w-40 rotate-12 bg-gradient-to-br from-blue-600/10 to-transparent blur-2xl" />
              <div className="relative">
                <div className="aspect-[16/9] w-full overflow-hidden rounded-lg border border-gray-200 bg-gray-50 grid place-items-center">
                  {/* Using next/image is optional with static assets */}
                  <Image
                    src={m.image_url || "/vercel.svg"}
                    alt={`${m.merk} ${m.model}`}
                    width={320}
                    height={180}
                    className="object-contain h-full w-full p-4"
                  />
                </div>

                <div className="mt-3">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        {m.merk} {m.tipe ? `${m.tipe} ` : ""}{m.model}
                      </h3>
                      <div className="text-xs text-gray-600">
                        {m.tahun} • {m.transmisi} • {m.bahan_bakar}
                      </div>
                      <div className="text-xs text-gray-600">Plat: {m.plat_nomor}</div>
                    </div>
                    <StatusPill status={m.status} />
                  </div>

                  <div className="mt-2 text-lg font-semibold text-gray-900">{formatCurrencyIDR(m.harga_jual)}</div>
                  <div className="mt-1 grid grid-cols-2 gap-2 text-xs text-gray-600">
                    <div>Tahun: <span className="text-gray-900 font-medium">{m.tahun}</span></div>
                    <div>KM: <span className="text-gray-900 font-medium">{m.kilometer.toLocaleString("id-ID")}</span></div>
                  </div>

                  {/* Actions */}
                  <div className="mt-3 flex items-center gap-2">
                    <Link
                      href={`/inventory/${m.id}`}
                      className="px-3 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 transition text-sm inline-flex items-center gap-2"
                    >
                      Detail
                    </Link>
                    <Link
                      href={`/editMobil/${m.id}`}
                      className="px-3 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 transition text-sm inline-flex items-center gap-2"
                    >
                      <FaEdit /> Edit
                    </Link>
                    {m.status !== "Terjual" && (
                      <button
                        onClick={() => setOpenSale(m)}
                        className="px-3 py-2 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 transition text-sm inline-flex items-center gap-2 shadow-[0_10px_30px_-10px_rgba(16,185,129,0.45)]"
                        aria-label={`Jual ${m.merk} ${m.model}`}
                      >
                        <FaShoppingCart /> Jual
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </article>
          ))}
          {filtered.length === 0 && (
            <div className="col-span-full text-center text-gray-500 py-12 border border-dashed border-gray-300 rounded-xl">
              Tidak ada data yang cocok dengan filter
            </div>
          )}
        </section>
      </div>

      {/* Drawers */}
      <AddCarDrawer
        open={openAdd}
        onClose={() => setOpenAdd(false)}
        onCreated={(carId) => {
          // Open photo uploader for the newly created car
          setOpenAdd(false);
          setUploaderCarId(carId);
          setOpenUploader(true);
        }}
      />
      <SellCarDrawer
        open={!!openSale}
        onClose={() => setOpenSale(null)}
        car={
          openSale
            ? {
                id: openSale.id,
                title: `${openSale.merk} ${openSale.tipe ? openSale.tipe + " " : ""}${openSale.model} ${openSale.tahun ?? ""}`.trim(),
                price: openSale.harga_jual,
                plat_nomor: openSale.plat_nomor,
              }
            : null
        }
        onRecorded={() => setOpenSale(null)}
      />

     {/* Photo Uploader Drawer */}
     <span>a</span>
     <PhotoUploader
       open={openUploader}
       onClose={() => {
         setOpenUploader(false);
         setUploaderCarId(null);
       }}
       carId={uploaderCarId}
       onUploaded={() => {
         // In future hook: refresh list from server
       }}
       setAsMainImage={true}
     />
   </main>
 );
}

function StatusPill({ status }: { status: Status }) {
  const styles =
    status === "Tersedia"
      ? "border-green-500/30 bg-green-50 text-green-700"
      : status === "Reserved"
      ? "border-amber-400/40 bg-amber-50 text-amber-700"
      : "border-gray-300 bg-gray-50 text-gray-600";

  return (
    <span className={`text-[10px] px-2 py-1 rounded-full border ${styles}`}>
      {status}
    </span>
  );
}