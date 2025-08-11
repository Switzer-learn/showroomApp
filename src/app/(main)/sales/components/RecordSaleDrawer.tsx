"use client";

import { useMemo, useState } from "react";
import { createSale } from "@/app/lib/dbFunction";

type Props = {
  open: boolean;
  onClose: () => void;
  defaultCar?: { id: string; title: string } | null;
  onRecorded?: (saleId: string) => void;
};

type PaymentMethod = "Tunai" | "Kredit";

export default function RecordSaleDrawer({ open, onClose, defaultCar, onRecorded }: Props) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saleDate, setSaleDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("Tunai");
  const [salePrice, setSalePrice] = useState(0);

  // Inline customer fields (select/create in future)
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerAddress, setCustomerAddress] = useState("");

  // Credit-specific
  const [uangMuka, setUangMuka] = useState(0);
  const [namaLeasing, setNamaLeasing] = useState("");
  const [hargaKredit, setHargaKredit] = useState(0);
  const [danaLeasing, setDanaLeasing] = useState(0);

  if (!open) return null;

  const totalHarga = useMemo(() => {
    if (paymentMethod === "Tunai") return salePrice || 0;
    return (uangMuka || 0) + (hargaKredit || 0) + (danaLeasing || 0);
  }, [paymentMethod, salePrice, uangMuka, hargaKredit, danaLeasing]);

  const validate = () => {
    if (!defaultCar?.id) return "Pilih mobil terlebih dahulu";
    if (!customerName.trim()) return "Nama customer wajib diisi";
    if (totalHarga <= 0) return "Total harga harus lebih dari 0";
    if (paymentMethod === "Kredit") {
      if (hargaKredit <= 0 && danaLeasing <= 0 && uangMuka <= 0) return "Isi salah satu nilai kredit";
    }
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const v = validate();
    if (v) {
      setError(v);
      return;
    }
    try {
      setLoading(true);

      // Placeholder customer handling until customer flow exists
      const customer_id = "00000000-0000-0000-0000-000000000000";

      const payload = {
        car_id: defaultCar!.id,
        customer_id,
        sale_price: totalHarga,
        payment_method: paymentMethod === "Tunai" ? "cash" : "credit",
        sale_date: saleDate,
      };

      const created = await createSale(payload);

      // Success toast via simple inline banner state or let parent handle
      onRecorded?.(created.id as string);
      onClose();
    } catch (e: any) {
      setError(e?.message ?? "Gagal menyimpan penjualan");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="drawer drawer-end drawer-open z-50">
      <div className="drawer-overlay" onClick={onClose} />
      <div className="drawer-side pointer-events-none"></div>
      <div className="drawer-content"></div>

      <div className="fixed inset-y-0 right-0 w-full max-w-lg bg-white border-l border-gray-200 shadow-xl p-4 overflow-y-auto">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">Record Sale</h2>
          <button onClick={onClose} className="btn btn-ghost btn-sm">Close</button>
        </div>

        {error && (
          <div className="mt-3 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
            {error}
          </div>
        )}

        <form className="mt-4 space-y-5" onSubmit={handleSubmit} noValidate>
          <fieldset className="space-y-3 border border-gray-200 rounded-lg p-3">
            <legend className="px-2 text-sm text-gray-600">Sale Info</legend>
            <input className="input input-bordered w-full" placeholder="Car (preselected)" value={defaultCar?.title ?? ""} readOnly />
            <div className="grid grid-cols-2 gap-3">
              <input className="input input-bordered" type="date" value={saleDate} onChange={(e) => setSaleDate(e.target.value)} />
              <input className="input input-bordered" type="number" placeholder="Sale Price" value={salePrice} onChange={(e) => setSalePrice(Number(e.target.value))} />
            </div>
          </fieldset>

          <fieldset className="space-y-3 border border-gray-200 rounded-lg p-3">
            <legend className="px-2 text-sm text-gray-600">Customer</legend>
            <input className="input input-bordered w-full" placeholder="Nama Customer" value={customerName} onChange={(e) => setCustomerName(e.target.value)} />
            <div className="grid grid-cols-2 gap-3">
              <input className="input input-bordered" placeholder="No HP" value={customerPhone} onChange={(e) => setCustomerPhone(e.target.value)} />
              <input className="input input-bordered" placeholder="Alamat" value={customerAddress} onChange={(e) => setCustomerAddress(e.target.value)} />
            </div>
          </fieldset>

          <fieldset className="space-y-3 border border-gray-200 rounded-lg p-3">
            <legend className="px-2 text-sm text-gray-600">Payment</legend>
            <div className="grid grid-cols-2 gap-3">
              <select className="select select-bordered" value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}>
                <option value="Tunai">Tunai</option>
                <option value="Kredit">Kredit</option>
              </select>
              <div className="rounded-md bg-blue-50 text-blue-800 border border-blue-200 px-3 py-2 text-sm">
                Total: <span className="font-semibold">{new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(totalHarga || 0)}</span>
              </div>
            </div>

            {paymentMethod === "Kredit" && (
              <div className="grid grid-cols-2 gap-3">
                <input className="input input-bordered" type="number" placeholder="Uang Muka" value={uangMuka} onChange={(e) => setUangMuka(Number(e.target.value))} />
                <input className="input input-bordered" placeholder="Nama Leasing" value={namaLeasing} onChange={(e) => setNamaLeasing(e.target.value)} />
                <input className="input input-bordered" type="number" placeholder="Harga Kredit" value={hargaKredit} onChange={(e) => setHargaKredit(Number(e.target.value))} />
                <input className="input input-bordered" type="number" placeholder="Dana dari Leasing" value={danaLeasing} onChange={(e) => setDanaLeasing(Number(e.target.value))} />
              </div>
            )}
          </fieldset>

          <div className="flex justify-end gap-2">
            <button type="button" onClick={onClose} className="btn">Cancel</button>
            <button disabled={loading} className="btn btn-primary" aria-label="Save sale">{loading ? "Saving..." : "Save"}</button>
          </div>
        </form>
      </div>
    </div>
  );
}