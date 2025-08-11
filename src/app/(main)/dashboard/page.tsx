"use client";

import Link from "next/link";
import { useMemo, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  FaMoneyBillWave,
  FaWarehouse,
  FaShoppingCart,
  FaChartLine,
  FaCar,
  FaClock,
  FaUsers,
  FaPlus,
} from "react-icons/fa";
import { formatPrice } from "@/app/utils/formatting";

/**
 * Mock data structures aligned to database.sql domain
 */
type ID = string;

type Company = { id: ID; name: string };
type Account = { id: ID; code: string; name: string; group: string };
type Car = {
  id: ID;
  company_id: ID;
  title: string;
  model: string;
  status: "available" | "sold" | "reserved";
  buy_price: number;
  price: number;
  image_url: string;
};
type Sale = {
  id: ID;
  company_id: ID;
  car_id: ID;
  price: number;
  buyer_name: string;
  sold_at: string; // ISO
  source_document: "sale";
  source_id: ID;
};
type Transaction = {
  id: ID;
  company_id: ID;
  occurred_at: string; // ISO
  description: string;
  source_document: string;
  source_id: ID;
};
type JournalItem = {
  id: ID;
  company_id: ID;
  transaction_id: ID;
  account_id: ID;
  debit: number;
  credit: number;
};

/**
 * Inline mock dataset (single company)
 * Shapes mirror database.sql and intended service outputs
 */
const companies: Company[] = [{ id: "c1", name: "Demo Motors" }];

const chart_of_accounts: Account[] = [
  { id: "a_cash", code: "111-01", name: "Cash on Hand", group: "Cash" },
  { id: "a_bank", code: "111-02", name: "Bank BCA", group: "Cash" },
  { id: "a_ar", code: "113-01", name: "Accounts Receivable", group: "AR" },
  { id: "a_inventory", code: "114-01", name: "Inventory - Cars", group: "Inventory" },
  { id: "a_sales", code: "411-01", name: "Sales Revenue", group: "Sales" },
  { id: "a_cogs", code: "611-01", name: "Cost of Goods Sold", group: "COGS" },
];

const cars: Car[] = [
  {
    id: "car1",
    company_id: "c1",
    title: "Toyota Avanza G 2019",
    model: "Avanza",
    status: "available",
    buy_price: 145_000_000,
    price: 165_000_000,
    image_url: "/vercel.svg",
  },
  {
    id: "car2",
    company_id: "c1",
    title: "Honda Brio E 2020",
    model: "Brio",
    status: "sold",
    buy_price: 120_000_000,
    price: 138_000_000,
    image_url: "/next.svg",
  },
  {
    id: "car3",
    company_id: "c1",
    title: "Daihatsu Xenia R 2018",
    model: "Xenia",
    status: "reserved",
    buy_price: 110_000_000,
    price: 129_000_000,
    image_url: "/globe.svg",
  },
  {
    id: "car4",
    company_id: "c1",
    title: "Suzuki Ertiga GX 2019",
    model: "Ertiga",
    status: "available",
    buy_price: 135_000_000,
    price: 155_000_000,
    image_url: "/window.svg",
  },
  {
    id: "car5",
    company_id: "c1",
    title: "Mitsubishi Xpander 2021",
    model: "Xpander",
    status: "available",
    buy_price: 210_000_000,
    price: 235_000_000,
    image_url: "/file.svg",
  },
  {
    id: "car6",
    company_id: "c1",
    title: "Toyota Innova 2017",
    model: "Innova",
    status: "sold",
    buy_price: 205_000_000,
    price: 228_000_000,
    image_url: "/vercel.svg",
  },
];

const sales: Sale[] = [
  {
    id: "s1",
    company_id: "c1",
    car_id: "car2",
    price: 138_000_000,
    buyer_name: "Andi",
    sold_at: new Date(new Date().getFullYear(), new Date().getMonth(), 3).toISOString(),
    source_document: "sale",
    source_id: "s1",
  },
  {
    id: "s2",
    company_id: "c1",
    car_id: "car6",
    price: 228_000_000,
    buyer_name: "Budi",
    sold_at: new Date(new Date().getFullYear(), new Date().getMonth(), 8).toISOString(),
    source_document: "sale",
    source_id: "s2",
  },
];

