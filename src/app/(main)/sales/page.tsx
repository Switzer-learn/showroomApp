"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { FaFileExport, FaFilter, FaPlus, FaSearch, FaShoppingCart } from "react-icons/fa";
import RecordSaleDrawer from "./components/RecordSaleDrawer";

// Shared-ish mock types (align with previous mocks)
type ID = string;
type MetodePembayaran = "Tunai" | "Transfer" | "Kredit";

interface Penjualan {
  id: ID;
  tanggal_jual: string; // ISO date
  mobil_id: ID;
  mobil_label: string; // e.g., "Toyota Avanza G 2019"
  customer_id: ID;
  customer_nama: string;
  total_harga: number;
  metode: MetodePembayaran;
}

// Temporary mock dataset
const MOCK_SALES: Penjualan[] = [
  {
    id: "s1",
    tanggal_jual: "2024-06-21",
    mobil_id: "m2",
    mobil_label: "Honda Brio E 2020",
    customer_id: "c1",
    customer_nama: "Budi Santoso",
    total_harga: 138_000_000,
    metode: "Transfer",
  },
  {
    id: "s2",
    tanggal_jual: "2024-07-05",
    mobil_id: "m3",
    mobil_label: "Daihatsu Xenia R 2018",
    customer_id: "c2",
    customer_nama: "Siti Aminah",
    total_harga: 129_000_000,
    metode: "Tunai",
  },
  {
    id: "s3",
    tanggal_jual: "2024-07-22",
    mobil_id: "m5",
    mobil_label: "Mitsubishi Xpander Exceed 2021",
    customer_id: "c3",
    customer_nama: "Andi Wijaya",
    total_harga: 235_000_000,
    metode: "Kredit",
  },
];

function formatCurrencyIDR(n: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(n);
}

function toDateOnly(d: string) {
  return new Date(d).toLocaleDateString("id-ID");
}

