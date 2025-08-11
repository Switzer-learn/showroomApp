"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { FaFilter, FaPlus, FaSearch, FaShoppingBag } from "react-icons/fa";
import RecordPurchaseDrawer from "./components/RecordPurchaseDrawer";

// Types and mock dataset (temporary)
type ID = string;
type PaymentMethod = "Tunai" | "Transfer";

interface Purchase {
  id: ID;
  tanggal_beli: string; // ISO date
  mobil_id: ID;
  mobil_label: string;
  vendor: string;
  total_harga: number;
  metode: PaymentMethod;
}

const MOCK_PURCHASES: Purchase[] = [
  {
    id: "p1",
    tanggal_beli: "2024-06-02",
    mobil_id: "m6",
    mobil_label: "Toyota Rush S 2018",
    vendor: "PT Sumber Rezeki",
    total_harga: 165_000_000,
    metode: "Transfer",
  },
  {
    id: "p2",
    tanggal_beli: "2024-07-11",
    mobil_id: "m7",
    mobil_label: "Nissan Livina 2020",
    vendor: "Showroom ABC",
    total_harga: 150_000_000,
    metode: "Tunai",
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

export default function PurchasesPage() {
  const [query, setQuery] = useState("");
  const [metode, setMetode] = useState<PaymentMethod | "Semua">("Semua");
  const [dateFrom, setDateFrom] = useState<string>("");
  const [dateTo, setDateTo] = useState<string>("");
  const [openRecord, setOpenRecord] = useState(false);

  const filtered = useMemo(() => {
    return MOCK_PURCHASES.filter((p) => {
      const matchesQuery =
        !query ||
        [p.mobil_label, p.vendor].join(" ").toLowerCase().includes(query.toLowerCase());
      const matchesMetode = metode === "Semua" ? true : p.metode === metode;

      const t = new Date(p.tanggal_beli).getTime();
      const fromOK = dateFrom ? t >= new Date(dateFrom).getTime() : true;
      const toOK = dateTo ? t <= new Date(dateTo).getTime() : true;

      return matchesQuery && matchesMetode && fromOK && toOK;
    });
  }, [query, metode, dateFrom, dateTo]);

  const totalSpent = useMemo(
    () => filtered.reduce((acc, p) => acc + p.total_harga, 0),
    [filtered]
  );

  return (
    <main className="min-h-screen bg-white text-gray-800">
      <div className="pointer-events-none fixed inset-0 -z-10 bg-[radial-gradient(1200px_600px_at_85%_10%,rgba(37,99,235,0.08),transparent_60%)]" />
      <div className="mx-auto max-w-7xl px-6 py-6">
        {/* Header */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            <div className="h-9 w-9 rounded-lg bg-blue-600 text-white grid place-items-center shadow-[0_10px_30px_-10px_rgba(37,99,235,0.5)]">
              <FaShoppingBag />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Purchases</h1>
              <p className="text-gray-500 text-sm">Track vehicle purchases and payments</p>
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => setOpenRecord(true)}
              className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition inline-flex items-center gap-2 shadow-[0_10px_30px_-10px_rgba(37,99,235,0.5)]"
            >
              <FaPlus /> Record Purchase
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
                placeholder="Cari mobil/vendor..."
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
                  <Th>Vendor</Th>
                  <Th className="text-right">Total</Th>
                  <Th>Metode</Th>
                  <Th>Aksi</Th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.map((p) => (
                  <tr key={p.id} className="hover:bg-gray-50">
                    <Td>{toDateOnly(p.tanggal_beli)}</Td>
                    <Td>
                      <Link href={`/inventory/${p.mobil_id}`} className="text-blue-700 hover:underline">
                        {p.mobil_label}
                      </Link>
                    </Td>
                    <Td>{p.vendor}</Td>
                    <Td className="text-right font-medium text-gray-900">{formatCurrencyIDR(p.total_harga)}</Td>
                    <Td>{p.metode}</Td>
                    <Td>
                      <Link
                        href={`/purchases/${p.id}`}
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
            <div className="text-gray-600">Total pembelian (terfilter)</div>
            <div className="text-gray-900 font-semibold">{formatCurrencyIDR(totalSpent)}</div>
          </div>
        </section>

        {/* Drawer */}
        <RecordPurchaseDrawer open={openRecord} onClose={() => setOpenRecord(false)} />
      </div>
    </main>
  );
}

function Th({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <th className={`px-4 py-3 text-left font-semibold ${className}`}>{children}</th>;
}
function Td({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <td className={`px-4 py-3 text-gray-700 ${className}`}>{children}</td>;
}