const transactions: Transaction[] = [
  {
    id: "t1",
    company_id: "c1",
    occurred_at: sales[0].sold_at,
    description: "Sale s1",
    source_document: "sale",
    source_id: "s1",
  },
  {
    id: "t2",
    company_id: "c1",
    occurred_at: sales[1].sold_at,
    description: "Sale s2",
    source_document: "sale",
    source_id: "s2",
  },
];

const journal_items: JournalItem[] = [
  // Sale s1: Debit Cash 111, Credit Sales 411, Debit COGS 611, Credit Inventory 114
  { id: "j1", company_id: "c1", transaction_id: "t1", account_id: "a_cash", debit: 138_000_000, credit: 0 },
  { id: "j2", company_id: "c1", transaction_id: "t1", account_id: "a_sales", debit: 0, credit: 138_000_000 },
  { id: "j3", company_id: "c1", transaction_id: "t1", account_id: "a_cogs", debit: 120_000_000, credit: 0 },
  { id: "j4", company_id: "c1", transaction_id: "t1", account_id: "a_inventory", debit: 0, credit: 120_000_000 },

  // Sale s2
  { id: "j5", company_id: "c1", transaction_id: "t2", account_id: "a_cash", debit: 228_000_000, credit: 0 },
  { id: "j6", company_id: "c1", transaction_id: "t2", account_id: "a_sales", debit: 0, credit: 228_000_000 },
  { id: "j7", company_id: "c1", transaction_id: "t2", account_id: "a_cogs", debit: 205_000_000, credit: 0 },
  { id: "j8", company_id: "c1", transaction_id: "t2", account_id: "a_inventory", debit: 0, credit: 205_000_000 },
];

/**
 * Helper functions (pure)
 */
function computeBalanceByCodePrefix(
  journal: JournalItem[],
  coa: Account[],
  prefix: string
) {
  const accountIds = coa.filter((a) => a.code.startsWith(prefix)).map((a) => a.id);
  let balance = 0;
  for (const j of journal) {
    if (accountIds.includes(j.account_id)) {
      balance += j.debit - j.credit;
    }
  }
  return balance;
}

function isInCurrentMonth(dateIso: string) {
  const d = new Date(dateIso);
  const now = new Date();
  return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth();
}

function computeMTDRevenue(journal: JournalItem[], coa: Account[]) {
  const salesAccounts = coa.filter((a) => a.code.startsWith("411")).map((a) => a.id);
  const credits = journal
    .filter((j) => salesAccounts.includes(j.account_id))
    .filter((j) => {
      const tx = transactions.find((t) => t.id === j.transaction_id);
      return tx ? isInCurrentMonth(tx.occurred_at) : false;
    })
    .reduce((sum, j) => sum + j.credit, 0);
  return credits;
}

function computeMTDCOGS(journal: JournalItem[], coa: Account[]) {
  const cogsAccounts = coa.filter((a) => a.code.startsWith("611")).map((a) => a.id);
  const debits = journal
    .filter((j) => cogsAccounts.includes(j.account_id))
    .filter((j) => {
      const tx = transactions.find((t) => t.id === j.transaction_id);
      return tx ? isInCurrentMonth(tx.occurred_at) : false;
    })
    .reduce((sum, j) => sum + j.debit, 0);
  return debits;
}

function computeGrossProfit(journal: JournalItem[], coa: Account[]) {
  return computeMTDRevenue(journal, coa) - computeMTDCOGS(journal, coa);
}

function inventorySnapshot(allCars: Car[]) {
  const available = allCars.filter((c) => c.status === "available");
  const value = available.reduce((sum, c) => sum + c.buy_price, 0);
  return { count: available.length, value, items: available.slice(0, 5) };
}

function recentSalesList(salesData: Sale[], carsData: Car[]) {
  const currentMonthSales = salesData.filter((s) => isInCurrentMonth(s.sold_at));
  return currentMonthSales
    .map((s) => ({
      ...s,
      car: carsData.find((c) => c.id === s.car_id)!,
    }))
    .sort((a, b) => +new Date(b.sold_at) - +new Date(a.sold_at))
    .slice(0, 6);
}