export default function SalesPage() {
  const [query, setQuery] = useState("");
  const [metode, setMetode] = useState<MetodePembayaran | "Semua">("Semua");
  const [dateFrom, setDateFrom] = useState<string>("");
  const [dateTo, setDateTo] = useState<string>("");
  const [openRecord, setOpenRecord] = useState(false);

  const filtered = useMemo(() => {
    return MOCK_SALES.filter((s) => {
      const matchesQuery =
        !query ||
        [s.mobil_label, s.customer_nama].join(" ").toLowerCase().includes(query.toLowerCase());
      const matchesMetode = metode === "Semua" ? true : s.metode === metode;

      const saleDate = new Date(s.tanggal_jual).getTime();
      const fromOK = dateFrom ? saleDate >= new Date(dateFrom).getTime() : true;
      const toOK = dateTo ? saleDate <= new Date(dateTo).getTime() : true;

      return matchesQuery && matchesMetode && fromOK && toOK;
    });
  }, [query, metode, dateFrom, dateTo]);

  const totalRevenue = useMemo(
    () => filtered.reduce((acc, s) => acc + s.total_harga, 0),
    [filtered]
  );

  const exportCsv = () => {
    const header = ["ID", "Tanggal", "Mobil", "Customer", "Total", "Metode"];
    const rows = filtered.map((s) => [
      s.id,
      s.tanggal_jual,
      s.mobil_label,
      s.customer_nama,
      String(s.total_harga),
      s.metode,
    ]);
    const csv = [header, ...rows].map((r) => r.map(escapeCsv).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `sales-export-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <main className="min-h-screen bg-white text-gray-800">
      <div className="pointer-events-none fixed inset-0 -z-10 bg-[radial-gradient(1200px_600px_at_85%_10%,rgba(37,99,235,0.08),transparent_60%)]" />
      <div className="mx-auto max-w-7xl px-6 py-6">
        {/* Header */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            <div className="h-9 w-9 rounded-lg bg-blue-600 text-white grid place-items-center shadow-[0_10px_30px_-10px_rgba(37,99,235,0.5)]">
              <FaShoppingCart />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Sales</h1>
              <p className="text-gray-500 text-sm">Monitor and export sales records</p>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setOpenRecord(true)}
              className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition inline-flex items-center gap-2 shadow-[0_10px_30px_-10px_rgba(37,99,235,0.5)]"
            >
              <FaPlus /> Record Sale
            </button>
            <button
              onClick={exportCsv}
              className="px-4 py-2 rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-50 transition inline-flex items-center gap-2"
            >
              <FaFileExport /> Export CSV
            </button>
          </div>
        </div>

        {/* Filters */}
        <section className="mt-6 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
          <div className="grid grid-cols-1 lg:grid-cols-6 gap-3">
            <div className="relative lg:col-span-2">
              <FaSearch className="absolute left-3 top-3 text-gray-400" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Cari mobil/customer..."
                className="w-full pl-9 pr-3 py-2 rounded-lg border border-gray-300 bg-white text-gray-900 focus:border-blue-500"
              />
            </div>
            <div className="relative">
              <FaFilter className="absolute left-3 top-3 text-gray-400" />
              <select
                value={metode}
                onChange={(e) => setMetode(e.target.value as any)}
                className="w-full pl-9 pr-3 py-2 rounded-lg border border-gray-300 bg-white text-gray-900 focus:border-blue-500"
              >
                <option value="Semua">Semua Metode</option>
                <option value="Tunai">Tunai</option>
                <option value="Transfer">Transfer</option>
                <option value="Kredit">Kredit</option>
              </select>
            </div>
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-gray-300 bg-white text-gray-900 focus:border-blue-500"
              placeholder="Dari tanggal"
            />
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-gray-300 bg-white text-gray-900 focus:border-blue-500"
              placeholder="Sampai tanggal"
            />
            <div className="flex items-center">
              <div className="text-xs text-gray-600">
                Menampilkan <span className="font-semibold text-gray-900">{filtered.length}</span> transaksi
              </div>
            </div>
          </div>
        </section>

        {/* Table */}
        <section className="mt-6 rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-50 text-gray-600">
                <tr>
                  <Th>Tanggal</Th>
                  <Th>Mobil</Th>
                  <Th>Customer</Th>
                  <Th className="text-right">Total</Th>
                  <Th>Metode</Th>
                  <Th>Aksi</Th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.map((s) => (
                  <tr key={s.id} className="hover:bg-gray-50">
                    <Td>{toDateOnly(s.tanggal_jual)}</Td>
                    <Td>
                      <Link href={`/inventory/${s.mobil_id}`} className="text-blue-700 hover:underline">
                        {s.mobil_label}
                      </Link>
                    </Td>
                    <Td>
                      <Link href={`/customers/${s.customer_id}`} className="text-blue-700 hover:underline">
                        {s.customer_nama}
                      </Link>
                    </Td>
                    <Td className="text-right font-medium text-gray-900">
                      {formatCurrencyIDR(s.total_harga)}
                    </Td>
                    <Td>{s.metode}</Td>
                    <Td>
                      <Link
                        href={`/sales/${s.id}`}
                        className="px-2 py-1 rounded border border-gray-200 text-gray-700 hover:bg-gray-50"
                      >
                        Detail
                      </Link>
                    </Td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={6} className="text-center text-gray-500 py-8">
                      Tidak ada transaksi
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Summary */}
          <div className="p-4 border-t border-gray-100 flex items-center justify-between text-sm">
            <div className="text-gray-600">
              Total pendapatan (terfilter)
            </div>
            <div className="text-gray-900 font-semibold">
              {formatCurrencyIDR(totalRevenue)}
            </div>
          </div>
        </section>
        {/* Drawers */}
        <RecordSaleDrawer
          open={openRecord}
          onClose={() => setOpenRecord(false)}
        />
      </div>
    </main>
  );
}

function Th({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <th className={`px-4 py-3 text-left font-semibold ${className}`}>
      {children}
    </th>
  );
}
function Td({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <td className={`px-4 py-3 text-gray-700 ${className}`}>{children}</td>;
}

function escapeCsv(value: string) {
  if (value.includes(",") || value.includes('"') || value.includes("\n")) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}