"use client";

import { useState, useEffect } from "react";
import { createClient } from "../../utils/supabase/client";
import TransactionModal from "@/app/components/accounting/TransactionModal";
import { Customer, Transaction } from "./types";

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [showModal, setShowModal] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      const { data, error } = await supabase.from("customers").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      setCustomers(data || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleViewTransactions = async (customer: Customer) => {
    try {
      const { data, error } = await supabase
        .from("penjualan")
        .select(
          `
          *,
          mobil: mobil_id (
            merk,
            tipe,
            model,
            series
          )
        `
        )
        .eq("customer_id", customer.id)
        .order("tanggal_jual", { ascending: false });

      if (error) throw error;
      setTransactions(data || []);
      setSelectedCustomer(customer);
      setShowModal(true);
    } catch (err: any) {
      setError(err.message);
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-white grid place-items-center">
        <div className="loading loading-spinner loading-lg" />
      </main>
    );
  }

  if (error) {
    return (
      <main className="min-h-screen bg-white grid place-items-center">
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-red-800">{error}</div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-white text-gray-800">
      {/* Subtle background depth */}
      <div className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute inset-x-0 top-0 h-48 bg-[radial-gradient(1200px_600px_at_85%_10%,rgba(37,99,235,0.08),transparent_60%)]" />
      </div>

      <div className="mx-auto max-w-7xl px-6 py-6 space-y-4">
        {/* Header with controls */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Customers</h1>
            <p className="text-gray-500 text-sm">Manage customers and view purchase history</p>
          </div>
          <div className="flex w-full sm:w-auto items-center gap-2">
            <div className="relative flex-1 sm:flex-initial">
              <input
                type="text"
                placeholder="Search customers..."
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-300"
                onChange={(e) => {
                  const q = e.target.value.toLowerCase();
                  setCustomers((prev) =>
                    prev
                      .slice()
                      .sort((a, b) => a.nama.localeCompare(b.nama))
                      .filter((c) => c.nama.toLowerCase().includes(q) || (c.no_hp ?? "").toLowerCase().includes(q))
                  );
                }}
              />
              <span className="pointer-events-none absolute inset-y-0 right-2 my-auto inline-flex h-6 items-center rounded px-1.5 text-[10px] font-medium text-gray-500 ring-1 ring-inset ring-gray-300">
                ⌘K
              </span>
            </div>
            <select className="rounded-lg border border-gray-300 bg-white px-2 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-300">
              <option>All</option>
              <option>Male</option>
              <option>Female</option>
              <option>Unknown</option>
            </select>
          </div>
        </div>

        <section className="mt-2 rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-200 flex items-center justify-between">
            <h2 className="font-semibold text-gray-900">Customers List</h2>
            <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-700">
              • {customers.length} records
            </span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full table-fixed text-sm">
              <thead className="sticky top-0 bg-gradient-to-b from-blue-50/60 to-white text-[12px] font-semibold uppercase tracking-wide text-gray-600 shadow-[0_1px_0_0_rgba(0,0,0,0.04)]">
                <tr className="text-left">
                  <th className="px-5 py-3 w-[22%]">Name</th>
                  <th className="px-5 py-3 w-[16%]">Phone</th>
                  <th className="px-5 py-3 w-[42%]">Address</th>
                  <th className="px-5 py-3 w-[10%]">Gender</th>
                  <th className="px-5 py-3 w-[10%]">Actions</th>
                </tr>
              </thead>
              <tbody>
                {customers.map((customer) => {
                  const gender = (customer.jenis_kelamin ?? "-").toLowerCase();
                  const genderClass =
                    gender === "male"
                      ? "bg-blue-100 text-blue-700"
                      : gender === "female"
                      ? "bg-pink-100 text-pink-700"
                      : "bg-gray-100 text-gray-600";
                  return (
                    <tr
                      key={customer.id}
                      className="relative border-t border-gray-100 even:bg-gray-50 hover:bg-blue-50/40 transition"
                    >
                      <td className="px-5 py-3 text-gray-900 font-medium">{customer.nama}</td>
                      <td className="px-5 py-3 text-gray-800 font-medium tabular-nums">{customer.no_hp}</td>
                      <td className="px-5 py-3 text-gray-700">
                        <span className="block max-w-[40ch] truncate" title={customer.alamat ?? "-"}>
                          {customer.alamat || "-"}
                        </span>
                      </td>
                      <td className="px-5 py-3">
                        <span className={`inline-flex px-2 py-0.5 rounded-full text-xs ${genderClass}`}>
                          {customer.jenis_kelamin || "Unknown"}
                        </span>
                      </td>
                      <td className="px-5 py-3">
                        <button
                          onClick={() => handleViewTransactions(customer)}
                          className="inline-flex items-center gap-1 text-blue-700 hover:text-blue-800 hover:underline text-xs font-medium"
                        >
                          View Transactions
                        </button>
                      </td>
                    </tr>
                  );
                })}
                {customers.length === 0 && (
                  <tr>
                    <td className="px-5 py-10 text-center text-gray-500" colSpan={5}>
                      <div className="mx-auto max-w-md">
                        <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 text-blue-700">👥</div>
                        <p className="font-medium text-gray-900">No customers found</p>
                        <p className="text-sm text-gray-500">Try adjusting your filters or add a new customer.</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

        {showModal && selectedCustomer && (
          <TransactionModal customer={selectedCustomer} transactions={transactions} onClose={() => setShowModal(false)} />
        )}
      </div>
    </main>
  );
}