/**
 * Dashboard Page (UI aligned with landing style)
 * UI-only interactions; data is mock-local to enable future drop-in replacement.
 */
export default function Dashboard() {
  const mtdRevenue = useMemo(() => computeMTDRevenue(journal_items, chart_of_accounts), []);
  const mtdCogs = useMemo(() => computeMTDCOGS(journal_items, chart_of_accounts), []);
  const grossProfit = useMemo(() => computeGrossProfit(journal_items, chart_of_accounts), []);
  const cashBalance = useMemo(
    () => computeBalanceByCodePrefix(journal_items, chart_of_accounts, "111"),
    []
  );
  const inventory = useMemo(() => inventorySnapshot(cars), []);
  const recentSales = useMemo(() => recentSalesList(sales, cars), []);

  const kpis = [
    {
      title: "Revenue MTD",
      value: formatPrice(mtdRevenue),
      icon: <FaMoneyBillWave />,
      accent: "from-[#1E3A8A]/50",
    },
    {
      title: "COGS MTD",
      value: formatPrice(mtdCogs),
      icon: <FaShoppingCart />,
      accent: "from-[#3B0764]/50",
    },
    {
      title: "Gross Profit MTD",
      value: formatPrice(grossProfit),
      icon: <FaChartLine />,
      accent: "from-[#064E3B]/50",
    },
    {
      title: "Cash",
      value: formatPrice(cashBalance),
      icon: <FaMoneyBillWave />,
      accent: "from-[#1E3A8A]/50",
    },
    {
      title: "Inventory Value",
      value: formatPrice(inventory.value),
      icon: <FaWarehouse />,
      accent: "from-[#3B0764]/50",
    },
    {
      title: "Cars Available",
      value: String(inventory.count),
      icon: <FaCar />,
      accent: "from-[#064E3B]/50",
    },
  ];

  return (
    <main className="min-h-screen bg-white text-gray-800">
      <div className="pointer-events-none fixed inset-0 -z-10 bg-[radial-gradient(1200px_600px_at_85%_10%,rgba(37,99,235,0.08),transparent_60%)]" />
      <div className="mx-auto max-w-7xl px-6 py-6">
        {/* Header + period controls */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-gray-500 text-sm">Overview of KPIs and activity</p>
          </div>

          {/* Period + compare controls (UI only) */}
          <div className="flex items-center gap-2">
            <div className="inline-flex rounded-lg border border-gray-200 bg-white p-1 shadow-sm">
              <button className="px-3 py-1.5 text-xs rounded-md bg-blue-600 text-white">MTD</button>
              <button className="px-3 py-1.5 text-xs text-gray-700 hover:bg-gray-50 rounded-md">QTD</button>
              <button className="px-3 py-1.5 text-xs text-gray-700 hover:bg-gray-50 rounded-md">YTD</button>
            </div>
            <label className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs text-gray-700 shadow-sm">
              <input type="checkbox" className="toggle toggle-xs" defaultChecked />
              <span>Compare to last month</span>
            </label>
            <div className="hidden sm:flex gap-2">
              <Link
                href="/inventory"
                className="px-3 py-2 rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition text-xs"
                prefetch={false}
              >
                Go to Inventory
              </Link>
              <Link
                href="/sales"
                className="px-3 py-2 rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition text-xs"
                prefetch={false}
              >
                Go to Sales
              </Link>
            </div>
          </div>
        </div>

        {/* KPI Cards */}
        <section className="mt-6">
          <KpiGrid
            items={kpis.map((k) => ({
              title: k.title,
              value: k.value,
              icon: k.icon,
            }))}
          />
        </section>

        {/* Trends + Reminders + Inventory snapshot */}
        <section className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <RecentSalesTable rows={recentSales.map((r) => ({
              id: r.id,
              buyer: r.buyer_name,
              car: r.car?.title ?? "",
              price: r.price,
              date: new Date(r.sold_at).toLocaleDateString(),
            }))} />

            <SalesTrendPlaceholder />
          </div>

          <div className="space-y-6">
            <InventorySnapshot
              items={inventory.items.map((c) => ({
                id: c.id,
                title: c.title,
                price: c.price,
                status: c.status,
                image_url: c.image_url,
              }))}
              totalValue={inventory.value}
            />

            <StnkRemindersPlaceholder />
          </div>
        </section>
      </div>

      {/* Floating Quick Actions (FAB) */}
      <DashboardFab />
    </main>
  );
}

function KpiGrid({
  items,
}: {
  items: Array<{ title: string; value: string; icon: React.ReactNode }>;
}) {
  // Mock deltas for visual enhancement only
  const deltas = useMemo(
    () =>
      items.map((_, i) => {
        const sign = i % 2 === 0 ? 1 : -1;
        const pct = (Math.round((Math.random() * 6 + 2) * 10) / 10) * sign; // +/- 2–8%
        return pct;
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [items.length]
  );

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {items.map((k, idx) => {
        const d = deltas[idx] ?? 0;
        const isUp = d >= 0;
        return (
          <div
            key={k.title}
            className="group relative overflow-hidden rounded-xl border border-gray-200 bg-white p-4 shadow-sm hover:shadow-md transition"
          >
            <div className="pointer-events-none absolute -top-10 -right-14 h-36 w-36 rotate-12 bg-gradient-to-br from-blue-600/10 to-transparent blur-2xl" />
            <div className="relative flex items-start justify-between">
              <div>
                <div className="text-gray-500 text-xs">{k.title}</div>
                <div className="mt-1 text-xl font-semibold text-gray-900">{k.value}</div>
                <div className="mt-1 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium ring-1 ring-inset
                  ${isUp ? 'bg-green-50 text-green-700 ring-green-200' : 'bg-red-50 text-red-700 ring-red-200'}"
                >
                  <span>{isUp ? '▲' : '▼'}</span>
                  <span>{Math.abs(d).toFixed(1)}%</span>
                  <span className="text-gray-500">vs last mo.</span>
                </div>
              </div>
              <div className="h-10 w-10 grid place-items-center rounded-lg bg-blue-50 text-blue-700 ring-1 ring-inset ring-blue-200">
                {k.icon}
              </div>
            </div>

            {/* Sparkline placeholder */}
            <div className="mt-4 h-8 w-full rounded bg-gradient-to-r from-blue-50 to-transparent relative overflow-hidden">
              <div className="absolute inset-y-0 left-0 w-1/2 bg-blue-100/40" />
              <div className="absolute inset-y-0 left-1/2 w-1/3 bg-blue-200/30" />
              <div className="absolute inset-y-0 left-2/3 w-1/6 bg-blue-300/20" />
            </div>
          </div>
        );
      })}
    </div>
  );
}

function RecentSalesTable(props: {
  rows: Array<{ id: string; buyer: string; car: string; price: number; date: string }>;
}) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">
      <div className="px-5 py-4 border-b border-gray-200 flex items-center justify-between">
        <h2 className="font-semibold text-gray-900">Recent Sales</h2>
        <div className="flex items-center gap-2">
          <div className="hidden sm:inline-flex rounded-lg border border-gray-200 bg-white p-0.5 text-[11px] text-gray-700">
            <button className="px-2 py-1 rounded-md bg-blue-50 text-blue-700">30D</button>
            <button className="px-2 py-1 rounded-md hover:bg-gray-50">90D</button>
          </div>
          <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-700">
            • {props.rows.length} this month
          </span>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="sticky top-0 bg-gradient-to-b from-blue-50/60 to-white text-[12px] font-semibold uppercase tracking-wide text-gray-600 shadow-[0_1px_0_0_rgba(0,0,0,0.04)]">
            <tr className="text-left">
              <th className="px-5 py-3">Buyer</th>
              <th className="px-5 py-3">Car</th>
              <th className="px-5 py-3 text-right">Price</th>
              <th className="px-5 py-3">Date</th>
            </tr>
          </thead>
          <tbody>
            {props.rows.map((r) => (
              <tr
                key={r.id}
                className="relative border-t border-gray-100 even:bg-gray-50 hover:bg-blue-50/40 transition"
              >
                <td className="px-5 py-3 text-gray-900 font-medium">{r.buyer}</td>
                <td className="px-5 py-3 text-gray-800">{r.car}</td>
                <td className="px-5 py-3 text-gray-900 font-medium tabular-nums text-right">
                  {formatPrice(r.price)}
                </td>
                <td className="px-5 py-3 text-gray-700 tabular-nums">{r.date}</td>
              </tr>
            ))}
            {props.rows.length === 0 && (
              <tr>
                <td className="px-5 py-10 text-center text-gray-500" colSpan={4}>
                  <div className="mx-auto max-w-md">
                    <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 text-blue-700">
                      <FaClock />
                    </div>
                    <p className="font-medium text-gray-900">No sales this month</p>
                    <p className="text-sm text-gray-500">Try expanding the timeframe above.</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function SalesTrendPlaceholder() {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h3 className="font-semibold text-gray-900">Sales Trend</h3>
          <span className="text-xs text-gray-500">(placeholder)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="inline-flex rounded-lg border border-gray-200 bg-white p-0.5 text-[11px] text-gray-700">
            <button className="px-2 py-1 rounded-md bg-blue-50 text-blue-700">7D</button>
            <button className="px-2 py-1 rounded-md hover:bg-gray-50">30D</button>
            <button className="px-2 py-1 rounded-md hover:bg-gray-50">90D</button>
          </div>
          <FaClock className="text-gray-500" />
        </div>
      </div>
      <div className="mt-4 h-40 rounded-lg relative overflow-hidden bg-white">
        {/* grid background */}
        <div className="absolute inset-0 bg-[linear-gradient(0deg,transparent_95%,rgba(0,0,0,0.05)_95%),linear-gradient(90deg,transparent_95%,rgba(0,0,0,0.05)_95%)] bg-[length:20px_20px]" />
        {/* center line */}
        <div className="absolute inset-y-4 left-12 right-4 rounded bg-[linear-gradient(180deg,rgba(37,99,235,0.12),transparent)]" />
        <div className="relative z-10 h-full w-full grid place-items-center text-gray-500 text-sm">
          Chart goes here
        </div>
      </div>
    </div>
  );
}

function InventorySnapshot(props: { items: Array<{ id: string; title: string; price: number; status: string; image_url: string }>; totalValue: number }) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white shadow-sm">
      <div className="px-5 py-4 border-b border-gray-200">
        <h2 className="font-semibold text-gray-900">Inventory Snapshot</h2>
        <p className="text-xs text-gray-500 mt-1">Top available cars</p>
      </div>
      <ul className="divide-y divide-gray-100">
        {props.items.map((c) => (
          <li key={c.id} className="flex items-center gap-3 px-5 py-4">
            <img
              alt={c.title}
              src={c.image_url}
              className="h-12 w-16 object-contain rounded-md border border-gray-200 bg-gray-50"
            />
            <div className="flex-1">
              <div className="font-medium text-sm text-gray-900">{c.title}</div>
              <div className="text-xs text-gray-600">{formatPrice(c.price)}</div>
            </div>
            <span
              className={`text-[10px] px-2 py-1 rounded-full border ${
                c.status === "available"
                  ? "border-green-500/30 bg-green-50 text-green-700"
                  : c.status === "reserved"
                  ? "border-amber-400/40 bg-amber-50 text-amber-700"
                  : "border-gray-300 bg-gray-50 text-gray-600"
              }`}
            >
              {c.status}
            </span>
          </li>
        ))}
        {props.items.length === 0 && (
          <li className="px-5 py-6 text-center text-gray-500 text-sm">
            No available cars
          </li>
        )}
      </ul>
      <div className="px-5 py-3 border-t border-gray-200 text-xs text-gray-600">
        Inventory value:{" "}
        <span className="text-gray-900 font-medium">{formatPrice(props.totalValue)}</span>
      </div>
    </div>
  );
}

function StnkRemindersPlaceholder() {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-gray-900">STNK Reminders</h3>
        <span className="text-xs text-gray-500">UI only</span>
      </div>
      <ul className="mt-3 space-y-2 text-sm text-gray-700">
        <li className="flex items-center justify-between rounded-lg border border-amber-200 bg-amber-50 px-3 py-2">
          <span>DD 1234 AB • Toyota Avanza G 2019</span>
          <span className="text-xs font-medium text-amber-800">Due in 12 days</span>
        </li>
        <li className="flex items-center justify-between rounded-lg border border-red-200 bg-red-50 px-3 py-2">
          <span>DD 9988 ZZ • Suzuki Ertiga GX 2019</span>
          <span className="text-xs font-medium text-red-800">Overdue by 3 days</span>
        </li>
        <li className="flex items-center justify-between rounded-lg border border-amber-200 bg-amber-50 px-3 py-2">
          <span>DD 6677 HH • Mitsubishi Xpander 2021</span>
          <span className="text-xs font-medium text-amber-800">Due in 25 days</span>
        </li>
      </ul>
    </div>
  );
}

function DashboardFab() {
  const [open, setOpen] = useState(false);
  // Basic close on Escape
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const router = useRouter();
  const actions = [
    { label: "Tambah Mobil", icon: <FaCar />, href: "/inventory" },
    { label: "Jual Mobil", icon: <FaShoppingCart />, href: "/customers" }, // adjust to your sale flow route
    { label: "Pembelian Mobil", icon: <FaWarehouse />, href: "/inventory" }, // placeholder route
    { label: "Customers", icon: <FaUsers />, href: "/customers" },
    { label: "Analitik", icon: <FaChartLine />, href: "/reports" },
  ];

  // Fixed anchor container; FAB remains pinned to bottom-right.
  // The menu is absolutely positioned relative to this anchor so FAB never shifts.
  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* Local dim backdrop to reduce background distraction when open */}
      <div
        className={`fixed inset-0 pointer-events-none transition-opacity duration-200 ease-out ${
          open ? "opacity-70" : "opacity-0"
        }`}
        style={{
          background:
            "radial-gradient(1100px 550px at 92% 88%, rgba(5,8,18,0.7), rgba(5,8,18,0.45) 45%, rgba(5,8,18,0.2) 70%, transparent)",
        }}
        aria-hidden="true"
      />
      {/* Anchor box to keep FAB position stable */}
      <div className="relative">
        {/* Menu: positioned absolutely to the top-right of the FAB, aligned to the right edge */}
        <div
          className={`absolute bottom-16 right-0 origin-bottom-right rounded-2xl border border-white/25 bg-[#0E1530]/95 backdrop-blur-sm p-2 shadow-[0_25px_60px_-20px_rgba(0,0,0,0.6)]
          ${open ? "opacity-100 translate-y-0 scale-100" : "pointer-events-none opacity-0 translate-y-2 scale-95"}
          transition-all duration-200 ease-out`}
          role="menu"
          aria-label="Quick actions"
          style={{ transformOrigin: "bottom right" }}
        >
          <ul className="min-w-[240px] flex flex-col items-stretch">
            {actions.map((a, idx) => (
              <li
                key={a.label}
                className="transition-opacity duration-200"
                style={{ transitionDelay: `${open ? idx * 30 : 0}ms` }}
              >
                <button
                  onClick={() => {
                    setOpen(false);
                    router.push(a.href);
                  }}
                  className="w-full flex items-center justify-end gap-3 px-3 py-2 rounded-lg text-sm text-white hover:bg-white/15 focus:outline-none focus:ring-2 focus:ring-[#3B82F6]/70 transition"
                  role="menuitem"
                >
                  <span className="text-right">{a.label}</span>
                  <span className="h-8 w-8 grid place-items-center rounded-md bg-white/15 text-white">
                    {a.icon}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </div>

        {/* FAB button (stays put at bottom-right) */}
        <button
          onClick={() => setOpen((v: boolean) => !v)}
          aria-expanded={open}
          aria-haspopup="menu"
          className={`h-14 w-14 rounded-full grid place-items-center transition
          shadow-[0_20px_45px_-15px_rgba(59,130,246,0.6)]
          ${open ? "bg-[#22C55E]" : "bg-[#3B82F6]"} hover:brightness-110 active:scale-95`}
          style={{ transform: "translateZ(0)" }}
        >
          <span className="sr-only">Quick actions</span>
          <FaPlus
            className={`text-white transition-transform duration-200 ${open ? "rotate-45" : "rotate-0"}`}
          />
        </button>
      </div>
    </div>
  );
}